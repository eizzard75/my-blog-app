import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const FREE_LIMIT = 5;

async function checkGenerationAllowed(uid: string): Promise<{ allowed: boolean; reason?: string }> {
  const userSnap = await getAdminDb().collection("users").doc(uid).get();
  const userData = userSnap.data();
  const status = userData?.subscriptionStatus ?? "inactive";
  const isPro = status === "active" || status === "trialing";
  if (isPro) return { allowed: true };

  // Count all user posts and filter by month in memory to avoid needing a composite index
  const postsSnap = await getAdminDb().collection("posts").where("uid", "==", uid).get();
  const now = new Date();
  const thisMonthCount = postsSnap.docs.filter((d) => {
    const createdAt = d.data().createdAt?.toDate?.() ?? new Date(d.data().createdAt);
    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;

  if (thisMonthCount >= FREE_LIMIT) {
    return { allowed: false, reason: `Free plan limit reached (${FREE_LIMIT}/month). Upgrade to Pro for unlimited posts.` };
  }
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key is not configured" },
      { status: 500 },
    );
  }

  const uid = request.headers.get("x-user-uid");
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { allowed, reason } = await checkGenerationAllowed(uid);
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 403 });
    }
  } catch (err) {
    console.error("Subscription check error:", err);
    // Fail open — allow generation if the check itself errors
  }

  let body: { topic: string; tone: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { topic, tone } = body;
  if (!topic || !tone) {
    return NextResponse.json(
      { error: "Topic and tone are required" },
      { status: 400 },
    );
  }

  const systemPrompt = `You are an expert blog writer. Write a well-structured, engaging blog post on the given topic. Use the specified tone throughout. Include a compelling title, introduction, multiple sections with headers (use markdown ## for headers), and a conclusion. Aim for around 800-1200 words. Do not use em dashes (—) anywhere in the post; use commas, periods, or rewrite the sentence instead.`;

  const userPrompt = `Write a blog post about: ${topic}\n\nTone: ${tone}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "BlogAI",
      },
      body: JSON.stringify({
        model: "anthropic/claude-opus-4-7",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter ${response.status}: ${errorText}` },
        { status: 502 },
      );
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
