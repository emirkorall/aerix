import { describe, it, expect } from "vitest";
import {
  getCompletedDaysLastNDays,
  computeConsistencyScore,
} from "./consistency";
import { getDateStr } from "./training-completion";

describe("consistency helpers", () => {
  it("getCompletedDaysLastNDays counts correctly within window", () => {
    const dates = new Set([
      getDateStr(0), // today
      getDateStr(1), // yesterday
      getDateStr(5),
      getDateStr(13), // 13 days ago (within 14)
      getDateStr(20), // outside 14-day window
    ]);
    expect(getCompletedDaysLastNDays(dates, 14)).toBe(4);
    expect(getCompletedDaysLastNDays(dates, 7)).toBe(3);
    expect(getCompletedDaysLastNDays(dates, 2)).toBe(2);
  });

  it("computeConsistencyScore returns correct percentage", () => {
    expect(computeConsistencyScore(7, 14)).toBe(50);
    expect(computeConsistencyScore(14, 14)).toBe(100);
    expect(computeConsistencyScore(0, 14)).toBe(0);
    expect(computeConsistencyScore(9, 14)).toBe(64);
    expect(computeConsistencyScore(0, 0)).toBe(0);
  });
});
