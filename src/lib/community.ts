import { PostStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserDisplayName } from "@/lib/user/service";

const postFeedArgs = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: {
    author: {
      select: {
        email: true,
        id: true,
        image: true,
        name: true,
        username: true,
      },
    },
    tags: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    _count: {
      select: {
        comments: true,
      },
    },
  },
});

export type PostFeedItem = Prisma.PostGetPayload<typeof postFeedArgs>;

export type TagFacet = {
  id: string;
  description: string | null;
  name: string;
  postCount: number;
  slug: string;
};

const postDetailArgs = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: {
    author: {
      select: {
        email: true,
        headline: true,
        id: true,
        image: true,
        name: true,
        username: true,
      },
    },
    comments: {
      include: {
        author: {
          select: {
            email: true,
            id: true,
            image: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    },
    tags: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    _count: {
      select: {
        comments: true,
      },
    },
  },
});

export type PostDetail = Prisma.PostGetPayload<typeof postDetailArgs>;

export type CommunityTagOption = {
  description: string | null;
  id: string;
  name: string;
  postCount: number;
  slug: string;
};

type GetPostFeedOptions = {
  limit?: number;
  tag?: string;
};

export async function getPostFeed(options: GetPostFeedOptions = {}) {
  const where: Prisma.PostWhereInput = {
    status: PostStatus.PUBLISHED,
    ...(options.tag
      ? {
          tags: {
            some: {
              slug: options.tag,
            },
          },
        }
      : {}),
  };

  return prisma.post.findMany({
    ...postFeedArgs,
    orderBy: [{ createdAt: "desc" }],
    take: options.limit ?? 24,
    where,
  });
}

export async function getTagFacets() {
  const tags = await prisma.tag.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      description: true,
      id: true,
      name: true,
      posts: {
        select: {
          id: true,
        },
        where: {
          status: PostStatus.PUBLISHED,
        },
      },
      slug: true,
    },
  });

  return tags.map<TagFacet>(({ description, id, name, posts, slug }) => ({
    description,
    id,
    name,
    postCount: posts.length,
    slug,
  }));
}

export async function getTagOptions() {
  return getTagFacets();
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    ...postDetailArgs,
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
  });
}

export async function getPostRouteSlugs() {
  const posts = await prisma.post.findMany({
    select: {
      slug: true,
    },
    where: {
      status: PostStatus.PUBLISHED,
    },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function getCommunitySnapshot() {
  const [posts, tags] = await Promise.all([
    prisma.post.count({
      where: {
        status: PostStatus.PUBLISHED,
      },
    }),
    prisma.tag.count(),
  ]);

  return {
    postCount: posts,
    tagCount: tags,
  };
}

export function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getAuthorDisplayName(author: {
  email: string | null;
  name: string | null;
  username: string | null;
}) {
  return getUserDisplayName(author);
}

export function getPostExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117)}...`;
}

export function slugifyPostTitle(title: string) {
  const normalized = title
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const slug = normalized
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "post";
}

export async function createUniquePostSlug(title: string) {
  const baseSlug = slugifyPostTitle(title);
  const matches = await prisma.post.findMany({
    select: {
      slug: true,
    },
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
  });

  const existing = new Set(matches.map((item) => item.slug));

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  let nextSlug = `${baseSlug}-${index}`;

  while (existing.has(nextSlug)) {
    index += 1;
    nextSlug = `${baseSlug}-${index}`;
  }

  return nextSlug;
}
