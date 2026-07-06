/**
 * Ensure a redirect target is a safe, local path (prevents open-redirects from
 * an attacker-controlled `?redirectTo=` value).
 */
export function safeRedirect(
  to: string | null | undefined,
  fallback = "/",
): string {
  if (!to || typeof to !== "string") return fallback;
  if (!to.startsWith("/") || to.startsWith("//") || to.startsWith("/\\")) {
    return fallback;
  }
  return to;
}
