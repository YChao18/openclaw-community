"use client";

export type AuthApiError = {
  code: string;
  message: string;
  ok: false;
  retryAfterSeconds?: number;
};

export type AuthApiSuccess<T extends Record<string, unknown>> = {
  code: string;
  message: string;
  ok: true;
} & T;

export type AuthApiResponse<T extends Record<string, unknown>> =
  | AuthApiError
  | AuthApiSuccess<T>;

export async function postAuthJson<T extends Record<string, unknown>>(
  url: string,
  body: Record<string, unknown>,
): Promise<AuthApiResponse<T>> {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response
    .json()
    .catch(() => null)) as AuthApiResponse<T> | null;

  if (!payload) {
    return {
      code: "SERVER_UNAVAILABLE",
      message: "服务暂时不可用，请稍后再试。",
      ok: false,
    };
  }

  return payload;
}
