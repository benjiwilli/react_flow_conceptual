/**
 * Rate Limiter Middleware
 * Provides rate limiting for API routes using Upstash Redis
 */

import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/upstash/client"

// Daily limit for teachers: 500 workflow executions
export const teacherDailyLimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(500, "86400 s"), // 24 hours
      analytics: true,
      prefix: "ratelimit:teacher:daily",
    })
  : null

// Hourly limit per classroom: 100 executions
export const classroomHourlyLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(100, "3600 s"), // 1 hour
      analytics: true,
      prefix: "ratelimit:classroom:hourly",
    })
  : null

// Per-minute burst limit: 10 executions
export const burstLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:burst",
    })
  : null

// Per-IP limit: 30 requests/minute
export const ipLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
      prefix: "ratelimit:ip",
    })
  : null

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export interface RateLimitCheck {
  allowed: boolean
  limits: {
    teacher: RateLimitResult | null
    classroom: RateLimitResult | null
    burst: RateLimitResult | null
  }
  limitType?: string
}

/**
 * Check execution limits for a teacher/classroom
 */
export async function checkExecutionLimit(
  teacherId: string,
  classroomId?: string
): Promise<RateLimitCheck> {
  // If Redis is not configured, allow all requests (demo mode)
  if (!teacherDailyLimit || !burstLimit) {
    return {
      allowed: true,
      limits: {
        teacher: null,
        classroom: null,
        burst: null,
      },
    }
  }

  try {
    const [teacherResult, classroomResult, burstResult] = await Promise.all([
      teacherDailyLimit.limit(`teacher:${teacherId}`),
      classroomId && classroomHourlyLimit 
        ? classroomHourlyLimit.limit(`classroom:${classroomId}`)
        : Promise.resolve(null),
      burstLimit.limit(`burst:${teacherId}`),
    ])

    const allowed = 
      teacherResult.success &&
      (!classroomResult || classroomResult.success) &&
      burstResult.success

    let limitType: string | undefined
    if (!teacherResult.success) {
      limitType = "daily teacher limit"
    } else if (!burstResult.success) {
      limitType = "burst limit"
    } else if (classroomResult && !classroomResult.success) {
      limitType = "classroom hourly limit"
    }

    return {
      allowed,
      limits: {
        teacher: {
          success: teacherResult.success,
          limit: teacherResult.limit,
          remaining: teacherResult.remaining,
          reset: teacherResult.reset,
        },
        classroom: classroomResult
          ? {
              success: classroomResult.success,
              limit: classroomResult.limit,
              remaining: classroomResult.remaining,
              reset: classroomResult.reset,
            }
          : null,
        burst: {
          success: burstResult.success,
          limit: burstResult.limit,
          remaining: burstResult.remaining,
          reset: burstResult.reset,
        },
      },
      limitType,
    }
  } catch {
    // On error, allow the request (fail open for availability)
    return {
      allowed: true,
      limits: {
        teacher: null,
        classroom: null,
        burst: null,
      },
    }
  }
}

/**
 * Check IP rate limit
 */
export async function checkIpLimit(ip: string): Promise<RateLimitResult | null> {
  if (!ipLimit) return null

  try {
    const result = await ipLimit.limit(`ip:${ip}`)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch {
    // Fail open on error
    return null
  }
}

/**
 * Get usage stats for a teacher
 */
export async function getUsageStats(teacherId: string): Promise<{
  dailyUsed: number
  dailyLimit: number
  burstUsed: number
  burstLimit: number
  periodReset: Date
} | null> {
  if (!redis) return null

  try {
    // Get current usage from rate limiter analytics
    const [dailyKey, burstKey] = [
      `ratelimit:teacher:daily:teacher:${teacherId}`,
      `ratelimit:burst:burst:${teacherId}`,
    ]

    const dailyCount = await redis.get<number>(dailyKey) || 0
    const burstCount = await redis.get<number>(burstKey) || 0

    // Calculate reset time (next day midnight UTC)
    const now = new Date()
    const resetTime = new Date(now)
    resetTime.setUTCHours(24, 0, 0, 0)

    return {
      dailyUsed: dailyCount,
      dailyLimit: 500,
      burstUsed: burstCount,
      burstLimit: 10,
      periodReset: resetTime,
    }
  } catch {
    // Return null on error
    return null
  }
}
