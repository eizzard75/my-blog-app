import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.6_0.25_270)_/_10%,transparent_60%)]" />

      <div className="container mx-auto px-4 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to 10x Your Content Output?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Join thousands of creators using BlogAI to publish SEO-optimized posts
          faster than ever. Start for free — no credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button render={<Link href="/signup" />} size="lg" className="text-base px-8">
            Start Free Trial
          </Button>
          <Button render={<a href="#pricing" />} variant="outline" size="lg" className="text-base px-8">
            View Pricing
          </Button>
        </div>
      </div>
    </section>
  );
}
