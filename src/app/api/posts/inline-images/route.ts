import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getInlineImageStorageBackend,
  isInlineImageConfigurationError,
  isInlineImagePersistenceError,
  persistInlineImageFile,
  validateInlineImageFile,
} from "@/lib/post-inline-images";

export const runtime = "nodejs";

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

function getInlineImageTarget(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "targetPath" in error &&
    typeof error.targetPath === "string"
  ) {
    return error.targetPath;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "missingEnvVar" in error &&
    typeof error.missingEnvVar === "string"
  ) {
    return error.missingEnvVar;
  }

  return getInlineImageStorageBackend() === "blob"
    ? "post-inline-images/*"
    : "public/uploads/post-inline-images";
}

function getInlineImageStorageBackendForLog(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "storageBackend" in error &&
    (error.storageBackend === "blob" || error.storageBackend === "local")
  ) {
    return error.storageBackend;
  }

  return getInlineImageStorageBackend();
}

function logInlineImageUploadError(input: {
  error: unknown;
  file: File | null;
  phase: "auth" | "config" | "formData" | "storage" | "unknown";
}) {
  const summary = getErrorSummary(input.error);

  console.error("Failed to upload post inline image", {
    errorMessage: summary.message,
    errorName: summary.name,
    fileSize: input.file?.size ?? null,
    mimeType: input.file?.type ?? null,
    phase: input.phase,
    storageBackend: getInlineImageStorageBackendForLog(input.error),
    targetPath: getInlineImageTarget(input.error),
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
        { message: "正文图片上传请求无效，请重新选择图片后再试。" },
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
    const isConfigError = isInlineImageConfigurationError(error);
    const isStorageError = isInlineImagePersistenceError(error);

    logInlineImageUploadError({
      error,
      file,
      phase: isConfigError ? "config" : isStorageError ? "storage" : file ? "unknown" : "auth",
    });

    return NextResponse.json(
      {
        message: isConfigError
          ? "正文图片上传配置缺失：线上环境未设置 BLOB_READ_WRITE_TOKEN，无法保存正文图片。"
          : isStorageError
            ? "正文图片保存失败，请检查线上 Blob 存储配置或稍后重试。"
            : "正文图片上传失败，请稍后重试。",
      },
      { status: isConfigError ? 500 : isStorageError ? 507 : 500 },
    );
  }
}
