import { describe, it, expect, vi } from "vitest";
import { getWeekdayKey, shouldShowReminder } from "./reminders";

describe("reminder helpers", () => {
  it("getWeekdayKey returns correct key for known dates", () => {
    // 2026-02-15 is a Sunday
    expect(getWeekdayKey(new Date(2026, 1, 15))).toBe("sun");
    // 2026-02-16 is a Monday
    expect(getWeekdayKey(new Date(2026, 1, 16))).toBe("mon");
    // 2026-02-20 is a Friday
    expect(getWeekdayKey(new Date(2026, 1, 20))).toBe("fri");
  });

  it("shouldShowReminder returns true when conditions met", () => {
    const today = getWeekdayKey(new Date());
    expect(
      shouldShowReminder({ enabled: true, days: [today] }, false)
    ).toBe(true);
  });

  it("shouldShowReminder returns false if trained today", () => {
    const today = getWeekdayKey(new Date());
    expect(
      shouldShowReminder({ enabled: true, days: [today] }, true)
    ).toBe(false);
  });

  it("shouldShowReminder returns false if disabled", () => {
    const today = getWeekdayKey(new Date());
    expect(
      shouldShowReminder({ enabled: false, days: [today] }, false)
    ).toBe(false);
  });

  it("shouldShowReminder returns false if today not in days", () => {
    expect(
      shouldShowReminder({ enabled: true, days: ["zzz"] }, false)
    ).toBe(false);
  });
});
