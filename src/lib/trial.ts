/** Pure helpers for 7-day Starter trial logic. */

export interface TrialInfo {
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean;
  plan: string;
  stripe_subscription_id: string | null;
}

/** Is the trial currently active (not expired)? */
export function isTrialActive(info: TrialInfo): boolean {
  if (info.plan !== "starter") return false;
  if (!info.trial_ends_at) return false;
  if (info.stripe_subscription_id) return false; // paid subscriber, not trial
  return new Date(info.trial_ends_at) > new Date();
}

/** Has the trial expired (was active but time ran out)? */
export function isTrialExpired(info: TrialInfo): boolean {
  if (!info.trial_ends_at) return false;
  if (info.stripe_subscription_id) return false;
  return new Date(info.trial_ends_at) <= new Date();
}

/** Can the user start a trial? */
export function canStartTrial(info: TrialInfo): boolean {
  if (info.trial_used) return false;
  if (info.plan !== "free") return false;
  return true;
}

/** Days remaining in an active trial (0 if expired/not active). */
export function trialDaysRemaining(info: TrialInfo): number {
  if (!isTrialActive(info)) return 0;
  const diff = new Date(info.trial_ends_at!).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
