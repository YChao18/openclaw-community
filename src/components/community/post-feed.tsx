import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Eye,
  Flame,
  Hash,
  Heart,
  MessageSquareText,
  Users,
} from "lucide-react";
import type { PostFeedItem, TagFacet } from "@/lib/community";
import {
  formatRelativeTime,
  getAuthorDisplayName,
  getPostTrendScore,
  isHotPost,
  isSolvedPost,
} from "@/lib/community";
import { cn } from "@/lib/utils";

type PostFeedTab = "featured" | "hot" | "latest" | "unsolved";

type PostFeedProps = {
  activityStats: {
    activeUsers: number;
    solvedCount: number;
    todayPosts: number;
  };
  isDatabaseReady: boolean;
  posts: PostFeedItem[];
  selectedTab: PostFeedTab;
  selectedTag?: string;
  tags: TagFacet[];
};

const TAB_ITEMS: Array<{
  label: string;
  tab: PostFeedTab;
}> = [
  { label: "最新", tab: "latest" },
  { label: "热门", tab: "hot" },
  { label: "精华", tab: "featured" },
  { label: "待解决", tab: "unsolved" },
];

const RECOMMENDED_TAG_PRIORITY = [
  "agent",
  "workflow",
  "automation",
  "prompt",
  "integration",
  "browser",
  "rpa",
  "debug",
  "debugging",
];

const QUESTION_PATTERN = /[?？]|如何|怎么|为何|为什么|请教|求助|问题|排查|报错/;

export function PostFeed({
  activityStats,
  isDatabaseReady,
  posts,
  selectedTab,
  selectedTag,
  tags,
}: PostFeedProps) {
  const activeTag = selectedTag
    ? tags.find((tag) => tag.slug === selectedTag)
    : undefined;

  const hotTags = [...tags]
    .sort(
      (left, right) =>
        right.postCount - left.postCount || left.name.localeCompare(right.name),
    )
    .slice(0, 6);

  const hotTagSlugs = new Set(hotTags.map((tag) => tag.slug));
  const recommendedTags = [...tags]
    .filter((tag) => !hotTagSlugs.has(tag.slug))
    .sort((left, right) => {
      const leftPriority = getTagPriority(left.slug);
      const rightPriority = getTagPriority(right.slug);

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return (
        right.postCount - left.postCount || left.name.localeCompare(right.name)
      );
    })
    .slice(0, 6);

  const displayPosts = getDisplayPosts(posts, selectedTab);

  return (
    <div className="space-y-10" id="post-feed">
      <section className="space-y-5">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            标签探索
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            从主题切入内容，快速找到高相关讨论
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            保留现有标签筛选逻辑，并将标签做成可横向滚动的分组入口，让用户能更快进入热门话题和推荐话题。
          </p>
        </div>

        <div className="border-default bg-surface space-y-5 rounded-[1.8rem] border p-5 shadow-[0_18px_42px_var(--shadow-card)] md:p-6">
          <div className="flex flex-wrap gap-3">
            <TagPill
              href={buildPostsHref({
                tab: selectedTab === "latest" ? undefined : selectedTab,
              })}
              isActive={!selectedTag}
            >
              全部标签
            </TagPill>
          </div>

          <TagScrollerRow
            label="🔥 热门标签"
            selectedTab={selectedTab}
            selectedTag={selectedTag}
            tags={hotTags}
          />

          <TagScrollerRow
            label="⭐ 推荐标签"
            selectedTab={selectedTab}
            selectedTag={selectedTag}
            tags={recommendedTags}
          />
        </div>
      </section>

      <section className="space-y-5">
        <div className="border-default bg-surface rounded-[1.5rem] border px-5 py-4 shadow-[0_12px_32px_var(--shadow-card)]">
          <div className="text-secondary flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-primary inline-flex items-center gap-2 font-medium">
              <Users className="text-brand-yellow h-4 w-4" />
              社区活跃速览
            </span>
            <span className="h-1 w-1 rounded-full bg-current/60" />
            <span>
              今日新增{" "}
              <strong className="text-primary font-semibold">
                {activityStats.todayPosts}
              </strong>
            </span>
            <span className="h-1 w-1 rounded-full bg-current/60" />
            <span>
              活跃用户{" "}
              <strong className="text-primary font-semibold">
                {activityStats.activeUsers}
              </strong>
            </span>
            <span className="h-1 w-1 rounded-full bg-current/60" />
            <span>
              已解决{" "}
              <strong className="text-primary font-semibold">
                {formatSolvedCount(activityStats.solvedCount)}
              </strong>
            </span>
          </div>
        </div>

        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            帖子列表
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            社区讨论
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            {activeTag
              ? `当前正在查看 “${activeTag.name}” 标签下的内容，支持按最新、热门、精华和待解决切换浏览。`
              : "默认按最新内容展示，同时保留热门、精华和待解决入口，帮助用户更快进入高价值讨论。"}
          </p>
        </div>

        <div className="border-default bg-surface overflow-x-auto rounded-[1.35rem] border p-2 shadow-[0_12px_28px_var(--shadow-card)]">
          <div className="flex min-w-max gap-2">
            {TAB_ITEMS.map((item) => (
              <Link
                key={item.tab}
                href={buildPostsHref({
                  tab: item.tab === "latest" ? undefined : item.tab,
                  tag: selectedTag,
                })}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium transition",
                  selectedTab === item.tab
                    ? "bg-brand-yellow text-background shadow-[0_10px_24px_rgba(234,179,8,0.22)]"
                    : "text-secondary hover:bg-interactive-muted-hover hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {!isDatabaseReady || activeTag ? (
          <div className="border-default bg-surface rounded-[1.5rem] border px-5 py-4">
            <div className="text-secondary flex flex-wrap items-center gap-3 text-sm">
              <span className="text-primary inline-flex items-center gap-2 font-medium">
                <Hash className="text-brand-yellow h-4 w-4" />
                浏览提示
              </span>
              <span className="h-1 w-1 rounded-full bg-current/60" />
              <span>
                {!isDatabaseReady
                  ? "数据库暂未就绪，当前展示为空状态提示。"
                  : `当前标签：${activeTag?.name ?? selectedTag}`}
              </span>
            </div>
          </div>
        ) : null}

        {displayPosts.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {displayPosts.map((post) => (
              <PostCard key={post.id} post={post} selectedTab={selectedTab} />
            ))}
          </div>
        ) : (
          <EmptyPostState
            isDatabaseReady={isDatabaseReady}
            selectedTab={selectedTab}
            selectedTag={selectedTag}
          />
        )}
      </section>
    </div>
  );
}

function TagScrollerRow({
  label,
  selectedTab,
  selectedTag,
  tags,
}: {
  label: string;
  selectedTab: PostFeedTab;
  selectedTag?: string;
  tags: TagFacet[];
}) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-primary text-sm font-semibold">{label}</p>
        <p className="text-secondary text-xs">横向滚动查看更多标签入口</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {tags.map((tag) => (
            <TagPill
              key={tag.slug}
              href={buildPostsHref({
                tab: selectedTab === "latest" ? undefined : selectedTab,
                tag: tag.slug,
              })}
              isActive={selectedTag === tag.slug}
            >
              {tag.name} ({tag.postCount})
            </TagPill>
          ))}
        </div>
      </div>
    </div>
  );
}

function TagPill({
  children,
  href,
  isActive,
}: {
  children: ReactNode;
  href: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition",
        isActive
          ? "border-brand-yellow/40 bg-brand-yellow-soft text-brand-yellow"
          : "border-default bg-interactive-muted text-secondary hover:bg-interactive-muted-hover hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}

function PostCard({
  post,
  selectedTab,
}: {
  post: PostFeedItem;
  selectedTab: PostFeedTab;
}) {
  const authorName = getAuthorDisplayName(post.author);
  const hot = isHotPost(post);
  const solved = isSolvedPost(post);
  const publishedAt = post.publishedAt ?? post.createdAt;

  return (
    <article className="bg-surface border-default flex h-full flex-col rounded-[1.75rem] border p-6 shadow-[0_20px_50px_var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <AuthorAvatar image={post.author.image} name={authorName} />
          <div className="min-w-0">
            <p className="text-primary truncate text-sm font-semibold">
              {authorName}
            </p>
            <div className="text-secondary mt-1 flex flex-wrap items-center gap-2 text-xs">
              <time dateTime={publishedAt.toISOString()}>
                {formatRelativeTime(publishedAt)}
              </time>
              <span className="h-1 w-1 rounded-full bg-current/60" />
              <span className="inline-flex items-center gap-1 opacity-70">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {hot ? (
            <Badge tone="hot">
              <Flame className="h-3.5 w-3.5" />
              热门
            </Badge>
          ) : null}
          {solved ? (
            <Badge tone="solved">
              <CheckCircle2 className="h-3.5 w-3.5" />
              已解决
            </Badge>
          ) : null}
          <span className="bg-brand-yellow-soft text-brand-yellow inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold shadow-[0_10px_24px_rgba(234,179,8,0.12)]">
            <MessageSquareText className="h-4 w-4" />
            {post._count.comments} 评论
          </span>
        </div>
      </div>

      <h2 className="text-primary mt-4 text-3xl font-semibold tracking-tight">
        <Link
          href={`/posts/${post.slug}`}
          className="hover:text-brand-yellow transition"
        >
          {post.title}
        </Link>
      </h2>

      {post.excerpt ? (
        <p className="text-secondary mt-3 text-base leading-8">
          {post.excerpt}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag.id}
            href={buildPostsHref({
              tab: selectedTab === "latest" ? undefined : selectedTab,
              tag: tag.slug,
            })}
            className="border-default bg-interactive-muted text-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-[0.12em] uppercase"
          >
            {tag.name}
          </Link>
        ))}
      </div>

      <div className="text-secondary mt-5 flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-4 w-4" />
          {post.likesCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <Bookmark className="h-4 w-4" />
          {post.favoritesCount}
        </span>
        <span className="inline-flex items-center gap-1 opacity-65">
          热度 {Math.round(getPostTrendScore(post))}
        </span>
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={`/posts/${post.slug}`}
          className="text-brand-yellow hover:text-brand-yellow/80 inline-flex items-center gap-2 text-sm font-medium"
        >
          查看详情
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "hot" | "solved";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        tone === "hot"
          ? "bg-brand-lobster-soft text-primary"
          : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
      )}
    >
      {children}
    </span>
  );
}

function AuthorAvatar({
  image,
  name,
}: {
  image?: string | null;
  name: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div
      aria-label={`${name} 的头像`}
      className="border-default from-brand-yellow-soft to-brand-lobster-soft text-primary relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-linear-to-br text-sm font-semibold"
      style={
        image
          ? {
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.12)), url("${image}")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {!image ? initials || "OC" : <span className="sr-only">{name}</span>}
    </div>
  );
}

function EmptyPostState({
  isDatabaseReady,
  selectedTab,
  selectedTag,
}: {
  isDatabaseReady: boolean;
  selectedTab: PostFeedTab;
  selectedTag?: string;
}) {
  const tabLabel =
    TAB_ITEMS.find((item) => item.tab === selectedTab)?.label ?? "最新";

  return (
    <div className="bg-surface border-default rounded-[1.75rem] border p-8 text-center">
      <p className="text-secondary text-sm tracking-[0.24em] uppercase">
        帖子列表
      </p>
      <h2 className="text-primary mt-3 text-3xl font-semibold tracking-tight">
        {!isDatabaseReady
          ? "数据库尚未就绪"
          : selectedTag
            ? `“${tabLabel}”下暂时没有可展示的帖子`
            : `“${tabLabel}”下还没有帖子`}
      </h2>
      <p className="text-secondary mx-auto mt-4 max-w-2xl text-sm leading-7">
        {!isDatabaseReady
          ? "请先启动 PostgreSQL 并执行 Prisma migration，随后帖子流会自动加载真实内容。"
          : "发帖入口已经准备就绪。你可以立即发布第一篇帖子，或切换其他标签和 Tab 继续浏览。"}
      </p>
    </div>
  );
}

function getDisplayPosts(posts: PostFeedItem[], selectedTab: PostFeedTab) {
  switch (selectedTab) {
    case "hot":
      return [...posts].sort(compareByHotness);
    case "featured": {
      const featuredPosts = posts.filter(
        (post) =>
          post.favoritesCount > 0 ||
          post.likesCount > 0 ||
          post._count.comments >= 2 ||
          isHotPost(post),
      );

      return (featuredPosts.length > 0 ? featuredPosts : posts).sort(
        compareByFeatured,
      );
    }
    case "unsolved":
      return posts
        .filter((post) => !isSolvedPost(post))
        .sort((left, right) => {
          const scoreDiff = getPendingScore(right) - getPendingScore(left);

          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return compareByLatest(left, right);
        });
    case "latest":
    default:
      return [...posts].sort(compareByLatest);
  }
}

function compareByLatest(left: PostFeedItem, right: PostFeedItem) {
  return getPublishedTime(right) - getPublishedTime(left);
}

function compareByHotness(left: PostFeedItem, right: PostFeedItem) {
  const scoreDiff = getPostTrendScore(right) - getPostTrendScore(left);

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return compareByLatest(left, right);
}

function compareByFeatured(left: PostFeedItem, right: PostFeedItem) {
  const scoreDiff = getFeaturedScore(right) - getFeaturedScore(left);

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return compareByLatest(left, right);
}

function getFeaturedScore(post: PostFeedItem) {
  return (
    getPostTrendScore(post) +
    post._count.comments * 2 +
    post.favoritesCount * 1.5
  );
}

function getPendingScore(post: PostFeedItem) {
  let score = 0;

  if (QUESTION_PATTERN.test(`${post.title} ${post.excerpt ?? ""}`)) {
    score += 6;
  }

  if (post._count.comments === 0) {
    score += 4;
  } else if (post._count.comments <= 2) {
    score += 2;
  }

  if (post.likesCount === 0) {
    score += 1;
  }

  return score;
}

function getPublishedTime(post: PostFeedItem) {
  return (post.publishedAt ?? post.createdAt).getTime();
}

function getTagPriority(slug: string) {
  const index = RECOMMENDED_TAG_PRIORITY.indexOf(slug);
  return index === -1 ? RECOMMENDED_TAG_PRIORITY.length : index;
}

function buildPostsHref({ tab, tag }: { tab?: PostFeedTab; tag?: string }) {
  const searchParams = new URLSearchParams();

  if (tab) {
    searchParams.set("tab", tab);
  }

  if (tag) {
    searchParams.set("tag", tag);
  }

  const query = searchParams.toString();
  return query ? `/posts?${query}` : "/posts";
}

function formatSolvedCount(count: number) {
  return count >= 100 ? `${count}+` : `${count}`;
}
