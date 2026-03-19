import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const INLINE_IMAGE_UPLOAD_DIR = join(
  process.cwd(),
  "public",
  "uploads",
  "post-inline-images",
);
const INLINE_IMAGE_PUBLIC_PREFIX = "/uploads/post-inline-images";

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

function getInlineImageExtension(file: File) {
  return INLINE_IMAGE_EXTENSION_MAP[file.type] ?? "";
}

export function validateInlineImageFile(file: File | null | undefined) {
  if (!file || file.size === 0) {
    return "请选择一张图片后再上传。";
  }

  if (!ALLOWED_INLINE_IMAGE_TYPES.has(file.type)) {
    return "正文图片仅支持 PNG、JPG、JPEG、WEBP 和 GIF。";
  }

  if (file.size > POST_INLINE_IMAGE_MAX_SIZE) {
    return "正文图片大小不能超过 10MB。";
  }

  if (!getInlineImageExtension(file)) {
    return "暂不支持这张图片的文件格式。";
  }

  return null;
}

export async function persistInlineImageFile(file: File) {
  await mkdir(INLINE_IMAGE_UPLOAD_DIR, { recursive: true });

  const extension = getInlineImageExtension(file);
  const storageName = `${Date.now()}-${randomUUID()}${extension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await writeFile(join(INLINE_IMAGE_UPLOAD_DIR, storageName), fileBuffer);

  return {
    url: `${INLINE_IMAGE_PUBLIC_PREFIX}/${storageName}`,
  };
}
