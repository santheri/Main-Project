import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
# if os.getenv("PRODUCTION") == "FALSE":
#     DEBUG = True
# else:
#     DEBUG = False
DEBUG = True
if os.getenv("PRODUCTION") == "FALSE":
    ALLOWED_HOSTS = ["*"]
else:
    ALLOWED_HOSTS = ["127.0.0.1", "https://exam-tool.vercel.app", "exam-tool.vercel.app"
                     "https://exam-app-main-97499141bebe.herokuapp.com", "exam-app-main-97499141bebe.herokuapp.com"]

ENVIRONMENT = os.environ.get("ENVIRONMENT", default="production")


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "rest_framework",
    "api",
    "corsheaders",
    'django_celery_beat',
    "authentication",    'rest_framework_simplejwt.token_blacklist',

    "rest_framework_simplejwt",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
backend_app = os.getenv("BACKEND_APP_NAME") or ""
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    backend_app + ".middleware.RestrictDomainAccessMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}


if os.getenv("USE_RDS") == "TRUE":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("PGDATABASE"),
            "USER": os.getenv("PGUSER"),
            "PASSWORD": os.getenv("PGPASSWORD"),
            "HOST": os.getenv("PGHOST"),
            "PORT": os.getenv("PGPORT", 5432),
            "CONN_MAX_AGE": 60,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# AUTH_USER_MODEL = 'authentication.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "https://exam-app-main-97499141bebe.herokuapp.com",
                        "https://exam-tool.vercel.app", "https://exam-app-main-97499141bebe.herokuapp.com"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "https://exam-app-main-97499141bebe.herokuapp.com",
                        "https://exam-tool.vercel.app"]

# CORS_ALLOW_HEADERS = [
#     "Authorization",
#     "Content-Type",
#     "credentials",
#     "access-control-allow-origin",
#     "X-CSRFToken",
# ]

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-requested-with',
    'accept',
    'origin',
    'user-agent',
    'dnt',
    'cache-control', "responsetype",
    'x-csrftoken',
    'x-xsrf-token',
]
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"

# if ENVIRONMENT == "production":
#     SECURE_BROWSER_XSS_FILTER = True
#     X_FRAME_OPTIONS = "DENY"
#     SECURE_SSL_REDIRECT = True
#     SECURE_HSTS_SECONDS = 3600
#     SECURE_HSTS_INCLUDE_SUBDOMAINS = True
#     SECURE_HSTS_PRELOAD = True
#     SECURE_CONTENT_TYPE_NOSNIFF = True
#     SESSION_COOKIE_SECURE = True
#     CSRF_COOKIE_SECURE = True
#     SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
#     CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]

# else:
CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SAMESITE = False
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]
CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SECURE = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CELERY_BROKER_URL = 'pyamqp://guest@localhost//'
