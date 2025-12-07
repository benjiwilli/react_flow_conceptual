import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 * 
 * Design Philosophy (Jony Ive inspired):
 * - Gentle shimmer that suggests loading without anxiety
 * - Rounded shapes that feel approachable
 * - Subtle animation that doesn't distract
 * - Maintains layout stability during loading
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the shimmer animation */
  animate?: boolean
}

function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-secondary/60",
        animate && "animate-shimmer bg-gradient-to-r from-secondary/60 via-secondary/30 to-secondary/60 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Pre-built skeleton patterns for common UI elements
 */

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6 shadow-subtle", className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  )
}

function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }
  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />
}

function SkeletonButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-9 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  }
  return <Skeleton className={cn("rounded-xl", sizeClasses[size])} />
}

function SkeletonInput({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-full rounded-xl", className)} />
}

function SkeletonNodeCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card p-4 shadow-subtle w-64", className)}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonStudentCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-5 shadow-subtle", className)}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full mb-3" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

function SkeletonWorkflowBuilder({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full", className)}>
      {/* Left Sidebar */}
      <div className="w-72 border-r border-border/50 p-4 space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 p-8 bg-secondary/20">
        <div className="flex items-center justify-center gap-8">
          <SkeletonNodeCard />
          <Skeleton className="h-0.5 w-16" />
          <SkeletonNodeCard />
          <Skeleton className="h-0.5 w-16" />
          <SkeletonNodeCard />
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-80 border-l border-border/50 p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}

function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <SkeletonButton />
          <SkeletonButton />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 shadow-subtle">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      
      {/* Student Grid */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonStudentCard key={i} />
        ))}
      </div>
    </div>
  )
}

function SkeletonLearningContent({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-2xl mx-auto p-6 space-y-6", className)}>
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      
      {/* Content Card */}
      <div className="rounded-3xl border border-border/50 bg-card p-8 shadow-elevated">
        <SkeletonText lines={4} />
        <div className="mt-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-elevated">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-24 w-full rounded-xl mb-4" />
        <div className="flex justify-end gap-2">
          <SkeletonButton />
          <SkeletonButton size="lg" />
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
  SkeletonNodeCard,
  SkeletonStudentCard,
  SkeletonWorkflowBuilder,
  SkeletonDashboard,
  SkeletonLearningContent,
}
