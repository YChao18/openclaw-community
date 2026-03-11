import { NextResponse } from "next/server";

function methodNotAvailable() {
  return NextResponse.json(
    {
      message: "该认证入口已停用，请使用邮箱验证码登录。",
      ok: false,
    },
    { status: 404 },
  );
}

export const GET = methodNotAvailable;
export const POST = methodNotAvailable;
