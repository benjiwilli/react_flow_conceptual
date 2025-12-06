/**
 * Router Node
 * LLM-based intelligent routing between different learning paths
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { GitBranch, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

export type RoutingCriteria = "elpa-level" | "performance" | "learning-style" | "interest" | "ai-determined"

export interface RouterNodeData {
  label: string
  routingCriteria: RoutingCriteria
  routes: RouterRoute[]
  defaultRoute?: string
  useAIForRouting: boolean
  routingPrompt?: string
}

export interface RouterRoute {
  id: string
  name: string
  condition: string
  targetNodeId?: string
}

export const RouterNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as RouterNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-yellow-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-yellow-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
          <GitBranch className="h-4 w-4 text-yellow-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Router"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Compass className="h-3 w-3" />
          <span className="capitalize">{nodeData.routingCriteria?.replace("-", " ") || "ai determined"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{nodeData.routes?.length || 0} routes</span>
        </div>
        {nodeData.useAIForRouting && (
          <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px]">AI routing</span>
        )}
      </div>

      {/* Multiple output handles for different routes */}
      <Handle
        type="source"
        position={Position.Right}
        id="route-1"
        style={{ top: "30%" }}
        className="h-3 w-3 rounded-full border-2 border-yellow-500 bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="route-2"
        style={{ top: "50%" }}
        className="h-3 w-3 rounded-full border-2 border-yellow-500 bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="route-3"
        style={{ top: "70%" }}
        className="h-3 w-3 rounded-full border-2 border-yellow-500 bg-white"
      />
    </div>
  )
})

RouterNode.displayName = "RouterNode"
