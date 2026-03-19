import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, PenSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { deleteCommentAction, deletePostAction } from "@/app/posts/actions";
import { CommentOwnerActions } from "@/components/community/comment-owner-actions";
import { CommentForm } from "@/components/community/comment-form";
import { PostEngagementBar } from "@/components/community/post-engagement-bar";
import { PostOwnerActions } from "@/components/community/post-owner-actions";
import { PostViewTracker } from "@/components/community/post-view-tracker";
import {
  formatPostDate,
  getAuthorDisplayName,
  getPostBySlug,
} from "@/lib/community";
import { getRenderablePostContent } from "@/lib/post-content";

type PostDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: "帖子不存在",
      };
    }

    return {
      description: post.excerpt ?? `${post.title} - OpenClaw 社区帖子详情`,
      title: post.title,
    };
  } catch {
    return {
      title: "帖子详情",
    };
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const result = await loadPostDetail(slug, user?.id);

  if (!result.isDatabaseReady) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-14 md:px-8 lg:px-12">
        <section className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-sm tracking-[0.28em] text-secondary uppercase">
            帖子详情
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary">
            数据库尚未就绪
          </h1>
          <p className="mt-4 text-sm leading-8 text-secondary">
            请先启动 PostgreSQL 并应用 Prisma migration，之后即可查看帖子详情和评论内容。
          </p>
        </section>
      </div>
    );
  }

  if (!result.post) {
    notFound();
  }

  const post = result.post;
  const authorName = getAuthorDisplayName(post.author);
  const isAuthor = user?.id === post.author.id;
  const richContent = getRenderablePostContent(post.content);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <PostViewTracker postId={post.id} />

      <div>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          返回帖子列表
        </Link>
      </div>

      <article className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/posts?tag=${tag.slug}`}
              className="inline-flex items-center rounded-full border border-default bg-interactive-muted px-3 py-1 text-xs tracking-[0.18em] text-secondary uppercase transition hover:bg-interactive-muted-hover hover:text-primary"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <h1 className="mt-5 text-5xl font-semibold tracking-tight text-primary md:text-6xl">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-secondary">
          <span>{authorName}</span>
          {post.author.headline ? (
            <>
              <span className="h-1 w-1 rounded-full bg-current/60" />
              <span>{post.author.headline}</span>
            </>
          ) : null}
          <span className="h-1 w-1 rounded-full bg-current/60" />
          <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>
            {formatPostDate(post.publishedAt ?? post.createdAt)}
          </time>
          <span className="h-1 w-1 rounded-full bg-current/60" />
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="h-4 w-4" />
            {post._count.comments} 条评论
          </span>
        </div>

        {isAuthor ? (
          <div className="mt-6">
            <PostOwnerActions
              deleteAction={deletePostAction}
              editHref={`/posts/${post.slug}/edit`}
              postSlug={post.slug}
              returnTo="/posts"
            />
          </div>
        ) : null}

        <PostEngagementBar
          favoritesCount={post.favoritesCount}
          isAuthenticated={Boolean(user)}
          likesCount={post.likesCount}
          postId={post.id}
          postSlug={post.slug}
          viewCount={post.viewCount}
          viewerState={post.viewerState}
        />

        <div className="mt-8 rounded-[1.75rem] border border-default bg-overlay-strong px-5 py-6">
          {richContent ? (
            <div
              className="post-rich-content text-lg leading-9 text-primary"
              dangerouslySetInnerHTML={{ __html: richContent }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-lg leading-9 text-primary">
              {post.content}
            </div>
          )}
        </div>

        {post.attachments.length > 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-default bg-surface px-5 py-6">
            <p className="text-sm font-medium tracking-[0.2em] text-secondary uppercase">
              附件
            </p>
            <div className="mt-4 space-y-3">
              {post.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.storagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-primary transition hover:bg-interactive-muted-hover"
                >
                  <span className="truncate">{attachment.originalName}</span>
                  <span className="shrink-0 text-secondary">
                    {formatAttachmentSize(attachment.size)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </article>

      <section id="comments" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-yellow">
              <MessageSquareText className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                评论区
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-secondary">
              {post.comments.length > 0
                ? "围绕这篇帖子继续补充经验、提问上下文和解决方案。"
                : "这篇帖子还没有评论，欢迎登录后参与讨论。"}
            </p>
          </div>

          {post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-[1.75rem] border border-default bg-surface p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
                    <span>{getAuthorDisplayName(comment.author)}</span>
                    <span className="h-1 w-1 rounded-full bg-current/60" />
                    <time dateTime={comment.createdAt.toISOString()}>
                      {formatPostDate(comment.createdAt)}
                    </time>
                  </div>
                  {user?.id === comment.author.id ? (
                    <CommentOwnerActions
                      commentId={comment.id}
                      deleteAction={deleteCommentAction}
                      postSlug={post.slug}
                    />
                  ) : null}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-primary">
                  {comment.content}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-default bg-surface p-8 text-center">
              <p className="text-sm tracking-[0.24em] text-secondary uppercase">
                评论区
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">
                还没有评论
              </h2>
              <p className="mt-4 text-sm leading-7 text-secondary">
                现在已经支持邮箱验证码登录，完成登录后即可参与这篇帖子的讨论。
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-lobster">
              <PenSquare className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                参与讨论
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-secondary">
              登录用户可以直接发表评论，未登录用户仍然可以继续浏览帖子和评论内容。
            </p>
          </section>

          {!user ? (
            <section className="rounded-[1.75rem] border border-default bg-surface p-6">
              <div className="flex items-center gap-3 text-brand-yellow">
                <PenSquare className="h-5 w-5" />
                <p className="text-sm font-medium tracking-[0.2em] uppercase">
                  登录后参与讨论
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-secondary">
                你可以先完成邮箱验证码登录，再回来补充评论、点赞或收藏这篇帖子。
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent(
                  `/posts/${post.slug}#comments`,
                )}`}
                className="mt-5 inline-flex rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
              >
                去登录 / 注册
              </Link>
            </section>
          ) : (
            <section className="rounded-[1.75rem] border border-default bg-surface p-6">
              <CommentForm postId={post.id} postSlug={post.slug} />
            </section>
          )}
        </aside>
      </section>
    </div>
  );
}

async function loadPostDetail(slug: string, viewerId?: string) {
  try {
    const post = await getPostBySlug(slug, viewerId);

    return {
      isDatabaseReady: true,
      post,
    };
  } catch (error) {
    console.error("Failed to load post detail", error);

    return {
      isDatabaseReady: false,
      post: null,
    };
  }
}

function formatAttachmentSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}
