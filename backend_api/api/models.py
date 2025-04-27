
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

from urllib.parse import quote_plus

DB_PASS = os.getenv('DB_PASS')
DB_PASS_ESCAPED = quote_plus(DB_PASS) if DB_PASS else ''
uri = f"mongodb+srv://pitcher99dev:{DB_PASS_ESCAPED}@nonprofit.xb99enw.mongodb.net/?retryWrites=true&w=majority&appName=nonprofit"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)