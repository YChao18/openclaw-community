import { NextRequest, NextResponse } from "next/server";
import { isValidEmailAddress } from "@/lib/auth/email-address";
import { issueEmailLoginCode } from "@/lib/auth/verification-code";

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  let body: { email?: string } | null = null;

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

  if (!isValidEmailAddress(body?.email ?? "")) {
    return NextResponse.json(
      {
        message: "请输入有效的邮箱地址。",
        ok: false,
      },
      { status: 400 },
    );
  }

  const result = await issueEmailLoginCode({
    email: body?.email ?? "",
    sendIp: getRequestIp(request),
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.retryAfterSeconds ? 429 : 400,
    });
  }

  return NextResponse.json({
    deliveryMode: result.deliveryMode,
    message:
      result.deliveryMode === "fallback"
        ? "当前为开发模式，验证码已输出到服务端日志，不代表真实邮件已发送。"
        : "如果该邮箱可正常接收邮件，你将收到登录验证码。",
    ok: true,
    retryAfterSeconds: result.retryAfterSeconds,
  });
}
