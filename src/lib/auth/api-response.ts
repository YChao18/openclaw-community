import { NextResponse } from "next/server";

type ErrorPayload = {
  code: string;
  message: string;
  retryAfterSeconds?: number;
};

type SuccessPayload = {
  code?: string;
  message: string;
} & Record<string, unknown>;

export function authError(status: number, payload: ErrorPayload) {
  return NextResponse.json(
    {
      code: payload.code,
      message: payload.message,
      ok: false,
      retryAfterSeconds: payload.retryAfterSeconds,
    },
    { status },
  );
}

export function authSuccess(payload: SuccessPayload) {
  return NextResponse.json({
    code: payload.code ?? "OK",
    ...payload,
    ok: true,
  });
}
