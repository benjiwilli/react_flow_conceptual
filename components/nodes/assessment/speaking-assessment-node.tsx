/**
 * Speaking Assessment Node
 * Evaluates oral language production with feedback
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Mic2, AudioWaveform } from "lucide-react"
import { cn } from "@/lib/utils"

export type SpeakingTask = "read-aloud" | "picture-description" | "retelling" | "conversation" | "presentation"

export interface SpeakingAssessmentNodeData {
  label: string
  taskType: SpeakingTask
  assessPronunciation: boolean
  assessFluency: boolean
  assessVocabulary: boolean
  assessGrammar: boolean
  provideModelResponse: boolean
  allowPracticeFirst: boolean
  recordingTimeLimit: number
}

export const SpeakingAssessmentNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as SpeakingAssessmentNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-purple-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-purple-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
          <Mic2 className="h-4 w-4 text-purple-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Speaking Assessment"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <AudioWaveform className="h-3 w-3" />
          <span className="capitalize">{nodeData.taskType?.replace("-", " ") || "read aloud"}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.assessPronunciation && (
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px]">pronunciation</span>
          )}
          {nodeData.assessFluency && (
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px]">fluency</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-purple-500 bg-white"
      />
    </div>
  )
})

SpeakingAssessmentNode.displayName = "SpeakingAssessmentNode"
