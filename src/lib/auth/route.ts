import type { NextRequest } from "next/server";

export async function parseJsonBody<T>(request: NextRequest) {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
