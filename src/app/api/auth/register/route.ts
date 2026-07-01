import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, gradientFor } from "@/lib/password";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { ...LIMITS.auth, keyPrefix: "register" });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        avatarColor: gradientFor(normalizedEmail),
      },
    });

    // Provision a personal workspace + Owner membership so the new user lands
    // in a usable dashboard immediately.
    const workspace = await db.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug: `${normalizedEmail.split("@")[0]}-hq`,
        plan: "team",
        memberships: {
          create: { userId: user.id, role: "Owner" },
        },
      },
    });

    // Send a welcome email (mock mode logs to console if no provider key).
    const { sendEmail, welcomeEmail } = await import("@/lib/email");
    const email = welcomeEmail(name);
    email.to = normalizedEmail;
    sendEmail(email).catch((e) => console.error("[register] welcome email failed:", e));

    return NextResponse.json({
      ok: true,
      userId: user.id,
      workspaceId: workspace.id,
    });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
