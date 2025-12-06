/**
 * Workflow Executor
 * Core execution engine for running LinguaFlow workflows
 */

import type { WorkflowExecution, ExecutionContext, StreamEvent } from "@/lib/types/execution"
import type { LinguaFlowWorkflow, LinguaFlowNode } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"

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
}

export class WorkflowExecutor {
  private config: ExecutorConfig
  private callbacks: ExecutorCallbacks
  private currentExecution: WorkflowExecution | null = null

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
      // Execute workflow graph
      await this.executeGraph(workflow)

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
   * Resume paused execution
   */
  async resume(): Promise<void> {
    if (this.currentExecution?.status === "paused") {
      this.currentExecution.status = "running"
      // Continue from current node
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

  private async executeGraph(workflow: LinguaFlowWorkflow): Promise<void> {
    // TODO: Implement topological sort and graph traversal
    // This is a placeholder for the full implementation
  }

  private findEntryNode(workflow: LinguaFlowWorkflow): string {
    // Find node with no incoming edges (entry point)
    const targetNodeIds = new Set(workflow.edges.map((e) => e.target))
    const entryNode = workflow.nodes.find((n) => !targetNodeIds.has(n.id))
    return entryNode?.id ?? workflow.nodes[0]?.id ?? ""
  }

  private serializeStudent(student: StudentProfile): Record<string, unknown> {
    return {
      id: student.id,
      firstName: student.firstName,
      gradeLevel: student.gradeLevel,
      nativeLanguage: student.nativeLanguage,
      elpaLevel: student.elpaLevel,
      interests: student.interests,
      accommodations: student.accommodations,
    }
  }
}

export const createExecutor = (config?: Partial<ExecutorConfig>, callbacks?: ExecutorCallbacks): WorkflowExecutor => {
  return new WorkflowExecutor(config, callbacks)
}
