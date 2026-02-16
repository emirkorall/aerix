import { TRAINING_PACKS } from "./trainingPacks";
import type { TrainingPack } from "./trainingPacks";

const STORAGE_KEY = "aerix.packProgress";

export interface LocalPackProgress {
  completedDrillIds: string[];
  lastStartedAt: string | null;
}

export type PackProgressMap = Record<string, LocalPackProgress>;

export function getLocalPackProgress(): PackProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalPackProgress(map: PackProgressMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Mark a drill as done in all packs that contain it. Returns affected pack IDs. */
export function markDrillDoneInPacks(drillId: string): string[] {
  const map = getLocalPackProgress();
  const affected: string[] = [];

  for (const pack of TRAINING_PACKS) {
    if (!pack.drills.some((d) => d.id === drillId)) continue;

    const entry = map[pack.id] ?? {
      completedDrillIds: [],
      lastStartedAt: null,
    };
    if (!entry.completedDrillIds.includes(drillId)) {
      entry.completedDrillIds.push(drillId);
    }
    if (!entry.lastStartedAt) {
      entry.lastStartedAt = new Date().toISOString();
    }
    map[pack.id] = entry;
    affected.push(pack.id);
  }

  setLocalPackProgress(map);
  return affected;
}

// ── Status helpers ──

export type PackStatus = "not_started" | "in_progress" | "completed";

export function getPackStatus(
  pack: TrainingPack,
  progress: LocalPackProgress | undefined
): PackStatus {
  if (!progress || progress.completedDrillIds.length === 0) return "not_started";
  const done = progress.completedDrillIds.filter((id) =>
    pack.drills.some((d) => d.id === id)
  ).length;
  if (done >= pack.drills.length) return "completed";
  return "in_progress";
}

export function getCompletedCount(
  pack: TrainingPack,
  progress: LocalPackProgress | undefined
): number {
  if (!progress) return 0;
  return progress.completedDrillIds.filter((id) =>
    pack.drills.some((d) => d.id === id)
  ).length;
}

// ── Recommendation ──

/**
 * Recommend the best next pack:
 * 1. In-progress pack (most recently started)
 * 2. First incomplete (not_started) pack by list order
 */
export function recommendNextPack(
  packs: TrainingPack[],
  progressMap: PackProgressMap
): TrainingPack | null {
  let bestInProgress: TrainingPack | null = null;
  let latestStart = "";

  for (const pack of packs) {
    const p = progressMap[pack.id];
    if (getPackStatus(pack, p) !== "in_progress") continue;
    const started = p?.lastStartedAt ?? "";
    if (!bestInProgress || started > latestStart) {
      latestStart = started;
      bestInProgress = pack;
    }
  }
  if (bestInProgress) return bestInProgress;

  for (const pack of packs) {
    if (getPackStatus(pack, progressMap[pack.id]) === "not_started") return pack;
  }

  return null;
}

// ── Sync ──

/** Merge remote progress into local, write merged back. */
export function mergeRemoteProgress(
  remote: Record<
    string,
    { completed_drill_ids: string[]; last_started_at: string | null }
  >
): PackProgressMap {
  const local = getLocalPackProgress();

  for (const [packId, row] of Object.entries(remote)) {
    const entry = local[packId] ?? {
      completedDrillIds: [],
      lastStartedAt: null,
    };
    const mergedIds = [
      ...new Set([...entry.completedDrillIds, ...row.completed_drill_ids]),
    ];
    const mergedStart =
      entry.lastStartedAt && row.last_started_at
        ? entry.lastStartedAt > row.last_started_at
          ? entry.lastStartedAt
          : row.last_started_at
        : entry.lastStartedAt || row.last_started_at;

    local[packId] = {
      completedDrillIds: mergedIds,
      lastStartedAt: mergedStart,
    };
  }

  setLocalPackProgress(local);
  return local;
}
