import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export async function GET() {
  const ctx = await requirePermission("view_insights");
  if (!isAuthorized(ctx)) return ctx;
  return NextResponse.json({ campaigns: await store.listCampaigns() });
}
