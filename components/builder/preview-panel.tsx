"use client"

/**
 * Preview Panel Component
 * Displays workflow execution preview with step-through functionality
 * Includes both Debug View (technical) and Student View (simulation)
 */

import { usePreview, PreviewNode } from "@/contexts/preview-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  AlertTriangle,
  Eye,
  Terminal
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Node, Edge } from "@xyflow/react"
import { useState, useMemo } from "react"
import LearningInterface, { 
  LearningContent, 
  QuestionData,
  VocabularyItem 
} from "@/components/student/learning-interface"

interface PreviewPanelProps {
  nodes: Node[]
  edges: Edge[]
  className?: string
  onClose?: () => void
}

export function PreviewPanel({ nodes, edges, className, onClose }: PreviewPanelProps) {
  const {
    previewState,
    startPreview,
    stopPreview,
    pausePreview,
    resumePreview,
    stepThrough,
    resetPreview,
    setInputValue,
    isLoading,
  } = usePreview()

  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<"debug" | "student">("debug")

  // Find input nodes that need user input
  const inputNodes = nodes.filter(
    (n) => n.type === "input" || n.type === "textInput" || n.type === "text-input"
  )

  const handleStart = () => {
    // Collect input values
    const inputs: Record<string, unknown> = {}
    inputNodes.forEach((node) => {
      const key = node.id
      inputs[key] = inputValues[key] || (node.data as { defaultValue?: string })?.defaultValue || ""
    })
    startPreview(nodes, edges, inputs)
  }

  const handleInputChange = (nodeId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [nodeId]: value }))
    setInputValue(nodeId, value)
  }

  const getStatusIcon = (status: PreviewNode["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "active":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: PreviewNode["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      case "active":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-800/20 dark:border-gray-700"
    }
  }

  const executionTime = previewState.startTime && previewState.endTime
    ? ((previewState.endTime.getTime() - previewState.startTime.getTime()) / 1000).toFixed(2)
    : null

  // Extract content for Student View
  const studentViewData = useMemo(() => {
    let content: LearningContent | undefined
    let question: QuestionData | undefined
    
    // Iterate through executed nodes to find the latest content/question
    // We reverse to find the most recent one
    const completedNodes = [...previewState.executedNodes]
      .reverse()
      .filter(n => n.status === "completed" && n.output)

    for (const node of completedNodes) {
      const output = node.output as Record<string, unknown>
      
      if (!content && output.content) {
        content = {
          type: "text",
          content: String(output.content),
          translation: output.translatedContent as string,
          vocabulary: output.vocabulary as VocabularyItem[],
          visual: output.visual as string,
          audio: output.audio as string
        }
      }

      if (!question && (output.questions || output.prompt)) {
        question = {
          prompt: String(output.prompt || (output.questions as { question: string }[])?.[0]?.question || ""),
          type: (output.inputType as "text" | "number" | "multiple-choice" | "voice") || "text",
          hint: output.hint as string,
          options: (output.questions as { options?: { id: string, text: string }[] }[])?.[0]?.options
        }
      }

      if (content && question) break
    }

    return { content, question }
  }, [previewState.executedNodes])

  // Calculate progress
  const totalSteps = nodes.length
  const currentStep = previewState.executedNodes.filter(n => n.status === "completed").length
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workflow Preview</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "debug" | "student")} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="debug">
              <Terminal className="h-4 w-4 mr-2" />
              Debug View
            </TabsTrigger>
            <TabsTrigger value="student">
              <Eye className="h-4 w-4 mr-2" />
              Student View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 mt-4">
          {!previewState.isActive ? (
            <Button size="sm" onClick={handleStart} disabled={nodes.length === 0}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : (
            <>
              {previewState.isPaused ? (
                <Button size="sm" onClick={resumePreview}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              ) : (
                <Button size="sm" onClick={pausePreview}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={stepThrough} disabled={isLoading}>
                <SkipForward className="h-4 w-4 mr-1" />
                Step
              </Button>
              <Button size="sm" variant="destructive" onClick={stopPreview}>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={resetPreview}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <TabsContent value="debug" className="h-full m-0 data-[state=active]:flex flex-col">
          <ScrollArea className="h-full p-6">
            {/* Input Fields Section */}
            {inputNodes.length > 0 && !previewState.isActive && (
              <div className="mb-4 space-y-3">
                <h4 className="font-medium text-sm">Input Values</h4>
                {inputNodes.map((node) => (
                  <div key={node.id} className="space-y-1">
                    <Label htmlFor={`input-${node.id}`} className="text-xs">
                      {(node.data as { label?: string })?.label || node.id}
                    </Label>
                    <Input
                      id={`input-${node.id}`}
                      value={inputValues[node.id] || ""}
                      onChange={(e) => handleInputChange(node.id, e.target.value)}
                      placeholder="Enter value..."
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Execution Status */}
            {previewState.isActive && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={previewState.isPaused ? "secondary" : "default"}>
                    {previewState.isPaused ? "Paused" : "Running"}
                  </Badge>
                  {executionTime && (
                    <span className="text-muted-foreground">
                      Completed in {executionTime}s
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {previewState.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-red-700 dark:text-red-400">
                      Execution Error
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      {previewState.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Node Execution List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Execution Steps</h4>
              {previewState.executedNodes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No execution steps yet. Click Start to begin preview.
                </p>
              ) : (
                previewState.executedNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      getStatusColor(node.status)
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {index + 1}.
                        </span>
                        {getStatusIcon(node.status)}
                        <span className="font-medium text-sm">{node.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {node.type}
                      </Badge>
                    </div>

                    {node.status === "completed" && node.output !== undefined && (
                      <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border text-xs">
                        <span className="font-medium">Output: </span>
                        <code className="text-green-600 dark:text-green-400">
                          {typeof node.output === "object"
                            ? JSON.stringify(node.output, null, 2)
                            : String(node.output)}
                        </code>
                      </div>
                    )}

                    {node.status === "error" && node.error && (
                      <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border text-xs">
                        <span className="font-medium text-red-600">Error: </span>
                        <code className="text-red-500">{node.error}</code>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Output Summary */}
            {Object.keys(previewState.outputs).length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Final Outputs</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(previewState.outputs, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="student" className="h-full m-0 data-[state=active]:block">
          <div className="h-full w-full bg-gray-50 overflow-hidden relative">
            <div className="absolute inset-0 overflow-auto scale-[0.85] origin-top">
              <LearningInterface
                sessionId="preview"
                studentName="Preview Student"
                content={studentViewData.content}
                question={studentViewData.question}
                progress={progress}
                totalSteps={totalSteps}
                currentStep={currentStep}
                isLoading={isLoading && !previewState.isActive}
                onSubmitAnswer={() => {
                  // Answer recorded - proceed to next step
                  stepThrough()
                }}
                onRequestHint={() => { /* Hint request handled by learning interface */ }}
                onPlayAudio={() => { /* Audio playback handled by learning interface */ }}
                onNext={() => stepThrough()}
                onBack={() => {}}
              />
            </div>
            {/* Overlay for non-active state */}
            {!previewState.isActive && !studentViewData.content && !studentViewData.question && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center p-6">
                  <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">Student View Preview</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    Start the workflow to see how it looks for students.
                  </p>
                  <Button onClick={handleStart} className="mt-4">
                    Start Preview
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  )
}