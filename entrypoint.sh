#!/bin/sh
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Checking superuser..."

python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

if username and email and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        print(f"Superuser '{username}' created.")
    else:
        print(f"Superuser '{username}' already exists.")
else:
    print("Superuser environment variables are not configured. Skipping.")

PY

echo "Starting Gunicorn..."

exec gunicorn --bind 0.0.0.0:8000 --workers 2 config.wsgi:application


