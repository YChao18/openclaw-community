"use server";

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
  getTagOptions,
  type CommunityTagOption,
  type PostFavoriteIntent,
  type PostLikeIntent,
  setPostFavoriteState,
  setPostLikeState,
} from "@/lib/community";

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

function getPostRedirectPath(slug: string) {
  return `/posts/${encodeURIComponent(slug)}`;
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

  const post = await createCommunityPost({
    authorId: session.user.id,
    content,
    tagIds: selectedTagIds,
    title,
  });

  revalidatePath("/posts");
  revalidatePath("/tags");
  revalidatePath("/me/posts");
  redirect(getPostRedirectPath(post.slug));
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
