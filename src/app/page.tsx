import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Bot,
  Building2,
  CircleHelp,
  DatabaseZap,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  activityPreview,
  communityTracks,
  launchChecklist,
  siteConfig,
} from "@/config/site";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-surface border-default rounded-[2rem] border p-8 shadow-[0_24px_60px_var(--shadow-card)] backdrop-blur md:p-10">
          <div className="bg-brand-yellow-soft text-brand-yellow border-brand-yellow/30 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <Sparkles className="h-4 w-4" />
            M0 基础版本已就绪
          </div>
          <div className="space-y-5">
            <p className="text-secondary text-sm tracking-[0.28em] uppercase">
              {siteConfig.subtitle}
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              {siteConfig.name}
            </h1>
            <p className="text-secondary max-w-2xl text-base leading-8 md:text-lg">
              一个面向 OpenClaw 用户的垂直交流社区，服务开发者、AI
              应用者和企业实践者。首版优先完成上线所需的工程底座，为经验分享、
              问题解答、技能交流、资源互助和生态共建预留稳定扩展空间。
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#launch"
              className="bg-brand-yellow text-background hover:bg-brand-yellow/90 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-medium hover:translate-y-[-1px]"
            >
              查看首版能力
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#tracks"
              className="bg-interactive-muted text-primary border-default hover:bg-interactive-muted-hover inline-flex items-center justify-center rounded-full border px-5 py-3 font-medium"
            >
              了解社区定位
            </Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {activityPreview.map((item) => (
              <div
                key={item.label}
                className="bg-surface-strong border-default rounded-2xl border p-4"
              >
                <p className="text-secondary text-sm">{item.hint}</p>
                <p className="mt-2 text-lg font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-surface border-default rounded-[2rem] border p-6 backdrop-blur">
            <div className="text-brand-yellow flex items-center gap-3">
              <DatabaseZap className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                M0 范围
              </p>
            </div>
            <ul className="mt-5 space-y-4">
              {launchChecklist.map((item) => (
                <li
                  key={item.title}
                  className="bg-overlay-strong border-default rounded-2xl border p-4"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-secondary mt-2 text-sm leading-7">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-default from-brand-lobster-soft via-brand-yellow-soft rounded-[2rem] border bg-linear-to-br to-transparent p-6">
            <div className="text-brand-lobster flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                当前状态
              </p>
            </div>
            <p className="text-secondary mt-4 text-sm leading-7">
              首页静态框架、认证基础接线、数据库接入与 Docker 部署配置已经就绪。
              下一阶段建议聚焦内容发布、帖子列表、问答流与基础权限边界。
            </p>
          </div>
        </div>
      </section>

      <section id="tracks" className="space-y-5">
        <div className="max-w-2xl space-y-3">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            社区定位
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            服务 OpenClaw 生态中的三类核心参与者
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {communityTracks.map((track) => {
            const Icon = track.icon;

            return (
              <article
                key={track.title}
                className="bg-surface border-default rounded-[1.75rem] border p-6 backdrop-blur"
              >
                <div className="bg-brand-yellow-soft text-brand-yellow border-brand-yellow/20 inline-flex rounded-2xl border p-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{track.title}</h3>
                <p className="text-secondary mt-3 text-sm leading-7">
                  {track.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="launch" className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-surface border-default rounded-[2rem] border p-6">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            首版方向
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            用最小可上线范围，先把社区骨架搭稳
          </h2>
          <p className="text-secondary mt-4 text-sm leading-7">
            M0
            不追求功能过多，而是先把工程基座、品牌表达、数据库接线与鉴权基础打牢，
            保证后续进入 M1 时可以围绕内容系统快速推进。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="bg-surface border-default rounded-[1.75rem] border p-5">
            <Blocks className="text-brand-yellow h-5 w-5" />
            <h3 className="mt-4 text-lg font-semibold">工程基座</h3>
            <p className="text-secondary mt-2 text-sm leading-7">
              基于 Next.js App Router、TypeScript、Tailwind CSS、ESLint 与
              Prettier 构建。
            </p>
          </article>
          <article className="bg-surface border-default rounded-[1.75rem] border p-5">
            <CircleHelp className="text-brand-yellow h-5 w-5" />
            <h3 className="mt-4 text-lg font-semibold">用户体系准备</h3>
            <p className="text-secondary mt-2 text-sm leading-7">
              Auth.js、Prisma Adapter 与 PostgreSQL 数据模型已经就位。
            </p>
          </article>
          <article className="bg-surface border-default rounded-[1.75rem] border p-5">
            <MessagesSquare className="text-brand-lobster h-5 w-5" />
            <h3 className="mt-4 text-lg font-semibold">社区表达</h3>
            <p className="text-secondary mt-2 text-sm leading-7">
              全局 Layout、导航、页脚、首页静态框架与主题模式已具备上线形态。
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="bg-surface border-default rounded-[1.75rem] border p-6">
          <Bot className="text-brand-yellow h-5 w-5" />
          <h3 className="mt-4 text-xl font-semibold">经验分享</h3>
          <p className="text-secondary mt-3 text-sm leading-7">
            聚焦 Agent、模型接入、Prompt、评测、工作流与部署实践。
          </p>
        </article>
        <article className="bg-surface border-default rounded-[1.75rem] border p-6">
          <CircleHelp className="text-brand-yellow h-5 w-5" />
          <h3 className="mt-4 text-xl font-semibold">问题解答</h3>
          <p className="text-secondary mt-3 text-sm leading-7">
            用结构化问答帮助用户更快排障，并沉淀可复用的知识资产。
          </p>
        </article>
        <article className="bg-surface border-default rounded-[1.75rem] border p-6">
          <Building2 className="text-brand-lobster h-5 w-5" />
          <h3 className="mt-4 text-xl font-semibold">生态共建</h3>
          <p className="text-secondary mt-3 text-sm leading-7">
            连接个人开发者、应用团队与企业实践者，共同沉淀资源、方法与案例。
          </p>
        </article>
      </section>
    </div>
  );
}
