// src/lib/cache.ts
import { redis } from "./clients";
import { logger } from "./logger";
import crypto from "node:crypto";

/**
 * Deterministic Key Generator for Consistency Anchors.
 */
export function generateScoringKey(args: {
  personaId: string;
  idea: string;
  goal: string;
  evaluationLens?: string;
}) {
  const hash = crypto
    .createHash("sha256")
    .update(
      `${args.personaId}:${args.idea}:${args.goal}:${args.evaluationLens || ""}`
    )
    .digest("hex");
  
  return `dse:cache:${hash}`;
}

/**
 * Get cached scores for a specific input.
 */
export async function getCachedScores(key: string) {
  if (!redis) return null;
  
  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.info({ key }, "Cache hit for DSE scoring");
      return cached as any;
    }
  } catch (err) {
    logger.error({ err, key }, "Failed to get cached scores");
  }
  
  return null;
}

/**
 * Save scores to cache.
 */
export async function setCachedScores(key: string, data: any) {
  if (!redis) return;
  
  try {
    // Cache for 7 days (604800 seconds)
    await redis.set(key, data, { ex: 604800 });
    logger.info({ key }, "Cached DSE scoring result");
  } catch (err) {
    logger.error({ err, key }, "Failed to cache scores");
  }
}
