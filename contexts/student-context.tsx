/**
 * Student Context
 * Manages current student profile and session state
 */

"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { StudentProfile, StudentSession, StudentProgress } from "@/lib/types/student"

interface StudentContextValue {
  // Current student
  currentStudent: StudentProfile | null
  setCurrentStudent: (student: StudentProfile | null) => void

  // Session management
  currentSession: StudentSession | null
  startSession: () => void
  endSession: () => void

  // Progress tracking
  progress: StudentProgress[]
  addProgress: (progress: StudentProgress) => void

  // Loading states
  isLoading: boolean
  error: string | null
}

const StudentContext = createContext<StudentContextValue | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null)
  const [currentSession, setCurrentSession] = useState<StudentSession | null>(null)
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startSession = useCallback(() => {
    if (!currentStudent) return

    const session: StudentSession = {
      id: crypto.randomUUID(),
      studentId: currentStudent.id,
      startedAt: new Date(),
      workflowsCompleted: [],
      totalTimeSeconds: 0,
    }
    setCurrentSession(session)
  }, [currentStudent])

  const endSession = useCallback(() => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        endedAt: new Date(),
      })
    }
  }, [currentSession])

  const addProgress = useCallback((newProgress: StudentProgress) => {
    setProgress((prev) => [...prev, newProgress])
  }, [])

  return (
    <StudentContext.Provider
      value={{
        currentStudent,
        setCurrentStudent,
        currentSession,
        startSession,
        endSession,
        progress,
        addProgress,
        isLoading,
        error,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
