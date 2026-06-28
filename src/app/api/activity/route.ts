import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requirePermission("view_insights");
  if (!isAuthorized(ctx)) return ctx;
  const [activity, campaigns] = await Promise.all([
    store.listActivity(),
    store.listCampaigns(),
  ]);
  return NextResponse.json({ activity, campaigns });
}
