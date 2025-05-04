#!/bin/bash

export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
export PATH="$JAVA_HOME/bin:$PATH"

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Ensure the spill directory exists and is writable
SPILL_DIR="/tmp/trino-spill"
mkdir -p "$SPILL_DIR"
chmod 755 "$SPILL_DIR"

# Optional: set ownership if running as a specific user
# chown trino_user:trino_user "$SPILL_DIR"

cd "$(dirname "$0")/trino-server-443"
bin/launcher start
