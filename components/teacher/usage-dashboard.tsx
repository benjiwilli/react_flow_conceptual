"use client"

/**
 * Usage Dashboard Component
 * Displays rate limiting usage statistics and alerts for teachers
 */

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react"

interface UsageStats {
  dailyUsed: number
  dailyLimit: number
  hourlyUsed?: number
  hourlyLimit?: number
  burstUsed: number
  burstLimit: number
  periodReset: string
  costEstimate: number
  trend: "up" | "down" | "stable"
}

interface UsageDashboardProps {
  teacherId: string
}

export function UsageDashboard({ teacherId }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsageStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/usage?teacher_id=${teacherId}`)
      if (!res.ok) {
        throw new Error("Failed to load usage statistics")
      }
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage statistics")
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    loadUsageStats()
  }, [loadUsageStats])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-lg" />
        <div className="h-32 bg-slate-100 rounded-lg" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Unable to load usage statistics. Please try again later."}
        </AlertDescription>
      </Alert>
    )
  }

  const dailyPercentage = (stats.dailyUsed / stats.dailyLimit) * 100
  const hourlyPercentage = stats.hourlyUsed 
    ? (stats.hourlyUsed / (stats.hourlyLimit || 100)) * 100 
    : 0

  const getAlertLevel = (percentage: number): "default" | "warning" | "destructive" => {
    if (percentage >= 95) return "destructive"
    if (percentage >= 80) return "warning"
    return "default"
  }

  const formatResetTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Alert for high usage */}
      {dailyPercentage >= 80 && (
        <Alert variant={dailyPercentage >= 95 ? "destructive" : "warning"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {dailyPercentage >= 95 ? "Usage Limit Critical" : "High Usage Warning"}
          </AlertTitle>
          <AlertDescription>
            {dailyPercentage >= 95
              ? "You have reached 95% of your daily limit. Workflow executions may be blocked. Contact your administrator to increase your quota."
              : "You are approaching your daily execution limit. Consider spacing out your workflow runs."}
          </AlertDescription>
        </Alert>
      )}

      {/* Daily Usage */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Daily Executions
            </CardTitle>
            <Badge variant={getAlertLevel(dailyPercentage) === "default" ? "secondary" : getAlertLevel(dailyPercentage) === "warning" ? "outline" : "destructive"}>
              {Math.round(dailyPercentage)}%
            </Badge>
          </div>
          <CardDescription>
            Workflow runs in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Used</span>
              <span className="font-medium">{stats.dailyUsed} / {stats.dailyLimit}</span>
            </div>
            <Progress 
              value={dailyPercentage} 
              className={`h-2 ${dailyPercentage >= 95 ? "[&>div]:bg-red-500" : dailyPercentage >= 80 ? "[&>div]:bg-yellow-500" : ""}`}
            />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              Resets: {formatResetTime(stats.periodReset)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Usage (if available) */}
      {stats.hourlyUsed !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Classroom Hourly
              </CardTitle>
              <Badge variant="secondary">
                {Math.round(hourlyPercentage)}%
              </Badge>
            </div>
            <CardDescription>
              Executions in current classroom this hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Used</span>
                <span className="font-medium">{stats.hourlyUsed} / {stats.hourlyLimit || 100}</span>
              </div>
              <Progress value={hourlyPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Burst Limit Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            Burst Rate
          </CardTitle>
          <CardDescription>
            Executions per minute (prevents rapid-fire requests)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Recent</span>
              <span className="font-medium">{stats.burstUsed} / {stats.burstLimit}</span>
            </div>
            <Progress 
              value={(stats.burstUsed / stats.burstLimit) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Estimated Cost */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Estimated Cost
          </CardTitle>
          <CardDescription>
            AI API usage cost for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              ${stats.costEstimate.toFixed(2)}
            </span>
            <span className="text-sm text-slate-500">
              (~${stats.dailyUsed > 0 ? (stats.costEstimate / stats.dailyUsed).toFixed(3) : "0.000"} per execution)
            </span>
          </div>
          {stats.trend === "up" && (
            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Usage trending higher than usual
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
