import type { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const providers =
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  providers,
  callbacks: {
    session({ session, user }) {
      const authUser = user as typeof user & {
        role?: UserRole;
        headline?: string | null;
      };

      if (session.user) {
        session.user.id = user.id;
        session.user.role = authUser.role ?? "MEMBER";
        session.user.headline = authUser.headline ?? null;
      }

      return session;
    },
  },
});
