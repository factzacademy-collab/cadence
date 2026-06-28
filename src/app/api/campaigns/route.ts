import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ campaigns: await store.listCampaigns() });
}
