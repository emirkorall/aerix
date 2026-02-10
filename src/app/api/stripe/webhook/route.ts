import { NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/src/lib/stripe";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe] webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const metaPlan = session.metadata?.plan;

      if (!userId) {
        console.warn("[stripe] checkout.session.completed missing user_id metadata");
        break;
      }

      // Determine plan from metadata or from the subscription's price
      let plan = metaPlan;
      if (!plan && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = sub.items.data[0]?.price?.id;
        if (priceId) plan = getPlanFromPriceId(priceId) ?? undefined;
      }

      if (!plan) {
        console.warn("[stripe] could not determine plan for session", session.id);
        break;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", userId);

      if (error) {
        console.error("[stripe] failed to update profile:", error);
      } else {
        console.log(`[stripe] activated plan=${plan} for user=${userId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

      if (!customerId) break;

      const { error } = await supabase
        .from("profiles")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("[stripe] failed to downgrade profile:", error);
      } else {
        console.log(`[stripe] downgraded customer=${customerId} to free`);
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
