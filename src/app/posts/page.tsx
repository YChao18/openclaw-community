import type { Metadata } from "next";
import { PostFeed } from "@/components/community/post-feed";
import { getPostFeed, getTagFacets } from "@/lib/community";

type PostsPageProps = {
  searchParams?: Promise<{
    tag?: string;
  }>;
};

export const metadata: Metadata = {
  title: "帖子列表",
  description: "浏览 OpenClaw 社区帖子，按标签筛选讨论、案例与一线实践。",
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedTag = typeof params?.tag === "string" ? params.tag : undefined;
  const { isDatabaseReady, posts, tags } =
    await loadPostsPageData(selectedTag);

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-12 px-6 py-10 md:px-8 lg:px-12 lg:py-16">
      <section className="border-default bg-surface rounded-[2.25rem] border p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-12">
        <p className="text-secondary text-sm tracking-[0.28em] uppercase">
          社区帖子流
        </p>
        <h1 className="text-primary mt-3 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
          OpenClaw 用户分享的经验、问题与实践
        </h1>
        <p className="text-secondary mt-5 max-w-3xl text-sm leading-8 md:text-base">
          围绕 Agent、自动化工作流与真实案例展开讨论，浏览帖子、筛选标签、参与评论，沉淀可复用经验。
        </p>
      </section>

      <PostFeed
        isDatabaseReady={isDatabaseReady}
        posts={posts}
        selectedTag={selectedTag}
        tags={tags}
      />
    </div>
  );
}

async function loadPostsPageData(selectedTag?: string) {
  try {
    const [posts, tags] = await Promise.all([
      getPostFeed({ tag: selectedTag }),
      getTagFacets(),
    ]);

    return {
      isDatabaseReady: true,
      posts,
      tags,
    };
  } catch (error) {
    console.error("Failed to load community feed", error);

    return {
      isDatabaseReady: false,
      posts: [],
      tags: [],
    };
  }
}
