# api/trino_query.py
import trino

def run_trino_query(sql: str, user_id: str):
    conn = trino.dbapi.connect(
        host="localhost",           # change to your Trino coordinator
        port=8080,
        user="nonprofit-app",       # optional: pass auth context
        catalog="iceberg",
        schema=f"user_{user_id}",   # assumes schema is named per user
        http_scheme="http"
    )
    cursor = conn.cursor()
    cursor.execute(sql)
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in rows]
