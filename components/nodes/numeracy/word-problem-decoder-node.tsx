/**
 * Word Problem Decoder Node
 * Deconstructs math word problems for ESL learners
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Calculator, Puzzle } from "lucide-react"
import { cn } from "@/lib/utils"

export type MathOperation =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "mixed"
  | "fractions"
  | "decimals"
  | "percentages"

export interface WordProblemDecoderNodeData {
  label: string
  operations: MathOperation[]
  showVisualRepresentation: boolean
  highlightKeyWords: boolean
  extractMathVocabulary: boolean
  provideL1Support: boolean
  stepByStepBreakdown: boolean
  culturalContextAdaptation: boolean
}

export const WordProblemDecoderNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as WordProblemDecoderNodeData

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-orange-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-orange-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
          <Puzzle className="h-4 w-4 text-orange-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Word Problem Decoder"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calculator className="h-3 w-3" />
          <span>{nodeData.operations?.length || 0} operations</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.showVisualRepresentation && (
            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px]">visual</span>
          )}
          {nodeData.stepByStepBreakdown && (
            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px]">step-by-step</span>
          )}
          {nodeData.provideL1Support && (
            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px]">L1 support</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-orange-500 bg-white"
      />
    </div>
  )
})

WordProblemDecoderNode.displayName = "WordProblemDecoderNode"
