import { createClient } from "./client";

/**
 * Merge localStorage completions with Supabase for the signed-in user.
 * Non-blocking — caller should fire-and-forget.
 */
export async function syncCompletions(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch remote completions
    const { data: rows } = await supabase
      .from("completions")
      .select("day")
      .eq("user_id", user.id);

    const remoteDays = new Set((rows ?? []).map((r: { day: string }) => r.day));

    // Read local completions
    const localMap = readLocalCompletions();
    const localDays = new Set(Object.keys(localMap));

    // Merge: union of both
    const merged = new Set([...remoteDays, ...localDays]);

    // Find days that are local-only → upsert to DB
    const toUpload: string[] = [];
    for (const day of localDays) {
      if (!remoteDays.has(day)) toUpload.push(day);
    }

    if (toUpload.length > 0) {
      await supabase.from("completions").upsert(
        toUpload.map((day) => ({ user_id: user.id, day })),
        { onConflict: "user_id,day" }
      );
    }

    // Write merged set back to localStorage
    const newMap: Record<string, true> = {};
    const sorted = [...merged].sort();
    for (const day of sorted) {
      newMap[day] = true;
    }
    localStorage.setItem("aerix.completions", JSON.stringify(newMap));

    // Keep legacy history key in sync
    localStorage.setItem("aerix.trainingHistory", JSON.stringify(sorted));
  } catch (err) {
    console.warn("[aerix] completion sync failed:", err);
  }
}

/**
 * Upsert a single day to Supabase (non-blocking).
 */
export async function upsertCompletionDay(day: string): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("completions")
      .upsert({ user_id: user.id, day }, { onConflict: "user_id,day" });
  } catch (err) {
    console.warn("[aerix] completion upsert failed:", err);
  }
}

function readLocalCompletions(): Record<string, true> {
  try {
    const raw = localStorage.getItem("aerix.completions");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
