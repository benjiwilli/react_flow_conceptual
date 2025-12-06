"use client"

/**
 * Teacher Alerts Component
 * Real-time notifications for student progress and concerns
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

const alertConfig: Record<AlertType, { icon: React.ElementType; color: string; bgColor: string }> = {
  struggling: {
    icon: TrendingDown,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
  idle: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  "help-requested": {
    icon: HelpCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  achievement: {
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
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
        "p-3 rounded-lg border transition-all",
        config.bgColor,
        !alert.isRead && "ring-2 ring-offset-1 ring-blue-400"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-1.5 rounded-full bg-white", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{alert.studentName}</span>
            <Badge variant={badge.variant} className="text-xs h-5">
              {badge.label}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700">{alert.message}</p>
          {alert.details && (
            <p className="text-xs text-muted-foreground mt-1">{alert.details}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onTakeAction}>
              <User className="h-3 w-3 mr-1" />
              View Student
            </Button>
            {!alert.isRead && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onMarkRead}>
                Mark Read
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={onDismiss}>
              <X className="h-3 w-3" />
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
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Alerts</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {mutedTypes.size > 0 ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Alert Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(alertConfig) as AlertType[]).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => toggleMute(type)}
                  className="flex items-center gap-2"
                >
                  {mutedTypes.has(type) ? (
                    <BellOff className="h-3 w-3" />
                  ) : (
                    <Bell className="h-3 w-3" />
                  )}
                  <span className="capitalize">{type.replace("-", " ")}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Unread" : "Show All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          {visibleAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No alerts to show</p>
              {!showAll && alerts.length > 0 && (
                <Button variant="link" size="sm" onClick={() => setShowAll(true)}>
                  View all alerts
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {highPriorityCount > 0 && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-red-100 rounded-md mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    {highPriorityCount} student{highPriorityCount > 1 ? "s" : ""} need
                    {highPriorityCount === 1 ? "s" : ""} immediate attention
                  </span>
                </div>
              )}
              {visibleAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={() => onDismiss(alert.id)}
                  onMarkRead={() => onMarkRead(alert.id)}
                  onTakeAction={() => onTakeAction(alert)}
                />
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
