import { NextRequest } from "next/server";
import { authError, authSuccess } from "@/lib/auth/api-response";
import { parseJsonBody } from "@/lib/auth/route";
import { verifyForgotPasswordCode } from "@/lib/auth/verification-code";

type ForgotPasswordVerifyCodeBody = {
  code?: string;
  email?: string;
};

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<ForgotPasswordVerifyCodeBody>(request);

  if (!body) {
    return authError(400, {
      code: "INVALID_REQUEST",
      message: "请求格式不正确。",
    });
  }

  const result = await verifyForgotPasswordCode({
    code: body.code ?? "",
    email: body.email ?? "",
  });

  if (!result.ok) {
    return authError(400, result);
  }

  return authSuccess({
    actionToken: result.actionToken,
    actionTokenExpiresAt: result.actionTokenExpiresAt.toISOString(),
    message: "验证码验证成功，请设置新密码。",
  });
}
