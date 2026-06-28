import "server-only";
import { getServerSession } from "next-auth";
import { authOptions, type AppSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Role-Based Access Control for Cadence.
 *
 * Permissions matrix (must match the client-side matrix in views/team.tsx):
 *   Owner    — everything
 *   Admin    — everything except billing (manage_workspace)
 *   Editor   — create/approve(no)/publish/edit_calendar/view_insights
 *   Approver — create/approve/publish(no)/edit_calendar/view_insights
 *   Viewer   — view_insights only
 */
export type Permission =
  | "create_posts"
  | "approve_posts"
  | "publish"
  | "edit_calendar"
  | "view_insights"
  | "manage_team"
  | "manage_billing"
  | "manage_integrations";

const MATRIX: Record<string, Set<Permission>> = {
  Owner: new Set<Permission>([
    "create_posts", "approve_posts", "publish", "edit_calendar",
    "view_insights", "manage_team", "manage_billing", "manage_integrations",
  ]),
  Admin: new Set<Permission>([
    "create_posts", "approve_posts", "publish", "edit_calendar",
    "view_insights", "manage_team", "manage_integrations",
  ]),
  Editor: new Set<Permission>([
    "create_posts", "publish", "edit_calendar", "view_insights",
  ]),
  Approver: new Set<Permission>([
    "create_posts", "approve_posts", "edit_calendar", "view_insights",
  ]),
  Viewer: new Set<Permission>(["view_insights"]),
};

export function roleHasPermission(role: string, perm: Permission): boolean {
  return MATRIX[role]?.has(perm) ?? false;
}

export interface AuthContext {
  userId: string;
  workspaceId: string;
  role: string;
  session: AppSession;
}

/**
 * Resolve the authenticated user's workspace + role for the request.
 * Returns null if unauthenticated or if the user has no workspace membership.
 * In single-workspace dev mode, picks the user's first membership.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = (await getServerSession(authOptions)) as AppSession | null;
  if (!session?.user?.id) return null;
  try {
    const membership = await db.membership.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    });
    if (!membership) return null;
    return {
      userId: session.user.id,
      workspaceId: membership.workspaceId,
      role: membership.role,
      session,
    };
  } catch (e) {
    console.error("[rbac] getAuthContext error:", e);
    return null;
  }
}

/**
 * Require an authenticated session. Returns the AuthContext, or a 401
 * NextResponse if unauthenticated. Usage in an API route:
 *
 *   const ctx = await requireAuth();
 *   if (ctx instanceof NextResponse) return ctx;
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return ctx;
}

/**
 * Require a specific permission. Returns the AuthContext, or a 403
 * NextResponse if the user's role lacks the permission (or 401 if
 * unauthenticated). Usage:
 *
 *   const ctx = await requirePermission("manage_team");
 *   if (ctx instanceof NextResponse) return ctx;
 */
export async function requirePermission(
  perm: Permission
): Promise<AuthContext | NextResponse> {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  if (!roleHasPermission(ctx.role, perm)) {
    return NextResponse.json(
      { error: `Your role (${ctx.role}) does not permit ${perm}` },
      { status: 403 }
    );
  }
  return ctx;
}

/** Type guard: was the RBAC check passed? (ctx is AuthContext, not an error response) */
export function isAuthorized(ctx: AuthContext | NextResponse): ctx is AuthContext {
  return !(ctx instanceof NextResponse);
}
