import { createClient } from "@/src/lib/supabase/client";
import type { PlanTier } from "@/src/lib/weekly-plan";
import { parsePlanTier } from "@/src/lib/weekly-plan";
import type { TrialInfo } from "./trial";
import { isTrialExpired } from "./trial";

export interface UserProfile {
  plan: PlanTier;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean;
  stripe_subscription_id: string | null;
}

const DEFAULT_PROFILE: UserProfile = {
  plan: "free",
  trial_started_at: null,
  trial_ends_at: null,
  trial_used: false,
  stripe_subscription_id: null,
};

/**
 * Fetch the signed-in user's plan from profiles.
 * Auto-expires trial if needed.
 * Returns "free" for unauthenticated users or on error.
 */
export async function fetchUserPlan(): Promise<PlanTier> {
  const profile = await fetchUserProfile();
  return profile.plan;
}

/** Fetch full profile with trial info. */
export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return DEFAULT_PROFILE;

    const { data } = await supabase
      .from("profiles")
      .select("plan, trial_started_at, trial_ends_at, trial_used, stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (!data) return DEFAULT_PROFILE;

    const profile: UserProfile = {
      plan: parsePlanTier(data.plan),
      trial_started_at: data.trial_started_at ?? null,
      trial_ends_at: data.trial_ends_at ?? null,
      trial_used: data.trial_used ?? false,
      stripe_subscription_id: data.stripe_subscription_id ?? null,
    };

    // Auto-expire trial
    const trialInfo: TrialInfo = {
      ...profile,
      plan: profile.plan,
    };

    if (profile.plan === "starter" && isTrialExpired(trialInfo)) {
      await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", user.id);
      profile.plan = "free";
    }

    return profile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

/** Start a 7-day Starter trial. Returns true on success. */
export async function startTrial(): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("profiles")
      .update({
        plan: "starter",
        trial_started_at: now.toISOString(),
        trial_ends_at: endsAt.toISOString(),
        trial_used: true,
      })
      .eq("id", user.id);

    return !error;
  } catch {
    return false;
  }
}
