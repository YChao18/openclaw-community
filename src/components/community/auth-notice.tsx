import Link from "next/link";
import { LockKeyhole } from "lucide-react";

type AuthNoticeProps = {
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
  message?: string;
  title: string;
};

export function AuthNotice({
  actionHref,
  actionLabel,
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
        {message ?? "请先登录后继续操作。"}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
