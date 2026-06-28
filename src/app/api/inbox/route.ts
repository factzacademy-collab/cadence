import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ inbox: store.inbox });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const item = store.resolveInbox(body.id, body.status ?? "resolved");
  return NextResponse.json({ item });
}
