"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { postAuthJson } from "@/components/auth/api";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { isValidEmailAddress } from "@/lib/auth/email-address";

type LoginFormProps = {
  redirectTo?: string | null;
};

const inputClassName =
  "w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40";

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, startSubmitTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!isValidEmailAddress(email)) {
      setError("请输入有效的邮箱地址。");
      return;
    }

    if (!password) {
      setError("请输入登录密码。");
      return;
    }

    startSubmitTransition(async () => {
      const result = await postAuthJson<Record<string, never>>(
        "/api/auth/login",
        {
          email,
          password,
        },
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setNotice(result.message);
      window.location.assign(getSafeRedirectPath(redirectTo));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="email" className="text-primary text-sm font-medium">
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
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-primary text-sm font-medium"
          >
            登录密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入登录密码"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="text-secondary flex flex-wrap items-center justify-between gap-3 text-sm">
        <p>使用注册时设置的邮箱和密码登录社区账号。</p>
        <Link
          href={
            redirectTo
              ? `/forgot-password?redirect=${encodeURIComponent(
                  getSafeRedirectPath(redirectTo),
                )}`
              : "/forgot-password"
          }
          className="hover:text-primary transition"
        >
          忘记密码？
        </Link>
      </div>

      {notice ? (
        <p className="border-brand-yellow/30 bg-brand-yellow-soft text-primary rounded-2xl border px-4 py-3 text-sm">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="border-brand-lobster/20 bg-brand-lobster-soft text-primary rounded-2xl border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-yellow rounded-full px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "登录中..." : "登录"}
        </button>
        <Link
          href={
            redirectTo
              ? `/register?redirect=${encodeURIComponent(
                  getSafeRedirectPath(redirectTo),
                )}`
              : "/register"
          }
          className="border-default bg-surface text-primary hover:bg-interactive-muted-hover rounded-full border px-5 py-3 text-sm font-medium transition"
        >
          去注册
        </Link>
      </div>
    </form>
  );
}
