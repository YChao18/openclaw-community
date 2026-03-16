import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export const metadata: Metadata = {
  title: "登录",
  description: "使用邮箱和密码登录社区账号。",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirectParam);

  if (user) {
    redirect(redirectTo);
  }

  return (
    <AuthPageShell
      eyebrow="邮箱登录"
      title="使用邮箱和密码进入社区"
      description="正式账号体系现已启用。注册完成后，你可以直接使用邮箱和密码登录，不再需要每次都依赖验证码。"
      highlights={[
        {
          title: "登录方式",
          body: "登录页现在使用邮箱和密码。首次注册请先完成邮箱验证，再设置密码。",
        },
        {
          title: "找回密码",
          body: "如果忘记密码，可以通过邮箱验证码验证身份后重置新密码。",
        },
      ]}
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthPageShell>
  );
}
