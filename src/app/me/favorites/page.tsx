import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Heart,
  MessageSquareText,
} from "lucide-react";
import { requireUser } from "@/auth";
import { formatPostDate, getFavoritePosts } from "@/lib/community";

export const metadata: Metadata = {
  description: "查看当前账号收藏过的帖子列表。",
  title: "我的收藏",
};

export default async function MyFavoritesPage() {
  const user = await requireUser("/me/favorites");
  const favorites = await getFavoritePosts(user.id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
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
          我的收藏
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
          你已收藏 {favorites.length} 篇帖子
        </h1>
        <p className="mt-4 text-sm leading-7 text-secondary">
          收藏列表会按最近收藏时间排序，方便你快速回到想继续阅读或跟进的讨论。
        </p>
      </section>

      {favorites.length > 0 ? (
        <div className="grid gap-4">
          {favorites.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="rounded-[1.75rem] border border-default bg-surface p-6 transition hover:bg-interactive-muted-hover"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
                <span className="inline-flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  收藏于 {formatPostDate(post.favoritedAt)}
                </span>
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
                  <Eye className="h-4 w-4" />
                  {post.viewCount} 次浏览
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-primary">
                {post.title}
              </h2>
              {post.excerpt ? (
                <p className="mt-3 text-sm leading-7 text-secondary">
                  {post.excerpt}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <section className="rounded-[1.75rem] border border-default bg-surface p-8 text-center">
          <p className="text-sm tracking-[0.24em] text-secondary uppercase">
            暂无收藏
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">
            你还没有收藏帖子
          </h2>
          <p className="mt-4 text-sm leading-7 text-secondary">
            去帖子详情页试试收藏功能，把想继续阅读的内容先保存下来。
          </p>
          <Link
            href="/posts"
            className="mt-6 inline-flex rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
          >
            去逛帖子
          </Link>
        </section>
      )}
    </div>
  );
}
