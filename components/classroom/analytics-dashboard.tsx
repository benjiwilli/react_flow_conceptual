"use client"

/**
 * Analytics Dashboard Component
 * Learning analytics and insights for teachers
 */

import { useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Target,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { ELPALevel } from "@/lib/types/student"

// ============================================================================
// Types
// ============================================================================

interface ClassMetrics {
  totalStudents: number
  activeStudents: number
  completionRate: number
  averageScore: number
  averageTimeMinutes: number
  strugglingCount: number
  elpaDistribution: Record<ELPALevel, number>
  topChallenges: { topic: string; count: number; percentage: number }[]
  vocabularyMastery: { word: string; masteryRate: number }[]
  recentTrends: {
    scoreChange: number
    completionChange: number
    timeChange: number
  }
}

interface StudentInsight {
  studentId: string
  studentName: string
  insight: string
  type: "success" | "concern" | "suggestion"
  priority: "high" | "medium" | "low"
}

interface AnalyticsDashboardProps {
  metrics: ClassMetrics
  insights: StudentInsight[]
  sessionDuration?: number // minutes
}

// ============================================================================
// Main Component
// ============================================================================

export function AnalyticsDashboard({
  metrics,
  insights,
  sessionDuration = 0,
}: AnalyticsDashboardProps) {
  // Sort insights by priority
  const sortedInsights = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return [...insights].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [insights])

  // High-priority insights count
  const urgentInsights = insights.filter((i) => i.priority === "high")

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Students Active"
          value={`${metrics.activeStudents}/${metrics.totalStudents}`}
          subtitle={`${Math.round((metrics.activeStudents / metrics.totalStudents) * 100)}% participation`}
          icon={Users}
          trend={null}
        />
        <MetricCard
          title="Completion Rate"
          value={`${Math.round(metrics.completionRate)}%`}
          subtitle={`${metrics.recentTrends.completionChange > 0 ? "+" : ""}${metrics.recentTrends.completionChange}% from last session`}
          icon={CheckCircle2}
          trend={metrics.recentTrends.completionChange}
        />
        <MetricCard
          title="Average Score"
          value={`${Math.round(metrics.averageScore)}%`}
          subtitle={`${metrics.recentTrends.scoreChange > 0 ? "+" : ""}${metrics.recentTrends.scoreChange}% from last session`}
          icon={Target}
          trend={metrics.recentTrends.scoreChange}
        />
        <MetricCard
          title="Avg. Time"
          value={`${metrics.averageTimeMinutes} min`}
          subtitle={sessionDuration > 0 ? `Session: ${sessionDuration} min` : "Per activity"}
          icon={Clock}
          trend={null}
        />
      </div>

      {/* Urgent Alerts */}
      {urgentInsights.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Needs Attention ({urgentInsights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentInsights.slice(0, 3).map((insight) => (
                <InsightItem key={insight.studentId} insight={insight} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ELPA Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ELPA Level Distribution</CardTitle>
            <CardDescription>Students by proficiency level</CardDescription>
          </CardHeader>
          <CardContent>
            <ELPADistributionChart distribution={metrics.elpaDistribution} total={metrics.totalStudents} />
          </CardContent>
        </Card>

        {/* Top Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Challenges</CardTitle>
            <CardDescription>Topics students are struggling with</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topChallenges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No significant challenges detected yet
              </p>
            ) : (
              <div className="space-y-4">
                {metrics.topChallenges.slice(0, 5).map((challenge, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{challenge.topic}</span>
                      <span className="text-muted-foreground">{challenge.count} students</span>
                    </div>
                    <Progress value={challenge.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vocabulary Mastery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vocabulary Mastery</CardTitle>
            <CardDescription>Key terms from this session</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.vocabularyMastery.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No vocabulary data available yet
              </p>
            ) : (
              <div className="space-y-3">
                {metrics.vocabularyMastery.slice(0, 6).map((vocab, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24 truncate">{vocab.word}</span>
                    <Progress value={vocab.masteryRate} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {vocab.masteryRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              AI Insights
            </CardTitle>
            <CardDescription>Personalized observations and suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedInsights.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Insights will appear as students work
              </p>
            ) : (
              <div className="space-y-3">
                {sortedInsights.slice(0, 5).map((insight) => (
                  <InsightItem key={insight.studentId} insight={insight} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// Sub-Components
// ============================================================================

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: typeof Users
  trend: number | null
}

function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {trend !== null && (
                <>
                  {trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : trend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                </>
              )}
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ELPADistributionChartProps {
  distribution: Record<ELPALevel, number>
  total: number
}

function ELPADistributionChart({ distribution, total }: ELPADistributionChartProps) {
  const levels: ELPALevel[] = [1, 2, 3, 4, 5]
  const levelNames: Record<ELPALevel, string> = {
    1: "Beginning",
    2: "Developing",
    3: "Expanding",
    4: "Bridging",
    5: "Proficient",
  }
  const levelColors: Record<ELPALevel, string> = {
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-green-500",
    5: "bg-blue-500",
  }

  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const count = distribution[level] || 0
        const percentage = total > 0 ? (count / total) * 100 : 0

        return (
          <div key={level} className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", levelColors[level])} />
              <span className="text-xs text-muted-foreground">L{level}</span>
            </div>
            <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", levelColors[level])}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium w-8 text-right">{count}</span>
          </div>
        )
      })}

      {/* Legend */}
      <div className="pt-3 border-t flex flex-wrap gap-x-4 gap-y-1">
        {levels.map((level) => (
          <div key={level} className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={cn("h-2 w-2 rounded-full", levelColors[level])} />
            <span>{levelNames[level]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface InsightItemProps {
  insight: StudentInsight
}

function InsightItem({ insight }: InsightItemProps) {
  const typeConfig = {
    success: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: CheckCircle2 },
    concern: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: AlertTriangle },
    suggestion: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Lightbulb },
  }

  const config = typeConfig[insight.type]
  const Icon = config.icon

  return (
    <div className={cn("p-3 rounded-lg border flex items-start gap-3", config.bg)}>
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.text)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", config.text)}>{insight.studentName}</p>
        <p className="text-sm text-muted-foreground">{insight.insight}</p>
      </div>
      {insight.priority === "high" && (
        <Badge variant="destructive" className="shrink-0">Urgent</Badge>
      )}
    </div>
  )
}

export default AnalyticsDashboard
