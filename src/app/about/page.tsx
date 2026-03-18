import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bookmark,
  BookOpenText,
  Bot,
  DatabaseZap,
  Heart,
  KeyRound,
  Layers3,
  MessageSquareText,
  PenSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tags,
  Users,
  Workflow,
} from "lucide-react";
import {
  formatPostDate,
  getAuthorDisplayName,
  getCommunityActivityStats,
  getCommunitySnapshot,
  getPostFeed,
  getPostTrendScore,
  type PostFeedItem,
} from "@/lib/community";

const valueItems = [
  {
    title: "真实案例（非理论）",
    description: "从业务问题、执行过程到结果复盘，优先看真实落地，而不是空泛讨论。",
    icon: Rocket,
  },
  {
    title: "专注 OpenClaw",
    description: "围绕 OpenClaw 的 Agent 构建、工作流设计与社区实践持续沉淀内容。",
    icon: Bot,
  },
  {
    title: "可复用经验与工作流",
    description: "把能直接借鉴的 Prompt、流程拆解、协作方式整理成可以带走的方法。",
    icon: Workflow,
  },
  {
    title: "社区互动与问答",
    description: "遇到问题就提问，做出成果就分享，让经验在讨论和反馈中持续放大。",
    icon: MessageSquareText,
  },
] satisfies FeatureItem;

const scenarioItems = [
  {
    title: "查看 OpenClaw 实战案例",
    description: "快速筛选真实项目中的接入方式、调试经验和成败复盘。",
    icon: BookOpenText,
  },
  {
    title: "学习 Prompt / Agent",
    description: "围绕 Prompt 设计、Agent 协作和自动化流程吸收可执行的方法。",
    icon: Sparkles,
  },
  {
    title: "提问与交流",
    description: "把卡点、疑问和方案拿出来讨论，缩短自己摸索的时间。",
    icon: Users,
  },
  {
    title: "分享经验",
    description: "沉淀你验证过的工作流、踩坑记录和业务交付心得。",
    icon: PenSquare,
  },
] satisfies FeatureItem;

const audienceItems = [
  { label: "OpenClaw 用户", icon: Bot },
  { label: "AI / Agent 开发者", icon: Sparkles },
  { label: "自动化实践者", icon: Workflow },
  { label: "AI落地探索者", icon: Rocket },
] satisfies AudienceItem;

const capabilityItems = [
  {
    title: "发帖 / 评论 / 点赞",
    description: "内容发布与互动链路已经打通，适合直接开始讨论与沉淀案例。",
    icon: Heart,
  },
  {
    title: "标签分类",
    description: "按主题组织帖子，帮助用户更快找到相关场景与经验。",
    icon: Tags,
  },
  {
    title: "收藏与个人中心",
    description: "把值得反复查看的内容留下来，并在个人页持续管理自己的沉淀。",
    icon: Bookmark,
  },
  {
    title: "稳定可用",
    description: "当前核心社区能力已经可以承接浏览、发帖与基础互动。",
    icon: ShieldCheck,
  },
] satisfies FeatureItem;

const technicalItems = [
  {
    title: "Prisma",
    description: "负责数据库访问与数据模型。",
    icon: DatabaseZap,
  },
  {
    title: "Service Layer",
    description: "将社区查询与业务逻辑收拢为可复用服务。",
    icon: Layers3,
  },
  {
    title: "Route Handlers",
    description: "承接接口能力并为页面交互提供支持。",
    icon: Layers3,
  },
  {
    title: "Auth.js",
    description: "用于登录认证与会话管理。",
    icon: KeyRound,
  },
] satisfies FeatureItem;

const fallbackFeaturedPosts = [
  {
    id: "mock-1",
    title: "用 OpenClaw 做一条可维护的客户跟进自动化流程",
    excerpt:
      "从线索收集、状态判断到消息触达，拆解一条真正能落地上线的自动化流程。",
    author: "社区精选",
    date: "案例精选",
    href: "/posts",
    stats: "工作流 / 自动化 / 复盘",
  },
  {
    id: "mock-2",
    title: "Prompt 不是模板堆砌：一次 Agent 调试的完整复盘",
    excerpt:
      "记录一次从失败输出到稳定产出的调试过程，重点看约束、反馈和迭代策略。",
    author: "社区精选",
    date: "调试经验",
    href: "/posts",
    stats: "Prompt / Agent / 调优",
  },
  {
    id: "mock-3",
    title: "从 0 到 1 搭一个适合团队协作的 OpenClaw 实战工作流",
    excerpt:
      "覆盖角色分工、执行节奏与复用方式，适合正在探索 AI 落地协作的团队参考。",
    author: "社区精选",
    date: "方法沉淀",
    href: "/posts",
    stats: "团队协作 / 实战",
  },
];

export const metadata: Metadata = {
  title: "社区增长入口页",
  description: "碳硅合创·龙虾塘是一个围绕 OpenClaw 实战、Agent 与自动化落地经验的社区入口页。",
};

export default async function AboutPage() {
  const data = await loadAboutPageData();
  const statsLine = `今日新增 ${data.todayPosts} ｜ 活跃用户 ${data.activeUsers} ｜ 累计帖子 ${data.postCount}+`;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-6 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <section className="border-default from-brand-yellow-soft via-surface to-brand-lobster-soft relative overflow-hidden rounded-[2.25rem] border bg-linear-to-br p-6 shadow-[0_24px_60px_var(--shadow-card)] md:p-8 lg:p-10">
        <div className="bg-brand-yellow-soft absolute top-0 left-10 h-28 w-44 rounded-full blur-3xl" />
        <div className="bg-brand-lobster-soft absolute right-0 bottom-0 h-32 w-52 rounded-full blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_24rem] xl:items-end">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-secondary text-xs tracking-[0.28em] uppercase">
                Community Landing Page
              </p>
              <h1 className="text-primary max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                碳硅合创·龙虾塘
              </h1>
              <p className="text-secondary max-w-3xl text-base leading-8 md:text-lg">
                OpenClaw 实战社区｜分享 Agent、自动化与真实业务落地经验
              </p>
            </div>

            <p className="text-primary/88 max-w-3xl text-sm leading-7 md:text-base">
              这里不是泛泛而谈的 AI 资讯页，而是帮助你快速看到真实案例、理解社区价值，并立即开始浏览或发帖的入口。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/posts"
                className="bg-brand-yellow text-background hover:bg-brand-yellow/90 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold shadow-[0_14px_34px_rgba(234,179,8,0.24)] hover:-translate-y-0.5"
              >
                立即浏览社区
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/posts/new"
                className="border-default text-primary dark:bg-interactive-muted dark:hover:bg-interactive-muted-hover inline-flex min-h-[52px] items-center justify-center rounded-full border bg-white/75 px-6 text-sm font-semibold backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/90"
              >
                发布你的第一个帖子
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <HeroMetric
                label="价值定位"
                value="真实案例"
                description="聚焦真实业务里的 OpenClaw 实战，而不是抽象概念。"
              />
              <HeroMetric
                label="适合动作"
                value="浏览 / 发帖"
                description="5 秒内理解社区价值，并直接进入内容或开始分享。"
              />
              <HeroMetric
                label="社区节奏"
                value={statsLine}
                description="让用户一眼看到社区在持续更新，而不是静态展示页。"
              />
            </div>
          </div>

          <aside className="border-default dark:bg-surface rounded-[1.9rem] border bg-white/70 p-5 shadow-[0_16px_40px_var(--shadow-card)] backdrop-blur-sm">
            <p className="text-secondary text-xs tracking-[0.24em] uppercase">
              社区速览
            </p>
            <p className="text-primary mt-3 text-2xl font-semibold tracking-tight">
              先看价值，再决定是否加入讨论
            </p>
            <p className="text-secondary mt-3 text-sm leading-7">
              从真实案例、Prompt / Agent 学习、问题交流到经验沉淀，这里优先服务愿意实战的人。
            </p>

            <div className="mt-5 space-y-3">
              {[
                "真实案例优先，帮助快速判断参考价值",
                "支持直接浏览社区，也支持马上发帖沉淀经验",
                "围绕 OpenClaw、自动化、工作流形成可复用内容库",
              ].map((item) => (
                <div
                  key={item}
                  className="border-default bg-interactive-muted flex items-start gap-3 rounded-[1.2rem] border px-4 py-3"
                >
                  <div className="bg-brand-yellow-soft text-brand-yellow rounded-full p-2">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-primary text-sm leading-6">{item}</p>
                </div>
              ))}
            </div>

            <div className="border-default bg-interactive-muted mt-5 rounded-[1.2rem] border px-4 py-4">
              <p className="text-secondary text-xs tracking-[0.2em] uppercase">
                社区活跃信息
              </p>
              <p className="text-primary mt-2 text-sm font-medium leading-7">
                {statsLine}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Value"
          title="为什么选择龙虾塘"
          description="用户进入页面后需要立刻知道这里解决什么问题，以及为什么值得点进去继续看。"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {valueItems.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-6">
          <SectionHeader
            eyebrow="Scenarios"
            title="你可以在这里做什么"
            description="把用户最常见的意图直接摆在前面，降低理解成本，也提升点击意愿。"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioItems.map((item) => (
              <FeatureCard key={item.title} item={item} compact />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader
            eyebrow="Audience"
            title="适合谁"
            description="如果你正在用 OpenClaw、做 Agent 或自动化，这里就是你的讨论与沉淀空间。"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {audienceItems.map((item) => (
              <article
                key={item.label}
                className="border-default dark:bg-surface rounded-[1.5rem] border bg-white/70 p-5 shadow-[0_12px_32px_var(--shadow-card)] backdrop-blur-sm"
              >
                <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-primary mt-4 text-lg font-semibold">
                  {item.label}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Capabilities"
          title="社区当前能力"
          description="用产品能力替代原来的 M0 / M1 / M2 / M3 表述，让用户更容易理解“我现在能在这里做什么”。"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {capabilityItems.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="border-default dark:bg-surface overflow-hidden rounded-[1.9rem] border bg-white/70 px-6 py-5 shadow-[0_12px_32px_var(--shadow-card)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-secondary text-xs tracking-[0.24em] uppercase">
              Live Activity
            </p>
            <h2 className="text-primary text-2xl font-semibold tracking-tight">
              社区活跃信息
            </h2>
          </div>
          <p className="text-primary text-sm font-medium leading-7 md:text-base">
            {statsLine}
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Featured"
          title="推荐内容"
          description="优先展示值得点进去的精选帖子，增强“这里已经有东西可看”的第一印象。"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {data.featuredPosts.map((post) => (
            <FeaturedPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="border-default dark:bg-surface relative overflow-hidden rounded-[2rem] border bg-white/75 px-8 py-9 shadow-[0_18px_48px_var(--shadow-card)] backdrop-blur-sm md:px-10 md:py-10">
        <div className="bg-brand-yellow-soft absolute top-0 left-8 h-24 w-40 rounded-full blur-3xl" />
        <div className="bg-brand-lobster-soft absolute right-8 bottom-0 h-24 w-40 rounded-full blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-secondary text-sm tracking-[0.28em] uppercase">
              CTA
            </p>
            <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
              准备好开始了吗？
            </h2>
            <p className="text-secondary text-sm leading-8 md:text-base">
              进入社区看看别人是怎么做的，或者直接发出你的第一篇帖子，把经验变成影响力。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/posts"
              className="bg-brand-yellow text-background hover:bg-brand-yellow/90 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold hover:-translate-y-0.5"
            >
              进入社区
            </Link>
            <Link
              href="/posts/new"
              className="border-default text-primary dark:bg-interactive-muted dark:hover:bg-interactive-muted-hover inline-flex items-center justify-center rounded-full border bg-white/70 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/90"
            >
              发布帖子
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Technical Notes"
          title="技术底座"
          description="以下内容保留在页面最底部，方便需要了解实现背景的人查看，但不再干扰前面的转化路径。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {technicalItems.map((item) => (
            <FeatureCard key={item.title} item={item} muted compact />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-secondary text-sm tracking-[0.28em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="text-secondary text-sm leading-8 md:text-base">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  item,
  compact = false,
  muted = false,
}: {
  compact?: boolean;
  item: FeatureItem[number];
  muted?: boolean;
}) {
  const Icon = item.icon;

  return (
    <article
      className={[
        "border-default rounded-[1.7rem] border p-6 backdrop-blur-sm",
        muted
          ? "bg-interactive-muted shadow-[0_10px_28px_var(--shadow-card)]"
          : "dark:bg-surface bg-white/70 shadow-[0_14px_36px_var(--shadow-card)]",
      ].join(" ")}
    >
      <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow inline-flex rounded-2xl border p-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3
        className={[
          "text-primary mt-4 font-semibold",
          compact ? "text-lg" : "text-xl",
        ].join(" ")}
      >
        {item.title}
      </h3>
      <p className="text-secondary mt-3 text-sm leading-7">
        {item.description}
      </p>
    </article>
  );
}

function HeroMetric({
  label,
  value,
  description,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <article className="border-default dark:bg-surface rounded-[1.45rem] border bg-white/70 p-4 shadow-[0_10px_28px_var(--shadow-card)] backdrop-blur-sm">
      <p className="text-secondary text-xs tracking-[0.22em] uppercase">
        {label}
      </p>
      <p className="text-primary mt-2 text-base font-semibold md:text-lg">
        {value}
      </p>
      <p className="text-secondary mt-2 text-sm leading-6">{description}</p>
    </article>
  );
}

function FeaturedPostCard({
  post,
}: {
  post: FeaturedPost;
}) {
  return (
    <article className="border-default dark:bg-surface rounded-[1.7rem] border bg-white/75 p-6 shadow-[0_14px_36px_var(--shadow-card)] backdrop-blur-sm">
      <div className="text-secondary flex flex-wrap items-center gap-3 text-sm">
        <span>{post.author}</span>
        <span className="h-1 w-1 rounded-full bg-current/60" />
        <span>{post.date}</span>
      </div>

      <h3 className="text-primary mt-4 text-2xl font-semibold tracking-tight">
        <Link href={post.href} className="hover:text-brand-yellow">
          {post.title}
        </Link>
      </h3>

      <p className="text-secondary mt-3 text-sm leading-7">{post.excerpt}</p>

      <div className="mt-5 inline-flex rounded-full border border-default bg-interactive-muted px-3 py-1 text-xs tracking-[0.16em] uppercase text-secondary">
        {post.stats}
      </div>

      <div className="mt-6">
        <Link
          href={post.href}
          className="text-brand-yellow hover:text-brand-yellow/80 inline-flex items-center gap-2 text-sm font-medium"
        >
          查看内容
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

async function loadAboutPageData() {
  try {
    const [activity, snapshot, posts] = await Promise.all([
      getCommunityActivityStats(),
      getCommunitySnapshot(),
      getPostFeed({ limit: 12 }),
    ]);

    return {
      activeUsers: activity.activeUsers,
      featuredPosts: getFeaturedPosts(posts),
      postCount: snapshot.postCount,
      todayPosts: activity.todayPosts,
    };
  } catch (error) {
    console.error("Failed to load about landing page data", error);

    return {
      activeUsers: 0,
      featuredPosts: fallbackFeaturedPosts,
      postCount: 0,
      todayPosts: 0,
    };
  }
}

function getFeaturedPosts(posts: PostFeedItem[]): FeaturedPost[] {
  const selectedPosts = [...posts]
    .sort((left, right) => {
      const scoreDiff = getPostTrendScore(right) - getPostTrendScore(left);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    })
    .slice(0, 3);

  if (selectedPosts.length === 0) {
    return fallbackFeaturedPosts;
  }

  return selectedPosts.map((post) => ({
    author: getAuthorDisplayName(post.author),
    date: formatPostDate(post.publishedAt ?? post.createdAt),
    excerpt: post.excerpt ?? "进入帖子查看完整内容与讨论细节。",
    href: `/posts/${post.slug}`,
    id: post.id,
    stats: `评论 ${post._count.comments} / 点赞 ${post.likesCount} / 浏览 ${post.viewCount}`,
    title: post.title,
  }));
}

type FeatureItem = Array<{
  description: string;
  icon: LucideIcon;
  title: string;
}>;

type AudienceItem = Array<{
  icon: LucideIcon;
  label: string;
}>;

type FeaturedPost = {
  author: string;
  date: string;
  excerpt: string;
  href: string;
  id: string;
  stats: string;
  title: string;
};
