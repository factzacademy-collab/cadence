import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ integrations: store.integrations });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const it = store.toggleIntegration(body.id);
  return NextResponse.json({ integration: it });
}
