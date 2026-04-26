import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  const uid = request.headers.get("x-user-uid");
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userSnap = await getAdminDb().collection("users").doc(uid).get();
    const customerId = userSnap.data()?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    const stripe = getStripeServer();
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    // Cancel at period end so user keeps access until billing cycle ends
    const updated = await stripe.subscriptions.update(subscriptions.data[0].id, { cancel_at_period_end: true });

    // Mirror the cancellation in Firestore immediately — don't wait for the webhook
    const periodEnd = updated.items.data[0]?.current_period_end;
    await getAdminDb().collection("users").doc(uid).update({
      cancelAtPeriodEnd: true,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel subscription";
    console.error("Cancel error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
