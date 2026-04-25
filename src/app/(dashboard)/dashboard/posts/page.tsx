"use client";

import { useEffect, useState } from "react";
import { Trash2, FileText, Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getUserPosts, deletePost } from "@/lib/firestore/posts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { PostDoc } from "@/types";

export default function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    getUserPosts(user.uid)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    setDeletingId(postId);
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Posts</h2>
        <p className="text-muted-foreground">All your generated blog posts.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No posts yet. Generate one from the Dashboard.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              All Posts
            </CardTitle>
            <CardDescription>{posts.length} post{posts.length !== 1 ? "s" : ""} total</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {posts.map((post) => {
                const ts = post.createdAt as unknown as { seconds: number };
                const date = ts?.seconds
                  ? new Date(ts.seconds * 1000).toLocaleDateString()
                  : "";
                return (
                  <li key={post.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{date} · {post.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/posts/${post.id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} disabled={deletingId === post.id}>
                        {deletingId === post.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
