import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const developmentRequests = new Map<string, { count: number; resetAt: number }>();

function upstashLimiter(limit: number, window: `${number} m`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: "ms-pharma-impex"
  });
}

export async function enforceRateLimit(scope: "quote-request" | "staff-login" | "upload", identifier: string) {
  const config = {
    "quote-request": { limit: 8, window: "10 m" as const },
    "staff-login": { limit: 5, window: "15 m" as const },
    upload: { limit: 10, window: "10 m" as const }
  }[scope];
  const limiter = upstashLimiter(config.limit, config.window);
  if (limiter) {
    const result = await limiter.limit(`${scope}:${identifier}`);
    if (!result.success) throw new Error("Too many requests. Please wait before trying again.");
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Rate limiting is not configured for production.");
  }
  const now = Date.now();
  const key = `${scope}:${identifier}`;
  const previous = developmentRequests.get(key);
  if (!previous || now >= previous.resetAt) {
    developmentRequests.set(key, { count: 1, resetAt: now + 10 * 60_000 });
    return;
  }
  if (previous.count >= config.limit) throw new Error("Too many requests. Please wait before trying again.");
  previous.count += 1;
}

