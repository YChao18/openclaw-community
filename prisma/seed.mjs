import { PrismaClient, PostStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const tags = [
  {
    description: "围绕 Agent 设计、编排和实战经验的讨论。",
    name: "Agent",
    slug: "agent",
  },
  {
    description: "分享 Prompt 设计方法、模板和评测经验。",
    name: "Prompt",
    slug: "prompt",
  },
  {
    description: "接入 OpenClaw、模型 API 与工程化部署的相关话题。",
    name: "工程接入",
    slug: "integration",
  },
  {
    description: "围绕排障过程、失败案例和修复路径的交流。",
    name: "问题排查",
    slug: "debugging",
  },
  {
    description: "OpenClaw 上手指南、教程与使用经验的分享。",
    name: "openclaw教程",
    slug: "openclaw-tutorial",
  },
  {
    description: "真实场景下的方案展示、案例复盘与演示。",
    name: "案例演示",
    slug: "case-demo",
  },
  {
    description: "用于归类未指定明确主题的帖子。",
    name: "其他",
    slug: "other",
  },
];

async function main() {
  const demoUser = await prisma.user.upsert({
    where: {
      email: "demo@openclaw.community",
    },
    update: {
      bio: "用于本地开发与界面联调的示例账号。",
      headline: "社区示例用户",
      name: "龙虾塘示例用户",
      role: UserRole.MEMBER,
      username: "demo_user",
    },
    create: {
      bio: "用于本地开发与界面联调的示例账号。",
      email: "demo@openclaw.community",
      headline: "社区示例用户",
      name: "龙虾塘示例用户",
      role: UserRole.MEMBER,
      username: "demo_user",
    },
  });

  const upsertedTags = [];

  for (const tag of tags) {
    const savedTag = await prisma.tag.upsert({
      where: {
        slug: tag.slug,
      },
      update: tag,
      create: tag,
    });

    upsertedTags.push(savedTag);
  }

  const existingPosts = await prisma.post.count();

  if (existingPosts > 0) {
    console.log("Seed skipped post creation because posts already exist.");
    return;
  }

  const postOne = await prisma.post.create({
    data: {
      authorId: demoUser.id,
      content:
        "我们最近在内部把 OpenClaw 接到现有工作流里，发现最难的不是 API 调通，而是如何让 Agent 的输出可观察、可复盘。想听听大家在日志设计、失败重试和提示词版本管理上的做法。",
      excerpt:
        "分享团队把 OpenClaw 接入真实工作流时，关于日志、失败重试和提示词版本管理的思考。",
      publishedAt: new Date(),
      slug: "openclaw-workflow-observability",
      status: PostStatus.PUBLISHED,
      tags: {
        connect: upsertedTags
          .filter((tag) => ["agent", "integration"].includes(tag.slug))
          .map((tag) => ({ id: tag.id })),
      },
      title: "团队接入 OpenClaw 后，如何做可观察性与复盘？",
    },
  });

  const postTwo = await prisma.post.create({
    data: {
      authorId: demoUser.id,
      content:
        "最近在做一个客服辅助场景，发现 Prompt 一旦拉长就很容易出现风格漂移。我们尝试把角色、约束、输出格式拆分成固定段落，效果比单个大 Prompt 稳定得多。这里整理一下我们的结构，也想看看大家有没有更好的模板方式。",
      excerpt:
        "整理一套更稳定的 Prompt 结构，减少长上下文场景中的风格漂移。",
      publishedAt: new Date(),
      slug: "prompt-structure-for-support",
      status: PostStatus.PUBLISHED,
      tags: {
        connect: upsertedTags
          .filter((tag) => ["prompt", "debugging"].includes(tag.slug))
          .map((tag) => ({ id: tag.id })),
      },
      title: "客服辅助场景里，Prompt 结构怎么拆更稳？",
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        authorId: demoUser.id,
        content:
          "我们也踩过同样的问题，后来把每一步调用都落到结构化日志里，排查效率提升很多。",
        postId: postOne.id,
      },
      {
        authorId: demoUser.id,
        content:
          "角色、任务、边界、输出格式四段式很有帮助，建议再补一段失败时的回退策略。",
        postId: postTwo.id,
      },
    ],
  });

  console.log("Seed completed with demo tags, posts, and comments.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
