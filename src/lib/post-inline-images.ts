import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const INLINE_IMAGE_UPLOAD_DIR = join(
  process.cwd(),
  "public",
  "uploads",
  "post-inline-images",
);
export const INLINE_IMAGE_PUBLIC_PREFIX = "/uploads/post-inline-images";

const ALLOWED_INLINE_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const INLINE_IMAGE_EXTENSION_MAP: Record<string, string> = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const POST_INLINE_IMAGE_MAX_SIZE = 10 * 1024 * 1024;

type InlineImageValidationError = {
  message: string;
  status: 400 | 413;
};

function getInlineImageExtension(file: File) {
  return INLINE_IMAGE_EXTENSION_MAP[file.type] ?? "";
}

export function validateInlineImageFile(file: File | null | undefined) {
  if (!file || file.size === 0) {
    return {
      message: "请选择一张正文图片后再上传。",
      status: 400,
    } satisfies InlineImageValidationError;
  }

  if (!ALLOWED_INLINE_IMAGE_TYPES.has(file.type)) {
    return {
      message: "正文图片仅支持 PNG、JPG、JPEG、WEBP 和 GIF。",
      status: 400,
    } satisfies InlineImageValidationError;
  }

  if (file.size > POST_INLINE_IMAGE_MAX_SIZE) {
    return {
      message: "正文图片大小不能超过 10MB。",
      status: 413,
    } satisfies InlineImageValidationError;
  }

  if (!getInlineImageExtension(file)) {
    return {
      message: "暂不支持这张正文图片的文件格式。",
      status: 400,
    } satisfies InlineImageValidationError;
  }

  return null;
}

export class InlineImageStorageError extends Error {
  readonly cause: unknown;
  readonly fileSize: number;
  readonly fileType: string;
  readonly targetPath: string;

  constructor(input: {
    cause: unknown;
    fileSize: number;
    fileType: string;
    targetPath: string;
  }) {
    super("Failed to persist inline image file.");
    this.name = "InlineImageStorageError";
    this.cause = input.cause;
    this.fileSize = input.fileSize;
    this.fileType = input.fileType;
    this.targetPath = input.targetPath;
  }
}

export function isInlineImagePersistenceError(error: unknown) {
  const candidate =
    error instanceof InlineImageStorageError ? error.cause : error;

  if (!(candidate instanceof Error)) {
    return false;
  }

  const nodeError = candidate as NodeJS.ErrnoException;

  return Boolean(
    nodeError.code &&
      ["EACCES", "EBUSY", "EEXIST", "ENOENT", "ENOSPC", "EPERM", "EROFS"].includes(
        nodeError.code,
      ),
  );
}

export async function persistInlineImageFile(file: File) {
  const extension = getInlineImageExtension(file);
  const storageName = `${Date.now()}-${randomUUID()}${extension}`;
  const targetPath = join(INLINE_IMAGE_UPLOAD_DIR, storageName);

  try {
    await mkdir(INLINE_IMAGE_UPLOAD_DIR, { recursive: true });
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(targetPath, fileBuffer);
  } catch (error) {
    throw new InlineImageStorageError({
      cause: error,
      fileSize: file.size,
      fileType: file.type,
      targetPath,
    });
  }

  return {
    url: `${INLINE_IMAGE_PUBLIC_PREFIX}/${storageName}`,
  };
}
