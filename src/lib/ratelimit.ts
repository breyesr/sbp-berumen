import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash Redis-based Rate Limiter for Next.js (Edge compatible).
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 */

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  // If variables are missing, we should log a warning but not crash in dev.
  // In production, rate limiting should be mandatory.
  if (process.env.NODE_ENV === 'production') {
    console.warn("CRITICAL: Rate limiting is disabled in production due to missing environment variables.");
  }
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a more restrictive limiter for AI/LLM operations to control costs.
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
  prefix: "ratelimit:ai",
});

// Create a general limiter for common API metadata/read operations.
export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
  analytics: true,
  prefix: "ratelimit:global",
});

/**
 * Utility to check if a request should be rate-limited.
 */
export async function checkRateLimit(identifier: string, path: string) {
  // Skip rate limiting if environment variables are missing
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  // Determine which limiter to use based on the API route
  const isAIEndpoint = path.startsWith('/api/stress-test') || 
                       path.startsWith('/api/idea-refinement') || 
                       path.startsWith('/api/copywriter') ||
                       path.startsWith('/api/persona');

  const limiter = isAIEndpoint ? aiLimiter : globalLimiter;
  return await limiter.limit(identifier);
}
