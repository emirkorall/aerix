import { createClient } from "@/src/lib/supabase/client";

/** Safe chars: no 0/o/l/1 to avoid confusion. */
const CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

function generateCode(len = 8): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => CHARS[b % CHARS.length]).join("");
}

/**
 * Ensure the current user has a referral_code.
 * If missing, generate one and persist it. Returns the code.
 */
export async function ensureReferralCode(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    if (data?.referral_code) return data.referral_code;

    // Generate with retry on collision
    for (let i = 0; i < 5; i++) {
      const code = generateCode();
      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: code })
        .eq("id", user.id);

      if (!error) return code;
      // 23505 = unique violation → retry
      if (error.code !== "23505") return null;
    }

    return null;
  } catch {
    return null;
  }
}
