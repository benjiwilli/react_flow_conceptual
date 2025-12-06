"use client"

/**
 * Assessment Breakdown Component
 * Displays assessment analytics including ELPA band distribution and trends
 */

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// ============================================================================
// Types
// ============================================================================

interface ClassAssessmentData {
  totalAssessments: number
  averageScore: number
  elpaBandDistribution: Record<1 | 2 | 3 | 4 | 5, number>
  byType: Array<{
    type: string
    count: number
    averageScore: number
    passRate: number
  }>
  recentAssessments: Array<{
    id: string
    studentName: string
    type: string
    score: number
    elpaBand: number
    completedAt: string
  }>
  strugglingStudents: Array<{
    studentId: string
    studentName: string
    averageScore: number
    assessmentCount: number
    trend: string
  }>
}

interface AssessmentBreakdownProps {
  classId: string
  data?: ClassAssessmentData
}

// ============================================================================
// Main Component
// ============================================================================

export function AssessmentBreakdown({ classId, data }: AssessmentBreakdownProps) {
  const [assessmentData, setAssessmentData] = useState<ClassAssessmentData | null>(data || null)
  const [isLoading, setIsLoading] = useState(!data)

  useEffect(() => {
    if (!data) {
      fetchAssessmentData()
    }
  }, [classId, data])

  const fetchAssessmentData = async () => {
    setIsLoading(true)
    try {
      // In production, fetch from API
      // const response = await fetch(`/api/classroom/${classId}/assessments`)
      // const data = await response.json()
      
      // Mock data for demonstration
      setAssessmentData(generateMockAssessmentData())
    } catch (error) {
      console.error("Failed to fetch assessment data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No assessment data available yet</p>
        <p className="text-sm mt-2">Assessments will appear here as students complete activities</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Assessments"
          value={assessmentData.totalAssessments.toString()}
          subtitle="Completed this session"
          icon={FileText}
        />
        <SummaryCard
          title="Average Score"
          value={`${Math.round(assessmentData.averageScore)}%`}
          subtitle="Across all types"
          icon={Target}
        />
        <SummaryCard
          title="Pass Rate"
          value={`${calculateOverallPassRate(assessmentData.byType)}%`}
          subtitle="Score ≥ 70%"
          icon={CheckCircle2}
        />
        <SummaryCard
          title="Need Support"
          value={assessmentData.strugglingStudents.length.toString()}
          subtitle="Below expectations"
          icon={AlertCircle}
          variant={assessmentData.strugglingStudents.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ELPA Band Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessment ELPA Bands</CardTitle>
            <CardDescription>Performance distribution by proficiency level</CardDescription>
          </CardHeader>
          <CardContent>
            <ELPABandChart distribution={assessmentData.elpaBandDistribution} />
          </CardContent>
        </Card>

        {/* Assessment by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Type</CardTitle>
            <CardDescription>Average scores per assessment category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessmentData.byType.map((item) => (
                <AssessmentTypeRow key={item.type} data={item} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Assessments</CardTitle>
            <CardDescription>Latest completed assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessmentData.recentAssessments.slice(0, 5).map((assessment) => (
                <RecentAssessmentRow key={assessment.id} assessment={assessment} />
              ))}
              {assessmentData.recentAssessments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent assessments
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Needing Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Students Needing Support
            </CardTitle>
            <CardDescription>Based on assessment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessmentData.strugglingStudents.map((student) => (
                <StrugglingStudentRow key={student.studentId} student={student} />
              ))}
              {assessmentData.strugglingStudents.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">
                    All students are performing well!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// Sub-Components
// ============================================================================

interface SummaryCardProps {
  title: string
  value: string
  subtitle: string
  icon: typeof FileText
  variant?: "default" | "warning"
}

function SummaryCard({ title, value, subtitle, icon: Icon, variant = "default" }: SummaryCardProps) {
  return (
    <Card className={cn(variant === "warning" && "border-amber-200 bg-amber-50")}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            variant === "warning" ? "bg-amber-200" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === "warning" ? "text-amber-700" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ELPABandChartProps {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

function ELPABandChart({ distribution }: ELPABandChartProps) {
  const bands = [1, 2, 3, 4, 5] as const
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)

  const bandInfo: Record<number, { name: string; color: string; description: string }> = {
    1: { name: "Beginning", color: "bg-red-500", description: "Needs intensive support" },
    2: { name: "Developing", color: "bg-orange-500", description: "Building foundations" },
    3: { name: "Expanding", color: "bg-yellow-500", description: "Growing independence" },
    4: { name: "Bridging", color: "bg-green-500", description: "Near proficiency" },
    5: { name: "Proficient", color: "bg-blue-500", description: "Grade-level ready" },
  }

  return (
    <div className="space-y-3">
      {bands.map((band) => {
        const count = distribution[band] || 0
        const percentage = total > 0 ? (count / total) * 100 : 0
        const info = bandInfo[band]

        return (
          <div key={band} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", info.color)} />
                <span className="font-medium">Level {band}: {info.name}</span>
              </div>
              <span className="text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )
      })}

      {total === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No ELPA band data available yet
        </p>
      )}
    </div>
  )
}

interface AssessmentTypeRowProps {
  data: {
    type: string
    count: number
    averageScore: number
    passRate: number
  }
}

function AssessmentTypeRow({ data }: AssessmentTypeRowProps) {
  const typeLabels: Record<string, string> = {
    "comprehension-check": "Comprehension",
    "vocabulary-quiz": "Vocabulary",
    "speaking-assessment": "Speaking",
    "writing-sample": "Writing",
    "math-problem-set": "Math",
    "listening-comprehension": "Listening",
  }

  const label = typeLabels[data.type] || data.type

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">{data.count} taken</span>
        </div>
        <Progress value={data.averageScore} className="h-2" />
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold">{Math.round(data.averageScore)}%</p>
        <p className="text-xs text-muted-foreground">{Math.round(data.passRate)}% pass</p>
      </div>
    </div>
  )
}

interface RecentAssessmentRowProps {
  assessment: {
    id: string
    studentName: string
    type: string
    score: number
    elpaBand: number
    completedAt: string
  }
}

function RecentAssessmentRow({ assessment }: RecentAssessmentRowProps) {
  const typeLabels: Record<string, string> = {
    "comprehension-check": "Comprehension",
    "vocabulary-quiz": "Vocabulary",
    "speaking-assessment": "Speaking",
    "writing-sample": "Writing",
    "math-problem-set": "Math",
  }

  const label = typeLabels[assessment.type] || assessment.type
  const timeAgo = getTimeAgo(new Date(assessment.completedAt))

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{assessment.studentName}</p>
        <p className="text-xs text-muted-foreground">{label} • {timeAgo}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={assessment.score >= 70 ? "default" : "secondary"}>
          {assessment.score}%
        </Badge>
        <Badge variant="outline" className="text-xs">
          L{assessment.elpaBand}
        </Badge>
      </div>
    </div>
  )
}

interface StrugglingStudentRowProps {
  student: {
    studentId: string
    studentName: string
    averageScore: number
    assessmentCount: number
    trend: string
  }
}

function StrugglingStudentRow({ student }: StrugglingStudentRowProps) {
  const TrendIcon = student.trend === "improving" ? TrendingUp : 
                    student.trend === "declining" ? TrendingDown : Minus
  const trendColor = student.trend === "improving" ? "text-green-500" : 
                     student.trend === "declining" ? "text-red-500" : "text-gray-400"

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg border border-amber-200">
      <div>
        <p className="text-sm font-medium">{student.studentName}</p>
        <p className="text-xs text-muted-foreground">
          {student.assessmentCount} assessments
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{Math.round(student.averageScore)}%</span>
        <TrendIcon className={cn("h-4 w-4", trendColor)} />
      </div>
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function calculateOverallPassRate(byType: Array<{ passRate: number; count: number }>): number {
  if (byType.length === 0) return 0
  const totalCount = byType.reduce((sum, t) => sum + t.count, 0)
  if (totalCount === 0) return 0
  const weightedSum = byType.reduce((sum, t) => sum + (t.passRate * t.count), 0)
  return Math.round(weightedSum / totalCount)
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function generateMockAssessmentData(): ClassAssessmentData {
  return {
    totalAssessments: 47,
    averageScore: 72,
    elpaBandDistribution: {
      1: 3,
      2: 12,
      3: 18,
      4: 10,
      5: 4,
    },
    byType: [
      { type: "comprehension-check", count: 20, averageScore: 68, passRate: 65 },
      { type: "vocabulary-quiz", count: 15, averageScore: 78, passRate: 80 },
      { type: "math-problem-set", count: 12, averageScore: 71, passRate: 67 },
    ],
    recentAssessments: [
      { id: "1", studentName: "Wei Chen", type: "comprehension-check", score: 95, elpaBand: 5, completedAt: new Date(Date.now() - 5 * 60000).toISOString() },
      { id: "2", studentName: "Ahmed Hassan", type: "vocabulary-quiz", score: 80, elpaBand: 3, completedAt: new Date(Date.now() - 12 * 60000).toISOString() },
      { id: "3", studentName: "Priya Patel", type: "comprehension-check", score: 85, elpaBand: 4, completedAt: new Date(Date.now() - 20 * 60000).toISOString() },
      { id: "4", studentName: "Sofia Martinez", type: "math-problem-set", score: 55, elpaBand: 2, completedAt: new Date(Date.now() - 35 * 60000).toISOString() },
    ],
    strugglingStudents: [
      { studentId: "3", studentName: "Sofia Martinez", averageScore: 52, assessmentCount: 4, trend: "stable" },
      { studentId: "5", studentName: "Dmitri Volkov", averageScore: 45, assessmentCount: 3, trend: "declining" },
    ],
  }
}

export default AssessmentBreakdown
