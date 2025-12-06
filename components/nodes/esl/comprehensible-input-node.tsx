/**
 * Comprehensible Input Generator Node
 * Based on Krashen's i+1 hypothesis - generates content one level above current proficiency
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ComprehensibleInputNodeData {
  label: string
  inputType: "text" | "audio" | "video" | "interactive"
  complexityAdjustment: "i" | "i+1" | "i+2"
  contextClues: boolean
  visualSupports: boolean
  repetitionLevel: "low" | "medium" | "high"
  culturalRelevance: boolean
}

export const ComprehensibleInputNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ComprehensibleInputNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-teal-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-teal-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
          <TrendingUp className="h-4 w-4 text-teal-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Comprehensible Input"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Target className="h-3 w-3" />
          <span>Level: {nodeData.complexityAdjustment || "i+1"}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.contextClues && (
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px]">context clues</span>
          )}
          {nodeData.visualSupports && (
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px]">visuals</span>
          )}
          {nodeData.culturalRelevance && (
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px]">cultural</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-teal-500 bg-white"
      />
    </div>
  )
})

ComprehensibleInputNode.displayName = "ComprehensibleInputNode"
