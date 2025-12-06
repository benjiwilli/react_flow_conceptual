/**
 * Workflow Execution Types for LinguaFlow
 * Managing AI orchestration and node execution
 */

export type ExecutionStatus = "pending" | "running" | "paused" | "completed" | "failed" | "awaiting-input"

export type NodeExecutionStatus = "pending" | "running" | "completed" | "failed" | "skipped"

export interface WorkflowExecution {
  id: string
  workflowId: string
  studentId: string
  status: ExecutionStatus
  startedAt: Date
  completedAt?: Date
  currentNodeId: string
  nodeExecutions: NodeExecution[]
  context: ExecutionContext
  error?: ExecutionError
}

export interface NodeExecution {
  id: string
  nodeId: string
  nodeType: string
  status: NodeExecutionStatus
  startedAt: Date
  completedAt?: Date
  input: Record<string, unknown>
  output: Record<string, unknown>
  tokensUsed?: number
  modelUsed?: string
  streamedContent?: string
  error?: string
}

export interface ExecutionContext {
  studentProfile: Record<string, unknown>
  variables: Record<string, unknown>
  conversationHistory: ConversationMessage[]
  accumulatedContent: string[]
  currentLanguageLevel: number
  adaptations: string[]
}

export interface ConversationMessage {
  role: "system" | "user" | "assistant"
  content: string
  timestamp: Date
  nodeId?: string
}

export interface ExecutionError {
  code: string
  message: string
  nodeId?: string
  recoverable: boolean
  suggestion?: string
}

export interface StreamEvent {
  type: "start" | "token" | "complete" | "error" | "node-change"
  nodeId: string
  content?: string
  timestamp: Date
}
