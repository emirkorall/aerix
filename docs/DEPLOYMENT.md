# AERIX — Deployment Guide

## Prerequisites

- Node.js 20+
- Supabase project (free tier works)
- Stripe account (test mode for staging)
- Vercel account

---

## 1. Supabase Setup

### Create project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy **Project URL** and **anon key** from Settings → API.
3. Copy **service_role key** (keep secret — server-only).

### Auth redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:** add both:
  - `https://your-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

### Email templates
Review Authentication → Email Templates. The default templates work, but customize sender name to "AERIX" for branding.

### Run migrations
Open Supabase Dashboard → SQL Editor and run each migration file in order:

1. `docs/onboarding-migration.sql`
2. `docs/goal-migration.sql`
3. `docs/trial-migration.sql`
4. `docs/reminders-migration.sql`
5. `docs/matchmaking-migration.sql`
6. `docs/moderation-migration.sql`
7. `docs/unread-migration.sql`
8. `docs/request-to-play-migration.sql`
9. `docs/packs-progress-migration.sql`
10. `docs/public-profile-migration.sql`
11. `docs/referrals-migration.sql`

All use `IF NOT EXISTS` / `CREATE OR REPLACE`, so re-running is safe.

---

## 2. Stripe Setup

### Create products & prices
1. In Stripe Dashboard → Products, create **Starter** and **Pro** products.
2. Add a recurring price to each (monthly).
3. Copy the `price_xxx` IDs for env vars.

### Webhook (production)
1. Go to Stripe Dashboard → Developers → Webhooks.
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy the **webhook signing secret** (`whsec_...`).

### Webhook (local dev)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## 3. Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Fill in all values. Validate with:

```bash
npm run check:env
```

### Required variables

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Service role key (secret) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys | Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks | Signing secret |
| `STRIPE_PRICE_STARTER` | Stripe → Products | Starter price ID |
| `STRIPE_PRICE_PRO` | Stripe → Products | Pro price ID |
| `NEXT_PUBLIC_SITE_URL` | Your domain | e.g. `https://aerix.gg` |

---

## 4. Vercel Deployment

### Connect repo
1. Import repo in [vercel.com](https://vercel.com).
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `npm run build` (default).

### Set environment variables
In Vercel → Project Settings → Environment Variables:
- Add all variables from the table above.
- Use **Production** scope for live keys.
- Use **Preview** scope for test/staging keys.
- `NEXT_PUBLIC_SITE_URL` should be your production domain for Production, and `https://<branch>-<project>.vercel.app` for Preview.

### Deploy
Push to `main` to trigger production deploy. Preview deploys happen on PRs automatically.

---

## 5. Post-Deploy Smoke Checklist

After deploying, manually verify:

- [ ] Homepage loads (`/`)
- [ ] Sign up / Sign in works (`/login`)
- [ ] Onboarding flow completes (`/onboarding`)
- [ ] Dashboard loads with streak + weekly goal (`/dashboard`)
- [ ] Training session works (`/training`)
- [ ] Library page loads (`/library`)
- [ ] Training Packs page loads (`/packs`)
- [ ] Pricing page shows plans (`/pricing`)
- [ ] Stripe checkout redirects correctly
- [ ] Stripe portal (manage subscription) works
- [ ] Matchmaking post creation works (`/matchmaking`)
- [ ] Messages / inbox loads (`/messages`)
- [ ] Public profile not-found page works (`/u/nonexistent`)
- [ ] Invite page shows referral code (`/invite`)
- [ ] Season updates page loads (`/updates`)
- [ ] Settings page saves preferences (`/settings`)

---

## Troubleshooting

**Build fails with "Missing required environment variable"**
→ Ensure all env vars are set in Vercel project settings. Check both Production and Preview scopes.

**Stripe webhook returns 400**
→ Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint in Stripe Dashboard. For local dev, use `stripe listen` and the printed secret.

**Auth redirect loops**
→ Check Supabase Auth redirect URLs include your exact domain (with `https://`). Ensure `NEXT_PUBLIC_SITE_URL` matches.

**"Supabase not configured" on dashboard**
→ `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing or set to a placeholder value.
