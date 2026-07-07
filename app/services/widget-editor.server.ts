import { z } from "zod";
import type { Prisma } from "~/generated/prisma/client";
import type { Visibility, WidgetType } from "~/generated/prisma/enums";
import { argsSchemaSchema, parseArgsSchema, type WidgetArg } from "./args";
import { cacheDel, cacheKeys, invalidateByIndex } from "./cache.server";
import { prisma } from "./db.server";
import { ForbiddenError, NotFoundError } from "./errors";

export const WIDGET_TYPES = ["GENERIC", "USER", "REPO"] as const;
export const VISIBILITIES = ["PUBLIC", "PRIVATE"] as const;

const metadataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your widget a name.")
    .max(60, "Keep the name under 60 characters."),
  description: z
    .string()
    .trim()
    .max(280, "Keep the description under 280 characters.")
    .default(""),
  type: z.enum(WIDGET_TYPES),
  visibility: z.enum(VISIBILITIES),
  source: z
    .string()
    .min(1, "Widget source can’t be empty.")
    .max(64 * 1024, "Widget source is too large."),
});

export interface WidgetInput {
  name: string;
  description: string;
  type: WidgetType;
  visibility: Visibility;
  source: string;
  argsSchema: WidgetArg[];
}

export type FieldErrors = Partial<Record<string, string>>;

export type ParseResult =
  { ok: true; value: WidgetInput } | { ok: false; fieldErrors: FieldErrors };

export interface RawWidgetInput {
  name: unknown;
  description: unknown;
  type: unknown;
  visibility: unknown;
  source: unknown;
  argsSchema: unknown;
}

export function validateWidgetInput(raw: RawWidgetInput): ParseResult {
  const fieldErrors: FieldErrors = {};

  const meta = metadataSchema.safeParse({
    name: raw.name,
    description: raw.description ?? "",
    type: raw.type,
    visibility: raw.visibility,
    source: raw.source,
  });
  if (!meta.success) {
    for (const issue of meta.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
  }

  let argsSchema: WidgetArg[] = [];
  const parsed = argsSchemaSchema.safeParse(raw.argsSchema ?? []);
  if (!parsed.success) {
    fieldErrors.argsSchema ??=
      "One or more arguments are invalid - check names and options.";
  } else {
    argsSchema = parsed.data as WidgetArg[];
  }

  if (Object.keys(fieldErrors).length > 0 || !meta.success) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    value: {
      name: meta.data.name,
      description: meta.data.description,
      type: meta.data.type,
      visibility: meta.data.visibility,
      source: meta.data.source,
      argsSchema,
    },
  };
}

export function parseWidgetInput(form: FormData): ParseResult {
  const rawSchema = form.get("argsSchema");
  let argsSchema: unknown;
  try {
    argsSchema = JSON.parse(typeof rawSchema === "string" ? rawSchema : "[]");
  } catch {
    return {
      ok: false,
      fieldErrors: { argsSchema: "The arguments schema is malformed." },
    };
  }
  return validateWidgetInput({
    name: form.get("name"),
    description: form.get("description") ?? "",
    type: form.get("type"),
    visibility: form.get("visibility"),
    source: form.get("source"),
    argsSchema,
  });
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "widget";
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;

  while (
    await prisma.widget.findUnique({ where: { slug }, select: { id: true } })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/**
 * Purge every render cache key for a widget and all of its instances, so an edit
 * or delete is reflected in served images immediately.
 */
export async function invalidateWidgetRenderCache(
  widgetId: string,
): Promise<void> {
  await invalidateByIndex(cacheKeys.widgetIndex(widgetId));
  const instances = await prisma.widgetInstance.findMany({
    where: { widgetId },
    select: { id: true },
  });
  await Promise.all(
    instances.flatMap((instance) => [
      cacheDel(cacheKeys.renderInstance(instance.id)),
      invalidateByIndex(cacheKeys.widgetIndex(instance.id)),
    ]),
  );
}

export interface EditableWidget {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: WidgetType;
  visibility: Visibility;
  source: string;
  argsSchema: WidgetArg[];
}

function safeArgsSchema(json: Prisma.JsonValue): WidgetArg[] {
  try {
    return parseArgsSchema(json);
  } catch {
    return [];
  }
}

/**
 * Load a widget for editing, enforcing ownership. Throws NotFound when it doesn't
 * exist and Forbidden when the requester isn't its author.
 */
export async function getEditableWidget(
  slug: string,
  userId: string,
): Promise<EditableWidget> {
  const widget = await prisma.widget.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      type: true,
      visibility: true,
      source: true,
      argsSchema: true,
      authorId: true,
    },
  });
  if (!widget) throw new NotFoundError("That widget doesn’t exist.");
  if (widget.authorId !== userId) {
    throw new ForbiddenError("You can only edit your own widgets.");
  }
  return {
    id: widget.id,
    slug: widget.slug,
    name: widget.name,
    description: widget.description,
    type: widget.type,
    visibility: widget.visibility,
    source: widget.source,
    argsSchema: safeArgsSchema(widget.argsSchema),
  };
}

/** Load the minimal owned widget for a mutation, enforcing ownership. */
async function requireOwnedWidget(slug: string, userId: string) {
  const widget = await prisma.widget.findUnique({
    where: { slug },
    select: { id: true, authorId: true, name: true, visibility: true },
  });
  if (!widget) throw new NotFoundError("That widget doesn’t exist.");
  if (widget.authorId !== userId) {
    throw new ForbiddenError("You don’t own this widget.");
  }
  return widget;
}

/** Create a new widget owned by `userId`; returns its slug. */
export async function createWidget(
  userId: string,
  input: WidgetInput,
): Promise<string> {
  const slug = await uniqueSlug(input.name);
  const widget = await prisma.widget.create({
    data: {
      slug,
      name: input.name,
      description: input.description,
      type: input.type,
      visibility: input.visibility,
      source: input.source,
      argsSchema: input.argsSchema as unknown as Prisma.InputJsonValue,
      authorId: userId,
    },
    select: { slug: true },
  });
  return widget.slug;
}

/** Update an owned widget's code/schema/metadata and purge its render cache. */
export async function updateWidget(
  slug: string,
  userId: string,
  input: WidgetInput,
): Promise<string> {
  const widget = await requireOwnedWidget(slug, userId);
  await prisma.widget.update({
    where: { id: widget.id },
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      visibility: input.visibility,
      source: input.source,
      argsSchema: input.argsSchema as unknown as Prisma.InputJsonValue,
    },
  });
  await invalidateWidgetRenderCache(widget.id);
  return slug;
}

export async function forkWidget(
  slug: string,
  userId: string,
  newName: string,
): Promise<string> {
  const original = await prisma.widget.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      type: true,
      source: true,
      argsSchema: true,
      visibility: true,
      authorId: true,
    },
  });
  // Don't leak the existence of a private widget to non-owners.
  if (
    !original ||
    (original.visibility === "PRIVATE" && original.authorId !== userId)
  ) {
    throw new NotFoundError("That widget doesn’t exist.");
  }

  const name = newName.trim() || `${original.name} (fork)`;
  const forkSlug = await uniqueSlug(name);
  const fork = await prisma.widget.create({
    data: {
      slug: forkSlug,
      name: name.slice(0, 60),
      description: "",
      type: original.type,
      visibility: "PRIVATE",
      source: original.source,
      argsSchema: original.argsSchema as Prisma.InputJsonValue,
      authorId: userId,
      forkedFromId: original.id,
      forkedFromName: original.name,
    },
    select: { slug: true },
  });
  return fork.slug;
}

export async function deleteWidget(
  slug: string,
  userId: string,
): Promise<void> {
  const widget = await requireOwnedWidget(slug, userId);
  await invalidateWidgetRenderCache(widget.id);
  await prisma.widget.delete({ where: { id: widget.id } });
}

export async function setWidgetVisibility(
  slug: string,
  userId: string,
  visibility: Visibility,
): Promise<void> {
  const widget = await requireOwnedWidget(slug, userId);
  if (widget.visibility === visibility) return;
  await prisma.widget.update({
    where: { id: widget.id },
    data: { visibility },
  });
}
