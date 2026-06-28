import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { requireAuth, isAuthorized } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthorized(ctx)) return ctx;
  return NextResponse.json({ accounts: await store.listAccounts() });
}
