/**
 * Extended Workflow Types for LinguaFlow
 * Building on existing React Flow types
 */

import type { Node, Edge } from "@xyflow/react"

export type LinguaFlowNodeType =
  // ESL Nodes
  | "student-profile"
  | "scaffolded-content"
  | "l1-bridge"
  | "vocabulary-builder"
  | "comprehensible-input"
  | "oral-practice"
  | "reading-passage"
  // Numeracy Nodes
  | "word-problem-decoder"
  | "visual-math"
  | "math-vocabulary"
  | "step-by-step-solver"
  // Assessment Nodes
  | "comprehension-check"
  | "speaking-assessment"
  | "progress-tracker"
  | "feedback-generator"
  // Orchestration Nodes
  | "ai-model"
  | "router"
  | "loop"
  | "parallel"
  | "human-in-loop"
  | "conditional"
  // Original Nodes
  | "input"
  | "output"
  | "process"
  | "code"

// LinguaFlowNode uses Node type with a generic Record to satisfy the constraint
export type LinguaFlowNode = Node<Record<string, unknown> & Partial<LinguaFlowNodeData>, LinguaFlowNodeType>

export interface LinguaFlowNodeData {
  label: string
  description?: string
  config: Record<string, unknown>
  inputs: NodePort[]
  outputs: NodePort[]
  validationErrors?: string[]
}

export interface NodePort {
  id: string
  name: string
  type: "string" | "number" | "boolean" | "array" | "object" | "any"
  required: boolean
  description?: string
}

export interface LinguaFlowWorkflow {
  id: string
  name: string
  description: string
  nodes: LinguaFlowNode[]
  edges: Edge[]
  targetGrades: string[]
  targetELPALevels: number[]
  curriculumOutcomes: string[]
  estimatedDuration: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isTemplate: boolean
  category: WorkflowCategory
}

export type WorkflowCategory =
  | "literacy"
  | "numeracy"
  | "oral-language"
  | "vocabulary"
  | "comprehension"
  | "writing"
  | "custom"
