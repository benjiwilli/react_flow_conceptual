/**
 * App Providers Component
 * Wraps application with all necessary context providers
 */

"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { StudentProvider } from "@/contexts/student-context"
import { ExecutionProvider } from "@/contexts/execution-context"
import { ClassroomProvider } from "@/contexts/classroom-context"
import { PreviewProvider } from "@/contexts/preview-context"
import { ThemeProvider } from "@/components/theme-provider"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <StudentProvider>
          <ExecutionProvider>
            <ClassroomProvider>
              <PreviewProvider>
                {children}
              </PreviewProvider>
            </ClassroomProvider>
          </ExecutionProvider>
        </StudentProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
