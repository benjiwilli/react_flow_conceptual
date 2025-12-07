/**
 * Assessments API Route
 * Store and retrieve assessment results with Supabase integration
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"
import type { AssessmentResult } from "@/lib/types/assessment"
import { logger } from "@/lib/logger"

// In-memory store for demo mode when Supabase is not configured
const mockAssessments: AssessmentResult[] = []

// ============================================================================
// ELPA Band Calculation
// ============================================================================

type ELPABand = 1 | 2 | 3 | 4 | 5

/**
 * Calculate ELPA band based on assessment score and type.
 * 
 * ELPA Levels (Alberta English Language Proficiency Assessment):
 * Level 1: Beginning (0-20%)
 * Level 2: Developing (21-40%)
 * Level 3: Expanding (41-60%)
 * Level 4: Bridging (61-80%)
 * Level 5: Proficient (81-100%)
 * 
 * Some assessment types may have different thresholds.
 */
function calculateELPABand(
  score: number, 
  maxScore: number, 
  assessmentType: string
): ELPABand {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

  // Adjust thresholds based on assessment type
  // Speaking and writing assessments tend to be more challenging
  const thresholds = getThresholdsForType(assessmentType)

  if (percentage <= thresholds.level1) return 1
  if (percentage <= thresholds.level2) return 2
  if (percentage <= thresholds.level3) return 3
  if (percentage <= thresholds.level4) return 4
  return 5
}

/**
 * Get ELPA threshold percentages for different assessment types.
 * Some assessment types are weighted differently.
 */
function getThresholdsForType(assessmentType: string): {
  level1: number
  level2: number
  level3: number
  level4: number
} {
  switch (assessmentType) {
    // Speaking assessments - slightly lower thresholds (harder for ESL students)
    case "speaking-assessment":
    case "oral-reading-fluency":
      return { level1: 25, level2: 45, level3: 65, level4: 80 }

    // Writing assessments - also adjusted
    case "writing-sample":
      return { level1: 25, level2: 45, level3: 65, level4: 80 }

    // Vocabulary - standard thresholds
    case "vocabulary-quiz":
      return { level1: 20, level2: 40, level3: 60, level4: 80 }

    // Comprehension and listening - standard thresholds
    case "comprehension-check":
    case "listening-comprehension":
    case "math-problem-set":
    default:
      return { level1: 20, level2: 40, level3: 60, level4: 80 }
  }
}

/**
 * Generate recommendations based on ELPA band and assessment type.
 */
function generateRecommendations(
  elpaBand: ELPABand, 
  assessmentType: string
): string[] {
  const recommendations: string[] = []

  // General recommendations by ELPA level
  switch (elpaBand) {
    case 1:
      recommendations.push("Consider additional L1 bridge support for key concepts")
      recommendations.push("Use more visual scaffolding in upcoming activities")
      recommendations.push("Simplify language complexity in content")
      break
    case 2:
      recommendations.push("Continue building vocabulary with translations")
      recommendations.push("Provide sentence starters for responses")
      recommendations.push("Use graphic organizers to support comprehension")
      break
    case 3:
      recommendations.push("Encourage independent reading with support available")
      recommendations.push("Introduce more complex sentence structures")
      recommendations.push("Practice summarizing and inferencing skills")
      break
    case 4:
      recommendations.push("Challenge with grade-level academic vocabulary")
      recommendations.push("Encourage written responses with minimal scaffolding")
      recommendations.push("Introduce cross-curricular connections")
      break
    case 5:
      recommendations.push("Ready for enrichment activities")
      recommendations.push("Can serve as peer support for classmates")
      recommendations.push("Consider advanced vocabulary development")
      break
  }

  // Assessment-specific recommendations
  if (assessmentType === "speaking-assessment" && elpaBand <= 2) {
    recommendations.push("Provide more oral language practice opportunities")
  }
  if (assessmentType === "writing-sample" && elpaBand <= 3) {
    recommendations.push("Use writing templates and sentence frames")
  }

  return recommendations
}

// GET /api/assessments - Get assessments for student/workflow/session
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const sessionId = searchParams.get("sessionId")
  const assessmentType = searchParams.get("type")
  const limit = parseInt(searchParams.get("limit") || "50")

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      let query = supabase
        .from("assessment_results")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(limit)

      if (studentId) {
        query = query.eq("student_id", studentId)
      }
      if (sessionId) {
        query = query.eq("session_id", sessionId)
      }
      if (assessmentType) {
        query = query.eq("assessment_type", assessmentType)
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Map database records to AssessmentResult type
      const assessments: AssessmentResult[] = (data || []).map((r) => ({
        id: r.id,
        assessmentId: r.assessment_type, // Use type as assessment reference
        studentId: r.student_id,
        score: r.score,
        scoreType: "percentage" as const,
        completedAt: new Date(r.recorded_at),
        timeSpentSeconds: (r.details as Record<string, unknown>)?.timeSpentSeconds as number || 0,
        questionResults: (r.details as Record<string, unknown>)?.questionResults as AssessmentResult["questionResults"] || [],
        feedback: (r.details as Record<string, unknown>)?.feedback as string || "",
        recommendations: (r.details as Record<string, unknown>)?.recommendations as string[] || [],
      }))

      // If workflowId filter requested, we need to join with sessions
      // For now, return all assessments and let client filter
      return NextResponse.json({ 
        assessments,
        total: assessments.length,
      })
    }
  }

  // Mock mode - filter in-memory store
  let filtered = [...mockAssessments]
  if (studentId) {
    filtered = filtered.filter((a) => a.studentId === studentId)
  }
  if (assessmentType) {
    filtered = filtered.filter((a) => a.assessmentId === assessmentType)
  }

  return NextResponse.json({ 
    assessments: filtered.slice(0, limit),
    total: filtered.length,
  })
}

// POST /api/assessments - Save assessment result
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.studentId || !body.assessmentType) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, assessmentType" },
        { status: 400 }
      )
    }

    // Calculate ELPA band based on score and assessment type
    const elpaBand = calculateELPABand(
      body.score || 0, 
      body.maxScore || 100, 
      body.assessmentType
    )

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("assessment_results")
          .insert({
            student_id: body.studentId,
            session_id: body.sessionId || null,
            assessment_type: body.assessmentType,
            score: body.score || 0,
            max_score: body.maxScore || 100,
            elpa_band: elpaBand,
            details: {
              questionResults: body.questionResults || [],
              timeSpentSeconds: body.timeSpentSeconds || 0,
              feedback: body.feedback || "",
              recommendations: body.recommendations || [],
              scaffoldingUsed: body.scaffoldingUsed || [],
              elpaBand,
              nodeId: body.nodeId,
              workflowId: body.workflowId,
            },
          })
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const result: AssessmentResult = {
          id: data.id,
          assessmentId: data.assessment_type,
          studentId: data.student_id,
          score: data.score,
          scoreType: "percentage",
          completedAt: new Date(data.recorded_at),
          timeSpentSeconds: (data.details as Record<string, unknown>)?.timeSpentSeconds as number || 0,
          questionResults: (data.details as Record<string, unknown>)?.questionResults as AssessmentResult["questionResults"] || [],
          feedback: (data.details as Record<string, unknown>)?.feedback as string || "",
          recommendations: (data.details as Record<string, unknown>)?.recommendations as string[] || [],
        }

        return NextResponse.json({ result, elpaBand }, { status: 201 })
      }
    }

    // Mock mode - store in memory
    const recommendations = body.recommendations?.length > 0 
      ? body.recommendations 
      : generateRecommendations(elpaBand, body.assessmentType)

    const result: AssessmentResult = {
      id: crypto.randomUUID(),
      assessmentId: body.assessmentType,
      studentId: body.studentId,
      score: body.score || 0,
      scoreType: body.scoreType || "percentage",
      completedAt: new Date(),
      timeSpentSeconds: body.timeSpentSeconds || 0,
      questionResults: body.questionResults || [],
      feedback: body.feedback || "",
      recommendations,
    }

    mockAssessments.push(result)

    return NextResponse.json({ result, elpaBand }, { status: 201 })
  } catch (error) {
    logger.error("Assessment save error", error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}

// GET assessment summary for a student
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const action = searchParams.get("action")

  if (action === "summary" && studentId) {
    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("assessment_results")
          .select("*")
          .eq("student_id", studentId)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Calculate summary statistics
        const byType: Record<string, { count: number; avgScore: number; scores: number[] }> = {}
        
        for (const result of data || []) {
          const type = result.assessment_type
          if (!byType[type]) {
            byType[type] = { count: 0, avgScore: 0, scores: [] }
          }
          byType[type].count++
          byType[type].scores.push((result.score / result.max_score) * 100)
        }

        // Calculate averages
        for (const type of Object.keys(byType)) {
          const scores = byType[type].scores
          byType[type].avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
        }

        const totalAssessments = data?.length || 0
        const overallAvg = totalAssessments > 0
          ? (data || []).reduce((acc, r) => acc + (r.score / r.max_score) * 100, 0) / totalAssessments
          : 0

        return NextResponse.json({
          studentId,
          totalAssessments,
          overallAverageScore: Math.round(overallAvg * 10) / 10,
          byType: Object.entries(byType).map(([type, stats]) => ({
            type,
            count: stats.count,
            averageScore: Math.round(stats.avgScore * 10) / 10,
          })),
          recentTrend: calculateTrend(data || []),
        })
      }
    }

    // Mock mode
    const studentAssessments = mockAssessments.filter((a) => a.studentId === studentId)
    const totalAssessments = studentAssessments.length
    const overallAvg = totalAssessments > 0
      ? studentAssessments.reduce((acc, a) => acc + a.score, 0) / totalAssessments
      : 0

    return NextResponse.json({
      studentId,
      totalAssessments,
      overallAverageScore: Math.round(overallAvg * 10) / 10,
      byType: [],
      recentTrend: "stable",
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// Helper to calculate recent performance trend
function calculateTrend(results: Array<{ score: number; max_score: number; recorded_at: string }>): string {
  if (results.length < 3) return "insufficient-data"
  
  // Sort by date, newest first
  const sorted = [...results].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )

  // Compare recent 3 vs previous 3
  const recent = sorted.slice(0, 3)
  const previous = sorted.slice(3, 6)

  if (previous.length < 3) return "insufficient-data"

  const recentAvg = recent.reduce((acc, r) => acc + (r.score / r.max_score), 0) / 3
  const previousAvg = previous.reduce((acc, r) => acc + (r.score / r.max_score), 0) / 3

  const diff = recentAvg - previousAvg
  if (diff > 0.1) return "improving"
  if (diff < -0.1) return "declining"
  return "stable"
}
