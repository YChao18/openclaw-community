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

type FavoritePostQueryResult = Prisma.PostFavoriteGetPayload<typeof favoritePostArgs>;

export type FavoritePostItem = FavoritePostQueryResult["post"] & {
  favoritesCount: number;
  favoritedAt: Date;
  likesCount: number;
  viewCount: number;
};

function withPostCounts<T extends { _count: { favorites: number; likes: number } }>(
  post: T,
) {
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

  const viewerState = await getPostViewerState(post.id, viewerId);

  return {
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
  authorId: string;
  content: string;
  tagIds: string[];
  title: string;
}) {
  const slug = await createUniquePostSlug(input.title);

  return prisma.post.create({
    data: {
      authorId: input.authorId,
      content: input.content,
      excerpt: getPostExcerpt(input.content),
      publishedAt: new Date(),
      slug,
      tags: {
        connect: input.tagIds.map((id) => ({
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
