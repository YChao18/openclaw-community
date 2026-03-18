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
        favorites: true,
        likes: true,
      },
    },
  },
});

type PostFeedQueryResult = Prisma.PostGetPayload<typeof postFeedArgs>;

export type PostFeedItem = PostFeedQueryResult & {
  favoritesCount: number;
  likesCount: number;
  viewCount: number;
};

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
        favorites: true,
        likes: true,
      },
    },
  },
});

type PostDetailQueryResult = Prisma.PostGetPayload<typeof postDetailArgs>;

export type PostDetail = PostDetailQueryResult & {
  favoritesCount: number;
  likesCount: number;
  viewerState: {
    favorited: boolean;
    liked: boolean;
  };
};

export type CommunityTagOption = {
  description: string | null;
  id: string;
  name: string;
  postCount: number;
  slug: string;
};

export type PostAttachmentItem = {
  createdAt?: Date;
  id: string;
  mimeType: string;
  originalName: string;
  size: number;
  storagePath: string;
};

export type EditablePost = {
  attachments: PostAttachmentItem[];
  content: string;
  id: string;
  slug: string;
  tagIds: string[];
  title: string;
};

export type PostLikeIntent = "like" | "unlike";

export type PostFavoriteIntent = "save" | "unsave";

type GetPostFeedOptions = {
  limit?: number;
  tag?: string;
};

const favoritePostArgs = Prisma.validator<Prisma.PostFavoriteDefaultArgs>()({
  include: {
    post: {
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
            favorites: true,
            likes: true,
          },
        },
      },
    },
  },
});

type FavoritePostQueryResult = Prisma.PostFavoriteGetPayload<
  typeof favoritePostArgs
>;

export type FavoritePostItem = FavoritePostQueryResult["post"] & {
  favoritesCount: number;
  favoritedAt: Date;
  likesCount: number;
  viewCount: number;
};

const FALLBACK_TAG_NAME = "其他";
const FALLBACK_TAG_SLUG = "other";
const FALLBACK_TAG_DESCRIPTION = "用于归类未指定明确主题的帖子。";

function withPostCounts<
  T extends { _count: { favorites: number; likes: number } },
>(post: T) {
  return {
    ...post,
    favoritesCount: post._count.favorites,
    likesCount: post._count.likes,
  };
}

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

  const posts = await prisma.post.findMany({
    ...postFeedArgs,
    orderBy: [{ createdAt: "desc" }],
    take: options.limit ?? 24,
    where,
  });

  return posts.map((post) => withPostCounts(post));
}

export async function getTagFacets() {
  await ensureFallbackTag();

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

export async function getPostBySlug(slug: string, viewerId?: string) {
  const post = await prisma.post.findFirst({
    ...postDetailArgs,
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
  });

  if (!post) {
    return null;
  }

  const attachments = await getPostAttachments(post.id);
  const viewerState = await getPostViewerState(post.id, viewerId);

  return {
    attachments,
    ...withPostCounts(post),
    viewerState,
  };
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

export async function getCommunityActivityStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeSince = new Date();
  activeSince.setHours(0, 0, 0, 0);
  activeSince.setDate(activeSince.getDate() - 6);

  const [
    todayPosts,
    activePostAuthors,
    activeCommentAuthors,
    activeLikeUsers,
    activeFavoriteUsers,
    publishedPosts,
  ] = await Promise.all([
    prisma.post.count({
      where: {
        status: PostStatus.PUBLISHED,
        createdAt: {
          gte: today,
        },
      },
    }),
    prisma.post.findMany({
      distinct: ["authorId"],
      select: {
        authorId: true,
      },
      where: {
        status: PostStatus.PUBLISHED,
        createdAt: {
          gte: activeSince,
        },
      },
    }),
    prisma.comment.findMany({
      distinct: ["authorId"],
      select: {
        authorId: true,
      },
      where: {
        createdAt: {
          gte: activeSince,
        },
        post: {
          status: PostStatus.PUBLISHED,
        },
      },
    }),
    prisma.postLike.findMany({
      distinct: ["userId"],
      select: {
        userId: true,
      },
      where: {
        createdAt: {
          gte: activeSince,
        },
        post: {
          status: PostStatus.PUBLISHED,
        },
      },
    }),
    prisma.postFavorite.findMany({
      distinct: ["userId"],
      select: {
        userId: true,
      },
      where: {
        createdAt: {
          gte: activeSince,
        },
        post: {
          status: PostStatus.PUBLISHED,
        },
      },
    }),
    prisma.post.findMany({
      select: {
        excerpt: true,
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
        title: true,
      },
      where: {
        status: PostStatus.PUBLISHED,
      },
    }),
  ]);

  const activeUsers = new Set([
    ...activePostAuthors.map((item) => item.authorId),
    ...activeCommentAuthors.map((item) => item.authorId),
    ...activeLikeUsers.map((item) => item.userId),
    ...activeFavoriteUsers.map((item) => item.userId),
  ]);

  return {
    activeUsers: activeUsers.size,
    solvedCount: publishedPosts.filter((post) => isSolvedPost(post)).length,
    todayPosts,
  };
}

export async function getFavoritePosts(userId: string) {
  const favorites = await prisma.postFavorite.findMany({
    ...favoritePostArgs,
    orderBy: {
      createdAt: "desc",
    },
    where: {
      userId,
      post: {
        status: PostStatus.PUBLISHED,
      },
    },
  });

  return favorites.map(({ createdAt, post }) => ({
    ...withPostCounts(post),
    favoritedAt: createdAt,
  }));
}

export async function getPublishedPostIdentity(input: {
  postId: string;
  postSlug: string;
}) {
  return prisma.post.findFirst({
    select: {
      id: true,
      slug: true,
    },
    where: {
      id: input.postId,
      slug: input.postSlug,
      status: PostStatus.PUBLISHED,
    },
  });
}

export async function createCommunityPost(input: {
  attachments?: Array<{
    mimeType: string;
    originalName: string;
    size: number;
    storagePath: string;
  }>;
  authorId: string;
  content: string;
  tagIds: string[];
  title: string;
}) {
  const tagIds = await resolvePostTagIds(input.tagIds);
  const slug = await createUniquePostSlug(input.title);

  return prisma.post.create({
    data: {
      authorId: input.authorId,
      attachments:
        input.attachments && input.attachments.length > 0
          ? {
              create: input.attachments,
            }
          : undefined,
      content: input.content,
      excerpt: getPostExcerpt(input.content),
      publishedAt: new Date(),
      slug,
      tags: {
        connect: tagIds.map((id) => ({
          id,
        })),
      },
      title: input.title,
    },
    select: {
      slug: true,
    },
  });
}

export async function createCommunityComment(input: {
  authorId: string;
  content: string;
  postId: string;
}) {
  await prisma.comment.create({
    data: {
      authorId: input.authorId,
      content: input.content,
      postId: input.postId,
    },
  });
}

export async function deleteCommunityComment(input: {
  authorId: string;
  commentId: string;
}) {
  return prisma.comment.deleteMany({
    where: {
      authorId: input.authorId,
      id: input.commentId,
    },
  });
}

export async function getEditablePostBySlug(input: {
  authorId: string;
  slug: string;
}): Promise<EditablePost | null> {
  const post = await prisma.post.findFirst({
    select: {
      content: true,
      id: true,
      slug: true,
      tags: {
        select: {
          id: true,
        },
      },
      title: true,
    },
    where: {
      authorId: input.authorId,
      slug: input.slug,
    },
  });

  if (!post) {
    return null;
  }

  const attachments = await getPostAttachments(post.id);

  return {
    attachments,
    content: post.content,
    id: post.id,
    slug: post.slug,
    tagIds: post.tags.map((tag) => tag.id),
    title: post.title,
  };
}

export async function updateCommunityPost(input: {
  attachments?: Array<{
    mimeType: string;
    originalName: string;
    size: number;
    storagePath: string;
  }>;
  content: string;
  keepAttachmentIds: string[];
  postId: string;
  tagIds: string[];
  title: string;
}) {
  const tagIds = await resolvePostTagIds(input.tagIds);

  return prisma.post.update({
    data: {
      attachments: {
        create: input.attachments ?? [],
        deleteMany: {
          id: {
            notIn: input.keepAttachmentIds,
          },
        },
      },
      content: input.content,
      excerpt: getPostExcerpt(input.content),
      tags: {
        set: tagIds.map((id) => ({
          id,
        })),
      },
      title: input.title,
    },
    select: {
      slug: true,
    },
    where: {
      id: input.postId,
    },
  });
}

export async function deleteCommunityPost(input: { postId: string }) {
  await prisma.post.delete({
    where: {
      id: input.postId,
    },
  });
}

export async function setPostLikeState(input: {
  intent: PostLikeIntent;
  postId: string;
  postSlug: string;
  userId: string;
}) {
  const post = await getPublishedPostIdentity({
    postId: input.postId,
    postSlug: input.postSlug,
  });

  if (!post) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    if (input.intent === "like") {
      await tx.postLike.upsert({
        create: {
          postId: input.postId,
          userId: input.userId,
        },
        update: {},
        where: {
          postId_userId: {
            postId: input.postId,
            userId: input.userId,
          },
        },
      });

      return;
    }

    await tx.postLike.deleteMany({
      where: {
        postId: input.postId,
        userId: input.userId,
      },
    });
  });

  return post;
}

export async function setPostFavoriteState(input: {
  intent: PostFavoriteIntent;
  postId: string;
  postSlug: string;
  userId: string;
}) {
  const post = await getPublishedPostIdentity({
    postId: input.postId,
    postSlug: input.postSlug,
  });

  if (!post) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    if (input.intent === "save") {
      await tx.postFavorite.upsert({
        create: {
          postId: input.postId,
          userId: input.userId,
        },
        update: {},
        where: {
          postId_userId: {
            postId: input.postId,
            userId: input.userId,
          },
        },
      });

      return;
    }

    await tx.postFavorite.deleteMany({
      where: {
        postId: input.postId,
        userId: input.userId,
      },
    });
  });

  return post;
}

export async function recordPostView(input: {
  postId: string;
  userId: string | null;
  viewerKey: string;
}) {
  const now = new Date();
  const dedupThreshold = new Date(now.getTime() - 30 * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      select: {
        id: true,
      },
      where: {
        id: input.postId,
      },
    });

    if (!post) {
      return null;
    }

    const postViewWhere = {
      postId_viewerKey: {
        postId: input.postId,
        viewerKey: input.viewerKey,
      },
    } satisfies Prisma.PostViewWhereUniqueInput;

    const existingView = await tx.postView.findUnique({
      select: {
        lastViewedAt: true,
      },
      where: postViewWhere,
    });

    if (!existingView) {
      const createdView = await tx.postView.createMany({
        data: {
          lastViewedAt: now,
          postId: input.postId,
          userId: input.userId,
          viewerKey: input.viewerKey,
        },
        skipDuplicates: true,
      });

      if (createdView.count === 1) {
        await tx.post.update({
          data: {
            viewCount: {
              increment: 1,
            },
          },
          where: {
            id: input.postId,
          },
        });

        return true;
      }

      await tx.postView.update({
        data: {
          lastViewedAt: now,
          userId: input.userId,
        },
        where: postViewWhere,
      });

      return false;
    }

    const countedRepeatView = await tx.postView.updateMany({
      data: {
        lastViewedAt: now,
        userId: input.userId,
      },
      where: {
        lastViewedAt: {
          lt: dedupThreshold,
        },
        postId: input.postId,
        viewerKey: input.viewerKey,
      },
    });

    if (countedRepeatView.count === 0) {
      await tx.postView.update({
        data: {
          lastViewedAt: now,
          userId: input.userId,
        },
        where: postViewWhere,
      });

      return false;
    }

    await tx.post.update({
      data: {
        viewCount: {
          increment: 1,
        },
      },
      where: {
        id: input.postId,
      },
    });

    return true;
  });
}

export function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(date: Date, now = new Date()) {
  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  if (absDiffMs < 60 * 1000) {
    return "刚刚";
  }

  const formatter = new Intl.RelativeTimeFormat("zh-CN", {
    numeric: "auto",
  });

  const units = [
    { unit: "year", value: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", value: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", value: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", value: 1000 * 60 * 60 * 24 },
    { unit: "hour", value: 1000 * 60 * 60 },
    { unit: "minute", value: 1000 * 60 },
  ] as const;

  for (const item of units) {
    if (absDiffMs >= item.value) {
      return formatter.format(Math.round(diffMs / item.value), item.unit);
    }
  }

  return "刚刚";
}

export function getPostTrendScore(post: {
  _count: { comments: number };
  favoritesCount: number;
  likesCount: number;
  viewCount: number;
}) {
  return (
    post.likesCount * 4 +
    post.favoritesCount * 3 +
    post._count.comments * 2 +
    post.viewCount * 0.05
  );
}

export function isHotPost(post: {
  _count: { comments: number };
  favoritesCount: number;
  likesCount: number;
  viewCount: number;
}) {
  return (
    post._count.comments >= 4 ||
    post.likesCount >= 3 ||
    post.favoritesCount >= 2 ||
    post.viewCount >= 120 ||
    getPostTrendScore(post) >= 18
  );
}

export function isSolvedPost(post: {
  excerpt?: string | null;
  tags: Array<{ name: string; slug: string }>;
  title: string;
}) {
  const content = [
    post.title,
    post.excerpt ?? "",
    ...post.tags.map((tag) => tag.name),
  ]
    .join(" ")
    .toLowerCase();

  return /已解决|已处理|已修复|solved|resolved|fixed/.test(content);
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

async function getPostAttachments(
  postId: string,
): Promise<PostAttachmentItem[]> {
  try {
    return await prisma.postAttachment.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
        id: true,
        mimeType: true,
        originalName: true,
        size: true,
        storagePath: true,
      },
      where: {
        postId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return [];
    }

    throw error;
  }
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

async function resolvePostTagIds(tagIds: string[]) {
  const uniqueTagIds = [...new Set(tagIds)];

  if (uniqueTagIds.length > 0) {
    return uniqueTagIds;
  }

  const fallbackTag = await ensureFallbackTag();
  return [fallbackTag.id];
}

async function ensureFallbackTag() {
  const existingTag = await prisma.tag.findUnique({
    where: {
      name: FALLBACK_TAG_NAME,
    },
  });

  if (existingTag) {
    return existingTag;
  }

  const slug = await createUniqueTagSlug(FALLBACK_TAG_SLUG);

  try {
    return await prisma.tag.create({
      data: {
        description: FALLBACK_TAG_DESCRIPTION,
        name: FALLBACK_TAG_NAME,
        slug,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const retryTag = await prisma.tag.findUnique({
        where: {
          name: FALLBACK_TAG_NAME,
        },
      });

      if (retryTag) {
        return retryTag;
      }

      return prisma.tag.create({
        data: {
          description: FALLBACK_TAG_DESCRIPTION,
          name: FALLBACK_TAG_NAME,
          slug: await createUniqueTagSlug(`${FALLBACK_TAG_SLUG}-tag`),
        },
      });
    }

    throw error;
  }
}

async function createUniqueTagSlug(baseSlug: string) {
  const matches = await prisma.tag.findMany({
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

async function getPostViewerState(postId: string, viewerId?: string) {
  if (!viewerId) {
    return {
      favorited: false,
      liked: false,
    };
  }

  const [liked, favorited] = await Promise.all([
    prisma.postLike.findUnique({
      select: {
        userId: true,
      },
      where: {
        postId_userId: {
          postId,
          userId: viewerId,
        },
      },
    }),
    prisma.postFavorite.findUnique({
      select: {
        userId: true,
      },
      where: {
        postId_userId: {
          postId,
          userId: viewerId,
        },
      },
    }),
  ]);

  return {
    favorited: Boolean(favorited),
    liked: Boolean(liked),
  };
}
