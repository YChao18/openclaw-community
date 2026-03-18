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

export const POST_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;
export const POST_ATTACHMENT_MAX_TOTAL_SIZE = 50 * 1024 * 1024;
export const POST_ATTACHMENT_MAX_TOTAL_SIZE_LABEL = "50MB";

type AttachmentCandidate = {
  name: string;
  size: number;
  type: string;
};

export function getAttachmentExtension(file: AttachmentCandidate) {
  const normalizedName = file.name.trim().toLowerCase();
  const extensionIndex = normalizedName.lastIndexOf(".");
  const originalExtension =
    extensionIndex >= 0 ? normalizedName.slice(extensionIndex) : "";

  if (ALLOWED_ATTACHMENT_EXTENSIONS.has(originalExtension)) {
    return originalExtension;
  }

  return MIME_EXTENSION_MAP[file.type] ?? "";
}

export function validateAttachmentFiles(files: readonly AttachmentCandidate[]) {
  let totalSize = 0;

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

    totalSize += file.size;
  }

  if (totalSize > POST_ATTACHMENT_MAX_TOTAL_SIZE) {
    return `附件总大小不能超过 ${POST_ATTACHMENT_MAX_TOTAL_SIZE_LABEL}。`;
  }

  return null;
}
