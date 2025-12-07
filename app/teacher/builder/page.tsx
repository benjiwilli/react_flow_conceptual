/**
 * Workflow Builder Page
 * Full-featured learning pathway builder for teachers
 * 
 * Design Philosophy (Jony Ive inspired):
 * - Clean, purposeful loading state
 * - Skeleton that mirrors final layout
 * - Gentle entrance animation
 */

import { Suspense } from "react"
import { WorkflowBuilder } from "@/components/workflow-builder"
import { SkeletonWorkflowBuilder } from "@/components/ui/skeleton"

export const metadata = {
  title: "Learning Pathway Builder | VerbaPath",
  description: "Create personalized learning pathways for ESL students",
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <div className="h-screen animate-fade-in">
        <WorkflowBuilder />
      </div>
    </Suspense>
  )
}

function BuilderSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary/60 animate-shimmer bg-gradient-to-r from-secondary/60 via-secondary/30 to-secondary/60 bg-[length:200%_100%]" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded bg-secondary/60 animate-shimmer bg-gradient-to-r from-secondary/60 via-secondary/30 to-secondary/60 bg-[length:200%_100%]" />
            <div className="h-3 w-32 rounded bg-secondary/40 animate-shimmer bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="h-9 w-20 rounded-xl bg-secondary/60 animate-shimmer bg-gradient-to-r from-secondary/60 via-secondary/30 to-secondary/60 bg-[length:200%_100%]" 
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
      
      {/* Main content skeleton */}
      <SkeletonWorkflowBuilder className="flex-1" />
    </div>
  )
}
