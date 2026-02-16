#!/usr/bin/env node

/**
 * Validates that all required environment variables are set.
 * Run: node scripts/check-env.mjs
 *
 * Reads from process.env (load .env.local yourself or run via dotenv).
 * On Vercel / CI, env vars are already injected.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if it exists (simple key=value, no multiline support)
try {
  const envPath = resolve(__dirname, "../.env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local may not exist (CI/Vercel)
}

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_PRO",
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("\n\x1b[31m✗ Missing required environment variables:\x1b[0m\n");
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error(
    "\nCopy .env.example to .env.local and fill in the values.\n"
  );
  process.exit(1);
} else {
  console.log("\x1b[32m✓ All required environment variables are set.\x1b[0m");
}
