"use client"

/**
 * Preview Context
 * Manages preview state for workflow testing
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Node, Edge } from "@xyflow/react"

export interface PreviewNode {
  id: string
  type: string
  label: string
  status: "pending" | "active" | "completed" | "error"
  data: Record<string, unknown>
  output?: unknown
  error?: string
}

export interface PreviewState {
  isActive: boolean
  isPaused: boolean
  currentNodeId: string | null
  executedNodes: PreviewNode[]
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  startTime?: Date
  endTime?: Date
  error?: string
}

export interface PreviewContextType {
  previewState: PreviewState
  startPreview: (nodes: Node[], edges: Edge[], initialInputs?: Record<string, unknown>) => Promise<void>
  stopPreview: () => void
  pausePreview: () => void
  resumePreview: () => void
  stepThrough: () => Promise<void>
  resetPreview: () => void
  setInputValue: (key: string, value: unknown) => void
  isLoading: boolean
}

const initialState: PreviewState = {
  isActive: false,
  isPaused: false,
  currentNodeId: null,
  executedNodes: [],
  inputs: {},
  outputs: {},
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined)

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [previewState, setPreviewState] = useState<PreviewState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [workflowData, setWorkflowData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [executionQueue, setExecutionQueue] = useState<string[]>([])

  // Build execution order from nodes and edges
  const buildExecutionOrder = useCallback((nodes: Node[], edges: Edge[]): string[] => {
    const inDegree = new Map<string, number>()
    const adjacencyList = new Map<string, string[]>()

    // Initialize
    nodes.forEach((node) => {
      inDegree.set(node.id, 0)
      adjacencyList.set(node.id, [])
    })

    // Build graph
    edges.forEach((edge) => {
      const targets = adjacencyList.get(edge.source) || []
      targets.push(edge.target)
      adjacencyList.set(edge.source, targets)
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })

    // Topological sort (Kahn's algorithm)
    const queue: string[] = []
    const result: string[] = []

    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId)
    })

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      result.push(nodeId)

      const neighbors = adjacencyList.get(nodeId) || []
      neighbors.forEach((neighbor) => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) queue.push(neighbor)
      })
    }

    return result
  }, [])

  const executeNode = useCallback(
    async (nodeId: string, inputs: Record<string, unknown>): Promise<{ output: unknown; error?: string }> => {
      if (!workflowData) {
        return { output: null, error: "No workflow data" }
      }

      const node = workflowData.nodes.find((n) => n.id === nodeId)
      if (!node) {
        return { output: null, error: `Node ${nodeId} not found` }
      }

      try {
        // Simulate execution - in production, this would call the actual execution API
        const response = await fetch("/api/preview/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeId,
            nodeType: node.type,
            nodeData: node.data,
            inputs,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          return { output: null, error }
        }

        const result = await response.json()
        return { output: result.output }
      } catch (error) {
        return { output: null, error: String(error) }
      }
    },
    [workflowData]
  )

  const startPreview = useCallback(
    async (nodes: Node[], edges: Edge[], initialInputs: Record<string, unknown> = {}) => {
      setIsLoading(true)
      setWorkflowData({ nodes, edges })

      const executionOrder = buildExecutionOrder(nodes, edges)
      setExecutionQueue(executionOrder)

      setPreviewState({
        isActive: true,
        isPaused: false,
        currentNodeId: executionOrder[0] || null,
        executedNodes: nodes.map((n) => ({
          id: n.id,
          type: n.type || "unknown",
          label: (n.data as { label?: string })?.label || n.id,
          status: "pending",
          data: n.data as Record<string, unknown>,
        })),
        inputs: initialInputs,
        outputs: {},
        startTime: new Date(),
      })

      setIsLoading(false)

      // Auto-execute if not in step mode
      // For now, we'll just set up the state and let stepThrough handle execution
    },
    [buildExecutionOrder]
  )

  const stepThrough = useCallback(async () => {
    if (!previewState.isActive || previewState.isPaused || executionQueue.length === 0) {
      return
    }

    setIsLoading(true)

    const currentNodeId = executionQueue[0]
    const remainingQueue = executionQueue.slice(1)

    // Update current node to active
    setPreviewState((prev) => ({
      ...prev,
      currentNodeId,
      executedNodes: prev.executedNodes.map((n) =>
        n.id === currentNodeId ? { ...n, status: "active" } : n
      ),
    }))

    // Execute the node
    const result = await executeNode(currentNodeId, previewState.inputs)

    // Update node status based on result
    setPreviewState((prev) => ({
      ...prev,
      currentNodeId: remainingQueue[0] || null,
      executedNodes: prev.executedNodes.map((n) =>
        n.id === currentNodeId
          ? {
              ...n,
              status: result.error ? "error" : "completed",
              output: result.output,
              error: result.error,
            }
          : n
      ),
      outputs: {
        ...prev.outputs,
        [currentNodeId]: result.output,
      },
      inputs: {
        ...prev.inputs,
        // Pass outputs to next nodes as inputs
        [`${currentNodeId}_output`]: result.output,
      },
      error: result.error,
    }))

    setExecutionQueue(remainingQueue)

    // Check if execution is complete
    if (remainingQueue.length === 0) {
      setPreviewState((prev) => ({
        ...prev,
        isActive: false,
        endTime: new Date(),
      }))
    }

    setIsLoading(false)
  }, [previewState, executionQueue, executeNode])

  const stopPreview = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isActive: false,
      endTime: new Date(),
    }))
    setExecutionQueue([])
    setWorkflowData(null)
  }, [])

  const pausePreview = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isPaused: true,
    }))
  }, [])

  const resumePreview = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isPaused: false,
    }))
  }, [])

  const resetPreview = useCallback(() => {
    setPreviewState(initialState)
    setExecutionQueue([])
    setWorkflowData(null)
  }, [])

  const setInputValue = useCallback((key: string, value: unknown) => {
    setPreviewState((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [key]: value,
      },
    }))
  }, [])

  return (
    <PreviewContext.Provider
      value={{
        previewState,
        startPreview,
        stopPreview,
        pausePreview,
        resumePreview,
        stepThrough,
        resetPreview,
        setInputValue,
        isLoading,
      }}
    >
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  const context = useContext(PreviewContext)
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider")
  }
  return context
}
