import { describe, it, expect } from "vitest";
import { getWeekDates, getDateStr } from "./training-completion";

describe("getDateStr", () => {
  it("returns today for daysAgo=0", () => {
    const today = getDateStr(0);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns yesterday for daysAgo=1", () => {
    const yesterday = getDateStr(1);
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expect(yesterday).toBe(expected);
  });
});

describe("getWeekDates", () => {
  it("returns 7 dates for current week", () => {
    const dates = getWeekDates(0);
    expect(dates).toHaveLength(7);
    dates.forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("first date is a Monday", () => {
    const dates = getWeekDates(0);
    const monday = new Date(dates[0] + "T00:00:00");
    expect(monday.getDay()).toBe(1); // 1 = Monday
  });

  it("dates are consecutive", () => {
    const dates = getWeekDates(0);
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1] + "T00:00:00").getTime();
      const curr = new Date(dates[i] + "T00:00:00").getTime();
      expect(curr - prev).toBe(86_400_000); // 1 day in ms
    }
  });
});
