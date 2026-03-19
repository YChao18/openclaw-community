"use client";

import { ImagePlus, LoaderCircle } from "lucide-react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { TextSelection } from "@tiptap/pm/state";
import { useId, useRef, useState } from "react";
import {
  getEditorPostContent,
  POST_RICH_CONTENT_PREFIX,
} from "@/lib/post-content";

type PostRichTextEditorProps = {
  defaultValue?: string;
  id: string;
  name: string;
  placeholder: string;
};

const ACCEPTED_IMAGE_TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"];

function isSupportedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function PostRichTextEditor({
  defaultValue = "",
  id,
  name,
  placeholder,
}: PostRichTextEditorProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [serializedContent, setSerializedContent] = useState(() => {
    const initialHtml = getEditorPostContent(defaultValue);
    return `${POST_RICH_CONTENT_PREFIX}${initialHtml}`;
  });

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/posts/inline-images", {
      body: formData,
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string; url?: string }
      | null;

    if (!response.ok || !payload?.url) {
      throw new Error(payload?.message || "正文图片上传失败，请稍后重试。");
    }

    return payload.url;
  }

  async function insertImages(files: File[]) {
    const editor = editorRef.current;

    if (!editor || files.length === 0) {
      return;
    }

    const supportedFiles = files.filter(isSupportedImage);

    if (supportedFiles.length === 0) {
      setUploadError("正文图片仅支持 PNG、JPG、JPEG、WEBP 和 GIF。");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      for (const file of supportedFiles) {
        const imageUrl = await uploadImage(file);
        editor
          .chain()
          .focus()
          .insertContent([
            {
              attrs: {
                alt: file.name,
                src: imageUrl,
                title: file.name,
              },
              type: "image",
            },
            {
              type: "paragraph",
            },
          ])
          .run();
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "正文图片上传失败，请稍后重试。",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const editor = useEditor({
    content: getEditorPostContent(defaultValue),
    editorProps: {
      attributes: {
        class:
          "min-h-72 rounded-[1.5rem] border border-default bg-interactive-muted px-4 py-4 text-base leading-8 text-primary outline-none transition focus:border-brand-yellow/40 md:text-lg",
        id,
      },
      handleDrop(view, event) {
        const droppedFiles = Array.from(event.dataTransfer?.files ?? []).filter(
          isSupportedImage,
        );

        if (droppedFiles.length === 0) {
          return false;
        }

        const position = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (position) {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.near(view.state.doc.resolve(position.pos)),
            ),
          );
        }

        void insertImages(droppedFiles);
        return true;
      },
      handlePaste(_view, event) {
        const pastedFiles = Array.from(event.clipboardData?.files ?? []).filter(
          isSupportedImage,
        );

        if (pastedFiles.length === 0) {
          return false;
        }

        void insertImages(pastedFiles);
        return true;
      },
    },
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        orderedList: false,
      }),
      Image.configure({
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    immediatelyRender: false,
    onCreate({ editor }) {
      editorRef.current = editor;
      setSerializedContent(`${POST_RICH_CONTENT_PREFIX}${editor.getHTML()}`);
    },
    onDestroy() {
      editorRef.current = null;
    },
    onUpdate({ editor }) {
      setSerializedContent(`${POST_RICH_CONTENT_PREFIX}${editor.getHTML()}`);
    },
  });

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={serializedContent} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border border-default bg-interactive-muted px-4 py-2 text-sm text-primary transition hover:bg-interactive-muted-hover"
        >
          {isUploading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          插入图片
        </button>
        <p className="text-sm leading-7 text-secondary">
          支持粘贴图片、拖拽图片到正文区域，或点击按钮上传并插入正文。
        </p>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          void insertImages(files);
        }}
      />

      <div className="post-editor__content rounded-[1.5rem]">
        <EditorContent editor={editor} />
      </div>

      {uploadError ? (
        <p className="text-sm text-brand-lobster">{uploadError}</p>
      ) : null}
    </div>
  );
}
