# Design: Supabase → Self-hosted PostgreSQL Migration

**Date:** 2026-04-03
**Status:** Approved
**Scope:** Replace Supabase (auth + DB + storage) with self-hosted PostgreSQL + Drizzle ORM + custom JWT auth + local file storage

---

## Context

Genesis app MVP is an e-commerce for genetic tests built with Next.js 16 + Supabase. The app is deployed on a VPS (5.42.101.27) but cannot start because Supabase credentials are not configured. Rather than setting up Supabase, we migrate to the PostgreSQL 16 instance already running on the server (`pass24-postgres` container).

## Architecture

```
Browser ──→ Next.js App (site-genesis-app container)
                │
                ├── Middleware: JWT validation (jose)
                ├── API Routes: auth endpoints, payment, admin
                ├── Server Pages: Drizzle ORM queries
                └── File uploads → /app/data/uploads/
                         │
                         ▼
              PostgreSQL 16 (pass24-postgres container, DB: genesis)
```

Both containers are on the `onvis-net` Docker network. The app connects to PostgreSQL via container name `pass24-postgres`.

## Components

### 1. Database Layer — Drizzle ORM

**New database:** `genesis` on existing `pass24-postgres` container (separate from `pass24` DB).

**Schema file:** `src/db/schema.ts` — Drizzle table definitions mirroring current Supabase schema:
- `profiles` — user accounts (extended with `password_hash` TEXT field)
- `categories` — test categories
- `tests` — genetic tests catalog
- `orders` — customer orders
- `orderItems` — line items per order
- `orderStatusHistory` — audit trail
- `testResults` — uploaded PDF results
- `cartItems` — server-side cart (currently unused, keep for future)

**Client:** `src/db/index.ts` — singleton Drizzle client using `postgres` driver (porsager/postgres).

**Migrations:** `drizzle/` directory, generated via `drizzle-kit`. Initial migration from current SQL schema.

**Seed:** `src/db/seed.ts` — script to populate categories + tests (from current `00002_seed_catalog.sql`).

**Key functions (application-level, replacing DB functions):**
- `generateOrderNumber()` — uses PostgreSQL sequence `order_number_seq`
- `updateUpdatedAt` — Drizzle `.$onUpdate()` on timestamp columns

### 2. Authentication — Custom JWT

**Password storage:** bcrypt hash in `profiles.password_hash` column.

**JWT:** HS256 signed with `JWT_SECRET` env var. Payload: `{ sub: userId, role: 'user'|'admin', email }`. TTL: 7 days.

**Cookie:** `genesis-token`, HttpOnly, Secure, SameSite=Lax, Path=/.

**API routes:**
- `POST /api/auth/register` — validate input (Zod), check email uniqueness, bcrypt hash password, insert profile, sign JWT, set cookie, return user
- `POST /api/auth/login` — validate input, find profile by email, verify bcrypt, sign JWT, set cookie, return user
- `POST /api/auth/logout` — clear cookie, return success

**Helpers (`src/lib/auth.ts`):**
- `getUser(cookies)` — verify JWT from cookie, return `{ id, role, email }` or null
- `requireUser(cookies)` — getUser or throw 401
- `requireAdmin(cookies)` — requireUser + check role or throw 403
- `signToken(payload)` — create JWT
- `hashPassword(password)` — bcrypt hash
- `verifyPassword(password, hash)` — bcrypt compare

**Middleware (`src/middleware.ts`):**
- Read `genesis-token` cookie
- Verify JWT with `jose`
- For `/dashboard/*` routes: redirect to `/login` if no valid token
- For `/admin/*` routes: redirect to `/login` if no valid token or role !== 'admin'
- For `/login`, `/register`: redirect to `/dashboard` if already authenticated
- Pass user info via request headers (`x-user-id`, `x-user-role`) for server components

### 3. Query Layer

All Supabase SDK calls (`supabase.from('table').select()...`) replaced with Drizzle queries:

```typescript
// Before (Supabase)
const { data } = await supabase.from('tests').select('*, categories(*)').eq('is_active', true)

// After (Drizzle)
const data = await db.select().from(tests)
  .leftJoin(categories, eq(tests.categoryId, categories.id))
  .where(eq(tests.isActive, true))
```

**Permission checks** (replacing RLS):
- Public pages: no auth needed (catalog, test detail)
- Dashboard pages: `requireUser()` + filter by `user.id`
- Admin pages: `requireAdmin()` + no user filtering
- API routes: same helpers

### 4. File Storage — Local Filesystem

**Storage path:** `/app/data/uploads/{orderId}/{filename}`

**Docker volume:** `./data:/app/data` in `docker-compose.yml`

**Upload route:** `POST /api/admin/orders/[id]/results` — receives FormData, writes to filesystem, inserts `testResults` record with relative path.

**Download route:** `GET /api/files/[...path]` — verifies user owns the order (or is admin), streams file from filesystem.

### 5. Environment Variables

**Removed:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Added:**
- `DATABASE_URL=postgresql://pass24:8134cb20109a053c55369ac6e232f1d0@pass24-postgres:5432/genesis`
- `JWT_SECRET=<random 64 char string>`

**Unchanged:**
- `NEXT_PUBLIC_APP_URL=https://genesisbio.ru`
- `YOOKASSA_SHOP_ID` (stub)
- `YOOKASSA_SECRET_KEY` (stub)
- `RESEND_API_KEY` (stub)

### 6. Deployment Changes

**Dockerfile:** Remove Supabase build-args (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). No NEXT_PUBLIC vars needed at build time anymore.

**GitHub Actions:** Remove Supabase secrets from build-args. `DATABASE_URL` is runtime-only (server-side), no build-time exposure needed.

**docker-compose.yml:** Add `./data:/app/data` volume for file storage.

**Server .env:** Update with `DATABASE_URL` and `JWT_SECRET`.

## What Does NOT Change

- UI components (shadcn/ui) — untouched
- Cart store (Zustand + localStorage) — untouched
- Site config (`src/config/site.ts`) — untouched
- Page layouts and routing structure — untouched
- Business logic (checkout flow, pricing, order management) — same, different data layer
- Formatting utilities (`src/lib/format.ts`) — untouched

## Dependencies

**Added:**
- `drizzle-orm` — ORM
- `postgres` — PostgreSQL driver (porsager/postgres)
- `drizzle-kit` (devDep) — migrations CLI
- `jose` — JWT signing/verification
- `bcryptjs` + `@types/bcryptjs` — password hashing

**Removed:**
- `@supabase/supabase-js`
- `@supabase/ssr`

## Files Changed (Summary)

| Action | Files |
|--------|-------|
| **Create** | `src/db/schema.ts`, `src/db/index.ts`, `src/db/seed.ts`, `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/files/[...path]/route.ts`, `drizzle.config.ts`, `drizzle/0001_init.sql` |
| **Rewrite** | `src/middleware.ts`, all files in `src/app/api/` (4 routes), all files in `src/app/admin/` (9 pages), all files in `src/app/dashboard/` (5 pages), `src/app/(public)/catalog/page.tsx`, `src/app/(public)/catalog/[slug]/page.tsx` |
| **Modify** | `src/components/auth/login-form.tsx`, `src/components/auth/register-form.tsx`, `src/components/layout/header.tsx`, `src/components/layout/user-nav.tsx`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, `package.json`, `Dockerfile`, `.github/workflows/deploy.yml`, `.env.local` |
| **Delete** | `src/lib/supabase/` (4 files), `src/app/api/auth/callback/route.ts`, `supabase/` directory |

## Out of Scope (MVP)

- Email verification on registration
- Password reset via email
- OAuth providers (Google, GitHub)
- Real-time subscriptions
- CDN for file storage
- Database connection pooling (PgBouncer)
