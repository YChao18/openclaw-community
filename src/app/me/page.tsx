import type { Metadata } from "next";
import Link from "next/link";
import {
  Bookmark,
  LogOut,
  NotebookText,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser, signOut } from "@/auth";
import { UsernameForm } from "@/app/me/username-form";
import { getUserDisplayName } from "@/lib/user/service";

export const metadata: Metadata = {
  description: "查看当前登录账号的基础资料与社区入口。",
  title: "个人中心",
};

export default async function MePage() {
  const user = await requireUser("/me");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-sm tracking-[0.28em] text-secondary uppercase">
            个人中心
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            {getUserDisplayName(user)}
          </h1>
          <div className="mt-6 space-y-3 text-sm leading-7 text-secondary">
            <p>邮箱：{user.email ?? "未设置"}</p>
            <p>角色：{user.role}</p>
            <p>验证状态：{user.emailVerified ? "邮箱已验证" : "待验证"}</p>
          </div>
        </div>

        <div className="grid gap-5">
          <article className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-yellow">
              <UserRound className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                当前账号
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-secondary">
              {user.username
                ? "当前用户名可随时修改，保存后会立即刷新当前账号信息。"
                : "你还没有设置用户名，现在就可以补充一个社区用户名。"}
            </p>
            <UsernameForm initialUsername={user.username ?? ""} />
          </article>

          <article className="rounded-[1.75rem] border border-default bg-linear-to-br from-brand-yellow-soft via-brand-lobster-soft to-transparent p-6">
            <div className="flex items-center gap-3 text-brand-lobster">
              <NotebookText className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                我的内容
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-secondary">
              进入“我的帖子”查看自己发布的内容，或继续发布新的讨论主题，也可以在“我的收藏”里快速回到关心的帖子。
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/me/posts"
          className="rounded-[1.75rem] border border-default bg-surface p-6 transition hover:bg-interactive-muted-hover"
        >
          <NotebookText className="h-5 w-5 text-brand-yellow" />
          <h2 className="mt-4 text-xl font-semibold text-primary">我的帖子</h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            查看自己已经发布的帖子列表。
          </p>
        </Link>

        <Link
          href="/me/favorites"
          className="rounded-[1.75rem] border border-default bg-surface p-6 transition hover:bg-interactive-muted-hover"
        >
          <Bookmark className="h-5 w-5 text-brand-lobster" />
          <h2 className="mt-4 text-xl font-semibold text-primary">我的收藏</h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            查看已经收藏过的帖子，快速回到想继续阅读或跟进的讨论。
          </p>
        </Link>

        <Link
          href="/posts/new"
          className="rounded-[1.75rem] border border-default bg-surface p-6 transition hover:bg-interactive-muted-hover"
        >
          <PlusCircle className="h-5 w-5 text-brand-yellow" />
          <h2 className="mt-4 text-xl font-semibold text-primary">发布帖子</h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            继续创建新的社区讨论内容。
          </p>
        </Link>

        <form
          action={async () => {
            "use server";
            await signOut();
            redirect("/");
          }}
          className="rounded-[1.75rem] border border-default bg-surface p-6"
        >
          <LogOut className="h-5 w-5 text-brand-lobster" />
          <h2 className="mt-4 text-xl font-semibold text-primary">退出登录</h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            当前会话会被清除，你仍然可以继续浏览公开帖子。
          </p>
          <button
            type="submit"
            className="mt-6 rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
          >
            退出登录
          </button>
        </form>
      </section>
    </div>
  );
}
