/**
 * Student Profile Node
 * Entry point for all learning pathways - captures student context
 */

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { User, Globe, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ELPALevel, GradeLevel, SupportedLanguage } from "@/lib/types/student"

export interface StudentProfileNodeData {
  label: string
  studentId?: string
  gradeLevel?: GradeLevel
  nativeLanguage?: SupportedLanguage
  elpaLevel?: ELPALevel
  interests?: string[]
  accommodations?: string[]
}

export const StudentProfileNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as StudentProfileNodeData

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-emerald-500",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <User className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="font-semibold text-sm">{nodeData.label || "Student Profile"}</span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-3 w-3" />
          <span>Grade: {nodeData.gradeLevel || "Not set"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3" />
          <span>L1: {nodeData.nativeLanguage || "Not set"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">ELPA Level:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{nodeData.elpaLevel || "—"}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-white"
      />
    </div>
  )
})

StudentProfileNode.displayName = "StudentProfileNode"
