"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Save, Lock, Globe } from "lucide-react";
import Link from "next/link";
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
import { useSubscription } from "@/hooks/use-subscription";
import { createPost, updatePost } from "@/lib/firestore/posts";

const TONES = ["Professional", "Casual", "Academic"] as const;
type Tone = (typeof TONES)[number];

export function BlogGenerator({ onSave }: { onSave?: () => void } = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const { isPro, remaining, loading: subLoading } = useSubscription();
  const atLimit = !isPro && remaining === 0;
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autoSavedId, setAutoSavedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate() {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setError(null);
    setSaveMessage(null);
    setAutoSavedId(null);

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
      let fullContent = "";

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
              fullContent += content;
              setGeneratedContent((prev) => prev + content);
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }

      // Auto-save as draft when generation completes
      if (fullContent.trim() && user) {
        const firstLine = fullContent.split("\n").find((l) => l.trim());
        const title = firstLine?.replace(/^#+\s*/, "").trim() ?? "Untitled Post";
        const id = await createPost(user.uid, { title, content: fullContent, status: "draft" });
        setAutoSavedId(id);
        setSaveMessage("Post saved automatically!");
        onSave?.();
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  async function handleSave(publish = false) {
    if (!user || !generatedContent.trim() || isSaving) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const firstLine = generatedContent.split("\n").find((l) => l.trim());
      const title = firstLine?.replace(/^#+\s*/, "").trim() ?? "Untitled Post";

      if (autoSavedId) {
        await updatePost(autoSavedId, { title, content: generatedContent, status: publish ? "published" : "draft" });
      } else {
        await createPost(user.uid, { title, content: generatedContent, status: publish ? "published" : "draft" });
      }
      onSave?.();
      if (publish) {
        router.push("/dashboard/posts");
      } else {
        setSaveMessage("Post saved as draft!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save post.";
      setSaveMessage(msg);
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

        {/* Free plan limit warning */}
        {!subLoading && !isPro && (
          <div className={cn(
            "rounded-lg border px-4 py-3 text-sm flex items-center justify-between gap-4",
            atLimit ? "border-destructive bg-destructive/10 text-destructive" : "border-muted text-muted-foreground"
          )}>
            <span>
              {atLimit
                ? "You've reached your 5 posts/month limit."
                : `${remaining} of 5 free posts remaining this month.`}
            </span>
            {atLimit && (
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}

        {/* Generate button */}
        <div>
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating || atLimit}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : atLimit ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Limit Reached
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

        {/* Skeleton — waiting for first token */}
        {isGenerating && !generatedContent && (
          <div className="space-y-3 rounded-lg border p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Claude is writing your post…
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        )}

        {/* Generated content */}
        {generatedContent && (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6">
              <div className="whitespace-pre-wrap">
                {generatedContent}
                {isGenerating && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle" />
                )}
              </div>
            </div>
            {!isGenerating && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleSave(false)}
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
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="mr-2 h-4 w-4" />
                  )}
                  Publish
                </Button>
                {saveMessage && (
                  <span className="text-sm text-muted-foreground">
                    {saveMessage}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && !generatedContent && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Your generated blog post will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
