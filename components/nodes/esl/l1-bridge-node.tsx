/**
 * L1 Bridge Node
 * Provides first-language support for concept understanding
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Languages, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SupportedLanguage } from "@/lib/types/student"

export type BridgeMode = "full-translation" | "key-vocabulary" | "concept-explanation" | "audio-support"

export interface L1BridgeNodeData {
  label: string
  targetLanguage?: SupportedLanguage
  autoDetectFromProfile: boolean
  bridgeMode: BridgeMode
  includeAudio: boolean
  showSideBySide: boolean
}

export const L1BridgeNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as L1BridgeNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-violet-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-violet-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
          <Languages className="h-4 w-4 text-violet-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "L1 Bridge"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-3 w-3" />
          <span>
            {nodeData.autoDetectFromProfile ? "Auto-detect language" : nodeData.targetLanguage || "Select language"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700">
            {nodeData.bridgeMode?.replace("-", " ") || "key vocabulary"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-violet-500 bg-white"
      />
    </div>
  )
})

L1BridgeNode.displayName = "L1BridgeNode"
