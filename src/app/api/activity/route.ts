import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ activity: store.activity, campaigns: store.campaigns });
}
