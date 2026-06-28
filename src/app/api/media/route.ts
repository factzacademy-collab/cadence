import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ media: store.media });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const m = store.addMedia(body);
  return NextResponse.json({ media: m }, { status: 201 });
}
