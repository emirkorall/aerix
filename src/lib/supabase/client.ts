import { createBrowserClient } from "@supabase/ssr";
import { validateSupabaseEnv } from "./validate";

export function createClient() {
  const { url, anonKey } = validateSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
