import type { TargetType } from "~/generated/prisma/enums";
import { parseArgsSchema, resolveArgs } from "../args";
import { cacheGet, cacheKeys, cacheSet } from "../cache.server";
import { prisma } from "../db.server";
import { GitError, loadInstanceData } from "../git/index.server";
import {
  CacheControl,
  enforceRenderRateLimit,
  svgResponse,
} from "./http.server";
import {
  errorImage,
  reconnectImage,
  renderWidgetOutcome,
  tombstoneImage,
} from "./index.server";

const INSTANCE_TTL = 60;
const TRANSIENT_TTL = 120;

export async function renderInstance(
  request: Request,
  instanceId: string,
  expected: TargetType,
): Promise<Response> {
  const limited = await enforceRenderRateLimit(request);
  if (limited) return limited;

  const instance = await prisma.widgetInstance.findUnique({
    where: { id: instanceId },
    select: {
      id: true,
      ownerId: true,
      targetType: true,
      targetLogin: true,
      targetRepo: true,
      config: true,
      widget: { select: { source: true, argsSchema: true } },
    },
  });

  if (!instance || instance.targetType !== expected) {
    return svgResponse(await tombstoneImage(), {
      cacheControl: CacheControl.tombstone,
      gitaStatus: "tombstone",
      request,
    });
  }

  const cacheKey = cacheKeys.renderInstance(instance.id);
  const cached = await cacheGet(cacheKey);
  if (cached !== null) {
    return svgResponse(cached, {
      cacheControl: CacheControl.instanceOk,
      gitaStatus: "ok",
      cacheHit: true,
      request,
    });
  }

  let data: Record<string, unknown>;
  try {
    const result = await loadInstanceData(instance);
    if (
      result.status === "no_credential" ||
      result.status === "invalid_credential"
    ) {
      return svgResponse(await reconnectImage(), {
        cacheControl: CacheControl.transient,
        gitaStatus: "reconnect",
        request,
      });
    }
    if (result.status === "target_missing") {
      return svgResponse(
        await errorImage(
          `Target not found: ${instance.targetLogin}${instance.targetRepo ? `/${instance.targetRepo}` : ""}`,
        ),
        {
          cacheControl: CacheControl.transient,
          gitaStatus: "error",
          request,
        },
      );
    }
    data = result.data;
  } catch (error) {
    const detail =
      error instanceof GitError && error.failure === "rate_limited"
        ? "The provider rate limit was hit - try again shortly."
        : "Could not load git data for this widget.";
    return svgResponse(await errorImage(detail), {
      cacheControl: CacheControl.transient,
      gitaStatus: "error",
      request,
    });
  }

  try {
    const schema = parseArgsSchema(instance.widget.argsSchema);
    const config = (instance.config ?? {}) as Record<string, unknown>;
    const resolved = resolveArgs(schema, config);

    const args = resolved.ok ? resolved.values : {};
    const outcome = await renderWidgetOutcome({
      source: instance.widget.source,
      args: { ...args, data },
    });

    await cacheSet(
      cacheKey,
      outcome.svg,
      outcome.ok ? INSTANCE_TTL : TRANSIENT_TTL,
      cacheKeys.widgetIndex(instance.id),
    );

    return svgResponse(outcome.svg, {
      cacheControl: outcome.ok
        ? CacheControl.instanceOk
        : CacheControl.transient,
      gitaStatus: outcome.ok ? "ok" : "error",
      request,
    });
  } catch {
    return svgResponse(await errorImage("The widget could not be rendered."), {
      cacheControl: CacheControl.transient,
      gitaStatus: "error",
      request,
    });
  }
}
