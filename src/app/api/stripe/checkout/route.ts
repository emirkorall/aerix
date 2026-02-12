import { NextResponse } from "next/server";
import { stripe, getPriceId } from "@/src/lib/stripe";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    const priceId = getPriceId(plan);
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find existing Stripe customer or create one
    let customerId: string | undefined;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Store stripe_customer_id in profiles
      const { error: upsertErr } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);

      if (upsertErr) {
        console.warn("[stripe] failed to store stripe_customer_id:", upsertErr.message);
      } else {
        console.log(`[stripe] stored stripe_customer_id=${customerId} for user=${user.id}`);
      }
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { user_id: user.id, plan },
      success_url: `${origin}/upgrade/success`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
