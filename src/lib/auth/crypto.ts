import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import {
  AUTH_CODE_LENGTH,
  AUTH_SESSION_TTL_DAYS,
  getAuthSecret,
} from "@/lib/auth/config";

export function generateVerificationCode() {
  const max = 10 ** AUTH_CODE_LENGTH;

  return randomInt(0, max).toString().padStart(AUTH_CODE_LENGTH, "0");
}

export function hashVerificationCode(email: string, code: string) {
  return createHmac("sha256", getAuthSecret())
    .update(`${email}:${code}`)
    .digest("hex");
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function generateOneTimeToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${token}:${getAuthSecret()}`)
    .digest("hex");
}

export function hashOneTimeToken(token: string) {
  return createHash("sha256")
    .update(`${token}:${getAuthSecret()}`)
    .digest("hex");
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}
