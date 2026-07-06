import { z } from "zod";
import {
  argsSchemaSchema,
  parseArgsSchema,
  resolveArgs,
  type ResolvedArgs,
} from "~/services/args";
import { rateLimit, cacheKeys } from "~/services/cache.server";
import { userContext } from "~/services/context";
import { RenderError } from "~/services/errors";
import { sampleData } from "~/services/git/sample";
import { renderWidgetSvg } from "~/services/render/index.server";
import { SandboxError } from "~/services/sandbox/index.server";
import type { Route } from "./+types/preview";

const PREVIEW_LIMIT = 30;
const PREVIEW_WINDOW = 60;

const PreviewInput = z.object({
  source: z.string().max(64 * 1024),
  argsSchema: z.unknown().optional(),
  args: z.record(z.string(), z.unknown()).optional(),
  type: z.enum(["GENERIC", "USER", "REPO"]).optional(),
  width: z.number().int().positive().max(1200).optional(),
  height: z.number().int().positive().max(800).optional(),
});

function fail(stage: string, message: string, extra?: object) {
  return Response.json(
    { ok: false, stage, message, ...extra },
    { status: 422 },
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = context.get(userContext);
  if (!user) {
    return Response.json(
      { ok: false, stage: "auth", message: "Sign in first." },
      { status: 401 },
    );
  }

  const limit = await rateLimit(
    cacheKeys.rate("preview", user.id),
    PREVIEW_LIMIT,
    PREVIEW_WINDOW,
  );
  if (!limit.allowed) {
    return Response.json(
      { ok: false, stage: "rate_limited", message: "Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(limit.resetSeconds) } },
    );
  }

  let body: z.infer<typeof PreviewInput>;
  try {
    body = PreviewInput.parse(await request.json());
  } catch {
    return fail("request", "Invalid preview request body.");
  }

  let args: ResolvedArgs;
  if (body.argsSchema !== undefined) {
    const parsed = argsSchemaSchema.safeParse(body.argsSchema);
    if (!parsed.success) {
      return fail("schema", "The args schema is invalid.", {
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }
    const resolved = resolveArgs(
      parseArgsSchema(body.argsSchema),
      body.args ?? {},
    );
    if (!resolved.ok) {
      return fail("args", "Some argument values are invalid.", {
        issues: resolved.issues,
      });
    }
    args = resolved.values;
  } else {
    args = (body.args ?? {}) as ResolvedArgs;
  }

  const renderArgs: Record<string, unknown> =
    body.type === "USER" || body.type === "REPO"
      ? { ...args, data: sampleData(body.type) }
      : args;

  try {
    const svg = await renderWidgetSvg({
      source: body.source,
      args: renderArgs,
      width: body.width,
      height: body.height,
    });
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof SandboxError) {
      return fail(error.failure, error.message);
    }
    if (error instanceof RenderError) {
      return fail("render", error.message);
    }
    return fail("render", "The widget could not be rendered.");
  }
}
