const STORAGE_KEY = "aerix.trainingCompletion";
const HISTORY_KEY = "aerix.trainingHistory";
const COMPLETIONS_KEY = "aerix.completions";
const CUSTOM_EVENT = "aerix.trainingSync";

interface TrainingCompletion {
  date: string;
  completed: boolean;
}

export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get the YYYY-MM-DD string for a date N days ago. */
export function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get the YYYY-MM-DD for each day (Mon–Sun) of a week offset (0 = this week, 1 = last week). */
export function getWeekDates(weeksAgo: number): string[] {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek - weeksAgo * 7);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return dates;
}

function getCompletionsMap(): Record<string, true> {
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCompletionsMap(map: Record<string, true>): void {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(map));
}

/** Migrate old history array into the new completions map (runs once). */
function migrateIfNeeded(): void {
  const map = getCompletionsMap();
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    const arr: string[] = JSON.parse(raw);
    let changed = false;
    for (const date of arr) {
      if (!map[date]) {
        map[date] = true;
        changed = true;
      }
    }
    if (changed) saveCompletionsMap(map);
  } catch { /* ignore */ }
}

export function isCompletedToday(): boolean {
  const map = getCompletionsMap();
  return map[getToday()] === true;
}

export function setCompletedToday(completed: boolean): void {
  setCompletedDate(getToday(), completed);
}

/** Set completion for any date. Updates all storage keys and fires sync event. */
export function setCompletedDate(date: string, completed: boolean): void {
  // Update completions map
  const map = getCompletionsMap();
  if (completed) {
    map[date] = true;
  } else {
    delete map[date];
  }
  saveCompletionsMap(map);

  // Keep legacy keys in sync
  const today = getToday();
  if (date === today) {
    const value: TrainingCompletion = { date: today, completed };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
  const history = new Set(Object.keys(map));
  localStorage.setItem(HISTORY_KEY, JSON.stringify([...history]));

  window.dispatchEvent(new Event(CUSTOM_EVENT));
}

export function getCompletedDates(): Set<string> {
  migrateIfNeeded();
  return new Set(Object.keys(getCompletionsMap()));
}

/** Compute current and best streak from completions map. */
export function computeStreaks(): { current: number; best: number } {
  const dates = getCompletedDates();
  if (dates.size === 0) return { current: 0, best: 0 };

  // Current streak: walk backwards from today
  let current = 0;
  for (let i = 0; ; i++) {
    if (dates.has(getDateStr(i))) {
      current++;
    } else {
      break;
    }
  }
  // If today not completed, try from yesterday
  if (current === 0) {
    for (let i = 1; ; i++) {
      if (dates.has(getDateStr(i))) {
        current++;
      } else {
        break;
      }
    }
  }

  // Best streak: sort all dates ascending and find max consecutive run
  const sorted = [...dates].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      run++;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  return { current, best: Math.max(current, best) };
}

const NOTES_KEY = "aerix.sessionNotes";

export interface SessionNote {
  better: string;
  tomorrow: string;
}

export function getSessionNotes(): Record<string, SessionNote> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveSessionNote(date: string, note: SessionNote): void {
  const all = getSessionNotes();
  all[date] = note;
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
}

const TAGS_KEY = "aerix.sessionTags";

export const FOCUS_TAGS = [
  "Mechanics",
  "Shooting",
  "Dribbling",
  "Aerials",
  "Defense",
  "Recoveries",
  "Game Sense",
  "Free Play",
] as const;

export type FocusTag = (typeof FOCUS_TAGS)[number];

export function getSessionTags(): Record<string, FocusTag[]> {
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveSessionTags(date: string, tags: FocusTag[]): void {
  const all = getSessionTags();
  if (tags.length === 0) {
    delete all[date];
  } else {
    all[date] = tags;
  }
  localStorage.setItem(TAGS_KEY, JSON.stringify(all));
}

const DURATIONS_KEY = "aerix.sessionDurations";

export const DURATION_OPTIONS = [15, 30, 45, 60] as const;

export type SessionDuration = (typeof DURATION_OPTIONS)[number];

export function getSessionDurations(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DURATIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveSessionDuration(date: string, minutes: number): void {
  const all = getSessionDurations();
  all[date] = minutes;
  localStorage.setItem(DURATIONS_KEY, JSON.stringify(all));
}

const RANK_SNAPSHOTS_KEY = "aerix.rankSnapshots";
const RANK_PLAYLIST_KEY = "aerix.rankPlaylist";

export const PLAYLISTS = ["2v2", "3v3", "1v1"] as const;
export type Playlist = (typeof PLAYLISTS)[number];

export const RANKS = [
  "Bronze I", "Bronze II", "Bronze III",
  "Silver I", "Silver II", "Silver III",
  "Gold I", "Gold II", "Gold III",
  "Platinum I", "Platinum II", "Platinum III",
  "Diamond I", "Diamond II", "Diamond III",
  "Champion I", "Champion II", "Champion III",
  "Grand Champion I", "Grand Champion II", "Grand Champion III",
  "Supersonic Legend",
] as const;

export type Rank = (typeof RANKS)[number];

export interface RankSnapshot {
  date: string;
  playlist: Playlist;
  rank: Rank;
}

export function getRankSnapshots(): RankSnapshot[] {
  try {
    const raw = localStorage.getItem(RANK_SNAPSHOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRankSnapshot(snapshot: RankSnapshot): void {
  const all = getRankSnapshots();
  all.push(snapshot);
  const trimmed = all.length > 50 ? all.slice(all.length - 50) : all;
  localStorage.setItem(RANK_SNAPSHOTS_KEY, JSON.stringify(trimmed));
}

export function getSavedPlaylist(): Playlist {
  try {
    const raw = localStorage.getItem(RANK_PLAYLIST_KEY);
    if (raw && PLAYLISTS.includes(raw as Playlist)) return raw as Playlist;
  } catch { /* ignore */ }
  return "2v2";
}

export function setSavedPlaylist(playlist: Playlist): void {
  localStorage.setItem(RANK_PLAYLIST_KEY, playlist);
}

export function getRankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

const ONBOARDING_KEY = "aerix.onboarding";

export const GOALS = ["Rank Up", "Build Consistency", "Mechanics", "Game Sense"] as const;
export type Goal = (typeof GOALS)[number];

export interface OnboardingData {
  goal: Goal;
  playlist: Playlist;
}

export function getOnboarding(): OnboardingData | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveOnboarding(data: OnboardingData): void {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
}

export function onCompletionChange(callback: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  const handleCustom = () => callback();
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CUSTOM_EVENT, handleCustom);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CUSTOM_EVENT, handleCustom);
  };
}
