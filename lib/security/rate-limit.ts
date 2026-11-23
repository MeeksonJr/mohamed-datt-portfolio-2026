import type { NextRequest } from 'next/server'

interface RateLimitBucket {
  count: number
  resetAt: number
}

const BUCKETS = new Map<string, RateLimitBucket>()

export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) {
    return fwd.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || '127.0.0.1'
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now()

  // Periodic cleanup to avoid unbounded memory growth
  if (BUCKETS.size > 500) {
    for (const [k, v] of BUCKETS.entries()) {
      if (v.resetAt <= now) BUCKETS.delete(k)
    }
  }

  const existing = BUCKETS.get(key)
  if (!existing || existing.resetAt <= now) {
    BUCKETS.set(key, { count: 1, resetAt: now + windowMs })
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  }
}

export function stripHtmlTags(input: string): string {
  return input.replace(/[<>]/g, '').trim()
}
