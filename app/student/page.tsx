/**
 * Student Learning Interface
 * Simplified UI for students to complete learning activities
 */

import { Suspense } from "react"
import { StudentInterface } from "@/components/student/student-interface"

export const metadata = {
  title: "Learn | LinguaFlow",
  description: "Your personalized learning journey",
}

export default function StudentPage() {
  return (
    <Suspense fallback={<StudentSkeleton />}>
      <StudentInterface />
    </Suspense>
  )
}

function StudentSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-muted-foreground">Loading your activities...</div>
    </div>
  )
}
