/**
 * Visual Math Representation Node
 * Creates visual models for mathematical concepts
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { LayoutGrid, Shapes } from "lucide-react"
import { cn } from "@/lib/utils"

export type VisualModel =
  | "number-line"
  | "base-ten-blocks"
  | "fraction-circles"
  | "area-model"
  | "bar-model"
  | "tape-diagram"
  | "arrays"
  | "place-value-chart"

export interface VisualMathNodeData {
  label: string
  visualModels: VisualModel[]
  interactive: boolean
  showWorkspace: boolean
  autoSelectModel: boolean
  colorCoded: boolean
  includeManipulatives: boolean
}

export const VisualMathNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as VisualMathNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-cyan-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-cyan-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
          <Shapes className="h-4 w-4 text-cyan-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Visual Math"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3 w-3" />
          <span>{nodeData.visualModels?.length || 0} models</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.interactive && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 text-[10px]">interactive</span>
          )}
          {nodeData.includeManipulatives && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 text-[10px]">manipulatives</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-cyan-500 bg-white"
      />
    </div>
  )
})

VisualMathNode.displayName = "VisualMathNode"
