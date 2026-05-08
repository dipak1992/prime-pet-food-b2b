# Prime Pet Food — Complete Platform Audit & AI Strategy
**Prepared after full codebase review | May 2026**

---

## 1. EXECUTIVE SUMMARY

### Biggest Strengths
- **Solid B2B foundation**: The platform has a complete wholesale workflow — gated pricing, application approval, case-pack ordering, invoice flow, and reorder mechanics. This is more than most early-stage wholesale portals have.
- **Outreach system is genuinely differentiated**: OpenStreetMap-based pet store finder, AI email generation (GPT-4o-mini), 5-step follow-up sequences, lead scoring, intent-based search, and CRM pipeline — this is a real competitive moat for a small brand.
- **Reorder infrastructure exists**: Cron-based reorder reminders, `ReorderLastButton`, quick-order page, and admin reorder candidates view are all built. The bones are there.
- **Tech stack is modern and scalable**: Next.js 16, Prisma + PostgreSQL (Supabase), Resend email, Stripe, Shopify sync, OpenAI — all production-grade choices.
- **Customer tier system**: BRONZE/SILVER/GOLD tiers and per-customer price overrides exist in the schema — ready for loyalty mechanics.

### Biggest Weaknesses
- **No public landing page** (`/` route not found in codebase). The entry point for cold traffic is missing or not audited — this is a critical conversion gap.
- **Reorder reminder is a blunt instrument**: The cron fires a single generic email to anyone 30+ days inactive. No personalization by product, no urgency signal, no AI-driven timing.
- **Admin reorder action is a stub**: The "Send Reminder" button in [`AdminReordersPage`](src/app/(admin)/admin/reorders/page.tsx:34) calls `window.alert()` — it does nothing in production.
- **No AI in the buyer experience**: All AI is admin-side (email generation). Buyers get zero intelligent assistance — no recommendations, no reorder suggestions, no smart support.
- **Analytics are shallow**: The analytics page shows counts and totals. No cohort analysis, no churn signals, no revenue trends, no product velocity data.
- **Support system is disconnected**: The support/quote flow routes everything through `SupportRequest` but there's no admin notification, no SLA tracking, no AI triage.
- **Application approval is fully manual**: No auto-qualification, no AI scoring of applications, no priority queue for high-value applicants.

### Biggest Revenue Opportunities
1. **AI-powered reorder reminders** — personalized, timed to each buyer's actual purchase cycle (not a flat 30 days)
2. **AI application qualifier** — auto-score and fast-track high-value applicants to reduce approval lag
3. **AI bundle recommender** — suggest starter packs and replenishment bundles based on business type and order history
4. **AI support triage** — auto-respond to common questions, qualify quote requests before admin review
5. **Outreach conversion tracking** — currently no way to know if an outreach email led to an application

### Biggest Conversion Leaks
- Cold traffic has no clear landing page with social proof, product photos, or testimonials
- Wholesale application has no real-time qualification feedback (applicants don't know if they'll be approved)
- After order submission, buyers wait in silence — no estimated timeline, no proactive status updates
- The quote/sample request form goes into a black hole (no auto-acknowledgment, no SLA)
- Reorder reminder emails are generic — no product-specific urgency, no "you're running low" intelligence

---

## 2. FULL PRODUCT AUDIT

### 2.1 Public Landing Experience

**What exists**: [`/wholesale`](src/app/(public)/wholesale/page.tsx) page and [`/apply`](src/app/(public)/apply/page.tsx) form. A public catalog preview at `/catalog`. No root `/` landing page found in the codebase.

**Strengths**:
- Clean, professional design with brand colors
- Clear value props: protected pricing, case-pack ordering, invoice workflow, reorder speed
- "Who this is for" section targets the right buyer types
- 4-step ordering process explained clearly
- Application form is well-structured with business type selector and monthly estimate

**Weaknesses**:
- **No social proof**: Zero testimonials, no "X stores carry our products," no star ratings, no logos of existing retail partners
- **No product photography on public pages**: Buyers can't see what they're applying to sell
- **No urgency or scarcity signals**: Nothing that creates FOMO or time pressure to apply
- **No FAQ section**: Common objections (MOQ, payment terms, shipping times, sample availability) are not addressed
- **No live chat or instant contact option**: A prospect who has a question must apply or leave
- **Missing root `/` page**: If this is the primary domain, there's no homepage to capture cold traffic from Google, Instagram, or referrals
- **CTA is singular**: Only "Apply for wholesale pricing" — no secondary CTA for prospects who aren't ready (e.g., "Download our product catalog")
- **No trust badges**: No certifications, no "all-natural" claims with backing, no ingredient transparency

**Conversion Score: 5/10** — The page explains the program well but does nothing to build trust or handle objections.

---

### 2.2 Wholesale Application Flow

**What exists**: [`/apply`](src/app/(public)/apply/page.tsx) — a single-page form with Zod validation, submitted to [`/api/wholesale-applications`](src/app/api/wholesale-applications/route.ts).

**Strengths**:
- Clean 2-column layout, good field organization
- Business type selector covers all target segments
- Monthly estimate field helps admin prioritize
- Resale certificate URL field shows B2B sophistication
- "Takes about 2 minutes" sets expectations

**Weaknesses**:
- **No real-time qualification feedback**: Applicant submits and waits. A high-value distributor gets the same experience as a low-fit applicant.
- **No duplicate detection on submission**: Someone can apply multiple times with the same email
- **No auto-acknowledgment email**: After submission, the applicant gets a green banner but no email confirmation with next steps
- **Admin approval is fully manual**: No scoring, no priority queue, no auto-approval for obvious fits
- **Missing fields that would help qualification**: Number of locations, current dog treat brands carried, Instagram/social handle, monthly foot traffic estimate
- **No "what happens next" clarity**: The success message says "usually within 1 business day" but doesn't explain what approval looks like

**Conversion Score: 6/10** — Functional but leaves high-value applicants in the dark.

---

### 2.3 Buyer Dashboard

**What exists**: [`/dashboard`](src/app/(portal)/dashboard/page.tsx) — stats, quick actions, reorder module, open cart, invoice status, recent order.

**Strengths**:
- Clean layout with actionable quick links
- Reorder module with `ReorderLastButton` is excellent UX
- Invoice status widget surfaces payment urgency
- Open cart reminder prevents abandoned carts
- Server-side rendering with parallel data fetching is fast

**Weaknesses**:
- **No personalized greeting or business context**: Just "Welcome back" — no business name, no tier badge, no account health signal
- **No "what to do next" intelligence**: The dashboard doesn't tell a buyer "You haven't ordered in 45 days" or "Your last order of X may be running low"
- **No product recommendations**: No "Customers like you also order..." or "New products since your last visit"
- **No account tier visibility**: BRONZE/SILVER/GOLD tiers exist in the schema but are never surfaced to buyers
- **No spending progress toward free shipping or tier upgrade**: Buyers don't know how close they are to GOLD tier
- **Stats are backward-looking only**: "Total orders: 12" is not actionable. "You're due for a reorder in ~5 days" is.

**Usability Score: 7/10** — Solid foundation, but passive. Needs to become proactive.

---

### 2.4 Product Catalog

**What exists**: [`/products`](src/app/(portal)/products/page.tsx) — grid view with search, sort, add-to-cart. [`/quick-order`](src/app/(portal)/quick-order/page.tsx) — table view for fast SKU entry.

**Strengths**:
- Excellent pricing transparency: wholesale price, MSRP, margin %, case cost, gross profit per case — all shown
- Case-pack aware cart (MOQ enforcement)
- Best seller badge
- Low stock indicator
- Quick order page is genuinely excellent for repeat buyers — spreadsheet-style entry is exactly what B2B buyers want
- Mobile-responsive with separate card layout

**Weaknesses**:
- **No category filtering**: Only search and sort. With more SKUs, this becomes a problem.
- **No "previously ordered" filter**: Buyers can't quickly find products they've bought before
- **No bundle suggestions on product pages**: No "Frequently ordered together" or "Complete your assortment"
- **No inventory quantity shown**: Only "LOW_STOCK" badge — buyers can't see actual stock levels to plan orders
- **Add to cart defaults to MOQ**: Good for compliance, but doesn't allow buyers to explore before committing
- **No product detail page linked from catalog**: There's a `/products/[id]` route but the catalog doesn't link to it
- **Favorites exist in schema but aren't surfaced prominently**: The `/favorites` page exists but there's no "Save for later" CTA on product cards

**Catalog Score: 7/10** — Pricing presentation is excellent. Navigation and discovery need work.

---

### 2.5 Cart + Order Request Flow

**What exists**: [`/cart`](src/app/(portal)/cart/page.tsx) → [`/checkout`](src/app/(portal)/checkout/page.tsx) → order submitted to admin.

**Strengths**:
- Free shipping progress bar is excellent UX — creates natural upsell pressure
- Case-pack quantity controls (+ Case / − Case) are exactly right for wholesale
- Order summary sidebar on checkout
- PO number field is a professional B2B touch
- Clear "this is an order request, not a payment" messaging reduces confusion

**Weaknesses**:
- **Checkout requires re-entering shipping address every time**: No saved addresses pre-populated from account
- **No estimated fulfillment timeline**: After submitting, buyers don't know when to expect confirmation
- **No order confirmation email triggered automatically**: The email template exists (`order-confirmed`) but it's unclear if it fires on checkout
- **Terms checkbox has no link**: "wholesale terms and conditions" is bold text but not a link to actual terms
- **No upsell at cart**: No "Add X more to reach free shipping" with specific product suggestions
- **Billing address form is redundant for most buyers**: Most B2B buyers ship to their store address — the billing same as shipping checkbox is good but the form is still shown

**Cart Score: 7/10** — Functional and wholesale-appropriate. Missing post-submission communication.

---

### 2.6 Order Tracking Experience

**What exists**: [`/orders`](src/app/(portal)/orders/page.tsx) — list view with status badges and reorder button. [`/orders/[id]`](src/app/(portal)/orders/[id]/page.tsx) — detail view.

**Strengths**:
- Status colors are clear (PENDING/CONFIRMED/PACKED/SHIPPED/DELIVERED)
- Reorder button on every order is excellent for repeat business
- Order history is complete with items, totals, and dates

**Weaknesses**:
- **No tracking number display on the list view**: Buyers have to click into each order to find tracking
- **No proactive status update emails**: The `OrderStatusHistory` model exists but no email is triggered when status changes
- **No estimated delivery date**: Even a rough "typically ships in 2-3 business days" would reduce support tickets
- **No carrier integration**: Tracking URL exists in the schema but there's no auto-fetch of carrier status
- **Status history is stored but not shown to buyers**: The `OrderStatusHistory` model is populated but buyers can't see the timeline

**Tracking Score: 5/10** — Buyers are left to check manually. This creates support tickets and erodes trust.

---

### 2.7 Quote Request Flow

**What exists**: [`/quote`](src/app/(portal)/quote/page.tsx) — form for custom pricing, samples, or sales consultation. Routes to `SupportRequest` model.

**Strengths**:
- Three request types (custom pricing, sample, sales rep) are well-differentiated
- Monthly volume selector helps admin qualify the request
- Timeline field helps prioritize urgency
- Shipping ZIP for sample logistics

**Weaknesses**:
- **Quote requests go into the same `SupportRequest` bucket as general support**: No dedicated quote pipeline, no deal tracking
- **No auto-acknowledgment with expected response time**: Buyer submits and gets a green banner — no email confirmation
- **No admin notification when a quote is submitted**: Admin has to check the support queue manually
- **No qualification questions for sample requests**: Anyone can request samples — no minimum order commitment, no business verification
- **The "Talk to sales" option has no calendar booking**: No Calendly link, no phone number, no immediate next step
- **Quote requests are not linked to the lead/outreach system**: A buyer who submits a quote request should be tracked as a high-intent signal

**Quote Score: 4/10** — The form exists but the workflow behind it is broken. High-value requests fall into a black hole.

---

### 2.8 Admin Dashboard

**What exists**: [`/admin`](src/app/(admin)/admin/page.tsx) — KPI cards, task queue, recent orders, sync jobs. Full suite of admin pages.

**Strengths**:
- Task queue is excellent: shows pending applications, invoices needing action, overdue invoices, tracking gaps, open quotes, reorder candidates — all as clickable counts
- KPI cards (pending approvals, active orders, customers, revenue) are the right metrics
- Shopify product sync with job history
- Customer tier and price override system
- Applications review with approve/reject workflow

**Weaknesses**:
- **No revenue trend chart**: Just a total number — no 30-day trend, no MoM comparison
- **No customer health signals**: No "customers at risk of churning," no "top customers by LTV," no "new customers this month"
- **No lead-to-customer conversion tracking**: The outreach system and the customer system are siloed — no way to see "this customer came from outreach lead X"
- **No invoice aging report**: Just "overdue" count — no breakdown of 30/60/90 day aging
- **No product velocity report**: Which SKUs are selling fastest? Which are stagnant?
- **Reorder reminder button is a stub**: `window.alert()` in production — this is a critical bug
- **No bulk actions**: Can't approve multiple applications at once, can't send reminders to multiple customers

**Admin Score: 6/10** — Good operational visibility, weak strategic intelligence.

---

### 2.9 Outreach System

**What exists**: [`/admin/outreach`](src/app/(admin)/admin/outreach/page.tsx) — 5-tab system: dashboard, find leads (OpenStreetMap), pipeline CRM, intent leads, export/import. [`/admin/outreach/[id]`](src/app/(admin)/admin/outreach/[id]/page.tsx) — full lead detail with emails, activity, deals, samples, sequences.

**Strengths**:
- **This is genuinely impressive for a wholesale portal**: OpenStreetMap pet store finder, AI email generation with 3 variants (Curiosity/Value/Ultra-Short), 5-step follow-up sequences, lead scoring (HOT/WARM/COLD), intent-based search, CSV import/export
- Lead scoring algorithm considers email, phone, website, Instagram, dog treat sales, competitor products, ratings, and business type
- Per-lead deal tracking with value and status
- Sample tracking with shipping and feedback
- Sequence automation with cron-based sending
- Owner assignment with follow-up reminders

**Weaknesses**:
- **No conversion tracking**: When a lead applies for wholesale, there's no automatic link created between the lead and the application/customer record
- **Email sending requires copy-paste**: Generated emails are copied to clipboard — no direct send from the platform
- **No open/reply tracking**: No way to know if outreach emails were opened or replied to
- **Intent search relies on OpenAI web search**: Results quality is unpredictable — no structured data source
- **No A/B test tracking**: 3 email variants are generated but there's no way to track which variant performs better
- **Lead scoring is static**: Score is calculated at import time — doesn't update as the lead engages or as more data is gathered
- **No LinkedIn/social enrichment**: Leads from OpenStreetMap often have no email — no enrichment pipeline

**Outreach Score: 8/10** — Best feature in the platform. Needs conversion tracking and direct send.

---

### 2.10 Retention System

**What exists**: Cron job at [`/api/cron/reorder-reminders`](src/app/api/cron/reorder-reminders/route.ts) — fires daily, emails customers 30+ days inactive. Admin reorder candidates page. `ReorderLastButton` component.

**Strengths**:
- Cron architecture is correct — runs daily, deduplicates with a setting key
- Calculates average order interval per customer
- Suggests reorder date based on historical cadence
- Processes lead follow-up sequences in the same cron run (efficient)
- `ReorderLastButton` gives buyers one-click reorder from dashboard

**Weaknesses**:
- **30-day flat cutoff ignores individual buyer cadence**: A buyer who orders every 14 days should get a reminder at day 12, not day 30
- **Reminder email is generic**: "Your fast-moving items may be running low" — no specific products, no quantities, no urgency
- **Admin "Send Reminder" button is broken**: `window.alert()` — does nothing
- **No churn detection**: No signal for buyers who are trending toward inactivity before they hit 30 days
- **No win-back sequence**: After 60/90 days of inactivity, there's no escalating win-back campaign
- **No loyalty mechanics surfaced to buyers**: BRONZE/SILVER/GOLD tiers exist but buyers never see them or know how to advance
- **No post-delivery follow-up**: No "How was your order?" email, no NPS, no review request

**Retention Score: 5/10** — Infrastructure exists but execution is blunt and partially broken.

---

### 2.11 Mobile Experience

**What exists**: Responsive Tailwind CSS throughout. Quick order has separate mobile card layout. Cart and checkout are mobile-responsive.

**Strengths**:
- Quick order page has a dedicated mobile card layout (not just a shrunk table)
- Cart page is clean on mobile
- Application form is responsive

**Weaknesses**:
- **No mobile-optimized admin**: The admin dashboard with its wide tables is painful on mobile — admins checking orders on their phone will struggle
- **No push notifications**: No way to notify buyers of order status changes on mobile
- **Outreach pipeline table is not mobile-friendly**: The lead table with 7 columns doesn't work on small screens
- **No PWA/app-like experience**: No service worker, no "Add to Home Screen" prompt

**Mobile Score: 6/10** — Buyer portal is acceptable. Admin is not mobile-ready.

---

### 2.12 Overall Product Strategy

**Scalability**: The architecture is solid — Next.js App Router, Prisma, Supabase, Vercel deployment. Can handle 10x current load without changes.

**Differentiation**: The outreach system is a genuine differentiator. No other wholesale portal for a small pet food brand has this level of lead generation tooling built in.

**SaaS Potential**: High. The core platform (wholesale portal + outreach CRM + AI email generation) could be white-labeled for other specialty food brands, pet product brands, or any B2B brand selling through independent retailers.

**Defensibility**: The outreach system + customer data + order history creates a data moat. The longer the platform runs, the better the AI features become.

**Biggest Growth Opportunities**:
1. Fix the broken reorder reminder → immediate revenue recovery
2. Add AI application scoring → faster approval → faster first order
3. Add AI reorder prediction → personalized timing → higher reorder rate
4. Add outreach-to-customer conversion tracking → prove ROI of outreach → scale it

---

## 3. PUBLIC EXPERIENCE IMPROVEMENTS

### What to Add
- **Root `/` landing page** with hero image, product photos, social proof (store count, testimonials), and dual CTA (Apply / Preview Catalog)
- **FAQ section** on `/wholesale`: MOQ, payment terms, shipping times, sample policy, approval timeline
- **Social proof bar**: "Carried by 200+ independent pet stores" or similar
- **Product photography** on public pages — buyers need to see the product before applying
- **Video or GIF** of a dog chewing the product — highest-converting content for pet products
- **Calendly or contact link** for prospects who want to talk before applying
- **SEO meta tags** on all public pages (title, description, OG image)

### What to Remove
- The redundant "Review / Payment / Access" info cards on the apply page — this information is already on the wholesale page

### What to Simplify
- The application form could be a 2-step flow: Step 1 (business basics) → Step 2 (address + financials) — reduces abandonment
- The wholesale page "How ordering works" steps could be a visual timeline instead of text cards

---

## 4. BUYER EXPERIENCE IMPROVEMENTS

### Dashboard Improvements
- Show business name and tier badge prominently ("Welcome back, Paws & Claws Pet Shop — SILVER tier")
- Add "You haven't ordered in X days — your last order of [products] may be running low" banner when overdue
- Show tier progress: "Spend $X more this quarter to reach GOLD tier and unlock better pricing"
- Add "Recommended for you" section based on order history and business type
- Surface the favorites list on the dashboard

### Ordering Improvements
- Pre-populate shipping address from saved addresses on checkout
- Show estimated fulfillment timeline on checkout confirmation
- Send automatic order confirmation email on checkout submission
- Add "Customers in your category also order" suggestions on product pages
- Add category filter to product catalog
- Link product cards to detail pages

### Reorder Improvements
- Replace flat 30-day reminder with buyer-specific cadence reminders
- Show "Suggested reorder date" on the dashboard based on average order interval
- Add "Reorder" button to individual order items, not just the whole order
- Add "Low stock alert" subscription — notify buyer when a product they've ordered before goes LOW_STOCK

---

## 5. ADMIN DASHBOARD IMPROVEMENTS

### Workflow Optimizations
- **Fix the broken "Send Reminder" button** in the reorders page — wire it to the actual email API
- Add bulk approve/reject for applications
- Add one-click "Send invoice" from the orders list
- Add order status update with automatic email notification to buyer

### Missing Operational Tools
- **Invoice aging report**: 30/60/90 day buckets with customer names
- **Product velocity report**: Units sold per SKU per 30 days, trending up/down
- **Customer health dashboard**: LTV, last order date, order frequency, churn risk score
- **Lead-to-customer conversion report**: Which outreach leads became customers?
- **Revenue trend chart**: 30/60/90 day revenue with MoM comparison

### Automation Opportunities
- Auto-send order confirmation email when order status changes to CONFIRMED
- Auto-send tracking notification when tracking number is added
- Auto-flag overdue invoices for follow-up
- Auto-score wholesale applications on submission

---

## 6. OUTREACH SYSTEM IMPROVEMENTS

### Lead Generation Improvements
- Add Google Maps API as a fallback/supplement to OpenStreetMap (better coverage, more data)
- Add LinkedIn company search for distributors and regional chains
- Add "Find leads near existing customers" — geographic clustering
- Add Instagram handle scraping for pet stores (high-value signal)

### Personalization Improvements
- Wire email generation to use actual lead data (website, Instagram, dog treat brands carried) — not just business name and type
- Add "personalization score" to generated emails — flag emails that lack specific details
- Track which email variant (A/B/C) gets the best reply rate and auto-suggest the winner

### Conversion Tracking Improvements
- **Critical**: When a lead applies for wholesale, auto-link the application to the lead record
- Show "Converted" badge on leads who became customers
- Add "Time to conversion" metric to the outreach dashboard
- Track email open rates and reply rates (requires Resend webhook integration)

---

## 7. RETENTION SYSTEM IMPROVEMENTS

### Reorder Strategy
- Replace flat 30-day cron with **buyer-specific cadence**: if a buyer's average interval is 21 days, remind them at day 18
- Add **product-specific reorder reminders**: "You ordered 24 units of [SKU] on [date] — at typical sell-through, you may be running low"
- Add **urgency signals**: "LOW_STOCK on [product you ordered]" triggers immediate notification
- Fix the admin "Send Reminder" button — it must actually send the email

### Customer Recovery
- Add **win-back sequence**: 60 days inactive → email 1 (check-in), 75 days → email 2 (new products), 90 days → email 3 (special offer)
- Add **churn risk score** to admin customer list: buyers trending toward inactivity before they hit 30 days
- Add **post-delivery follow-up**: 7 days after DELIVERED status → "How was your order? Ready to restock?"

### Loyalty Mechanics
- **Surface the tier system to buyers**: Show BRONZE/SILVER/GOLD badge on dashboard and account page
- **Show tier benefits**: "GOLD tier buyers get net-30 terms and priority fulfillment"
- **Show progress to next tier**: "Spend $X more this quarter to reach SILVER"
- **Add milestone emails**: "Congratulations — you've reached GOLD tier!"

---

## 8. BEST AI AGENT FEATURES TO BUILD

---

### AI Feature 1: Smart Reorder Predictor + Personalized Reminder

**What it does**: Analyzes each buyer's order history (products, quantities, intervals) and predicts when they'll run out of each SKU. Sends a personalized email at the right time with the specific products and quantities to reorder.

**Why it matters**: The current system sends a generic email to anyone 30+ days inactive. A buyer who orders every 14 days gets reminded too late. A buyer who orders every 60 days gets reminded too early. Personalized timing + product-specific messaging dramatically increases reorder rate.

**Estimated Impact**: +20-35% reorder rate. This is the single highest-ROI AI feature for a repeat-purchase wholesale business.

**Complexity**: Medium. The order interval calculation already exists in [`/api/admin/reorders/route.ts`](src/app/api/admin/reorders/route.ts). The AI layer adds product-level prediction and email personalization.

**MVP Version**: 
- Use existing average interval per customer
- Generate personalized email with GPT-4o-mini: "Hi [Business], based on your order history, you typically restock [Product A] every 21 days. It's been 19 days — want to get ahead of it?"
- Replace the flat 30-day cron trigger with per-customer scheduled triggers

**Future Version**:
- ML model trained on order data to predict exact restock date per SKU
- Integrate with buyer's POS data (if available) for sell-through rate
- Dynamic quantity suggestions based on seasonal patterns
- "Your competitor down the street just restocked — don't fall behind" (competitive intelligence)

**Implementation Priority**: #1 — Build this first.

---

### AI Feature 2: AI Application Qualifier + Auto-Scorer

**What it does**: When a wholesale application is submitted, an AI agent scores it on 10+ signals (business type, monthly estimate, website quality, social presence, location, tax ID provided, notes quality) and assigns a priority score. High-score applications get fast-tracked; low-score applications get flagged for review.

**Why it matters**: Manual review of every application is a bottleneck. A pet store chain applying for $5,000/month should be approved in minutes, not hours. A low-quality application shouldn't consume the same admin time.

**Estimated Impact**: 40-60% reduction in approval time for high-value applicants. Faster approval = faster first order = faster revenue.

**Complexity**: Low-Medium. The application data is already structured. GPT-4o-mini can score it in under 1 second.

**MVP Version**:
- On application submission, call GPT-4o-mini with application data
- Generate a score (0-100) and a 2-sentence admin note: "High-priority: Pet store chain with 3 locations, $1,000+ monthly estimate, tax ID provided. Recommend immediate approval."
- Show score and note in the admin applications list
- Add "Auto-approve" button for applications scoring 80+

**Future Version**:
- Web scrape the applicant's website and Instagram to enrich the score
- Cross-reference with the outreach lead database (is this a lead we contacted?)
- Auto-approve applications above a configurable threshold
- Auto-send a personalized approval email with onboarding tips based on business type

**Implementation Priority**: #2 — High leverage, low complexity.

---

### AI Feature 3: AI Bundle Recommender

**What it does**: Analyzes a buyer's business type, order history, and catalog behavior to suggest the optimal product bundle. For new buyers, suggests a starter assortment based on their business type. For repeat buyers, suggests complementary SKUs they haven't tried.

**Why it matters**: Most wholesale buyers don't know the full catalog. They order what they know. An AI recommender surfaces products they'd sell well but haven't discovered. This increases average order value and product diversity.

**Estimated Impact**: +15-25% average order value. Distributors and multi-location stores are especially high-value targets.

**Complexity**: Low-Medium. The `Bundle` model already exists in the schema. The AI layer generates personalized bundle suggestions.

**MVP Version**:
- On the cart page, show "Buyers like you also order" with 2-3 product suggestions
- Use business type + order history as context for GPT-4o-mini
- Pre-generate bundles for each business type (pet store starter pack, groomer add-on pack, vet clinic pack)
- Show bundles prominently on the dashboard for new buyers

**Future Version**:
- Collaborative filtering: "Stores with similar order patterns also buy X"
- Seasonal bundle suggestions: "Holiday gift set bundle — high margin, high sell-through"
- "Complete your assortment" — detect gaps in a buyer's SKU mix and suggest fills
- Bundle discount mechanics: "Order this bundle and save 5%"

**Implementation Priority**: #3 — Increases AOV with minimal friction.

---

### AI Feature 4: AI Support Triage + Auto-Responder

**What it does**: When a support ticket or quote request is submitted, an AI agent classifies it, generates an instant acknowledgment with relevant information, and routes it to the right admin workflow. For common questions (MOQ, payment terms, shipping times), it answers automatically.

**Why it matters**: The current support flow is a black hole — buyers submit and wait. An AI that responds in seconds with useful information builds trust and reduces admin load. Quote requests that get an instant "We'll have a custom quote for you within 4 hours" convert better than silence.

**Estimated Impact**: 50-70% reduction in support response time. Improved buyer satisfaction. Fewer abandoned quote requests.

**Complexity**: Low. The support ticket model exists. GPT-4o-mini can classify and respond.

**MVP Version**:
- On ticket submission, classify the type (shipping question, payment question, product question, quote request, sample request)
- For common questions, generate an instant auto-response with the answer
- For quote requests, send an acknowledgment with expected response time and a link to the catalog
- Notify the admin with a priority score and suggested response

**Future Version**:
- Full AI chat widget on the buyer portal: "Ask me anything about your order or our products"
- Integration with order data: "Your order #1234 is currently PACKED and will ship tomorrow"
- Proactive support: detect buyers who haven't logged in after approval and send a "Need help getting started?" message
- Voice support: AI phone agent that can answer common questions and take reorder requests

**Implementation Priority**: #4 — High buyer satisfaction impact, moderate revenue impact.

---

### AI Feature 5: AI Outreach Conversion Tracker + Lead Intelligence

**What it does**: Automatically links outreach leads to wholesale applications and customer records. Tracks the full funnel: lead found → email sent → application submitted → approved → first order → LTV. Surfaces which outreach tactics, email variants, and lead types convert best.

**Why it matters**: Currently, the outreach system and the customer system are completely siloed. You can't prove that your outreach is generating revenue. This feature closes the loop and lets you double down on what works.

**Estimated Impact**: Enables data-driven outreach scaling. If you know that "groomer" leads convert at 15% and "vet clinic" leads convert at 5%, you focus on groomers. This could 2-3x outreach ROI.

**Complexity**: Medium. Requires email matching (lead email = application email) and a conversion event pipeline.

**MVP Version**:
- On application submission, check if the applicant's email matches any lead in the outreach database
- If match found, auto-link the application to the lead and update lead status to "CONVERTED"
- Add a "Source" field to the customer record: ORGANIC / OUTREACH / REFERRAL
- Show conversion rate by lead type on the outreach dashboard

**Future Version**:
- Track email open rates via Resend webhooks — update lead temperature when emails are opened
- Track reply rates — auto-advance lead status when a reply is detected
- Show full attribution: "This customer was found via OpenStreetMap search, contacted with Variant B email, replied on day 3, applied on day 8, placed first order of $847 on day 15"
- AI-generated outreach performance report: "Your groomer outreach is converting at 18% — 3x better than your vet clinic outreach. Recommend shifting 70% of effort to groomers."

**Implementation Priority**: #5 — Strategic intelligence that compounds over time.

---

### AI Feature 6: AI Sales Copilot for Admin

**What it does**: An AI assistant embedded in the admin dashboard that answers operational questions in natural language. "Which customers haven't ordered in 45 days?" "What's my best-selling SKU this month?" "Which leads should I follow up with today?" "Draft a custom pricing proposal for Paws & Claws Pet Shop."

**Why it matters**: The admin currently has to navigate multiple pages to get answers. An AI copilot surfaces insights instantly and reduces the cognitive load of running the business.

**Estimated Impact**: 30-50% reduction in time spent on operational decisions. Enables a solo founder to manage 10x more customers.

**Complexity**: Medium-High. Requires a natural language → database query layer (text-to-SQL or structured tool calls).

**MVP Version**:
- A simple chat interface in the admin sidebar
- Pre-built "quick questions": "Show reorder candidates," "Show overdue invoices," "Show hot leads"
- GPT-4o with function calling to query the database based on natural language
- Answers rendered as formatted tables or summaries

**Future Version**:
- Proactive daily briefing: "Good morning. You have 3 pending applications, 2 overdue invoices, and 5 customers due for reorder. Here's what I recommend you do first."
- Draft emails, invoices, and follow-up messages from natural language prompts
- Anomaly detection: "Revenue is down 23% vs last month — here's what changed"
- Competitive intelligence: "3 new pet stores opened in Denver this week — want me to add them to your pipeline?"

**Implementation Priority**: #6 — High founder leverage, medium complexity.

---

### AI Feature 7: AI Churn Predictor

**What it does**: Monitors buyer behavior signals (login frequency, order frequency trend, support ticket volume, invoice payment delays) and assigns a churn risk score. Flags at-risk buyers before they go 30 days inactive.

**Why it matters**: The current system only detects churn after it happens (30+ days inactive). An AI that detects the warning signs 2-3 weeks earlier gives you time to intervene with a personal outreach, a special offer, or a check-in call.

**Estimated Impact**: Preventing 1 churned customer per month who would have spent $500/month = $6,000/year recovered per customer.

**Complexity**: Medium. Requires behavioral signal tracking and a scoring model.

**MVP Version**:
- Calculate a simple churn risk score: days since last order / average order interval
- Flag buyers where ratio > 0.8 (approaching their typical reorder window)
- Show "At Risk" badge on the admin customer list
- Trigger a personal outreach email from the admin when a buyer hits the threshold

**Future Version**:
- ML model trained on historical churn data
- Multi-signal scoring: order frequency + login frequency + support tickets + payment delays
- Automated intervention sequences: at-risk buyer gets a personal email from the founder, not a generic reminder
- "Save" tracking: measure how many at-risk buyers were recovered by intervention

**Implementation Priority**: #7 — Important for retention at scale.

---

### AI Feature 8: AI Quote Generator

**What it does**: When a buyer submits a custom pricing or volume quote request, an AI agent generates a draft quote proposal for the admin to review and send. The proposal includes suggested pricing based on volume tier, recommended SKU mix based on business type, and a personalized cover note.

**Why it matters**: Custom quote requests currently go into a black hole. An AI that generates a draft quote in seconds means the admin can respond in minutes instead of hours. Faster quotes = higher conversion.

**Estimated Impact**: 60-80% reduction in quote response time. Higher quote-to-order conversion rate.

**Complexity**: Low-Medium. The quote request data is already structured. GPT-4o-mini can generate the proposal.

**MVP Version**:
- On quote request submission, generate a draft proposal with: suggested pricing (based on volume), recommended starter SKU mix (based on business type), payment terms, and a personalized cover note
- Show the draft in the admin support queue for review and one-click send
- Auto-acknowledge the buyer with: "We've received your quote request and will have a proposal for you within 2 hours"

**Future Version**:
- Dynamic pricing engine: AI suggests optimal pricing based on buyer LTV potential, competitive landscape, and margin targets
- Quote tracking: know when the buyer opens the quote, follow up automatically if not responded to in 24 hours
- E-signature integration: buyer can accept the quote digitally

**Implementation Priority**: #8 — High conversion impact for large orders.

---

## 9. TOP 5 AI FEATURES TO BUILD FIRST

Ranked by ROI × Simplicity × Revenue Impact:

### Rank 1: AI Smart Reorder Predictor + Personalized Reminder
- **Why first**: Highest direct revenue impact. The infrastructure (cron, order history, email) already exists. This is a 2-3 day build that could increase reorder rate by 20-35%.
- **Quick win**: Fix the broken `window.alert()` in the admin reorders page first (30 minutes), then build the personalized email generation (2 days).
- **Expected monthly revenue lift**: $500-2,000 depending on customer base size.

### Rank 2: AI Application Qualifier + Auto-Scorer
- **Why second**: Reduces approval lag for high-value applicants. Faster approval = faster first order. Low complexity — the application data is already structured.
- **Quick win**: Add a GPT-4o-mini scoring call to the application submission API. Show score in admin applications list.
- **Expected impact**: 40-60% faster approval for high-score applicants.

### Rank 3: AI Bundle Recommender (Buyer-Facing)
- **Why third**: Increases average order value with zero friction. The `Bundle` model already exists in the schema. The AI layer is a single API call.
- **Quick win**: Add "Recommended for your business type" section to the buyer dashboard with 3 pre-generated bundles.
- **Expected AOV lift**: +15-25%.

### Rank 4: AI Outreach Conversion Tracker
- **Why fourth**: Closes the most important strategic loop — proving outreach ROI. Enables data-driven scaling of the best-performing outreach tactics.
- **Quick win**: Add email matching on application submission (1 day build). Show conversion rate on outreach dashboard.
- **Expected impact**: 2-3x outreach ROI through better targeting.

### Rank 5: AI Support Triage + Auto-Responder
- **Why fifth**: Eliminates the "black hole" problem for quote requests and support tickets. Builds buyer trust. Reduces admin load.
- **Quick win**: Add auto-acknowledgment email with expected response time on ticket submission (1 day build).
- **Expected impact**: 50-70% reduction in support response time.

---

## 10. AI FEATURES TO AVOID FOR NOW

### AI Voice/Call Support
- **Why avoid**: Too early. Your customer base is small enough that personal calls are a competitive advantage, not a bottleneck. AI voice support adds complexity without meaningful ROI at this stage.
- **Revisit when**: You have 100+ active buyers and are fielding 20+ support calls per week.

### AI Demand Forecasting / Inventory Optimization
- **Why avoid**: You're a single-product category brand with limited SKUs. Demand forecasting requires significant historical data and adds operational complexity. Your current inventory challenge is sell-through at the retailer level, not your own inventory management.
- **Revisit when**: You have 50+ SKUs and are managing complex inventory across multiple warehouses.

### AI Pricing Optimization (Dynamic Pricing)
- **Why avoid**: B2B wholesale buyers expect price stability. Dynamic pricing erodes trust and creates confusion. The per-customer price override system already handles custom pricing needs.
- **Revisit when**: You have enough data to model price elasticity by customer segment.

### AI Social Media Content Generator
- **Why avoid**: Not a core business workflow. Generic AI content tools (ChatGPT, Claude) already handle this better than a custom integration. Not worth building into the platform.

### AI Chatbot on Public Landing Page
- **Why avoid**: Your public pages need better copy and social proof first. A chatbot on a weak landing page doesn't fix the underlying conversion problem. Fix the page first.
- **Revisit when**: You have a strong landing page and are getting significant traffic that needs qualification.

### AI Competitor Price Monitoring
- **Why avoid**: Himalayan yak chews are a niche product with limited direct competitors at the wholesale level. The competitive dynamic is more about product quality and relationships than price. Not worth the complexity.

---

## 11. PHASED AI ROADMAP

### Phase 1: Immediate (Next 30 Days) — Fix What's Broken + Quick Wins

**Week 1 — Critical Fixes**:
1. Fix `window.alert()` in admin reorders page → wire to actual email API (30 min)
2. Add auto-acknowledgment email on quote/support ticket submission (1 day)
3. Add order confirmation email trigger on checkout submission (2 hours)
4. Add order status change email notifications (1 day)

**Week 2-3 — AI Reorder Predictor MVP**:
1. Replace flat 30-day cron with per-customer cadence calculation
2. Add GPT-4o-mini personalized email generation to reorder cron
3. Include specific products and quantities in reminder emails
4. Test with 5 real customers before full rollout

**Week 4 — AI Application Scorer**:
1. Add scoring call to application submission API
2. Display score and AI summary in admin applications list
3. Add "High Priority" badge for applications scoring 80+

**Phase 1 Expected Outcome**: +15-25% reorder rate, 40% faster application approval, zero broken admin features.

---

### Phase 2: Growth (30-90 Days) — Buyer Intelligence + Outreach Closing the Loop

**Month 2**:
1. AI Bundle Recommender on buyer dashboard (business-type-based starter packs)
2. Outreach conversion tracking (email matching on application submission)
3. Tier system surfaced to buyers (dashboard badge, progress bar)
4. Saved shipping addresses on checkout

**Month 3**:
1. AI Support Triage + auto-responder for common questions
2. Churn risk score on admin customer list
3. Product velocity report in analytics
4. "Previously ordered" filter on product catalog
5. Win-back email sequence for 60/90-day inactive buyers

**Phase 2 Expected Outcome**: +20% AOV from bundles, outreach ROI proven and scalable, buyer satisfaction measurably improved.

---

### Phase 3: Scale (90-180 Days) — Intelligence Layer + SaaS Foundation

**Month 4-5**:
1. AI Sales Copilot in admin dashboard (natural language queries)
2. AI Quote Generator for custom pricing requests
3. Full outreach attribution dashboard (lead source → LTV)
4. AI-powered lead enrichment (website scraping, Instagram data)
5. Email open/reply tracking via Resend webhooks

**Month 6**:
1. Proactive admin daily briefing (AI-generated morning summary)
2. Buyer-facing AI chat widget ("Ask about your order or our products")
3. Seasonal bundle suggestions with AI-generated copy
4. SaaS packaging: white-label the platform for other specialty food brands

**Phase 3 Expected Outcome**: Platform becomes a defensible AI-powered wholesale OS. SaaS revenue potential unlocked.

---

## 12. LONG-TERM SAAS OPPORTUNITY

### How This Evolves into SaaS

The Prime Pet Food wholesale portal is already 80% of a white-label B2B wholesale platform. The core infrastructure — gated pricing, application approval, case-pack ordering, invoice workflow, outreach CRM, AI email generation, reorder automation — is generic enough to serve any specialty food or consumer goods brand selling through independent retailers.

**Target SaaS customers**:
- Specialty food brands (hot sauce, jerky, granola, coffee) selling to independent grocery and specialty stores
- Pet product brands (supplements, toys, accessories) selling to pet stores
- Natural beauty brands selling to boutiques and salons
- Any brand with 20-500 wholesale accounts that currently manages everything in spreadsheets and email

**Pricing model**:
- Starter: $99/month — up to 50 buyers, basic outreach tools
- Growth: $299/month — up to 200 buyers, AI reorder reminders, AI email generation
- Scale: $799/month — unlimited buyers, full AI suite, white-label domain

**Revenue potential**: 100 customers at $299/month = $29,900 MRR = $358,800 ARR

### Strongest Differentiators

1. **Outreach CRM built for wholesale**: No other wholesale platform has a built-in lead finder, AI email generator, and follow-up sequence system. This is the #1 differentiator.

2. **AI reorder intelligence**: Personalized reorder reminders based on individual buyer cadence is a feature that enterprise platforms charge $500+/month for. You'd be offering it at $99/month.

3. **Case-pack aware ordering**: Most generic B2B platforms don't understand MOQ and case-pack rules natively. This is a real pain point for wholesale operators.

4. **Invoice-first workflow**: The ACH/invoice workflow is exactly how most small wholesale businesses operate. Stripe-first platforms force a workflow that doesn't match reality.

### Moat Opportunities

- **Data moat**: The longer the platform runs, the better the AI features become. Reorder prediction improves with more order history. Lead scoring improves with more conversion data.
- **Network effects**: As more brands use the platform, the outreach database (pet stores, groomers, vets) becomes more valuable and more accurate.
- **Switching costs**: Once a brand's buyers are onboarded and have order history in the platform, switching is painful. This creates high retention.
- **Vertical depth**: Going deep on pet products (breed-specific recommendations, vet approval workflows, NASC compliance) creates a moat that horizontal platforms can't easily replicate.

---

## 13. FINAL VERDICT

### How Strong Is This Business?

**Stronger than it looks from the outside.** Most small wholesale brands are managing buyers via email, spreadsheets, and QuickBooks. Prime Pet Food has a purpose-built portal with features that most brands don't get until they're doing $5M+ in revenue. The outreach system alone is a genuine competitive advantage.

**The product is ahead of the revenue.** The platform has more capability than is currently being utilized. The reorder system exists but is broken. The tier system exists but is invisible. The bundle system exists but is unused. The biggest opportunity is activating what's already built.

### What Is Missing?

1. **A public homepage** — the most critical missing piece for cold traffic conversion
2. **Proof that outreach generates revenue** — the conversion tracking gap
3. **Proactive buyer communication** — order status emails, reorder reminders that actually work, post-delivery follow-up
4. **Buyer-facing intelligence** — recommendations, tier visibility, reorder predictions
5. **Admin strategic intelligence** — revenue trends, churn signals, product velocity

### What Should Be Prioritized Immediately?

**This week (no AI required)**:
1. Fix the broken "Send Reminder" button in admin reorders
2. Add auto-acknowledgment email on quote/support submission
3. Add order status change email notifications
4. Build or activate the root `/` landing page

**This month (AI-powered)**:
1. AI Smart Reorder Predictor — replace the flat 30-day cron with personalized, product-specific reminders
2. AI Application Scorer — add scoring to the application submission flow
3. Surface the tier system to buyers on the dashboard

**This quarter**:
1. AI Bundle Recommender on buyer dashboard
2. Outreach conversion tracking
3. Churn risk scoring on admin customer list
4. Win-back email sequences

**The bottom line**: This is a well-built platform with real AI already in it. The gap is not technology — it's activation. The highest-ROI moves are fixing what's broken, personalizing what's generic, and closing the loop between outreach and revenue. Do those three things and this business has a clear path to $500K+ ARR and a credible SaaS story.

---

*Audit completed by AI code review of the full `prime-pet-wholesale-portal` codebase including all pages, API routes, database schema, lib utilities, and cron jobs.*