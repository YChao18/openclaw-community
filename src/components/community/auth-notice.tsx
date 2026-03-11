import { LockKeyhole } from "lucide-react";

type AuthNoticeProps = {
  compact?: boolean;
  message?: string;
  title: string;
};

export function AuthNotice({
  compact = false,
  message,
  title,
}: AuthNoticeProps) {
  return (
    <section
      className={`rounded-[1.75rem] border border-default bg-surface ${
        compact ? "p-5" : "p-6 md:p-7"
      }`}
    >
      <div className="flex items-center gap-3 text-brand-yellow">
        <LockKeyhole className="h-5 w-5" />
        <p className="text-sm font-medium tracking-[0.2em] uppercase">{title}</p>
      </div>
      <p className="mt-4 text-sm leading-7 text-secondary">
        {message ??
          "当前版本尚未开放登录功能，后续将支持邮箱验证码注册登录。M1 阶段仅开放帖子浏览与权限提示。"}
      </p>
    </section>
  );
}
