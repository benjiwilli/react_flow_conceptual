"use client"

/**
 * Node Palette Component
 * Categorized sidebar for dragging nodes onto the canvas
 * Following the design vision: Learning (Blue), AI (Purple), Scaffolding (Green),
 * Interaction (Orange), Flow (Gray), Output (Teal)
 */

import { useState } from "react"
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
  ChevronDown,
  ChevronRight,
  Search,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  NODE_REGISTRY,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  getNodesByCategory,
  getAllCategories,
} from "@/lib/constants/node-registry"
import type { NodeCategory, AllNodeTypes, NodeTypeConfig } from "@/lib/types/nodes"

// Icon mapping for node types
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
}

interface NodePaletteProps {
  onNodeDragStart?: (nodeType: AllNodeTypes) => void
}

export function NodePalette({ onNodeDragStart }: NodePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(getAllCategories())
  )
  const [searchQuery, setSearchQuery] = useState("")

  const toggleCategory = (category: NodeCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const filteredNodes = searchQuery.trim()
    ? NODE_REGISTRY.filter(
        (node) =>
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  const onDragStart = (event: React.DragEvent, nodeType: AllNodeTypes) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
    onNodeDragStart?.(nodeType)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search nodes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Node Categories */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchQuery.trim() ? (
            // Search Results
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">
                {filteredNodes?.length || 0} results
              </p>
              {filteredNodes?.map((node) => (
                <NodeItem
                  key={node.type}
                  node={node}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          ) : (
            // Categorized View
            getAllCategories().map((category) => (
              <CategorySection
                key={category}
                category={category}
                isExpanded={expandedCategories.has(category)}
                onToggle={() => toggleCategory(category)}
                nodes={getNodesByCategory(category)}
                onDragStart={onDragStart}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Help Text */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Drag nodes onto the canvas to build your learning pathway
        </p>
      </div>
    </div>
  )
}

interface CategorySectionProps {
  category: NodeCategory
  isExpanded: boolean
  onToggle: () => void
  nodes: NodeTypeConfig[]
  onDragStart: (event: React.DragEvent, nodeType: AllNodeTypes) => void
}

function CategorySection({
  category,
  isExpanded,
  onToggle,
  nodes,
  onDragStart,
}: CategorySectionProps) {
  const colors = CATEGORY_COLORS[category]
  const labels = CATEGORY_LABELS[category]

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors",
          "hover:bg-muted/50"
        )}
      >
        <div className={cn("w-3 h-3 rounded-full", colors.bg)} />
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="flex-1">
          <span className="font-medium text-sm">{labels.label}</span>
          <span className="text-xs text-muted-foreground ml-2">({nodes.length})</span>
        </div>
      </button>

      {isExpanded && (
        <div className="ml-5 mt-1 space-y-1">
          {nodes.map((node) => (
            <NodeItem key={node.type} node={node} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  )
}

interface NodeItemProps {
  node: NodeTypeConfig
  onDragStart: (event: React.DragEvent, nodeType: AllNodeTypes) => void
}

function NodeItem({ node, onDragStart }: NodeItemProps) {
  const colors = CATEGORY_COLORS[node.category]
  const Icon = ICONS[node.icon] || FileText

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-grab transition-all duration-200",
        "border border-transparent bg-background",
        "hover:border-border hover:shadow-sm hover:translate-x-1",
        "active:cursor-grabbing active:opacity-70"
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm", colors.light)}>
        <Icon className={cn("h-5 w-5", colors.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate text-foreground">{node.label}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{node.description}</p>
      </div>
    </div>
  )
}

export default NodePalette
