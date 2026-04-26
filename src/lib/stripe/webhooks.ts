import type Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase/admin";
import type { SubscriptionStatus } from "@/types";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  const uid = session.metadata?.uid;
  if (!uid) {
    console.error("No uid found in checkout session metadata");
    return;
  }

  await getAdminDb().collection("users").doc(uid).set({
    stripeCustomerId: session.customer as string,
    subscriptionStatus: "active" as SubscriptionStatus,
    subscriptionPriceId: session.metadata?.priceId ?? null,
    updatedAt: new Date(),
  }, { merge: true });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  const usersSnapshot = await getAdminDb()
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found for Stripe customer ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const periodEnd = subscription.items.data[0]?.current_period_end;
  await userDoc.ref.update({
    subscriptionStatus: subscription.status as SubscriptionStatus,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    updatedAt: new Date(),
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  const usersSnapshot = await getAdminDb()
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found for Stripe customer ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  await userDoc.ref.update({
    subscriptionStatus: "inactive" as SubscriptionStatus,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    updatedAt: new Date(),
  });
}
