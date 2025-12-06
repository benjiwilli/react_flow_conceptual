/**
 * useELPALevel Hook
 * Access ELPA level definitions and scaffolding recommendations
 */

"use client"

import { useMemo } from "react"
import {
  ELPA_LEVELS,
  getELPALevel,
  getScaffoldingForLevel,
  type ELPALevelDefinition,
} from "@/lib/constants/elpa-levels"

interface UseELPALevelReturn {
  levels: ELPALevelDefinition[]
  getLevel: (level: 1 | 2 | 3 | 4 | 5) => ELPALevelDefinition
  getScaffolding: (level: 1 | 2 | 3 | 4 | 5) => string[]
  getLevelName: (level: 1 | 2 | 3 | 4 | 5) => string
  getInstructionalFocus: (level: 1 | 2 | 3 | 4 | 5) => string[]
  getCanDoStatements: (level: 1 | 2 | 3 | 4 | 5, domain: "listening" | "speaking" | "reading" | "writing") => string[]
}

export function useELPALevel(): UseELPALevelReturn {
  const levels = ELPA_LEVELS

  const getLevel = useMemo(() => getELPALevel, [])
  const getScaffolding = useMemo(() => getScaffoldingForLevel, [])

  const getLevelName = useMemo(
    () =>
      (level: 1 | 2 | 3 | 4 | 5): string => {
        return getELPALevel(level).name
      },
    [],
  )

  const getInstructionalFocus = useMemo(
    () =>
      (level: 1 | 2 | 3 | 4 | 5): string[] => {
        return getELPALevel(level).instructionalFocus
      },
    [],
  )

  const getCanDoStatements = useMemo(
    () =>
      (level: 1 | 2 | 3 | 4 | 5, domain: "listening" | "speaking" | "reading" | "writing"): string[] => {
        return getELPALevel(level)[domain]
      },
    [],
  )

  return {
    levels,
    getLevel,
    getScaffolding,
    getLevelName,
    getInstructionalFocus,
    getCanDoStatements,
  }
}
