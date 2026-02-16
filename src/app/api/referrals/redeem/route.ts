import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const runtime = "nodejs";

const REWARD_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Parse body
  let code: string;
  try {
    const body = await request.json();
    code = String(body.code ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 3. Check if current user already redeemed
  const { data: selfProfile } = await admin
    .from("profiles")
    .select("referral_redeemed_at")
    .eq("id", user.id)
    .single();

  if (selfProfile?.referral_redeemed_at) {
    return NextResponse.json(
      { error: "You have already used a referral code." },
      { status: 400 }
    );
  }

  // 4. Find referrer by code
  const { data: referrer } = await admin
    .from("profiles")
    .select("id, plan, trial_ends_at, stripe_subscription_id")
    .eq("referral_code", code)
    .single();

  if (!referrer) {
    return NextResponse.json(
      { error: "Invalid referral code." },
      { status: 400 }
    );
  }

  // 5. Cannot redeem own code
  if (referrer.id === user.id) {
    return NextResponse.json(
      { error: "You cannot use your own referral code." },
      { status: 400 }
    );
  }

  const now = new Date();

  // 6. Insert referrals row
  const { error: insertErr } = await admin.from("referrals").insert({
    referrer_id: referrer.id,
    referee_id: user.id,
  });

  if (insertErr) {
    // unique constraint on referee_id means already redeemed
    if (insertErr.code === "23505") {
      return NextResponse.json(
        { error: "You have already used a referral code." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to save referral." }, { status: 500 });
  }

  // 7. Mark referee profile
  await admin
    .from("profiles")
    .update({
      referred_by: referrer.id,
      referral_redeemed_at: now.toISOString(),
    })
    .eq("id", user.id);

  // 8. Apply reward to BOTH users
  await applyReward(admin, user.id, now);
  await applyReward(admin, referrer.id, now);

  return NextResponse.json({ ok: true });
}

async function applyReward(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  now: Date
) {
  const { data } = await admin
    .from("profiles")
    .select("plan, trial_ends_at, stripe_subscription_id")
    .eq("id", userId)
    .single();

  if (!data) return;

  const currentEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
  const isFuture = currentEnd && currentEnd > now;

  const newEnd = isFuture
    ? new Date(currentEnd!.getTime() + REWARD_DAYS * MS_PER_DAY)
    : new Date(now.getTime() + REWARD_DAYS * MS_PER_DAY);

  const update: Record<string, unknown> = {
    trial_ends_at: newEnd.toISOString(),
    trial_used: true,
  };

  // Only set trial_started_at if not extending an active trial
  if (!isFuture) {
    update.trial_started_at = now.toISOString();
  }

  // Upgrade to starter if free and no paid subscription
  if (data.plan === "free" && !data.stripe_subscription_id) {
    update.plan = "starter";
  }

  await admin.from("profiles").update(update).eq("id", userId);
}
