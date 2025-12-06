"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { GitBranch } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const ConditionalNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border-2 border-node-flow min-w-[150px] transition-all hover:shadow-lg hover:border-primary/50">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-node-flow/10 text-node-flow">
          <GitBranch className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-card-foreground">{data.label || "Conditional"}</div>
          <div className="text-xs text-muted-foreground">{data.description || "Conditional branching"}</div>
        </div>
      </div>

      {data.condition && <div className="mt-2 text-xs bg-muted text-muted-foreground p-1 rounded font-mono">Condition: {data.condition}</div>}

      <div className="flex justify-between mt-2 text-xs font-medium">
        <div className="text-green-600 dark:text-green-400">{data.trueLabel || "Yes"}</div>
        <div className="text-destructive">{data.falseLabel || "No"}</div>
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-node-flow border-2 border-background" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "25%" }}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500 border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "75%" }}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-destructive border-2 border-background"
      />
    </div>
  )
})

ConditionalNode.displayName = "ConditionalNode"
