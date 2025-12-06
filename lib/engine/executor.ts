/**
 * Workflow Executor
 * Core execution engine for running LinguaFlow workflows
 * Implements DAG traversal with support for parallel execution, 
 * conditional branching, and streaming responses
 */

import type { WorkflowExecution, ExecutionContext, StreamEvent, NodeExecution } from "@/lib/types/execution"
import type { LinguaFlowWorkflow, LinguaFlowNode } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"
import { getNodeRunner, type NodeRunnerResult } from "./node-runners"

export interface ExecutorConfig {
  maxConcurrentNodes: number
  defaultTimeout: number
  enableStreaming: boolean
  debugMode: boolean
}

export interface ExecutorCallbacks {
  onNodeStart?: (nodeId: string, node: LinguaFlowNode) => void
  onNodeComplete?: (nodeId: string, output: Record<string, unknown>) => void
  onNodeError?: (nodeId: string, error: Error) => void
  onStreamToken?: (event: StreamEvent) => void
  onExecutionComplete?: (execution: WorkflowExecution) => void
  onProgress?: (progress: number, totalNodes: number, completedNodes: number) => void
}

interface ExecutionNode {
  id: string
  node: LinguaFlowNode
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
  async execute(workflow: LinguaFlowWorkflow, student: StudentProfile): Promise<WorkflowExecution> {
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
    }
  }

  /**
   * Resume paused execution with optional user input
   */
  async resume(userInput?: Record<string, unknown>): Promise<void> {
    if (this.currentExecution?.status === "paused") {
      this.currentExecution.status = "running"
      
      // If we have user input, store it for the current node
      if (userInput && this.currentExecution.currentNodeId) {
        this.nodeOutputs.set(this.currentExecution.currentNodeId, userInput)
      }
      
      // Continue execution from where we left off
      // This would require storing more state - simplified for now
    }
  }

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
  private buildExecutionGraph(workflow: LinguaFlowWorkflow): void {
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
  private async executeGraph(workflow: LinguaFlowWorkflow, context: ExecutionContext): Promise<void> {
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
    node: LinguaFlowNode,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<NodeRunnerResult> {
    const runner = getNodeRunner(node.type)
    
    if (!runner) {
      // Default runner for unknown node types - just pass through
      if (this.config.debugMode) {
        console.log(`No runner found for node type: ${node.type}, using passthrough`)
      }
      return {
        output: {
          ...inputs,
          _nodeType: node.type,
          _nodeLabel: node.data.label,
        },
      }
    }
    
    // Execute with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Node execution timed out after ${this.config.defaultTimeout}ms`)), 
        this.config.defaultTimeout)
    })
    
    const result = await Promise.race([
      runner(node, inputs, context),
      timeoutPromise,
    ])
    
    return result
  }

  /**
   * Find the entry node (no incoming edges)
   */
  private findEntryNode(workflow: LinguaFlowWorkflow): string {
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
