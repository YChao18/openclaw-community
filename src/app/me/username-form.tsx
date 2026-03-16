"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initialUsernameActionState } from "@/app/me/action-state";
import { updateUsernameAction } from "@/app/me/actions";
import { SubmitButton } from "@/components/community/submit-button";

type UsernameFormProps = {
  initialUsername: string;
};

export function UsernameForm({ initialUsername }: UsernameFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateUsernameAction, {
    ...initialUsernameActionState,
    username: initialUsername,
  });

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-primary">
          用户名
        </label>
        <input
          key={state.username || initialUsername || "username"}
          id="username"
          name="username"
          type="text"
          defaultValue={state.username || initialUsername}
          minLength={2}
          maxLength={10}
          pattern="[A-Za-z0-9_\u4e00-\u9fa5]+"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40"
          placeholder="例如：openclaw_01"
        />
        <p className="text-sm leading-7 text-secondary">
          支持 2-10 位中文、字母、数字或下划线。
        </p>
        {state.errors?.username ? (
          <p className="text-sm text-brand-lobster">{state.errors.username}</p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={
            state.success
              ? "rounded-2xl border border-brand-yellow/20 bg-brand-yellow-soft px-4 py-3 text-sm text-primary"
              : "rounded-2xl border border-brand-lobster/20 bg-brand-lobster-soft px-4 py-3 text-sm text-primary"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="正在保存...">保存用户名</SubmitButton>
      </div>
    </form>
  );
}
