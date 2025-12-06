/**
 * Comprehension Check Node
 * Assesses student understanding with scaffolded questions
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { ClipboardCheck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type QuestionType = "multiple-choice" | "short-answer" | "true-false" | "sequencing" | "matching" | "fill-blank"

export interface ComprehensionCheckNodeData {
  label: string
  questionTypes: QuestionType[]
  numberOfQuestions: number
  difficultyLevel: "scaffolded" | "grade-level" | "challenging"
  provideHints: boolean
  allowRetries: boolean
  showCorrectAnswers: boolean
  adaptToELPA: boolean
}

export const ComprehensionCheckNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ComprehensionCheckNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-green-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-green-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <ClipboardCheck className="h-4 w-4 text-green-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Comprehension Check"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3" />
          <span>{nodeData.numberOfQuestions || 5} questions</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.adaptToELPA && (
            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px]">ELPA-adapted</span>
          )}
          {nodeData.allowRetries && (
            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px]">retries</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-green-500 bg-white"
      />
    </div>
  )
})

ComprehensionCheckNode.displayName = "ComprehensionCheckNode"
