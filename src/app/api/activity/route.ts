import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export async function GET() {
  const [activity, campaigns] = await Promise.all([
    store.listActivity(),
    store.listCampaigns(),
  ]);
  return NextResponse.json({ activity, campaigns });
}
