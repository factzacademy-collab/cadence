import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { ANALYTICS, PLATFORM_BREAKDOWN, STATS } from "@/lib/data/mock";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requirePermission("view_insights");
  if (!isAuthorized(ctx)) return ctx;
  return NextResponse.json({
    timeseries: store.analytics,
    breakdown: store.breakdown,
    stats: STATS,
    totals: {
      impressions: ANALYTICS.reduce((a, b) => a + b.impressions, 0),
      reach: ANALYTICS.reduce((a, b) => a + b.reach, 0),
      engagement: ANALYTICS.reduce((a, b) => a + b.engagement, 0),
      clicks: ANALYTICS.reduce((a, b) => a + b.clicks, 0),
      followers: PLATFORM_BREAKDOWN.reduce((a, b) => a + b.followers, 0),
    },
  });
}
