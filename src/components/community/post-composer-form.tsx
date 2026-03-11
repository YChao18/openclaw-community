"use client";

import { useActionState } from "react";
import {
  createPostAction,
  initialCommunityActionState,
} from "@/app/posts/actions";
import type { CommunityTagOption } from "@/lib/community";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/community/submit-button";

type PostComposerFormProps = {
  tags: CommunityTagOption[];
};

export function PostComposerForm({ tags }: PostComposerFormProps) {
  const [state, formAction] = useActionState(
    createPostAction,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-primary">
          标题
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="例如：OpenClaw 在团队内部落地时有哪些踩坑？"
          className="w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40"
        />
        {state.errors?.title ? (
          <p className="text-sm text-brand-lobster">{state.errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-primary">
          正文
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          placeholder="写下你的经验、问题背景、已尝试过的方法，以及希望得到的反馈。"
          className="w-full rounded-[1.5rem] border border-default bg-interactive-muted px-4 py-4 text-sm leading-7 text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40"
        />
        {state.errors?.content ? (
          <p className="text-sm text-brand-lobster">{state.errors.content}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">标签</p>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border border-default bg-interactive-muted px-4 py-2 text-sm text-secondary transition hover:bg-interactive-muted-hover hover:text-primary",
              )}
            >
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                className="h-4 w-4 rounded border-default bg-transparent text-brand-yellow focus:ring-0"
              />
              <span>{tag.name}</span>
              <span className="text-xs text-secondary/80">{tag.postCount}</span>
            </label>
          ))}
        </div>
        {state.errors?.tags ? (
          <p className="text-sm text-brand-lobster">{state.errors.tags}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-2xl border border-brand-lobster/20 bg-brand-lobster-soft px-4 py-3 text-sm text-primary">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="正在发布...">发布帖子</SubmitButton>
        <p className="text-sm leading-7 text-secondary">
          发布成功后会自动跳转到帖子详情页。
        </p>
      </div>
    </form>
  );
}
