"use client";

import { useFormStatus } from "react-dom";

type CommentOwnerActionsProps = {
  commentId: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  postSlug: string;
};

function DeleteCommentButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm text-secondary transition hover:text-brand-lobster disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "正在删除..." : "删除评论"}
    </button>
  );
}

export function CommentOwnerActions({
  commentId,
  deleteAction,
  postSlug,
}: CommentOwnerActionsProps) {
  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除这条评论吗？删除后无法恢复。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="postSlug" value={postSlug} />
      <DeleteCommentButton />
    </form>
  );
}
