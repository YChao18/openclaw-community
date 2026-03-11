# 碳硅合创·龙虾塘

The OpenClaw Community 的社区项目，当前已完成 M1 社区基础能力，并在 M2 接入邮箱验证码登录、数据库 session、个人中心以及社区权限控制。

## 技术栈

- Next.js 16 + App Router + TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma
- 自建邮箱验证码登录 + 数据库 Session
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

4. 执行 Prisma migration

```bash
npm run db:migrate -- --name m2_email_auth
```

5. 启动开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 邮箱验证码登录配置

默认邮件服务为 Resend，代码结构已预留替换空间。

- `RESEND_API_KEY`: Resend API Key
- `MAIL_FROM`: 发件人地址，例如 `OpenClaw <onboarding@resend.dev>`
- `AUTH_SECRET`: 登录验证码哈希与 session token 哈希使用的密钥
- `SESSION_SECRET`: 可选，若设置则优先于 `AUTH_SECRET`
- `APP_URL` / `NEXT_PUBLIC_APP_URL`: 应用访问地址

开发环境下如果没有配置 `RESEND_API_KEY` 或 `MAIL_FROM`，系统会退回到控制台输出验证码，方便本地联调。

## M2 功能范围

- `/login`: 邮箱 + 6 位验证码登录 / 注册
- `/me`: 个人中心
- `/me/posts`: 我的帖子
- `POST /api/auth/send-code`: 发送验证码
- `POST /api/auth/verify-code`: 校验验证码并建立会话
- 顶部导航登录态
- 登录后发帖与评论
- 退出登录

## 本地测试步骤

1. 启动数据库并执行 migration。
2. 运行 `npm run dev`。
3. 打开 `/login`，输入邮箱并发送验证码。
4. 如果未配置 Resend，到终端中查看 fallback 打印出的验证码。
5. 输入验证码完成登录。
6. 访问 `/posts/new` 发布帖子。
7. 打开任意帖子详情页发表评论。
8. 访问 `/me` 和 `/me/posts` 检查登录态与个人内容。

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate -- --name m2_email_auth
npm run db:studio
```
