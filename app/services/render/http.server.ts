import { createHash } from "node:crypto";
import { rateLimit, cacheKeys } from "../cache.server";
import { errorImage } from "./images.server";

// Rendered images normally return HTTP 200 so they display in a README (a 4xx
// <img> shows as broken). Conditional GETs may return 304; render conditions are
// exposed via `X-Gita-Status` and controlled via cache lifetime instead.
export const CacheControl = {
  genericOk: "public, no-cache", // store, but validate so edits appear immediately
  instanceOk: "public, max-age=60, must-revalidate", // dynamic provider data
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
  request?: Request;
}

export function svgResponse(svg: string, init: SvgResponseInit): Response {
  const status = init.status ?? 200;
  const etag = `"${createHash("sha256").update(svg).digest("base64url")}"`;
  const headers = new Headers({
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": init.cacheControl,
    ETag: etag,
    "X-Gita-Status": init.gitaStatus,
    "X-Cache": init.cacheHit ? "HIT" : "MISS",
  });

  if (
    status === 200 &&
    init.request &&
    matchesEtag(init.request.headers.get("if-none-match"), etag)
  ) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(svg, { status, headers });
}

function matchesEtag(header: string | null, etag: string): boolean {
  if (!header) return false;
  return header.split(",").some((candidate) => {
    const tag = candidate.trim();
    return tag === "*" || tag.replace(/^W\//, "") === etag;
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
