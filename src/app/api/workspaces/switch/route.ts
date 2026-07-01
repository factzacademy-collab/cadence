import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Switch the active workspace. Sets a cookie `cadence.workspace` with the
 * workspace id, which getAuthContext reads to scope requests.
 */
export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;

  const body = await req.json().catch(() => ({}));
  const workspaceId = body?.workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  // Verify the user is a member of the target workspace.
  try {
    const membership = await db.membership.findUnique({
      where: {
        userId_workspaceId: { userId: ctx.userId, workspaceId },
      },
    });
    if (!membership) {
      return NextResponse.json({ error: "Not a member of that workspace" }, { status: 403 });
    }
    const res = NextResponse.json({
      ok: true,
      workspaceId,
      role: membership.role,
    });
    res.cookies.set("cadence.workspace", workspaceId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[workspaces/switch] error:", e);
    return NextResponse.json({ error: "Could not switch workspace" }, { status: 500 });
  }
}
