/**
 * Vocabulary Builder Node
 * Extracts and teaches key vocabulary with multiple modalities
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { BookOpen, Volume2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type VocabularyFocus = "academic" | "content-specific" | "high-frequency" | "tier-2" | "tier-3"

export interface VocabularyBuilderNodeData {
  label: string
  vocabularyFocus: VocabularyFocus
  maxWords: number
  includeDefinitions: boolean
  includeExamples: boolean
  includeImages: boolean
  includeAudio: boolean
  includeL1Translation: boolean
  practiceActivities: ("matching" | "fill-blank" | "context-clues" | "word-sort")[]
}

export const VocabularyBuilderNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as VocabularyBuilderNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-amber-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-amber-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <BookOpen className="h-4 w-4 text-amber-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Vocabulary Builder"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Focus: {nodeData.vocabularyFocus || "academic"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Max words: {nodeData.maxWords || 10}</span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {nodeData.includeAudio && <Volume2 className="h-4 w-4 text-amber-600" />}
          {nodeData.includeImages && <ImageIcon className="h-4 w-4 text-amber-600" />}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-amber-500 bg-white"
      />
    </div>
  )
})

VocabularyBuilderNode.displayName = "VocabularyBuilderNode"
