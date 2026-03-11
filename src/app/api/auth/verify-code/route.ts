import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { verifyEmailLoginCode } from "@/lib/auth/verification-code";

export async function POST(request: NextRequest) {
  let body: { code?: string; email?: string } | null = null;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "请求格式不正确。",
        ok: false,
      },
      { status: 400 },
    );
  }

  const result = await verifyEmailLoginCode({
    code: body?.code ?? "",
    email: body?.email ?? "",
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  await createSession(result.userId);

  return NextResponse.json({
    isNewUser: result.isNewUser,
    message: "登录成功，正在进入社区。",
    ok: true,
  });
}
