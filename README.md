# Prime Pet Wholesale Portal

Starter codebase scaffold for a gated B2B wholesale portal for Prime Pet Food.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Supabase Auth (magic link)
- Route handlers for buyer/admin APIs

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy env and fill real values:

```bash
cp .env.example .env
```

3. Generate Prisma client and run migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Initial pages

Public:
- `/` wholesale landing
- `/apply` wholesale application form
- `/login` magic link login

Buyer (approved users):
- `/dashboard`
- `/products`
- `/orders`
- `/invoices`
- `/account`
- `/support`
- `/downloads`

Admin:
- `/admin`
- `/admin/applications`
- `/admin/orders`
- `/admin/customers`

## Initial API routes

- `POST /api/wholesale-applications`
- `GET /api/me`
- `GET /api/products`
- `GET /api/orders`
- `GET /api/admin/applications`
- `POST /api/admin/applications/:id/approve`
- `POST /api/admin/applications/:id/reject`

## Project structure

```txt
src/
  app/
    (public)/apply
    (auth)/login
    (portal)/dashboard products orders invoices account support downloads
    (admin)/admin applications orders customers
    api/
  components/
    layout/
    ui/
  lib/
    auth/
    supabase/
    validations/
    prisma.ts
prisma/
  schema.prisma
database/
  schema.sql
```

## Notes

- Middleware currently enforces authentication on protected routes.
- Role and approval checks are enforced in server-side guards.
- Product sync integration points are prepared via env vars and database schema; sync job implementation is the next step.
