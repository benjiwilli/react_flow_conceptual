/**
 * useStudentProfile Hook
 * Fetches and manages student profile data
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import type { StudentProfile } from "@/lib/types/student"

interface UseStudentProfileOptions {
  studentId?: string
  autoFetch?: boolean
}

interface UseStudentProfileReturn {
  student: StudentProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateStudent: (updates: Partial<StudentProfile>) => Promise<void>
}

export function useStudentProfile(options: UseStudentProfileOptions = {}): UseStudentProfileReturn {
  const { studentId, autoFetch = true } = options
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudent = useCallback(async () => {
    if (!studentId) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch student profile from API (falls back to mock when Supabase not configured)
      const response = await fetch(`/api/students/${studentId}`)
      if (!response.ok) throw new Error("Failed to fetch student")
      const data = await response.json()
      setStudent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  const updateStudent = useCallback(
    async (updates: Partial<StudentProfile>) => {
      if (!studentId) return

      setIsLoading(true)
      setError(null)

      try {
        // TODO: Implement actual API call
        const response = await fetch(`/api/students/${studentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        if (!response.ok) throw new Error("Failed to update student")
        const data = await response.json()
        setStudent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    },
    [studentId],
  )

  useEffect(() => {
    if (autoFetch && studentId) {
      fetchStudent()
    }
  }, [autoFetch, studentId, fetchStudent])

  return {
    student,
    isLoading,
    error,
    refetch: fetchStudent,
    updateStudent,
  }
}
