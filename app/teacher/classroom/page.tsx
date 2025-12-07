/**
 * Classroom Management Page
 * Real-time view of student progress during class sessions
 */

import { Suspense } from "react"
import { ClassroomView } from "@/components/teacher/classroom-view"
import { ClassroomProvider } from "@/contexts/classroom-context"

export const metadata = {
  title: "Classroom | VerbaPath",
  description: "Monitor student progress in real-time",
}

// Disable static generation since this page uses client-side context
export const dynamic = "force-dynamic"

export default function ClassroomPage() {
  return (
    <ClassroomProvider>
      <Suspense fallback={<ClassroomSkeleton />}>
        <ClassroomView />
      </Suspense>
    </ClassroomProvider>
  )
}

function ClassroomSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading classroom...</div>
    </div>
  )
}
