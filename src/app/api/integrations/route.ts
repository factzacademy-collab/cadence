import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;
  return NextResponse.json({ integrations: await store.listIntegrations() });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requirePermission("manage_integrations");
  if (!isAuthorized(ctx)) return ctx;
  const body = await req.json().catch(() => ({}));
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const it = await store.toggleIntegration(body.id);
  return NextResponse.json({ integration: it });
}
