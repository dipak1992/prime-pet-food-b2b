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
- `/cart`
- `/checkout`
- `/orders`
- `/invoices`
- `/favorites`
- `/bundles`
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
- `POST /api/checkout`
- `GET /api/admin/applications`
- `POST /api/admin/applications/:id/approve`
- `POST /api/admin/applications/:id/reject`
- `POST /api/stripe/webhook`
- `GET /api/health`

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

## Go live checklist

1. Configure production environment variables in Vercel:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_ACCESS_TOKEN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

2. Create Stripe webhook endpoint after deploy:

- Endpoint URL: `https://YOUR_DOMAIN/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.expired`

3. Verify production health and critical paths:

- `GET /api/health`
- Buyer checkout -> Stripe payment -> order moves to paid/confirmed
- Admin application approve/reject sends email
- Admin invoice sent/paid sends email

4. Deploy via Vercel:

```bash
npm run build
vercel --prod
```
