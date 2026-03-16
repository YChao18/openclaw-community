import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { requireUser } from "@/auth";
import { deletePostAction } from "@/app/posts/actions";
import { PostOwnerActions } from "@/components/community/post-owner-actions";
import { formatPostDate } from "@/lib/community";
import { getUserPosts } from "@/lib/user/service";

export const metadata: Metadata = {
  title: "我的帖子",
  description: "查看当前账号发布的帖子。",
};

export default async function MyPostsPage() {
  const user = await requireUser("/me/posts");
  const posts = await getUserPosts(user.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <div>
        <Link
          href="/me"
          className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          返回个人中心
        </Link>
      </div>

      <section className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
        <p className="text-sm tracking-[0.28em] text-secondary uppercase">
          我的帖子
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
          你已发布 {posts.length} 篇帖子
        </h1>
      </section>

      {posts.length > 0 ? (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[1.75rem] border border-default bg-surface p-6"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
                <time dateTime={post.createdAt.toISOString()}>
                  {formatPostDate(post.createdAt)}
                </time>
                <span className="h-1 w-1 rounded-full bg-current/60" />
                <span>{post.status}</span>
                <span className="h-1 w-1 rounded-full bg-current/60" />
                <span className="inline-flex items-center gap-1">
                  <MessageSquareText className="h-4 w-4" />
                  {post._count.comments} 条评论
                </span>
              </div>
              <Link
                href={`/posts/${post.slug}`}
                className="mt-4 block text-3xl font-semibold text-primary transition hover:text-brand-yellow"
              >
                {post.title}
              </Link>
              {post.excerpt ? (
                <p className="mt-3 text-base leading-8 text-secondary">
                  {post.excerpt}
                </p>
              ) : null}
              <div className="mt-5">
                <PostOwnerActions
                  deleteAction={deletePostAction}
                  editHref={`/posts/${post.slug}/edit`}
                  postSlug={post.slug}
                  returnTo="/me/posts"
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-[1.75rem] border border-default bg-surface p-8 text-center">
          <p className="text-sm tracking-[0.24em] text-secondary uppercase">
            还没有内容
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">
            你还没有发布帖子
          </h2>
          <p className="mt-4 text-sm leading-7 text-secondary">
            去发布页创建第一篇帖子，和社区一起展开讨论。
          </p>
          <Link
            href="/posts/new"
            className="mt-6 inline-flex rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
          >
            去发布
          </Link>
        </section>
      )}
    </div>
  );
}
