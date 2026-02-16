import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv, publicEnv } from "@/src/lib/env";

/**
 * Supabase admin client using the service role key.
 * Server-only — never import this in client code.
 */
export function createAdminClient() {
  return createSupabaseClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
