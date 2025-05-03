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
    db["submissions"].insert_one(doc)

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
    """Extracts the user's IPv4 address from the Django request object."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # X-Forwarded-For may contain multiple IPs, take the first one
        ip_list = [ip.strip() for ip in x_forwarded_for.split(',')]
        for ip in ip_list:
            if is_valid_ipv4(ip):
                return ip
    # Fallback to REMOTE_ADDR
    remote_addr = request.META.get('REMOTE_ADDR')
    if remote_addr and is_valid_ipv4(remote_addr):
        return remote_addr
    # If all else fails, return None
    return None

def is_valid_ipv4(ip):
    """Validates if the input string is a valid IPv4 address."""
    pattern = re.compile(r"""
        ^
        (?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}
        (?:25[0-5]|2[0-4]\d|1?\d{1,2})
        $
    """, re.VERBOSE)
    return bool(pattern.match(ip))

def load_table_metadata():
    meta_path = os.path.join(settings.BASE_DIR, 'api', 'table_metadata.json')
    with open(meta_path, 'r') as f:
        return json.load(f)


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
            {"role": "system", "content": (
                "You are a smart SQL query generator for IRS BMO nonprofit data. "
                "The data is queried using Trino and stored in Apache Iceberg format. "
                "You must use the provided metadata to translate user questions into safe, correct, and meaningful SELECT queries. "
                "Use logic and context to include helpful columns, even if not explicitly mentioned. "
                "Do not guess or invent anything not in the metadata. "
                "Never return explanations — only a complete SQL SELECT query."
        )},
            {"role": "user", "content": prompt}
        ]
    )
    return extract_sql_from_response(response.choices[0].message.content.strip())   

def build_prompt(metadata, query):
    return (
        "Context:\n"
        "You are generating SQL queries over the IRS Business Master File (BMO) for nonprofit organizations. "
        "The data is stored in Apache Iceberg format and queried using Trino. "
        "The table name is \"glue\".\"nonprofit_data_explorer\".\"bmo_table\".\n\n"
        f"Metadata:\n{json.dumps(metadata)}\n\n"
        f"User Question:\n{query}\n\n"
        "Rules:\n"
        "- METADATA is your BIBLE.\n"
        "- Output only a valid SELECT SQL query for Trino, compatible with Apache Iceberg.\n"
        "- Output ONLY the SQL query. No explanations, comments, or formatting.\n"
        "- Do NOT include any SQL comments (no -- or /* */).\n"
        "- Absolutely no UPDATE, DELETE, INSERT, CREATE, DROP, ALTER, SHOW, DESCRIBE, USE, GRANT, or REVOKE statements.\n"
        "- Use only columns listed in metadata. Do not invent column names.\n"
        "- Enclose ALL table and column names in double quotes (\" \").\n"
        "- Include WHERE clause only if the user intent clearly maps to metadata columns and values.\n"
        "- Use LOWER(column) LIKE LOWER('%value%') for fuzzy matching when appropriate.\n"
        "- If the user refers to a fuzzy or vague column (e.g., 'organization name', 'nonprofit type'), map it intelligently to the correct column from metadata.\n"
        "- If the user's question implies filtering (e.g., 'nonprofits in California'), infer the column (e.g., \"STATE\") and apply a correct filter.\n"
        "- Also include relevant context columns that enhance understanding of the result — even if not explicitly requested (e.g., include 'NAME', 'STATE', or 'REVENUE' when showing largest orgs).\n"
        "- If the user asks for a non-SELECT action, respond with: 'This action is not permitted. Only SELECT queries for data retrieval are allowed.'\n"
        "- If the question cannot be mapped meaningfully to the metadata, return no SQL.\n"
    )

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

def get_last_submissions(n=6):
    # Return the n most recent submissions from MongoDB
    cursor = db["submissions"].find().sort("timestamp", -1).limit(n)
    submissions = []
    for sub in cursor:
        submissions.append({
            "_id": str(sub["_id"]),
            "submission_id": sub.get("submission_id"),
            "query": sub.get("user_query")
        })
    return submissions

def get_submission_by_id(submission_id):
    return db["submissions"].find_one({'submission_id': submission_id})
