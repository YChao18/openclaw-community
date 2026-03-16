import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export const metadata: Metadata = {
  title: "找回密码",
  description: "通过邮箱验证码验证身份并重置登录密码。",
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const user = await getCurrentUser();
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirectParam);

  if (user) {
    redirect(redirectTo);
  }

  return (
    <AuthPageShell
      eyebrow="找回密码"
      title="通过邮箱验证码重置登录密码"
      description="为了保护账号安全，系统会先验证邮箱，再允许你设置新的登录密码。重置成功后会自动登录。"
      highlights={[
        {
          title: "返回文案",
          body: "发送重置验证码时不会直接暴露邮箱是否已注册，页面会统一返回模糊提示。",
        },
        {
          title: "重置流程",
          body: "验证码验证成功后，你可以立即设置新密码，旧密码会立刻失效。",
        },
      ]}
    >
      <ForgotPasswordForm redirectTo={redirectTo} />
    </AuthPageShell>
  );
}
