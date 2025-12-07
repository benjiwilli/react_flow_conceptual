"use client"

/**
 * LinguaFlow Workflow Builder
 * Main component for creating AI-powered ESL learning pathways
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ LinguaFlow                                    [Preview] [Save] [Share]  │
 * ├──────────────┬──────────────────────────────────────────┬───────────────┤
 * │              │                                          │               │
 * │  NODE        │                                          │  INSPECTOR    │
 * │  PALETTE     │          WORKFLOW CANVAS                 │  / PREVIEW    │
 * │              │                                          │               │
 * ├──────────────┴──────────────────────────────────────────┴───────────────┤
 * │ EXECUTION PANEL                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback, useEffect } from "react"
import { ReactFlowProvider, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Save, Upload, Play, Eye, FileStack, GraduationCap, Menu, X, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

import { NodePalette } from "@/components/builder/node-palette"
import { NodeInspector } from "@/components/builder/node-inspector"
import { ExecutionPanel, useExecutionPanel } from "@/components/builder/execution-panel"
import { TemplateBrowser } from "@/components/builder/template-browser"
import { PreviewPanel } from "@/components/builder/preview-panel"
import { HighContrastToggle } from "@/components/accessibility/high-contrast-toggle"
import type { LinguaFlowWorkflow } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"
import { WorkflowCanvas } from "@/components/builder/workflow-canvas"
import type { LinguaFlowNodeData } from "@/lib/types/nodes"
import type { WorkflowTemplate } from "@/lib/constants/workflow-templates"

interface WorkflowBuilderProps {
  initialWorkflow?: {
    nodes: Node[]
    edges: Edge[]
  }
}

export function WorkflowBuilder({ initialWorkflow }: WorkflowBuilderProps) {
  // Node and Edge state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || [])

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(true)
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const [isExecutionPanelExpanded, setIsExecutionPanelExpanded] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Execution state
  const buildExecutionPayload = useCallback(() => {
    const workflow: LinguaFlowWorkflow = {
      id: crypto.randomUUID(),
      name: "Builder Workflow",
      description: "Ad-hoc builder execution",
      nodes: nodes as unknown as LinguaFlowWorkflow["nodes"],
      edges,
      targetGrades: [],
      targetELPALevels: [],
      curriculumOutcomes: [],
      estimatedDuration: 0,
      createdBy: "builder",
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: false,
      category: "custom",
    }

    const student: StudentProfile = {
      id: "demo-student",
      firstName: "Demo",
      lastName: "Student",
      gradeLevel: "4",
      nativeLanguage: "mandarin",
      additionalLanguages: [],
      elpaLevel: 3,
      literacyLevel: 3,
      numeracyLevel: 3,
      learningStyles: ["visual"],
      interests: ["math", "stories"],
      culturalBackground: "",
      accommodations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      schoolId: "local",
      teacherId: "local",
    }

    return { workflow, student }
  }, [edges, nodes])

  const execution = useExecutionPanel(buildExecutionPayload)

  // Handle node selection
  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node)
    if (node) {
      setIsInspectorOpen(true)
    }
  }, [])

  // Update node data from inspector
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<LinguaFlowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
                isConfigured: true,
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Save workflow
  const saveWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Add some nodes to your workflow first",
        variant: "destructive",
      })
      return
    }

    const workflow = { nodes, edges }
    localStorage.setItem("linguaflow-workflow", JSON.stringify(workflow))

    toast({
      title: "Workflow saved",
      description: "Your learning pathway has been saved",
    })
  }, [nodes, edges])

  // Load workflow
  const loadWorkflow = useCallback(() => {
    const saved = localStorage.getItem("linguaflow-workflow")
    if (!saved) {
      toast({
        title: "No saved workflow",
        description: "There is no workflow saved in your browser",
        variant: "destructive",
      })
      return
    }

    try {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved)
      setNodes(savedNodes)
      setEdges(savedEdges)
      toast({
        title: "Workflow loaded",
        description: "Your learning pathway has been loaded",
      })
    } catch {
      toast({
        title: "Error loading workflow",
        description: "There was an error loading your workflow",
        variant: "destructive",
      })
    }
  }, [setNodes, setEdges])

  // Load template
  const loadTemplate = useCallback((template: WorkflowTemplate) => {
    if (nodes.length > 0) {
      const confirmed = window.confirm(
        "Loading a template will replace your current workflow. Continue?"
      )
      if (!confirmed) return
    }

    setNodes(template.nodes as Node[])
    setEdges(template.edges as Edge[])
    setShowTemplates(false)

    toast({
      title: "Template loaded",
      description: `"${template.name}" has been loaded`,
    })
  }, [nodes.length, setNodes, setEdges])

  // Execute workflow
  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to execute",
        description: "Add some nodes to your workflow first",
        variant: "destructive",
      })
      return
    }
    setIsExecutionPanelExpanded(true)
    execution.execute()
  }, [nodes, execution])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        saveWorkflow()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [saveWorkflow])

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">LinguaFlow</h1>
                <p className="text-xs text-muted-foreground">Learning Pathway Builder</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex mr-2">
              <HighContrastToggle />
            </div>
            <Button
              variant={showTemplates ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <FileStack className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button 
              variant={showPreview ? "secondary" : "outline"} 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => {
                setShowPreview(!showPreview)
                if (!showPreview) {
                  setSelectedNode(null)
                  setIsInspectorOpen(false)
                }
              }}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={loadWorkflow}>
              <Upload className="h-4 w-4 mr-2" />
              Load
            </Button>
            <Button variant="outline" size="sm" onClick={saveWorkflow}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" onClick={executeWorkflow}>
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Node Palette */}
          <aside
            className={cn(
              "border-r bg-card transition-all duration-200",
              isPaletteOpen ? "w-72" : "w-0"
            )}
          >
            {isPaletteOpen && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-3 border-b">
                  <h2 className="font-semibold text-sm">Node Library</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 lg:hidden"
                    onClick={() => setIsPaletteOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <NodePalette />
              </div>
            )}
          </aside>

          {/* Toggle button for palette (mobile) */}
          {!isPaletteOpen && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-20 z-10 lg:hidden"
              onClick={() => setIsPaletteOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          {/* Canvas */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Template Browser Overlay */}
            {showTemplates && (
              <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm">
                <TemplateBrowser
                  onSelectTemplate={loadTemplate}
                  onClose={() => setShowTemplates(false)}
                />
              </div>
            )}

            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              setNodes={setNodes}
              setEdges={setEdges}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNode?.id}
              executingNodeId={execution.currentNodeId}
            />

            {/* Execution Panel */}
            <ExecutionPanel
              executionStatus={execution.status}
              currentNodeId={execution.currentNodeId}
              progress={execution.progress}
              logs={execution.logs}
              streamingContent={execution.streamingContent}
              onExecute={execution.execute}
              onPause={execution.pause}
              onResume={execution.resume}
              onCancel={execution.cancel}
              onClear={execution.clear}
              isExpanded={isExecutionPanelExpanded}
              onToggleExpand={() => setIsExecutionPanelExpanded(!isExecutionPanelExpanded)}
            />
          </main>

          {/* Right Sidebar - Node Inspector or Preview Panel */}
          <aside
            className={cn(
              "border-l bg-card transition-all duration-200",
              (isInspectorOpen && selectedNode) || showPreview ? "w-80" : "w-0"
            )}
          >
            {showPreview ? (
              <PreviewPanel
                nodes={nodes}
                edges={edges}
                className="h-full"
                onClose={() => setShowPreview(false)}
              />
            ) : (
              isInspectorOpen && selectedNode && (
                <NodeInspector
                  node={selectedNode}
                  onUpdateNodeData={updateNodeData}
                  onClose={() => {
                    setSelectedNode(null)
                    setIsInspectorOpen(false)
                  }}
                />
              )
            )}
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  )
}

export default WorkflowBuilder
