import { createClient } from "./client";

export interface PackProgressRow {
  pack_id: string;
  completed_drill_ids: string[];
  last_started_at: string | null;
}

/** Fetch all pack progress rows for the current user. */
export async function getPackProgressMap(): Promise<
  Record<string, PackProgressRow>
> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};

    const { data } = await supabase
      .from("pack_progress")
      .select("pack_id, completed_drill_ids, last_started_at")
      .eq("user_id", user.id);

    const map: Record<string, PackProgressRow> = {};
    for (const row of data ?? []) {
      map[row.pack_id] = row;
    }
    return map;
  } catch {
    return {};
  }
}

/** Upsert pack progress — merges drill ids with existing remote data. */
export async function upsertPackProgress(
  packId: string,
  completedDrillIdsDelta: string[],
  started?: boolean
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("pack_progress")
      .select("completed_drill_ids")
      .eq("user_id", user.id)
      .eq("pack_id", packId)
      .single();

    const prev: string[] = existing?.completed_drill_ids ?? [];
    const merged = [...new Set([...prev, ...completedDrillIdsDelta])];

    const row: Record<string, unknown> = {
      user_id: user.id,
      pack_id: packId,
      completed_drill_ids: merged,
      updated_at: new Date().toISOString(),
    };
    if (started) {
      row.last_started_at = new Date().toISOString();
    }

    await supabase
      .from("pack_progress")
      .upsert(row, { onConflict: "user_id,pack_id" });
  } catch (err) {
    console.warn("[aerix] pack progress upsert failed:", err);
  }
}
