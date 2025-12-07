/**
 * Cost Alerts System
 * Monitors usage and sends budget alerts to teachers
 */

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redis } from "@/lib/upstash/client"

// Budget threshold percentages and messages
const COST_THRESHOLDS = [
  { 
    percentage: 80, 
    severity: "medium" as const,
    message: "You've used 80% of your monthly budget" 
  },
  { 
    percentage: 95, 
    severity: "high" as const,
    message: "⚠️ CRITICAL: You've used 95% of your monthly budget" 
  },
  { 
    percentage: 100, 
    severity: "critical" as const,
    message: "🛑 BUDGET EXCEEDED: Consider upgrading your plan" 
  }
]

// Monthly execution limits per plan
const PLAN_LIMITS = {
  free: 1000,
  basic: 5000,
  pro: 15000,
  enterprise: 50000,
}

export interface BudgetAlert {
  id: string
  teacher_id: string
  type: "budget_warning" | "limit_reached" | "cost_spike"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  percentage: number
  created_at: string
  read: boolean
}

/**
 * Check budget and create alerts if thresholds exceeded
 */
export async function checkBudgetAlerts(teacherId: string): Promise<BudgetAlert[]> {
  const supabase = await createSupabaseServerClient()
  const alerts: BudgetAlert[] = []

  try {
    // Get monthly execution count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get usage from Redis or database
    let monthlyUsage = 0
    
    if (redis) {
      const key = `usage:monthly:${teacherId}:${startOfMonth.toISOString().slice(0, 7)}`
      monthlyUsage = (await redis.get<number>(key)) || 0
    } else {
      // Fallback to database count
      const { count } = await supabase
        .from("execution_logs")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", startOfMonth.toISOString())
        .eq("teacher_id", teacherId)

      monthlyUsage = count || 0
    }

    // Get teacher's plan (default to basic for now)
    const plan = "basic" // Would come from teacher profile
    const monthlyLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.basic
    const usagePercentage = (monthlyUsage / monthlyLimit) * 100

    // Check each threshold
    for (const threshold of COST_THRESHOLDS) {
      if (usagePercentage >= threshold.percentage) {
        // Check if alert already sent for this threshold
        const alertKey = `alert:${teacherId}:${threshold.percentage}:${startOfMonth.toISOString().slice(0, 7)}`
        
        if (redis) {
          const alreadySent = await redis.get(alertKey)
          if (alreadySent) continue
        }

        // Create alert
        const alert: BudgetAlert = {
          id: crypto.randomUUID(),
          teacher_id: teacherId,
          type: "budget_warning",
          severity: threshold.severity,
          message: threshold.message,
          percentage: Math.round(usagePercentage),
          created_at: new Date().toISOString(),
          read: false,
        }

        // Store alert in database
        await supabase.from("teacher_alerts").insert({
          id: alert.id,
          teacher_id: alert.teacher_id,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          metadata: { percentage: alert.percentage },
          created_at: alert.created_at,
          read: false,
        })

        // Mark alert as sent in Redis (TTL: 30 days)
        if (redis) {
          await redis.set(alertKey, true, { ex: 30 * 24 * 60 * 60 })
        }

        alerts.push(alert)
      }
    }

    return alerts
  } catch {
    // Silently fail - alerts are non-critical
    return []
  }
}

/**
 * Increment monthly usage counter
 */
export async function incrementUsage(teacherId: string): Promise<void> {
  if (!redis) return

  try {
    const monthKey = new Date().toISOString().slice(0, 7)
    const key = `usage:monthly:${teacherId}:${monthKey}`
    
    // Increment counter (auto-expires after 35 days)
    await redis.incr(key)
    await redis.expire(key, 35 * 24 * 60 * 60)

    // Check alerts after incrementing
    await checkBudgetAlerts(teacherId)
  } catch {
    // Silently fail - usage tracking is non-critical
  }
}

/**
 * Get unread alerts for a teacher
 */
export async function getUnreadAlerts(teacherId: string): Promise<BudgetAlert[]> {
  const supabase = await createSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from("teacher_alerts")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return data as BudgetAlert[]
  } catch {
    // Return empty array on error - alerts are non-critical
    return []
  }
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()

  try {
    await supabase
      .from("teacher_alerts")
      .update({ read: true })
      .eq("id", alertId)
  } catch {
    // Silently fail - marking as read is non-critical
  }
}
