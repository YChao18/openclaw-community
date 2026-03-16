import { compare, hash } from "bcryptjs";
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from "@/lib/auth/config";

type PasswordValidationResult =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

const PASSWORD_STRENGTH_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

export function validatePasswordStrength(
  password: string,
): PasswordValidationResult {
  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    return {
      message: `密码至少需要 ${AUTH_PASSWORD_MIN_LENGTH} 位。`,
      ok: false,
    };
  }

  if (password.length > AUTH_PASSWORD_MAX_LENGTH) {
    return {
      message: `密码长度不能超过 ${AUTH_PASSWORD_MAX_LENGTH} 位。`,
      ok: false,
    };
  }

  if (!PASSWORD_STRENGTH_PATTERN.test(password)) {
    return {
      message: "密码需要同时包含字母和数字。",
      ok: false,
    };
  }

  return {
    ok: true,
  };
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPasswordHash(
  password: string,
  passwordHash: string,
) {
  return compare(password, passwordHash);
}
