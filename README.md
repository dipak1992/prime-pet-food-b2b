# Prime Pet Wholesale Portal

Prime Pet Wholesale Portal is a gated B2B ordering, account management, and admin operations app for Prime Pet Food. It supports wholesale applications, protected buyer access, product ordering, invoices, support workflows, Shopify product sync, Stripe checkout, outbound email, SEO lead capture, and AI-assisted sales operations.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4
- Prisma 7 with PostgreSQL through `@prisma/adapter-pg`
- Supabase Auth for buyer/admin authentication
- Stripe for checkout and payment webhooks
- Resend for transactional and outreach email
- Shopify Admin/Storefront APIs for product sync
- OpenAI, Anthropic, or Google AI provider hooks for AI workflows
- Vercel Functions and Cron Jobs

## Core Features

### Public Wholesale Site

- Wholesale landing page with Prime Pet positioning, margin proof points, buyer FAQs, and calls to apply.
- Public catalog pages with product detail routes.
- Wholesale application intake at `/apply`.
- SEO content pages for wholesale yak chews, private label, bulk buying, dog treat profit, retailer comparisons, distributor programs, and location-specific wholesale pages.
- Retailer resource center powered by typed content in `src/content/seo`.
- Public product API endpoints for catalog experiences.

### Buyer Portal

- Protected portal shell for approved wholesale buyers.
- Dashboard for account and ordering context.
- Product catalog and product detail pages with gated wholesale pricing.
- Cart, quick order, reorder-last, checkout, and quote request workflows.
- Order history and order detail pages.
- Invoice list and invoice detail API access.
- Favorites, bundles, account addresses, support tickets, and buyer downloads.
- Access-state pages for pending, rejected, and suspended accounts.

### Admin Operations

- Admin dashboard for wholesale operations.
- Application review with approve/reject flows.
- Customer, order, invoice, product, support, asset, analytics, and settings sections.
- Product sync panel for Shopify-backed catalog updates.
- SLA rules and support workflow tracking.
- Outreach CRM for leads, activities, deals, samples, email drafts, ownership, sequence processing, duplicate checks, bulk import, and export.
- Admin user provisioning endpoint.

### AI Sales Workflows

- AI dashboard and per-agent admin pages for leads, outreach, follow-ups, reorders, copilot, and settings.
- Agent framework in `src/lib/ai` with runner, safety limits, model config, prompts, and provider clients.
- Lead finder, lead qualifier, outreach drafter, follow-up agent, reorder predictor, and sales copilot modules.
- AI run history, recommendations, follow-up tasks, reorder predictions, and agent config models.
- Scheduled AI agent runner at `/api/cron/ai-agents`.

### Commerce And Integrations

- Shopify OAuth install/callback routes and cron-backed product sync.
- Stripe checkout creation and webhook handling for checkout session completion/expiration.
- Resend-powered magic links, transactional email, support/admin notifications, and outreach sequence sends.
- Attribution tracking for SEO lead capture and CRM source reporting.
- Vercel cron jobs for product sync, reorder reminders, and AI agents.

## App Routes

Public:

- `/`
- `/apply`
- `/catalog`
- `/catalog/[id]`
- `/wholesale`
- `/wholesale/locations`
- `/wholesale/locations/[state]`
- `/wholesale/locations/[state]/[city]`
- `/resources`
- `/resources/[slug]`
- `/distributor-program`
- `/private-label-yak-chews`
- `/bulk-yak-cheese-dog-chews`
- `/wholesale-yak-cheese-dog-chews`
- `/wholesale-dog-chews-for-pet-stores`
- `/best-high-margin-dog-treats-for-pet-stores`
- `/yak-chews-vs-rawhide-for-retailers`
- `/dog-treat-profit-calculator`

Auth and access:

- `/login`
- `/forgot-password`
- `/reset-password`
- `/access-pending`
- `/access-rejected`
- `/access-suspended`
- `/admin/login`

Buyer portal:

- `/dashboard`
- `/products`
- `/products/[id]`
- `/cart`
- `/checkout`
- `/quick-order`
- `/quote`
- `/orders`
- `/orders/[id]`
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
- `/admin/orders/[id]`
- `/admin/customers`
- `/admin/customers/[id]`
- `/admin/products`
- `/admin/invoices`
- `/admin/support`
- `/admin/assets`
- `/admin/analytics`
- `/admin/settings`
- `/admin/reorders`
- `/admin/outreach`
- `/admin/outreach/[id]`
- `/admin/ai`
- `/admin/ai/leads`
- `/admin/ai/outreach`
- `/admin/ai/followups`
- `/admin/ai/reorders`
- `/admin/ai/copilot`
- `/admin/ai/settings`

## API Surface

Buyer and public APIs:

- `/api/wholesale-applications`
- `/api/me`
- `/api/me/addresses`
- `/api/me/addresses/[id]`
- `/api/products`
- `/api/products/[id]`
- `/api/public/products`
- `/api/public/products/[id]`
- `/api/cart`
- `/api/cart/items`
- `/api/cart/reorder-last`
- `/api/checkout`
- `/api/orders`
- `/api/invoices`
- `/api/invoices/[id]`
- `/api/favorites`
- `/api/bundles`
- `/api/support/tickets`
- `/api/seo/lead-capture`
- `/api/auth/magic-link`
- `/api/auth/logout`
- `/api/email/send`
- `/api/health`

Admin APIs:

- `/api/admin/applications`
- `/api/admin/applications/[id]/approve`
- `/api/admin/applications/[id]/reject`
- `/api/admin/customers`
- `/api/admin/customers/[id]`
- `/api/admin/orders`
- `/api/admin/orders/[id]`
- `/api/admin/products/[id]`
- `/api/admin/products/sync`
- `/api/admin/invoices`
- `/api/admin/invoices/[id]`
- `/api/admin/invoices/[id]/quickbooks`
- `/api/admin/support`
- `/api/admin/support/[id]`
- `/api/admin/assets`
- `/api/admin/settings`
- `/api/admin/sla-rules`
- `/api/admin/sync-status`
- `/api/admin/users/provision`
- `/api/admin/reorders`
- `/api/admin/leads`
- `/api/admin/leads/[id]`
- `/api/admin/leads/[id]/activities`
- `/api/admin/leads/[id]/deals`
- `/api/admin/leads/[id]/emails`
- `/api/admin/leads/[id]/emails/[emailId]/send`
- `/api/admin/leads/[id]/ownership`
- `/api/admin/leads/[id]/samples`
- `/api/admin/leads/[id]/sequences`
- `/api/admin/leads/bulk-import`
- `/api/admin/leads/check-duplicates`
- `/api/admin/leads/export`
- `/api/admin/leads/sequences/process`
- `/api/admin/leads/stats`
- `/api/admin/outreach/extract`
- `/api/admin/outreach/generate-email`
- `/api/admin/outreach/intent`
- `/api/admin/outreach/search`
- `/api/admin/ai/run`
- `/api/admin/ai/settings`
- `/api/admin/ai/leads`
- `/api/admin/ai/outreach`
- `/api/admin/ai/followups`
- `/api/admin/ai/reorders`
- `/api/admin/ai/copilot`

Integration and cron APIs:

- `/api/shopify/install`
- `/api/shopify/callback`
- `/api/stripe/webhook`
- `/api/cron/sync-products`
- `/api/cron/reorder-reminders`
- `/api/cron/ai-agents`

## Data Model

The Prisma schema covers:

- Users, account status, buyer roles, wholesale applications, customers, and addresses.
- Products, product sync jobs, bundles, favorites, carts, and customer-specific price overrides.
- Orders, order items, order status history, invoices, and payment transactions.
- Support requests, quote requests, assets, SLA rules, and settings.
- Leads, attribution events, outreach emails, lead activities, deals, samples, and follow-up sequences.
- AI runs, AI recommendations, follow-up tasks, reorder predictions, and AI agent configuration.

## Project Structure

```txt
src/
  app/
    (public)/       Public marketing, SEO, catalog, and application pages
    (auth)/         Buyer auth and access-state pages
    (portal)/       Approved buyer portal pages
    (admin)/        Admin operations and AI dashboards
    api/            Route handlers for buyer, admin, integration, and cron APIs
  components/
    admin/          Admin UI panels and tables
    gated/          Buyer access-state and gated-commerce UI
    layout/         Portal shell and navigation
    portal/         Buyer portal widgets
    seo/            SEO page components
    ui/             Shared UI primitives
  content/seo/      Typed SEO and resource content
  lib/
    ai/             AI agents, prompts, provider clients, safety, and runner
    auth/           Server-side role and account guards
    email/          Resend email helpers
    integrations/   Shopify product sync
    services/       Cart and product sync services
    supabase/       Supabase browser/server/admin clients
    validations/    Zod validation schemas
prisma/
  schema.prisma
  migrations/
database/
  schema.sql
public/
  downloads/        Buyer-facing downloadable assets
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development and fill in real values.

Required for database and auth:

- `SUPABASE_DB_URL` - runtime PostgreSQL connection string used by `src/lib/prisma.ts`
- `DATABASE_URL` - Prisma CLI fallback connection string
- `DIRECT_URL` - optional Prisma migration/direct connection string
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Commerce and operations:

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_ACCESS_TOKEN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_CLIENT_ID`
- `SHOPIFY_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `FROM_EMAIL`

AI and search:

- `AI_ENABLED`
- `AI_PROVIDER`
- `AI_MODEL`
- `AI_MAX_EMAILS_PER_DAY`
- `AI_OUTREACH_AUTO_SEND`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `SERPER_API_KEY`

Cron and rollout controls:

- `CRON_SECRET`
- `UPSTASH_CRON_SECRET`
- `REORDER_REMINDER_ROLLOUT_LIMIT`

## Local Development

Install dependencies:

```bash
npm install
```

Create local environment:

```bash
cp .env.example .env.local
```

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start the Next.js development server
- `npm run build` - create a production build
- `npm run start` - run the production server after building
- `npm run lint` - run ESLint
- `npm run postinstall` - generate Prisma client after install

## Scheduled Jobs

Configured in `vercel.json`:

- `/api/cron/sync-products` every 6 hours
- `/api/cron/reorder-reminders` daily at 15:00 UTC
- `/api/cron/ai-agents` hourly

## Deployment Checklist

1. Configure all production environment variables in Vercel.
2. Run migrations against the production database.
3. Configure the Stripe webhook endpoint:
   - URL: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`
4. Configure Shopify app credentials and callback URL:
   - Install: `/api/shopify/install`
   - Callback: `/api/shopify/callback`
5. Configure cron secrets for protected scheduled routes.
6. Verify critical paths:
   - `GET /api/health`
   - Wholesale application submit and admin approval/rejection
   - Buyer login, gated pricing, cart, checkout, order, and invoice flows
   - Shopify product sync
   - Stripe checkout webhook handling
   - Resend email delivery
   - AI agent run with safety limits enabled
7. Build before release:

```bash
npm run build
```
