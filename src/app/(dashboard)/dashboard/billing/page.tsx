"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Zap, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserDoc } from "@/lib/firestore/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRO_FEATURES = [
  "Unlimited blog post generation",
  "All AI tones (Professional, Casual, Academic)",
  "Save unlimited drafts",
  "Priority support",
];

export default function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("inactive");

  useEffect(() => {
    if (!user) return;
    getUserDoc(user.uid).then((doc) => {
      if (doc?.subscriptionStatus) setSubscriptionStatus(doc.subscriptionStatus);
    });
  }, [user]);

  // Reset transient loading state if the user navigates back from Stripe via bfcache.
  useEffect(() => {
    function onShow(e: PageTransitionEvent) {
      if (e.persisted) {
        setLoading(false);
        setCancelling(false);
        setError(null);
      }
    }
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const isPro = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel? You'll keep Pro access until the end of your billing period.")) return;
    setCancelling(true);
    setCancelMessage(null);
    try {
      const res = await fetch("/api/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      setCancelMessage("Your subscription has been cancelled. You'll keep Pro access until the end of your billing period.");
    } catch (err) {
      setCancelMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCancelling(false);
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription.</p>
      </div>

      {/* Current plan */}
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
          <CardDescription>
            {isPro
              ? "You have unlimited access to all features."
              : "You are on the Free plan — 5 posts per month."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cancel subscription — only shown on Pro plan */}
      {isPro && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Cancel Subscription
            </CardTitle>
            <CardDescription>
              You&apos;ll keep Pro access until the end of your current billing period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cancelMessage && (
              <p className="text-sm text-muted-foreground">{cancelMessage}</p>
            )}
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {cancelling ? "Cancelling…" : "Cancel Subscription"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade card — only shown on free plan */}
      {!isPro && (
        <Card className="max-w-lg border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription>
              $29 / month — cancel anytime
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button onClick={handleUpgrade} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Stripe…
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secured by Stripe. Test card: 4242 4242 4242 4242
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
