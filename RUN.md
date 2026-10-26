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

Then migrate, create Mongo indexes, seed, and serve:

```bash
php artisan migrate --force
php artisan mongo:indexes
php artisan db:seed --force
php artisan serve --host=127.0.0.1 --port=8000
```

`mongo:indexes` is idempotent. The Docker start command runs it after migrate. It no-ops unless `DB_CONNECTION=mongodb`.

Set these in `.env` before the first seed:

```
JWT_SECRET=change-me
JWT_TTL=1440
ADMIN_EMAIL=admin@helcobali.id
ADMIN_PASSWORD=admin123
```

`JWT_TTL` is the access-token lifetime in minutes (1440 = 24 hours). Tokens are HS256 JWTs from `firebase/php-jwt`, sent as `Authorization: Bearer`. If `JWT_SECRET` is empty, the signer uses `APP_KEY`. `ADMIN_PASSWORD` is the first-run admin password and is stored hashed. When the variable is unset, the seed falls back to `admin123` so a fresh database can still sign in at `admin@helcobali.id`. An existing admin user is not overwritten.

## API list parameters

`GET` collections return `{ "data": [], "meta": { "current_page", "per_page", "total", "last_page" } }`.

| Param | Meaning |
|-------|---------|
| `page` | Page number, default 1 |
| `per_page` | Page size, default 20, max 100 |
| `q` | Case-insensitive text search |
| `sort` | Allow-listed field |
| `order` | `asc` or `desc` |

Main lists: public `GET /api/products` (`sort` title, price, origin, roast), dashboard `GET /api/dashboard/products`, `/rows` (stock batches), `/requests`, and `/production`. Invalid input on `/api/*` returns **400** with `{ message, errors }`. Creates return **201**. Missing records return **404**. Missing or invalid JWT returns **401**. Staff calling an admin route returns **403**.

## API docs

Swagger UI is `GET /docs` (for example `http://127.0.0.1:8000/docs`). The OpenAPI 3 document is `GET /openapi.yaml`. Both are served by Laravel, and the same YAML is also at `backend/public/openapi.yaml` for a static file server.

A backend-free copy lives in `docs/` (`index.html` loads `./openapi.yaml`) for GitHub Pages.

## Tests

PHPUnit uses the Mongo database `helco_test` on `127.0.0.1:27017` (see `backend/phpunit.xml`).

```bash
cd backend
php artisan test
```

## Load test

With the API already running:

```bash
cd backend
php scripts/loadtest.php
```

Optional: `LOAD_URL`, `LOAD_CONCURRENCY` (default 10), `LOAD_REQUESTS` (default 40). The script prints min, average, p95, and max response times.

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
