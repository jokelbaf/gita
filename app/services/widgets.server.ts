import { Prisma } from "~/generated/prisma/client";
import { parseArgsSchema, type WidgetArg } from "./args";
import { prisma } from "./db.server";
import type { SortKey, TypeFilter, WidgetCard } from "~/lib/widget";

// Discovery queries for the library, detail, profile, and landing pages (SPEC
// §5.2/§5.3/§5.6, §11). Ranking (SPEC §11): popular = likesCount, newest =
// createdAt desc, trending = 14-day time-decayed likes computed lazily per query.
// Pagination is cursor-based ("Load more") - keyset for popular/newest via Prisma
// cursors, and a keyset raw query for trending's computed score.

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const TRENDING_WINDOW_SECONDS = 14 * 24 * 60 * 60; // 14 days

function clampLimit(limit: number | undefined): number {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit)));
}

export type { WidgetCard };

export interface ListWidgetsParams {
  viewerId: string | null;
  search?: string;
  type?: TypeFilter;
  forksOnly?: boolean;
  sort?: SortKey;
  cursor?: string | null;
  limit?: number;
  /** Force PUBLIC-only visibility (landing/trending strip), ignoring viewer's own private widgets. */
  publicOnly?: boolean;
}

export interface ListWidgetsResult {
  widgets: WidgetCard[];
  nextCursor: string | null;
}

async function queryCards(
  where: Prisma.WidgetWhereInput,
  orderBy: Prisma.WidgetOrderByWithRelationInput[] | undefined,
  viewerId: string | null,
  opts: { take?: number; cursorId?: string } = {},
) {
  return prisma.widget.findMany({
    where,
    ...(orderBy ? { orderBy } : {}),
    ...(opts.take ? { take: opts.take } : {}),
    ...(opts.cursorId ? { cursor: { id: opts.cursorId }, skip: 1 } : {}),
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      type: true,
      visibility: true,
      likesCount: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      forkedFromId: true,
      forkedFromName: true,
      author: {
        select: { username: true, name: true, avatarUrl: true, image: true },
      },
      forkedFrom: { select: { slug: true, name: true, visibility: true } },
      likes: { where: { userId: viewerId ?? "" }, select: { userId: true } },
    },
  });
}

type CardRow = Awaited<ReturnType<typeof queryCards>>[number];

function toCard(row: CardRow, viewerId: string | null): WidgetCard {
  const isFork = row.forkedFromId !== null || row.forkedFromName !== null;
  const linkable = row.forkedFrom && row.forkedFrom.visibility === "PUBLIC";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    type: row.type,
    visibility: row.visibility,
    likesCount: row.likesCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    author: {
      username: row.author.username ?? "unknown",
      name: row.author.name,
      avatarUrl: row.author.avatarUrl ?? row.author.image ?? null,
    },
    isFork,
    forkedFromName: row.forkedFrom?.name ?? row.forkedFromName ?? null,
    forkedFromSlug: linkable ? (row.forkedFrom?.slug ?? null) : null,
    likedByViewer: row.likes.length > 0,
    isOwner: viewerId !== null && row.authorId === viewerId,
  };
}

function visibilityWhere(params: ListWidgetsParams): Prisma.WidgetWhereInput {
  if (params.publicOnly || !params.viewerId) return { visibility: "PUBLIC" };
  return {
    OR: [{ visibility: "PUBLIC" }, { authorId: params.viewerId }],
  };
}

function buildWhere(params: ListWidgetsParams): Prisma.WidgetWhereInput {
  const and: Prisma.WidgetWhereInput[] = [visibilityWhere(params)];
  if (params.type && params.type !== "all") and.push({ type: params.type });
  if (params.forksOnly) and.push({ forkedFromId: { not: null } });
  const search = params.search?.trim();
  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  return { AND: and };
}

function rawConds(params: ListWidgetsParams): Prisma.Sql[] {
  const conds: Prisma.Sql[] = [];
  if (params.publicOnly || !params.viewerId) {
    conds.push(Prisma.sql`w."visibility" = 'PUBLIC'`);
  } else {
    conds.push(
      Prisma.sql`(w."visibility" = 'PUBLIC' OR w."authorId" = ${params.viewerId})`,
    );
  }
  if (params.type && params.type !== "all") {
    conds.push(Prisma.sql`w."type"::text = ${params.type}`);
  }
  if (params.forksOnly) conds.push(Prisma.sql`w."forkedFromId" IS NOT NULL`);
  const search = params.search?.trim();
  if (search) {
    const like = `%${search}%`;
    conds.push(
      Prisma.sql`(w."name" ILIKE ${like} OR w."description" ILIKE ${like})`,
    );
  }
  return conds;
}

interface TrendingCursor {
  score: number;
  id: string;
  /** Pinned decay-reference time (epoch ms) for the pagination sequence. */
  refMs: number;
}

function decodeTrendingCursor(
  cursor: string | null | undefined,
): TrendingCursor | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Partial<TrendingCursor>;
    if (
      typeof parsed.score !== "number" ||
      typeof parsed.id !== "string" ||
      typeof parsed.refMs !== "number"
    ) {
      return null;
    }
    return { score: parsed.score, id: parsed.id, refMs: parsed.refMs };
  } catch {
    return null;
  }
}

function encodeTrendingCursor(
  score: number,
  id: string,
  refMs: number,
): string {
  return Buffer.from(JSON.stringify({ score, id, refMs })).toString(
    "base64url",
  );
}

// ---------------------------------------------------------------------------
// Listing
// ---------------------------------------------------------------------------

export async function listWidgets(
  params: ListWidgetsParams,
): Promise<ListWidgetsResult> {
  const limit = clampLimit(params.limit);
  const sort = params.sort ?? "popular";
  const viewerId = params.viewerId ?? null;

  if (sort === "trending") return listTrending(params, limit, viewerId);

  const orderBy: Prisma.WidgetOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ createdAt: "desc" }, { id: "desc" }]
      : [{ likesCount: "desc" }, { id: "desc" }];

  const rows = await queryCards(buildWhere(params), orderBy, viewerId, {
    take: limit + 1,
    cursorId: params.cursor ?? undefined,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  return {
    widgets: page.map((row) => toCard(row, viewerId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

async function listTrending(
  params: ListWidgetsParams,
  limit: number,
  viewerId: string | null,
): Promise<ListWidgetsResult> {
  const cursor = decodeTrendingCursor(params.cursor);
  // Pin the decay reference time for the whole pagination sequence. Using now()
  // per request would drift every score as wall-clock advances between pages,
  // making boundary widgets reappear; the reference travels in the cursor.
  const refIso = new Date(cursor?.refMs ?? Date.now()).toISOString();
  const cursorSql = cursor
    ? Prisma.sql`AND (s.score < ${cursor.score} OR (s.score = ${cursor.score} AND s.id < ${cursor.id}))`
    : Prisma.empty;
  const take = limit + 1;

  const scored = await prisma.$queryRaw<{ id: string; score: number }[]>(
    Prisma.sql`
      WITH scored AS (
        SELECT
          w."id" AS id,
          COALESCE(
            SUM(GREATEST(0, 1 - EXTRACT(EPOCH FROM (${refIso}::timestamptz - l."createdAt")) / ${TRENDING_WINDOW_SECONDS}::float8)),
            0
          )::float8 AS score
        FROM "Widget" w
        LEFT JOIN "Like" l
          ON l."widgetId" = w."id"
          AND l."createdAt" > ${refIso}::timestamptz - interval '14 days'
        WHERE ${Prisma.join(rawConds(params), " AND ")}
        GROUP BY w."id"
      )
      SELECT s.id, s.score FROM scored s
      WHERE TRUE ${cursorSql}
      ORDER BY s.score DESC, s.id DESC
      LIMIT ${take}
    `,
  );

  const hasMore = scored.length > limit;
  const pageRows = hasMore ? scored.slice(0, limit) : scored;
  const widgets = await hydrateByIds(
    pageRows.map((row) => row.id),
    viewerId,
  );
  const last = pageRows[pageRows.length - 1];
  return {
    widgets,
    nextCursor:
      hasMore && last
        ? encodeTrendingCursor(
            last.score,
            last.id,
            cursor?.refMs ?? Date.parse(refIso),
          )
        : null,
  };
}

/** Load full cards for an ordered id list, preserving the given order. */
async function hydrateByIds(
  ids: string[],
  viewerId: string | null,
): Promise<WidgetCard[]> {
  if (ids.length === 0) return [];
  const rows = await queryCards({ id: { in: ids } }, undefined, viewerId);
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is CardRow => row !== undefined)
    .map((row) => toCard(row, viewerId));
}

// ---------------------------------------------------------------------------
// Widget detail (SPEC §5.3)
// ---------------------------------------------------------------------------

export interface WidgetDetail extends WidgetCard {
  source: string;
  argsSchema: WidgetArg[];
  forkCount: number;
}

function safeArgsSchema(json: Prisma.JsonValue): WidgetArg[] {
  try {
    return parseArgsSchema(json);
  } catch {
    return [];
  }
}

export async function getWidgetDetail(
  slug: string,
  viewerId: string | null,
): Promise<WidgetDetail | null> {
  const w = await prisma.widget.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      type: true,
      visibility: true,
      likesCount: true,
      source: true,
      argsSchema: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      forkedFromId: true,
      forkedFromName: true,
      author: {
        select: { username: true, name: true, avatarUrl: true, image: true },
      },
      forkedFrom: { select: { slug: true, name: true, visibility: true } },
      likes: { where: { userId: viewerId ?? "" }, select: { userId: true } },
      _count: { select: { forks: true } },
    },
  });
  if (!w) return null;
  if (w.visibility === "PRIVATE" && w.authorId !== viewerId) return null;

  return {
    ...toCard(w, viewerId),
    source: w.source,
    argsSchema: safeArgsSchema(w.argsSchema),
    forkCount: w._count.forks,
  };
}

export async function listUserWidgets(userId: string): Promise<WidgetCard[]> {
  const rows = await queryCards(
    { authorId: userId },
    [{ updatedAt: "desc" }, { id: "desc" }],
    userId,
  );
  return rows.map((row) => toCard(row, userId));
}

export async function listLikedWidgets(userId: string): Promise<WidgetCard[]> {
  const rows = await queryCards(
    {
      likes: { some: { userId } },
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }],
    },
    [{ likesCount: "desc" }, { id: "desc" }],
    userId,
  );
  return rows.map((row) => toCard(row, userId));
}

export async function listForkedWidgets(userId: string): Promise<WidgetCard[]> {
  const rows = await queryCards(
    {
      authorId: userId,
      OR: [{ forkedFromId: { not: null } }, { forkedFromName: { not: null } }],
    },
    [{ createdAt: "desc" }, { id: "desc" }],
    userId,
  );
  return rows.map((row) => toCard(row, userId));
}

export interface ProfileData {
  username: string;
  name: string;
  avatarUrl: string | null;
  githubUrl: string;
  joinedAt: string;
  widgets: WidgetCard[];
}

export async function getProfile(
  username: string,
  viewerId: string | null,
): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user || !user.username) return null;

  const rows = await queryCards(
    { authorId: user.id, visibility: "PUBLIC" },
    [{ likesCount: "desc" }, { id: "desc" }],
    viewerId,
  );

  return {
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl ?? user.image ?? null,
    githubUrl: `https://github.com/${user.username}`,
    joinedAt: user.createdAt.toISOString(),
    widgets: rows.map((row) => toCard(row, viewerId)),
  };
}
