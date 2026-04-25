import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Marketing Lead",
    company: "GrowthLoop",
    initials: "SC",
    quote:
      "BlogAI cut our content production time by 80%. We went from publishing 4 posts a month to 20 — and our organic traffic tripled in 3 months.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Founder & CEO",
    company: "NomadStack",
    initials: "MR",
    quote:
      "I was skeptical about AI writing tools, but BlogAI actually nails SEO. Three of our AI-generated posts rank on page 1 for competitive keywords.",
  },
  {
    name: "Emily Tran",
    role: "Head of SEO",
    company: "Pixelworks Agency",
    initials: "ET",
    quote:
      "We've tried every AI writing tool out there. BlogAI is the only one that consistently produces content our editors don't need to rewrite from scratch.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Content Teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what creators and marketers are saying about BlogAI.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, company, initials, quote }) => (
            <Card key={name} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
              </CardContent>
              <CardHeader className="border-t pt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role}, {company}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
