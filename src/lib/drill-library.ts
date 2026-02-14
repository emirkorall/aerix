import { TRAINING_PROGRAMS } from "./trainingPrograms";
import type { TrainingBlock } from "./trainingPrograms";

// ── All drills from every tier, de-duped by id ──

const _allDrills: TrainingBlock[] = [];
const _seen = new Set<string>();
for (const tier of ["free", "starter", "pro"] as const) {
  for (const block of TRAINING_PROGRAMS[tier].blocks) {
    if (!_seen.has(block.id)) {
      _seen.add(block.id);
      _allDrills.push(block);
    }
  }
}

export const ALL_DRILLS: ReadonlyArray<TrainingBlock> = _allDrills;

export function getDrillById(id: string): TrainingBlock | undefined {
  return _allDrills.find((d) => d.id === id);
}

/** Which plan tier a drill belongs to */
export function drillTier(id: string): "free" | "starter" | "pro" {
  if (TRAINING_PROGRAMS.free.blocks.some((b) => b.id === id)) return "free";
  if (TRAINING_PROGRAMS.starter.blocks.some((b) => b.id === id)) return "starter";
  return "pro";
}

// ── Plan limits ──

export const SAVE_LIMITS = { free: 5, starter: 20, pro: Infinity } as const;
export const QUEUE_LIMITS = { free: 1, starter: 3, pro: 9 } as const;

// ── Local storage keys ──

const SAVES_KEY = "aerix.drillSaves";
const QUEUE_KEY = "aerix.drillQueue";

export function getLocalSaves(): string[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalSaves(ids: string[]): void {
  localStorage.setItem(SAVES_KEY, JSON.stringify(ids));
}

export function getLocalQueue(): string[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalQueue(ids: string[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
}
