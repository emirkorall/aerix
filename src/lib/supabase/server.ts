import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { validateSupabaseEnv } from "./validate";

export async function createClient() {
  const { url, anonKey } = validateSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — ignored when middleware
          // handles session refresh.
        }
      },
    },
  });
}
