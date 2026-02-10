const PLACEHOLDER_URLS = ["your-project-url"];
const PLACEHOLDER_KEYS = ["your-anon-key"];

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || PLACEHOLDER_URLS.includes(url)) return false;
  if (!/^https?:\/\//.test(url) || url.includes("....")) return false;
  if (!key || PLACEHOLDER_KEYS.includes(key)) return false;
  if (key.length < 30) return false;

  return true;
}

export function validateSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || PLACEHOLDER_URLS.includes(url)) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL is missing or still a placeholder. Set it in .env.local."
    );
  }
  if (!/^https?:\/\//.test(url) || url.includes("....")) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid URL (e.g. https://xyz.supabase.co). Set it in .env.local."
    );
  }
  if (!key || PLACEHOLDER_KEYS.includes(key)) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or still a placeholder. Set it in .env.local."
    );
  }
  if (key.length < 30) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short. Copy the full anon key from Supabase Dashboard."
    );
  }

  return { url, anonKey: key };
}
