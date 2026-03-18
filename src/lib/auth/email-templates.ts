import { AUTH_CODE_TTL_MINUTES } from "@/lib/auth/config";
import { siteConfig } from "@/config/site";

type VerificationEmailTemplate = {
  html: string;
  subject: string;
  text: string;
};

function renderBaseTemplate(params: {
  brandName?: string;
  code: string;
  intro: string;
  subject: string;
}) {
  const brandName = params.brandName ?? siteConfig.shortName;

  const html = `
    <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:'IBM Plex Sans','Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(15,23,42,0.08);border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.08);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,rgba(234,179,8,0.16),rgba(220,38,38,0.08));border-bottom:1px solid rgba(15,23,42,0.06);">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#92400e;">${brandName}</p>
          <h1 style="margin:0;font-size:24px;line-height:1.35;color:#0f172a;">${params.subject}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#334155;">${params.intro}</p>
          <div style="margin:0 0 22px;padding:18px 20px;border-radius:20px;background:#0f172a;">
            <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(248,250,252,0.72);">验证码</p>
            <p style="margin:0;font-size:34px;font-weight:700;letter-spacing:0.32em;color:#f8fafc;">${params.code}</p>
          </div>
          <p style="margin:0 0 10px;font-size:14px;line-height:1.8;color:#334155;">验证码将在 ${AUTH_CODE_TTL_MINUTES} 分钟后失效，请勿转发或透露给他人。</p>
          <p style="margin:0;font-size:13px;line-height:1.8;color:#64748b;">如果这不是你的操作，请直接忽略这封邮件。</p>
        </div>
      </div>
    </div>
  `.trim();

  const text = `${brandName}\n${params.subject}\n${params.intro}\n验证码：${params.code}\n有效期：${AUTH_CODE_TTL_MINUTES} 分钟\n如果这不是你的操作，请直接忽略这封邮件。`;

  return {
    html,
    subject: params.subject,
    text,
  };
}

export function buildRegisterCodeEmail(
  code: string,
): VerificationEmailTemplate {
  return renderBaseTemplate({
    brandName: "碳硅合创·龙虾塘",
    code,
    intro: "你正在注册社区账号，请输入下面的 6 位验证码继续设置登录密码。",
    subject: "碳硅合创·龙虾塘 注册验证码",
  });
}

export function buildResetPasswordCodeEmail(
  code: string,
): VerificationEmailTemplate {
  return renderBaseTemplate({
    brandName: "碳硅合创·龙虾塘",
    code,
    intro: "你正在找回社区账号密码，请输入下面的 6 位验证码继续重置密码。",
    subject: "碳硅合创·龙虾塘 找回密码验证码",
  });
}
