/**
 * Progress Tracker Node
 * Records and displays student progress over time
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { TrendingUp, Award } from "lucide-react"
import { cn } from "@/lib/utils"

export type TrackingMetric = "accuracy" | "fluency" | "vocabulary-growth" | "comprehension" | "elpa-progress"

export interface ProgressTrackerNodeData {
  label: string
  metrics: TrackingMetric[]
  saveToProfile: boolean
  showGrowthChart: boolean
  celebrateMilestones: boolean
  generateReport: boolean
  notifyTeacher: boolean
  compareToGoals: boolean
}

export const ProgressTrackerNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ProgressTrackerNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-sky-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-sky-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
          <TrendingUp className="h-4 w-4 text-sky-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Progress Tracker"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Award className="h-3 w-3" />
          <span>{nodeData.metrics?.length || 0} metrics tracked</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.celebrateMilestones && (
            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 text-[10px]">celebrations</span>
          )}
          {nodeData.showGrowthChart && (
            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 text-[10px]">chart</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-sky-500 bg-white"
      />
    </div>
  )
})

ProgressTrackerNode.displayName = "ProgressTrackerNode"
