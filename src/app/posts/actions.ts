"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createUniquePostSlug,
  getPostExcerpt,
  type CommunityTagOption,
} from "@/lib/community";
import { prisma } from "@/lib/prisma";

type CommunityActionErrors = {
  content?: string;
  tags?: string;
  title?: string;
};

export type CommunityActionState = {
  errors?: CommunityActionErrors;
  message: string;
};

export const initialCommunityActionState: CommunityActionState = {
  message: "",
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
      message:
        "当前版本尚未开放登录功能，后续将支持邮箱验证码注册登录。",
    } satisfies CommunityActionState;
  }

  const availableTags = await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  const title = normalizeTextEntry(formData.get("title"));
  const content = normalizeTextEntry(formData.get("content"));
  const selectedTagIds = getTagIds(formData);
  const errors = validatePostInput({
    availableTags: availableTags.map((tag) => ({
      description: null,
      id: tag.id,
      name: tag.name,
      postCount: 0,
      slug: tag.slug,
    })),
    content,
    selectedTagIds,
    title,
  });

  if (errors.title || errors.content || errors.tags) {
    return {
      errors,
      message: "请完善帖子内容后再提交。",
    } satisfies CommunityActionState;
  }

  const slug = await createUniquePostSlug(title);
  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content,
      excerpt: getPostExcerpt(content),
      publishedAt: new Date(),
      slug,
      tags: {
        connect: selectedTagIds.map((id) => ({
          id,
        })),
      },
      title,
    },
    select: {
      slug: true,
    },
  });

  revalidatePath("/posts");
  revalidatePath("/tags");
  redirect(`/posts/${post.slug}`);
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
      message:
        "当前版本尚未开放登录功能，后续将支持邮箱验证码注册登录。",
    } satisfies CommunityActionState;
  }

  if (!postId || !postSlug) {
    return {
      message: "帖子信息缺失，请刷新后重试。",
    } satisfies CommunityActionState;
  }

  if (content.length < 3) {
    return {
      errors: {
        content: "评论至少需要 3 个字符。",
      },
      message: "评论内容太短了。",
    } satisfies CommunityActionState;
  }

  await prisma.comment.create({
    data: {
      authorId: session.user.id,
      content,
      postId,
    },
  });

  revalidatePath(`/posts/${postSlug}`);
  revalidatePath("/posts");
  redirect(`/posts/${postSlug}#comments`);
}
