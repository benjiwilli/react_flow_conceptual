"use client"

/**
 * Generic LinguaFlow Node Component
 * Renders any node type with appropriate styling based on category
 */

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  User,
  BookOpen,
  FileText,
  Calculator,
  BookA,
  Brain,
  FileCode,
  Braces,
  Layers,
  Languages,
  Image,
  MessageSquare,
  Mic,
  CheckCircle,
  ListChecks,
  PenLine,
  Speech,
  GitBranch,
  Repeat,
  GitMerge,
  Split,
  TrendingUp,
  MessageCircle,
  PartyPopper,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getNodeConfig, CATEGORY_COLORS } from "@/lib/constants/node-registry"
import type { AllNodeTypes, NodeCategory, LinguaFlowNodeData, BaseNodeData } from "@/lib/types/nodes"

// Icon mapping
const ICONS: Record<string, LucideIcon> = {
  User,
  BookOpen,
  FileText,
  Calculator,
  BookA,
  Brain,
  FileCode,
  Braces,
  Layers,
  Languages,
  Image,
  MessageSquare,
  Mic,
  CheckCircle,
  ListChecks,
  PenLine,
  Speech,
  GitBranch,
  Repeat,
  GitMerge,
  Split,
  TrendingUp,
  MessageCircle,
  PartyPopper,
  Settings,
}

export const GenericLinguaFlowNode = memo(({ data, selected, type }: NodeProps) => {
  const nodeConfig = getNodeConfig(type as AllNodeTypes)
  const nodeData = data as unknown as BaseNodeData

  const category = nodeData?.category || nodeConfig?.category || "flow"
  const colors = CATEGORY_COLORS[category as NodeCategory]
  const Icon = ICONS[nodeConfig?.icon || "Settings"] || Settings

  const hasInputs = nodeConfig?.inputs && nodeConfig.inputs.length > 0
  const hasOutputs = nodeConfig?.outputs && nodeConfig.outputs.length > 0

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-card p-4 shadow-md transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : colors.border
      )}
    >
      {/* Input Handle */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          className={cn("h-3 w-3 rounded-full border-2 bg-white", colors.border)}
        />
      )}

      {/* Node Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", colors.light)}>
          <Icon className={cn("h-4 w-4", colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm block truncate">
            {nodeData?.label || nodeConfig?.label || type}
          </span>
          {nodeData?.description && (
            <span className="text-xs text-muted-foreground block truncate">
              {nodeData.description}
            </span>
          )}
        </div>
      </div>

      {/* Node Content - Type Specific */}
      <NodeContent type={type as AllNodeTypes} data={nodeData} colors={colors} />

      {/* Configuration Status */}
      {nodeData && !nodeData.isConfigured && (
        <div className="mt-2 px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs">
          ⚠️ Needs configuration
        </div>
      )}

      {/* Validation Errors */}
      {nodeData?.validationErrors && nodeData.validationErrors.length > 0 && (
        <div className="mt-2 px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
          {nodeData.validationErrors[0]}
        </div>
      )}

      {/* Output Handle */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          className={cn("h-3 w-3 rounded-full border-2 bg-white", colors.border)}
        />
      )}
    </div>
  )
})

GenericLinguaFlowNode.displayName = "GenericLinguaFlowNode"

// ============================================================================
// Type-Specific Content Renderers
// ============================================================================

interface NodeContentProps {
  type: AllNodeTypes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  colors: typeof CATEGORY_COLORS["learning"]
}

function NodeContent({ type, data, colors }: NodeContentProps) {
  switch (type) {
    case "prompt-template":
      return <PromptTemplateContent data={data} colors={colors} />
    case "structured-output":
      return <StructuredOutputContent data={data} colors={colors} />
    case "visual-support":
      return <VisualSupportContent data={data} colors={colors} />
    case "voice-input":
      return <VoiceInputContent data={data} colors={colors} />
    case "multiple-choice":
      return <MultipleChoiceContent data={data} colors={colors} />
    case "free-response":
      return <FreeResponseContent data={data} colors={colors} />
    case "merge":
      return <MergeContent data={data} colors={colors} />
    case "variable":
      return <VariableContent data={data} colors={colors} />
    case "celebration":
      return <CelebrationContent data={data} colors={colors} />
    case "curriculum-selector":
      return <CurriculumSelectorContent data={data} colors={colors} />
    case "content-generator":
      return <ContentGeneratorContent data={data} colors={colors} />
    case "math-problem-generator":
      return <MathProblemContent data={data} colors={colors} />
    default:
      return null
  }
}

function PromptTemplateContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      {data?.template ? (
        <div className="p-2 rounded bg-muted/50 font-mono truncate max-w-[180px]">
          {data.template.substring(0, 50)}...
        </div>
      ) : (
        <p className="italic">No template defined</p>
      )}
      {data?.variables?.length > 0 && (
        <p>{data.variables.length} variable(s)</p>
      )}
    </div>
  )
}

function StructuredOutputContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      {data?.schemaName ? (
        <div className="flex items-center gap-2">
          <Braces className="h-3 w-3" />
          <span>{data.schemaName}</span>
        </div>
      ) : (
        <p className="italic">No schema defined</p>
      )}
      {data?.validateOutput && (
        <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
          validates
        </span>
      )}
    </div>
  )
}

function VisualSupportContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Image className="h-3 w-3" />
        <span className="capitalize">{data?.visualType || "illustration"}</span>
      </div>
      <p className="capitalize">{data?.generationMethod || "ai-generated"}</p>
    </div>
  )
}

function VoiceInputContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Mic className="h-3 w-3" />
        <span className="capitalize">{data?.expectedLanguage || "english"}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {data?.pronunciationFeedback && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            pronunciation
          </span>
        )}
        {data?.transcriptionRequired && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            transcribe
          </span>
        )}
      </div>
    </div>
  )
}

function MultipleChoiceContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <ListChecks className="h-3 w-3" />
        <span>{data?.options?.length || 0} options</span>
      </div>
      {data?.shuffleOptions && (
        <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
          shuffled
        </span>
      )}
    </div>
  )
}

function FreeResponseContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <PenLine className="h-3 w-3" />
        <span>Free response</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {data?.aiGrading && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            AI graded
          </span>
        )}
        {data?.minWords && (
          <span className="text-muted-foreground">Min: {data.minWords}</span>
        )}
      </div>
    </div>
  )
}

function MergeContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <GitMerge className="h-3 w-3" />
        <span className="capitalize">{data?.mergeStrategy || "aggregate"}</span>
      </div>
      {data?.waitForAll && (
        <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
          wait for all
        </span>
      )}
    </div>
  )
}

function VariableContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      {data?.variableName ? (
        <div className="font-mono bg-muted/50 px-2 py-1 rounded">
          {data.variableName}
        </div>
      ) : (
        <p className="italic">No variable set</p>
      )}
      <div className="flex items-center gap-2">
        <span className="capitalize">{data?.operation || "get"}</span>
        <span className="text-muted-foreground">({data?.variableType || "string"})</span>
      </div>
    </div>
  )
}

function CelebrationContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <PartyPopper className="h-3 w-3" />
        <span className="capitalize">{data?.celebrationType || "confetti"}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {data?.soundEnabled && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            🔊 sound
          </span>
        )}
        {data?.animationEnabled && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            ✨ animation
          </span>
        )}
      </div>
    </div>
  )
}

function CurriculumSelectorContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <BookOpen className="h-3 w-3" />
        <span className="capitalize">
          {data?.subjectArea?.replace(/-/g, " ") || "Not selected"}
        </span>
      </div>
      {data?.difficultyAdjustment !== 0 && (
        <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
          {data.difficultyAdjustment > 0 ? `+${data.difficultyAdjustment}` : data.difficultyAdjustment} level
        </span>
      )}
    </div>
  )
}

function ContentGeneratorContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3" />
        <span className="capitalize">{data?.contentType || "passage"}</span>
      </div>
      <p className="capitalize">{data?.length || "medium"} length</p>
      {data?.topic && (
        <p className="truncate max-w-[160px]">Topic: {data.topic}</p>
      )}
    </div>
  )
}

function MathProblemContent({ data, colors }: Omit<NodeContentProps, "type">) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calculator className="h-3 w-3" />
        <span className="capitalize">{data?.problemType?.replace(/-/g, " ") || "word problem"}</span>
      </div>
      <p className="capitalize">Scaffold: {data?.scaffoldLevel?.replace(/-/g, " ") || "vocabulary only"}</p>
      <div className="flex flex-wrap gap-1">
        {data?.includeVisuals && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            visuals
          </span>
        )}
        {data?.wordProblem && (
          <span className={cn("px-1.5 py-0.5 rounded text-[10px]", colors.light, colors.text)}>
            word problem
          </span>
        )}
      </div>
    </div>
  )
}

export default GenericLinguaFlowNode
