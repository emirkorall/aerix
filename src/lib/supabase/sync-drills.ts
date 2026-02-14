import { createClient } from "./client";
import {
  getLocalSaves,
  setLocalSaves,
  getLocalQueue,
  setLocalQueue,
} from "@/src/lib/drill-library";

/**
 * Sync saved drills between localStorage and Supabase.
 * Merges both directions, then writes unified set back.
 */
export async function syncDrillSaves(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rows } = await supabase
      .from("user_drills")
      .select("drill_id")
      .eq("user_id", user.id)
      .eq("status", "saved");

    const remoteIds = new Set((rows ?? []).map((r: { drill_id: string }) => r.drill_id));
    const localIds = new Set(getLocalSaves());
    const merged = new Set([...remoteIds, ...localIds]);

    // Upload local-only
    const toUpload: string[] = [];
    for (const id of localIds) {
      if (!remoteIds.has(id)) toUpload.push(id);
    }
    if (toUpload.length > 0) {
      await supabase.from("user_drills").upsert(
        toUpload.map((drill_id) => ({
          user_id: user.id,
          drill_id,
          status: "saved" as const,
        })),
        { onConflict: "user_id,drill_id,status" }
      );
    }

    setLocalSaves([...merged]);
  } catch (err) {
    console.warn("[aerix] drill saves sync failed:", err);
  }
}

/**
 * Sync drill queue between localStorage and Supabase.
 */
export async function syncDrillQueue(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rows } = await supabase
      .from("user_drills")
      .select("drill_id, position")
      .eq("user_id", user.id)
      .eq("status", "queued")
      .order("position", { ascending: true });

    const remoteQueue = (rows ?? []).map((r: { drill_id: string }) => r.drill_id);
    const localQueue = getLocalQueue();

    // If remote has data, prefer it (source of truth). Otherwise push local up.
    if (remoteQueue.length > 0) {
      // Merge: keep remote order, append local-only items
      const remoteSet = new Set(remoteQueue);
      const merged = [...remoteQueue];
      for (const id of localQueue) {
        if (!remoteSet.has(id)) merged.push(id);
      }
      setLocalQueue(merged);

      // Upload any local-only
      const toUpload = localQueue.filter((id) => !remoteSet.has(id));
      if (toUpload.length > 0) {
        await supabase.from("user_drills").upsert(
          toUpload.map((drill_id, i) => ({
            user_id: user.id,
            drill_id,
            status: "queued" as const,
            position: remoteQueue.length + i,
          })),
          { onConflict: "user_id,drill_id,status" }
        );
      }
    } else if (localQueue.length > 0) {
      // Push local to remote
      await supabase.from("user_drills").upsert(
        localQueue.map((drill_id, i) => ({
          user_id: user.id,
          drill_id,
          status: "queued" as const,
          position: i,
        })),
        { onConflict: "user_id,drill_id,status" }
      );
    }
  } catch (err) {
    console.warn("[aerix] drill queue sync failed:", err);
  }
}

/** Save a drill to Supabase */
export async function upsertDrillSave(drillId: string): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_drills").upsert(
      { user_id: user.id, drill_id: drillId, status: "saved" },
      { onConflict: "user_id,drill_id,status" }
    );
  } catch (err) {
    console.warn("[aerix] drill save upsert failed:", err);
  }
}

/** Remove a saved drill from Supabase */
export async function deleteDrillSave(drillId: string): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_drills")
      .delete()
      .eq("user_id", user.id)
      .eq("drill_id", drillId)
      .eq("status", "saved");
  } catch (err) {
    console.warn("[aerix] drill save delete failed:", err);
  }
}

/** Replace the full queue in Supabase */
export async function replaceQueue(queue: string[]): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Delete existing queue
    await supabase
      .from("user_drills")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "queued");

    // Insert new queue
    if (queue.length > 0) {
      await supabase.from("user_drills").insert(
        queue.map((drill_id, i) => ({
          user_id: user.id,
          drill_id,
          status: "queued" as const,
          position: i,
        }))
      );
    }
  } catch (err) {
    console.warn("[aerix] drill queue replace failed:", err);
  }
}
