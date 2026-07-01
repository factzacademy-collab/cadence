import { NextRequest, NextResponse } from "next/server";
import { cadenceChat, type ChatTurn } from "@/lib/ai";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { ...LIMITS.ai, keyPrefix: "ai-chat" });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const message = body?.message;
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const history: ChatTurn[] = Array.isArray(body?.history) ? body.history : [];

  try {
    const reply = await cadenceChat(history, message);
    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    // Graceful fallback so the UI still works if the model is unavailable.
    return NextResponse.json({
      reply: `I couldn't reach the model just now (${msg}). In the meantime, here's a quick tip: aim for 3–5 posts per week per channel, lead with a hook in the first line, and end with one clear call to action.`,
    });
  }
}
