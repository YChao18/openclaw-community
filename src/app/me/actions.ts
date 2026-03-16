"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import type { UsernameActionState } from "@/app/me/action-state";
import {
  isUsernameTaken,
  normalizeUsername,
  updateUsernameForUser,
  validateUsername,
} from "@/lib/user/service";

function getUsernameValue(formData: FormData) {
  const username = formData.get("username");

  return typeof username === "string" ? normalizeUsername(username) : "";
}

export async function updateUsernameAction(
  _prevState: UsernameActionState,
  formData: FormData,
): Promise<UsernameActionState> {
  const session = await auth();
  const username = getUsernameValue(formData);

  if (!session?.user?.id) {
    return {
      message: "请先登录后再修改用户名。",
      success: false,
      username,
    };
  }

  const validationError = validateUsername(username);

  if (validationError) {
    return {
      errors: {
        username: validationError,
      },
      message: "请按要求填写用户名。",
      success: false,
      username,
    };
  }

  const currentUsername = normalizeUsername(session.user.username ?? "");

  if (currentUsername === username) {
    return {
      message: "用户名未发生变化。",
      success: true,
      username,
    };
  }

  if (await isUsernameTaken(username, session.user.id)) {
    return {
      errors: {
        username: "该用户名已被使用，请换一个试试。",
      },
      message: "用户名已存在。",
      success: false,
      username,
    };
  }

  try {
    await updateUsernameForUser({
      userId: session.user.id,
      username,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: {
          username: "该用户名已被使用，请换一个试试。",
        },
        message: "用户名已存在。",
        success: false,
        username,
      };
    }

    throw error;
  }

  revalidatePath("/me");
  revalidatePath("/me/posts");
  revalidatePath("/me/favorites");

  return {
    message: "用户名已保存。",
    success: true,
    username,
  };
}
