import type { Metadata } from "next";
import { Blocks, DatabaseZap, KeyRound, Layers3 } from "lucide-react";
import { siteConfig } from "@/config/site";

const milestoneCards = [
  {
    title: "M0 基础架构",
    description:
      "完成社区的工程底座、基础布局、数据库接入与认证方案选型，为后续内容能力提供稳定起点。",
    icon: Blocks,
  },
  {
    title: "M1 / M2 / M3 已完成",
    description:
      "帖子、详情、评论、邮箱验证码登录、个人中心、点赞、收藏、浏览量与交互统计均已稳定上线。",
    icon: Layers3,
  },
];

const architectureCards = [
  {
    title: "工程底座",
    description:
      "当前项目基于 Next.js App Router、TypeScript 与 Tailwind CSS 构建，页面与业务逻辑边界已经稳定。",
    icon: DatabaseZap,
  },
  {
    title: "分层架构",
    description:
      "Prisma (DB) -> service layer -> server actions / route handlers -> React components，便于在不打乱 UI 的前提下继续扩展社区能力。",
    icon: Layers3,
  },
  {
    title: "登录系统说明",
    description:
      "Auth.js 提供邮箱验证码登录与 session 管理，`/me`、`/me/posts`、`/me/favorites` 等个人路径已完成接入。",
    icon: KeyRound,
  },
];

const stack = [
  "Next.js App Router",
  "TypeScript",
  "Tailwind CSS",
  "Prisma",
  "PostgreSQL",
  "Auth.js",
];

export const metadata: Metadata = {
  title: "关于",
  description: `${siteConfig.name} 的项目说明、技术栈与当前架构信息。`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 py-10 md:px-8 lg:px-12 lg:py-16">
      <section className="border-default bg-surface rounded-[2.25rem] border p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-12">
        <p className="text-secondary text-sm tracking-[0.28em] uppercase">
          About
        </p>
        <h1 className="text-primary mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {siteConfig.name} 项目介绍
        </h1>
        <p className="text-secondary mt-5 max-w-3xl text-sm leading-8 md:text-base">
          这里承接原首页中的工程说明内容，包括基础架构、工程底座、登录系统与技术栈信息。
          社区首页已经回归内容发现职责，About 页面则用于沉淀项目背景和实现方式。
        </p>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            阶段
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            从基础能力到 M3 社区能力，当前架构已稳定
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {milestoneCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border-default bg-surface rounded-[1.8rem] border p-6"
              >
                <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-primary mt-5 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-secondary mt-3 text-sm leading-7">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            架构
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            继续演进 UI 时，不需要改动已稳定的业务骨架
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            当前任务是 UI / UX 重构，而不是新增底层能力，因此 About
            页面保留这些实现说明，方便团队在后续迭代时统一参考。
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {architectureCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border-default bg-surface rounded-[1.8rem] border p-6"
              >
                <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-primary mt-5 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-secondary mt-3 text-sm leading-7">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            技术栈
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight">
            保持既有设计 token，不改变稳定技术栈
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stack.map((item) => (
            <div
              key={item}
              className="border-default bg-surface text-primary rounded-[1.5rem] border px-5 py-4 text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
