import { createClient } from "@/src/lib/supabase/client";

export interface OnboardingProfile {
  onboarding_completed: boolean;
  focus_goal: string | null;
  focus_playlist: string | null;
  rank_tier: string | null;
  rank_division: string | null;
}

const DEFAULT: OnboardingProfile = {
  onboarding_completed: false,
  focus_goal: null,
  focus_playlist: null,
  rank_tier: null,
  rank_division: null,
};

export async function fetchOnboardingStatus(): Promise<OnboardingProfile> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEFAULT;

    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed, focus_goal, focus_playlist, rank_tier, rank_division")
      .eq("id", user.id)
      .single();

    if (!data) return DEFAULT;

    return {
      onboarding_completed: data.onboarding_completed ?? false,
      focus_goal: data.focus_goal ?? null,
      focus_playlist: data.focus_playlist ?? null,
      rank_tier: data.rank_tier ?? null,
      rank_division: data.rank_division ?? null,
    };
  } catch {
    return DEFAULT;
  }
}

export interface OnboardingPayload {
  focus_goal: string;
  focus_playlist: string;
  rank_tier: string | null;
  rank_division: string | null;
}

export async function saveOnboardingProfile(payload: OnboardingPayload): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        focus_goal: payload.focus_goal,
        focus_playlist: payload.focus_playlist,
        rank_tier: payload.rank_tier,
        rank_division: payload.rank_division,
      })
      .eq("id", user.id);

    return !error;
  } catch {
    return false;
  }
}

/** Fetch the user's weekly goal (default 3). */
export async function fetchWeeklyGoal(): Promise<number> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 3;

    const { data } = await supabase
      .from("profiles")
      .select("weekly_goal_days")
      .eq("id", user.id)
      .single();

    return data?.weekly_goal_days ?? 3;
  } catch {
    return 3;
  }
}

/** Save the user's weekly goal. */
export async function saveWeeklyGoal(days: number): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("profiles")
      .update({ weekly_goal_days: days })
      .eq("id", user.id);

    return !error;
  } catch {
    return false;
  }
}
