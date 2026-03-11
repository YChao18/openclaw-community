export function getSafeRedirectPath(input?: string | null) {
  if (!input) {
    return "/me";
  }

  if (!input.startsWith("/") || input.startsWith("//")) {
    return "/me";
  }

  return input;
}
