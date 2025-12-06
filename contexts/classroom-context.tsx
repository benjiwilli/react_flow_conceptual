/**
 * Classroom Context
 * Manages multi-student classroom sessions
 */

"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { StudentProfile } from "@/lib/types/student"
import type { WorkflowExecution } from "@/lib/types/execution"

interface StudentStatus {
  studentId: string
  student: StudentProfile
  currentWorkflowId?: string
  execution?: WorkflowExecution
  isActive: boolean
  lastActivity: Date
}

interface ClassroomContextValue {
  // Classroom state
  classroomId: string | null
  isClassroomActive: boolean

  // Student management
  students: StudentStatus[]
  activeStudentCount: number

  // Classroom controls
  startClassroom: (classroomId: string) => void
  endClassroom: () => void
  addStudent: (student: StudentProfile) => void
  removeStudent: (studentId: string) => void

  // Workflow assignment
  assignWorkflow: (studentIds: string[], workflowId: string) => void
  assignWorkflowToAll: (workflowId: string) => void

  // Real-time updates
  updateStudentStatus: (studentId: string, updates: Partial<StudentStatus>) => void

  // Analytics
  getClassroomStats: () => ClassroomStats
}

interface ClassroomStats {
  totalStudents: number
  activeStudents: number
  completedWorkflows: number
  averageProgress: number
}

const ClassroomContext = createContext<ClassroomContextValue | undefined>(undefined)

export function ClassroomProvider({ children }: { children: ReactNode }) {
  const [classroomId, setClassroomId] = useState<string | null>(null)
  const [isClassroomActive, setIsClassroomActive] = useState(false)
  const [students, setStudents] = useState<StudentStatus[]>([])

  const activeStudentCount = students.filter((s) => s.isActive).length

  const startClassroom = useCallback((id: string) => {
    setClassroomId(id)
    setIsClassroomActive(true)
  }, [])

  const endClassroom = useCallback(() => {
    setIsClassroomActive(false)
    setStudents((prev) => prev.map((s) => ({ ...s, isActive: false })))
  }, [])

  const addStudent = useCallback((student: StudentProfile) => {
    setStudents((prev) => {
      if (prev.some((s) => s.studentId === student.id)) return prev
      return [
        ...prev,
        {
          studentId: student.id,
          student,
          isActive: true,
          lastActivity: new Date(),
        },
      ]
    })
  }, [])

  const removeStudent = useCallback((studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.studentId !== studentId))
  }, [])

  const assignWorkflow = useCallback((studentIds: string[], workflowId: string) => {
    setStudents((prev) =>
      prev.map((s) => (studentIds.includes(s.studentId) ? { ...s, currentWorkflowId: workflowId } : s)),
    )
  }, [])

  const assignWorkflowToAll = useCallback((workflowId: string) => {
    setStudents((prev) => prev.map((s) => ({ ...s, currentWorkflowId: workflowId })))
  }, [])

  const updateStudentStatus = useCallback((studentId: string, updates: Partial<StudentStatus>) => {
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, ...updates } : s)))
  }, [])

  const getClassroomStats = useCallback((): ClassroomStats => {
    const completed = students.filter((s) => s.execution?.status === "completed").length
    return {
      totalStudents: students.length,
      activeStudents: activeStudentCount,
      completedWorkflows: completed,
      averageProgress: students.length > 0 ? (completed / students.length) * 100 : 0,
    }
  }, [students, activeStudentCount])

  return (
    <ClassroomContext.Provider
      value={{
        classroomId,
        isClassroomActive,
        students,
        activeStudentCount,
        startClassroom,
        endClassroom,
        addStudent,
        removeStudent,
        assignWorkflow,
        assignWorkflowToAll,
        updateStudentStatus,
        getClassroomStats,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  )
}

export function useClassroom() {
  const context = useContext(ClassroomContext)
  if (context === undefined) {
    throw new Error("useClassroom must be used within a ClassroomProvider")
  }
  return context
}
