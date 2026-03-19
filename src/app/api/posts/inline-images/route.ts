import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  persistInlineImageFile,
  validateInlineImageFile,
} from "@/lib/post-inline-images";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录后再上传正文图片。" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const file = fileEntry instanceof File ? fileEntry : null;
    const errorMessage = validateInlineImageFile(file);

    if (errorMessage || !file) {
      return NextResponse.json(
        { message: errorMessage ?? "请选择正文图片。" },
        { status: 400 },
      );
    }

    const uploadedImage = await persistInlineImageFile(file);

    return NextResponse.json(uploadedImage);
  } catch (error) {
    console.error("Failed to upload post inline image", error);
    return NextResponse.json(
      { message: "正文图片上传失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
