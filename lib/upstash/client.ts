/**
 * Upstash Redis Client
 * Provides Redis client for rate limiting and caching
 */

import { Redis } from "@upstash/redis"

// Check if Upstash is configured
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
)

// Create Redis client from environment variables
export const redis = isUpstashConfigured
  ? Redis.fromEnv()
  : null

/**
 * Get Redis client with error handling
 * Throws if not configured
 */
export function getRedisClient(): Redis {
  if (!redis) {
    throw new Error(
      "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local"
    )
  }
  return redis
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  if (!redis) return false
  
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}
