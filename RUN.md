# RUN.md — Remake Helco

Backend Laravel (port 8000) and the React storefront (port 5173) both have to be up. The storefront proxies `/api` to the backend.

| App | URL |
|-----|-----|
| Storefront | http://127.0.0.1:5173/ |
| API | http://127.0.0.1:8000/api/products |
| Swagger | http://127.0.0.1:8000/docs |
| Admin | `admin@helcobali.id` / `admin123` |

## Run again (already set up)

MongoDB must already be listening on `127.0.0.1:27017`. Two terminals, from the repo root:

```powershell
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Skip `composer install`, `npm install`, migrate, and seed on a normal restart.

## First time only

Needs PHP 8.3+ with the `mongodb` extension (`php -m` lists `mongodb`), Composer 2, Node 18+, and MongoDB on `127.0.0.1:27017` with no username.

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

`.env.example` already points at local MongoDB and uses file sessions, so a fresh copy does not look for SQL tables. Leave `JWT_SECRET` empty. The signer uses `APP_KEY`. `JWT_TTL` is the token lifetime in minutes (1440 = 24 hours). `FRONTEND_URL` is the link on the API home page.

```powershell
php artisan migrate --force
php artisan mongo:indexes
php artisan db:seed --force
php artisan serve --host=127.0.0.1 --port=8000
```

`mongo:indexes` is safe to repeat. An existing admin user is not overwritten. `ADMIN_PASSWORD` is hashed on insert; if it is unset, the seed still uses `admin123`.

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

## When something fails

- **`Class "MongoDB\..." not found`** — enable the PHP mongodb extension, then `composer install` again.
- **Empty product list** — MongoDB is stopped, `DB_HOST` is not `127.0.0.1` (a value of `mongo` only works inside Docker), or the first-time seed was skipped.
- **Frontend network error** — the API on port 8000 is down. Vite only forwards `/api`.
- **Port already in use** — the app is already running, or pass another `--port`.

## API shape

Collection `GET`s return `{ "data": [], "meta": { "current_page", "per_page", "total", "last_page" } }`.

| Param | Meaning |
|-------|---------|
| `page` | Page number, default 1 |
| `per_page` | Page size, default 20, max 100 |
| `q` | Case-insensitive text search |
| `sort` | Allow-listed field |
| `order` | `asc` or `desc` |

Public `GET /api/products` accepts `sort` of title, price, origin, or roast. Dashboard lists: `/api/dashboard/products`, `/rows`, `/requests`, `/production`. Bad input on `/api/*` is **400**. Creates are **201**. Missing records are **404**. A missing or invalid JWT is **401**. Staff calling an admin route is **403**.

Swagger UI is `GET /docs`. The OpenAPI file is `GET /openapi.yaml` and `backend/public/openapi.yaml`. A static copy is in `docs/`.

## Tests

PHPUnit uses the Mongo database `helco_test` on `127.0.0.1:27017`.

```powershell
cd backend
php artisan test
```

Load test, with the API already running:

```powershell
cd backend
php scripts/loadtest.php
```

Optional env: `LOAD_URL`, `LOAD_CONCURRENCY` (default 10), `LOAD_REQUESTS` (default 40).
