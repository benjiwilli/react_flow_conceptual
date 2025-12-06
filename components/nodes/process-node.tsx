"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Settings } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const ProcessNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border-2 border-node-ai min-w-[150px] transition-all hover:shadow-lg hover:border-primary/50">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-node-ai/10 text-node-ai">
          <Settings className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-card-foreground">{data.label || "Process"}</div>
          <div className="text-xs text-muted-foreground">{data.description || "Data processing node"}</div>
        </div>
      </div>

      {data.processType && <div className="mt-2 text-xs bg-muted text-muted-foreground p-1 rounded">Process: {data.processType}</div>}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-node-ai border-2 border-background" />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-node-ai border-2 border-background"
      />
    </div>
  )
})

ProcessNode.displayName = "ProcessNode"
