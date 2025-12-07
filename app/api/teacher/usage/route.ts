/**
 * Teacher Usage API
 * Returns rate limiting usage statistics for a teacher
 */

import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth/api-middleware"
import { getUsageStats } from "@/lib/middleware/rate-limiter"
import { logger } from "@/lib/logger"

// Cost per execution estimate (based on average AI API usage)
const COST_PER_EXECUTION = 0.002 // $0.002 per execution average

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get teacher ID from query or use authenticated user
    const searchParams = request.nextUrl.searchParams
    const teacherId = searchParams.get("teacher_id") || user.id

    // Only allow teachers to view their own usage (admins can view any)
    if (teacherId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Cannot view other teachers' usage" },
        { status: 403 }
      )
    }

    // Get usage stats from rate limiter
    const usageStats = await getUsageStats(teacherId)

    if (!usageStats) {
      // Return mock data if rate limiting not configured
      return NextResponse.json({
        dailyUsed: 0,
        dailyLimit: 500,
        hourlyUsed: 0,
        hourlyLimit: 100,
        burstUsed: 0,
        burstLimit: 10,
        periodReset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        costEstimate: 0,
        trend: "stable",
      })
    }

    // Calculate cost estimate
    const costEstimate = usageStats.dailyUsed * COST_PER_EXECUTION

    // Determine usage trend (simplified - would normally compare to historical data)
    const avgDailyUsage = usageStats.dailyLimit * 0.4 // Assume 40% is average
    const trend = usageStats.dailyUsed > avgDailyUsage * 1.2 
      ? "up" 
      : usageStats.dailyUsed < avgDailyUsage * 0.8 
        ? "down" 
        : "stable"

    return NextResponse.json({
      dailyUsed: usageStats.dailyUsed,
      dailyLimit: usageStats.dailyLimit,
      burstUsed: usageStats.burstUsed,
      burstLimit: usageStats.burstLimit,
      periodReset: usageStats.periodReset.toISOString(),
      costEstimate,
      trend,
    })
  } catch (error) {
    logger.error("Error fetching usage stats", error)
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    )
  }
}
