/**
 * useWorkflowExecution Hook
 * Manages workflow execution lifecycle
 */

"use client"

import { useState, useCallback, useRef } from "react"
import type { WorkflowExecution, StreamEvent } from "@/lib/types/execution"
import type { LinguaFlowWorkflow } from "@/lib/types/workflow"
import { getStreamManager } from "@/lib/engine/stream-manager"

interface UseWorkflowExecutionOptions {
  onNodeStart?: (nodeId: string) => void
  onNodeComplete?: (nodeId: string, output: Record<string, unknown>) => void
  onStreamToken?: (event: StreamEvent) => void
  onComplete?: (execution: WorkflowExecution) => void
  onError?: (error: Error) => void
}

interface UseWorkflowExecutionReturn {
  execution: WorkflowExecution | null
  isRunning: boolean
  isPaused: boolean
  currentNodeId: string | null
  streamContent: string

  execute: (workflow: LinguaFlowWorkflow, studentId: string) => Promise<void>
  pause: () => void
  resume: () => Promise<void>
  cancel: () => void
  reset: () => void
}

export function useWorkflowExecution(options: UseWorkflowExecutionOptions = {}): UseWorkflowExecutionReturn {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [streamContent, setStreamContent] = useState("")

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(
    async (workflow: LinguaFlowWorkflow, studentId: string) => {
      setIsRunning(true)
      setIsPaused(false)
      setStreamContent("")

      abortControllerRef.current = new AbortController()

      // Subscribe to stream events
      const streamManager = getStreamManager()

      try {
        // TODO: Call execution API
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflowId: workflow.id, studentId }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) throw new Error("Execution failed")

        const result = await response.json()
        setExecution(result)
        options.onComplete?.(result)
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          options.onError?.(err)
        }
      } finally {
        setIsRunning(false)
      }
    },
    [options],
  )

  const pause = useCallback(() => {
    setIsPaused(true)
    // TODO: Send pause signal to server
  }, [])

  const resume = useCallback(async () => {
    setIsPaused(false)
    // TODO: Send resume signal to server
  }, [])

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    getStreamManager().cancelAll()
    setIsRunning(false)
    setIsPaused(false)
  }, [])

  const reset = useCallback(() => {
    setExecution(null)
    setIsRunning(false)
    setIsPaused(false)
    setCurrentNodeId(null)
    setStreamContent("")
  }, [])

  return {
    execution,
    isRunning,
    isPaused,
    currentNodeId,
    streamContent,
    execute,
    pause,
    resume,
    cancel,
    reset,
  }
}
