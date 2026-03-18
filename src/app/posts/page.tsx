import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SquarePen } from "lucide-react";
import { PostFeed } from "@/components/community/post-feed";
import {
  getCommunityActivityStats,
  getPostFeed,
  getTagFacets,
} from "@/lib/community";

type PostFeedTab = "featured" | "hot" | "latest" | "unsolved";

type PostsPageProps = {
  searchParams?: Promise<{
    tab?: string;
    tag?: string;
  }>;
};

export const metadata: Metadata = {
  title: "社区帖子",
  description: "浏览 OpenClaw 实战社区帖子，发现自动化、Agent 与工作流实践。",
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedTag = typeof params?.tag === "string" ? params.tag : undefined;
  const selectedTab = getSelectedTab(params?.tab);
  const { activityStats, isDatabaseReady, posts, tags } =
    await loadPostsPageData(selectedTag);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-6 py-8 md:px-8 lg:px-12 lg:py-12">
        <section className="border-default from-brand-yellow-soft via-surface to-brand-lobster-soft relative overflow-hidden rounded-[2rem] border bg-linear-to-br p-6 shadow-[0_24px_60px_var(--shadow-card)] md:p-8 lg:p-10">
          <div className="bg-brand-yellow-soft absolute -top-10 left-8 h-28 w-44 rounded-full blur-3xl" />
          <div className="bg-brand-lobster-soft absolute right-0 bottom-0 h-28 w-44 rounded-full blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl space-y-3">
              <p className="text-secondary text-sm tracking-[0.28em] uppercase">
                OpenClaw Community
              </p>
              <h1 className="text-primary max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.7rem]">
                OpenClaw 实战社区｜分享自动化、Agent 与工作流实践
              </h1>
              <p className="text-secondary max-w-3xl text-sm leading-7 md:text-base md:leading-8">
                在这里快速发现真实案例、提问讨论与落地复盘，让社区首页更聚焦内容参与、内容点击与持续互动。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link
                href="/posts/new"
                className="bg-brand-yellow text-background hover:bg-brand-yellow/92 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-[0_18px_40px_rgba(234,179,8,0.28)] hover:-translate-y-0.5"
              >
                <SquarePen className="h-4 w-4" />
                发布帖子
              </Link>
              <Link
                href="#post-feed"
                className="border-default bg-surface text-primary hover:bg-interactive-muted-hover inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium shadow-[0_10px_28px_var(--shadow-card)]"
              >
                查看讨论
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <PostFeed
          activityStats={activityStats}
          isDatabaseReady={isDatabaseReady}
          posts={posts}
          selectedTab={selectedTab}
          selectedTag={selectedTag}
          tags={tags}
        />
      </div>

      <Link
        href="/posts/new"
        className="bg-brand-yellow text-background hover:bg-brand-yellow/92 fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_20px_44px_rgba(234,179,8,0.34)] hover:-translate-y-0.5 md:right-8 md:bottom-8"
      >
        <SquarePen className="h-4 w-4" />
        发布帖子
      </Link>
    </>
  );
}

async function loadPostsPageData(selectedTag?: string) {
  try {
    const [posts, tags, activityStats] = await Promise.all([
      getPostFeed({ limit: 48, tag: selectedTag }),
      getTagFacets(),
      getCommunityActivityStats(),
    ]);

    return {
      activityStats,
      isDatabaseReady: true,
      posts,
      tags,
    };
  } catch (error) {
    console.error("Failed to load community feed", error);

    return {
      activityStats: {
        activeUsers: 0,
        solvedCount: 0,
        todayPosts: 0,
      },
      isDatabaseReady: false,
      posts: [],
      tags: [],
    };
  }
}

function getSelectedTab(tab?: string): PostFeedTab {
  const allowedTabs: PostFeedTab[] = ["latest", "hot", "featured", "unsolved"];

  if (tab && allowedTabs.includes(tab as PostFeedTab)) {
    return tab as PostFeedTab;
  }

  return "latest";
}
