import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
};

export function getPriceId(plan: string): string | null {
  return PRICE_MAP[plan] ?? null;
}

/** Reverse lookup: price ID → plan name (e.g. "starter" | "pro"). */
export function getPlanFromPriceId(priceId: string): string | null {
  for (const [plan, id] of Object.entries(PRICE_MAP)) {
    if (id === priceId) return plan;
  }
  return null;
}
