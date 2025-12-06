"use client"

/**
 * Node Inspector Component
 * Detailed configuration panel for selected nodes
 */

import { useState, useCallback, useEffect } from "react"
import { X, Settings, Info, Zap, AlertCircle } from "lucide-react"
import type { Node } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getNodeConfig, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants/node-registry"
import { SUPPORTED_LANGUAGES } from "@/lib/constants/languages"
import { ELPA_LEVELS } from "@/lib/constants/elpa-levels"
import type { AllNodeTypes, NodeCategory, LinguaFlowNodeData } from "@/lib/types/nodes"

interface NodeInspectorProps {
  node: Node
  onUpdateNodeData: (nodeId: string, data: Partial<LinguaFlowNodeData>) => void
  onClose: () => void
}

export function NodeInspector({ node, onUpdateNodeData, onClose }: NodeInspectorProps) {
  const nodeConfig = getNodeConfig(node.type as AllNodeTypes)
  const category = (node.data?.category || nodeConfig?.category || "flow") as NodeCategory
  const colors = CATEGORY_COLORS[category]

  const updateData = useCallback(
    (updates: Partial<LinguaFlowNodeData>) => {
      onUpdateNodeData(node.id, updates)
    },
    [node.id, onUpdateNodeData]
  )

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className={cn("flex items-center justify-between p-4 border-b", colors.light)}>
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-8 rounded-full", colors.bg)} />
          <div>
            <h3 className="font-semibold text-sm">{(node.data as Record<string, unknown>)?.label as string || nodeConfig?.label || "Node"}</h3>
            <p className="text-xs text-muted-foreground">{nodeConfig?.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="config" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b px-4">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-3.5 w-3.5" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-2">
            <Zap className="h-3.5 w-3.5" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <Info className="h-3.5 w-3.5" />
            Info
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="config" className="p-4 mt-0">
            <NodeConfigForm node={node} nodeConfig={nodeConfig} updateData={updateData} />
          </TabsContent>

          <TabsContent value="connections" className="p-4 mt-0">
            <ConnectionsPanel nodeConfig={nodeConfig} />
          </TabsContent>

          <TabsContent value="info" className="p-4 mt-0">
            <InfoPanel nodeConfig={nodeConfig} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Validation Errors */}
      {(() => {
        const nodeData = node.data as Record<string, unknown>
        const errors = nodeData?.validationErrors as string[] | undefined
        return errors && errors.length > 0 && (
          <div className="p-4 border-t bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Validation Errors</span>
            </div>
            <ul className="text-xs text-destructive space-y-1">
              {errors.map((error: string, i: number) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )
      })()}
    </div>
  )
}

interface NodeConfigFormProps {
  node: Node
  nodeConfig: ReturnType<typeof getNodeConfig>
  updateData: (updates: Partial<LinguaFlowNodeData>) => void
}

function NodeConfigForm({ node, nodeConfig, updateData }: NodeConfigFormProps) {
  const data = node.data as unknown as LinguaFlowNodeData

  // Common label field
  const renderLabelField = () => (
    <div className="space-y-2">
      <Label htmlFor="label">Label</Label>
      <Input
        id="label"
        value={data?.label || ""}
        onChange={(e) => updateData({ label: e.target.value })}
        placeholder="Node label"
      />
    </div>
  )

  // Render type-specific configuration
  const renderTypeSpecificConfig = () => {
    const nodeType = node.type as AllNodeTypes

    switch (nodeType) {
      case "student-profile":
        return <StudentProfileConfig data={data} updateData={updateData} />
      case "curriculum-selector":
        return <CurriculumSelectorConfig data={data} updateData={updateData} />
      case "content-generator":
        return <ContentGeneratorConfig data={data} updateData={updateData} />
      case "ai-model":
        return <AIModelConfig data={data} updateData={updateData} />
      case "prompt-template":
        return <PromptTemplateConfig data={data} updateData={updateData} />
      case "scaffolding":
        return <ScaffoldingConfig data={data} updateData={updateData} />
      case "l1-bridge":
        return <L1BridgeConfig data={data} updateData={updateData} />
      case "human-input":
        return <HumanInputConfig data={data} updateData={updateData} />
      case "comprehension-check":
        return <ComprehensionCheckConfig data={data} updateData={updateData} />
      case "feedback":
        return <FeedbackConfig data={data} updateData={updateData} />
      case "proficiency-router":
        return <ProficiencyRouterConfig data={data} updateData={updateData} />
      default:
        return <GenericConfig data={data} updateData={updateData} />
    }
  }

  return (
    <div className="space-y-6">
      {renderLabelField()}
      {renderTypeSpecificConfig()}
    </div>
  )
}

// ============================================================================
// Type-Specific Configuration Components
// ============================================================================

function StudentProfileConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Grade Level</Label>
        <Select
          value={data?.gradeLevel || ""}
          onValueChange={(value) => updateData({ gradeLevel: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="K">Kindergarten</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
              <SelectItem key={grade} value={String(grade)}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ELPA Level</Label>
        <Select
          value={String(data?.elpaLevel || "")}
          onValueChange={(value) => updateData({ elpaLevel: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select ELPA level" />
          </SelectTrigger>
          <SelectContent>
            {ELPA_LEVELS.map((level) => (
              <SelectItem key={level.level} value={String(level.level)}>
                Level {level.level} - {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Primary Language (L1)</Label>
        <Select
          value={data?.primaryLanguage || ""}
          onValueChange={(value) => updateData({ primaryLanguage: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests">Interests (comma-separated)</Label>
        <Input
          id="interests"
          value={data?.interests?.join(", ") || ""}
          onChange={(e) =>
            updateData({
              interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="sports, music, science..."
        />
      </div>
    </>
  )
}

function CurriculumSelectorConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Subject Area</Label>
        <Select
          value={data?.subjectArea || ""}
          onValueChange={(value) => updateData({ subjectArea: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english-language-arts">English Language Arts</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="social-studies">Social Studies</SelectItem>
            <SelectItem value="esl-benchmarks">ESL Benchmarks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Difficulty Adjustment</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[data?.difficultyAdjustment || 0]}
            min={-2}
            max={2}
            step={1}
            onValueChange={([value]) => updateData({ difficultyAdjustment: value })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-8 text-center">
            {data?.difficultyAdjustment > 0 ? `+${data.difficultyAdjustment}` : data?.difficultyAdjustment || 0}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Adjust difficulty relative to student&apos;s grade level
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Cross-Curricular</Label>
          <p className="text-xs text-muted-foreground">Include connections to other subjects</p>
        </div>
        <Switch
          checked={data?.crossCurricular || false}
          onCheckedChange={(checked) => updateData({ crossCurricular: checked })}
        />
      </div>
    </>
  )
}

function ContentGeneratorConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Content Type</Label>
        <Select
          value={data?.contentType || "passage"}
          onValueChange={(value) => updateData({ contentType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passage">Passage</SelectItem>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="explanation">Explanation</SelectItem>
            <SelectItem value="example">Example</SelectItem>
            <SelectItem value="problem">Problem</SelectItem>
            <SelectItem value="dialogue">Dialogue</SelectItem>
            <SelectItem value="instructions">Instructions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Length</Label>
        <Select
          value={data?.length || "medium"}
          onValueChange={(value) => updateData({ length: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short (~50 words)</SelectItem>
            <SelectItem value="medium">Medium (~150 words)</SelectItem>
            <SelectItem value="long">Long (~300 words)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic/Theme</Label>
        <Input
          id="topic"
          value={data?.topic || ""}
          onChange={(e) => updateData({ topic: e.target.value })}
          placeholder="e.g., farm animals, space exploration"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Include Visuals</Label>
          <p className="text-xs text-muted-foreground">Generate supporting images</p>
        </div>
        <Switch
          checked={data?.includeVisuals || false}
          onCheckedChange={(checked) => updateData({ includeVisuals: checked })}
        />
      </div>
    </>
  )
}

function AIModelConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select
          value={data?.provider || "openai"}
          onValueChange={(value) => updateData({ provider: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="groq">Groq</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Model</Label>
        <Select
          value={data?.model || "gpt-4o-mini"}
          onValueChange={(value) => updateData({ model: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet</SelectItem>
            <SelectItem value="claude-3-haiku">Claude Haiku</SelectItem>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            <SelectItem value="gemini-flash">Gemini Flash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Temperature: {data?.temperature ?? 0.7}</Label>
        <Slider
          value={[data?.temperature ?? 0.7]}
          min={0}
          max={2}
          step={0.1}
          onValueChange={([value]) => updateData({ temperature: value })}
        />
        <p className="text-xs text-muted-foreground">
          Lower = more focused, Higher = more creative
        </p>
      </div>

      <div className="space-y-2">
        <Label>Max Tokens</Label>
        <Input
          type="number"
          value={data?.maxTokens || 1024}
          onChange={(e) => updateData({ maxTokens: parseInt(e.target.value) })}
          min={1}
          max={8192}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={data?.systemPrompt || ""}
          onChange={(e) => updateData({ systemPrompt: e.target.value })}
          placeholder="You are a helpful ESL teaching assistant..."
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Stream Response</Label>
          <p className="text-xs text-muted-foreground">Show tokens as they generate</p>
        </div>
        <Switch
          checked={data?.streamResponse ?? true}
          onCheckedChange={(checked) => updateData({ streamResponse: checked })}
        />
      </div>
    </>
  )
}

function PromptTemplateConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <Textarea
          id="template"
          value={data?.template || ""}
          onChange={(e) => updateData({ template: e.target.value })}
          placeholder="Create a {{contentType}} about {{topic}} for a Grade {{gradeLevel}} student at ELPA Level {{elpaLevel}}..."
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Use {"{{variableName}}"} for dynamic values
        </p>
      </div>

      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select
          value={data?.outputFormat || "text"}
          onValueChange={(value) => updateData({ outputFormat: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

function ScaffoldingConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  const scaffoldElements = data?.scaffoldElements || []

  const toggleElement = (element: string) => {
    const newElements = scaffoldElements.includes(element)
      ? scaffoldElements.filter((e: string) => e !== element)
      : [...scaffoldElements, element]
    updateData({ scaffoldElements: newElements })
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Scaffolding Type</Label>
        <Select
          value={data?.scaffoldingType || "add-supports"}
          onValueChange={(value) => updateData({ scaffoldingType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simplify">Simplify Text</SelectItem>
            <SelectItem value="add-supports">Add Supports</SelectItem>
            <SelectItem value="enrich">Enrich Content</SelectItem>
            <SelectItem value="differentiate">Differentiate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Scaffold Elements</Label>
        <div className="flex flex-wrap gap-2">
          {[
            "sentence-starters",
            "word-banks",
            "graphic-organizers",
            "visual-supports",
            "l1-glossary",
            "audio-support",
            "examples",
            "hints",
          ].map((element) => (
            <Badge
              key={element}
              variant={scaffoldElements.includes(element) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleElement(element)}
            >
              {element.replace("-", " ")}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Auto-Adjust to Level</Label>
          <p className="text-xs text-muted-foreground">Automatically match student&apos;s ELPA level</p>
        </div>
        <Switch
          checked={data?.autoAdjust ?? true}
          onCheckedChange={(checked) => updateData({ autoAdjust: checked })}
        />
      </div>
    </>
  )
}

function L1BridgeConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Bridge Type</Label>
        <Select
          value={data?.bridgeType || "key-terms-only"}
          onValueChange={(value) => updateData({ bridgeType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-translation">Full Translation</SelectItem>
            <SelectItem value="key-terms-only">Key Terms Only</SelectItem>
            <SelectItem value="concept-explanation">Concept Explanation</SelectItem>
            <SelectItem value="cognates">Cognates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Display Mode</Label>
        <Select
          value={data?.displayMode || "inline"}
          onValueChange={(value) => updateData({ displayMode: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="side-by-side">Side by Side</SelectItem>
            <SelectItem value="hover">Hover to Show</SelectItem>
            <SelectItem value="toggle">Toggle View</SelectItem>
            <SelectItem value="inline">Inline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Cultural Context</Label>
          <p className="text-xs text-muted-foreground">Include cultural explanations</p>
        </div>
        <Switch
          checked={data?.culturalContext ?? true}
          onCheckedChange={(checked) => updateData({ culturalContext: checked })}
        />
      </div>
    </>
  )
}

function HumanInputConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Input Type</Label>
        <Select
          value={data?.inputType || "text"}
          onValueChange={(value) => updateData({ inputType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={data?.prompt || ""}
          onChange={(e) => updateData({ prompt: e.target.value })}
          placeholder="What is your answer?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder Text</Label>
        <Input
          id="placeholder"
          value={data?.placeholder || ""}
          onChange={(e) => updateData({ placeholder: e.target.value })}
          placeholder="Type your answer here..."
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Hints Available</Label>
          <p className="text-xs text-muted-foreground">Allow students to request hints</p>
        </div>
        <Switch
          checked={data?.hintAvailable ?? true}
          onCheckedChange={(checked) => updateData({ hintAvailable: checked })}
        />
      </div>
    </>
  )
}

function ComprehensionCheckConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Question Count</Label>
        <Input
          type="number"
          value={data?.questionCount || 3}
          onChange={(e) => updateData({ questionCount: parseInt(e.target.value) })}
          min={1}
          max={10}
        />
      </div>

      <div className="space-y-2">
        <Label>Pass Threshold (%)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[data?.passThreshold || 70]}
            min={0}
            max={100}
            step={10}
            onValueChange={([value]) => updateData({ passThreshold: value })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12">{data?.passThreshold || 70}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Adaptive Questions</Label>
          <p className="text-xs text-muted-foreground">Adjust difficulty based on responses</p>
        </div>
        <Switch
          checked={data?.adaptiveQuestions ?? true}
          onCheckedChange={(checked) => updateData({ adaptiveQuestions: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Show Feedback</Label>
          <p className="text-xs text-muted-foreground">Show correct answer after response</p>
        </div>
        <Switch
          checked={data?.showFeedback ?? true}
          onCheckedChange={(checked) => updateData({ showFeedback: checked })}
        />
      </div>
    </>
  )
}

function FeedbackConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Feedback Style</Label>
        <Select
          value={data?.feedbackStyle || "growth-mindset"}
          onValueChange={(value) => updateData({ feedbackStyle: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="encouraging">Encouraging</SelectItem>
            <SelectItem value="corrective">Corrective</SelectItem>
            <SelectItem value="explanatory">Explanatory</SelectItem>
            <SelectItem value="growth-mindset">Growth Mindset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Encouragement Level</Label>
        <Select
          value={data?.encouragementLevel || "high"}
          onValueChange={(value) => updateData({ encouragementLevel: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Include Correct Answer</Label>
          <p className="text-xs text-muted-foreground">Show the correct answer if wrong</p>
        </div>
        <Switch
          checked={data?.includeCorrectAnswer ?? true}
          onCheckedChange={(checked) => updateData({ includeCorrectAnswer: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>L1 Support</Label>
          <p className="text-xs text-muted-foreground">Translate feedback to native language</p>
        </div>
        <Switch
          checked={data?.l1Support ?? false}
          onCheckedChange={(checked) => updateData({ l1Support: checked })}
        />
      </div>
    </>
  )
}

function ProficiencyRouterConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Routing Criteria</Label>
        <Select
          value={data?.routingCriteria?.type || "elpa-level"}
          onValueChange={(value) =>
            updateData({ routingCriteria: { ...data?.routingCriteria, type: value } })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="elpa-level">ELPA Level</SelectItem>
            <SelectItem value="score">Assessment Score</SelectItem>
            <SelectItem value="assessment-result">Assessment Result</SelectItem>
            <SelectItem value="custom">Custom Logic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Default Path</Label>
        <Input
          value={data?.defaultPath || "track"}
          onChange={(e) => updateData({ defaultPath: e.target.value })}
          placeholder="Default routing path"
        />
      </div>
    </>
  )
}

function GenericConfig({ data, updateData }: { data: any; updateData: (u: any) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={data?.description || ""}
        onChange={(e) => updateData({ description: e.target.value })}
        placeholder="Describe this node's purpose..."
        rows={3}
      />
    </div>
  )
}

// ============================================================================
// Supporting Panels
// ============================================================================

function ConnectionsPanel({ nodeConfig }: { nodeConfig: ReturnType<typeof getNodeConfig> }) {
  if (!nodeConfig) return null

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-sm mb-3">Inputs</h4>
        {nodeConfig.inputs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No inputs (entry node)</p>
        ) : (
          <div className="space-y-2">
            {nodeConfig.inputs.map((input) => (
              <div key={input.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{input.label}</p>
                  <p className="text-xs text-muted-foreground">{input.type}</p>
                </div>
                {input.required && (
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Outputs</h4>
        {nodeConfig.outputs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No outputs (terminal node)</p>
        ) : (
          <div className="space-y-2">
            {nodeConfig.outputs.map((output) => (
              <div key={output.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{output.label}</p>
                  <p className="text-xs text-muted-foreground">{output.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoPanel({ nodeConfig }: { nodeConfig: ReturnType<typeof getNodeConfig> }) {
  if (!nodeConfig) return null

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2">About this Node</h4>
        <p className="text-sm text-muted-foreground">{nodeConfig.description}</p>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-2">Category</h4>
        <Badge variant="outline">
          {CATEGORY_LABELS[nodeConfig.category]?.label || nodeConfig.category}
        </Badge>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-2">Usage Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Connect inputs from upstream nodes</li>
          <li>• Configure settings in the Configure tab</li>
          <li>• Use Preview to test with sample data</li>
        </ul>
      </div>
    </div>
  )
}

export default NodeInspector
