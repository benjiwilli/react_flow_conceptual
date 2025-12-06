/**
 * Progress API Route
 * Store and retrieve student progress data
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"

interface ProgressRecord {
  id: string
  sessionId: string
  studentId: string
  workflowId: string
  nodeExecutions: unknown[]
  completedAt: string
  score?: number
  timeSpentSeconds?: number
  createdAt: string
}

// In-memory store for when Supabase is not configured
const progressStore = new Map<string, ProgressRecord>()

// GET /api/progress - Get progress for a student
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const workflowId = searchParams.get("workflowId")
  const sessionId = searchParams.get("sessionId")

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      let query = supabase.from("progress_records").select("*")
      
      if (studentId) {
        query = query.eq("student_id", studentId)
      }
      if (workflowId) {
        query = query.eq("workflow_id", workflowId)
      }
      if (sessionId) {
        query = query.eq("session_id", sessionId)
      }
      
      const { data, error } = await query.order("created_at", { ascending: false })
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      const records: ProgressRecord[] = (data || []).map((r) => ({
        id: r.id,
        sessionId: r.session_id,
        studentId: r.student_id,
        workflowId: r.workflow_id,
        nodeExecutions: r.node_executions || [],
        completedAt: r.completed_at,
        score: r.score,
        timeSpentSeconds: r.time_spent_seconds,
        createdAt: r.created_at,
      }))
      
      return NextResponse.json({ progress: records })
    }
  }

  // Fall back to in-memory store
  const records = Array.from(progressStore.values()).filter((r) => {
    if (studentId && r.studentId !== studentId) return false
    if (workflowId && r.workflowId !== workflowId) return false
    if (sessionId && r.sessionId !== sessionId) return false
    return true
  })

  return NextResponse.json({ progress: records })
}

// POST /api/progress - Save progress record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const record: ProgressRecord = {
      id: crypto.randomUUID(),
      sessionId: body.sessionId,
      studentId: body.studentId,
      workflowId: body.workflowId,
      nodeExecutions: body.nodeExecutions || [],
      completedAt: body.completedAt || new Date().toISOString(),
      score: body.score,
      timeSpentSeconds: body.timeSpentSeconds,
      createdAt: new Date().toISOString(),
    }

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("progress_records")
          .insert({
            session_id: record.sessionId,
            student_id: record.studentId,
            workflow_id: record.workflowId,
            node_executions: record.nodeExecutions,
            completed_at: record.completedAt,
            score: record.score,
            time_spent_seconds: record.timeSpentSeconds,
          })
          .select()
          .single()
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ 
          progress: {
            id: data.id,
            sessionId: data.session_id,
            studentId: data.student_id,
            workflowId: data.workflow_id,
            nodeExecutions: data.node_executions,
            completedAt: data.completed_at,
            score: data.score,
            timeSpentSeconds: data.time_spent_seconds,
            createdAt: data.created_at,
          }
        }, { status: 201 })
      }
    }

    // Fall back to in-memory store
    progressStore.set(record.id, record)

    return NextResponse.json({ progress: record }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save progress" },
      { status: 500 }
    )
  }
}

// GET /api/progress/summary - Get aggregated progress summary for a student
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 })
  }

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      const { data, error } = await supabase
        .from("progress_records")
        .select("*")
        .eq("student_id", studentId)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const records = data || []
      const summary = {
        totalSessions: records.length,
        totalTimeSeconds: records.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0),
        averageScore: records.length > 0 
          ? records.reduce((sum, r) => sum + (r.score || 0), 0) / records.length 
          : 0,
        workflowsCompleted: [...new Set(records.map((r) => r.workflow_id))].length,
        recentActivity: records.slice(0, 5).map((r) => ({
          workflowId: r.workflow_id,
          completedAt: r.completed_at,
          score: r.score,
        })),
      }

      return NextResponse.json({ summary })
    }
  }

  // Fall back to in-memory calculation
  const records = Array.from(progressStore.values()).filter((r) => r.studentId === studentId)
  
  const summary = {
    totalSessions: records.length,
    totalTimeSeconds: records.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0),
    averageScore: records.length > 0 
      ? records.reduce((sum, r) => sum + (r.score || 0), 0) / records.length 
      : 0,
    workflowsCompleted: [...new Set(records.map((r) => r.workflowId))].length,
    recentActivity: records.slice(0, 5).map((r) => ({
      workflowId: r.workflowId,
      completedAt: r.completedAt,
      score: r.score,
    })),
  }

  return NextResponse.json({ summary })
}
