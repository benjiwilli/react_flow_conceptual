/**
 * Human-in-the-Loop Node
 * Pauses execution for teacher/student input
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { UserCheck, PauseCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type HumanRole = "teacher" | "student" | "parent" | "any"
export type InputType = "approval" | "text-input" | "selection" | "rating" | "file-upload"

export interface HumanInLoopNodeData {
  label: string
  requiredRole: HumanRole
  inputType: InputType
  prompt: string
  options?: string[]
  timeoutMinutes?: number
  defaultOnTimeout?: string
  notifyByEmail: boolean
}

export const HumanInLoopNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as HumanInLoopNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-amber-600",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-amber-600 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <UserCheck className="h-4 w-4 text-amber-700" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Human Input"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <PauseCircle className="h-3 w-3" />
          <span className="capitalize">{nodeData.requiredRole || "teacher"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="capitalize">{nodeData.inputType?.replace("-", " ") || "approval"}</span>
        </div>
        {nodeData.timeoutMinutes && <span className="text-[10px]">Timeout: {nodeData.timeoutMinutes}min</span>}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-amber-600 bg-white"
      />
    </div>
  )
})

HumanInLoopNode.displayName = "HumanInLoopNode"
