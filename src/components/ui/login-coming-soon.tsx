"use client";

import { useState } from "react";
import { Info } from "lucide-react";

export function LoginComingSoon() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-brand-yellow/30 bg-brand-yellow-soft px-4 py-2 text-sm font-medium text-brand-yellow transition hover:bg-brand-yellow/20"
        aria-expanded={open}
        aria-controls="login-coming-soon-panel"
      >
        登录暂未启用
      </button>

      {open ? (
        <div
          id="login-coming-soon-panel"
          className="absolute right-0 z-20 mt-3 w-72 rounded-[1.25rem] border border-default bg-surface-strong p-4 shadow-[0_20px_50px_var(--shadow-card)]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full border border-brand-yellow/20 bg-brand-yellow-soft p-2 text-brand-yellow">
              <Info className="h-4 w-4" />
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">邮箱登录即将开放</p>
              <p className="text-sm leading-6 text-secondary">
                当前版本尚未开放登录功能，后续将支持邮箱验证码注册登录。
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
