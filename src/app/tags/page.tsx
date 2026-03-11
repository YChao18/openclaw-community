import type { Metadata } from "next";
import Link from "next/link";
import { Hash } from "lucide-react";
import { getTagFacets } from "@/lib/community";

export const metadata: Metadata = {
  title: "标签",
  description: "浏览 OpenClaw 社区的全部标签，并按标签进入帖子列表。",
};

export default async function TagsPage() {
  const result = await loadTagsPage();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
        <p className="text-sm tracking-[0.28em] text-secondary uppercase">
          标签目录
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
          从标签切入，快速找到同类问题和经验。
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-secondary md:text-base">
          标签页为 M1 提供统一的主题入口。你可以从这里进入已分类的帖子流，也可以从帖子详情反向回到对应标签。
        </p>
      </section>

      {!result.isDatabaseReady ? (
        <section className="rounded-[1.75rem] border border-default bg-surface p-6">
          <p className="text-lg font-semibold text-primary">数据库尚未就绪</p>
          <p className="mt-3 text-sm leading-7 text-secondary">
            请先启动 PostgreSQL 并应用 Prisma migration，之后标签目录会自动显示。
          </p>
        </section>
      ) : result.tags.length === 0 ? (
        <section className="rounded-[1.75rem] border border-default bg-surface p-8 text-center">
          <p className="text-sm tracking-[0.24em] text-secondary uppercase">
            标签目录
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
            还没有标签
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-secondary">
            当前数据库为空。你可以先运行 seed 示例数据，或在后续管理流程中创建第一批标签。
          </p>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/posts?tag=${tag.slug}`}
              className="rounded-[1.75rem] border border-default bg-surface p-6 transition hover:-translate-y-0.5 hover:bg-interactive-muted-hover"
            >
              <div className="inline-flex rounded-2xl border border-brand-yellow/20 bg-brand-yellow-soft p-3 text-brand-yellow">
                <Hash className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-primary">
                {tag.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-secondary">
                {tag.description ?? "围绕这个主题查看社区里的相关帖子和讨论。"}
              </p>
              <p className="mt-5 text-sm text-secondary">
                {tag.postCount} 篇帖子
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

async function loadTagsPage() {
  try {
    const tags = await getTagFacets();

    return {
      isDatabaseReady: true,
      tags,
    };
  } catch (error) {
    console.error("Failed to load tags page", error);

    return {
      isDatabaseReady: false,
      tags: [],
    };
  }
}
