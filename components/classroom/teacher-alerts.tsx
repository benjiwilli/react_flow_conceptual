"use client"

/**
 * Teacher Alerts Component
 * Real-time notifications for student progress and concerns
 * 
 * Design Philosophy (Jony Ive Inspired):
 * - Alerts surface gently but with clear urgency hierarchy
 * - Visual weight proportional to importance
 * - Transitions that feel natural and informed
 * - Clutter-free, scannable at a glance
 * - Actions obvious without being intrusive
 */

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  X,
  Bell,
  BellOff,
  User,
  TrendingDown,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// Types
// ============================================================================

export type AlertType = "struggling" | "completed" | "idle" | "help-requested" | "achievement"
export type AlertPriority = "high" | "medium" | "low"

export interface TeacherAlert {
  id: string
  type: AlertType
  priority: AlertPriority
  studentId: string
  studentName: string
  message: string
  details?: string
  timestamp: Date
  isRead: boolean
  actionTaken?: boolean
}

interface TeacherAlertsProps {
  alerts: TeacherAlert[]
  onDismiss: (alertId: string) => void
  onMarkRead: (alertId: string) => void
  onTakeAction: (alert: TeacherAlert) => void
  className?: string
}

// ============================================================================
// Alert Configuration
// ============================================================================

// Refined alert configuration with subtle gradients and softer colors
const alertConfig: Record<AlertType, { icon: React.ElementType; color: string; bgColor: string; iconBg: string }> = {
  struggling: {
    icon: TrendingDown,
    color: "text-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50 to-red-50/50 border-rose-200/50 ring-1 ring-rose-200/30",
    iconBg: "bg-rose-100",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200/50 ring-1 ring-emerald-200/30",
    iconBg: "bg-emerald-100",
  },
  idle: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50/50 border-amber-200/50 ring-1 ring-amber-200/30",
    iconBg: "bg-amber-100",
  },
  "help-requested": {
    icon: HelpCircle,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/50 ring-1 ring-blue-200/30",
    iconBg: "bg-blue-100",
  },
  achievement: {
    icon: Sparkles,
    color: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50/50 border-violet-200/50 ring-1 ring-violet-200/30",
    iconBg: "bg-violet-100",
  },
}

const priorityBadge: Record<AlertPriority, { variant: "default" | "secondary" | "destructive"; label: string }> = {
  high: { variant: "destructive", label: "Urgent" },
  medium: { variant: "default", label: "Important" },
  low: { variant: "secondary", label: "Info" },
}

// ============================================================================
// Alert Item Component
// ============================================================================

function AlertItem({
  alert,
  onDismiss,
  onMarkRead,
  onTakeAction,
}: {
  alert: TeacherAlert
  onDismiss: () => void
  onMarkRead: () => void
  onTakeAction: () => void
}) {
  const config = alertConfig[alert.type]
  const Icon = config.icon
  const badge = priorityBadge[alert.priority]
  const [now, setNow] = React.useState(() => Date.now())
  
  // Update time periodically
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])
  
  const timeAgo = React.useMemo(() => {
    const seconds = Math.floor((now - alert.timestamp.getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }, [now, alert.timestamp])

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all duration-200 hover:shadow-md",
        config.bgColor,
        !alert.isRead && "ring-2 ring-offset-2 ring-blue-400/50 shadow-sm"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-xl shadow-inner", config.iconBg, config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="font-semibold text-sm tracking-tight">{alert.studentName}</span>
            <Badge variant={badge.variant} className="text-[10px] h-5 px-2 shadow-sm">
              {badge.label}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto font-light tabular-nums">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 font-light leading-relaxed">{alert.message}</p>
          {alert.details && (
            <p className="text-xs text-muted-foreground mt-1.5 font-light">{alert.details}</p>
          )}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs rounded-lg font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground" 
              onClick={onTakeAction}
            >
              <User className="h-3.5 w-3.5 mr-1.5" />
              View Student
            </Button>
            {!alert.isRead && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-xs rounded-lg font-medium" 
                onClick={onMarkRead}
              >
                Mark Read
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 ml-auto rounded-lg opacity-60 hover:opacity-100 transition-opacity" 
              onClick={onDismiss}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function TeacherAlerts({
  alerts,
  onDismiss,
  onMarkRead,
  onTakeAction,
  className,
}: TeacherAlertsProps) {
  const [showAll, setShowAll] = React.useState(false)
  const [mutedTypes, setMutedTypes] = React.useState<Set<AlertType>>(new Set())

  const unreadCount = alerts.filter((a) => !a.isRead).length
  const highPriorityCount = alerts.filter((a) => a.priority === "high" && !a.isRead).length

  // Filter and sort alerts
  const visibleAlerts = React.useMemo(() => {
    let filtered = alerts.filter((a) => !mutedTypes.has(a.type))
    if (!showAll) {
      filtered = filtered.filter((a) => !a.isRead || a.priority === "high")
    }
    return filtered.sort((a, b) => {
      // Priority first
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      // Then by read status
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
      // Then by time
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  }, [alerts, showAll, mutedTypes])

  const toggleMute = (type: AlertType) => {
    setMutedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <Card className={cn("flex flex-col overflow-hidden shadow-lg", className)}>
      <CardHeader className="pb-4 flex-row items-center justify-between space-y-0 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-muted/50">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">Alerts</CardTitle>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground font-light">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                {mutedTypes.size > 0 ? (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuLabel className="font-semibold">Alert Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(alertConfig) as AlertType[]).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => toggleMute(type)}
                  className="flex items-center gap-2.5 rounded-lg"
                >
                  {mutedTypes.has(type) ? (
                    <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  <span className="capitalize font-medium">{type.replace("-", " ")}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs rounded-xl font-medium"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Unread" : "Show All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[450px] px-4 py-4">
          {visibleAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <div className="p-4 rounded-2xl bg-muted/30 mb-4">
                <CheckCircle2 className="h-10 w-10 opacity-40" />
              </div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs opacity-70 mt-1">No alerts to show</p>
              {!showAll && alerts.length > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setShowAll(true)}
                  className="mt-3"
                >
                  View all alerts
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {highPriorityCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-rose-100 to-red-50 rounded-xl mb-4 shadow-sm animate-in fade-in-50 duration-300">
                  <div className="p-1.5 rounded-lg bg-rose-200">
                    <AlertTriangle className="h-4 w-4 text-rose-700" />
                  </div>
                  <span className="text-sm font-semibold text-rose-800 tracking-tight">
                    {highPriorityCount} student{highPriorityCount > 1 ? "s" : ""} need
                    {highPriorityCount === 1 ? "s" : ""} immediate attention
                  </span>
                </div>
              )}
              {visibleAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="animate-in fade-in-50 slide-in-from-right-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                >
                  <AlertItem
                    alert={alert}
                    onDismiss={() => onDismiss(alert.id)}
                    onMarkRead={() => onMarkRead(alert.id)}
                    onTakeAction={() => onTakeAction(alert)}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Alert Generation Utilities
// ============================================================================

export function generateStudentAlert(
  studentId: string,
  studentName: string,
  type: AlertType,
  customMessage?: string
): TeacherAlert {
  const messages: Record<AlertType, string> = {
    struggling: `is struggling with the current activity`,
    completed: `has completed the learning pathway`,
    idle: `has been inactive for 5+ minutes`,
    "help-requested": `has requested help`,
    achievement: `earned a new achievement badge`,
  }

  const priorities: Record<AlertType, AlertPriority> = {
    struggling: "high",
    "help-requested": "high",
    idle: "medium",
    completed: "low",
    achievement: "low",
  }

  return {
    id: crypto.randomUUID(),
    type,
    priority: priorities[type],
    studentId,
    studentName,
    message: customMessage || messages[type],
    timestamp: new Date(),
    isRead: false,
  }
}
