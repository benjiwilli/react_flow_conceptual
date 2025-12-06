"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Database } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const InputNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border-2 border-node-learning min-w-[150px] transition-all hover:shadow-lg hover:border-primary/50">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-node-learning/10 text-node-learning">
          <Database className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-card-foreground">{data.label || "Input"}</div>
          <div className="text-xs text-muted-foreground">{data.description || "Data input node"}</div>
        </div>
      </div>

      {data.dataSource && <div className="mt-2 text-xs bg-muted text-muted-foreground p-1 rounded">Source: {data.dataSource}</div>}

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-node-learning border-2 border-background" />
    </div>
  )
})

InputNode.displayName = "InputNode"
