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

export async function POST(req: NextRequest) {
  const ctx = await requirePermission("manage_integrations");
  if (!isAuthorized(ctx)) return ctx;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  const platform = parsed.data.platform as PlatformId;

  try {
    const account = await db.socialAccount.findUnique({
      where: { workspaceId_platform: { workspaceId: ctx.workspaceId, platform } },
    });
    if (!account) {
      return NextResponse.json({ error: "Account not connected" }, { status: 404 });
    }
    await db.socialAccount.update({
      where: { id: account.id },
      data: { connected: false },
    });
    return NextResponse.json({ ok: true, platform });
  } catch (e) {
    console.error("[accounts/disconnect] error:", e);
    return NextResponse.json({ error: "Could not disconnect account" }, { status: 500 });
  }
}
