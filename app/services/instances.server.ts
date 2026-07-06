import type { Prisma } from "~/generated/prisma/client";
import type { TargetType, WidgetType } from "~/generated/prisma/enums";
import { parseArgsSchema, resolveArgs } from "./args";
import { cacheDel, cacheKeys } from "./cache.server";
import { prisma } from "./db.server";
import { ForbiddenError, NotFoundError, ValidationError } from "./errors";

// Widget instances (SPEC §2, §5.5, §6): a configured, owned usage of a USER/REPO
// widget, bound to a git target. The Use flow creates them; the dashboard lists
// and revokes them. Instance ids are unguessable (cuid) and every mutation checks
// ownership - no IDOR (SPEC §12).

export interface CreateInstanceInput {
  slug: string;
  targetLogin: string;
  targetRepo?: string | null;
  config: Record<string, unknown>;
}

export interface CreatedInstance {
  id: string;
  type: TargetType;
  /** Human label for the bound target, e.g. "octocat" or "facebook/react". */
  target: string;
}

export async function createInstance(
  userId: string,
  input: CreateInstanceInput,
): Promise<CreatedInstance> {
  const widget = await prisma.widget.findUnique({
    where: { slug: input.slug },
    select: {
      id: true,
      type: true,
      visibility: true,
      authorId: true,
      argsSchema: true,
    },
  });

  if (
    !widget ||
    (widget.visibility === "PRIVATE" && widget.authorId !== userId)
  ) {
    throw new NotFoundError("That widget doesn’t exist.");
  }
  if (widget.type === "GENERIC") {
    throw new ValidationError(
      "Generic widgets are used via their URL, not instances.",
    );
  }

  const targetType: TargetType = widget.type === "REPO" ? "REPO" : "USER";
  const targetLogin = input.targetLogin.trim();
  if (!targetLogin) throw new ValidationError("A target is required.");
  const targetRepo =
    targetType === "REPO" ? (input.targetRepo?.trim() ?? "") : null;
  if (targetType === "REPO" && !targetRepo) {
    throw new ValidationError("A repository is required.");
  }

  let config: Record<string, unknown> = {};
  try {
    const schema = parseArgsSchema(widget.argsSchema);
    const resolved = resolveArgs(schema, input.config ?? {});
    if (resolved.ok) config = resolved.values;
  } catch {
    config = {};
  }

  const instance = await prisma.widgetInstance.create({
    data: {
      widgetId: widget.id,
      ownerId: userId,
      targetType,
      targetLogin,
      targetRepo,
      config: config as Prisma.InputJsonValue,
    },
    select: { id: true, targetType: true },
  });
  return {
    id: instance.id,
    type: instance.targetType,
    target: targetRepo ? `${targetLogin}/${targetRepo}` : targetLogin,
  };
}

export async function deleteInstance(
  userId: string,
  instanceId: string,
): Promise<void> {
  const instance = await prisma.widgetInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, ownerId: true },
  });
  if (!instance) throw new NotFoundError("That instance doesn’t exist.");
  if (instance.ownerId !== userId) {
    throw new ForbiddenError("You don’t own this instance.");
  }
  await cacheDel(cacheKeys.renderInstance(instanceId));
  await prisma.widgetInstance.delete({ where: { id: instanceId } });
}

export interface InstanceListItem {
  id: string;
  widgetSlug: string;
  widgetName: string;
  widgetType: WidgetType;
  targetType: TargetType;
  targetLogin: string;
  targetRepo: string | null;
  targetLabel: string;
  createdAt: string;
}

export async function listUserInstances(
  userId: string,
): Promise<InstanceListItem[]> {
  const rows = await prisma.widgetInstance.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetType: true,
      targetLogin: true,
      targetRepo: true,
      createdAt: true,
      widget: { select: { slug: true, name: true, type: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    widgetSlug: row.widget.slug,
    widgetName: row.widget.name,
    widgetType: row.widget.type,
    targetType: row.targetType,
    targetLogin: row.targetLogin,
    targetRepo: row.targetRepo,
    targetLabel: row.targetRepo
      ? `${row.targetLogin}/${row.targetRepo}`
      : row.targetLogin,
    createdAt: row.createdAt.toISOString(),
  }));
}
