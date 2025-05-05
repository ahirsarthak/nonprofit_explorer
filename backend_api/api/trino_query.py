import os
import trino
from trino.exceptions import TrinoUserError

# Pull config from environment with fallbacks
TRINO_HOST = os.getenv("TRINO_HOST", "localhost")
TRINO_PORT = int(os.getenv("TRINO_PORT", 8881))
TRINO_USER = os.getenv("TRINO_USER", "nonprofit-app")
TRINO_CATALOG = os.getenv("TRINO_CATALOG", "glue")

def run_trino_query(sql: str, schema_name: str = "nonprofit_data_explorer"):
    """
    Executes a SQL query against the specified Trino schema.
    Returns streamed rows as list of dictionaries, or an error dict.
    """
    conn = None
    cursor = None
    try:
        conn = trino.dbapi.connect(
            host=TRINO_HOST,
            port=TRINO_PORT,
            user=TRINO_USER,
            catalog=TRINO_CATALOG,
            schema=schema_name,
            http_scheme="http",
            session_properties={"query_max_execution_time": "5m"}
        )
        cursor = conn.cursor()
        #print(f'line29: {sql}')
        cursor.execute(sql)

        columns = [desc[0] for desc in cursor.description]
        results = []
        for row in cursor:
            results.append(dict(zip(columns, row)))
        return results

    except TrinoUserError as e:
        return {"error": f'error: report to dev {str(e)}'}
    except Exception as e:
        return {"error": f"error: invalid input"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
