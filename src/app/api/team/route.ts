import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { requireAuth, requirePermission, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;
  return NextResponse.json({ team: await store.listTeam() });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePermission("manage_team");
  if (!isAuthorized(ctx)) return ctx;
  const body = await req.json().catch(() => ({}));
  if (!body?.name || !body?.email)
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  const m = await store.inviteMember(body.name, body.email, body.role ?? "Editor");
  return NextResponse.json({ member: m }, { status: 201 });
}
