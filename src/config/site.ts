import type { LucideIcon } from "lucide-react";
import { Blocks, Bot, Building2 } from "lucide-react";

type Track = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type ChecklistItem = {
  title: string;
  description: string;
};

type PreviewItem = {
  label: string;
  hint: string;
};

export const siteConfig = {
  name: "碳硅合创·龙虾塘",
  shortName: "龙虾塘",
  subtitle: "The OpenClaw Community",
  description:
    "面向 OpenClaw 用户的开发者社区，连接经验分享、问题解答、技能交流与资源互助。",
};

export const navigation = [
  { label: "帖子", href: "/posts" },
  { label: "标签", href: "/tags" },
  { label: "发布", href: "/posts/new" },
];

export const communityTracks: Track[] = [
  {
    title: "开发实践",
    description:
      "围绕 SDK、Agent、模型接入、调试排障与部署流程，沉淀可复用的开发经验。",
    icon: Blocks,
  },
  {
    title: "AI 应用落地",
    description:
      "聚焦工作流设计、Prompt、评测方法、场景打磨与产品化实践。",
    icon: Bot,
  },
  {
    title: "企业共建",
    description:
      "服务 PoC 验证、知识库建设、流程改造与组织协同等真实落地需求。",
    icon: Building2,
  },
];

export const launchChecklist: ChecklistItem[] = [
  {
    title: "工程底座已就绪",
    description:
      "Next.js、TypeScript、Tailwind CSS、ESLint、Prettier 与基础目录结构均已落地。",
  },
  {
    title: "数据库与认证已接线",
    description:
      "Prisma、PostgreSQL 与 Auth.js 已完成基础集成，具备继续扩展的能力。",
  },
  {
    title: "部署路径清晰可执行",
    description:
      "项目已提供 Docker、环境变量模板与本地初始化命令，可直接启动首版。",
  },
];

export const activityPreview: PreviewItem[] = [
  { label: "经验分享", hint: "沉淀真实项目方法" },
  { label: "问题解答", hint: "提升排障效率" },
  { label: "资源互助", hint: "促进协作共建" },
];
