export const AUTH_SESSION_COOKIE_NAME = "openclaw_session";
export const AUTH_SESSION_TTL_DAYS = 30;
export const AUTH_CODE_LENGTH = 6;
export const AUTH_CODE_TTL_MINUTES = 5;
export const AUTH_VERIFIED_TOKEN_TTL_MINUTES = 15;
export const AUTH_CODE_COOLDOWN_SECONDS = 60;
export const AUTH_CODE_HOURLY_LIMIT = 5;
export const AUTH_CODE_IP_WINDOW_MINUTES = 15;
export const AUTH_CODE_IP_LIMIT = 12;
export const AUTH_CODE_MAX_ATTEMPTS = 5;
export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 72;

export type EmailProvider = "resend" | "smtp";

export function getAuthSecret() {
  const secret = process.env.SESSION_SECRET ?? process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET or SESSION_SECRET.");
  }

  return secret;
}

export function getAppUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "resend")
    .trim()
    .toLowerCase();

  if (provider === "resend" || provider === "smtp") {
    return provider;
  }

  throw new Error("Unsupported EMAIL_PROVIDER. Use 'resend' or 'smtp'.");
}

export function getEmailFrom() {
  const from = process.env.EMAIL_FROM ?? process.env.MAIL_FROM;

  if (!from) {
    throw new Error("Missing EMAIL_FROM.");
  }

  return from;
}

export function isEmailDevFallbackEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.EMAIL_ALLOW_DEV_FALLBACK === "true"
  );
}
