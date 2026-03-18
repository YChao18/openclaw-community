import type { Metadata } from "next";
import { PenSquare, Tags } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AuthNotice } from "@/components/community/auth-notice";
import { PostComposerForm } from "@/components/community/post-composer-form";
import { getTagOptions } from "@/lib/community";

export const metadata: Metadata = {
  title: "发布帖子",
  description: "发布新的 OpenClaw 社区帖子，向社区提问或分享经验。",
};

export default async function NewPostPage() {
  const user = await getCurrentUser();
  const { isDatabaseReady, tags } = await loadComposerData();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-sm tracking-[0.28em] text-secondary uppercase">
            发布讨论
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            把你的经验、问题和一线实践沉淀到龙虾塘
          </h1>
          <p className="mt-5 text-sm leading-8 text-secondary md:text-base">
            登录后即可发布帖子，标题、正文和标签会继续沿用 M1 的社区结构与设计系统，不影响已有浏览体验。
          </p>
        </div>

        <div className="grid gap-5">
          <article className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-yellow">
              <PenSquare className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                发布约束
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-secondary">
              <li>标题和正文为必填，未选标签时会自动归类到“其他”。</li>
              <li>发布成功后会直接跳转到帖子详情页。</li>
              <li>仅登录用户可发布帖子。</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-default bg-linear-to-br from-brand-yellow-soft via-brand-lobster-soft to-transparent p-6">
            <div className="flex items-center gap-3 text-brand-lobster">
              <Tags className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                当前标签
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-primary">{tags.length}</p>
            <p className="mt-2 text-sm leading-7 text-secondary">
              你可以直接选择已有标签归类帖子，列表页和详情页会同步展示这些入口。
            </p>
          </article>
        </div>
      </section>

      {!isDatabaseReady ? (
        <section className="rounded-[1.75rem] border border-default bg-surface p-6">
          <p className="text-lg font-semibold text-primary">数据库尚未就绪</p>
          <p className="mt-3 text-sm leading-7 text-secondary">
            请先启动 PostgreSQL，并执行 Prisma migration 与 seed，之后就可以正常浏览和发布社区内容。
          </p>
        </section>
      ) : !user ? (
        <AuthNotice
          title="登录后即可发布"
          message="当前发布功能已经接入真实登录限制。请先完成邮箱验证码登录，再继续发帖。"
          actionHref="/login?redirect=%2Fposts%2Fnew"
          actionLabel="去登录 / 注册"
        />
      ) : tags.length === 0 ? (
        <section className="rounded-[1.75rem] border border-default bg-surface p-6">
          <p className="text-lg font-semibold text-primary">还没有可选标签</p>
          <p className="mt-3 text-sm leading-7 text-secondary">
            当前数据库中还没有标签数据。你可以先运行 seed 示例数据，或手动创建标签后再发布帖子。
          </p>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-default bg-surface p-6 md:p-8">
          <PostComposerForm tags={tags} />
        </section>
      )}
    </div>
  );
}

async function loadComposerData() {
  try {
    const tags = await getTagOptions();

    return {
      isDatabaseReady: true,
      tags,
    };
  } catch (error) {
    console.error("Failed to load post composer data", error);

    return {
      isDatabaseReady: false,
      tags: [],
    };
  }
}
