/**
 * useCurriculum Hook
 * Access Alberta curriculum standards and outcomes
 */

"use client"

import { useState, useCallback, useMemo } from "react"
import type { LearningOutcome } from "@/lib/types/curriculum"
import { SAMPLE_OUTCOMES } from "@/lib/constants/alberta-curriculum"

interface UseCurriculumOptions {
  gradeLevel?: string
  subject?: string
  elpaLevel?: number
}

interface UseCurriculumReturn {
  outcomes: LearningOutcome[]
  filteredOutcomes: LearningOutcome[]
  isLoading: boolean
  error: string | null

  filterByGrade: (grade: string) => void
  filterBySubject: (subject: string) => void
  filterByELPA: (level: number) => void
  clearFilters: () => void

  getOutcomeById: (id: string) => LearningOutcome | undefined
  searchOutcomes: (query: string) => LearningOutcome[]
}

export function useCurriculum(options: UseCurriculumOptions = {}): UseCurriculumReturn {
  const [outcomes] = useState<LearningOutcome[]>(SAMPLE_OUTCOMES)
  const [gradeFilter, setGradeFilter] = useState<string | undefined>(options.gradeLevel)
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(options.subject)
  const [elpaFilter, setElpaFilter] = useState<number | undefined>(options.elpaLevel)
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  const filteredOutcomes = useMemo(() => {
    let result = outcomes

    if (gradeFilter) {
      result = result.filter((o) => o.gradeLevel === gradeFilter)
    }
    if (subjectFilter) {
      result = result.filter((o) => o.subjectArea === subjectFilter)
    }
    if (elpaFilter) {
      result = result.filter((o) => o.elpaAlignment?.level === elpaFilter)
    }

    return result
  }, [outcomes, gradeFilter, subjectFilter, elpaFilter])

  const filterByGrade = useCallback((grade: string) => setGradeFilter(grade), [])
  const filterBySubject = useCallback((subject: string) => setSubjectFilter(subject), [])
  const filterByELPA = useCallback((level: number) => setElpaFilter(level), [])
  const clearFilters = useCallback(() => {
    setGradeFilter(undefined)
    setSubjectFilter(undefined)
    setElpaFilter(undefined)
  }, [])

  const getOutcomeById = useCallback((id: string) => outcomes.find((o) => o.id === id), [outcomes])

  const searchOutcomes = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase()
      return outcomes.filter(
        (o) => o.description.toLowerCase().includes(lowerQuery) || o.code.toLowerCase().includes(lowerQuery),
      )
    },
    [outcomes],
  )

  return {
    outcomes,
    filteredOutcomes,
    isLoading,
    error,
    filterByGrade,
    filterBySubject,
    filterByELPA,
    clearFilters,
    getOutcomeById,
    searchOutcomes,
  }
}
