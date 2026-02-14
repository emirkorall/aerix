# AERIX — Handoff / Current State

## Project
- Next.js 16 (App Router) + Tailwind
- Rocket League community app
- Goal: monetizable MVP (auth + subscription + gated value)

## What’s Done
### Auth (Supabase)
- Magic link login working
- Logout working
- Protected routes redirect to /login
- Dashboard shows signed-in user info

### Data Sync (Supabase)
- `profiles` table exists and is created on login
- Cloud sync exists for:
  - completions (streak days)
  - session logs (notes, tags, duration)
  - rank snapshots

### Pricing / Plans
- Pricing page + plan detail pages exist
- Upgrade flow exists (route: /upgrade?plan=starter|pro)

### Stripe (in progress)
- Stripe Checkout route exists: POST /api/stripe/checkout
  - Returns 401 when not authenticated (expected)
- Stripe CLI installed
- Stripe CLI login flow started

## What’s Left Next (Priority)
### Stripe completion (must-do)
1) Add env vars (server-only, never commit):
   - STRIPE_WEBHOOK_SECRET=whsec_...
   - SUPABASE_SERVICE_ROLE_KEY=...
   - STRIPE_SECRET_KEY, STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO already set

2) Run local webhook forwarder:
   - stripe listen --forward-to localhost:3000/api/stripe/webhook

3) Implement webhook route:
   - app/api/stripe/webhook/route.ts
   - Verify signature using RAW body
   - Handle:
     - checkout.session.completed -> update profiles.plan to starter/pro + store stripe ids
     - customer.subscription.deleted -> set plan back to free

4) Ensure checkout route stores stripe_customer_id on the current user’s profile before redirect (deterministic webhook matching).

5) Real plan gating:
   - Signed-in users: ignore ?plan preview; use profiles.plan
   - free: locked previews
   - starter: starter unlocked, pro locked
   - pro: everything unlocked
   - Apply to /training and /progress

6) UX confirmation:
   - Dashboard shows “Plan: Free/Starter/Pro”
   - /upgrade/success shows “Activating your plan…” + link to dashboard

## Commands
- Dev: npm run dev
- Stripe webhook forwarding: stripe listen --forward-to localhost:3000/api/stripe/webhook

## Notes
- Do not paste or commit secrets
- Keep MVP simple, minimal refactors
