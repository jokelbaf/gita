import { defaultArgs, parseArgsSchema, resolveArgs } from "~/services/args";
import { cacheGet, cacheKeys, cacheSet } from "~/services/cache.server";
import { sampleData } from "~/services/git/sample";
import {
  errorImage,
  renderWidgetOutcome,
  tombstoneImage,
} from "~/services/render/index.server";
import {
  CacheControl,
  enforceRenderRateLimit,
  paramsHash,
  svgResponse,
} from "~/services/render/http.server";
import { prisma } from "~/services/db.server";
import type { Route } from "./+types/widget-public";

const GENERIC_TTL = 86_400;
const TRANSIENT_TTL = 120;

function numeric(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const limited = await enforceRenderRateLimit(request);
  if (limited) return limited;

  const key = params.widgetId;
  const widget = await prisma.widget.findFirst({
    where: { OR: [{ id: key }, { slug: key }] },
    select: { id: true, type: true, source: true, argsSchema: true },
  });
  if (!widget) {
    return svgResponse(await tombstoneImage(), {
      cacheControl: CacheControl.tombstone,
      gitaStatus: "tombstone",
    });
  }

  const url = new URL(request.url);
  const width = numeric(url.searchParams.get("w") ?? undefined);
  const height = numeric(url.searchParams.get("h") ?? undefined);

  if (widget.type === "USER" || widget.type === "REPO") {
    return renderSample(
      widget.id,
      widget.type,
      widget.source,
      widget.argsSchema,
      width,
      height,
    );
  }

  try {
    const query: Record<string, string> = {};
    for (const [k, v] of url.searchParams) query[k] = v;

    const schema = parseArgsSchema(widget.argsSchema);
    const resolved = resolveArgs(schema, query);
    if (!resolved.ok) {
      const first = resolved.issues[0];
      const svg = await errorImage(
        first ? `${first.name}: ${first.message}` : "Invalid parameters.",
      );
      return svgResponse(svg, {
        cacheControl: CacheControl.transient,
        gitaStatus: "invalid-params",
      });
    }

    const cacheKey = cacheKeys.renderGeneric(
      widget.id,
      paramsHash({ ...resolved.values, __w: width ?? "", __h: height ?? "" }),
    );
    const cached = await cacheGet(cacheKey);
    if (cached !== null) {
      return svgResponse(cached, {
        cacheControl: CacheControl.genericOk,
        gitaStatus: "ok",
        cacheHit: true,
      });
    }

    const outcome = await renderWidgetOutcome({
      source: widget.source,
      args: resolved.values,
      width,
      height,
    });
    await cacheSet(
      cacheKey,
      outcome.svg,
      outcome.ok ? GENERIC_TTL : TRANSIENT_TTL,
      cacheKeys.widgetIndex(widget.id),
    );
    return svgResponse(outcome.svg, {
      cacheControl: outcome.ok
        ? CacheControl.genericOk
        : CacheControl.transient,
      gitaStatus: outcome.ok ? "ok" : "error",
    });
  } catch {
    return svgResponse(await errorImage("The widget could not be rendered."), {
      cacheControl: CacheControl.transient,
      gitaStatus: "error",
    });
  }
}

async function renderSample(
  widgetId: string,
  type: "USER" | "REPO",
  source: string,
  argsSchema: unknown,
  width: number | undefined,
  height: number | undefined,
): Promise<Response> {
  try {
    const schema = parseArgsSchema(argsSchema);
    const args = { ...defaultArgs(schema), data: sampleData(type) };

    const cacheKey = cacheKeys.renderGeneric(
      widgetId,
      paramsHash({ __sample: type, __w: width ?? "", __h: height ?? "" }),
    );
    const cached = await cacheGet(cacheKey);
    if (cached !== null) {
      return svgResponse(cached, {
        cacheControl: CacheControl.genericOk,
        gitaStatus: "ok",
        cacheHit: true,
      });
    }

    const outcome = await renderWidgetOutcome({ source, args, width, height });
    await cacheSet(
      cacheKey,
      outcome.svg,
      outcome.ok ? GENERIC_TTL : TRANSIENT_TTL,
      cacheKeys.widgetIndex(widgetId),
    );
    return svgResponse(outcome.svg, {
      cacheControl: outcome.ok
        ? CacheControl.genericOk
        : CacheControl.transient,
      gitaStatus: outcome.ok ? "ok" : "error",
    });
  } catch {
    return svgResponse(await errorImage("The widget could not be previewed."), {
      cacheControl: CacheControl.transient,
      gitaStatus: "error",
    });
  }
}
