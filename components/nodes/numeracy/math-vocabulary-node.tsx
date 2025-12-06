/**
 * Math Vocabulary Node
 * Teaches mathematical vocabulary with ESL supports
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Hash, BookText } from "lucide-react"
import { cn } from "@/lib/utils"

export type MathVocabCategory =
  | "operations"
  | "geometry"
  | "measurement"
  | "data-analysis"
  | "algebra"
  | "fractions"
  | "place-value"

export interface MathVocabularyNodeData {
  label: string
  categories: MathVocabCategory[]
  includeSymbols: boolean
  includeExamples: boolean
  includeL1Translations: boolean
  includeVisualDefinitions: boolean
  practiceProblems: boolean
  wordWall: boolean
}

export const MathVocabularyNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as MathVocabularyNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-lime-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-lime-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-100">
          <Hash className="h-4 w-4 text-lime-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Math Vocabulary"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <BookText className="h-3 w-3" />
          <span>{nodeData.categories?.length || 0} categories</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.includeVisualDefinitions && (
            <span className="px-1.5 py-0.5 rounded bg-lime-100 text-lime-700 text-[10px]">visual</span>
          )}
          {nodeData.includeL1Translations && (
            <span className="px-1.5 py-0.5 rounded bg-lime-100 text-lime-700 text-[10px]">L1</span>
          )}
          {nodeData.wordWall && (
            <span className="px-1.5 py-0.5 rounded bg-lime-100 text-lime-700 text-[10px]">word wall</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-lime-500 bg-white"
      />
    </div>
  )
})

MathVocabularyNode.displayName = "MathVocabularyNode"
