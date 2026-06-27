# Backend

This directory contains the Django REST API for the e-commerce marketplace. It handles authentication, products, orders, payments, and admin-related functionality.

## Main Technologies

- Django 5
- Django REST Framework
- JWT authentication
- PostgreSQL
- Chapa payment integration

## Requirements

Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

## Environment Configuration

Create a `.env` file inside the backend folder with the required values, including:

- `SECRET_KEY`
- `DEBUG`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `PUBLIC_KEY`
- `CHAPA_SECRET_KEY`
- `ENCRYPTION_KEY`

## Run the Server

Apply migrations:

```bash
python manage.py migrate
```

Start the development server:

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

## Notes

- The backend uses JWT-based authentication.
- Make sure your PostgreSQL database is configured and running before migrating.
- Static and media files are stored under the backend media directory during development.
