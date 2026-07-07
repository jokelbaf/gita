import type { SessionUser } from "../context";
import type { TargetType, WidgetType } from "~/generated/prisma/enums";
import { ValidationError } from "../errors";
import {
  widgetMarkdown,
  widgetPreviewUrl,
  type SortKey,
  type TypeFilter,
  type Visibility,
  type WidgetCard,
} from "~/lib/widget";
import {
  createInstance,
  deleteInstance,
  listUserInstances,
  type InstanceListItem,
} from "../instances.server";
import {
  createWidget,
  deleteWidget,
  forkWidget,
  getEditableWidget,
  setWidgetVisibility,
  updateWidget,
  validateWidgetInput,
  VISIBILITIES,
  WIDGET_TYPES,
} from "../widget-editor.server";
import {
  getWidgetDetail,
  listUserWidgets,
  listWidgets,
  type WidgetDetail,
} from "../widgets.server";

function embed(url: string, name: string) {
  return { url, markdown: widgetMarkdown(name, url) };
}

function serializeCard(card: WidgetCard, origin: string) {
  const url = origin + widgetPreviewUrl(card.slug);
  return {
    slug: card.slug,
    name: card.name,
    description: card.description,
    type: card.type,
    visibility: card.visibility,
    likesCount: card.likesCount,
    author: card.author.username,
    isFork: card.isFork,
    forkedFromSlug: card.forkedFromSlug,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    previewUrl: url,
  };
}

function serializeDetail(detail: WidgetDetail, origin: string) {
  const previewUrl = origin + widgetPreviewUrl(detail.slug);
  return {
    ...serializeCard(detail, origin),
    source: detail.source,
    argsSchema: detail.argsSchema,
    forkCount: detail.forkCount,
    embed: detail.type === "GENERIC" ? embed(previewUrl, detail.name) : null,
  };
}

function instancePath(type: TargetType): string {
  return type === "REPO" ? "repo" : "user";
}

function serializeInstance(row: InstanceListItem, origin: string) {
  const url = `${origin}/api/widget/${instancePath(row.targetType)}/${row.id}`;
  return {
    id: row.id,
    widgetSlug: row.widgetSlug,
    widgetName: row.widgetName,
    widgetType: row.widgetType,
    target: row.targetLabel,
    createdAt: row.createdAt,
    embed: embed(url, row.widgetName),
  };
}

export interface ListWidgetsQuery {
  search?: string;
  type?: TypeFilter;
  forksOnly?: boolean;
  sort?: SortKey;
  cursor?: string | null;
  limit?: number;
  mine?: boolean;
}

export async function listWidgetsOp(
  user: SessionUser,
  query: ListWidgetsQuery,
  origin: string,
) {
  if (query.mine) {
    const widgets = await listUserWidgets(user.id);
    return {
      widgets: widgets.map((w) => serializeCard(w, origin)),
      nextCursor: null,
    };
  }
  const result = await listWidgets({
    viewerId: user.id,
    search: query.search,
    type: query.type,
    forksOnly: query.forksOnly,
    sort: query.sort,
    cursor: query.cursor,
    limit: query.limit,
  });
  return {
    widgets: result.widgets.map((w) => serializeCard(w, origin)),
    nextCursor: result.nextCursor,
  };
}

async function requireDetail(user: SessionUser, slug: string, origin: string) {
  const detail = await getWidgetDetail(slug, user.id);
  if (!detail)
    throw new ValidationError("That widget doesn’t exist or is private.");
  return serializeDetail(detail, origin);
}

export function getWidgetOp(user: SessionUser, slug: string, origin: string) {
  return requireDetail(user, slug, origin);
}

export interface WidgetBody {
  name?: unknown;
  description?: unknown;
  type?: unknown;
  visibility?: unknown;
  source?: unknown;
  argsSchema?: unknown;
}

function assertValid(result: ReturnType<typeof validateWidgetInput>) {
  if (!result.ok) {
    throw new ValidationError(
      "The widget definition is invalid.",
      result.fieldErrors,
    );
  }
  return result.value;
}

export async function createWidgetOp(
  user: SessionUser,
  body: WidgetBody,
  origin: string,
) {
  const value = assertValid(
    validateWidgetInput({
      name: body.name,
      description: body.description ?? "",
      type: body.type ?? "GENERIC",
      visibility: body.visibility ?? "PRIVATE",
      source: body.source,
      argsSchema: body.argsSchema ?? [],
    }),
  );
  const slug = await createWidget(user.id, value);
  return requireDetail(user, slug, origin);
}

export async function updateWidgetOp(
  user: SessionUser,
  slug: string,
  body: WidgetBody,
  origin: string,
) {
  const current = await getEditableWidget(slug, user.id);
  const value = assertValid(
    validateWidgetInput({
      name: body.name ?? current.name,
      description: body.description ?? current.description,
      type: body.type ?? current.type,
      visibility: body.visibility ?? current.visibility,
      source: body.source ?? current.source,
      argsSchema: body.argsSchema ?? current.argsSchema,
    }),
  );
  await updateWidget(slug, user.id, value);
  return requireDetail(user, slug, origin);
}

export async function deleteWidgetOp(user: SessionUser, slug: string) {
  await deleteWidget(slug, user.id);
  return { deleted: true, slug };
}

export async function forkWidgetOp(
  user: SessionUser,
  slug: string,
  name: string | undefined,
  origin: string,
) {
  const forkSlug = await forkWidget(slug, user.id, name ?? "");
  return requireDetail(user, forkSlug, origin);
}

export async function setVisibilityOp(
  user: SessionUser,
  slug: string,
  visibility: unknown,
  origin: string,
) {
  if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
    throw new ValidationError(
      `visibility must be one of ${VISIBILITIES.join(", ")}.`,
    );
  }
  await setWidgetVisibility(slug, user.id, visibility as Visibility);
  return requireDetail(user, slug, origin);
}

export async function listInstancesOp(user: SessionUser, origin: string) {
  const rows = await listUserInstances(user.id);
  return { instances: rows.map((row) => serializeInstance(row, origin)) };
}

export interface InstanceBody {
  slug?: unknown;
  targetLogin?: unknown;
  targetRepo?: unknown;
  config?: unknown;
}

export async function createInstanceOp(
  user: SessionUser,
  body: InstanceBody,
  origin: string,
) {
  const slug = typeof body.slug === "string" ? body.slug : "";
  const targetLogin =
    typeof body.targetLogin === "string" ? body.targetLogin : "";
  if (!slug) throw new ValidationError("slug is required.");
  if (!targetLogin) throw new ValidationError("targetLogin is required.");
  const config =
    body.config && typeof body.config === "object"
      ? (body.config as Record<string, unknown>)
      : {};
  const created = await createInstance(user.id, {
    slug,
    targetLogin,
    targetRepo: typeof body.targetRepo === "string" ? body.targetRepo : null,
    config,
  });
  const url = `${origin}/api/widget/${instancePath(created.type)}/${created.id}`;
  return {
    id: created.id,
    type: created.type,
    target: created.target,
    embed: embed(url, created.target),
  };
}

export async function deleteInstanceOp(user: SessionUser, id: string) {
  await deleteInstance(user.id, id);
  return { deleted: true, id };
}

export const WIDGET_TYPE_VALUES: readonly WidgetType[] = WIDGET_TYPES;
export const VISIBILITY_VALUES: readonly Visibility[] = VISIBILITIES;
