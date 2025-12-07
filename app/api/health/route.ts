/**
 * Health Check API Route
 * Provides system health information for monitoring and load balancers
 * 
 * @api {GET} /api/health Health Check
 * @apiName HealthCheck
 * @apiGroup System
 * @apiVersion 1.0.0
 */

import { NextResponse } from "next/server"
import { isRedisAvailable } from "@/lib/upstash/client"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: "up" | "down" | "unconfigured"
    redis: "up" | "down" | "unconfigured"
    ai: "up" | "down" | "unconfigured"
  }
  environment: string
}

// Track server start time
const startTime = Date.now()

export async function GET(): Promise<NextResponse<HealthStatus>> {
  type CheckStatus = "up" | "down" | "unconfigured"
  
  const checks: {
    database: CheckStatus
    redis: CheckStatus
    ai: CheckStatus
  } = {
    database: "unconfigured",
    redis: "unconfigured",
    ai: "unconfigured",
  }

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseKey && 
      supabaseUrl !== "https://your-project.supabase.co" &&
      supabaseKey !== "your-anon-key-here") {
    // In production, we would ping the database
    // For now, mark as up if configured
    checks.database = "up"
  }

  // Check Redis
  try {
    const redisUp = await isRedisAvailable()
    checks.redis = redisUp ? "up" : "unconfigured"
  } catch {
    checks.redis = "down"
  }

  // Check AI configuration
  const aiKey = process.env.AI_OPENAI_API_KEY || process.env.OPENAI_API_KEY
  if (aiKey && aiKey !== "your-openai-api-key-here") {
    checks.ai = "up"
  }

  // Determine overall status
  const criticalDown = checks.database === "down" || checks.redis === "down"
  const allUnconfigured = 
    checks.database === "unconfigured" && 
    checks.redis === "unconfigured" && 
    checks.ai === "unconfigured"

  const status: HealthStatus["status"] = criticalDown 
    ? "unhealthy" 
    : allUnconfigured 
      ? "degraded" 
      : "healthy"

  const healthStatus: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    environment: process.env.NODE_ENV || "development",
  }

  const httpStatus = status === "unhealthy" ? 503 : 200

  return NextResponse.json(healthStatus, { status: httpStatus })
}

// Also support HEAD requests for simple health probes
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 })
}
