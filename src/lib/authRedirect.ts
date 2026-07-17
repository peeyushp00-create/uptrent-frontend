const DEFAULT_POST_LOGIN_PATH = "/home";

export function getPostLoginPath(state: unknown): string {
  if (!state || typeof state !== "object" || !("from" in state)) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  const from = (state as { from?: unknown }).from;

  if (
    typeof from !== "string" ||
    !from.startsWith("/") ||
    from.startsWith("//") ||
    from.startsWith("/login")
  ) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return from;
}
