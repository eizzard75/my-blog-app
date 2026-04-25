"use client";

import { useState, useRef } from "react";
import { Sparkles, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createPost } from "@/lib/firestore/posts";

const TONES = ["Professional", "Casual", "Academic"] as const;
type Tone = (typeof TONES)[number];

export function BlogGenerator() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate() {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setError(null);
    setSaveMessage(null);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to generate");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setGeneratedContent((prev) => prev + content);
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  async function handleSave() {
    if (!user || !generatedContent.trim() || isSaving) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Extract title from the first line (strip markdown # prefix)
      const firstLine = generatedContent.split("\n").find((l) => l.trim());
      const title = firstLine?.replace(/^#+\s*/, "").trim() ?? "Untitled Post";

      await createPost(user.uid, { title, content: generatedContent });
      setSaveMessage("Post saved as draft!");
    } catch {
      setSaveMessage("Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate a Blog Post
        </CardTitle>
        <CardDescription>
          Enter a topic and choose a tone to generate your blog post.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topic input */}
        <div className="space-y-2">
          <label
            htmlFor="topic"
            className="text-sm font-medium leading-none"
          >
            Topic or prompt
          </label>
          <Textarea
            id="topic"
            placeholder="e.g. The future of renewable energy in urban areas..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            disabled={isGenerating}
          />
        </div>

        {/* Tone selector */}
        <div className="space-y-2">
          <span className="text-sm font-medium leading-none">Tone</span>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <Button
                key={t}
                variant={tone === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTone(t)}
                disabled={isGenerating}
                className={cn(tone === t && "pointer-events-none")}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div>
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Generated content */}
        {generatedContent ? (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6">
              <div className="whitespace-pre-wrap">{generatedContent}</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save as Draft
              </Button>
              {saveMessage && (
                <span className="text-sm text-muted-foreground">
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        ) : (
          !isGenerating && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Your generated blog post will appear here.
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
