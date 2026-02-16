/**
 * Lightweight env validation helpers.
 * Import serverEnv only in server code (API routes, server components).
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Public env vars (safe to expose to the browser). */
export const publicEnv = {
  get supabaseUrl() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
};

/** Server-only env vars. Never import in client components. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  },
  get stripeSecretKey() {
    return requireEnv("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return requireEnv("STRIPE_WEBHOOK_SECRET");
  },
  get stripePriceStarter() {
    return requireEnv("STRIPE_PRICE_STARTER");
  },
  get stripePricePro() {
    return requireEnv("STRIPE_PRICE_PRO");
  },
};
