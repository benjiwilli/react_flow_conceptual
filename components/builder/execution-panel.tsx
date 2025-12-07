"use client"

/**
 * Execution Panel Component
 * Real-time execution logs and streaming output display
 */

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Zap,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import type { ExecutionStatus } from "@/lib/types/execution"
import type { VerbaPathWorkflow } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"

interface ExecutionLogEntry {
  id: string
  timestamp: Date
  nodeId: string
  nodeName: string
  type: "start" | "complete" | "error" | "stream" | "input-required" | "info"
  message: string
  data?: unknown
}

interface ExecutionPanelProps {
  executionStatus: ExecutionStatus
  currentNodeId?: string
  progress: number
  logs: ExecutionLogEntry[]
  streamingContent?: string
  onExecute: () => void
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  onClear: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ExecutionPanel({
  executionStatus,
  currentNodeId,
  progress,
  logs,
  streamingContent,
  onExecute,
  onPause,
  onResume,
  onCancel,
  onClear,
  isExpanded = true,
  onToggleExpand,
}: ExecutionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, streamingContent, autoScroll])

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case "running":
        return "text-blue-500"
      case "completed":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      case "paused":
        return "text-yellow-500"
      case "awaiting-input":
        return "text-orange-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "awaiting-input":
        return <User className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="border-t bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            <span className="font-medium text-sm">Execution</span>
          </button>

          <div className={cn("flex items-center gap-1.5", getStatusColor(executionStatus))}>
            {getStatusIcon(executionStatus)}
            <span className="text-xs font-medium capitalize">{executionStatus}</span>
          </div>

          {currentNodeId && executionStatus === "running" && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {currentNodeId}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Control Buttons */}
          {executionStatus === "pending" && (
            <Button size="sm" onClick={onExecute}>
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          )}

          {executionStatus === "running" && (
            <>
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button size="sm" variant="destructive" onClick={onCancel}>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </>
          )}

          {executionStatus === "paused" && (
            <>
              <Button size="sm" onClick={onResume}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
              <Button size="sm" variant="destructive" onClick={onCancel}>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </>
          )}

          {(executionStatus === "completed" || executionStatus === "failed") && (
            <>
              <Button size="sm" variant="outline" onClick={onClear}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" onClick={onExecute}>
                <Play className="h-4 w-4 mr-1" />
                Run Again
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {executionStatus === "running" && (
        <div className="px-4 py-1">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Log Content */}
      {isExpanded && (
        <ScrollArea
          ref={scrollRef}
          className="flex-1 max-h-64"
          onWheel={() => setAutoScroll(false)}
        >
          <div className="p-4 space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">
                Click &quot;Run&quot; to execute the workflow...
              </p>
            ) : (
              logs.map((log) => (
                <LogEntry key={log.id} entry={log} />
              ))
            )}

            {/* Streaming Content */}
            {streamingContent && (
              <div className="mt-4 p-3 rounded-md bg-muted/50 border border-dashed">
                <p className="text-muted-foreground mb-2 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </p>
                <div className="whitespace-pre-wrap text-foreground">
                  {streamingContent}
                  <span className="animate-pulse">▌</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

interface LogEntryProps {
  entry: ExecutionLogEntry
}

function LogEntry({ entry }: LogEntryProps) {
  const getTypeStyles = () => {
    switch (entry.type) {
      case "start":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "complete":
        return "text-green-600 bg-green-50 border-green-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      case "stream":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "input-required":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "info":
      default:
        return "text-muted-foreground bg-muted/50 border-border"
    }
  }

  const getTypeIcon = () => {
    switch (entry.type) {
      case "start":
        return <Play className="h-3 w-3" />
      case "complete":
        return <CheckCircle className="h-3 w-3" />
      case "error":
        return <XCircle className="h-3 w-3" />
      case "stream":
        return <Zap className="h-3 w-3" />
      case "input-required":
        return <User className="h-3 w-3" />
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className={cn("flex items-start gap-2 p-2 rounded border", getTypeStyles())}>
      <span className="text-muted-foreground shrink-0">{formatTime(entry.timestamp)}</span>
      <span className="shrink-0">{getTypeIcon()}</span>
      <span className="font-medium shrink-0">[{entry.nodeName}]</span>
      <span className="flex-1">{entry.message}</span>
    </div>
  )
}

// ============================================================================
// Mock Execution Hook (for demonstration)
// ============================================================================

type ExecutionPayloadBuilder = () => { workflow: VerbaPathWorkflow; student: StudentProfile }

export function useExecutionPanel(buildPayload: ExecutionPayloadBuilder) {
  const [status, setStatus] = useState<ExecutionStatus>("pending")
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([])
  const [currentNodeId, setCurrentNodeId] = useState<string>()
  const [streamingContent, setStreamingContent] = useState<string>()
  const abortRef = useRef<AbortController | null>(null)

  const addLog = useCallback((
    nodeId: string,
    nodeName: string,
    type: ExecutionLogEntry["type"],
    message: string,
    data?: unknown
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        nodeId,
        nodeName,
        type,
        message,
        data,
      },
    ])
  }, [])

  const handleSSEEvent = useCallback(
    (event: string, data: Record<string, unknown>) => {
      const nodeId = typeof data.nodeId === "string" ? data.nodeId : "unknown"
      const label = typeof data.label === "string" ? data.label : nodeId
      const progressValue = typeof data.progress === "number" ? data.progress : 0
      const content = typeof data.content === "string" ? data.content : ""
      const status = (typeof data.status === "string" ? data.status : undefined) as ExecutionStatus | undefined

      switch (event) {
        case "node-start":
          setCurrentNodeId(nodeId)
          addLog(nodeId, label, "start", "Node started")
          setStreamingContent(undefined)
          break
        case "node-complete":
          addLog(nodeId, nodeId, "complete", "Node completed", data.output)
          setCurrentNodeId(undefined)
          break
        case "node-error":
          addLog(nodeId, nodeId, "error", (data.message as string) || "Node error")
          setStatus("failed")
          break
        case "progress":
          setProgress(progressValue)
          break
        case "stream-token":
        case "token":
          setStreamingContent((prev) => (prev || "") + content)
          break
        case "complete":
          setStatus(status || "completed")
          setCurrentNodeId(undefined)
          addLog("system", "System", status === "failed" ? "error" : "info", "Execution finished")
          break
        case "error":
          setStatus("failed")
          addLog("system", "System", "error", (data.message as string) || "Execution failed")
          break
        default:
          break
      }
    },
    [addLog],
  )

  const execute = useCallback(async () => {
    setStatus("running")
    setProgress(0)
    setLogs([])
    setStreamingContent(undefined)

    const controller = new AbortController()
    abortRef.current = controller

    const payload = buildPayload()

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error("Failed to start execution")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split("\n\n")
        buffer = events.pop() || ""

        for (const evt of events) {
          const lines = evt.split("\n")
          let eventType = "message"
          let dataStr = ""
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim()
            }
            if (line.startsWith("data:")) {
              dataStr += line.replace("data:", "").trim()
            }
          }
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr)
              handleSSEEvent(eventType, data)
            } catch (error) {
              console.error("Failed to parse SSE data", error)
            }
          }
        }
      }

      setStatus((prev) => (prev === "running" ? "completed" : prev))
    } catch (error) {
      if (controller.signal.aborted) {
        addLog("system", "System", "error", "Execution cancelled")
        setStatus("pending")
        return
      }
      addLog("system", "System", "error", error instanceof Error ? error.message : "Execution failed")
      setStatus("failed")
    } finally {
      setCurrentNodeId(undefined)
      abortRef.current = null
    }
  }, [addLog, buildPayload, handleSSEEvent])

  const pause = () => {
    setStatus("paused")
    addLog("system", "System", "info", "Execution paused")
  }

  const resume = () => {
    setStatus("running")
    addLog("system", "System", "info", "Execution resumed")
  }

  const cancel = () => {
    abortRef.current?.abort()
    setStatus("pending")
    setCurrentNodeId(undefined)
    setStreamingContent(undefined)
    addLog("system", "System", "error", "Execution cancelled")
  }

  const clear = () => {
    setStatus("pending")
    setProgress(0)
    setLogs([])
    setCurrentNodeId(undefined)
    setStreamingContent(undefined)
  }

  return {
    status,
    progress,
    logs,
    currentNodeId,
    streamingContent,
    execute,
    pause,
    resume,
    cancel,
    clear,
  }
}

export default ExecutionPanel
