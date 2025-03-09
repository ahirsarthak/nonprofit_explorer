import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
application = get_asgi_application()

# .env (Environment Variables for Security & Scalability)
#SECRET_KEY=mysecretkey
#DEBUG=False
#ALLOWED_HOSTS=localhost,127.0.0.1
#DB_NAME=mydatabase
#DB_USER=myuser
#DB_PASSWORD=mypassword
#DB_HOST=db
#DB_PORT=5432
