"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does BlogAI generate blog posts?",
    answer:
      "BlogAI uses the Anthropic Claude AI model to research your topic, analyze search intent, and generate a well-structured, SEO-optimized blog post. It considers keyword placement, readability, header structure, and internal linking to produce content that ranks.",
  },
  {
    question: "Will the content pass AI detection?",
    answer:
      "BlogAI generates high-quality, human-like content that reads naturally. Our AI is trained to vary sentence structure, use conversational tone, and avoid repetitive patterns. Many users publish posts directly with minimal editing.",
  },
  {
    question: "Can I customize the writing style?",
    answer:
      "Yes! Pro users can set brand voice guidelines, preferred tone (formal, casual, technical), target audience, and custom templates. BlogAI adapts its output to match your brand consistently.",
  },
  {
    question: "What SEO features are included?",
    answer:
      "Every post includes optimized title tags, meta descriptions, header hierarchy (H1-H3), keyword density analysis, internal linking suggestions, and readability scoring. Pro plans also include competitor content analysis.",
  },
  {
    question: "How many posts can I generate?",
    answer:
      "Free plans include 5 blog posts per month. Pro plans offer unlimited posts, so you can scale your content production as much as you need.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your Pro subscription at any time from your dashboard. You'll keep access until the end of your current billing period, and you can always use the free tier afterward.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about BlogAI.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl divide-y">
          {faqs.map(({ question, answer }, index) => (
            <div key={question}>
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between py-5 text-left text-sm font-medium transition-colors hover:text-primary"
              >
                {question}
                <ChevronDown
                  className={cn(
                    "ml-4 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index
                    ? "grid-rows-[1fr] pb-5"
                    : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
