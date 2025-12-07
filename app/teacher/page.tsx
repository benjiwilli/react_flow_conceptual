/**
 * Teacher Dashboard Page
 * Main entry point for teachers to build and manage learning pathways
 */

import { Suspense } from "react"
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard"

export const metadata = {
  title: "Teacher Dashboard | VerbaPath",
  description: "Build and manage AI-powered learning pathways for ESL students",
}

export default function TeacherPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <TeacherDashboard />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading dashboard...</div>
    </div>
  )
}
