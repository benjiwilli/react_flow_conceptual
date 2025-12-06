/**
 * useClassroomRealtime Hook
 * Provides real-time updates for classroom student activity via Supabase Realtime
 */

"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Types for real-time student status
export interface RealtimeStudentStatus {
  studentId: string
  sessionId?: string
  workflowId?: string
  status: "idle" | "working" | "completed" | "struggling" | "needs-help"
  currentNodeId?: string
  currentNodeName?: string
  progress: number // 0-100
  lastActivity: Date
  score?: number
  timeSpentSeconds: number
  needsAttention: boolean
  attentionReason?: string
}

export interface ClassroomRealtimeState {
  students: Map<string, RealtimeStudentStatus>
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
}

export interface UseClassroomRealtimeOptions {
  classroomId: string
  onStudentUpdate?: (student: RealtimeStudentStatus) => void
  onStudentJoin?: (studentId: string) => void
  onStudentLeave?: (studentId: string) => void
  onAlert?: (alert: { type: string; studentId: string; message: string }) => void
  pollIntervalMs?: number // Fallback polling interval when Realtime not available
}

export function useClassroomRealtime(options: UseClassroomRealtimeOptions) {
  const {
    classroomId,
    onStudentUpdate,
    onStudentJoin,
    onStudentLeave,
    onAlert,
    pollIntervalMs = 5000,
  } = options

  const [state, setState] = useState<ClassroomRealtimeState>({
    students: new Map(),
    isConnected: false,
    lastUpdate: null,
    error: null,
  })

  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update a single student's status
  const updateStudent = useCallback(
    (studentStatus: RealtimeStudentStatus) => {
      setState((prev) => {
        const newStudents = new Map(prev.students)
        newStudents.set(studentStatus.studentId, studentStatus)
        return {
          ...prev,
          students: newStudents,
          lastUpdate: new Date(),
        }
      })
      onStudentUpdate?.(studentStatus)

      // Check if student needs attention and trigger alert
      if (studentStatus.needsAttention && onAlert) {
        onAlert({
          type: studentStatus.status,
          studentId: studentStatus.studentId,
          message: studentStatus.attentionReason || "Student needs attention",
        })
      }
    },
    [onStudentUpdate, onAlert]
  )

  // Remove a student from tracking
  const removeStudent = useCallback(
    (studentId: string) => {
      setState((prev) => {
        const newStudents = new Map(prev.students)
        newStudents.delete(studentId)
        return {
          ...prev,
          students: newStudents,
          lastUpdate: new Date(),
        }
      })
      onStudentLeave?.(studentId)
    },
    [onStudentLeave]
  )

  // Fetch current classroom state via API
  const fetchClassroomState = useCallback(async () => {
    try {
      const response = await fetch(`/api/classroom?classroomId=${classroomId}`)
      if (!response.ok) throw new Error("Failed to fetch classroom state")

      const data = await response.json()

      // Update all students from API response
      if (data.students) {
        const newStudents = new Map<string, RealtimeStudentStatus>()
        for (const student of data.students) {
          const status: RealtimeStudentStatus = {
            studentId: student.id,
            sessionId: student.currentSession?.id,
            workflowId: student.currentSession?.workflowId,
            status: student.activityStatus || "idle",
            currentNodeId: student.currentSession?.currentNodeId,
            currentNodeName: student.currentSession?.currentNodeName,
            progress: student.currentSession?.progress || 0,
            lastActivity: new Date(student.lastActivity || Date.now()),
            score: student.currentSession?.score,
            timeSpentSeconds: student.currentSession?.timeSpentSeconds || 0,
            needsAttention: student.needsAttention || false,
            attentionReason: student.attentionReason,
          }
          newStudents.set(student.id, status)
        }

        setState((prev) => ({
          ...prev,
          students: newStudents,
          lastUpdate: new Date(),
          error: null,
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
      }))
    }
  }, [classroomId])

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Fall back to polling when Supabase not configured
      // (Development info - no action needed in production)
      fetchClassroomState()
      pollIntervalRef.current = setInterval(fetchClassroomState, pollIntervalMs)

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }

    // Subscribe to learning_sessions table changes for this classroom's students
    const channel = supabase
      .channel(`classroom:${classroomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "learning_sessions",
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === "INSERT" || eventType === "UPDATE") {
            const record = newRecord as Record<string, unknown>
            const status: RealtimeStudentStatus = {
              studentId: record.student_id as string,
              sessionId: record.id as string,
              workflowId: record.workflow_id as string,
              status: mapSessionStatus(record.status as string),
              currentNodeId: record.current_node_id as string | undefined,
              progress: calculateProgress(record),
              lastActivity: new Date(),
              timeSpentSeconds: record.duration_seconds as number || 0,
              needsAttention: shouldFlagForAttention(record),
              attentionReason: getAttentionReason(record),
            }

            updateStudent(status)

            if (eventType === "INSERT") {
              onStudentJoin?.(status.studentId)
            }
          } else if (eventType === "DELETE") {
            const record = oldRecord as Record<string, unknown>
            removeStudent(record.student_id as string)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress_records",
        },
        (payload) => {
          // Update progress when new records are added
          if (payload.eventType === "INSERT") {
            const record = payload.new as Record<string, unknown>
            const studentId = record.student_id as string

            setState((prev) => {
              const existingStudent = prev.students.get(studentId)
              if (existingStudent) {
                const updated = {
                  ...existingStudent,
                  lastActivity: new Date(),
                  score: record.score as number | undefined ?? existingStudent.score,
                }
                const newStudents = new Map(prev.students)
                newStudents.set(studentId, updated)
                return { ...prev, students: newStudents, lastUpdate: new Date() }
              }
              return prev
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "teacher_alerts",
        },
        (payload) => {
          // Handle new teacher alerts in real-time
          const record = payload.new as Record<string, unknown>
          const studentId = record.student_id as string
          const alertType = record.alert_type as string
          const message = record.message as string

          // Trigger the onAlert callback for new alerts
          if (onAlert) {
            onAlert({
              type: alertType,
              studentId,
              message: message || `Student needs attention: ${alertType}`,
            })
          }

          // Update student status if applicable
          setState((prev) => {
            const existingStudent = prev.students.get(studentId)
            if (existingStudent) {
              const updated = {
                ...existingStudent,
                needsAttention: true,
                attentionReason: message,
                status: alertType === "struggling" ? "struggling" as const : existingStudent.status,
              }
              const newStudents = new Map(prev.students)
              newStudents.set(studentId, updated)
              return { ...prev, students: newStudents, lastUpdate: new Date() }
            }
            return prev
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assessment_results",
        },
        (payload) => {
          // Update student status when assessments complete
          if (payload.eventType === "INSERT") {
            const record = payload.new as Record<string, unknown>
            const studentId = record.student_id as string
            const score = record.score as number

            setState((prev) => {
              const existingStudent = prev.students.get(studentId)
              if (existingStudent) {
                const updated = {
                  ...existingStudent,
                  lastActivity: new Date(),
                  score: score ?? existingStudent.score,
                }
                const newStudents = new Map(prev.students)
                newStudents.set(studentId, updated)
                return { ...prev, students: newStudents, lastUpdate: new Date() }
              }
              return prev
            })
          }
        }
      )
      .subscribe((status) => {
        setState((prev) => ({
          ...prev,
          isConnected: status === "SUBSCRIBED",
          error: status === "CHANNEL_ERROR" ? "Connection error" : prev.error,
        }))

        if (status === "SUBSCRIBED") {
          // Fetch initial state after subscribing
          fetchClassroomState()
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [
    classroomId,
    fetchClassroomState,
    updateStudent,
    removeStudent,
    onStudentJoin,
    onAlert,
    pollIntervalMs,
  ])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchClassroomState()
  }, [fetchClassroomState])

  // Send a message/hint to a student (broadcast via Realtime)
  const sendToStudent = useCallback(
    async (studentId: string, type: "message" | "hint" | "encouragement", content: string) => {
      if (!isSupabaseConfigured || !supabase) {
        // Realtime not available - message queued for demo mode
        return false
      }

      try {
        // Broadcast to student's channel
        await supabase.channel(`student:${studentId}`).send({
          type: "broadcast",
          event: "teacher_message",
          payload: {
            type,
            content,
            timestamp: new Date().toISOString(),
          },
        })
        return true
      } catch (error) {
        console.error("Failed to send message to student:", error)
        return false
      }
    },
    []
  )

  return {
    ...state,
    studentsArray: Array.from(state.students.values()),
    refresh,
    sendToStudent,
  }
}

// Helper functions
function mapSessionStatus(
  dbStatus: string
): RealtimeStudentStatus["status"] {
  switch (dbStatus) {
    case "running":
      return "working"
    case "completed":
      return "completed"
    case "paused":
      return "idle"
    case "failed":
      return "struggling"
    default:
      return "idle"
  }
}

function calculateProgress(record: Record<string, unknown>): number {
  // Try to extract progress from context
  const context = record.context as Record<string, unknown> | null
  if (context?.progress) {
    return context.progress as number
  }
  // Default based on status
  return record.status === "completed" ? 100 : 0
}

function shouldFlagForAttention(record: Record<string, unknown>): boolean {
  const status = record.status as string
  const context = record.context as Record<string, unknown> | null

  // Flag if stuck or failing
  if (status === "failed") return true

  // Flag if long duration without progress
  const duration = record.duration_seconds as number || 0
  const progress = calculateProgress(record)
  if (duration > 600 && progress < 30) return true // 10+ minutes with < 30% progress

  // Flag if help requested
  if (context?.helpRequested) return true

  return false
}

function getAttentionReason(record: Record<string, unknown>): string | undefined {
  const status = record.status as string
  const context = record.context as Record<string, unknown> | null
  const duration = record.duration_seconds as number || 0
  const progress = calculateProgress(record)

  if (status === "failed") return "Session encountered an error"
  if (context?.helpRequested) return "Student requested help"
  if (duration > 600 && progress < 30) return "Making slow progress - may need support"

  return undefined
}
