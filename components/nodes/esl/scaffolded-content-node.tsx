/**
 * Scaffolded Content Generator Node
 * Generates content adjusted to student's i+1 level with appropriate supports
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Layers, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type ScaffoldingType =
  | "sentence-starters"
  | "word-bank"
  | "visual-supports"
  | "simplified-text"
  | "l1-glossary"
  | "graphic-organizer"

export interface ScaffoldedContentNodeData {
  label: string
  contentType: "passage" | "instructions" | "questions" | "explanation"
  targetComplexity: "simplified" | "grade-level" | "challenging"
  scaffolding: ScaffoldingType[]
  autoAdjustToELPA: boolean
  includeAudio: boolean
  systemPrompt?: string
}

export const ScaffoldedContentNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ScaffoldedContentNodeData

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-blue-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-blue-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <Layers className="h-4 w-4 text-blue-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Scaffolded Content"}</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Auto-adjust: {nodeData.autoAdjustToELPA ? "On" : "Off"}</span>
        </div>

        {nodeData.scaffolding && nodeData.scaffolding.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {nodeData.scaffolding.slice(0, 3).map((scaffold) => (
              <span key={scaffold} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">
                {scaffold.replace("-", " ")}
              </span>
            ))}
            {nodeData.scaffolding.length > 3 && (
              <span className="text-muted-foreground">+{nodeData.scaffolding.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-blue-500 bg-white"
      />
    </div>
  )
})

ScaffoldedContentNode.displayName = "ScaffoldedContentNode"
