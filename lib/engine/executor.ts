/**
 * Workflow Executor
 * Core execution engine for running VerbaPath workflows
 * Implements DAG traversal with support for parallel execution, 
 * conditional branching, and streaming responses
 */

import type { WorkflowExecution, ExecutionContext, StreamEvent, NodeExecution } from "@/lib/types/execution"
import type { VerbaPathWorkflow, VerbaPathNode } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"
import { getNodeRunner, type NodeRunnerResult } from "./node-runners"

export interface ExecutorConfig {
  maxConcurrentNodes: number
  defaultTimeout: number
  enableStreaming: boolean
  debugMode: boolean
}

export interface ExecutorCallbacks {
  onNodeStart?: (nodeId: string, node: VerbaPathNode) => void
  onNodeComplete?: (nodeId: string, output: Record<string, unknown>) => void
  onNodeError?: (nodeId: string, error: Error) => void
  onStreamToken?: (event: StreamEvent) => void
  onExecutionComplete?: (execution: WorkflowExecution) => void
  onProgress?: (progress: number, totalNodes: number, completedNodes: number) => void
}

interface ExecutionNode {
  id: string
  node: VerbaPathNode
  dependencies: string[]
  dependents: string[]
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  output?: Record<string, unknown>
  error?: Error
}

export class WorkflowExecutor {
  private config: ExecutorConfig
  private callbacks: ExecutorCallbacks
  private currentExecution: WorkflowExecution | null = null
  private executionGraph: Map<string, ExecutionNode> = new Map()
  private nodeOutputs: Map<string, Record<string, unknown>> = new Map()

  constructor(config: Partial<ExecutorConfig> = {}, callbacks: ExecutorCallbacks = {}) {
    this.config = {
      maxConcurrentNodes: config.maxConcurrentNodes ?? 3,
      defaultTimeout: config.defaultTimeout ?? 30000,
      enableStreaming: config.enableStreaming ?? true,
      debugMode: config.debugMode ?? false,
    }
    this.callbacks = callbacks
  }

  /**
   * Execute a workflow for a given student
   */
  async execute(workflow: VerbaPathWorkflow, student: StudentProfile): Promise<WorkflowExecution> {
    // Reset state
    this.executionGraph.clear()
    this.nodeOutputs.clear()

    // Initialize execution context
    const context: ExecutionContext = {
      studentProfile: this.serializeStudent(student),
      variables: {},
      conversationHistory: [],
      accumulatedContent: [],
      currentLanguageLevel: student.elpaLevel,
      adaptations: [],
    }

    // Create execution record
    this.currentExecution = {
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      studentId: student.id,
      status: "running",
      startedAt: new Date(),
      currentNodeId: this.findEntryNode(workflow),
      nodeExecutions: [],
      context,
    }

    try {
      // Build execution graph
      this.buildExecutionGraph(workflow)

      // Execute workflow graph using topological traversal
      await this.executeGraph(workflow, context)

      this.currentExecution.status = "completed"
      this.currentExecution.completedAt = new Date()
    } catch (error) {
      this.currentExecution.status = "failed"
      this.currentExecution.error = {
        code: "EXECUTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        recoverable: false,
      }
    }

    this.callbacks.onExecutionComplete?.(this.currentExecution)
    return this.currentExecution
  }

  /**
   * Pause execution at current node
   */
  pause(): void {
    if (this.currentExecution) {
      this.currentExecution.status = "paused"
      this.pausedNodeId = this.currentExecution.currentNodeId
    }
  }

  /**
   * Resume paused execution with optional user input
   */
  async resume(userInput?: Record<string, unknown>): Promise<WorkflowExecution | null> {
    if (!this.currentExecution || this.currentExecution.status !== "paused") {
      return null
    }
    
    this.currentExecution.status = "running"
    
    // If we have user input, store it for the paused node
    if (userInput && this.pausedNodeId) {
      const existingOutput = this.nodeOutputs.get(this.pausedNodeId) || {}
      this.nodeOutputs.set(this.pausedNodeId, {
        ...existingOutput,
        userInput,
        userResponse: userInput.answer || userInput.response || userInput,
      })
      
      // Mark the paused node as completed
      const pausedExecNode = this.executionGraph.get(this.pausedNodeId)
      if (pausedExecNode && pausedExecNode.status === "pending") {
        pausedExecNode.status = "completed"
        pausedExecNode.output = this.nodeOutputs.get(this.pausedNodeId)
        
        // Record the user input as a node execution
        const nodeExecution: NodeExecution = {
          nodeId: this.pausedNodeId,
          nodeType: pausedExecNode.node.type,
          startedAt: new Date(),
          completedAt: new Date(),
          status: "completed",
          input: {},
          output: pausedExecNode.output || {},
        }
        this.currentExecution.nodeExecutions.push(nodeExecution)
        
        this.callbacks.onNodeComplete?.(this.pausedNodeId, pausedExecNode.output || {})
      }
    }
    
    // Clear paused state
    this.pausedNodeId = null
    
    // Continue execution from where we left off
    try {
      // Find remaining nodes to execute
      const remainingPending = Array.from(this.executionGraph.values()).some(
        (n) => n.status === "pending"
      )
      
      if (remainingPending && this.currentExecution.context) {
        await this.executeGraph(
          { nodes: [], edges: [] } as unknown as VerbaPathWorkflow, 
          this.currentExecution.context
        )
        
        // Only mark complete if not paused again during execution
        if ((this.currentExecution.status as string) !== "paused") {
          this.currentExecution.status = "completed"
          this.currentExecution.completedAt = new Date()
        }
      } else if (!remainingPending) {
        this.currentExecution.status = "completed"
        this.currentExecution.completedAt = new Date()
      }
    } catch (error) {
      this.currentExecution.status = "failed"
      this.currentExecution.error = {
        code: "RESUME_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        recoverable: false,
      }
    }
    
    if (this.currentExecution.status === "completed" || this.currentExecution.status === "failed") {
      this.callbacks.onExecutionComplete?.(this.currentExecution)
    }
    
    return this.currentExecution
  }

  /**
   * Check if execution is awaiting user input
   */
  isAwaitingInput(): boolean {
    return this.currentExecution?.status === "paused" && this.pausedNodeId !== null
  }

  /**
   * Get the current node awaiting input
   */
  getAwaitingInputNode(): { nodeId: string; nodeType: string; prompt?: string } | null {
    if (!this.pausedNodeId || this.currentExecution?.status !== "paused") {
      return null
    }
    
    const execNode = this.executionGraph.get(this.pausedNodeId)
    if (!execNode) return null
    
    return {
      nodeId: this.pausedNodeId,
      nodeType: execNode.node.type,
      prompt: (execNode.output as Record<string, unknown>)?.prompt as string,
    }
  }

  private pausedNodeId: string | null = null

  /**
   * Cancel execution
   */
  cancel(): void {
    if (this.currentExecution) {
      this.currentExecution.status = "failed"
      this.currentExecution.error = {
        code: "CANCELLED",
        message: "Execution cancelled by user",
        recoverable: false,
      }
    }
  }

  /**
   * Build the internal execution graph from workflow
   */
  private buildExecutionGraph(workflow: VerbaPathWorkflow): void {
    // Create execution nodes
    for (const node of workflow.nodes) {
      this.executionGraph.set(node.id, {
        id: node.id,
        node,
        dependencies: [],
        dependents: [],
        status: "pending",
      })
    }

    // Build dependency relationships from edges
    for (const edge of workflow.edges) {
      const sourceNode = this.executionGraph.get(edge.source)
      const targetNode = this.executionGraph.get(edge.target)

      if (sourceNode && targetNode) {
        sourceNode.dependents.push(edge.target)
        targetNode.dependencies.push(edge.source)
      }
    }
  }

  /**
   * Execute the workflow graph using topological traversal
   */
  private async executeGraph(workflow: VerbaPathWorkflow, context: ExecutionContext): Promise<void> {
    const totalNodes = workflow.nodes.length
    let completedNodes = 0

    // Find all nodes that can start (no dependencies or all dependencies met)
    const getReadyNodes = (): ExecutionNode[] => {
      const ready: ExecutionNode[] = []
      
      for (const execNode of this.executionGraph.values()) {
        if (execNode.status !== "pending") continue
        
        // Check if all dependencies are completed
        const allDepsCompleted = execNode.dependencies.every((depId) => {
          const dep = this.executionGraph.get(depId)
          return dep?.status === "completed" || dep?.status === "skipped"
        })
        
        if (allDepsCompleted) {
          ready.push(execNode)
        }
      }
      
      return ready
    }

    // Execute nodes in waves
    while (true) {
      const readyNodes = getReadyNodes()
      
      if (readyNodes.length === 0) {
        // Check if we have any pending nodes left
        const hasPending = Array.from(this.executionGraph.values()).some(
          (n) => n.status === "pending"
        )
        
        if (hasPending) {
          // There's a cycle or unresolved dependency
          throw new Error("Workflow has unresolvable dependencies or cycles")
        }
        
        // All nodes processed
        break
      }

      // Execute ready nodes (up to maxConcurrent)
      const nodesToExecute = readyNodes.slice(0, this.config.maxConcurrentNodes)
      
      await Promise.all(
        nodesToExecute.map(async (execNode) => {
          try {
            // Check for pause/cancel
            if (this.currentExecution?.status === "paused" || 
                this.currentExecution?.status === "failed") {
              return
            }

            execNode.status = "running"
            this.currentExecution!.currentNodeId = execNode.id
            
            // Notify start
            this.callbacks.onNodeStart?.(execNode.id, execNode.node)
            
            // Gather inputs from dependencies
            const inputs = this.gatherInputs(execNode)
            
            // Execute the node
            const result = await this.executeNode(execNode.node, inputs, context)

            // Handle pause request from node
            if (result.shouldPause) {
              execNode.status = "pending" // Reset to pending
              this.pause()
              return
            }
            
            // Store output
            execNode.output = result.output
            execNode.status = "completed"
            this.nodeOutputs.set(execNode.id, result.output)
            
            // Record execution
            const nodeExecution: NodeExecution = {
              nodeId: execNode.id,
              nodeType: execNode.node.type,
              startedAt: new Date(),
              completedAt: new Date(),
              status: "completed",
              input: inputs,
              output: result.output,
            }
            this.currentExecution!.nodeExecutions.push(nodeExecution)
            
            // Notify completion
            this.callbacks.onNodeComplete?.(execNode.id, result.output)
            
            completedNodes++
            this.callbacks.onProgress?.(
              (completedNodes / totalNodes) * 100,
              totalNodes,
              completedNodes
            )
            
            // Handle routing to next node if specified
            if (result.nextNodeId) {
              // Skip other dependents if router specified a path
              for (const depId of execNode.dependents) {
                if (depId !== result.nextNodeId) {
                  const skipNode = this.executionGraph.get(depId)
                  if (skipNode) {
                    skipNode.status = "skipped"
                  }
                }
              }
            }
          } catch (error) {
            execNode.status = "failed"
            execNode.error = error instanceof Error ? error : new Error(String(error))
            
            // Record failed execution
            const nodeExecution: NodeExecution = {
              nodeId: execNode.id,
              nodeType: execNode.node.type,
              startedAt: new Date(),
              completedAt: new Date(),
              status: "failed",
              input: {},
              output: {},
              error: execNode.error.message,
            }
            this.currentExecution!.nodeExecutions.push(nodeExecution)
            
            // Notify error
            this.callbacks.onNodeError?.(execNode.id, execNode.error)
            
            // Propagate failure if not recoverable
            throw execNode.error
          }
        })
      )
    }
  }

  /**
   * Gather inputs from completed dependency nodes
   */
  private gatherInputs(execNode: ExecutionNode): Record<string, unknown> {
    const inputs: Record<string, unknown> = {}
    
    for (const depId of execNode.dependencies) {
      const depOutput = this.nodeOutputs.get(depId)
      if (depOutput) {
        // Merge outputs from all dependencies
        Object.assign(inputs, depOutput)
      }
    }
    
    return inputs
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: VerbaPathNode,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<NodeRunnerResult> {
    const runner = getNodeRunner(node.type)
    
    if (!runner) {
      // Default runner for unknown node types - just pass through
      // Debug mode logging handled via callbacks.onLog
      return {
        output: {
          ...inputs,
          _nodeType: node.type,
          _nodeLabel: node.data.label,
        },
      }
    }
    
    // Wire streaming hook if enabled
    const streamingEnabled = Boolean(this.config.enableStreaming && this.callbacks.onStreamToken)
    let emittedStreamTokens = false

    const emitStreamToken = streamingEnabled
      ? (token: string) => {
          emittedStreamTokens = true
          this.callbacks.onStreamToken?.({
            type: "token",
            nodeId: node.id,
            content: token,
            timestamp: new Date(),
          })
        }
      : undefined

    const contextWithStreaming = context as ExecutionContext & { emitStreamToken?: (token: string) => void }
    contextWithStreaming.emitStreamToken = emitStreamToken

    // Execute with timeout (clear timer after completion to avoid orphan rejections)
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`Node execution timed out after ${this.config.defaultTimeout}ms`)),
        this.config.defaultTimeout,
      )
    })
    
    try {
      const result = await Promise.race([
        runner(node, inputs, contextWithStreaming),
        timeoutPromise,
      ])

      if (!emittedStreamTokens && result.streamContent && emitStreamToken) {
        emitStreamToken(String(result.streamContent))
      }
      
      return result
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  /**
   * Find the entry node (no incoming edges)
   */
  private findEntryNode(workflow: VerbaPathWorkflow): string {
    const targetNodeIds = new Set(workflow.edges.map((e) => e.target))
    const entryNode = workflow.nodes.find((n) => !targetNodeIds.has(n.id))
    return entryNode?.id ?? workflow.nodes[0]?.id ?? ""
  }

  /**
   * Serialize student profile for context
   */
  private serializeStudent(student: StudentProfile): Record<string, unknown> {
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      gradeLevel: student.gradeLevel,
      nativeLanguage: student.nativeLanguage,
      additionalLanguages: student.additionalLanguages,
      elpaLevel: student.elpaLevel,
      interests: student.interests,
      accommodations: student.accommodations,
      learningStyles: student.learningStyles,
    }
  }

  /**
   * Get current execution state
   */
  getExecutionState(): WorkflowExecution | null {
    return this.currentExecution
  }

  /**
   * Get outputs for all completed nodes
   */
  getNodeOutputs(): Map<string, Record<string, unknown>> {
    return new Map(this.nodeOutputs)
  }
}

/**
 * Factory function to create an executor
 */
export const createExecutor = (
  config?: Partial<ExecutorConfig>, 
  callbacks?: ExecutorCallbacks
): WorkflowExecutor => {
  return new WorkflowExecutor(config, callbacks)
}
