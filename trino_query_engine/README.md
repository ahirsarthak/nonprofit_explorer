# Trino Query Engine - Local Setup with AWS Glue Catalog

This folder contains everything you need to run a local Trino server configured for querying data using the AWS Glue Data Catalog as a metastore. This setup is ideal for development, testing, and analytics against your AWS-managed metadata and S3 data lakes.

---

## Folder Structure

- `start_trino.sh` — Shell script to launch the Trino server with Java 21.
- `trino-server-443/` — Unpacked Trino server distribution (version 443).
    - `etc/config.properties` — Trino's main server configuration (coordinator, port, memory, etc).
    - `etc/jvm.config` — JVM options (heap size, GC tuning, etc).
    - `etc/node.properties` — Node identity and data directory.
    - `plugin/` — All Trino connectors (including Hive for Glue).
    - `bin/` — Trino launcher scripts.
    - `var/` — Logs and runtime files.
- `trino-server-443.tar.gz` — (Optional) Original Trino server tarball.

---

## Prerequisites

- **Java 21** installed (e.g., via `brew install openjdk@21` on macOS)
- AWS credentials with Glue and S3 access (see below)

---

## Configuration Overview

### 1. JVM Configuration (`etc/jvm.config`)
- Sets Java heap size, garbage collection, and debugging options.

### 2. Node Configuration (`etc/node.properties`)
- Sets the environment, node ID, and data directory for Trino.

### 3. Server Configuration (`etc/config.properties`)
- Sets Trino as coordinator, enables discovery, HTTP port, and memory limits.

### 4. Glue Catalog Connector
- To use AWS Glue as your metastore, create a file:
  - `trino-server-443/etc/catalog/glue.properties`

  Example contents:
  ```properties
  connector.name=hive
  hive.metastore=glue
  hive.aws-access-key=YOUR_AWS_ACCESS_KEY_ID
  hive.aws-secret-key=YOUR_AWS_SECRET_ACCESS_KEY
  hive.aws-region=us-east-1
  ```
  - For production, use IAM roles or environment variables instead of hardcoding keys.

---

## How to Start Trino

1. **Ensure Java 21 is installed and available.**
   - On macOS: `brew install openjdk@21`

2. **Configure Glue Catalog**
   - Create `trino-server-443/etc/catalog/glue.properties` as shown above.

3. **Start Trino**
   - Run: `bash start_trino.sh`
   - The script sets up Java and launches Trino in the background.

4. **Access Trino Web UI**
   - Open your browser to [http://localhost:8989](http://localhost:8989)

---

## Querying Data

- Use the Trino CLI, Web UI, or REST API to run queries.
- Example SQL:
  ```sql
  SHOW CATALOGS;
  SHOW SCHEMAS FROM glue;
  SHOW TABLES FROM glue.your_database;
  SELECT * FROM glue.your_database.your_table LIMIT 10;
  ```

---

## AWS Permissions

Your Trino server (or the user/role running it) must have these AWS permissions:
- `glue:Get*`, `glue:Search*`, `glue:BatchGet*`
- `s3:GetObject`, `s3:ListBucket` on your S3 data buckets

---

## Troubleshooting

- Check logs in `trino-server-443/var/log/` if the server does not start.
- Ensure your AWS credentials are correct and have the required permissions.
- Make sure Java 21 is active in your environment.
- For more configuration options, see the [Trino documentation](https://trino.io/docs/current/).

---

## Security Note

**Do NOT commit your AWS credentials to version control!**
Use IAM roles, environment variables, or Trino's password obfuscation for production.

---

## References
- [Trino Documentation](https://trino.io/docs/current/)
- [AWS Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/components-overview.html)
- [Trino Hive Connector (Glue)](https://trino.io/docs/current/connector/hive.html#aws-glue-catalog)
