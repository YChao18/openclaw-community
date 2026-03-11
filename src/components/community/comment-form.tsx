"use client";

import { useActionState } from "react";
import {
  createCommentAction,
  initialCommunityActionState,
} from "@/app/posts/actions";
import { SubmitButton } from "@/components/community/submit-button";

type CommentFormProps = {
  postId: string;
  postSlug: string;
};

export function CommentForm({ postId, postSlug }: CommentFormProps) {
  const [state, formAction] = useActionState(
    createCommentAction,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="postSlug" value={postSlug} />

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-primary">
          评论内容
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          placeholder="写下你的补充、思路或者解决方案。"
          className="w-full rounded-[1.5rem] border border-default bg-interactive-muted px-4 py-4 text-sm leading-7 text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40"
        />
        {state.errors?.content ? (
          <p className="text-sm text-brand-lobster">{state.errors.content}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-2xl border border-brand-lobster/20 bg-brand-lobster-soft px-4 py-3 text-sm text-primary">
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingLabel="正在提交...">发表评论</SubmitButton>
    </form>
  );
}
