"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type {
  CommunityActionErrors,
  CommunityActionState,
} from "@/app/posts/action-state";
import {
  createCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
  getEditablePostBySlug,
  getTagOptions,
  type CommunityTagOption,
  type PostFavoriteIntent,
  type PostLikeIntent,
  type PostAttachmentItem,
  updateCommunityPost,
  setPostFavoriteState,
  setPostLikeState,
} from "@/lib/community";

const POST_ATTACHMENT_DIR = join(
  process.cwd(),
  "public",
  "uploads",
  "post-attachments",
);
const POST_ATTACHMENT_PUBLIC_PREFIX = "/uploads/post-attachments";
const POST_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".webp",
]);
const MIME_EXTENSION_MAP: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function normalizeTextEntry(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getTagIds(formData: FormData) {
  return formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getStringValues(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isFileEntry(value: FormDataEntryValue): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function getAttachmentFiles(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter(isFileEntry)
    .filter((file) => file.size > 0);
}

function getPostRedirectPath(slug: string) {
  return `/posts/${encodeURIComponent(slug)}`;
}

function getPostEditPath(slug: string) {
  return `${getPostRedirectPath(slug)}/edit`;
}

function revalidatePostInteractionPaths(postSlug: string) {
  revalidatePath("/posts");
  revalidatePath(getPostRedirectPath(postSlug));
  revalidatePath("/me");
  revalidatePath("/me/favorites");
}

function isLikeIntent(intent: string): intent is PostLikeIntent {
  return intent === "like" || intent === "unlike";
}

function isFavoriteIntent(intent: string): intent is PostFavoriteIntent {
  return intent === "save" || intent === "unsave";
}

function validatePostInput(input: {
  availableTags: CommunityTagOption[];
  content: string;
  selectedTagIds: string[];
  title: string;
}) {
  const errors: CommunityActionErrors = {};

  if (input.title.length < 6) {
    errors.title = "标题至少需要 6 个字符。";
  } else if (input.title.length > 160) {
    errors.title = "标题最多 160 个字符。";
  }

  if (input.content.length < 20) {
    errors.content = "正文至少需要 20 个字符。";
  }

  if (input.selectedTagIds.length === 0) {
    errors.tags = "请至少选择一个标签。";
  } else {
    const availableTagIds = new Set(input.availableTags.map((tag) => tag.id));
    const hasInvalidTag = input.selectedTagIds.some(
      (tagId) => !availableTagIds.has(tagId),
    );

    if (hasInvalidTag) {
      errors.tags = "提交的标签无效，请重新选择。";
    }
  }

  return errors;
}

function isSafeReturnPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

function getAttachmentExtension(file: File) {
  const originalExtension = extname(file.name).toLowerCase();

  if (ALLOWED_ATTACHMENT_EXTENSIONS.has(originalExtension)) {
    return originalExtension;
  }

  return MIME_EXTENSION_MAP[file.type] ?? "";
}

function validateAttachmentFiles(files: File[]) {
  for (const file of files) {
    const extension = getAttachmentExtension(file);

    if (
      !ALLOWED_ATTACHMENT_TYPES.has(file.type) ||
      !ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)
    ) {
      return "附件仅支持 PDF、PNG、JPG、JPEG、WEBP 和 GIF 文件。";
    }

    if (file.size > POST_ATTACHMENT_MAX_SIZE) {
      return "单个附件大小不能超过 10MB。";
    }
  }

  return null;
}

async function persistAttachmentFiles(files: File[]) {
  if (files.length === 0) {
    return [] as Array<{
      mimeType: string;
      originalName: string;
      size: number;
      storagePath: string;
    }>;
  }

  await mkdir(POST_ATTACHMENT_DIR, { recursive: true });

  const savedFiles: Array<{
    mimeType: string;
    originalName: string;
    size: number;
    storagePath: string;
  }> = [];

  try {
    for (const file of files) {
      const extension = getAttachmentExtension(file);
      const storageName = `${Date.now()}-${randomUUID()}${extension}`;
      const storagePath = `${POST_ATTACHMENT_PUBLIC_PREFIX}/${storageName}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await writeFile(join(POST_ATTACHMENT_DIR, storageName), fileBuffer);

      savedFiles.push({
        mimeType: file.type,
        originalName: file.name,
        size: file.size,
        storagePath,
      });
    }
  } catch (error) {
    await removeStoredFiles(savedFiles.map((file) => file.storagePath));
    throw error;
  }

  return savedFiles;
}

async function removeStoredFiles(storagePaths: string[]) {
  await Promise.all(
    storagePaths.map(async (storagePath) => {
      const relativePath = storagePath.replace(/^\/+/, "");

      try {
        await unlink(join(process.cwd(), "public", relativePath));
      } catch (error) {
        console.error("Failed to remove stored attachment", error);
      }
    }),
  );
}

function getRemovedAttachments(
  currentAttachments: PostAttachmentItem[],
  keepAttachmentIds: string[],
) {
  const keepSet = new Set(keepAttachmentIds);

  return currentAttachments.filter((attachment) => !keepSet.has(attachment.id));
}

export async function createPostAction(
  _prevState: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      message: "请先登录后再发布帖子。",
    };
  }

  const availableTags = await getTagOptions();
  const title = normalizeTextEntry(formData.get("title"));
  const content = normalizeTextEntry(formData.get("content"));
  const selectedTagIds = getTagIds(formData);
  const attachmentFiles = getAttachmentFiles(formData);
  const attachmentError = validateAttachmentFiles(attachmentFiles);
  const errors = validatePostInput({
    availableTags,
    content,
    selectedTagIds,
    title,
  });

  if (errors.title || errors.content || errors.tags) {
    return {
      errors,
      message: "请完善帖子内容后再提交。",
    };
  }

  if (attachmentError) {
    return {
      errors: {
        attachments: attachmentError,
      },
      message: "请检查附件后再提交。",
    };
  }

  const savedAttachments = await persistAttachmentFiles(attachmentFiles);

  try {
    const post = await createCommunityPost({
      attachments: savedAttachments,
      authorId: session.user.id,
      content,
      tagIds: selectedTagIds,
      title,
    });

    revalidatePath("/posts");
    revalidatePath("/tags");
    revalidatePath("/me/posts");
    redirect(getPostRedirectPath(post.slug));
  } catch (error) {
    await removeStoredFiles(savedAttachments.map((attachment) => attachment.storagePath));
    throw error;
  }
}

export async function updatePostAction(
  _prevState: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const session = await auth();
  const postSlug = normalizeTextEntry(formData.get("postSlug"));

  if (!session?.user?.id) {
    return {
      message: "请先登录后再编辑帖子。",
    };
  }

  if (!postSlug) {
    return {
      message: "帖子信息缺失，请返回后重试。",
    };
  }

  const editablePost = await getEditablePostBySlug({
    authorId: session.user.id,
    slug: postSlug,
  });

  if (!editablePost) {
    return {
      message: "只有帖子作者本人可以编辑这篇帖子。",
    };
  }

  const availableTags = await getTagOptions();
  const title = normalizeTextEntry(formData.get("title"));
  const content = normalizeTextEntry(formData.get("content"));
  const selectedTagIds = getTagIds(formData);
  const keepAttachmentIds = getStringValues(formData, "keepAttachmentIds").filter(
    (attachmentId) =>
      editablePost.attachments.some((attachment) => attachment.id === attachmentId),
  );
  const removedAttachments = getRemovedAttachments(
    editablePost.attachments,
    keepAttachmentIds,
  );
  const attachmentFiles = getAttachmentFiles(formData);
  const attachmentError = validateAttachmentFiles(attachmentFiles);
  const errors = validatePostInput({
    availableTags,
    content,
    selectedTagIds,
    title,
  });

  if (errors.title || errors.content || errors.tags) {
    return {
      errors,
      message: "请完善帖子内容后再提交。",
    };
  }

  if (attachmentError) {
    return {
      errors: {
        attachments: attachmentError,
      },
      message: "请检查附件后再提交。",
    };
  }

  const savedAttachments = await persistAttachmentFiles(attachmentFiles);

  try {
    await updateCommunityPost({
      attachments: savedAttachments,
      content,
      keepAttachmentIds,
      postId: editablePost.id,
      tagIds: selectedTagIds,
      title,
    });
  } catch (error) {
    await removeStoredFiles(savedAttachments.map((attachment) => attachment.storagePath));
    throw error;
  }

  await removeStoredFiles(
    removedAttachments.map((attachment) => attachment.storagePath),
  );

  revalidatePath("/posts");
  revalidatePath("/tags");
  revalidatePath("/me/posts");
  revalidatePath(getPostRedirectPath(postSlug));
  revalidatePath(getPostEditPath(postSlug));
  redirect(getPostRedirectPath(postSlug));
}

export async function deletePostAction(formData: FormData) {
  const session = await auth();
  const postSlug = normalizeTextEntry(formData.get("postSlug"));
  const returnTo = normalizeTextEntry(formData.get("returnTo")) || "/posts";

  if (!session?.user?.id || !postSlug) {
    redirect("/login");
  }

  const editablePost = await getEditablePostBySlug({
    authorId: session.user.id,
    slug: postSlug,
  });

  if (!editablePost) {
    redirect(getPostRedirectPath(postSlug));
  }

  await deleteCommunityPost({
    postId: editablePost.id,
  });

  await removeStoredFiles(
    editablePost.attachments.map((attachment) => attachment.storagePath),
  );

  revalidatePath("/posts");
  revalidatePath("/me/posts");
  revalidatePath("/tags");
  revalidatePath(getPostRedirectPath(postSlug));
  redirect(isSafeReturnPath(returnTo) ? returnTo : "/posts");
}

export async function createCommentAction(
  _prevState: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const session = await auth();
  const postId = normalizeTextEntry(formData.get("postId"));
  const postSlug = normalizeTextEntry(formData.get("postSlug"));
  const content = normalizeTextEntry(formData.get("content"));

  if (!session?.user?.id) {
    return {
      message: "请先登录后参与讨论。",
    };
  }

  if (!postId || !postSlug) {
    return {
      message: "帖子信息缺失，请刷新后重试。",
    };
  }

  if (content.length < 3) {
    return {
      errors: {
        content: "评论至少需要 3 个字符。",
      },
      message: "评论内容太短了。",
    };
  }

  await createCommunityComment({
    authorId: session.user.id,
    content,
    postId,
  });

  revalidatePath(getPostRedirectPath(postSlug));
  revalidatePath("/posts");
  revalidatePath("/me/posts");
  redirect(`${getPostRedirectPath(postSlug)}#comments`);
}

export async function deleteCommentAction(formData: FormData) {
  const session = await auth();
  const commentId = normalizeTextEntry(formData.get("commentId"));
  const postSlug = normalizeTextEntry(formData.get("postSlug"));

  if (!session?.user?.id || !commentId || !postSlug) {
    redirect(postSlug ? `${getPostRedirectPath(postSlug)}#comments` : "/posts");
  }

  await deleteCommunityComment({
    authorId: session.user.id,
    commentId,
  });

  revalidatePath("/posts");
  revalidatePath("/me/posts");
  revalidatePath(getPostRedirectPath(postSlug));

  redirect(`${getPostRedirectPath(postSlug)}#comments`);
}

export async function setPostLikeAction(
  _prevState: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const session = await auth();
  const postId = normalizeTextEntry(formData.get("postId"));
  const postSlug = normalizeTextEntry(formData.get("postSlug"));
  const intent = normalizeTextEntry(formData.get("intent"));

  if (!session?.user?.id) {
    return {
      message: "请先登录后再点赞帖子。",
    };
  }

  if (!postId || !postSlug) {
    return {
      message: "帖子信息缺失，请刷新页面后重试。",
    };
  }

  if (!isLikeIntent(intent)) {
    return {
      message: "点赞操作无效，请刷新后重试。",
    };
  }

  const post = await setPostLikeState({
    intent,
    postId,
    postSlug,
    userId: session.user.id,
  });

  if (!post) {
    return {
      message: "帖子不存在或暂时不可操作。",
    };
  }

  revalidatePostInteractionPaths(post.slug);

  return {
    message:
      intent === "like" ? "已点赞这篇帖子。" : "已取消点赞，你仍可稍后再次点赞。",
  };
}

export async function setPostFavoriteAction(
  _prevState: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const session = await auth();
  const postId = normalizeTextEntry(formData.get("postId"));
  const postSlug = normalizeTextEntry(formData.get("postSlug"));
  const intent = normalizeTextEntry(formData.get("intent"));

  if (!session?.user?.id) {
    return {
      message: "请先登录后再收藏帖子。",
    };
  }

  if (!postId || !postSlug) {
    return {
      message: "帖子信息缺失，请刷新页面后重试。",
    };
  }

  if (!isFavoriteIntent(intent)) {
    return {
      message: "收藏操作无效，请刷新后重试。",
    };
  }

  const post = await setPostFavoriteState({
    intent,
    postId,
    postSlug,
    userId: session.user.id,
  });

  if (!post) {
    return {
      message: "帖子不存在或暂时不可操作。",
    };
  }

  revalidatePostInteractionPaths(post.slug);

  return {
    message:
      intent === "save"
        ? "已收藏这篇帖子。"
        : "已取消收藏，这篇帖子将从我的收藏中移除。",
  };
}
