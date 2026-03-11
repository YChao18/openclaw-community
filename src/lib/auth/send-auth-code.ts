import { AUTH_CODE_TTL_MINUTES } from "@/lib/auth/config";
import { sendEmail, type EmailDeliveryMode } from "@/lib/auth/email";

type SendAuthCodeInput = {
  code: string;
  email: string;
};

export async function sendAuthCodeEmail({
  code,
  email,
}: SendAuthCodeInput): Promise<EmailDeliveryMode> {
  const subject = "龙虾塘登录验证码";
  const text = `你的验证码为 ${code}，${AUTH_CODE_TTL_MINUTES} 分钟内有效。`;
  const html = [
    "<div style=\"font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.6;color:#111827;\">",
    "<h1 style=\"font-size:20px;margin-bottom:12px;\">龙虾塘登录验证码</h1>",
    `<p>你的验证码为 <strong style="font-size:28px;letter-spacing:0.3em;">${code}</strong></p>`,
    `<p>${AUTH_CODE_TTL_MINUTES} 分钟内有效，请勿泄露给他人。</p>`,
    "</div>",
  ].join("");

  return sendEmail({
    html,
    subject,
    text,
    to: email,
  });
}
