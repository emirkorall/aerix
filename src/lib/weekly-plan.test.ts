import { describe, it, expect } from "vitest";
import {
  parsePlanTier,
  getTodayIndex,
  WEEKLY_PLANS,
  DAY_LABELS,
} from "./weekly-plan";

describe("parsePlanTier", () => {
  it("returns 'starter' for 'starter'", () => {
    expect(parsePlanTier("starter")).toBe("starter");
  });

  it("returns 'pro' for 'pro'", () => {
    expect(parsePlanTier("pro")).toBe("pro");
  });

  it("returns 'free' for unknown strings", () => {
    expect(parsePlanTier("unknown")).toBe("free");
    expect(parsePlanTier("")).toBe("free");
  });

  it("returns 'free' for null/undefined", () => {
    expect(parsePlanTier(null)).toBe("free");
    expect(parsePlanTier(undefined)).toBe("free");
  });
});

describe("getTodayIndex", () => {
  it("returns a number between 0 and 6", () => {
    const idx = getTodayIndex();
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(6);
  });
});

describe("WEEKLY_PLANS", () => {
  it("has 7 days for each tier", () => {
    expect(WEEKLY_PLANS.free).toHaveLength(7);
    expect(WEEKLY_PLANS.starter).toHaveLength(7);
    expect(WEEKLY_PLANS.pro).toHaveLength(7);
  });

  it("each day has required fields", () => {
    for (const tier of ["free", "starter", "pro"] as const) {
      for (const day of WEEKLY_PLANS[tier]) {
        expect(day.focus).toBeTruthy();
        expect(day.time).toBeTruthy();
        expect(day.blockSlug).toBeTruthy();
        expect(day.goals.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("DAY_LABELS", () => {
  it("has 7 labels starting with Mon", () => {
    expect(DAY_LABELS).toHaveLength(7);
    expect(DAY_LABELS[0]).toBe("Mon");
    expect(DAY_LABELS[6]).toBe("Sun");
  });
});
