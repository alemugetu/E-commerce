 🔴 Still  In Progress and testing level for production ready

# E-commerce Marketplace

A full-stack e-commerce platform for selling electronics and laptops, built with Django REST Framework on the backend and React + Vite on the frontend. The project includes user authentication, product browsing, cart and wishlist functionality, order management, payments through Chapa, and an admin-focused workflow.

## Overview

This repository contains:

- A Django backend API for products, orders, authentication, payments, and admin features
- A React frontend for browsing products, managing the cart, placing orders, and interacting with the store

## Tech Stack

- Backend: Django 5, Django REST Framework, JWT authentication, PostgreSQL, CORS support
- Frontend: React 19, Vite, React Router, TanStack Query, Axios, Tailwind CSS

## Project Structure

- backend/ – Django project and API applications
- frontend/ – React frontend application
- LICENSE – project license

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-marketplace
```

### 2. Backend setup

```bash
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file in the backend directory with the required environment variables, including:

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

Then run:

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will usually run at `http://localhost:5173/`.

## Features

- User registration and login
- Product listing and detail views
- Search and filtering
- Cart and wishlist management
- Order placement and payments
- Admin and custom admin experience

## Notes

- The backend uses JWT-based authentication and expects the frontend to send requests to the API endpoint configured in the frontend services.
- Make sure your database server is running before starting Django migrations.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

