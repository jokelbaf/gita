import type { SessionUser } from "../context";
import { authenticateApiKey } from "../api-keys.server";
import { env } from "../env.server";
import { AppError, UnauthorizedError, ValidationError } from "../errors";

export function apiOrigin(): string {
  return env.BETTER_AUTH_URL.replace(/\/+$/, "");
}

export interface ApiErrorBody {
  error: { kind: string; message: string; details?: unknown };
}

export function apiJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function apiError(error: unknown): Response {
  if (error instanceof Response) return error;
  if (error instanceof AppError) {
    return apiJson(
      {
        error: {
          kind: error.kind,
          message: error.message,
          details: error.details,
        },
      },
      error.status,
    );
  }
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return apiJson({ error: { kind: "Internal", message } }, 500);
}

export async function requireApiUser(request: Request): Promise<SessionUser> {
  const user = await authenticateApiKey(request);
  if (!user) {
    throw apiJson(
      {
        error: {
          kind: new UnauthorizedError().kind,
          message: "A valid API key is required. Create one in Settings.",
        },
      },
      401,
    );
  }
  return user;
}

export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  throw new ValidationError("Request body must be a JSON object.");
}

export function methodNotAllowed(allow: string): Response {
  return apiJson(
    {
      error: { kind: "MethodNotAllowed", message: `Allowed methods: ${allow}` },
    },
    405,
  );
}
