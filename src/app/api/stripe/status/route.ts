import { NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";
import { getPlanFromPriceId } from "@/src/lib/stripe";
import { createClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";

const FREE_RESPONSE = {
  plan: "free",
  status: "none",
  cancel_at_period_end: false,
  cancel_at: null,
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json(FREE_RESPONSE);
  }

  try {
    const sub = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );

    const priceId = sub.items.data[0]?.price?.id;
    const plan = (priceId ? getPlanFromPriceId(priceId) : null) ?? profile.plan ?? "free";

    return NextResponse.json({
      plan,
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
      cancel_at: sub.cancel_at,
    });
  } catch {
    return NextResponse.json(FREE_RESPONSE);
  }
}
