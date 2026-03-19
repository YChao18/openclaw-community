import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");
const ALLOWED_UPLOAD_DIRECTORIES = new Set([
  "post-attachments",
  "post-inline-images",
]);

const CONTENT_TYPE_MAP: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getContentType(pathname: string) {
  return CONTENT_TYPE_MAP[extname(pathname).toLowerCase()] ?? "application/octet-stream";
}

function getUploadTargetPath(pathSegments: string[]) {
  if (pathSegments.length < 2) {
    return null;
  }

  const [directory, ...restSegments] = pathSegments;

  if (!ALLOWED_UPLOAD_DIRECTORIES.has(directory)) {
    return null;
  }

  if (
    restSegments.length === 0 ||
    pathSegments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\"),
    )
  ) {
    return null;
  }

  const targetPath = normalize(join(UPLOADS_DIR, directory, ...restSegments));
  const uploadsRoot = `${normalize(UPLOADS_DIR)}${sep}`;

  return targetPath.startsWith(uploadsRoot) ? targetPath : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = getUploadTargetPath(path);

  if (!targetPath) {
    return NextResponse.json({ message: "上传文件不存在。" }, { status: 404 });
  }

  try {
    await access(targetPath);
  } catch {
    return NextResponse.json({ message: "上传文件不存在。" }, { status: 404 });
  }

  const stream = createReadStream(targetPath);

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": getContentType(targetPath),
    },
  });
}
