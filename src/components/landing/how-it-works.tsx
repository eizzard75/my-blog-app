import { Search, PenTool, BarChart3, Upload } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Enter Your Topic",
    description:
      "Type in a keyword or topic. Our AI researches trending angles, search intent, and competitor content automatically.",
  },
  {
    icon: PenTool,
    step: "2",
    title: "AI Writes Your Post",
    description:
      "BlogAI generates a complete, well-structured blog post with headings, internal links, and SEO metadata — in under a minute.",
  },
  {
    icon: BarChart3,
    step: "3",
    title: "Optimize for SEO",
    description:
      "Get a real-time SEO score with actionable suggestions for keyword density, readability, and on-page optimization.",
  },
  {
    icon: Upload,
    step: "4",
    title: "Publish & Track",
    description:
      "Export to your CMS or copy the HTML. Track rankings and traffic growth right from your BlogAI dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From topic to published post in four simple steps.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="relative text-center">
              {/* Step number */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mb-2 block text-sm font-bold text-primary">
                Step {step}
              </span>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
