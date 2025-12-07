"use client"

/**
 * Student Grid Component
 * Real-time display of student progress in classroom view
 *
 * Design Philosophy (Jony Ive Inspired):
 * - Cards breathe with generous internal spacing
 * - Subtle shadows create depth without distraction
 * - Status indicators use refined, muted colors
 * - Animations inform transitions, never overwhelm
 * - Every pixel serves a purpose
 *
 * Layout:
 * ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
 * │ Ahmed   │ │ Wei     │ │ Sofia   │ │ Priya   │ │ Dmitri  │
 * │ ████░░  │ │ ██████  │ │ ███░░░  │ │ █████░  │ │ ████░░  │
 * │ Q5/10   │ │ Done!   │ │ Q4/10   │ │ Q6/10   │ │ Q5/10   │
 * │ 🟢 Good │ │ 🏆 100% │ │ 🟡 Help?│ │ 🟢 Good │ │ 🟢 Good │
 * └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
 */

import { useState, useMemo } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Trophy,
  User,
  HelpCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { StudentProfile, ELPALevel } from "@/lib/types/student"

// ============================================================================
// Types
// ============================================================================

export type StudentStatus =
  | "idle"
  | "working"
  | "completed"
  | "struggling"
  | "needs-help"
  | "reviewing"

interface StudentProgress {
  studentId: string
  student: Pick<StudentProfile, "id" | "firstName" | "lastName" | "gradeLevel" | "nativeLanguage" | "elpaLevel">
  status: StudentStatus
  isActive: boolean
  currentStep: number
  totalSteps: number
  score: number
  timeSpent: number // seconds
  lastActivity: Date
  currentNodeName?: string
  needsAttention: boolean
  attentionReason?: string
  streakCount: number
}

interface StudentGridProps {
  students: StudentProgress[]
  onSelectStudent: (studentId: string) => void
  onSendMessage: (studentId: string) => void
  onProvideHint: (studentId: string) => void
  selectedStudentId?: string
  viewMode?: "grid" | "list"
}

// ============================================================================
// Main Component
// ============================================================================

export function StudentGrid({
  students,
  onSelectStudent,
  onSendMessage,
  onProvideHint,
  selectedStudentId,
  viewMode = "grid",
}: StudentGridProps) {
  const [filter, setFilter] = useState<StudentStatus | "all">("all")
  const [sortBy] = useState<"name" | "progress" | "status">("name")

  // Filter and sort students
  const displayStudents = useMemo(() => {
    let result = [...students]

    if (filter !== "all") {
      result = result.filter((s) => s.status === filter)
    }

    switch (sortBy) {
      case "progress":
        result.sort((a, b) => (b.currentStep / b.totalSteps) - (a.currentStep / a.totalSteps))
        break
      case "status":
        const statusOrder: Record<StudentStatus, number> = {
          "needs-help": 0,
          struggling: 1,
          working: 2,
          idle: 3,
          reviewing: 4,
          completed: 5,
        }
        result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
        break
      default:
        result.sort((a, b) => a.student.firstName.localeCompare(b.student.firstName))
    }

    return result
  }, [students, filter, sortBy])

  // Students needing attention
  const needsAttentionCount = students.filter((s) => s.needsAttention).length

  return (
    <div className="space-y-6">
      {/* Filters - Refined pill navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 bg-muted/40 backdrop-blur-sm rounded-2xl">
          <FilterButton
            label="All"
            count={students.length}
            isActive={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterButton
            label="Needs Help"
            count={students.filter((s) => s.status === "needs-help" || s.status === "struggling").length}
            isActive={filter === "needs-help" || filter === "struggling"}
            onClick={() => setFilter("needs-help")}
            variant="warning"
          />
          <FilterButton
            label="Working"
            count={students.filter((s) => s.status === "working").length}
            isActive={filter === "working"}
            onClick={() => setFilter("working")}
          />
          <FilterButton
            label="Completed"
            count={students.filter((s) => s.status === "completed").length}
            isActive={filter === "completed"}
            onClick={() => setFilter("completed")}
            variant="success"
          />
        </div>

        {needsAttentionCount > 0 && (
          <Badge 
            variant="destructive" 
            className="px-3 py-1.5 rounded-full font-medium shadow-sm animate-pulse"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            {needsAttentionCount} need attention
          </Badge>
        )}
      </div>

      {/* Student Cards - Staggered animation on load */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "space-y-3"
        )}
      >
        {displayStudents.map((studentProgress, index) => (
          <div
            key={studentProgress.studentId}
            className="animate-in fade-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
          >
            <StudentCard
              progress={studentProgress}
              isSelected={selectedStudentId === studentProgress.studentId}
              onClick={() => onSelectStudent(studentProgress.studentId)}
              onSendMessage={() => onSendMessage(studentProgress.studentId)}
              onProvideHint={() => onProvideHint(studentProgress.studentId)}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {displayStudents.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="mb-3 text-4xl opacity-50">🔍</div>
          <p className="font-medium">No students match the current filter</p>
          <p className="text-sm mt-1 opacity-70">Try selecting a different filter above</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Student Card Component
// ============================================================================

interface StudentCardProps {
  progress: StudentProgress
  isSelected: boolean
  onClick: () => void
  onSendMessage: () => void
  onProvideHint: () => void
  viewMode: "grid" | "list"
}

function StudentCard({
  progress,
  isSelected,
  onClick,
  onSendMessage,
  onProvideHint,
  viewMode,
}: StudentCardProps) {
  const { student, status, currentStep, totalSteps, score, needsAttention, attentionReason, streakCount } = progress
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  const statusConfig = getStatusConfig(status)

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-5 p-4 rounded-xl border cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:-translate-y-0.5",
          isSelected 
            ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20" 
            : "border-border/60 bg-card hover:border-primary/30",
          needsAttention && "border-amber-400/50 bg-amber-50/80 ring-1 ring-amber-400/20"
        )}
      >
        <div className="flex items-center gap-4 flex-1">
          <StudentAvatar name={student.firstName} elpaLevel={student.elpaLevel} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate tracking-tight">{student.firstName} {student.lastName?.charAt(0)}.</p>
            <p className="text-xs text-muted-foreground mt-0.5">ELPA {student.elpaLevel} • Grade {student.gradeLevel}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-36">
            <Progress value={progressPercent} className="h-2 rounded-full" />
            <p className="text-xs text-muted-foreground mt-1.5 font-light">{currentStep}/{totalSteps} steps</p>
          </div>
          <StatusBadge status={status} />
          {streakCount > 2 && <StreakBadge count={streakCount} />}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div
        onClick={onClick}
        className={cn(
          "relative p-5 rounded-2xl border cursor-pointer transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-1",
          "bg-card",
          isSelected 
            ? "border-primary/50 ring-2 ring-primary/20 shadow-md" 
            : "border-border/50 hover:border-primary/30 shadow-sm",
          needsAttention && "border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50/50"
        )}
      >
        {/* Attention Indicator - Refined floating badge */}
        {needsAttention && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-2.5 -right-2.5 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md ring-2 ring-background">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px]">
              <p className="text-sm">{attentionReason || "Student may need help"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Header - Refined spacing and actions */}
        <div className="flex items-center justify-between mb-4">
          <StudentAvatar name={student.firstName} elpaLevel={student.elpaLevel} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onSendMessage(); }}
                className="rounded-lg"
              >
                <MessageSquare className="h-4 w-4 mr-2.5" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onProvideHint(); }}
                className="rounded-lg"
              >
                <HelpCircle className="h-4 w-4 mr-2.5" />
                Provide Hint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Name and Status - Typography focused */}
        <div className="mb-4">
          <p className="font-semibold truncate tracking-tight text-foreground">{student.firstName}</p>
          <p className="text-xs text-muted-foreground mt-0.5 font-light">Grade {student.gradeLevel}</p>
        </div>

        {/* Progress - Clean visualization */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground font-light">Q{currentStep}/{totalSteps}</span>
            <span className={cn("font-semibold tabular-nums", statusConfig.color)}>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className={cn("h-2 rounded-full", statusConfig.progressColor)} />
        </div>

        {/* Footer - Status and achievements */}
        <div className="flex items-center justify-between pt-1">
          <StatusBadge status={status} size="sm" />
          {streakCount > 2 && <StreakBadge count={streakCount} size="sm" />}
        </div>

        {/* Completed Overlay - Celebratory but refined */}
        {status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-2xl">
            <div className="text-center">
              <div className="mb-2 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 shadow-inner">
                <Trophy className="h-7 w-7 text-amber-600" />
              </div>
              <p className="font-semibold text-amber-800 tracking-tight">Completed!</p>
              <p className="text-sm text-muted-foreground mt-0.5 font-light">{score}% score</p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

interface StudentAvatarProps {
  name: string
  elpaLevel: ELPALevel
  size?: "sm" | "md"
}

function StudentAvatar({ name, elpaLevel, size = "md" }: StudentAvatarProps) {
  // Refined ELPA color palette - softer, more sophisticated
  const elpaColors: Record<ELPALevel, string> = {
    1: "bg-gradient-to-br from-rose-100 to-red-100 text-rose-700 ring-rose-300/50",
    2: "bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 ring-orange-300/50",
    3: "bg-gradient-to-br from-yellow-100 to-amber-50 text-amber-700 ring-yellow-300/50",
    4: "bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700 ring-emerald-300/50",
    5: "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-blue-300/50",
  }

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-semibold ring-2 shadow-sm transition-transform duration-200 hover:scale-105",
        elpaColors[elpaLevel],
        size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

interface StatusBadgeProps {
  status: StudentStatus
  size?: "sm" | "md"
}

function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full font-medium transition-colors",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        config.bg
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", config.color)} />
      <span className={cn(config.color, "tracking-tight")}>{config.label}</span>
    </div>
  )
}

interface StreakBadgeProps {
  count: number
  size?: "sm" | "md"
}

function StreakBadge({ count, size = "md" }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100",
        "text-orange-600 font-semibold tabular-nums",
        size === "sm" ? "text-[10px]" : "text-xs"
      )}
    >
      <Zap className={cn("fill-current", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{count}</span>
    </div>
  )
}

interface FilterButtonProps {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
  variant?: "default" | "warning" | "success"
}

function FilterButton({ label, count, isActive, onClick, variant = "default" }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? variant === "warning"
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
            : variant === "success"
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
            : "bg-primary text-primary-foreground shadow-md"
          : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm"
      )}
    >
      <span className="tracking-tight">{label}</span>
      <span className={cn(
        "ml-1.5 tabular-nums",
        isActive ? "opacity-90" : "opacity-70"
      )}>({count})</span>
    </button>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusConfig(status: StudentStatus) {
  // Refined color palette - softer, more sophisticated
  const configs: Record<StudentStatus, {
    label: string
    color: string
    bg: string
    progressColor: string
    icon: typeof CheckCircle2
  }> = {
    idle: {
      label: "Idle",
      color: "text-slate-500",
      bg: "bg-slate-100/80",
      progressColor: "",
      icon: Clock,
    },
    working: {
      label: "Working",
      color: "text-blue-600",
      bg: "bg-blue-50 ring-1 ring-blue-200/50",
      progressColor: "[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500",
      icon: Zap,
    },
    completed: {
      label: "Done",
      color: "text-emerald-600",
      bg: "bg-emerald-50 ring-1 ring-emerald-200/50",
      progressColor: "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500",
      icon: Trophy,
    },
    struggling: {
      label: "Struggling",
      color: "text-orange-600",
      bg: "bg-orange-50 ring-1 ring-orange-200/50",
      progressColor: "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500",
      icon: AlertCircle,
    },
    "needs-help": {
      label: "Help!",
      color: "text-rose-600",
      bg: "bg-rose-50 ring-1 ring-rose-200/50",
      progressColor: "[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-red-500",
      icon: HelpCircle,
    },
    reviewing: {
      label: "Reviewing",
      color: "text-violet-600",
      bg: "bg-violet-50 ring-1 ring-violet-200/50",
      progressColor: "[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-500",
      icon: User,
    },
  }

  return configs[status]
}

export default StudentGrid
