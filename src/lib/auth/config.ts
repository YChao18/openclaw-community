export const AUTH_SESSION_COOKIE_NAME = "openclaw_session";
export const AUTH_SESSION_TTL_DAYS = 30;
export const AUTH_CODE_LENGTH = 6;
export const AUTH_CODE_TTL_MINUTES = 5;
export const AUTH_CODE_COOLDOWN_SECONDS = 60;
export const AUTH_CODE_HOURLY_LIMIT = 5;
export const AUTH_CODE_MAX_ATTEMPTS = 5;

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
