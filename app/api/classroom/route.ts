/**
 * Classroom API Route
 * Real-time classroom management and student activity tracking
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"

interface Classroom {
  id: string
  name: string
  teacherId: string
  gradeLevel: string
  studentIds: string[]
  activeWorkflowId?: string
  createdAt: string
  updatedAt: string
}

interface StudentActivity {
  studentId: string
  status: "idle" | "working" | "completed" | "struggling"
  currentWorkflowId?: string
  currentNodeId?: string
  progress: number
  lastActivityAt: string
}

// In-memory stores for when Supabase is not configured
const classroomStore = new Map<string, Classroom>()
const activityStore = new Map<string, StudentActivity>()

// GET /api/classroom - List classrooms for a teacher
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get("teacherId")
  const classId = searchParams.get("classId")

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      if (classId) {
        // Get single classroom with student activities
        const { data: classroom, error: classError } = await supabase
          .from("classrooms")
          .select("*")
          .eq("id", classId)
          .single()

        if (classError) {
          return NextResponse.json({ error: classError.message }, { status: 500 })
        }

        // Get students in this classroom
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id, first_name, last_name, elpa_level")
          .in("id", classroom.student_ids || [])

        if (studentsError) {
          return NextResponse.json({ error: studentsError.message }, { status: 500 })
        }

        // Get recent activity for each student
        const { data: activities } = await supabase
          .from("learning_sessions")
          .select("student_id, workflow_id, status, progress, updated_at")
          .in("student_id", classroom.student_ids || [])
          .order("updated_at", { ascending: false })

        const studentActivities = (students || []).map((s) => {
          const activity = activities?.find((a) => a.student_id === s.id)
          return {
            studentId: s.id,
            studentName: `${s.first_name} ${s.last_name}`,
            elpaLevel: s.elpa_level,
            status: activity?.status || "idle",
            progress: activity?.progress || 0,
            currentWorkflowId: activity?.workflow_id,
            lastActivityAt: activity?.updated_at || null,
          }
        })

        return NextResponse.json({
          classroom: {
            id: classroom.id,
            name: classroom.name,
            teacherId: classroom.teacher_id,
            gradeLevel: classroom.grade_level,
            studentIds: classroom.student_ids,
            activeWorkflowId: classroom.active_workflow_id,
            createdAt: classroom.created_at,
            updatedAt: classroom.updated_at,
          },
          studentActivities,
        })
      }

      // List all classrooms for teacher
      let query = supabase.from("classrooms").select("*")
      
      if (teacherId) {
        query = query.eq("teacher_id", teacherId)
      }
      
      const { data, error } = await query.order("created_at", { ascending: false })
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      const classrooms: Classroom[] = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        teacherId: c.teacher_id,
        gradeLevel: c.grade_level,
        studentIds: c.student_ids || [],
        activeWorkflowId: c.active_workflow_id,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))
      
      return NextResponse.json({ classrooms })
    }
  }

  // Fall back to in-memory store
  if (classId) {
    const classroom = classroomStore.get(classId)
    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    const studentActivities = classroom.studentIds.map((studentId) => {
      const activity = activityStore.get(studentId)
      return {
        studentId,
        studentName: `Student ${studentId.slice(-4)}`,
        elpaLevel: 3,
        status: activity?.status || "idle",
        progress: activity?.progress || 0,
        currentWorkflowId: activity?.currentWorkflowId,
        lastActivityAt: activity?.lastActivityAt || null,
      }
    })

    return NextResponse.json({ classroom, studentActivities })
  }

  const classrooms = Array.from(classroomStore.values()).filter(
    (c) => !teacherId || c.teacherId === teacherId
  )

  return NextResponse.json({ classrooms })
}

// POST /api/classroom - Create a new classroom
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const classroom: Classroom = {
      id: crypto.randomUUID(),
      name: body.name,
      teacherId: body.teacherId,
      gradeLevel: body.gradeLevel || "4",
      studentIds: body.studentIds || [],
      activeWorkflowId: body.activeWorkflowId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("classrooms")
          .insert({
            name: classroom.name,
            teacher_id: classroom.teacherId,
            grade_level: classroom.gradeLevel,
            student_ids: classroom.studentIds,
            active_workflow_id: classroom.activeWorkflowId,
          })
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
          classroom: {
            id: data.id,
            name: data.name,
            teacherId: data.teacher_id,
            gradeLevel: data.grade_level,
            studentIds: data.student_ids,
            activeWorkflowId: data.active_workflow_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        }, { status: 201 })
      }
    }

    // Fall back to in-memory store
    classroomStore.set(classroom.id, classroom)

    return NextResponse.json({ classroom }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create classroom" },
      { status: 500 }
    )
  }
}

// PATCH /api/classroom - Update student activity (for real-time tracking)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { studentId, status, currentWorkflowId, currentNodeId, progress } = body

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 })
    }

    const activity: StudentActivity = {
      studentId,
      status: status || "working",
      currentWorkflowId,
      currentNodeId,
      progress: progress || 0,
      lastActivityAt: new Date().toISOString(),
    }

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        // Upsert into learning_sessions or a dedicated activity tracking table
        const { error } = await supabase
          .from("learning_sessions")
          .upsert({
            student_id: studentId,
            workflow_id: currentWorkflowId,
            status,
            progress,
            current_node_id: currentNodeId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "student_id,workflow_id",
          })

        if (error) {
          // Upsert may fail if table/constraint doesn't exist yet
          // This is non-critical - activity tracking is best-effort
        }

        return NextResponse.json({ activity })
      }
    }

    // Fall back to in-memory store
    activityStore.set(studentId, activity)

    return NextResponse.json({ activity })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update activity" },
      { status: 500 }
    )
  }
}

// DELETE /api/classroom - Delete a classroom
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId")

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 })
  }

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      const { error } = await supabase
        .from("classrooms")
        .delete()
        .eq("id", classId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
  }

  // Fall back to in-memory store
  classroomStore.delete(classId)

  return NextResponse.json({ success: true })
}
