# RUN.md — Remake Helco

Monorepo with two apps:

```
remake helco/
├── backend/    Laravel 13 API (MongoDB) — products
└── frontend/   React 19 + Vite storefront (kopi-premium-web)
```

The frontend proxies `/api/*` to the backend, so **both must run**.

## Prerequisites

| Tool | Version |
|------|---------|
| PHP | ^8.3 with the **mongodb** extension (`php -m` must list `mongodb`) |
| Composer | 2.x |
| Node.js + npm | Node 18+ |
| MongoDB | running on `127.0.0.1:27017` |

## 1. Backend

```bash
cd backend
composer install
copy .env.example .env        # Windows — on macOS/Linux use: cp .env.example .env
php artisan key:generate
```

Edit `.env` so the database points to MongoDB:

```
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=helco_db
```

Then migrate + seed the 5 sample products, and serve:

```bash
php artisan migrate --force
php artisan db:seed --force
php artisan serve --host=127.0.0.1 --port=8000
```

Sanity check: `http://127.0.0.1:8000/api/products` should return JSON.

## 2. Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/`.

## Ports

| App | URL |
|-----|-----|
| Frontend | http://127.0.0.1:5173/ |
| Backend API | http://127.0.0.1:8000/api |

## Troubleshooting

- **`Class "MongoDB\..." not found` / driver errors** → install/enable the PHP mongodb extension, then `composer install` again.
- **Empty product list** → MongoDB isn't running, `.env` still points elsewhere, or you skipped `db:seed`.
- **Frontend shows network errors** → backend on `:8000` must be up; the Vite proxy (`frontend/vite.config.js`) forwards `/api` there.
- **Port already in use** → stop the old process or pass a different `--port`.
