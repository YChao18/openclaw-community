"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState, useTransition } from "react";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { isValidEmailAddress } from "@/lib/auth/email-address";

type LoginFormProps = {
  redirectTo?: string | null;
};

type ApiResponse = {
  deliveryMode?: "fallback" | "resend";
  message?: string;
  ok: boolean;
  retryAfterSeconds?: number;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, startSendTransition] = useTransition();
  const [isVerifying, startVerifyTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldown]);

  async function parseResponse(response: Response): Promise<ApiResponse> {
    const payload = (await response.json().catch(() => null)) as ApiResponse | null;

    if (!payload) {
      return {
        message: "服务暂时不可用，请稍后再试。",
        ok: false,
      };
    }

    return payload;
  }

  function handleSendCode() {
    setError("");
    setNotice("");

    if (!isValidEmailAddress(email)) {
      setCodeSent(false);
      setError("请输入有效的邮箱地址。");
      return;
    }

    startSendTransition(async () => {
      const response = await fetch("/api/auth/send-code", {
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = await parseResponse(response);

      if (!result.ok) {
        setCodeSent(false);
        setError(result.message ?? "验证码发送失败，请稍后重试。");

        if (result.retryAfterSeconds) {
          setCooldown(result.retryAfterSeconds);
        }

        return;
      }

      setCodeSent(true);
      setCooldown(result.retryAfterSeconds ?? 60);
      setNotice(
        result.message ??
          (result.deliveryMode === "fallback"
            ? "当前为开发模式，验证码已输出到服务端日志，不代表真实邮件已发送。"
            : "如果该邮箱可正常接收邮件，你将收到登录验证码。"),
      );
    });
  }

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    startVerifyTransition(async () => {
      const response = await fetch("/api/auth/verify-code", {
        body: JSON.stringify({ code, email }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = await parseResponse(response);

      if (!result.ok) {
        setError(result.message ?? "验证码校验失败，请稍后重试。");
        return;
      }

      const target = getSafeRedirectPath(redirectTo);
      window.location.assign(target);
    });
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-primary">
          邮箱地址
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSendCode}
          disabled={isSending || cooldown > 0}
          className="rounded-full bg-brand-yellow px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending
            ? "发送中..."
            : cooldown > 0
              ? `重新发送（${cooldown}s）`
              : codeSent
                ? "重新发送验证码"
                : "发送验证码"}
        </button>
        <p className="text-sm leading-7 text-secondary">
          系统只校验邮箱格式；格式合法不代表邮箱真实存在。
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium text-primary">
          6 位验证码
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))
          }
          placeholder="请输入邮箱中的 6 位数字验证码"
          className="w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm tracking-[0.3em] text-primary outline-none transition placeholder:tracking-normal placeholder:text-secondary/80 focus:border-brand-yellow/40"
        />
      </div>

      {notice ? (
        <p className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow-soft px-4 py-3 text-sm text-primary">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-brand-lobster/20 bg-brand-lobster-soft px-4 py-3 text-sm text-primary">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isVerifying || !codeSent}
          className="rounded-full border border-default bg-surface px-5 py-3 text-sm font-medium text-primary transition hover:bg-interactive-muted-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? "登录中..." : "验证并登录"}
        </button>
        <Link
          href="/posts"
          className="text-sm text-secondary transition hover:text-primary"
        >
          先去看看社区内容
        </Link>
      </div>
    </form>
  );
}
