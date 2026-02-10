import { createClient } from "@/src/lib/supabase/client";
import type { PlanTier } from "@/src/lib/weekly-plan";
import { parsePlanTier } from "@/src/lib/weekly-plan";

/**
 * Fetch the signed-in user's plan from profiles.plan.
 * Returns "free" for unauthenticated users or on error.
 */
export async function fetchUserPlan(): Promise<PlanTier> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "free";

    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    return parsePlanTier(data?.plan);
  } catch {
    return "free";
  }
}
