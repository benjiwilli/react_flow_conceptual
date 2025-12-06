"use client"

import * as React from "react"
import { Search, BookOpen, Calculator, MessageSquare, FileText, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  workflowTemplates,
  getTemplatesByCategory,
  type WorkflowTemplate,
} from "@/lib/constants/workflow-templates"

interface TemplateBrowserProps {
  onSelectTemplate: (template: WorkflowTemplate) => void
  onClose?: () => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  literacy: <BookOpen className="h-4 w-4" />,
  numeracy: <Calculator className="h-4 w-4" />,
  vocabulary: <FileText className="h-4 w-4" />,
  assessment: <FileText className="h-4 w-4" />,
  speaking: <Mic className="h-4 w-4" />,
}

const categoryColors: Record<string, string> = {
  literacy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  numeracy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  vocabulary: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  assessment: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  speaking: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: WorkflowTemplate
  onSelect: () => void
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${categoryColors[template.category]}`}>
              {categoryIcons[template.category]}
            </div>
            <CardTitle className="text-base">{template.name}</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            Grades {template.gradeRange[0]}-{template.gradeRange[1]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            ELPA {template.elpaLevels.join(", ")}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          size="sm" 
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  )
}

export function TemplateBrowser({ onSelectTemplate, onClose }: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedElpaLevel, setSelectedElpaLevel] = React.useState<number | null>(null)

  const filteredTemplates = React.useMemo(() => {
    let templates = [...workflowTemplates]

    // Filter by category
    if (selectedCategory !== "all") {
      templates = getTemplatesByCategory(selectedCategory as WorkflowTemplate["category"])
    }

    // Filter by ELPA level
    if (selectedElpaLevel !== null) {
      templates = templates.filter((t) => t.elpaLevels.includes(selectedElpaLevel))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag: string) => tag.toLowerCase().includes(query))
      )
    }

    return templates
  }, [searchQuery, selectedCategory, selectedElpaLevel])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Workflow Templates</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="border-b px-4 py-2">
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="literacy" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Literacy
            </TabsTrigger>
            <TabsTrigger value="numeracy" className="flex items-center gap-1">
              <Calculator className="h-3 w-3" /> Numeracy
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> Vocabulary
            </TabsTrigger>
            <TabsTrigger value="speaking" className="flex items-center gap-1">
              <Mic className="h-3 w-3" /> Speaking
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ELPA Level Filter */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">ELPA Level:</span>
          <div className="flex gap-1">
            {[null, 1, 2, 3, 4, 5].map((level) => (
              <Button
                key={level ?? "all"}
                variant={selectedElpaLevel === level ? "default" : "outline"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setSelectedElpaLevel(level)}
              >
                {level ?? "All"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <ScrollArea className="flex-1 p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No templates match your search criteria</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedElpaLevel(null)
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} available
      </div>
    </div>
  )
}
