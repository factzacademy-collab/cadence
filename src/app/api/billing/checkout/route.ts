import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, STRIPE_ENABLED } from "@/lib/stripe";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["team", "scale"]),
  cycle: z.enum(["monthly", "annual"]),
  seats: z.number().int().min(1).max(100).default(1),
});

export async function POST(req: NextRequest) {
  const ctx = await requirePermission("manage_billing");
  if (!isAuthorized(ctx)) return ctx;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession({
      ...parsed.data,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      email: ctx.session.user.email,
    });
    return NextResponse.json({ url: result.url, sessionId: result.sessionId, mock: !STRIPE_ENABLED });
  } catch (e) {
    console.error("[billing/checkout] error:", e);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
