/**
 * App Providers Component
 * Wraps application with all necessary context providers
 */

"use client"

import type { ReactNode } from "react"
import { StudentProvider } from "@/contexts/student-context"
import { ExecutionProvider } from "@/contexts/execution-context"
import { ClassroomProvider } from "@/contexts/classroom-context"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StudentProvider>
      <ExecutionProvider>
        <ClassroomProvider>{children}</ClassroomProvider>
      </ExecutionProvider>
    </StudentProvider>
  )
}
