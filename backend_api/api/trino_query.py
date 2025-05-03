# api/trino_query.py
import trino
from trino.exceptions import TrinoUserError

TRINO_HOST = "localhost"
TRINO_PORT = 8881
TRINO_USER = "nonprofit-app"
TRINO_CATALOG = "glue"


def run_trino_query(sql: str, schema_name: str = "nonprofit_data_explorer"):
    """
    Execute a SQL query against the user's schema in Trino.
    This function is intended to be called by the Django view when a user enters a prompt that is converted to SQL.
    Args:
        sql (str): The SQL query generated from the user's prompt.
        schema_name (str): The Glue/Trino schema (database) to query. Defaults to 'nonprofit_data_explorer'.
    Returns:
        List[dict]: Query results as a list of dictionaries, or {"error": ...} on failure.
    """
    conn = trino.dbapi.connect(
        host=TRINO_HOST,
        port=TRINO_PORT,
        user=TRINO_USER,
        catalog=TRINO_CATALOG,
        schema=schema_name,
        http_scheme="http"
    )
    cursor = conn.cursor()
    try:
        cursor.execute(sql)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    except TrinoUserError as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conn.close()


