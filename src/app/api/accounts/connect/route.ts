import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";
import type { PlatformId } from "@/lib/brand";

export const dynamic = "force-dynamic";

const VALID: PlatformId[] = ["x", "instagram", "linkedin", "facebook", "tiktok", "youtube", "threads", "pinterest"];

const schema = z.object({
  platform: z.enum(VALID as [string, ...string[]]),
});

/**
 * "Connect" a social account. In production this would redirect to the
 * platform's OAuth flow; here we simulate a successful connection by
 * upserting a SocialAccount row with mock handle/follower data.
 */
export async function POST(req: NextRequest) {
  const ctx = await requirePermission("manage_integrations");
  if (!isAuthorized(ctx)) return ctx;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  const platform = parsed.data.platform as PlatformId;

  const mockData: Record<PlatformId, { handle: string; followers: number }> = {
    x: { handle: "@cadence", followers: 92300 },
    instagram: { handle: "@cadencehq", followers: 184200 },
    linkedin: { handle: "cadence", followers: 64100 },
    facebook: { handle: "/cadence", followers: 51200 },
    tiktok: { handle: "@cadence", followers: 211400 },
    youtube: { handle: "@cadence", followers: 38900 },
    threads: { handle: "@cadence", followers: 27800 },
    pinterest: { handle: "cadence", followers: 15600 },
  };

  try {
    const existing = await db.socialAccount.findUnique({
      where: { workspaceId_platform: { workspaceId: ctx.workspaceId, platform } },
    });
    let account;
    if (existing) {
      account = await db.socialAccount.update({
        where: { id: existing.id },
        data: { connected: true, ...mockData[platform] },
      });
    } else {
      account = await db.socialAccount.create({
        data: {
          workspaceId: ctx.workspaceId,
          platform,
          displayName: "Cadence",
          connected: true,
          ...mockData[platform],
        },
      });
    }
    return NextResponse.json({ account });
  } catch (e) {
    console.error("[accounts/connect] error:", e);
    return NextResponse.json({ error: "Could not connect account" }, { status: 500 });
  }
}
