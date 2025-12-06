/**
 * Classroom Management Page
 * Real-time view of student progress during class sessions
 */

import { Suspense } from "react"
import { ClassroomView } from "@/components/teacher/classroom-view"

export const metadata = {
  title: "Classroom | LinguaFlow",
  description: "Monitor student progress in real-time",
}

export default function ClassroomPage() {
  return (
    <Suspense fallback={<ClassroomSkeleton />}>
      <ClassroomView />
    </Suspense>
  )
}

function ClassroomSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading classroom...</div>
    </div>
  )
}
