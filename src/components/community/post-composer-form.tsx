"use client";

import { useActionState, useState, type FormEvent } from "react";
import type { CommunityActionState } from "@/app/posts/action-state";
import { initialCommunityActionState } from "@/app/posts/action-state";
import { createPostAction } from "@/app/posts/actions";
import { PostRichTextEditor } from "@/components/community/post-rich-text-editor";
import { SubmitButton } from "@/components/community/submit-button";
import type { CommunityTagOption, PostAttachmentItem } from "@/lib/community";
import {
  POST_ATTACHMENT_MAX_TOTAL_SIZE_LABEL,
  validateAttachmentFiles,
} from "@/lib/post-attachments";
import { cn } from "@/lib/utils";

type PostComposerFormProps = {
  action?: (
    state: CommunityActionState,
    formData: FormData,
  ) => Promise<CommunityActionState>;
  description?: string;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
  initialValues?: {
    attachments?: PostAttachmentItem[];
    content: string;
    tagIds: string[];
    title: string;
  };
  pendingLabel?: string;
  submitLabel?: string;
  tags: CommunityTagOption[];
};

export function PostComposerForm({
  action = createPostAction,
  description = "发布成功后会自动跳转到帖子详情页。",
  hiddenFields = [],
  initialValues,
  pendingLabel = "正在发布...",
  submitLabel = "发布帖子",
  tags,
}: PostComposerFormProps) {
  const [clientAttachmentError, setClientAttachmentError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    () => initialValues?.tagIds ?? [],
  );
  const [state, formAction] = useActionState(
    action,
    initialCommunityActionState,
  );

  function handleAttachmentChange(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    const nextError = validateAttachmentFiles(nextFiles) ?? "";

    setSelectedFiles(nextFiles);
    setClientAttachmentError(nextError);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const attachmentField = event.currentTarget.elements.namedItem("attachments");
    const files =
      attachmentField instanceof HTMLInputElement
        ? Array.from(attachmentField.files ?? [])
        : selectedFiles;
    const nextError = validateAttachmentFiles(files) ?? "";

    setClientAttachmentError(nextError);

    if (nextError) {
      event.preventDefault();
    }
  }

  function handleTagToggle(tagId: string, checked: boolean) {
    setSelectedTagIds((currentTagIds) => {
      if (checked) {
        return currentTagIds.includes(tagId)
          ? currentTagIds
          : [...currentTagIds, tagId];
      }

      return currentTagIds.filter((currentTagId) => currentTagId !== tagId);
    });
  }

  return (
    <form
      action={formAction}
      className="space-y-6"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      {hiddenFields.map((field) => (
        <input
          key={field.name}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-primary">
          标题
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialValues?.title}
          placeholder="例如：OpenClaw 在团队内部落地时有哪些踩坑？"
          className="w-full rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-lg text-primary outline-none transition placeholder:text-secondary/80 focus:border-brand-yellow/40 md:text-xl"
        />
        {state.errors?.title ? (
          <p className="text-sm text-brand-lobster">{state.errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-primary">
          正文
        </label>
        <PostRichTextEditor
          id="content"
          name="content"
          defaultValue={initialValues?.content}
          placeholder="写下你的经验、问题背景、已尝试过的方法，以及希望得到的反馈。"
        />
        {state.errors?.content ? (
          <p className="text-sm text-brand-lobster">{state.errors.content}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <label htmlFor="attachments" className="text-sm font-medium text-primary">
          附件
        </label>
        <input
          id="attachments"
          name="attachments"
          type="file"
          multiple
          accept=".pdf,image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => handleAttachmentChange(event.target.files)}
          className="block w-full text-sm text-secondary file:mr-4 file:rounded-full file:border file:border-default file:bg-surface file:px-4 file:py-2 file:text-sm file:text-primary hover:file:bg-interactive-muted-hover"
        />
        <p className="text-sm leading-7 text-secondary">
          支持 PDF、PNG、JPG、JPEG、WEBP、GIF，单个附件不超过 10MB，总大小不超过{" "}
          {POST_ATTACHMENT_MAX_TOTAL_SIZE_LABEL}。
        </p>
        {selectedFiles.length > 0 ? (
          <div className="rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-secondary">
            <p className="font-medium text-primary">待上传附件</p>
            <ul className="mt-2 space-y-2">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {initialValues?.attachments && initialValues.attachments.length > 0 ? (
          <div className="rounded-[1.25rem] border border-default bg-interactive-muted px-4 py-3 text-sm text-secondary">
            <p className="font-medium text-primary">当前附件</p>
            <div className="mt-2 space-y-2">
              {initialValues.attachments.map((attachment) => (
                <label
                  key={attachment.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="truncate">{attachment.originalName}</span>
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="keepAttachmentIds"
                      value={attachment.id}
                      defaultChecked
                      className="h-4 w-4 rounded border-default bg-transparent text-brand-yellow focus:ring-0"
                    />
                    <span>保留</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {clientAttachmentError || state.errors?.attachments ? (
          <p className="text-sm text-brand-lobster">
            {clientAttachmentError || state.errors?.attachments}
          </p>
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
                checked={selectedTagIds.includes(tag.id)}
                onChange={(event) =>
                  handleTagToggle(tag.id, event.currentTarget.checked)
                }
                className="h-4 w-4 rounded border-default bg-transparent text-brand-yellow focus:ring-0"
              />
              <span>{tag.name}</span>
              <span className="text-xs text-secondary/80">{tag.postCount}</span>
            </label>
          ))}
        </div>
        <p className="text-sm leading-7 text-secondary">
          标签可选，不选择时系统会自动归类到“其他”。
        </p>
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
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
        <p className="text-sm leading-7 text-secondary">{description}</p>
      </div>
    </form>
  );
}
