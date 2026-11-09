import { NextRequest, NextResponse } from "next/server";

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Sliding-window rate limiter (~10 requests per minute by default).
 * Returns a 429 NextResponse if the caller exceeds the limit, or null if allowed.
 */
export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): NextResponse | null {
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    const retryAfter = Math.max(1, Math.ceil((bucket.timestamps[0] + windowMs - now) / 1000));
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return null;
}
