# OpenClaw Community

OpenClaw Community 是一个基于 `Next.js 16 + App Router + Prisma + PostgreSQL` 的社区项目。

当前仓库已经内置正式可用的邮箱认证流程：

- 注册：邮箱验证码验证后设置密码并自动登录
- 登录：邮箱 + 密码
- 找回密码：邮箱验证码验证后重置密码
- 会话：自定义安全 Cookie Session

## 技术栈

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma
- PostgreSQL
- bcryptjs
- Resend / SMTP

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
copy .env.example .env
```

3. 启动数据库

```bash
docker compose up -d postgres
```

4. 执行迁移

```bash
npm run db:migrate -- --name m4_password_email_auth
```

5. 启动开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 认证相关路由

- `/register`
- `/login`
- `/forgot-password`

## 认证接口

- `POST /api/auth/send-code`
- `POST /api/auth/verify-code`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password/send-code`
- `POST /api/auth/forgot-password/verify-code`
- `POST /api/auth/reset-password`

## 邮件配置

默认推荐 `Resend`，也支持 `SMTP`。

关键环境变量：

- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `EMAIL_ALLOW_DEV_FALLBACK`
- `AUTH_SECRET`
- `APP_URL`

说明：

- `EMAIL_PROVIDER=resend` 时需要配置 `RESEND_API_KEY`
- `EMAIL_PROVIDER=smtp` 时需要配置 SMTP 参数
- 生产环境缺少邮件配置会直接报错
- 开发环境只有在 `EMAIL_ALLOW_DEV_FALLBACK=true` 时才允许回退到控制台输出

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```
