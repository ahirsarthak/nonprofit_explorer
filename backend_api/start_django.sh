#!/bin/bash

# Go to the Django project folder
cd "$(dirname "$0")" || exit 1

# Activate the virtual environment
source backend_env/bin/activate

# Install/update requirements
pip install -r requirements.txt

# Start Uvicorn
uvicorn config.asgi:application --host 127.0.0.1 --port 8000 --reload --log-level debug
