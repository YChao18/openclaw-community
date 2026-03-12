"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Bookmark, Eye, Heart } from "lucide-react";
import { initialCommunityActionState } from "@/app/posts/action-state";
import {
  setPostFavoriteAction,
  setPostLikeAction,
} from "@/app/posts/actions";
import { cn } from "@/lib/utils";

type PostEngagementBarProps = {
  favoritesCount: number;
  isAuthenticated: boolean;
  likesCount: number;
  postId: string;
  postSlug: string;
  viewCount: number;
  viewerState: {
    favorited: boolean;
    liked: boolean;
  };
};

export function PostEngagementBar({
  favoritesCount,
  isAuthenticated,
  likesCount,
  postId,
  postSlug,
  viewCount,
  viewerState,
}: PostEngagementBarProps) {
  const [likeState, likeAction] = useActionState(
    setPostLikeAction,
    initialCommunityActionState,
  );
  const [favoriteState, favoriteAction] = useActionState(
    setPostFavoriteAction,
    initialCommunityActionState,
  );
  const loginHref = `/login?redirect=${encodeURIComponent(`/posts/${postSlug}`)}`;

  return (
    <section className="mt-6 rounded-[1.5rem] border border-default bg-interactive-muted/70 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {isAuthenticated ? (
          <>
            <form action={likeAction}>
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="postSlug" value={postSlug} />
              <input
                type="hidden"
                name="intent"
                value={viewerState.liked ? "unlike" : "like"}
              />
              <EngagementButton
                active={viewerState.liked}
                activeClassName="border-brand-yellow/40 bg-brand-yellow-soft text-brand-yellow"
                icon={<Heart className="h-4 w-4" />}
                idleClassName="border-default bg-surface text-secondary hover:bg-interactive-muted-hover hover:text-primary"
                pendingLabel={viewerState.liked ? "取消中..." : "点赞中..."}
              >
                {viewerState.liked ? "已点赞" : "点赞"} {likesCount}
              </EngagementButton>
            </form>

            <form action={favoriteAction}>
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="postSlug" value={postSlug} />
              <input
                type="hidden"
                name="intent"
                value={viewerState.favorited ? "unsave" : "save"}
              />
              <EngagementButton
                active={viewerState.favorited}
                activeClassName="border-brand-lobster/30 bg-brand-lobster-soft text-brand-lobster"
                icon={<Bookmark className="h-4 w-4" />}
                idleClassName="border-default bg-surface text-secondary hover:bg-interactive-muted-hover hover:text-primary"
                pendingLabel={viewerState.favorited ? "取消中..." : "收藏中..."}
              >
                {viewerState.favorited ? "已收藏" : "收藏"} {favoritesCount}
              </EngagementButton>
            </form>
          </>
        ) : (
          <>
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 rounded-full border border-default bg-surface px-4 py-3 text-sm font-medium text-secondary transition hover:bg-interactive-muted-hover hover:text-primary"
            >
              <Heart className="h-4 w-4" />
              登录后点赞 {likesCount}
            </Link>

            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 rounded-full border border-default bg-surface px-4 py-3 text-sm font-medium text-secondary transition hover:bg-interactive-muted-hover hover:text-primary"
            >
              <Bookmark className="h-4 w-4" />
              登录后收藏 {favoritesCount}
            </Link>
          </>
        )}

        <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface px-4 py-3 text-sm text-secondary">
          <Eye className="h-4 w-4" />
          浏览 {viewCount}
        </div>
      </div>

      {!isAuthenticated ? (
        <p className="mt-3 text-sm leading-6 text-secondary">
          登录后即可点赞或收藏这篇帖子，当前仍可继续浏览正文和评论内容。
        </p>
      ) : null}

      {likeState.message ? (
        <p className="mt-3 text-sm leading-6 text-secondary">{likeState.message}</p>
      ) : null}
      {favoriteState.message ? (
        <p className="mt-2 text-sm leading-6 text-secondary">
          {favoriteState.message}
        </p>
      ) : null}
    </section>
  );
}

function EngagementButton({
  active,
  activeClassName,
  children,
  icon,
  idleClassName,
  pendingLabel,
}: {
  active: boolean;
  activeClassName: string;
  children: ReactNode;
  icon: ReactNode;
  idleClassName: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        active ? activeClassName : idleClassName,
      )}
    >
      {icon}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  );
}
