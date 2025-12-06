/**
 * Parallel Execution Node
 * Runs multiple branches simultaneously
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Layers, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export type MergeStrategy = "wait-all" | "first-complete" | "combine-outputs" | "best-result"

export interface ParallelNodeData {
  label: string
  branches: number
  mergeStrategy: MergeStrategy
  timeoutSeconds: number
  continueOnBranchFailure: boolean
}

export const ParallelNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ParallelNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-blue-600",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-blue-600 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <Layers className="h-4 w-4 text-blue-700" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Parallel"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3" />
          <span>{nodeData.branches || 2} branches</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="capitalize">{nodeData.mergeStrategy?.replace("-", " ") || "wait all"}</span>
        </div>
      </div>

      {/* Multiple branch outputs */}
      <Handle
        type="source"
        position={Position.Right}
        id="branch-1"
        style={{ top: "25%" }}
        className="h-3 w-3 rounded-full border-2 border-blue-600 bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="branch-2"
        style={{ top: "50%" }}
        className="h-3 w-3 rounded-full border-2 border-blue-600 bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="branch-3"
        style={{ top: "75%" }}
        className="h-3 w-3 rounded-full border-2 border-blue-600 bg-white"
      />
    </div>
  )
})

ParallelNode.displayName = "ParallelNode"
