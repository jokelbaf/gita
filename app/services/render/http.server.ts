import { createHash } from "node:crypto";
import { rateLimit, cacheKeys } from "../cache.server";
import { errorImage } from "./images.server";

// Every rendered image returns HTTP 200 so it actually displays in a README (a
// 4xx <img> shows as broken in most clients - the whole point of the error /
// tombstone / reconnect images is to degrade *visibly*). The condition is exposed
// via the `X-Gita-Status` header and controlled via cache lifetime instead.
export const CacheControl = {
  genericOk: "public, max-age=86400, s-maxage=86400", // deterministic from params
  instanceOk: "public, max-age=3600, s-maxage=3600", // data-driven, refresh hourly
  transient: "public, max-age=120, s-maxage=120", // errors / reconnect - self-heal
  tombstone: "public, max-age=300, s-maxage=300",
} as const;

export type GitaStatus =
  | "ok"
  | "invalid-params"
  | "error"
  | "tombstone"
  | "reconnect"
  | "rate-limited";

interface SvgResponseInit {
  status?: number;
  cacheControl: string;
  gitaStatus: GitaStatus;
  cacheHit?: boolean;
}

export function svgResponse(svg: string, init: SvgResponseInit): Response {
  return new Response(svg, {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": init.cacheControl,
      "X-Gita-Status": init.gitaStatus,
      "X-Cache": init.cacheHit ? "HIT" : "MISS",
    },
  });
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const RENDER_LIMIT = 120; // requests
const RENDER_WINDOW = 60; // seconds

/**
 * Enforce the per-IP render rate limit. Returns a 429 image Response when the
 * budget is exhausted, otherwise null (proceed).
 */
export async function enforceRenderRateLimit(
  request: Request,
): Promise<Response | null> {
  const result = await rateLimit(
    cacheKeys.rate("render", clientIp(request)),
    RENDER_LIMIT,
    RENDER_WINDOW,
  );
  if (result.allowed) return null;
  const svg = await errorImage("Too many requests - please slow down.");
  const response = svgResponse(svg, {
    status: 429,
    cacheControl: "no-store",
    gitaStatus: "rate-limited",
  });
  response.headers.set("Retry-After", String(result.resetSeconds));
  return response;
}

/** Stable hash of a validated params object, for the generic render cache key. */
export function paramsHash(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${String(params[k])}`)
    .join("&");
  return createHash("sha1").update(sorted).digest("hex").slice(0, 16);
}
