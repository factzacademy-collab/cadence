import { NextRequest, NextResponse } from "next/server";
import { generateCaptions } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }
  const captions = await generateCaptions({
    topic: body.topic,
    platforms: Array.isArray(body.platforms) ? body.platforms : [],
    tone: body.tone ?? "friendly",
    count: body.count ?? 3,
  });
  if (!captions.length) {
    return NextResponse.json({
      captions: [
        `Here's a thought on ${body.topic} — keep it human, keep it short, and always give one reason to tap through. #contentstrategy`,
        `${body.topic}, simplified: start with the hook, deliver the value, end with the ask. That's the whole formula. #socialmedia`,
        `Quick take on ${body.topic}: your audience doesn't need more noise. They need rhythm. Post with intent. #marketing`,
      ],
    });
  }
  return NextResponse.json({ captions });
}
