export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "inactive";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  stripeCustomerId: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDoc {
  id: string;
  uid: string;
  title: string;
  content: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}
