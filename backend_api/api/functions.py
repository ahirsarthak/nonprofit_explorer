# functions.py
import os
import json
from datetime import datetime
from django.conf import settings
import uuid
from openai import OpenAI
import re

from .models import client

db = client["nonprofit"]

def save_feedback(name, email, linkedin, thoughts):
    feedback = {
        "name": name,
        "email": email,
        "linkedin": linkedin,
        "thoughts": thoughts,
        "timestamp": datetime.utcnow().isoformat()
    }
    db["feedback"].insert_one(feedback)
    return True

def save_submission(query, ip_address):
    timestamp = datetime.utcnow().isoformat()
    submission_id = str(uuid.uuid4())
    submission = {
        'submission_id': submission_id,
        'timestamp': timestamp,
        'ip_address': ip_address,
        'query': query
    }
    db["submissions"].insert_one(submission)
    return submission_id

def get_last_submissions(n=6):
    # Return the n most recent submissions from MongoDB
    cursor = db["submissions"].find().sort("timestamp", -1).limit(n)
    submissions = []
    for sub in cursor:
        submissions.append({
            "_id": str(sub["_id"]),
            "submission_id": sub.get("submission_id"),
            "query": sub.get("query")
        })
    return submissions

def get_submission_by_id(submission_id):
    return db["submissions"].find_one({'submission_id': submission_id})

def _store_failed_submission(submission_id, sql, prompt, error_description, user_query=None, ip_address=None, timestamp=None):
    doc = {
        "submission_id": submission_id,
        "sql": sql,
        #"prompt": prompt,
        "error_message": error_description,
        "user_query": user_query,
        "ip_address": ip_address,
        "timestamp": timestamp,
        "error": True,
        "results": None
    }
    db["failed_submissions"].insert_one(doc)

def _store_submission_output(submission_id, sql, prompt, results, is_error, user_query=None, ip_address=None, timestamp=None):
    doc = {
        "submission_id": submission_id,
        "sql": sql,
        #"prompt": prompt,
        # "results": results,  # Results intentionally not saved
        "is_error": is_error,
        "user_query": user_query,
        "ip_address": ip_address,
        "timestamp": timestamp
    }
    db["submissions"].update_one(
        {"submission_id": submission_id},
        {"$set": doc},
        upsert=True
    )

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
        "Rules:\n"
        "- METADATA is your BIBLE\n"
        "- Output only a valid SELECT SQL query for Trino, compatible with Apache Iceberg tables.\n"
        "- Do NOT include any SQL comments (no -- or /* */).\n"
        "- Absolutely no UPDATE, DELETE, INSERT, CREATE, DROP, ALTER, SHOW, DESCRIBE, USE, GRANT, or REVOKE statements.\n"
        "- Select columns needed to answer the user's question along with relevant fileds which one must know with it. Use your judgement and confirmed to exist in metadata.\n"
        "- Enclose ALL table names and column names in double quotes (\" \") without exception. This is required for SQL standard compliance and to prevent syntax errors.\n"
        "- Match column and table names exactly as they appear in the metadata.\n"
        "- If the user refers to a column using a synonym or variation (e.g., 'organization name' vs 'org name'), try to match it to the closest column name in metadata using context.\n"
        "- If the user mentions a value (e.g., 'Alliance nonprofit'), infer the relevant column based on which column in the metadata typically contains such values.\n"
        "- Do not include any column in SELECT or WHERE that is not present in the metadata.\n"
        "- Do not invent or assume the existence of a column if it's not listed in the metadata columns.\n"
        "- Apply fuzzy or case-insensitive filtering where appropriate using ILIKE or lower-cased comparisons (e.g., ILIKE '%alliance nonprofit%').\n"
        "- If the user requests a non-SELECT action, reply exactly with: 'This action is not permitted. Only SELECT queries for data retrieval are allowed.'\n"
        "- If the user mentions a keyword or concept that matches the *description* of a value in any column's value_mappings, use the corresponding underlying *code* as the filter.\n"
        "- Ensure the entire SQL query is syntactically correct and free of formatting issues like misplaced newlines or backslashes that could break Trino parsing.\n"
        "- Output ONLY the SQL query. No additional text, explanations, or formatting.\n"
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