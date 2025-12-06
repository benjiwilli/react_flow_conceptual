/**
 * Step-by-Step Solver Node
 * Guides students through math problems with scaffolded steps
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { ListOrdered, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepByStepSolverNodeData {
  label: string
  showThinkingProcess: boolean
  provideHints: boolean
  checkEachStep: boolean
  allowSkipAhead: boolean
  celebrateProgress: boolean
  errorAnalysis: boolean
  adaptiveDifficulty: boolean
}

export const StepByStepSolverNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StepByStepSolverNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-pink-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-pink-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
          <ListOrdered className="h-4 w-4 text-pink-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Step-by-Step Solver"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-3 w-3" />
          <span>Hints: {nodeData.provideHints ? "On" : "Off"}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.showThinkingProcess && (
            <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[10px]">thinking</span>
          )}
          {nodeData.checkEachStep && (
            <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[10px]">check steps</span>
          )}
          {nodeData.adaptiveDifficulty && (
            <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[10px]">adaptive</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-pink-500 bg-white"
      />
    </div>
  )
})

StepByStepSolverNode.displayName = "StepByStepSolverNode"
