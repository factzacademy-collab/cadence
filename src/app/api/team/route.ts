import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ team: store.team });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name || !body?.email)
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  const m = store.inviteMember(body.name, body.email, body.role ?? "Editor");
  return NextResponse.json({ member: m }, { status: 201 });
}
