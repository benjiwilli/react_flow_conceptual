/**
 * Reading Passage Generator Node
 * Creates leveled reading passages with comprehension supports
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { FileText, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type PassageGenre = "narrative" | "informational" | "procedural" | "persuasive" | "poetry"

export interface ReadingPassageNodeData {
  label: string
  genre: PassageGenre
  topic?: string
  targetWordCount: number
  readabilityTarget: "auto" | "lexile" | "grade-level"
  readabilityValue?: number
  includeVocabularyHighlighting: boolean
  includeComprehensionQuestions: boolean
  culturallyRelevant: boolean
}

export const ReadingPassageNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ReadingPassageNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-indigo-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-indigo-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
          <FileText className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Reading Passage"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 capitalize">
          <span>Genre: {nodeData.genre || "narrative"}</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart2 className="h-3 w-3" />
          <span>{nodeData.targetWordCount || 200} words</span>
        </div>
        {nodeData.topic && <div className="text-muted-foreground truncate">Topic: {nodeData.topic}</div>}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-indigo-500 bg-white"
      />
    </div>
  )
})

ReadingPassageNode.displayName = "ReadingPassageNode"
