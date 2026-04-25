"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { getUserPosts, deletePost } from "@/lib/firestore/posts";
import { BlogGenerator } from "@/components/dashboard/blog-generator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CalendarDays, CreditCard, Pencil, Trash2, Loader2 } from "lucide-react";
import type { PostDoc } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isPro, postsThisMonth, remaining } = useSubscription();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayName = user?.displayName ?? user?.email ?? "there";

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    setDeletingId(postId);
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setDeletingId(null);
  }

  useEffect(() => {
    if (!user) return;
    getUserPosts(user.uid).then(setPosts);
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {displayName}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your blog activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {postsThisMonth === 0 ? "Create your first post below" : `${postsThisMonth} post${postsThisMonth === 1 ? "" : "s"} this month`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posts This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {isPro ? "Unlimited on Pro plan" : `${remaining} remaining on Free plan`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isPro ? "Pro" : "Free"}</div>
            <p className="text-xs text-muted-foreground">
              {isPro ? "Full access to all features" : "Upgrade to Pro for unlimited posts"}
            </p>
          </CardContent>
        </Card>
      </div>

      <BlogGenerator onSave={() => getUserPosts(user!.uid).then(setPosts)} />

      {/* Your Posts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            All Posts
          </CardTitle>
          <p className="text-sm text-muted-foreground">{posts.length} post{posts.length !== 1 ? "s" : ""} total</p>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No posts yet. Generate one above!</p>
          ) : (
            <ul className="divide-y">
              {posts.map((post) => {
                const ts = post.createdAt as unknown as { seconds: number };
                const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(post.createdAt as unknown as string);
                return (
                  <li key={post.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString()} · {post.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/dashboard/posts/${post.id}`} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Link>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
