import { createClient } from "./client";

/** Fetch current user's public profile settings. */
export async function fetchPublicProfileSettings(): Promise<{
  username: string | null;
  public_profile_enabled: boolean;
} | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("username, public_profile_enabled")
      .eq("id", user.id)
      .single();

    return data ?? { username: null, public_profile_enabled: false };
  } catch {
    return null;
  }
}

/** Save username + enabled flag. Returns error message if username taken. */
export async function savePublicProfile(
  username: string,
  enabled: boolean
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not signed in" };

    const { error } = await supabase
      .from("profiles")
      .update({
        username: enabled && username ? username : null,
        public_profile_enabled: enabled,
      })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "Username already taken." };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "Failed to save" };
  }
}

/** Sync streak + packs completed + consistency to profiles for public display. */
export async function syncProfileStats(
  currentStreak: number,
  packsCompletedCount: number,
  consistencyScore: number
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        current_streak: currentStreak,
        packs_completed_count: packsCompletedCount,
        consistency_score: consistencyScore,
      })
      .eq("id", user.id);
  } catch {
    // Non-blocking
  }
}
