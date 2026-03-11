import Link from "next/link";
import { Hash, MessageSquareText, PenSquare } from "lucide-react";
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
  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-5">
        <section className="bg-surface border-default rounded-[1.75rem] border p-5">
          <div className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-brand-yellow uppercase">
            <Hash className="h-4 w-4" />
            标签筛选
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
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
        </section>

        <section className="border-default from-brand-yellow-soft via-brand-lobster-soft rounded-[1.75rem] border bg-linear-to-br to-transparent p-5">
          <div className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-primary uppercase">
            <PenSquare className="h-4 w-4" />
            M1 闭环
          </div>
          <p className="text-secondary mt-4 text-sm leading-7">
            列表页已经接入 Prisma 模型和标签过滤。你可以继续进入帖子详情、查看评论，或前往发布页创建新帖子。
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
        </section>
      </aside>

      <section className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
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
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
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
    <article className="bg-surface border-default rounded-[1.75rem] border p-6 shadow-[0_20px_50px_var(--shadow-card)]">
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
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary">
        <Link
          href={`/posts/${post.slug}`}
          className="transition hover:text-brand-yellow"
        >
          {post.title}
        </Link>
      </h2>

      {post.excerpt ? (
        <p className="mt-3 text-sm leading-7 text-secondary">{post.excerpt}</p>
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

      <div className="mt-5">
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
          ? "请先启动 PostgreSQL 并应用 Prisma migration，随后帖子流会自动加载真实内容。"
          : "发帖入口已经准备好了。登录后发布第一篇帖子，或切换到其他标签看看有没有新的讨论。"}
      </p>
    </div>
  );
}
