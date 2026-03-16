import { NextRequest } from "next/server";
import { authError, authSuccess } from "@/lib/auth/api-response";
import { createSession } from "@/lib/auth/session";
import { parseJsonBody } from "@/lib/auth/route";
import { loginWithEmailPassword } from "@/lib/auth/verification-code";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<LoginBody>(request);

  if (!body) {
    return authError(400, {
      code: "INVALID_REQUEST",
      message: "请求格式不正确。",
    });
  }

  const result = await loginWithEmailPassword({
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!result.ok) {
    return authError(400, result);
  }

  await createSession(result.userId);

  return authSuccess({
    message: "登录成功，正在进入社区。",
  });
}
