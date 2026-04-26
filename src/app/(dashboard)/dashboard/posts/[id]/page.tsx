"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, ImagePlus, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getPost, updatePost } from "@/lib/firestore/posts";
import { uploadCoverImage } from "@/lib/firebase/storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PostDoc } from "@/types";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<PostDoc | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getPost(id)
      .then((p) => {
        if (p) {
          setPost(p);
          setTitle(p.title);
          setContent(p.content);
          setStatus(p.status);
          setCoverImage(p.coverImage ?? null);
        }
      })
      .catch((err) => {
        console.error("Failed to load post:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadProgress(0);
    try {
      const url = await uploadCoverImage(
        user.uid,
        id,
        file,
        (pct: number) => setUploadProgress(pct),
      );
      setCoverImage(url);
      setUploadProgress(null);
    } catch {
      setUploadProgress(null);
      setMessage("Failed to upload cover image.");
    }
  }

  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setMessage(null);
    try {
      await updatePost(post.id, { title, content, status, coverImage });
      setMessage("Saved.");
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!post) {
    return <p className="text-muted-foreground">Post not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
          <p className="text-muted-foreground text-sm">
            Last updated:{" "}
            {post.updatedAt
              ? new Date(
                  (post.updatedAt as unknown as { seconds: number }).seconds * 1000,
                ).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "—"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Cover image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            {coverImage ? (
              <div className="relative w-full overflow-hidden rounded-lg border">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {uploadProgress !== null ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading {uploadProgress}%
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    Click to upload cover image
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {(["draft", "published"] as const).map((s) => (
                <Button
                  key={s}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
