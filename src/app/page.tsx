import Link from "next/link";
import {
  BookOpenText,
  Bot,
  MessagesSquare,
  Sparkles,
  Tags,
  Workflow,
} from "lucide-react";
import { CommunityHero } from "@/components/community/community-hero";
import {
  HomePostSection,
  HomeTagSection,
} from "@/components/community/community-home-sections";
import { PlatformEcosystemEntry } from "@/components/community/platform-ecosystem-entry";
import {
  getCommunitySnapshot,
  getPostFeed,
  getTagFacets,
  type PostFeedItem,
} from "@/lib/community";

const communityIntro = [
  {
    title: "开发实战",
    description:
      "围绕 OpenClaw 接入、Agent 调试与多步任务协作，沉淀能直接复用的实战经验。",
    icon: Bot,
  },
  {
    title: "工作流落地",
    description:
      "聚焦自动化编排、工具协作、流程拆解与评测方法，把工作流从想法推进到可运行。",
    icon: Workflow,
  },
  {
    title: "案例共建",
    description:
      "让真实项目复盘、提问和优化建议沉淀下来，帮助更多实践者更快迭代自己的方案。",
    icon: BookOpenText,
  },
];

const supportedCapabilities = ["发帖", "评论", "点赞", "收藏"];

export default async function Home() {
  const result = await loadHomePageData();
  const latestPosts = result.posts.slice(0, 6);
  const hotPosts = getHotPosts(result.posts);
  const tags = [...result.tags]
    .sort(
      (left, right) =>
        right.postCount - left.postCount || left.name.localeCompare(right.name),
    )
    .slice(0, 8);
  const statusItems = [
    {
      label: "最新帖子",
      value: latestPosts[0]?.title ?? "等待第一篇新帖子",
      hint: latestPosts[0]
        ? `来自 ${latestPosts[0].author.name ?? latestPosts[0].author.username ?? "社区作者"}`
        : "登录后即可发布经验",
      icon: MessagesSquare,
    },
    {
      label: "热门标签",
      value:
        tags
          .slice(0, 3)
          .map((tag) => tag.name)
          .join(" / ") || "标签准备中",
      hint:
        tags.length > 0
          ? `当前共 ${result.snapshot.tagCount} 个活跃标签`
          : "按主题组织讨论",
      icon: Tags,
    },
    {
      label: "已开放功能",
      value: supportedCapabilities.join(" / "),
      hint: "围绕内容发布与互动的核心链路已稳定开放",
      icon: Sparkles,
    },
    {
      label: "社区定位",
      value: "OpenClaw 使用者社区",
      hint: "面向开发者、Agent 构建者与自动化工作流实践者",
      icon: Bot,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-24 px-6 py-12 md:px-8 lg:px-12 lg:py-20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <CommunityHero />

        <div className="grid w-full auto-rows-fr gap-4 lg:grid-cols-3">
          <article className="border-default dark:bg-surface h-full rounded-[1.75rem] border bg-white/70 p-6 shadow-[0_14px_36px_var(--shadow-card)] backdrop-blur-sm">
            <p className="text-secondary text-sm tracking-[0.24em] uppercase">
              最新帖子数
            </p>
            <p className="text-primary mt-3 text-4xl font-semibold tracking-tight">
              {result.snapshot.postCount}
            </p>
            <p className="text-secondary mt-2 text-sm leading-7">
              基于现有帖子数据展示社区已经沉淀下来的内容总量。
            </p>
          </article>

          <article className="border-default dark:bg-surface h-full rounded-[1.75rem] border bg-white/70 p-6 shadow-[0_14px_36px_var(--shadow-card)] backdrop-blur-sm">
            <p className="text-secondary text-sm tracking-[0.24em] uppercase">
              活跃标签数
            </p>
            <p className="text-primary mt-3 text-4xl font-semibold tracking-tight">
              {result.snapshot.tagCount}
            </p>
            <p className="text-secondary mt-2 text-sm leading-7">
              从主题切入内容发现，帮助帖子、问题和案例更快被找到。
            </p>
          </article>

          <article className="border-default from-brand-yellow-soft to-brand-lobster-soft dark:via-surface h-full rounded-[1.75rem] border bg-linear-to-br via-white/80 p-6 shadow-[0_14px_36px_var(--shadow-card)] backdrop-blur-sm">
            <p className="text-secondary text-sm tracking-[0.24em] uppercase">
              今日新增讨论
            </p>
            <p className="text-primary mt-3 text-4xl font-semibold tracking-tight">
              {result.todayCount}
            </p>
            <p className="text-secondary mt-2 text-sm leading-7">
              已支持 {supportedCapabilities.join(" / ")}
              ，讨论链路可直接开始使用。
            </p>
          </article>
        </div>
      </section>

      <section className="border-default dark:bg-surface overflow-hidden rounded-[1.75rem] border bg-white/70 px-5 py-4 shadow-[0_10px_30px_var(--shadow-card)] backdrop-blur-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          {statusItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-2xl px-1 py-2"
              >
                <div className="border-brand-yellow/20 bg-brand-yellow-soft text-brand-yellow mt-0.5 rounded-2xl border p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-secondary text-xs tracking-[0.24em] uppercase">
                    {item.label}
                  </p>
                  <p className="text-primary mt-1 text-sm font-medium md:text-base">
                    {item.value}
                  </p>
                  <p className="text-secondary mt-1 text-sm">{item.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <HomePostSection
        eyebrow="本周热门讨论"
        title="最近一周里最值得跟进的帖子"
        description="按点赞、收藏、评论和浏览量的综合热度近似排序，不新增后端查询，直接复用现有 feed 数据。"
        posts={hotPosts}
        isDatabaseReady={result.isDatabaseReady}
        emptyTitle="本周热门讨论还在形成中"
        emptyDescription="随着更多帖子和互动出现，这里会优先展示最近一周被社区持续讨论的内容。"
        moreHref="/posts"
        moreLabel="查看全部讨论"
        sectionTone="featured"
        cardTone="featured"
        columns="3"
      />

      <HomePostSection
        eyebrow="最新发布"
        title="刚发布的经验、问题与复盘"
        description="按时间顺序保持内容流动感，让用户可以快速追踪社区此刻正在更新什么。"
        posts={latestPosts}
        isDatabaseReady={result.isDatabaseReady}
        emptyTitle="最新发布暂时为空"
        emptyDescription="登录后发布第一篇帖子，或者稍后回来查看社区刚刚更新的讨论。"
        moreHref="/posts"
        moreLabel="进入帖子列表"
        sectionTone="minimal"
        cardTone="minimal"
        columns="2"
      />

      <HomeTagSection
        id="topics"
        tags={tags}
        isDatabaseReady={result.isDatabaseReady}
      />

      <section className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            社区价值区
          </p>
          <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
            面向真实社区使用场景，而不是工程自述
          </h2>
          <p className="text-secondary text-sm leading-8 md:text-base">
            龙虾塘首页现在优先服务内容发现、问题讨论与案例沉淀。原本偏工程阶段说明的内容已经迁移到
            About 页面，这里只保留用户真正关心的社区价值。
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {communityIntro.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border-default dark:bg-surface rounded-[1.75rem] border bg-white/70 p-7 shadow-[0_14px_36px_var(--shadow-card)] backdrop-blur-sm"
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

      <PlatformEcosystemEntry />

      <section className="border-default dark:bg-surface relative overflow-hidden rounded-[2rem] border bg-white/75 px-8 py-10 shadow-[0_18px_48px_var(--shadow-card)] backdrop-blur-sm md:px-12 md:py-14">
        <div className="bg-brand-yellow-soft absolute top-0 left-10 h-24 w-48 rounded-full blur-3xl" />
        <div className="bg-brand-lobster-soft absolute right-8 bottom-0 h-24 w-40 rounded-full blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-secondary text-sm tracking-[0.28em] uppercase">
              CTA
            </p>
            <h2 className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
              让更多人看到你的 OpenClaw 实践
            </h2>
            <p className="text-secondary text-sm leading-8 md:text-base">
              发布你的案例、问题或工作流，让更多开发者一起完善它。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/posts/new"
              className="bg-brand-yellow text-background hover:bg-brand-yellow/90 inline-flex items-center justify-center rounded-full px-6 py-3.5 font-medium hover:-translate-y-0.5"
            >
              去发帖
            </Link>
            <Link
              href="/posts"
              className="border-default text-primary dark:bg-interactive-muted dark:hover:bg-interactive-muted-hover inline-flex items-center justify-center rounded-full border bg-white/70 px-6 py-3.5 font-medium backdrop-blur-sm hover:bg-white/90"
            >
              浏览帖子
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

async function loadHomePageData() {
  try {
    const [posts, tags, snapshot] = await Promise.all([
      getPostFeed({ limit: 30 }),
      getTagFacets(),
      getCommunitySnapshot(),
    ]);

    return {
      isDatabaseReady: true,
      posts,
      snapshot,
      tags,
      todayCount: posts.filter((post) => isSameDay(post.createdAt, new Date()))
        .length,
    };
  } catch (error) {
    console.error("Failed to load community homepage", error);

    return {
      isDatabaseReady: false,
      posts: [],
      snapshot: {
        postCount: 0,
        tagCount: 0,
      },
      tags: [],
      todayCount: 0,
    };
  }
}

function getHotPosts(posts: PostFeedItem[]) {
  const recentPosts = posts.filter((post) => isWithinDays(post.createdAt, 7));
  const source = recentPosts.length > 0 ? recentPosts : posts;

  return [...source]
    .sort((left, right) => {
      const scoreDiff = getTrendingScore(right) - getTrendingScore(left);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    })
    .slice(0, 6);
}

function getTrendingScore(post: PostFeedItem) {
  return (
    post.likesCount * 4 +
    post.favoritesCount * 3 +
    post._count.comments * 2 +
    post.viewCount * 0.05
  );
}

function isWithinDays(date: Date, days: number) {
  const threshold = new Date();
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() - days);

  return date >= threshold;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
