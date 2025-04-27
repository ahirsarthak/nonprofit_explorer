# functions.py
import os
import json
from datetime import datetime
from django.conf import settings
import uuid
from openai import OpenAI
import re

def save_submission(query, ip_address):
    timestamp = datetime.utcnow().isoformat()
    submission_id = str(uuid.uuid4())
    submission = {'id': submission_id, 'timestamp': timestamp, 'ip_address': ip_address, 'query': query}
    path = os.path.join(settings.BASE_DIR, 'api', 'user_queries', 'submissions.json')

    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
        with open(path, 'r') as f:
            all_submissions = json.load(f)
    else:
        all_submissions = []

    all_submissions.append(submission)
    with open(path, 'w') as f:
        json.dump(all_submissions, f, indent=2)

    return submission_id

def get_last_submissions(n=5):
    path = os.path.join(settings.BASE_DIR, 'api', 'user_queries', 'submissions.json')
    if not os.path.exists(path):
        return []

    with open(path, 'r') as f:
        submissions = json.load(f)

    # Ensure all submissions have an 'id' (for backward compatibility)
    for sub in submissions:
        if 'id' not in sub:
            sub['id'] = str(uuid.uuid4())
    # Save back if any were missing ids
    with open(path, 'w') as f:
        json.dump(submissions, f, indent=2)

    return sorted(submissions, key=lambda x: x['timestamp'], reverse=True)[:n]


def _store_failed_submission(submission_id, sql, prompt, error_description, user_query=None, ip_address=None, timestamp=None):
    path = os.path.join(settings.BASE_DIR, 'api', 'user_queries', 'failed_submissions.json')
    failed = []
    if os.path.exists(path):
        with open(path, 'r') as f:
            failed = json.load(f)
    # Ensure all fields are present, set to None if missing
    entry = {
        'id': submission_id if submission_id is not None else None,
        'timestamp': timestamp if timestamp is not None else None,
        'ip_address': ip_address if ip_address is not None else None,
        'user_query': user_query if user_query is not None else None,
        'generated_prompt': prompt if prompt is not None else None,
        'generated_sql': sql if sql is not None else None,
        'error': True,
        'error_description': error_description if error_description is not None else None,
        'results': None
    }
    failed.append(entry)
    with open(path, 'w') as f:
        json.dump(failed, f, indent=2)

def _store_submission_output(submission_id, sql, prompt, results, error=None, user_query=None, ip_address=None, timestamp=None):
    path = os.path.join(settings.BASE_DIR, 'api', 'user_queries', 'submissions.json')
    if not os.path.exists(path):
        return
    with open(path, 'r') as f:
        submissions = json.load(f)
    for sub in submissions:
        if sub.get('id') == submission_id:
            sub['timestamp'] = timestamp
            sub['ip_address'] = ip_address
            sub['user_query'] = user_query
            sub['generated_prompt'] = prompt
            sub['generated_sql'] = sql
            sub['results'] = results
            sub['error'] = bool(error)
            sub['error_description'] = error if error else None
            break
    with open(path, 'w') as f:
        json.dump(submissions, f, indent=2)

def extract_sql_from_response(response_text):
    # Extract SQL from a markdown code block (```sql ... ```)
    code_block = re.search(r"```sql\s*([\s\S]+?)```", response_text, re.IGNORECASE)
    if code_block:
        return code_block.group(1).strip()
    # Fallback: Find the first SELECT ... ; block
    select_match = re.search(r"(SELECT[\s\S]+?;)", response_text, re.IGNORECASE)
    if select_match:
        return select_match.group(1).strip()
    # Fallback: Find the first line that starts with SELECT and take all lines until the next blank line or end
    lines = response_text.splitlines()
    sql_lines = []
    in_sql = False
    for line in lines:
        if line.strip().upper().startswith("SELECT"):
            in_sql = True
        if in_sql:
            sql_lines.append(line)
            if ";" in line:
                break
    if sql_lines:
        print(sql_lines)
        return "\n".join(sql_lines).strip().rstrip(';')
    return None


def get_ip_from_request(request):
    return request.data.get('ip_address') or \
           request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR')) or None

def load_table_metadata():
    meta_path = os.path.join(settings.BASE_DIR, 'api', 'table_metadata.json')
    with open(meta_path, 'r') as f:
        return json.load(f)

def build_prompt(metadata, query):
    return (
        f"Metadata:\n{json.dumps(metadata)}\n\n"
        f"User Question:\n{query}\n\n"
        "Instructions:\n"
        "- Output only a valid SELECT SQL query for Trino, compatible with Apache Iceberg tables.\n"
        "- Do NOT include any SQL comments (no -- or /* */).\n"
        "- Absolutely no UPDATE, DELETE, INSERT, CREATE, DROP, ALTER, SHOW, DESCRIBE, USE, GRANT, or REVOKE statements.\n"
        "- Select the columns needed to answer the user's question, plus any additional fields that provide useful context based on the metadata description. Use good judgment.\n"
        "- If the user asks for a non-SELECT action, reply exactly with: 'This action is not permitted. Only SELECT queries for data retrieval are allowed.'\n"
        "- Otherwise, output only the SQL. No additional text or explanation.\n"
    )



FORBIDDEN_SQL_KEYWORDS = [
    'UPDATE', 'DELETE', 'INSERT', 'CREATE', 'DROP', 'ALTER', 'SHOW', 'DESCRIBE', 'USE', 'GRANT', 'REVOKE', 'TRUNCATE', 'RENAME', 'CALL', 'SET', 'EXPLAIN', 'MERGE', 'COMMENT', 'REPLACE'
]

FORBIDDEN_SQL_MESSAGE = (
    "Only SELECT queries are permitted. Statements such as UPDATE, DELETE, INSERT, CREATE, DROP, SHOW, DESCRIBE, etc. are not allowed. "
    "Please contact the developer if you believe this feature would be helpful."
)

def is_query_allowed(sql):
    if not sql or not isinstance(sql, str):
        return False, FORBIDDEN_SQL_MESSAGE
    sql_upper = sql.upper()
    for keyword in FORBIDDEN_SQL_KEYWORDS:
        # Only match if the forbidden word is a standalone word (not part of another word)
        if re.search(rf'\b{keyword}\b', sql_upper):
            return False, FORBIDDEN_SQL_MESSAGE
    if not sql_upper.strip().startswith('SELECT'):
        return False, FORBIDDEN_SQL_MESSAGE
    return True, None

def generate_sql_with_openai(prompt):
    client = OpenAI(api_key=os.environ["OPEN_AI_API"])
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[
            {"role": "system", "content": "You are a helpful assistant for SQL generation."},
            {"role": "user", "content": prompt}
        ]
    )
    return extract_sql_from_response(response.choices[0].message.content.strip())   