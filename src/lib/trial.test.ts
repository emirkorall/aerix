import { describe, it, expect } from "vitest";
import {
  isTrialActive,
  isTrialExpired,
  canStartTrial,
  trialDaysRemaining,
  type TrialInfo,
} from "./trial";

const base: TrialInfo = {
  trial_started_at: null,
  trial_ends_at: null,
  trial_used: false,
  plan: "free",
  stripe_subscription_id: null,
};

describe("trial helpers", () => {
  it("canStartTrial: true for fresh free user", () => {
    expect(canStartTrial(base)).toBe(true);
  });

  it("canStartTrial: false if trial_used", () => {
    expect(canStartTrial({ ...base, trial_used: true })).toBe(false);
  });

  it("canStartTrial: false if not free plan", () => {
    expect(canStartTrial({ ...base, plan: "starter" })).toBe(false);
  });

  it("isTrialActive: true during trial window", () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    const info: TrialInfo = {
      ...base,
      plan: "starter",
      trial_used: true,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: future,
    };
    expect(isTrialActive(info)).toBe(true);
  });

  it("isTrialActive: false after expiration", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const info: TrialInfo = {
      ...base,
      plan: "starter",
      trial_used: true,
      trial_started_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      trial_ends_at: past,
    };
    expect(isTrialActive(info)).toBe(false);
  });

  it("isTrialActive: false for paid subscriber", () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    const info: TrialInfo = {
      ...base,
      plan: "starter",
      trial_used: true,
      trial_ends_at: future,
      stripe_subscription_id: "sub_123",
    };
    expect(isTrialActive(info)).toBe(false);
  });

  it("isTrialExpired: true after end date", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const info: TrialInfo = {
      ...base,
      plan: "free",
      trial_used: true,
      trial_ends_at: past,
    };
    expect(isTrialExpired(info)).toBe(true);
  });

  it("trialDaysRemaining: returns correct count", () => {
    const future = new Date(Date.now() + 3.5 * 86400000).toISOString();
    const info: TrialInfo = {
      ...base,
      plan: "starter",
      trial_used: true,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: future,
    };
    expect(trialDaysRemaining(info)).toBe(4);
  });

  it("trialDaysRemaining: 0 when expired", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const info: TrialInfo = {
      ...base,
      plan: "starter",
      trial_used: true,
      trial_ends_at: past,
    };
    expect(trialDaysRemaining(info)).toBe(0);
  });
});
