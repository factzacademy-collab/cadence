import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword, gradientFor } from "@/lib/password";

/**
 * NextAuth options for Cadence.
 * - Credentials provider backed by Prisma (User.passwordHash).
 * - JWT session strategy (works in serverless/edge without a session table).
 * - On first sign-in of a brand-new email, no account is auto-created; users
 *   must register via the /api/auth/register route first.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;
        try {
          const user = await db.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;
          if (!verifyPassword(password, user.passwordHash)) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.avatarColor = gradientFor(user.email ?? "");
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { avatarColor?: string }).avatarColor =
          token.avatarColor as string;
      }
      return session;
    },
  },
};

export type AppSession = {
  user: { id: string; email: string; name?: string; avatarColor?: string };
};
