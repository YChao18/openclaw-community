"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

type PostOwnerActionsProps = {
  deleteAction: (formData: FormData) => void | Promise<void>;
  editHref: string;
  returnTo: string;
  postSlug: string;
};

function DeletePostButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "正在删除..." : "删除帖子"}
    </button>
  );
}

export function PostOwnerActions({
  deleteAction,
  editHref,
  returnTo,
  postSlug,
}: PostOwnerActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={editHref}
        className="inline-flex items-center rounded-full border border-default bg-surface px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
      >
        编辑帖子
      </Link>

      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm("确认删除这篇帖子吗？删除后无法恢复。")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="postSlug" value={postSlug} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <DeletePostButton />
      </form>
    </div>
  );
}
