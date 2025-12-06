/**
 * Celebration Node
 * Triggers celebrations and milestone rewards for student achievements
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { PartyPopper, Trophy, Star, Sparkles, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CelebrationNodeData, CelebrationType } from "@/lib/types/nodes"

const CELEBRATION_ICONS: Record<CelebrationType, typeof PartyPopper> = {
  animation: Sparkles,
  badge: Trophy,
  message: PartyPopper,
  confetti: PartyPopper,
  sound: Music,
  points: Star,
}

export const CelebrationNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CelebrationNodeData
  const CelebrationIcon = CELEBRATION_ICONS[nodeData.celebrationType] || PartyPopper

  const milestoneCount = nodeData.milestoneDefinitions?.length || 0

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-teal-400",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 rounded-full border-2 border-teal-400 bg-white"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
          <CelebrationIcon className="h-4 w-4 text-teal-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Celebration"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Trophy className="h-3 w-3" />
          <span className="capitalize">{nodeData.celebrationType || "confetti"} celebration</span>
        </div>
        
        {milestoneCount > 0 && (
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3" />
            <span>{milestoneCount} milestone{milestoneCount !== 1 ? "s" : ""} defined</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {nodeData.soundEnabled && (
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px]">
              🔊 sound
            </span>
          )}
          {nodeData.animationEnabled && (
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px]">
              ✨ animation
            </span>
          )}
          {nodeData.shareToClassroom && (
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px]">
              📢 share
            </span>
          )}
        </div>
      </div>

      {/* Preview of celebration type */}
      <div className="mt-3 pt-3 border-t border-dashed">
        <div className="flex items-center justify-center gap-1 text-teal-500">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span className="text-[10px] font-medium">Achievement unlocked!</span>
          <Sparkles className="h-3 w-3 animate-pulse" />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-teal-400 bg-white"
      />
    </div>
  )
})

CelebrationNode.displayName = "CelebrationNode"

export default CelebrationNode
