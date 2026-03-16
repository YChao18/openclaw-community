import { NextResponse } from "next/server";

function methodNotAvailable() {
  return NextResponse.json(
    {
      message: "该认证入口已停用，请使用邮箱密码登录或正式注册流程。",
      ok: false,
    },
    { status: 404 },
  );
}

export const GET = methodNotAvailable;
export const POST = methodNotAvailable;
