import { put } from "@vercel/blob";
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
export const INLINE_IMAGE_BLOB_PREFIX = "post-inline-images";

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

type InlineImageStorageBackend = "blob" | "local";

function getInlineImageExtension(file: File) {
  return INLINE_IMAGE_EXTENSION_MAP[file.type] ?? "";
}

function getInlineImageStorageName(file: File) {
  return `${Date.now()}-${randomUUID()}${getInlineImageExtension(file)}`;
}

function getInlineImageBlobPathname(file: File) {
  return `${INLINE_IMAGE_BLOB_PREFIX}/${getInlineImageStorageName(file)}`;
}

function shouldUseBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getInlineImageStorageBackend(): InlineImageStorageBackend {
  return shouldUseBlobStorage() ? "blob" : "local";
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

export class InlineImageConfigurationError extends Error {
  readonly missingEnvVar: string;
  readonly storageBackend: "blob";

  constructor(missingEnvVar: string) {
    super(
      `Inline image upload requires ${missingEnvVar} to be set in production.`,
    );
    this.name = "InlineImageConfigurationError";
    this.missingEnvVar = missingEnvVar;
    this.storageBackend = "blob";
  }
}

export class InlineImageStorageError extends Error {
  readonly cause: unknown;
  readonly fileSize: number;
  readonly fileType: string;
  readonly storageBackend: InlineImageStorageBackend;
  readonly targetPath: string;

  constructor(input: {
    cause: unknown;
    fileSize: number;
    fileType: string;
    storageBackend: InlineImageStorageBackend;
    targetPath: string;
  }) {
    super("Failed to persist inline image file.");
    this.name = "InlineImageStorageError";
    this.cause = input.cause;
    this.fileSize = input.fileSize;
    this.fileType = input.fileType;
    this.storageBackend = input.storageBackend;
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

export function isInlineImageConfigurationError(error: unknown) {
  return error instanceof InlineImageConfigurationError;
}

export async function persistInlineImageFile(file: File) {
  if (shouldUseBlobStorage()) {
    const targetPath = getInlineImageBlobPathname(file);

    try {
      const uploadedBlob = await put(targetPath, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type,
      });

      return {
        url: uploadedBlob.url,
      };
    } catch (error) {
      throw new InlineImageStorageError({
        cause: error,
        fileSize: file.size,
        fileType: file.type,
        storageBackend: "blob",
        targetPath,
      });
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new InlineImageConfigurationError("BLOB_READ_WRITE_TOKEN");
  }

  const storageName = getInlineImageStorageName(file);
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
      storageBackend: "local",
      targetPath,
    });
  }

  return {
    url: `${INLINE_IMAGE_PUBLIC_PREFIX}/${storageName}`,
  };
}
