import { NextRequest } from "next/server";
import { authError, authSuccess } from "@/lib/auth/api-response";
import { validatePasswordStrength } from "@/lib/auth/password";
import { parseJsonBody } from "@/lib/auth/route";
import { createSession } from "@/lib/auth/session";
import { resetPassword } from "@/lib/auth/verification-code";

type ResetPasswordBody = {
  email?: string;
  password?: string;
  token?: string;
};

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<ResetPasswordBody>(request);

  if (!body) {
    return authError(400, {
      code: "INVALID_REQUEST",
      message: "请求格式不正确。",
    });
  }

  const passwordValidation = validatePasswordStrength(body.password ?? "");

  if (!passwordValidation.ok) {
    return authError(400, {
      code: "WEAK_PASSWORD",
      message: passwordValidation.message,
    });
  }

  const result = await resetPassword({
    email: body.email ?? "",
    password: body.password ?? "",
    token: body.token ?? "",
  });

  if (!result.ok) {
    return authError(400, result);
  }

  await createSession(result.userId);

  return authSuccess({
    message: "密码重置成功，正在进入社区。",
  });
}
