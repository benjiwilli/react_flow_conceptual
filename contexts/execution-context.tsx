/**
 * Execution Context
 * Manages workflow execution state and streaming
 */

"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"
import type { WorkflowExecution, NodeExecution, StreamEvent } from "@/lib/types/execution"
import type { VerbaPathWorkflow } from "@/lib/types/workflow"
import { WorkflowExecutor, type ExecutorCallbacks } from "@/lib/engine/executor"
import { getStreamManager } from "@/lib/engine/stream-manager"

interface ExecutionContextValue {
  // Current execution state
  currentExecution: WorkflowExecution | null
  isExecuting: boolean
  isPaused: boolean

  // Streaming content
  streamingContent: Record<string, string>
  currentStreamingNodeId: string | null

  // Execution control
  executeWorkflow: (workflow: VerbaPathWorkflow, studentId: string) => Promise<void>
  pauseExecution: () => void
  resumeExecution: () => Promise<void>
  cancelExecution: () => void

  // Node execution history
  nodeExecutions: NodeExecution[]

  // Error state
  error: string | null
}

const ExecutionContext = createContext<ExecutionContextValue | undefined>(undefined)

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({})
  const [currentStreamingNodeId, setCurrentStreamingNodeId] = useState<string | null>(null)
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([])
  const [error, setError] = useState<string | null>(null)

  const executorRef = useRef<WorkflowExecutor | null>(null)

  const callbacks: ExecutorCallbacks = {
    onNodeStart: (nodeId, node) => {
      setCurrentStreamingNodeId(nodeId)
      setStreamingContent((prev) => ({ ...prev, [nodeId]: "" }))
    },
    onNodeComplete: (nodeId, output) => {
      setCurrentStreamingNodeId(null)
    },
    onNodeError: (nodeId, err) => {
      setError(err.message)
    },
    onStreamToken: (event: StreamEvent) => {
      if (event.content) {
        setStreamingContent((prev) => ({
          ...prev,
          [event.nodeId]: (prev[event.nodeId] || "") + event.content,
        }))
      }
    },
    onExecutionComplete: (execution) => {
      setCurrentExecution(execution)
      setNodeExecutions(execution.nodeExecutions)
      setIsExecuting(false)
    },
  }

  const executeWorkflow = useCallback(
    async (workflow: VerbaPathWorkflow, studentId: string) => {
      setIsExecuting(true)
      setError(null)
      setStreamingContent({})
      setNodeExecutions([])

      // TODO: Fetch student profile from database
      const mockStudent = {
        id: studentId,
        firstName: "Student",
        lastName: "Test",
        gradeLevel: "4" as const,
        nativeLanguage: "mandarin" as const,
        additionalLanguages: [],
        elpaLevel: 2 as const,
        literacyLevel: 2 as const,
        numeracyLevel: 3 as const,
        learningStyles: ["visual" as const],
        interests: [],
        culturalBackground: "",
        accommodations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        schoolId: "",
        teacherId: "",
      }

      executorRef.current = new WorkflowExecutor({ enableStreaming: true }, callbacks)

      try {
        await executorRef.current.execute(workflow, mockStudent)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Execution failed")
        setIsExecuting(false)
      }
    },
    [], // Removed callbacks from dependency array
  )

  const pauseExecution = useCallback(() => {
    executorRef.current?.pause()
    setIsPaused(true)
  }, [])

  const resumeExecution = useCallback(async () => {
    await executorRef.current?.resume()
    setIsPaused(false)
  }, [])

  const cancelExecution = useCallback(() => {
    executorRef.current?.cancel()
    getStreamManager().cancelAll()
    setIsExecuting(false)
    setIsPaused(false)
  }, [])

  return (
    <ExecutionContext.Provider
      value={{
        currentExecution,
        isExecuting,
        isPaused,
        streamingContent,
        currentStreamingNodeId,
        executeWorkflow,
        pauseExecution,
        resumeExecution,
        cancelExecution,
        nodeExecutions,
        error,
      }}
    >
      {children}
    </ExecutionContext.Provider>
  )
}

export function useExecution() {
  const context = useContext(ExecutionContext)
  if (context === undefined) {
    throw new Error("useExecution must be used within an ExecutionProvider")
  }
  return context
}
