"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FREE_FEATURES = [
  "5 blog posts per month",
  "Basic AI model",
  "Standard support",
];

const PRO_FEATURES = [
  "Unlimited blog posts",
  "Advanced AI model",
  "Priority support",
  "Custom templates",
  "Export to multiple formats",
];

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "";

export function Pricing() {
  const { user } = useAuth();

  async function handleSubscribe() {
    if (!user) return;
    const url = await createCheckoutSession(PRO_PRICE_ID, user.uid);
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that works for you.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
          {/* Free plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Get started at no cost</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button render={<Link href="/signup" />} variant="outline" className="w-full">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro plan */}
          <Card className="relative flex flex-col border-primary">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Popular
            </Badge>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For serious content creators</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {user ? (
                <Button className="w-full" onClick={handleSubscribe}>
                  Subscribe
                </Button>
              ) : (
                <Button render={<Link href="/signup" />} className="w-full">
                  Sign Up to Subscribe
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
