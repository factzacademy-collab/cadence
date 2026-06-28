import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;
  return NextResponse.json({ inbox: await store.listInbox() });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requirePermission("create_posts");
  if (!isAuthorized(ctx)) return ctx;
  const body = await req.json().catch(() => ({}));
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const item = await store.resolveInbox(body.id, body.status ?? "resolved");
  return NextResponse.json({ item });
}
