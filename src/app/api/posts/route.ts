import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import type { PlatformId } from "@/lib/brand";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const posts = store.listPosts({
    status: sp.get("status") ?? undefined,
    platform: (sp.get("platform") as PlatformId) ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }
  const post = store.createPost({
    text: body.text,
    scheduledAt: body.scheduledAt,
    status: body.status,
    platforms: body.platforms,
    mediaIds: body.mediaIds,
    campaignId: body.campaignId,
  });
  return NextResponse.json({ post }, { status: 201 });
}
