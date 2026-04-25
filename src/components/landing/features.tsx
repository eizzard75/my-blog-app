import {
  Sparkles,
  Target,
  Clock,
  Globe,
  FileText,
  Shield,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    description:
      "Generate human-quality blog posts using the latest Claude AI model. Every article reads naturally and engages your audience.",
  },
  {
    icon: Target,
    title: "Built-In SEO Optimization",
    description:
      "Automatic keyword research, meta descriptions, header structure, and internal linking suggestions — all built into the writing flow.",
  },
  {
    icon: Clock,
    title: "10x Faster Content",
    description:
      "What used to take hours now takes minutes. Generate a full 2,000-word post in under 60 seconds.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Create content in 30+ languages with native-level fluency. Expand your reach to global audiences effortlessly.",
  },
  {
    icon: FileText,
    title: "Custom Templates",
    description:
      "Choose from listicles, how-to guides, comparisons, and more — or create your own reusable templates.",
  },
  {
    icon: Shield,
    title: "Brand Voice Control",
    description:
      "Train BlogAI to match your brand's tone, style, and terminology so every post feels authentically yours.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Rank
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete AI content platform — not just another text generator.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-transparent bg-background/60 backdrop-blur-sm transition-colors hover:border-primary/20"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
