const STORAGE_KEY = "aerix.trainingCompletion";
const HISTORY_KEY = "aerix.trainingHistory";
const CUSTOM_EVENT = "aerix.trainingSync";

interface TrainingCompletion {
  date: string;
  completed: boolean;
}

export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isCompletedToday(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data: TrainingCompletion = JSON.parse(raw);
    return data.date === getToday() && data.completed;
  } catch {
    return false;
  }
}

export function setCompletedToday(completed: boolean): void {
  const today = getToday();
  const value: TrainingCompletion = { date: today, completed };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

  const history = getCompletedDates();
  if (completed) {
    history.add(today);
  } else {
    history.delete(today);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify([...history]));

  window.dispatchEvent(new Event(CUSTOM_EVENT));
}

export function getCompletedDates(): Set<string> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
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
