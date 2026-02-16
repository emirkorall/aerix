import Stripe from "stripe";
import { serverEnv } from "@/src/lib/env";

export const stripe = new Stripe(serverEnv.stripeSecretKey, {
  typescript: true,
});

const PRICE_MAP: Record<string, string> = {
  starter: serverEnv.stripePriceStarter,
  pro: serverEnv.stripePricePro,
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
