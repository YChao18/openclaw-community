import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type RegisterPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export const metadata: Metadata = {
  title: "注册",
  description: "通过邮箱验证码验证身份并设置登录密码。",
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const user = await getCurrentUser();
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirectParam);

  if (user) {
    redirect(redirectTo);
  }

  return (
    <AuthPageShell
      eyebrow="账号注册"
      title="验证邮箱后创建你的社区账号"
      description="注册流程分为三步：发送验证码、验证邮箱、设置登录密码。完成后会自动登录并进入社区。"
      highlights={[
        {
          title: "验证码安全",
          body: "验证码 5 分钟内有效，新验证码会立即使旧验证码失效，连续输错会触发锁定。",
        },
        {
          title: "密码规则",
          body: "密码至少 8 位，并且需要同时包含字母和数字，系统只会安全存储密码哈希。",
        },
      ]}
    >
      <RegisterForm redirectTo={redirectTo} />
    </AuthPageShell>
  );
}
