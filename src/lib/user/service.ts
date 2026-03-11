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

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    select: currentUserSelect,
    where: {
      id,
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
