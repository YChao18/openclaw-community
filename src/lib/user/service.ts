import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const currentUserSelect = Prisma.validator<Prisma.UserSelect>()({
  createdAt: true,
  email: true,
  emailVerified: true,
  headline: true,
  id: true,
  image: true,
  name: true,
  role: true,
  username: true,
});

export type CurrentUser = Prisma.UserGetPayload<{
  select: typeof currentUserSelect;
}>;

export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 10;
export const USERNAME_PATTERN = /^[A-Za-z0-9_\u4e00-\u9fa5]+$/;

export function normalizeUsername(value: string) {
  return value.trim();
}

export function validateUsername(username: string) {
  if (username.length < USERNAME_MIN_LENGTH) {
    return `用户名至少需要 ${USERNAME_MIN_LENGTH} 个字符。`;
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return `用户名最多 ${USERNAME_MAX_LENGTH} 个字符。`;
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "用户名只允许中文、字母、数字和下划线。";
  }

  return null;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    select: currentUserSelect,
    where: {
      id,
    },
  });
}

export async function isUsernameTaken(username: string, excludeUserId?: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return false;
  }

  const existingUser = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      id: excludeUserId
        ? {
            not: excludeUserId,
          }
        : undefined,
      username: {
        equals: normalizedUsername,
        mode: Prisma.QueryMode.insensitive,
      },
    },
  });

  return Boolean(existingUser);
}

export async function updateUsernameForUser(params: {
  userId: string;
  username: string;
}) {
  return prisma.user.update({
    data: {
      username: params.username,
    },
    select: currentUserSelect,
    where: {
      id: params.userId,
    },
  });
}

export async function getUserPosts(userId: string) {
  return prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
      excerpt: true,
      id: true,
      slug: true,
      status: true,
      title: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    where: {
      authorId: userId,
    },
  });
}

export function getUserDisplayName(user: {
  email: string | null;
  name: string | null;
  username: string | null;
}) {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  if (user.username?.trim()) {
    return user.username.trim();
  }

  if (user.email?.trim()) {
    return user.email.trim();
  }

  return "OpenClaw 用户";
}
