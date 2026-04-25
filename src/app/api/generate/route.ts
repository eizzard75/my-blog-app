import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key is not configured" },
      { status: 500 },
    );
  }

  // Verify the user is authenticated via middleware headers
  const uid = request.headers.get("x-user-uid");
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const systemPrompt = `You are an expert blog writer. Write a well-structured, engaging blog post on the given topic. Use the specified tone throughout. Include a compelling title, introduction, multiple sections with headers (use markdown ## for headers), and a conclusion. Aim for around 800-1200 words.`;

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
        model: "anthropic/claude-sonnet-4-20250514",
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
        { error: "Failed to generate blog post. Check your OpenRouter API key and account." },
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
