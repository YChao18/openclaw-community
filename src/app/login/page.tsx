import type { Metadata } from "next";
import { Mail, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export const metadata: Metadata = {
  title: "登录 / 注册",
  description: "使用邮箱验证码登录龙虾塘社区。",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirectParam);

  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-sm tracking-[0.28em] text-secondary uppercase">
            邮箱登录
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            使用邮箱验证码进入龙虾塘
          </h1>
          <p className="mt-5 text-sm leading-8 text-secondary md:text-base">
            对于格式合法的邮箱，系统会尝试发送 6 位数字验证码。开发环境下验证码可能输出到服务端日志，这不代表真实邮件已经送达，也不代表邮箱真实存在。
          </p>
        </div>

        <div className="grid gap-5">
          <article className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-yellow">
              <Mail className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                登录流程
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-secondary">
              <li>输入邮箱并发送验证码</li>
              <li>在 5 分钟内输入 6 位数字验证码</li>
              <li>验证码校验成功后自动进入社区</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-default bg-linear-to-br from-brand-yellow-soft via-brand-lobster-soft to-transparent p-6">
            <div className="flex items-center gap-3 text-brand-lobster">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                安全说明
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-secondary">
              验证码仅短时间有效，同一邮箱发送过快会进入冷却。系统只校验邮箱格式，不会在发送阶段判断邮箱是否真实存在。
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-[2rem] border border-default bg-surface p-6 md:p-8">
        <LoginForm redirectTo={redirectTo} />
      </section>
    </div>
  );
}
