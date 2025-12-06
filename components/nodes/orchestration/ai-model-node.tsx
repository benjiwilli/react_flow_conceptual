/**
 * AI Model Node
 * Configures and invokes AI models with customizable parameters
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Brain, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type AIProvider = "openai" | "anthropic" | "google" | "groq" | "local"

export type AIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-sonnet-4-20250514"
  | "claude-3-haiku"
  | "gemini-pro"
  | "gemini-flash"
  | "llama-3"
  | "mixtral"

export interface AIModelNodeData {
  label: string
  provider: AIProvider
  model: AIModel
  temperature: number
  maxTokens: number
  systemPrompt: string
  streamResponse: boolean
  retryOnFailure: boolean
  fallbackModel?: AIModel
}

export const AIModelNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as AIModelNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-fuchsia-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-fuchsia-500 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-100">
          <Brain className="h-4 w-4 text-fuchsia-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "AI Model"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Settings2 className="h-3 w-3" />
          <span>{nodeData.model || "gpt-4o-mini"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Temp: {nodeData.temperature ?? 0.7}</span>
          <span className="text-muted-foreground">|</span>
          <span>Max: {nodeData.maxTokens || 1024}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {nodeData.streamResponse && (
            <span className="px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 text-[10px]">streaming</span>
          )}
          {nodeData.fallbackModel && (
            <span className="px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 text-[10px]">fallback</span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-fuchsia-500 bg-white"
      />
    </div>
  )
})

AIModelNode.displayName = "AIModelNode"
