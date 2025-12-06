/**
 * Student Learning Interface
 * Simplified UI for students to complete learning activities
 */

import { Suspense } from "react"
import { StudentInterface } from "@/components/student/student-interface"
import { StudentProvider } from "@/contexts/student-context"

export const metadata = {
  title: "Learn | LinguaFlow",
  description: "Your personalized learning journey",
}

// Disable static generation since this page uses client-side context
export const dynamic = "force-dynamic"

export default function StudentPage() {
  return (
    <StudentProvider>
      <Suspense fallback={<StudentSkeleton />}>
        <StudentInterface />
      </Suspense>
    </StudentProvider>
  )
}

function StudentSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-muted-foreground">Loading your activities...</div>
    </div>
  )
}
