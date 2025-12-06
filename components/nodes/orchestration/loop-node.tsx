/**
 * Loop Node
 * Iterates over content or repeats until mastery
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Repeat, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export type LoopType = "count" | "until-mastery" | "foreach-item" | "until-condition"

export interface LoopNodeData {
  label: string
  loopType: LoopType
  maxIterations: number
  masteryThreshold?: number
  iterationVariable: string
  continueOnError: boolean
  delayBetweenIterations: number
}

export const LoopNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as LoopNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-emerald-600",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-emerald-600 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <Repeat className="h-4 w-4 text-emerald-700" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Loop"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3 w-3" />
          <span className="capitalize">{nodeData.loopType?.replace("-", " ") || "count"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Max: {nodeData.maxIterations || 10}</span>
          {nodeData.masteryThreshold && <span>| Mastery: {nodeData.masteryThreshold}%</span>}
        </div>
      </div>

      {/* Loop body output */}
      <Handle
        type="source"
        position={Position.Right}
        id="loop-body"
        style={{ top: "40%" }}
        className="h-3 w-3 rounded-full border-2 border-emerald-600 bg-white"
      />
      {/* Loop complete output */}
      <Handle
        type="source"
        position={Position.Right}
        id="loop-complete"
        style={{ top: "70%" }}
        className="h-3 w-3 rounded-full border-2 border-emerald-600 bg-white"
      />
    </div>
  )
})

LoopNode.displayName = "LoopNode"
