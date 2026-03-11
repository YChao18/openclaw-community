import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUserSelect } from "@/lib/user/service";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/config";
import {
  generateSessionToken,
  getSessionExpiryDate,
  hashSessionToken,
} from "@/lib/auth/crypto";

export type AppSession = {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
};

function getSessionCookieOptions(expires: Date) {
  return {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSession(userId: string) {
  const rawToken = generateSessionToken();
  const sessionToken = hashSessionToken(rawToken);
  const expires = getSessionExpiryDate();

  await prisma.session.create({
    data: {
      expires,
      sessionToken,
      userId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    AUTH_SESSION_COOKIE_NAME,
    rawToken,
    getSessionCookieOptions(expires),
  );

  return expires;
}

export async function deleteSessionByRawToken(rawToken: string | undefined) {
  if (!rawToken) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      sessionToken: hashSessionToken(rawToken),
    },
  });
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  await deleteSessionByRawToken(rawToken);
  cookieStore.delete(AUTH_SESSION_COOKIE_NAME);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    include: {
      user: {
        select: currentUserSelect,
      },
    },
    where: {
      sessionToken: hashSessionToken(rawToken),
    },
  });

  if (!session || session.expires <= new Date()) {
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  return session?.user ?? null;
}

export async function auth() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return { user };
}

export async function requireUser(redirectTo?: string) {
  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  if (redirectTo) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  redirect("/login");
}
