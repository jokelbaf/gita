import { Redis } from "ioredis";
import { env, isProduction } from "./env.server";
import { cacheLog } from "./logger.server";

function createRedis(): Redis {
  const client = new Redis(env.REDIS_URL, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 200, 5_000),
  });
  client.on("error", (err: Error) => {
    cacheLog.warn({ err: err.message }, "redis error");
  });
  client.on("connect", () => cacheLog.debug("redis connected"));
  return client;
}

const globalForRedis = globalThis as unknown as { redis?: Redis };
export const redis = globalForRedis.redis ?? createRedis();
if (!isProduction) globalForRedis.redis = redis;

export const cacheKeys = {
  renderGeneric: (widgetId: string, paramsHash: string) =>
    `render:${widgetId}:${paramsHash}`,
  renderInstance: (instanceId: string) => `render:instance:${instanceId}`,
  widgetIndex: (widgetId: string) => `index:widget:${widgetId}`,
  userGitIndex: (userId: string) => `index:git:${userId}`,
  git: (provider: string, host: string, resource: string, id: string) =>
    `git:${provider}:${host}:${resource}:${id}`,
  rate: (bucket: string, id: string) => `rate:${bucket}:${id}`,
} as const;

export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds: number,
  indexKey?: string,
): Promise<void> {
  try {
    if (ttlSeconds > 0) {
      await redis.set(key, value, "EX", ttlSeconds);
    } else {
      await redis.set(key, value);
    }
    if (indexKey) {
      // Keep the index slightly longer than the entry so purge stays reliable.
      await redis.sadd(indexKey, key);
      if (ttlSeconds > 0) await redis.expire(indexKey, ttlSeconds + 60);
    }
  } catch {
    // best-effort
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // best-effort
  }
}

interface CacheCodec<T> {
  serialize: (value: T) => string;
  deserialize: (raw: string) => T;
}

const jsonCodec: CacheCodec<unknown> = {
  serialize: (v) => JSON.stringify(v),
  deserialize: (raw) => JSON.parse(raw) as unknown,
};

export interface WithCacheOptions<T> {
  /** Index set to register this key under (enables grouped invalidation). */
  indexKey?: string;
  codec?: CacheCodec<T>;
}

/**
 * Return the cached value for `key`, or produce it, cache it with `ttlSeconds`,
 * and return it. `produce` still runs on any cache error, so a Redis outage only
 * costs the cache benefit, never correctness.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  produce: () => Promise<T>,
  options: WithCacheOptions<T> = {},
): Promise<T> {
  const codec = (options.codec ??
    (jsonCodec as CacheCodec<T>)) as CacheCodec<T>;
  const cached = await cacheGet(key);
  if (cached !== null) {
    try {
      return codec.deserialize(cached);
    } catch {
      // corrupt entry - fall through and recompute
    }
  }
  const value = await produce();
  await cacheSet(key, codec.serialize(value), ttlSeconds, options.indexKey);
  return value;
}

/** Delete every key registered under an index set, plus the set itself. */
export async function invalidateByIndex(indexKey: string): Promise<number> {
  try {
    const members = await redis.smembers(indexKey);
    if (members.length > 0) await redis.del(...members);
    await redis.del(indexKey);
    return members.length;
  } catch {
    return 0;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetSeconds: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    const ttl = await redis.ttl(key);
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      limit,
      resetSeconds: ttl >= 0 ? ttl : windowSeconds,
    };
  } catch {
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetSeconds: windowSeconds,
    };
  }
}
