import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'your-default-secret-key')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

#ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'defensive-experienced-started-nursery.trycloudflare.com',
    'nonprofit-explorer.pages.dev',
]
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'api',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


CORS_ALLOW_ALL_ORIGINS = True

#CORS_ALLOWED_ORIGINS = [
#    "http://localhost:4173",
#    "https://defensive-experienced-started-nursery.trycloudflare.com",
#    "defensive-experienced-started-nursery.trycloudflare.com/api",
#    "https://nonprofit-explorer.pages.dev",
#    "nonprofit-explorer.pages.dev",
#]


ROOT_URLCONF = 'config.urls'

ASGI_APPLICATION = 'config.asgi.application'

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.postgresql',
#        'NAME': os.getenv('DB_NAME', 'postgres'),
#        'USER': os.getenv('DB_USER', 'postgres'),
#        'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
#        'HOST': os.getenv('DB_HOST', 'localhost'),
#        'PORT': os.getenv('DB_PORT', '5432'),
#    }
#}

#STATIC_URL = '/static/'




DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'