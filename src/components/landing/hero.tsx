import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      {/* Gradient background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_270)_/_12%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.6_0.2_200)_/_8%,transparent_50%)]" />

      <div className="container mx-auto px-4 text-center">
        {/* Small badge / announcement */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Powered by Claude AI
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Create SEO-Optimized Blog Posts{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-orange-300">
            in Minutes
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Stop spending hours researching and writing. BlogAI generates
          publish-ready blog content that ranks on Google — so you can focus on
          growing your business.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button render={<Link href="/signup" />} size="lg" className="text-base px-8">
            Start Free Trial
          </Button>
          <Button render={<a href="#how-it-works" />} variant="outline" size="lg" className="text-base px-8">
            See How It Works
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required &middot; 5 free posts per month
        </p>
      </div>
    </section>
  );
}
