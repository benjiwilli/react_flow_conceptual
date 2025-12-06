"use client"

/**
 * Execution Panel Component
 * Real-time execution logs and streaming output display
 */

import { useState, useEffect, useRef } from "react"
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
import type { ExecutionStatus, NodeExecutionStatus } from "@/lib/types/execution"

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

export function useExecutionPanel() {
  const [status, setStatus] = useState<ExecutionStatus>("pending")
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([])
  const [currentNodeId, setCurrentNodeId] = useState<string>()
  const [streamingContent, setStreamingContent] = useState<string>()

  const addLog = (
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
  }

  const execute = async () => {
    setStatus("running")
    setProgress(0)
    setLogs([])
    setStreamingContent(undefined)

    // Simulate execution
    const nodes = [
      { id: "node-1", name: "Student Profile", duration: 500 },
      { id: "node-2", name: "Content Generator", duration: 2000, stream: true },
      { id: "node-3", name: "Scaffolding", duration: 1000 },
      { id: "node-4", name: "Comprehension Check", duration: 800 },
    ]

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      setCurrentNodeId(node.id)
      addLog(node.id, node.name, "start", `Starting ${node.name}...`)

      if (node.stream) {
        // Simulate streaming
        const text = "The farmer had 24 bright red apples in his basket. He wanted to share them with his neighbor who lived down the road. He gave 8 apples to his neighbor."
        setStreamingContent("")
        for (const char of text) {
          await new Promise((r) => setTimeout(r, 30))
          setStreamingContent((prev) => (prev || "") + char)
        }
        setStreamingContent(undefined)
      } else {
        await new Promise((r) => setTimeout(r, node.duration))
      }

      addLog(node.id, node.name, "complete", `Completed ${node.name}`)
      setProgress(((i + 1) / nodes.length) * 100)
    }

    setStatus("completed")
    setCurrentNodeId(undefined)
    addLog("system", "System", "info", "Workflow execution completed successfully!")
  }

  const pause = () => {
    setStatus("paused")
    addLog("system", "System", "info", "Execution paused")
  }

  const resume = () => {
    setStatus("running")
    addLog("system", "System", "info", "Execution resumed")
  }

  const cancel = () => {
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
