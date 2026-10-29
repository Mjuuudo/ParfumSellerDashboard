# ParfumSeller Dashboard

A back-office for a perfume shop that sells **complete bottles** and **10 ml / 20 ml decants**
poured from opened bottles. It tracks the catalog, the stock received from suppliers, the
opened bottles and their remaining volume, customers and orders. Stock is reserved when an order
is created, and deducted exactly once when it is confirmed.

| Layer    | Tech                                                                      |
| -------- | ------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, lucide-react           |
| Backend  | NestJS 12 (ESM), class-validator, JWT in an HTTP-only cookie              |
| Database | PostgreSQL 17 through **Prisma 8 RC** (`@prisma/orm-postgres`)            |
| Runtime  | Docker Compose: `databaseContainer`, `backendContainer`, `frontendContainer` |

---

## Features

- **Catalog:** brands (with logo) and perfumes (bottle size, full-bottle price, 10 ml and 20 ml decant prices).
- **Inventory:** each supplier delivery is a *stock batch* (bottles received, purchase cost, sealed bottles left).
- **Decant bottles:** open a sealed bottle to sell decants from it, then follow its remaining volume.
- **Customers:** contact details and delivery address; unique email and phone number.
- **Orders:** mix complete bottles and decants of several perfumes in one order.
  - **Create:** all the stock needed is **reserved** in one transaction. If any line can't be covered, nothing is reserved.
  - **Confirm:** the reserved stock is **deducted once**, and one *decant operation* is recorded per bottle poured from.
  - **Deliver:** the status changes; stock is not touched again.
  - **Cancel a pending order:** its reservations are released.
  - **Cancel a confirmed order:** owner only. The stock is put back and every consumption gets a matching *reversal*.
- **Stock & Reservations:** for each batch and opened bottle, what is physically there, what is reserved, and what is free to sell.
- **Decant operations:** the full history of pours and reversals.
- **Dashboard:** revenue, orders by status, available stock, latest orders, perfumes that can't be sold right now.
- **Users:** `OWNER` and `EMPLOYEE` roles. Only owners manage accounts.

---

## Project structure

```
.
├── docker-compose.yaml        # database + backend + frontend
├── Makefile                   # shortcuts for docker compose
├── Secrets/.env               # shared env file (NOT committed, see Secrets/.env.example)
├── uploads/                   # files served by the backend (brand logos), mounted in the backend
├── backend/                   # NestJS API (port 3000 in the container, 8000 on your machine)
│   ├── prisma.config.ts
│   ├── migrations/app/        # Prisma 8 migrations (one folder per migration)
│   ├── src/
│   │   ├── prisma/            # contract.prisma (the schema), generated contract.json/.d.ts, db.ts
│   │   ├── Auth/              # login/logout, AuthGuard (JWT cookie), RolesGuard (OWNER only)
│   │   ├── users/  brand/  parfum/  stockBatch/  decantBottle/  customer/
│   │   └── order/             # orders, reservations, inventory, decant operations, dashboard stats
│   └── test/                  # integration tests (run against the database)
└── frontend/                  # Next.js app (port 3000)
    ├── .env                   # NEXT_PUBLIC_API_URL (NOT committed, see .env.example)
    └── app/
        ├── _lib/api.ts        # API base URL, read from the env
        ├── _components/       # Toast (popup notifications)
        ├── login/
        └── dashboard/         # one folder per section (brands, parfums, stock, decants, customers, orders, …)
```

---

## Getting started

### 1. Prerequisites

- Docker with the Compose plugin.
- `make` (optional: every target is a plain `docker compose` command, see below).

Node.js is **not** needed on your machine. It runs inside the containers.

### 2. Environment files

**`Secrets/.env`** is read by the three containers. Copy the example and fill it in:

```bash
cp Secrets/.env.example Secrets/.env
```

| Variable            | Used by          | Example / notes                                                                                           |
| ------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`     | database         | `parfum`                                                                                                  |
| `POSTGRES_PASSWORD` | database         | a strong password                                                                                         |
| `POSTGRES_DB`       | database         | `parfumseller`                                                                                            |
| `DATABASE_URL`      | backend, Prisma  | `postgresql://parfum:<password>@database:5432/parfumseller`. The host is **`database`** (the compose service), not `localhost`. |
| `JWT_SECRET`        | backend          | a long random string                                                                                      |
| `JWT_EXPIRES_IN`    | backend          | token lifetime **in seconds**, e.g. `86400`                                                               |
| `FRONTEND_URL`      | backend          | optional, for CORS. Defaults to `http://localhost:3000`                                                   |

**`frontend/.env`** holds the API address **as the browser sees it**:

```bash
cp frontend/.env.example frontend/.env
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Start everything

```bash
make up          # or: docker compose up
```

| Service  | URL                         |
| -------- | --------------------------- |
| Frontend | http://localhost:3000       |
| API      | http://localhost:8000/api   |
| Postgres | `localhost:5432`            |

### 4. Create / update the database schema

Apply the migrations from `backend/migrations/app`:

```bash
docker exec -w /app backendContainer npx prisma db migrate --advance-ref db
docker exec -w /app backendContainer npx prisma db verify     # "Database marker and schema match contract"
```

### 5. Create the first owner account

Creating users through the app requires a logged-in **owner**. On an empty database, insert the first
owner by hand. The password is stored as a bcrypt hash:

```bash
# 1. hash the password you want
docker exec -w /app backendContainer node -e "require('bcrypt').hash('ChangeMe123!', 10).then(console.log)"

# 2. insert the owner (paste the hash, keep the single quotes)
docker exec -it databaseContainer sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

```sql
INSERT INTO "User" (username, "firstName", "lastName", email, "phoneNumber", "passwordHash", "Role", "isActive", "createdAt", "lastUpdate")
VALUES ('owner', 'First', 'Owner', 'owner@example.com', '+212600000000', '<bcrypt hash>', 'OWNER', true, now(), now());
```

Then sign in at http://localhost:3000/login. Other accounts can be created from **User Management**.

---

## Make targets

| Command        | Does                                                              |
| -------------- | ----------------------------------------------------------------- |
| `make up`      | `docker compose up`                                               |
| `make down`    | `docker compose down`                                             |
| `make restart` | down, then up                                                     |
| `make rebuild` | `docker compose down -v && docker compose up --build` (see warning below) |
| `make ps`      | list containers                                                   |
| `make database` / `make application` / `make UI` | start only the database / backend / frontend |

> ⚠ `make rebuild` runs `down -v`, which **deletes the `pg_data` volume, so the whole database is lost**.
> To rebuild images and keep the data: `docker compose up --build -V`.

---

## Development

### Changing the database schema (Prisma 8)

The schema is `backend/src/prisma/contract.prisma`. After editing it:

```bash
docker exec -w /app backendContainer npx prisma contract emit                       # regenerate contract.json / contract.d.ts
docker exec -w /app backendContainer npx prisma migration plan --name <what_changed>  # writes migrations/app/<date>_<name>
# review migrations/app/<date>_<name>/migration.ts
# if it contains placeholder(...) (e.g. a NOT NULL column on a table with rows), fill in the data transform,
# then run the file to re-emit it: docker exec -w /app backendContainer node migrations/app/<dir>/migration.ts
docker exec -w /app backendContainer npx prisma db migrate --advance-ref db         # apply it
```

Queries use the Prisma 8 API: `db.orm.public.<Model>` (ORM), `db.sql.public.<Table>` (SQL builder),
`db.raw.sql\`…\`` (raw SQL), and `db.transaction(async (tx) => …)`. See `backend/prisma-8.md` and
`backend/.claude/skills/prisma-8/`.

`DateTime` columns use `Temporal.Instant`, not `Date`. Write `Temporal.Now.instant()` (from `temporal-polyfill`).

### Tests and checks

```bash
# backend
docker exec -w /app backendContainer npx vitest run                                              # unit tests
docker exec -w /app backendContainer npx vitest run --config ./vitest.config.e2e.ts order-reservation  # integration (uses the DB)
docker exec -w /app backendContainer npx tsc -p tsconfig.build.json --noEmit
docker exec -w /app backendContainer npm run lint

# frontend
docker exec -w /app frontendContainer npx tsc --noEmit
docker exec -w /app frontendContainer npx eslint app
```

The integration tests run against the database in `DATABASE_URL`. They create their own
`ZZTEST…` rows and delete them afterwards; they never touch existing stock.

### Installing an npm package

`node_modules` lives in an anonymous Docker volume, so a package installed with `docker exec … npm install`
disappears when the container is recreated. Add it to `package.json`, then rebuild that service with fresh volumes:

```bash
docker compose up --build -V frontend     # or backend
```

---

## How orders use the stock

```
            create order                confirm                    deliver
  stock ──────────────────▶ RESERVED ─────────────▶ CONSUMED ─────────────▶ (no stock change)
                               │                       │
                       cancel  │                       │ cancel (owner only)
                               ▼                       ▼
                           RELEASED          RELEASED + REVERSAL operations
                     (reservation freed)     (bottles / ml put back)
```

- **Sealed bottles:** `available = unusedQuantity - reservedQuantity` (per stock batch).
- **Decants:** `available = remainingVolumeMl - reservedVolumeMl` (per opened bottle).
- **Allocation:** stock is taken from the oldest batch or bottle first. One decant line can be split across several bottles; each split is its own `StockReservation`.
- **Concurrency:** reservations lock the stock rows (`FOR UPDATE`) and use guarded updates (`… WHERE available >= n`). Two simultaneous orders can never reserve the same bottle or millilitre.
- **Database checks:** CHECK constraints stop the counters from going negative or above the physical stock.
- **Prices:** always read from the perfume on the server, never sent by the browser.

---

## API overview

All routes are under `/api` and need the `access_token` cookie set by `/api/auth/login`, except login itself.

| Area        | Routes |
| ----------- | ------ |
| Auth        | `POST /auth/login`, `POST /auth/logout` |
| Users       | `GET /user/me`, `GET /user/all`, `POST /user`, `GET\|PATCH\|DELETE /user/:id` (owner only) |
| Brands      | `GET\|POST /brand`, `GET\|PATCH /brand/:id` |
| Perfumes    | `GET\|POST /parfum`, `GET\|PATCH /parfum/:id` |
| Stock       | `GET\|POST /stock`, `GET\|PATCH /stock/:id` |
| Bottles     | `GET\|POST /bottle`, `GET /bottle/:id` |
| Customers   | `GET\|POST /customer`, `GET\|PATCH /customer/:id` |
| Orders      | `GET\|POST /order`, `GET /order/:id`, `POST /order/:id/confirm\|cancel\|deliver`, `GET /order/availability`, `GET /order/session` |
| Inventory   | `GET /inventory`, `GET /inventory/reservations`, `GET /decant-operation`, `GET /dashboard/stats` |

Every controller method has a short comment explaining what it does.

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `Module not found` in the frontend after installing a package | `docker compose up --build -V frontend` (see *Installing an npm package*) |
| Backend can't reach the database | In `Secrets/.env`, `DATABASE_URL` must use the host `database`, not `localhost` |
| The frontend calls the wrong API URL | Fix `NEXT_PUBLIC_API_URL` in `frontend/.env`, then restart the frontend container |
| `NEXT_PUBLIC_API_URL is not set` | Create `frontend/.env` from `frontend/.env.example` |
| `Codec 'pg/timestamptz-temporal@1' … received a Date` | Pass a `Temporal.Instant` (`Temporal.Now.instant()`), not `new Date()` |
| Every request redirects to `/login` | The cookie expired (`JWT_EXPIRES_IN`) or `JWT_SECRET` changed. Sign in again |
| A newly added column is missing in TypeScript | Run `npx prisma contract emit` in the backend container |
