import { getDateStr, getCompletedDates } from "./training-completion";

/** Count how many of the last N days have completions. */
export function getCompletedDaysLastNDays(
  dates: Set<string>,
  n: number
): number {
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (dates.has(getDateStr(i))) count++;
  }
  return count;
}

/** Compute consistency score as a percentage (0–100). */
export function computeConsistencyScore(
  completedCount: number,
  totalDays: number
): number {
  if (totalDays <= 0) return 0;
  return Math.round((completedCount / totalDays) * 100);
}

/** Convenience: get consistency score for the last 14 days. */
export function getConsistencyScore(): number {
  const dates = getCompletedDates();
  const count = getCompletedDaysLastNDays(dates, 14);
  return computeConsistencyScore(count, 14);
}
