"use client"

/**
 * Analytics Dashboard Component
 * Learning analytics and insights for teachers
 * 
 * Design Philosophy (Jony Ive Inspired):
 * - Data visualization should be instantly comprehensible
 * - Numbers breathe with generous spacing
 * - Trends communicate at a glance
 * - Insights surface without visual noise
 * - Every metric earns its place on the page
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
    <div className="space-y-8">
      {/* Key Metrics Row - Cards with refined depth and animation */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Students Active"
          value={`${metrics.activeStudents}/${metrics.totalStudents}`}
          subtitle={`${Math.round((metrics.activeStudents / metrics.totalStudents) * 100)}% participation`}
          icon={Users}
          trend={null}
          index={0}
        />
        <MetricCard
          title="Completion Rate"
          value={`${Math.round(metrics.completionRate)}%`}
          subtitle={`${metrics.recentTrends.completionChange > 0 ? "+" : ""}${metrics.recentTrends.completionChange}% from last session`}
          icon={CheckCircle2}
          trend={metrics.recentTrends.completionChange}
          index={1}
        />
        <MetricCard
          title="Average Score"
          value={`${Math.round(metrics.averageScore)}%`}
          subtitle={`${metrics.recentTrends.scoreChange > 0 ? "+" : ""}${metrics.recentTrends.scoreChange}% from last session`}
          icon={Target}
          trend={metrics.recentTrends.scoreChange}
          index={2}
        />
        <MetricCard
          title="Avg. Time"
          value={`${metrics.averageTimeMinutes} min`}
          subtitle={sessionDuration > 0 ? `Session: ${sessionDuration} min` : "Per activity"}
          icon={Clock}
          trend={null}
          index={3}
        />
      </div>

      {/* Urgent Alerts - Refined attention state */}
      {urgentInsights.length > 0 && (
        <Card className="border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50/50 shadow-md animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-amber-800 flex items-center gap-3 text-lg font-semibold tracking-tight">
              <div className="p-2 rounded-xl bg-amber-100/80">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Needs Attention
              <Badge variant="outline" className="ml-auto bg-amber-100 text-amber-700 border-amber-300">
                {urgentInsights.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentInsights.slice(0, 3).map((insight, index) => (
                <div 
                  key={insight.studentId}
                  className="animate-in fade-in-50 slide-in-from-left-2"
                  style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
                >
                  <InsightItem insight={insight} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout - Enhanced cards with depth */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ELPA Distribution */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight">ELPA Level Distribution</CardTitle>
            <CardDescription className="font-light">Students by proficiency level</CardDescription>
          </CardHeader>
          <CardContent>
            <ELPADistributionChart distribution={metrics.elpaDistribution} total={metrics.totalStudents} />
          </CardContent>
        </Card>

        {/* Top Challenges */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight">Learning Challenges</CardTitle>
            <CardDescription className="font-light">Topics students are struggling with</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topChallenges.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3 opacity-50">📊</div>
                <p className="text-sm text-muted-foreground font-light">
                  No significant challenges detected yet
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {metrics.topChallenges.slice(0, 5).map((challenge, i) => (
                  <div 
                    key={i} 
                    className="space-y-2.5 animate-in fade-in-50 slide-in-from-left-2"
                    style={{ animationDelay: `${i * 75}ms`, animationFillMode: "backwards" }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium tracking-tight">{challenge.topic}</span>
                      <span className="text-muted-foreground font-light tabular-nums">{challenge.count} students</span>
                    </div>
                    <Progress 
                      value={challenge.percentage} 
                      className="h-2.5 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-red-400" 
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vocabulary Mastery */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight">Vocabulary Mastery</CardTitle>
            <CardDescription className="font-light">Key terms from this session</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.vocabularyMastery.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3 opacity-50">📚</div>
                <p className="text-sm text-muted-foreground font-light">
                  No vocabulary data available yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.vocabularyMastery.slice(0, 6).map((vocab, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 animate-in fade-in-50 slide-in-from-left-2"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}
                  >
                    <span className="text-sm font-medium w-24 truncate tracking-tight">{vocab.word}</span>
                    <Progress 
                      value={vocab.masteryRate} 
                      className="flex-1 h-2.5 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-green-500" 
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right tabular-nums font-medium">
                      {vocab.masteryRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Insights */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3 font-semibold tracking-tight">
              <div className="p-2 rounded-xl bg-amber-100">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              AI Insights
            </CardTitle>
            <CardDescription className="font-light">Personalized observations and suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedInsights.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3 opacity-50">💡</div>
                <p className="text-sm text-muted-foreground font-light">
                  Insights will appear as students work
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedInsights.slice(0, 5).map((insight, index) => (
                  <div 
                    key={insight.studentId}
                    className="animate-in fade-in-50 slide-in-from-left-2"
                    style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
                  >
                    <InsightItem insight={insight} />
                  </div>
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
  index?: number
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, index = 0 }: MetricCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in-50 slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
    >
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground font-light tracking-tight">{title}</p>
            <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5 pt-0.5">
              {trend !== null && trend !== 0 && (
                <span className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium",
                  trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {trend > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              <p className="text-xs text-muted-foreground font-light">{subtitle}</p>
            </div>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-inner">
            <Icon className="h-7 w-7 text-primary" />
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
  // Refined gradient colors for each ELPA level
  const levelColors: Record<ELPALevel, string> = {
    1: "bg-gradient-to-r from-rose-400 to-red-500",
    2: "bg-gradient-to-r from-orange-400 to-amber-500",
    3: "bg-gradient-to-r from-yellow-400 to-amber-500",
    4: "bg-gradient-to-r from-emerald-400 to-green-500",
    5: "bg-gradient-to-r from-blue-400 to-indigo-500",
  }
  const levelDotColors: Record<ELPALevel, string> = {
    1: "bg-rose-500",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-emerald-500",
    5: "bg-blue-500",
  }

  return (
    <div className="space-y-4">
      {levels.map((level, index) => {
        const count = distribution[level] || 0
        const percentage = total > 0 ? (count / total) * 100 : 0

        return (
          <div 
            key={level} 
            className="flex items-center gap-4 animate-in fade-in-50 slide-in-from-left-2"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
          >
            <div className="w-28 flex items-center gap-2.5">
              <div className={cn("h-3.5 w-3.5 rounded-lg shadow-sm", levelDotColors[level])} />
              <span className="text-sm text-muted-foreground font-medium">L{level}</span>
            </div>
            <div className="flex-1 h-7 bg-muted/50 rounded-xl overflow-hidden">
              <div
                className={cn("h-full transition-all duration-700 ease-out rounded-xl", levelColors[level])}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold w-10 text-right tabular-nums">{count}</span>
          </div>
        )
      })}

      {/* Legend - Refined */}
      <div className="pt-4 mt-2 border-t border-border/50 flex flex-wrap gap-x-5 gap-y-2">
        {levels.map((level) => (
          <div key={level} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn("h-2.5 w-2.5 rounded-md", levelDotColors[level])} />
            <span className="font-light">{levelNames[level]}</span>
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
    success: { 
      bg: "bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200/50 ring-1 ring-emerald-200/30", 
      text: "text-emerald-700", 
      icon: CheckCircle2 
    },
    concern: { 
      bg: "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/50 ring-1 ring-amber-200/30", 
      text: "text-amber-700", 
      icon: AlertTriangle 
    },
    suggestion: { 
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/50 ring-1 ring-blue-200/30", 
      text: "text-blue-700", 
      icon: Lightbulb 
    },
  }

  const config = typeConfig[insight.type]
  const Icon = config.icon

  return (
    <div className={cn(
      "p-4 rounded-xl border flex items-start gap-4 transition-all duration-200 hover:shadow-sm", 
      config.bg
    )}>
      <div className={cn("p-1.5 rounded-lg", insight.type === "success" ? "bg-emerald-100" : insight.type === "concern" ? "bg-amber-100" : "bg-blue-100")}>
        <Icon className={cn("h-4 w-4 shrink-0", config.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold tracking-tight", config.text)}>{insight.studentName}</p>
        <p className="text-sm text-muted-foreground font-light mt-0.5 leading-relaxed">{insight.insight}</p>
      </div>
      {insight.priority === "high" && (
        <Badge variant="destructive" className="shrink-0 shadow-sm">Urgent</Badge>
      )}
    </div>
  )
}

export default AnalyticsDashboard
