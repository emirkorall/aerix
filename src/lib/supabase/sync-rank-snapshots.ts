import { createClient } from "./client";
import type { RankSnapshot } from "@/src/lib/training-completion";

const STORAGE_KEY = "aerix.rankSnapshots";

function snapshotKey(s: { date: string; playlist: string; rank: string }): string {
  return `${s.date}|${s.playlist}|${s.rank}`;
}

function readLocal(): RankSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocal(snapshots: RankSnapshot[]): void {
  const sorted = [...snapshots].sort((a, b) =>
    a.date === b.date ? a.playlist.localeCompare(b.playlist) : a.date.localeCompare(b.date)
  );
  const trimmed = sorted.length > 50 ? sorted.slice(sorted.length - 50) : sorted;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Merge localStorage rank snapshots with Supabase.
 * Non-blocking — caller should fire-and-forget.
 */
export async function syncRankSnapshots(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rows } = await supabase
      .from("rank_snapshots")
      .select("day, playlist, rank")
      .eq("user_id", user.id)
      .order("day", { ascending: true });

    const remote: RankSnapshot[] = (rows ?? []).map(
      (r: { day: string; playlist: string; rank: string }) => ({
        date: r.day,
        playlist: r.playlist,
        rank: r.rank,
      })
    ) as RankSnapshot[];

    const local = readLocal();

    // Build set of unique keys from remote
    const remoteKeys = new Set(remote.map(snapshotKey));
    const localKeys = new Set(local.map(snapshotKey));

    // Merge: union by key
    const merged = new Map<string, RankSnapshot>();
    for (const s of remote) merged.set(snapshotKey(s), s);
    for (const s of local) merged.set(snapshotKey(s), s);

    // Find local-only → insert to DB
    const toUpload: RankSnapshot[] = [];
    for (const s of local) {
      if (!remoteKeys.has(snapshotKey(s))) toUpload.push(s);
    }

    if (toUpload.length > 0) {
      await supabase.from("rank_snapshots").upsert(
        toUpload.map((s) => ({
          user_id: user.id,
          day: s.date,
          playlist: s.playlist,
          rank: s.rank,
        })),
        { onConflict: "user_id,day,playlist,rank" }
      );
    }

    // Write merged back to localStorage
    writeLocal([...merged.values()]);
  } catch (err) {
    console.warn("[aerix] rank snapshot sync failed:", err);
  }
}

/**
 * Insert a single rank snapshot to Supabase (non-blocking).
 */
export async function upsertRankSnapshot(snapshot: RankSnapshot): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("rank_snapshots").upsert(
      {
        user_id: user.id,
        day: snapshot.date,
        playlist: snapshot.playlist,
        rank: snapshot.rank,
      },
      { onConflict: "user_id,day,playlist,rank" }
    );
  } catch (err) {
    console.warn("[aerix] rank snapshot upsert failed:", err);
  }
}
