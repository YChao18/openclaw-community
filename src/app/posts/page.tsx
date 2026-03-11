import type { Metadata } from "next";
import { MessageSquareText, Tags } from "lucide-react";
import { PostFeed } from "@/components/community/post-feed";
import { getPostFeed, getTagFacets } from "@/lib/community";

type PostsPageProps = {
  searchParams?: Promise<{
    tag?: string;
  }>;
};

export const metadata: Metadata = {
  title: "帖子列表",
  description: "OpenClaw 社区的帖子广场，支持按标签筛选讨论内容。",
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedTag = typeof params?.tag === "string" ? params.tag : undefined;
  const { isDatabaseReady, posts, tags } =
    await loadPostsPageData(selectedTag);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-sm tracking-[0.28em] text-secondary uppercase">
            社区帖子流
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            在这里查看 OpenClaw 用户分享的经验、问题与一线实践。
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-secondary md:text-base">
            帖子列表页已经接入 Prisma 数据模型和标签过滤。保持 M0 的视觉骨架不变，同时为帖子详情、发帖和评论能力提供了稳定的数据入口。
          </p>
        </div>

        <div className="grid gap-5">
          <article className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-yellow">
              <MessageSquareText className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                当前视图
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-primary">
              {posts.length}
            </p>
            <p className="mt-2 text-sm leading-7 text-secondary">
              当前筛选条件下的已发布帖子数量。
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-default bg-linear-to-br from-brand-lobster-soft via-brand-yellow-soft to-transparent p-6">
            <div className="flex items-center gap-3 text-brand-lobster">
              <Tags className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                标签主题
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-primary">
              {tags.length}
            </p>
            <p className="mt-2 text-sm leading-7 text-secondary">
              可用于筛选社区讨论流的标签数量。
            </p>
          </article>
        </div>
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
