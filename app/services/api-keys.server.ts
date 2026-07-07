import { createHash, randomBytes } from "node:crypto";
import type { SessionUser } from "./context";
import { prisma } from "./db.server";

const KEY_PREFIX = "gita_";
const RAW_BYTES = 32;

export interface ApiKeySummary {
  id: string;
  name: string;
  last4: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreatedApiKey extends ApiKeySummary {
  key: string;
}

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

type ApiKeyRow = {
  id: string;
  name: string;
  last4: string;
  createdAt: Date;
  lastUsedAt: Date | null;
};

function toSummary(row: ApiKeyRow): ApiKeySummary {
  return {
    id: row.id,
    name: row.name,
    last4: row.last4,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  };
}

export async function createApiKey(
  userId: string,
  name: string,
): Promise<CreatedApiKey> {
  const secret = KEY_PREFIX + randomBytes(RAW_BYTES).toString("base64url");
  const row = await prisma.apiKey.create({
    data: {
      userId,
      name: name.trim().slice(0, 60) || "API key",
      hashedKey: hashKey(secret),
      last4: secret.slice(-4),
    },
  });
  return { ...toSummary(row), key: secret };
}

export async function listApiKeys(userId: string): Promise<ApiKeySummary[]> {
  const rows = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toSummary);
}

export async function revokeApiKey(userId: string, id: string): Promise<void> {
  await prisma.apiKey.deleteMany({ where: { id, userId } });
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export async function authenticateApiKey(
  request: Request,
): Promise<SessionUser | null> {
  const token = bearerToken(request);
  if (!token || !token.startsWith(KEY_PREFIX)) return null;

  const row = await prisma.apiKey.findUnique({
    where: { hashedKey: hashKey(token) },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          image: true,
          githubId: true,
        },
      },
    },
  });
  if (!row) return null;

  await prisma.apiKey
    .update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined);

  const u = row.user;
  return {
    id: u.id,
    name: u.name,
    username: u.username ?? u.name,
    email: u.email,
    avatarUrl: u.avatarUrl ?? u.image ?? null,
    githubId: u.githubId ?? null,
  };
}
