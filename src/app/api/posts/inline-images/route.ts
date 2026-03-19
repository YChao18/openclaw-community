import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  INLINE_IMAGE_UPLOAD_DIR,
  InlineImageStorageError,
  isInlineImagePersistenceError,
  persistInlineImageFile,
  validateInlineImageFile,
} from "@/lib/post-inline-images";

function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function logInlineImageUploadError(input: {
  error: unknown;
  file: File | null;
  phase: "auth" | "formData" | "storage" | "unknown";
}) {
  const summary = getErrorSummary(input.error);
  const targetPath =
    input.error instanceof InlineImageStorageError
      ? input.error.targetPath
      : INLINE_IMAGE_UPLOAD_DIR;

  console.error("Failed to upload post inline image", {
    errorMessage: summary.message,
    errorName: summary.name,
    fileSize: input.file?.size ?? null,
    mimeType: input.file?.type ?? null,
    phase: input.phase,
    targetPath,
  });
}

export async function POST(request: Request) {
  let file: File | null = null;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "请先登录后再上传正文图片。" },
        { status: 401 },
      );
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch (error) {
      logInlineImageUploadError({
        error,
        file: null,
        phase: "formData",
      });

      return NextResponse.json(
        { message: "正文图片请求格式无效，请重新选择图片后再试。" },
        { status: 400 },
      );
    }

    const fileEntry = formData.get("file");
    file = fileEntry instanceof File ? fileEntry : null;

    const validationError = validateInlineImageFile(file);

    if (validationError) {
      return NextResponse.json(
        { message: validationError.message },
        { status: validationError.status },
      );
    }

    if (!file) {
      return NextResponse.json(
        { message: "请选择一张正文图片后再上传。" },
        { status: 400 },
      );
    }

    const uploadedImage = await persistInlineImageFile(file);

    return NextResponse.json(uploadedImage);
  } catch (error) {
    const isStorageError = isInlineImagePersistenceError(error);

    logInlineImageUploadError({
      error,
      file,
      phase: isStorageError ? "storage" : file ? "unknown" : "auth",
    });

    return NextResponse.json(
      {
        message: isStorageError
          ? "正文图片保存失败，请检查上传目录权限或挂载后重试。"
          : "正文图片上传失败，请稍后重试。",
      },
      { status: isStorageError ? 507 : 500 },
    );
  }
}
