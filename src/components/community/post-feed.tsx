import Link from "next/link";
import {
  Bookmark,
  Eye,
  Hash,
  Heart,
  MessageSquareText,
  PenSquare,
  Tags,
} from "lucide-react";
import type { PostFeedItem, TagFacet } from "@/lib/community";
import { formatPostDate, getAuthorDisplayName } from "@/lib/community";
import { cn } from "@/lib/utils";

type PostFeedProps = {
  isDatabaseReady: boolean;
  posts: PostFeedItem[];
  selectedTag?: string;
  tags: TagFacet[];
};

export function PostFeed({
  isDatabaseReady,
  posts,
  selectedTag,
  tags,
}: PostFeedProps) {
  const activeTag = selectedTag
    ? tags.find((tag) => tag.slug === selectedTag)
    : undefined;

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            标签筛选
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            按主题浏览社区讨论
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            保留现有标签筛选逻辑，将常见主题整理为更适合内容浏览的横向标签组。
          </p>
        </div>

        <div className="border-default bg-surface rounded-[1.8rem] border p-6 md:p-7">
          <div className="flex flex-wrap gap-3">
            <TagPill href="/posts" isActive={!selectedTag}>
              全部主题
            </TagPill>
            {tags.map((tag) => (
              <TagPill
                key={tag.slug}
                href={`/posts?tag=${tag.slug}`}
                isActive={selectedTag === tag.slug}
              >
                {tag.name}
                <span className="text-secondary text-xs">{tag.postCount}</span>
              </TagPill>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            页面说明
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            浏览、筛选与发布保持在同一条内容动线里
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <InfoCard
            title="当前视图"
            value={`${posts.length}`}
            description={
              activeTag
                ? `当前正在查看“${activeTag.name}”标签下的帖子数量。`
                : "当前展示社区里最新发布的全部帖子。"
            }
            icon={MessageSquareText}
          />
          <InfoCard
            title="标签主题"
            value={`${tags.length}`}
            description="筛选逻辑保持不变，主题入口被整理为更轻量的内容区组件。"
            icon={Tags}
          />
          <article className="border-default bg-surface rounded-[1.8rem] border p-6">
            <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
              <PenSquare className="h-5 w-5" />
            </div>
            <p className="text-secondary mt-5 text-sm tracking-[0.24em] uppercase">
              参与方式
            </p>
            <h3 className="text-primary mt-2 text-xl font-semibold">
              发帖、浏览标签与讨论入口保留不变
            </h3>
            <p className="text-secondary mt-3 text-sm leading-7">
              弱化工程演示感后，内容入口仍然完整保留，方便继续进入发帖、详情与评论流程。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/posts/new"
                className="inline-flex items-center rounded-full border border-brand-yellow/30 bg-brand-yellow-soft px-4 py-2 text-sm font-medium text-brand-yellow transition hover:bg-brand-yellow/20"
              >
                发布帖子
              </Link>
              <Link
                href="/tags"
                className="inline-flex items-center rounded-full border border-default bg-interactive-muted px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
              >
                浏览标签
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            帖子列表
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            最新讨论
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            {activeTag
              ? `当前已切换到“${activeTag.name}”主题，继续浏览这个标签下的经验、问题与案例。`
              : "从最新帖子开始浏览社区讨论，快速查看正在发生的分享、提问与复盘。"}
          </p>
        </div>

        {!isDatabaseReady || activeTag ? (
          <div className="border-default bg-surface rounded-[1.5rem] border px-5 py-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
              <span className="inline-flex items-center gap-2 font-medium text-primary">
                <Hash className="h-4 w-4 text-brand-yellow" />
                轻提示
              </span>
              <span className="h-1 w-1 rounded-full bg-current/60" />
              <span>
                {!isDatabaseReady
                  ? "数据库尚未就绪，当前展示为空状态提示。"
                  : `当前标签：${activeTag?.name ?? selectedTag}`}
              </span>
            </div>
          </div>
        ) : null}

        {posts.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyPostState
            isDatabaseReady={isDatabaseReady}
            selectedTag={selectedTag}
          />
        )}
      </section>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <article className="border-default bg-surface rounded-[1.8rem] border p-6">
      <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-secondary mt-5 text-sm tracking-[0.24em] uppercase">
        {title}
      </p>
      <p className="text-primary mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="text-secondary mt-3 text-sm leading-7">{description}</p>
    </article>
  );
}

function TagPill({
  children,
  href,
  isActive,
}: {
  children: React.ReactNode;
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

function PostCard({ post }: { post: PostFeedItem }) {
  const authorName = getAuthorDisplayName(post.author);

  return (
    <article className="bg-surface border-default flex h-full flex-col rounded-[1.75rem] border p-6 shadow-[0_20px_50px_var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
        <span>{authorName}</span>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <time dateTime={post.createdAt.toISOString()}>
          {formatPostDate(post.publishedAt ?? post.createdAt)}
        </time>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <span className="inline-flex items-center gap-1">
          <MessageSquareText className="h-4 w-4" />
          {post._count.comments} 条评论
        </span>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <span className="inline-flex items-center gap-1">
          <Heart className="h-4 w-4" />
          {post.likesCount} 次点赞
        </span>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <span className="inline-flex items-center gap-1">
          <Bookmark className="h-4 w-4" />
          {post.favoritesCount} 次收藏
        </span>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <span className="inline-flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.viewCount} 次浏览
        </span>
      </div>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary">
        <Link
          href={`/posts/${post.slug}`}
          className="transition hover:text-brand-yellow"
        >
          {post.title}
        </Link>
      </h2>

      {post.excerpt ? (
        <p className="mt-3 text-base leading-8 text-secondary">{post.excerpt}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/posts?tag=${tag.slug}`}
            className="inline-flex items-center rounded-full border border-default bg-interactive-muted px-3 py-1 text-xs tracking-[0.18em] text-secondary uppercase"
          >
            {tag.name}
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={`/posts/${post.slug}`}
          className="text-sm font-medium text-brand-yellow transition hover:text-brand-yellow/80"
        >
          查看详情
        </Link>
      </div>
    </article>
  );
}

function EmptyPostState({
  isDatabaseReady,
  selectedTag,
}: {
  isDatabaseReady: boolean;
  selectedTag?: string;
}) {
  return (
    <div className="bg-surface border-default rounded-[1.75rem] border p-8 text-center">
      <p className="text-sm tracking-[0.24em] text-secondary uppercase">
        帖子列表
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
        {!isDatabaseReady
          ? "数据库尚未就绪"
          : selectedTag
            ? "这个标签下还没有帖子"
            : "还没有帖子"}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-secondary">
        {!isDatabaseReady
          ? "请先启动 PostgreSQL 并执行 Prisma migration，随后帖子流会自动加载真实内容。"
          : "发帖入口已经准备就绪。登录后发布第一篇帖子，或切换到其他标签看看是否有新的讨论。"}
      </p>
    </div>
  );
}
