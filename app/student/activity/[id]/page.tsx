/**
 * Activity Execution Page
 * Where students complete individual learning activities
 */

import { Suspense } from "react"
import { ActivityPlayer } from "@/components/student/activity-player"

export const metadata = {
  title: "Activity | VerbaPath",
  description: "Complete your learning activity",
}

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityPlayer activityId={id} />
    </Suspense>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-muted-foreground">Loading activity...</div>
    </div>
  )
}
