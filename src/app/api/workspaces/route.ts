import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;
  try {
    const memberships = await db.membership.findMany({
      where: { userId: ctx.userId },
      include: { workspace: true },
      orderBy: { createdAt: "asc" },
    });
    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      plan: m.workspace.plan,
      role: m.role,
      active: m.workspaceId === ctx.workspaceId,
    }));
    return NextResponse.json({ workspaces, activeId: ctx.workspaceId });
  } catch (e) {
    console.error("[workspaces] list error:", e);
    return NextResponse.json({ error: "Could not list workspaces" }, { status: 500 });
  }
}
