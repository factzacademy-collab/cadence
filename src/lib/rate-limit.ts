import "server-only";
import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter (sliding window).
 * For production with multiple instances, swap for Redis-backed limiter.
 *
 * Usage in an API route:
 *   const limited = rateLimit(req, { limit: 10, windowMs: 60_000 });
 *   if (limited) return limited;
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically prune expired buckets to avoid memory growth.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (b.resetAt < now) buckets.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}

function getClientKey(req: NextRequest): string {
  // Prefer forwarded IP, fall back to a session cookie or "anonymous".
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const ip = req.headers.get("x-real-ip");
  if (ip) return ip;
  return req.cookies.get("next-auth.session-token")?.value ?? "anonymous";
}

export function rateLimit(
  req: NextRequest,
  opts: { limit: number; windowMs: number; keyPrefix?: string }
): NextResponse | null {
  const key = `${opts.keyPrefix ?? "default"}:${getClientKey(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  bucket.count++;
  if (bucket.count > opts.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
        },
      }
    );
  }
  return null;
}

/** Standard limits used across the app. */
export const LIMITS = {
  ai: { limit: 20, windowMs: 60_000 }, // 20 AI requests/minute
  auth: { limit: 10, windowMs: 60_000 }, // 10 auth attempts/minute
  write: { limit: 60, windowMs: 60_000 }, // 60 writes/minute
  default: { limit: 120, windowMs: 60_000 }, // 120 reads/minute
} as const;
