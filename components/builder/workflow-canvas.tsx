"use client"

/**
 * Workflow Canvas Component
 * Enhanced React Flow canvas with LinguaFlow-specific features
 */

import { useCallback, useMemo, useRef, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { cn } from "@/lib/utils"
import { getNodeConfig, CATEGORY_COLORS } from "@/lib/constants/node-registry"
import type { AllNodeTypes, NodeCategory, LinguaFlowNodeData } from "@/lib/types/nodes"

// Import node components
import { StudentProfileNode } from "@/components/nodes/esl/student-profile-node"
import { ScaffoldedContentNode } from "@/components/nodes/esl/scaffolded-content-node"
import { L1BridgeNode } from "@/components/nodes/esl/l1-bridge-node"
import { VocabularyBuilderNode } from "@/components/nodes/esl/vocabulary-builder-node"
import { ComprehensibleInputNode } from "@/components/nodes/esl/comprehensible-input-node"
import { OralPracticeNode } from "@/components/nodes/esl/oral-practice-node"
import { ReadingPassageNode } from "@/components/nodes/esl/reading-passage-node"
import { AIModelNode } from "@/components/nodes/orchestration/ai-model-node"
import { RouterNode } from "@/components/nodes/orchestration/router-node"
import { LoopNode } from "@/components/nodes/orchestration/loop-node"
import { ParallelNode } from "@/components/nodes/orchestration/parallel-node"
import { HumanInLoopNode } from "@/components/nodes/orchestration/human-in-loop-node"
import { ComprehensionCheckNode } from "@/components/nodes/assessment/comprehension-check-node"
import { SpeakingAssessmentNode } from "@/components/nodes/assessment/speaking-assessment-node"
import { ProgressTrackerNode } from "@/components/nodes/assessment/progress-tracker-node"
import { FeedbackGeneratorNode } from "@/components/nodes/assessment/feedback-generator-node"
import { InputNode } from "@/components/nodes/input-node"
import { OutputNode } from "@/components/nodes/output-node"
import { ProcessNode } from "@/components/nodes/process-node"
import { ConditionalNode } from "@/components/nodes/conditional-node"
import { CodeNode } from "@/components/nodes/code-node"
import CustomEdge from "@/components/custom-edge"

// Import generic node component for new types
import { GenericLinguaFlowNode } from "./generic-node"

// Build node types mapping
const nodeTypes: NodeTypes = {
  // ESL Nodes
  "student-profile": StudentProfileNode,
  "scaffolded-content": ScaffoldedContentNode,
  "scaffolding": ScaffoldedContentNode,
  "l1-bridge": L1BridgeNode,
  "vocabulary-builder": VocabularyBuilderNode,
  "comprehensible-input": ComprehensibleInputNode,
  "oral-practice": OralPracticeNode,
  "reading-passage": ReadingPassageNode,
  // AI Nodes
  "ai-model": AIModelNode,
  "prompt-template": GenericLinguaFlowNode,
  "structured-output": GenericLinguaFlowNode,
  // Scaffolding Nodes
  "visual-support": GenericLinguaFlowNode,
  // Interaction Nodes
  "human-input": HumanInLoopNode,
  "voice-input": GenericLinguaFlowNode,
  "comprehension-check": ComprehensionCheckNode,
  "multiple-choice": GenericLinguaFlowNode,
  "free-response": GenericLinguaFlowNode,
  // Flow Control Nodes
  "proficiency-router": RouterNode,
  router: RouterNode,
  loop: LoopNode,
  merge: GenericLinguaFlowNode,
  parallel: ParallelNode,
  conditional: ConditionalNode,
  variable: GenericLinguaFlowNode,
  // Output Nodes
  "progress-tracker": ProgressTrackerNode,
  feedback: FeedbackGeneratorNode,
  celebration: GenericLinguaFlowNode,
  "speaking-assessment": SpeakingAssessmentNode,
  // Original Nodes
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
  code: CodeNode,
  // Learning Nodes
  "curriculum-selector": GenericLinguaFlowNode,
  "content-generator": GenericLinguaFlowNode,
  "math-problem-generator": GenericLinguaFlowNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

interface WorkflowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  onNodeSelect: (node: Node | null) => void
  selectedNodeId?: string
  executingNodeId?: string
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onNodeSelect,
  selectedNodeId,
  executingNodeId,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        type: "custom",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        animated: false,
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow") as AllNodeTypes
      if (!type || !reactFlowWrapper.current || !reactFlowInstance) {
        return
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const nodeConfig = getNodeConfig(type)
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          ...nodeConfig?.defaultData,
          label: nodeConfig?.label || type,
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [reactFlowInstance, setNodes]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node)
    },
    [onNodeSelect]
  )

  const onPaneClick = useCallback(() => {
    onNodeSelect(null)
  }, [onNodeSelect])

  // Highlight executing node
  const styledNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      className: cn(
        node.id === selectedNodeId && "ring-2 ring-primary ring-offset-2",
        node.id === executingNodeId && "ring-2 ring-blue-500 ring-offset-2 animate-pulse"
      ),
    }))
  }, [nodes, selectedNodeId, executingNodeId])

  // Custom minimap node colors
  const minimapNodeColor = useCallback((node: Node) => {
    const category = (node.data?.category as NodeCategory) || "flow"
    const colors: Record<NodeCategory, string> = {
      learning: "#3b82f6",
      ai: "#a855f7",
      scaffolding: "#10b981",
      interaction: "#f97316",
      flow: "#64748b",
      output: "#14b8a6",
    }
    return colors[category] || "#64748b"
  }, [])

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: "custom",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        <Controls />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-background border rounded-lg"
        />
      </ReactFlow>
    </div>
  )
}

export default WorkflowCanvas
