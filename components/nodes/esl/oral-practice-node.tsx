/**
 * Oral Language Practice Node
 * Speech-based interaction with pronunciation feedback
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Mic, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ConversationScenario =
  | "classroom"
  | "restaurant"
  | "doctor"
  | "shopping"
  | "parent-teacher"
  | "making-friends"
  | "custom"

export interface OralPracticeNodeData {
  label: string
  scenario: ConversationScenario
  customScenario?: string
  providePronunciationFeedback: boolean
  provideModelAudio: boolean
  allowRetries: boolean
  maxTurns: number
  difficultyAdaptive: boolean
}

export const OralPracticeNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as OralPracticeNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-rose-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-rose-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
          <Mic className="h-4 w-4 text-rose-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Oral Practice"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-3 w-3" />
          <span className="capitalize">{nodeData.scenario?.replace("-", " ") || "classroom"}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.providePronunciationFeedback && (
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px]">pronunciation</span>
          )}
          {nodeData.difficultyAdaptive && (
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px]">adaptive</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-rose-500 bg-white"
      />
    </div>
  )
})

OralPracticeNode.displayName = "OralPracticeNode"
