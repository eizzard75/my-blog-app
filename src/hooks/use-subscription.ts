"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { getUserDoc } from "@/lib/firestore/users";
import { getUserPosts } from "@/lib/firestore/posts";
import type { SubscriptionStatus } from "@/types";

const FREE_LIMIT = 5;

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isPro: boolean;
  postsThisMonth: number;
  remaining: number;
  loading: boolean;
}

export function useSubscription(): SubscriptionInfo {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>("inactive");
  const [postsThisMonth, setPostsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([getUserDoc(user.uid), getUserPosts(user.uid)]).then(
      ([userDoc, posts]) => {
        setStatus(userDoc?.subscriptionStatus ?? "inactive");

        const now = new Date();
        const thisMonth = posts.filter((p) => {
          const ts = p.createdAt as unknown as { seconds: number };
          const d = ts?.seconds
            ? new Date(ts.seconds * 1000)
            : new Date(p.createdAt as unknown as string);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });
        setPostsThisMonth(thisMonth.length);
        setLoading(false);
      },
    );
  }, [user]);

  const isPro = status === "active" || status === "trialing";
  const remaining = isPro ? Infinity : Math.max(0, FREE_LIMIT - postsThisMonth);

  return { status, isPro, postsThisMonth, remaining, loading };
}
