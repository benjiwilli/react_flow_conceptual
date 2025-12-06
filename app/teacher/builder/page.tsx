/**
 * Workflow Builder Page
 * Full-featured learning pathway builder for teachers
 */

import { Suspense } from "react"
import { WorkflowBuilder } from "@/components/workflow-builder"

export const metadata = {
  title: "Learning Pathway Builder | LinguaFlow",
  description: "Create personalized learning pathways for ESL students",
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <div className="h-screen">
        <WorkflowBuilder />
      </div>
    </Suspense>
  )
}

function BuilderSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading builder...</div>
    </div>
  )
}
