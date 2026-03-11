# 碳硅合创·龙虾塘

The OpenClaw Community 的首版社区骨架项目。当前已完成 M0：工程初始化、数据库与鉴权基础接线、全局布局、首页静态框架、深色模式与 Docker 部署支持。

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS 4
- PostgreSQL + Prisma
- Auth.js / NextAuth + Prisma Adapter
- Docker / Docker Compose

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
copy .env.example .env
```

3. 启动 PostgreSQL

```bash
docker compose up -d postgres
```

4. 初始化数据库

```bash
npm run db:migrate -- --name init
```

5. 启动开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## Docker 启动整站

```bash
docker compose up --build -d
```

首次启动整站后，如需初始化数据库，可进入容器或在宿主机执行：

```bash
npm run db:migrate -- --name init
```

## 环境变量

`.env.example` 已提供以下变量：

- `DATABASE_URL`: 本地开发使用的 PostgreSQL 连接串
- `NEXT_PUBLIC_APP_URL`: 应用公开访问地址
- `AUTH_SECRET`: Auth.js 密钥
- `AUTH_TRUST_HOST`: 反向代理或 Docker 场景下建议设为 `true`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`: GitHub OAuth 配置
- `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD`: Docker PostgreSQL 默认参数

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run format
npm run db:generate
npm run db:migrate -- --name init
npm run db:studio
```

## 当前目录结构

```text
.
|-- prisma/
|   `-- schema.prisma
|-- src/
|   |-- app/
|   |   |-- api/auth/[...nextauth]/route.ts
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   |-- layout/
|   |   `-- ui/
|   |-- config/
|   |-- lib/
|   |-- types/
|   `-- auth.ts
|-- .env.example
|-- docker-compose.yml
|-- Dockerfile
`-- README.md
```

## M0 完成范围

- 初始化 Next.js + TypeScript + Tailwind CSS 项目
- 配置 ESLint、Prettier、基础脚本与 standalone 构建
- 接入 Prisma、PostgreSQL 与 Auth.js 基础配置
- 设计 `app / components / config / lib / types / prisma` 目录结构
- 实现全局 Layout、Header、Footer
- 实现首页静态框架
- 实现系统级深色模式切换
- 提供 `.env.example`、Docker 和 README

## M1 建议

- 优先做帖子模型、分类标签、帖子列表页和详情页
- 增加登录后发帖入口、个人资料页和最小权限控制
- 落地问答流：提问、回答、采纳、排序
- 加入基础内容审核字段和后台预留结构
