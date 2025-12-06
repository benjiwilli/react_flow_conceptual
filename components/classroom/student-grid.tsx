"use client"

/**
 * Student Grid Component
 * Real-time display of student progress in classroom view
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          <Badge variant="destructive" className="animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            {needsAttentionCount} need attention
          </Badge>
        )}
      </div>

      {/* Student Cards */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "space-y-2"
        )}
      >
        {displayStudents.map((studentProgress) => (
          <StudentCard
            key={studentProgress.studentId}
            progress={studentProgress}
            isSelected={selectedStudentId === studentProgress.studentId}
            onClick={() => onSelectStudent(studentProgress.studentId)}
            onSendMessage={() => onSendMessage(studentProgress.studentId)}
            onProvideHint={() => onProvideHint(studentProgress.studentId)}
            viewMode={viewMode}
          />
        ))}
      </div>

      {displayStudents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No students match the current filter
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
          "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          needsAttention && "border-amber-500 bg-amber-50"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <StudentAvatar name={student.firstName} elpaLevel={student.elpaLevel} />
          <div className="flex-1">
            <p className="font-medium">{student.firstName} {student.lastName?.charAt(0)}.</p>
            <p className="text-xs text-muted-foreground">ELPA {student.elpaLevel} • Grade {student.gradeLevel}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-32">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{currentStep}/{totalSteps}</p>
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
          "relative p-4 rounded-lg border cursor-pointer transition-all",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
          needsAttention && "border-amber-500 bg-amber-50 animate-pulse"
        )}
      >
        {/* Attention Indicator */}
        {needsAttention && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                <AlertCircle className="h-3 w-3 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{attentionReason || "Student may need help"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <StudentAvatar name={student.firstName} elpaLevel={student.elpaLevel} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSendMessage(); }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onProvideHint(); }}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Provide Hint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Name and Status */}
        <div className="mb-3">
          <p className="font-medium truncate">{student.firstName}</p>
          <p className="text-xs text-muted-foreground">Grade {student.gradeLevel}</p>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Q{currentStep}/{totalSteps}</span>
            <span className={cn("font-medium", statusConfig.color)}>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className={cn("h-2", statusConfig.progressColor)} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <StatusBadge status={status} size="sm" />
          {streakCount > 2 && <StreakBadge count={streakCount} size="sm" />}
        </div>

        {/* Completed Badge */}
        {status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="text-center">
              <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-1" />
              <p className="font-medium text-amber-700">Done!</p>
              <p className="text-xs text-muted-foreground">{score}%</p>
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
  const elpaColors: Record<ELPALevel, string> = {
    1: "bg-red-100 text-red-700 ring-red-500",
    2: "bg-orange-100 text-orange-700 ring-orange-500",
    3: "bg-yellow-100 text-yellow-700 ring-yellow-500",
    4: "bg-green-100 text-green-700 ring-green-500",
    5: "bg-blue-100 text-blue-700 ring-blue-500",
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium ring-2",
        elpaColors[elpaLevel],
        size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
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
        "flex items-center gap-1 rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.bg
      )}
    >
      <Icon className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3", config.color)} />
      <span className={config.color}>{config.label}</span>
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
        "flex items-center gap-0.5 text-orange-500",
        size === "sm" ? "text-[10px]" : "text-xs"
      )}
    >
      <Zap className={cn("fill-current", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      <span className="font-medium">{count}</span>
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
        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        isActive
          ? variant === "warning"
            ? "bg-amber-500 text-white"
            : variant === "success"
            ? "bg-green-500 text-white"
            : "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label} ({count})
    </button>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusConfig(status: StudentStatus) {
  const configs: Record<StudentStatus, {
    label: string
    color: string
    bg: string
    progressColor: string
    icon: typeof CheckCircle2
  }> = {
    idle: {
      label: "Idle",
      color: "text-gray-500",
      bg: "bg-gray-100",
      progressColor: "",
      icon: Clock,
    },
    working: {
      label: "Working",
      color: "text-blue-600",
      bg: "bg-blue-100",
      progressColor: "bg-blue-500",
      icon: Zap,
    },
    completed: {
      label: "Done",
      color: "text-green-600",
      bg: "bg-green-100",
      progressColor: "bg-green-500",
      icon: Trophy,
    },
    struggling: {
      label: "Struggling",
      color: "text-orange-600",
      bg: "bg-orange-100",
      progressColor: "bg-orange-500",
      icon: AlertCircle,
    },
    "needs-help": {
      label: "Help!",
      color: "text-red-600",
      bg: "bg-red-100",
      progressColor: "bg-red-500",
      icon: HelpCircle,
    },
    reviewing: {
      label: "Reviewing",
      color: "text-purple-600",
      bg: "bg-purple-100",
      progressColor: "bg-purple-500",
      icon: User,
    },
  }

  return configs[status]
}

export default StudentGrid
