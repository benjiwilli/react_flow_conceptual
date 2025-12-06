/**
 * Feedback Generator Node
 * Creates personalized, encouraging feedback for students
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { MessageSquareHeart, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type FeedbackStyle = "encouraging" | "specific" | "growth-mindset" | "next-steps" | "celebration"

export interface FeedbackGeneratorNodeData {
  label: string
  feedbackStyles: FeedbackStyle[]
  includeStrengths: boolean
  includeAreasForGrowth: boolean
  suggestNextSteps: boolean
  adjustToELPALevel: boolean
  includeVisualFeedback: boolean
  parentFriendlyVersion: boolean
}

export const FeedbackGeneratorNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as FeedbackGeneratorNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-red-400",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-red-400 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <MessageSquareHeart className="h-4 w-4 text-red-500" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Feedback Generator"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-3 w-3" />
          <span>{nodeData.feedbackStyles?.length || 0} styles</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.suggestNextSteps && (
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px]">next steps</span>
          )}
          {nodeData.parentFriendlyVersion && (
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px]">parent version</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-red-400 bg-white"
      />
    </div>
  )
})

FeedbackGeneratorNode.displayName = "FeedbackGeneratorNode"
