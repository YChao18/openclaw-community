"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { postAuthJson } from "@/components/auth/api";
import { useCountdown } from "@/components/auth/use-countdown";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { isValidEmailAddress } from "@/lib/auth/email-address";

type RegisterFormProps = {
  redirectTo?: string | null;
};

type RegisterStep = "email" | "verify" | "password";

const inputClassName =
  "w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40";

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const [step, setStep] = useState<RegisterStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actionToken, setActionToken] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const { countdown, setCountdown } = useCountdown();
  const [isSending, startSendTransition] = useTransition();
  const [isVerifying, startVerifyTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  function resetMessages() {
    setError("");
    setNotice("");
  }

  function handleSendCode() {
    resetMessages();

    if (!isValidEmailAddress(email)) {
      setError("请输入有效的邮箱地址。");
      return;
    }

    startSendTransition(async () => {
      const result = await postAuthJson<{ retryAfterSeconds?: number }>(
        "/api/auth/send-code",
        {
          email,
        },
      );

      if (!result.ok) {
        setError(result.message);

        if (result.retryAfterSeconds) {
          setCountdown(result.retryAfterSeconds);
        }

        return;
      }

      setStep("verify");
      setCountdown(result.retryAfterSeconds ?? 60);
      setNotice(result.message);
    });
  }

  function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (code.length !== 6) {
      setError("请输入 6 位数字验证码。");
      return;
    }

    startVerifyTransition(async () => {
      const result = await postAuthJson<{
        actionToken: string;
        actionTokenExpiresAt: string;
      }>("/api/auth/verify-code", {
        code,
        email,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setActionToken(result.actionToken);
      setStep("password");
      setNotice(result.message);
    });
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!password || !confirmPassword) {
      setError("请先完整填写密码和确认密码。");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    startSubmitTransition(async () => {
      const result = await postAuthJson<Record<string, never>>(
        "/api/auth/register",
        {
          email,
          password,
          token: actionToken,
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

  function handleChangeEmail() {
    setStep("email");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setActionToken("");
    resetMessages();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-sm">
        <StepBadge active={step === "email"} index="1" label="填写邮箱" />
        <StepBadge active={step === "verify"} index="2" label="验证邮箱" />
        <StepBadge active={step === "password"} index="3" label="设置密码" />
      </div>

      <div className="border-default bg-interactive-muted/60 rounded-[1.5rem] border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-primary text-sm font-medium">注册邮箱</p>
            <p className="text-secondary mt-1 text-sm">
              {email ? email : "尚未填写邮箱"}
            </p>
          </div>
          {step !== "email" ? (
            <button
              type="button"
              onClick={handleChangeEmail}
              className="border-default text-primary hover:bg-interactive-muted-hover rounded-full border px-4 py-2 text-sm transition"
            >
              更换邮箱
            </button>
          ) : null}
        </div>
      </div>

      {step === "email" ? (
        <div className="space-y-6">
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSending || countdown > 0}
              className="bg-brand-yellow rounded-full px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending
                ? "发送中..."
                : countdown > 0
                  ? `重新发送（${countdown}s）`
                  : "发送验证码"}
            </button>
            <p className="text-secondary text-sm">
              验证通过后即可设置登录密码并自动登录。
            </p>
          </div>
        </div>
      ) : null}

      {step === "verify" ? (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="code" className="text-primary text-sm font-medium">
              邮箱验证码
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
              placeholder="请输入 6 位数字验证码"
              className={`${inputClassName} tracking-[0.3em] placeholder:tracking-normal`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isVerifying}
              className="bg-brand-yellow rounded-full px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "验证中..." : "验证验证码"}
            </button>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSending || countdown > 0}
              className="border-default bg-surface text-primary hover:bg-interactive-muted-hover rounded-full border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending
                ? "发送中..."
                : countdown > 0
                  ? `重新发送（${countdown}s）`
                  : "重新发送"}
            </button>
          </div>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-primary text-sm font-medium"
              >
                设置密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 8 位，包含字母和数字"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-primary text-sm font-medium"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="请再次输入密码"
                className={inputClassName}
              />
            </div>
          </div>

          <p className="text-secondary text-sm">
            密码至少 8 位，需同时包含字母和数字。
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-yellow rounded-full px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "设置中..." : "完成注册"}
          </button>
        </form>
      ) : null}

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

      <div className="text-secondary flex flex-wrap items-center gap-3 text-sm">
        <span>已经有账号了？</span>
        <Link
          href={
            redirectTo
              ? `/login?redirect=${encodeURIComponent(
                  getSafeRedirectPath(redirectTo),
                )}`
              : "/login"
          }
          className="hover:text-primary transition"
        >
          去登录
        </Link>
      </div>
    </div>
  );
}

function StepBadge(props: { active: boolean; index: string; label: string }) {
  return (
    <div
      className={`rounded-full border px-4 py-2 ${
        props.active
          ? "border-brand-yellow/30 bg-brand-yellow-soft text-primary"
          : "border-default bg-surface text-secondary"
      }`}
    >
      <span className="mr-2 text-xs tracking-[0.24em] uppercase">
        Step {props.index}
      </span>
      <span>{props.label}</span>
    </div>
  );
}
