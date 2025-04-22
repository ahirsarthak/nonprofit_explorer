import polars as pl
import os

# Create a global SQL context
sql_ctx = pl.SQLContext()

def run_query_on_iceberg(sql: str):
    # Load the dataset (mocking the Iceberg table for now)
    file_path = os.path.join(os.path.dirname(__file__), 'iceberg_table.parquet')

    if not os.path.exists(file_path):
        raise FileNotFoundError("Mock Iceberg file not found.")

    # Read the file into Polars
    df = pl.read_parquet(file_path)

    # Register it as a SQL table
    sql_ctx.register("iceberg_table", df)

    # Run the SQL query
    result_df = sql_ctx.execute(sql).collect()

    return result_df
