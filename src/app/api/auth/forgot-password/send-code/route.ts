import { NextRequest } from "next/server";
import { authError, authSuccess } from "@/lib/auth/api-response";
import { isValidEmailAddress } from "@/lib/auth/email-address";
import { getRequestIp } from "@/lib/auth/request";
import { parseJsonBody } from "@/lib/auth/route";
import { issueForgotPasswordCode } from "@/lib/auth/verification-code";

type ForgotPasswordSendCodeBody = {
  email?: string;
};

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<ForgotPasswordSendCodeBody>(request);

  if (!body) {
    return authError(400, {
      code: "INVALID_REQUEST",
      message: "请求格式不正确。",
    });
  }

  if (!isValidEmailAddress(body.email ?? "")) {
    return authError(400, {
      code: "INVALID_EMAIL",
      message: "请输入有效的邮箱地址。",
    });
  }

  const result = await issueForgotPasswordCode({
    email: body.email ?? "",
    sendIp: getRequestIp(request),
  });

  if (!result.ok) {
    return authError(result.retryAfterSeconds ? 429 : 400, result);
  }

  return authSuccess({
    deliveryMode: result.deliveryMode,
    message: "如果该邮箱可用，我们已发送重置验证码。",
    retryAfterSeconds: result.retryAfterSeconds,
  });
}
