import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Eye,
  Hash,
  Heart,
  MessageSquareText,
} from "lucide-react";
import type { PostFeedItem, TagFacet } from "@/lib/community";
import { formatPostDate, getAuthorDisplayName } from "@/lib/community";
import { cn } from "@/lib/utils";

type HomePostSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  posts: PostFeedItem[];
  isDatabaseReady: boolean;
  emptyTitle: string;
  emptyDescription: string;
  moreHref: string;
  moreLabel: string;
  sectionTone?: "featured" | "minimal";
  cardTone?: "featured" | "minimal";
  columns?: "2" | "3";
};

type HomeTagSectionProps = {
  id?: string;
  tags: TagFacet[];
  isDatabaseReady: boolean;
};

const tagDescriptionMap: Record<string, string> = {
  agent: "多步骤任务执行与协作",
  automation: "自动化任务、触发器与结果闭环",
  browser: "浏览器操作、抓取与网页自动化",
  debug: "排障、观测与问题定位经验",
  integration: "外部工具、系统与服务连接",
  prompt: "提示词模板、策略与实战",
  rpa: "流程自动化与人工操作替代",
  workflow: "自动化流程设计与编排",
};

export function HomePostSection({
  eyebrow,
  title,
  description,
  posts,
  isDatabaseReady,
  emptyTitle,
  emptyDescription,
  moreHref,
  moreLabel,
  sectionTone = "featured",
  cardTone = "featured",
  columns = "3",
}: HomePostSectionProps) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            {eyebrow}
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            {description}
          </p>
        </div>
        <Link
          href={moreHref}
          className="text-brand-yellow hover:text-brand-yellow/80 inline-flex items-center gap-2 text-sm font-medium"
        >
          {moreLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {posts.length > 0 ? (
        <div
          className={cn(
            "grid gap-5",
            columns === "2" ? "xl:grid-cols-2" : "lg:grid-cols-3",
            sectionTone === "minimal" ? "items-start" : "",
          )}
        >
          {posts.map((post) => (
            <HomePostCard key={post.id} post={post} tone={cardTone} />
          ))}
        </div>
      ) : (
        <HomeEmptyState
          isDatabaseReady={isDatabaseReady}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </section>
  );
}

export function HomeTagSection({
  id,
  tags,
  isDatabaseReady,
}: HomeTagSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-secondary text-sm tracking-[0.28em] uppercase">
          按主题探索
        </p>
        <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
          从标签切入，快速找到同类经验与问题
        </h2>
        <p className="text-secondary text-sm leading-8 md:text-base">
          标签区负责把讨论按主题组织起来，方便围绕 Agent、Workflow、Prompt
          和自动化场景继续深入。
        </p>
      </div>

      {tags.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/posts?tag=${tag.slug}`}
              className="border-default dark:bg-surface dark:hover:bg-interactive-muted-hover rounded-[1.5rem] border bg-white/70 p-5 shadow-[0_12px_32px_var(--shadow-card)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
                <Hash className="h-5 w-5" />
              </div>
              <h3 className="text-primary mt-4 text-lg font-semibold">
                {tag.name}
              </h3>
              <p className="text-secondary mt-2 text-sm">
                {tag.postCount} 篇帖子
              </p>
              <p className="text-secondary mt-3 text-sm leading-7">
                {tag.description ??
                  tagDescriptionMap[tag.slug] ??
                  getDefaultTagCopy(tag.name)}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <HomeEmptyState
          isDatabaseReady={isDatabaseReady}
          title="标签正在准备中"
          description="当社区标签可用后，这里会成为从主题进入帖子列表的快捷入口。"
        />
      )}
    </section>
  );
}

function HomePostCard({
  post,
  tone,
}: {
  post: PostFeedItem;
  tone: "featured" | "minimal";
}) {
  const authorName = getAuthorDisplayName(post.author);

  return (
    <article
      className={cn(
        "border-default rounded-[1.5rem] border backdrop-blur-sm",
        tone === "featured"
          ? "dark:bg-surface bg-white/80 p-6 shadow-[0_14px_40px_var(--shadow-card)]"
          : "dark:bg-surface bg-white/70 p-5 shadow-[0_10px_28px_var(--shadow-card)]",
      )}
    >
      <div className="text-secondary flex flex-wrap items-center gap-3 text-sm">
        <span>{authorName}</span>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <time dateTime={post.createdAt.toISOString()}>
          {formatPostDate(post.publishedAt ?? post.createdAt)}
        </time>
      </div>

      <h3
        className={cn(
          "text-primary mt-4 font-semibold tracking-tight",
          tone === "featured" ? "text-2xl" : "text-xl",
        )}
      >
        <Link href={`/posts/${post.slug}`} className="hover:text-brand-yellow">
          {post.title}
        </Link>
      </h3>

      {post.excerpt ? (
        <p className="text-secondary mt-3 text-sm leading-7">{post.excerpt}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/posts?tag=${tag.slug}`}
            className="border-default bg-interactive-muted text-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-[0.16em] uppercase"
          >
            {tag.name}
          </Link>
        ))}
      </div>

      <div className="text-secondary mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1">
          <MessageSquareText className="h-4 w-4" />
          {post._count.comments}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="h-4 w-4" />
          {post.likesCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <Bookmark className="h-4 w-4" />
          {post.favoritesCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.viewCount}
        </span>
      </div>

      <div className="mt-6">
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

function HomeEmptyState({
  isDatabaseReady,
  title,
  description,
}: {
  isDatabaseReady: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="border-default dark:bg-surface rounded-[1.5rem] border bg-white/70 p-8 text-center shadow-[0_12px_32px_var(--shadow-card)] backdrop-blur-sm">
      <p className="text-secondary text-sm tracking-[0.24em] uppercase">
        社区首页
      </p>
      <h3 className="text-primary mt-3 text-3xl font-semibold tracking-tight">
        {!isDatabaseReady ? "数据库尚未就绪" : title}
      </h3>
      <p className="text-secondary mx-auto mt-4 max-w-2xl text-sm leading-7">
        {!isDatabaseReady
          ? "请先启动 PostgreSQL 并应用 Prisma migration，内容区块会在数据库可用后自动展示。"
          : description}
      </p>
    </div>
  );
}

function getDefaultTagCopy(name: string) {
  return `围绕 ${name} 继续查看社区里的经验分享、问题讨论与落地案例。`;
}
