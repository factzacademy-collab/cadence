import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
});

/**
 * Create a new workspace. The authenticated user becomes its Owner.
 * Also sets it as the active workspace via cookie.
 */
export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const workspace = await db.workspace.create({
      data: {
        name: parsed.data.name,
        slug,
        plan: "team",
        memberships: {
          create: { userId: ctx.userId, role: "Owner" },
        },
      },
    });
    const res = NextResponse.json({ workspace }, { status: 201 });
    res.cookies.set("cadence.workspace", workspace.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[workspaces/create] error:", e);
    return NextResponse.json({ error: "Could not create workspace" }, { status: 500 });
  }
}
