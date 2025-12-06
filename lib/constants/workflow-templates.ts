/**
 * Workflow Templates
 * Pre-built learning pathway templates for common ESL scenarios
 */

import type { LinguaFlowNode, LinguaFlowEdge, LinguaFlowWorkflow } from "@/lib/types/workflow"

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: "literacy" | "numeracy" | "vocabulary" | "assessment" | "speaking"
  gradeRange: [number, number]
  elpaLevels: number[]
  tags: string[]
  thumbnail?: string
  nodes: LinguaFlowNode[]
  edges: LinguaFlowEdge[]
}

// ============================================================================
// Template: Math Word Problem Decoder
// ============================================================================

const mathWordProblemDecoderTemplate: WorkflowTemplate = {
  id: "math-word-problem-decoder",
  name: "Math Word Problem Decoder",
  description: "Helps ESL students decode and solve math word problems with language scaffolding. Includes vocabulary support, L1 bridges, and visual representations.",
  category: "numeracy",
  gradeRange: [3, 6],
  elpaLevels: [1, 2, 3, 4],
  tags: ["math", "word-problems", "scaffolding", "vocabulary"],
  nodes: [
    {
      id: "node-1",
      type: "student-profile",
      position: { x: 100, y: 200 },
      data: {
        label: "Student Profile",
        nodeType: "student-profile",
        category: "learning",
        config: {},
      },
    },
    {
      id: "node-2",
      type: "word-problem-decoder",
      position: { x: 350, y: 200 },
      data: {
        label: "Generate Problem",
        nodeType: "word-problem-decoder",
        category: "numeracy",
        config: {
          problemType: "subtraction",
          numberRange: [1, 100],
          contextTheme: "student-interests",
        },
      },
    },
    {
      id: "node-3",
      type: "vocabulary-builder",
      position: { x: 600, y: 100 },
      data: {
        label: "Key Vocabulary",
        nodeType: "vocabulary-builder",
        category: "learning",
        config: {
          maxWords: 5,
          includeL1: true,
          includeVisuals: true,
        },
      },
    },
    {
      id: "node-4",
      type: "l1-bridge",
      position: { x: 600, y: 300 },
      data: {
        label: "L1 Support",
        nodeType: "l1-bridge",
        category: "scaffolding",
        config: {
          bridgeType: "key-terms-only",
        },
      },
    },
    {
      id: "node-5",
      type: "scaffolded-content",
      position: { x: 850, y: 200 },
      data: {
        label: "Scaffolded Solution",
        nodeType: "scaffolded-content",
        category: "scaffolding",
        config: {
          scaffoldingType: "step-by-step",
          includeVisuals: true,
        },
      },
    },
    {
      id: "node-6",
      type: "human-input",
      position: { x: 1100, y: 200 },
      data: {
        label: "Student Answer",
        nodeType: "human-input",
        category: "interaction",
        config: {
          inputType: "number",
          prompt: "What is your answer?",
          hints: true,
        },
      },
    },
    {
      id: "node-7",
      type: "feedback",
      position: { x: 1350, y: 200 },
      data: {
        label: "Feedback",
        nodeType: "feedback",
        category: "output",
        config: {
          feedbackStyle: "encouraging",
          includeExplanation: true,
        },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
    { id: "e2-4", source: "node-2", target: "node-4" },
    { id: "e3-5", source: "node-3", target: "node-5" },
    { id: "e4-5", source: "node-4", target: "node-5" },
    { id: "e5-6", source: "node-5", target: "node-6" },
    { id: "e6-7", source: "node-6", target: "node-7" },
  ],
}

// ============================================================================
// Template: Vocabulary Builder
// ============================================================================

const vocabularyBuilderTemplate: WorkflowTemplate = {
  id: "vocabulary-builder",
  name: "Vocabulary Builder",
  description: "Interactive vocabulary learning with multi-modal support including definitions, L1 translations, images, and practice exercises.",
  category: "vocabulary",
  gradeRange: [1, 12],
  elpaLevels: [1, 2, 3, 4, 5],
  tags: ["vocabulary", "l1-support", "practice", "assessment"],
  nodes: [
    {
      id: "node-1",
      type: "student-profile",
      position: { x: 100, y: 200 },
      data: {
        label: "Student Profile",
        nodeType: "student-profile",
        category: "learning",
        config: {},
      },
    },
    {
      id: "node-2",
      type: "content-generator",
      position: { x: 350, y: 200 },
      data: {
        label: "Generate Passage",
        nodeType: "content-generator",
        category: "learning",
        config: {
          contentType: "passage",
          length: "medium",
          topicAlignment: "curriculum",
        },
      },
    },
    {
      id: "node-3",
      type: "vocabulary-builder",
      position: { x: 600, y: 200 },
      data: {
        label: "Extract Vocabulary",
        nodeType: "vocabulary-builder",
        category: "learning",
        config: {
          maxWords: 8,
          includeL1: true,
          includeVisuals: true,
          wordTypes: ["nouns", "verbs", "academic"],
        },
      },
    },
    {
      id: "node-4",
      type: "l1-bridge",
      position: { x: 850, y: 100 },
      data: {
        label: "L1 Definitions",
        nodeType: "l1-bridge",
        category: "scaffolding",
        config: {
          bridgeType: "key-terms-only",
        },
      },
    },
    {
      id: "node-5",
      type: "comprehension-check",
      position: { x: 850, y: 300 },
      data: {
        label: "Vocabulary Quiz",
        nodeType: "comprehension-check",
        category: "interaction",
        config: {
          questionCount: 5,
          questionTypes: ["vocabulary", "context-clues"],
          passThreshold: 70,
        },
      },
    },
    {
      id: "node-6",
      type: "proficiency-router",
      position: { x: 1100, y: 200 },
      data: {
        label: "Check Mastery",
        nodeType: "proficiency-router",
        category: "flow",
        config: {
          routingCriteria: "score",
          paths: [
            { label: "Needs Review", condition: "score < 70" },
            { label: "Mastered", condition: "score >= 70" },
          ],
        },
      },
    },
    {
      id: "node-7",
      type: "celebration",
      position: { x: 1350, y: 200 },
      data: {
        label: "Celebrate!",
        nodeType: "celebration",
        category: "output",
        config: {
          celebrationType: "confetti",
          message: "Great vocabulary work!",
        },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
    { id: "e3-4", source: "node-3", target: "node-4" },
    { id: "e3-5", source: "node-3", target: "node-5" },
    { id: "e4-6", source: "node-4", target: "node-6" },
    { id: "e5-6", source: "node-5", target: "node-6" },
    { id: "e6-7", source: "node-6", target: "node-7" },
  ],
}

// ============================================================================
// Template: Reading Comprehension Pathway
// ============================================================================

const readingComprehensionTemplate: WorkflowTemplate = {
  id: "reading-comprehension",
  name: "Reading Comprehension Pathway",
  description: "Guided reading comprehension with pre-reading vocabulary, during-reading checks, and post-reading assessment. Adapts to ELPA level.",
  category: "literacy",
  gradeRange: [2, 8],
  elpaLevels: [2, 3, 4, 5],
  tags: ["reading", "comprehension", "scaffolding", "assessment"],
  nodes: [
    {
      id: "node-1",
      type: "student-profile",
      position: { x: 100, y: 200 },
      data: {
        label: "Student Profile",
        nodeType: "student-profile",
        category: "learning",
        config: {},
      },
    },
    {
      id: "node-2",
      type: "curriculum-selector",
      position: { x: 350, y: 200 },
      data: {
        label: "Select Outcome",
        nodeType: "curriculum-selector",
        category: "learning",
        config: {
          subjectArea: "ela",
          strand: "reading",
        },
      },
    },
    {
      id: "node-3",
      type: "content-generator",
      position: { x: 600, y: 200 },
      data: {
        label: "Generate Passage",
        nodeType: "content-generator",
        category: "learning",
        config: {
          contentType: "passage",
          length: "medium",
          adjustToElpa: true,
        },
      },
    },
    {
      id: "node-4",
      type: "scaffolded-content",
      position: { x: 850, y: 200 },
      data: {
        label: "Add Scaffolds",
        nodeType: "scaffolded-content",
        category: "scaffolding",
        config: {
          scaffoldingType: "adaptive",
          elements: ["vocabulary-glossary", "graphic-organizer", "sentence-starters"],
        },
      },
    },
    {
      id: "node-5",
      type: "human-input",
      position: { x: 1100, y: 200 },
      data: {
        label: "Read Passage",
        nodeType: "human-input",
        category: "interaction",
        config: {
          inputType: "acknowledgment",
          prompt: "Read the passage above, then click Continue",
        },
      },
    },
    {
      id: "node-6",
      type: "comprehension-check",
      position: { x: 1350, y: 200 },
      data: {
        label: "Check Understanding",
        nodeType: "comprehension-check",
        category: "interaction",
        config: {
          questionCount: 5,
          questionTypes: ["main-idea", "detail", "inference", "vocabulary"],
          passThreshold: 70,
        },
      },
    },
    {
      id: "node-7",
      type: "feedback",
      position: { x: 1600, y: 200 },
      data: {
        label: "Provide Feedback",
        nodeType: "feedback",
        category: "output",
        config: {
          feedbackStyle: "encouraging",
          includeExplanation: true,
        },
      },
    },
    {
      id: "node-8",
      type: "progress-tracker",
      position: { x: 1850, y: 200 },
      data: {
        label: "Track Progress",
        nodeType: "progress-tracker",
        category: "output",
        config: {
          metrics: ["comprehension-score", "vocabulary-growth", "time-spent"],
        },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
    { id: "e3-4", source: "node-3", target: "node-4" },
    { id: "e4-5", source: "node-4", target: "node-5" },
    { id: "e5-6", source: "node-5", target: "node-6" },
    { id: "e6-7", source: "node-6", target: "node-7" },
    { id: "e7-8", source: "node-7", target: "node-8" },
  ],
}

// ============================================================================
// Template: Speaking Practice
// ============================================================================

const speakingPracticeTemplate: WorkflowTemplate = {
  id: "speaking-practice",
  name: "Speaking Practice",
  description: "Oral language development with pronunciation feedback, voice recording, and model responses. Great for developing fluency.",
  category: "speaking",
  gradeRange: [1, 12],
  elpaLevels: [1, 2, 3, 4],
  tags: ["speaking", "pronunciation", "voice", "fluency"],
  nodes: [
    {
      id: "node-1",
      type: "student-profile",
      position: { x: 100, y: 200 },
      data: {
        label: "Student Profile",
        nodeType: "student-profile",
        category: "learning",
        config: {},
      },
    },
    {
      id: "node-2",
      type: "prompt-template",
      position: { x: 350, y: 200 },
      data: {
        label: "Speaking Prompt",
        nodeType: "prompt-template",
        category: "ai",
        config: {
          template: "Generate a speaking prompt for an ELPA Level {{elpaLevel}} student about {{topic}}. Include model sentences they can practice.",
        },
      },
    },
    {
      id: "node-3",
      type: "ai-model",
      position: { x: 600, y: 200 },
      data: {
        label: "Generate Prompt",
        nodeType: "ai-model",
        category: "ai",
        config: {
          model: "gpt-4o-mini",
          temperature: 0.7,
        },
      },
    },
    {
      id: "node-4",
      type: "human-input",
      position: { x: 850, y: 200 },
      data: {
        label: "Voice Recording",
        nodeType: "human-input",
        category: "interaction",
        config: {
          inputType: "voice",
          prompt: "Record yourself saying the sentences",
          maxDuration: 60,
        },
      },
    },
    {
      id: "node-5",
      type: "ai-model",
      position: { x: 1100, y: 200 },
      data: {
        label: "Analyze Speech",
        nodeType: "ai-model",
        category: "ai",
        config: {
          model: "gpt-4o-mini",
          systemPrompt: "Analyze the student's speech for pronunciation, fluency, and grammar. Provide encouraging feedback appropriate for their ELPA level.",
        },
      },
    },
    {
      id: "node-6",
      type: "feedback",
      position: { x: 1350, y: 200 },
      data: {
        label: "Feedback",
        nodeType: "feedback",
        category: "output",
        config: {
          feedbackStyle: "encouraging",
          includeModelAudio: true,
        },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
    { id: "e3-4", source: "node-3", target: "node-4" },
    { id: "e4-5", source: "node-4", target: "node-5" },
    { id: "e5-6", source: "node-5", target: "node-6" },
  ],
}

// ============================================================================
// Template: Writing Scaffold
// ============================================================================

const writingScaffoldTemplate: WorkflowTemplate = {
  id: "writing-scaffold",
  name: "Writing Scaffold",
  description: "Guided writing with sentence frames, word banks, and structured support. Helps students build writing skills step by step.",
  category: "literacy",
  gradeRange: [2, 9],
  elpaLevels: [1, 2, 3, 4],
  tags: ["writing", "scaffolding", "sentence-frames", "word-banks"],
  nodes: [
    {
      id: "node-1",
      type: "student-profile",
      position: { x: 100, y: 200 },
      data: {
        label: "Student Profile",
        nodeType: "student-profile",
        category: "learning",
        config: {},
      },
    },
    {
      id: "node-2",
      type: "curriculum-selector",
      position: { x: 350, y: 200 },
      data: {
        label: "Writing Topic",
        nodeType: "curriculum-selector",
        category: "learning",
        config: {
          subjectArea: "ela",
          strand: "writing",
        },
      },
    },
    {
      id: "node-3",
      type: "scaffolded-content",
      position: { x: 600, y: 100 },
      data: {
        label: "Sentence Frames",
        nodeType: "scaffolded-content",
        category: "scaffolding",
        config: {
          scaffoldingType: "sentence-frames",
          adaptToElpa: true,
        },
      },
    },
    {
      id: "node-4",
      type: "vocabulary-builder",
      position: { x: 600, y: 300 },
      data: {
        label: "Word Bank",
        nodeType: "vocabulary-builder",
        category: "learning",
        config: {
          maxWords: 15,
          includeL1: true,
          wordTypes: ["topic-specific", "transitions", "adjectives"],
        },
      },
    },
    {
      id: "node-5",
      type: "human-input",
      position: { x: 850, y: 200 },
      data: {
        label: "Write Response",
        nodeType: "human-input",
        category: "interaction",
        config: {
          inputType: "text",
          prompt: "Use the sentence frames and word bank to write your response",
          minLength: 50,
        },
      },
    },
    {
      id: "node-6",
      type: "ai-model",
      position: { x: 1100, y: 200 },
      data: {
        label: "Analyze Writing",
        nodeType: "ai-model",
        category: "ai",
        config: {
          model: "gpt-4o-mini",
          systemPrompt: "Analyze this ESL student's writing. Focus on: 1) Use of sentence frames, 2) Vocabulary usage, 3) Grammar appropriate for their ELPA level. Provide specific, encouraging feedback.",
        },
      },
    },
    {
      id: "node-7",
      type: "feedback",
      position: { x: 1350, y: 200 },
      data: {
        label: "Writing Feedback",
        nodeType: "feedback",
        category: "output",
        config: {
          feedbackStyle: "encouraging",
          includeCorrections: true,
        },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
    { id: "e2-4", source: "node-2", target: "node-4" },
    { id: "e3-5", source: "node-3", target: "node-5" },
    { id: "e4-5", source: "node-4", target: "node-5" },
    { id: "e5-6", source: "node-5", target: "node-6" },
    { id: "e6-7", source: "node-6", target: "node-7" },
  ],
}

// ============================================================================
// Template Registry
// ============================================================================

export const workflowTemplates: WorkflowTemplate[] = [
  mathWordProblemDecoderTemplate,
  vocabularyBuilderTemplate,
  readingComprehensionTemplate,
  speakingPracticeTemplate,
  writingScaffoldTemplate,
]

export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return workflowTemplates.find(t => t.id === id)
}

export const getTemplatesByCategory = (category: WorkflowTemplate["category"]): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => t.category === category)
}

export const getTemplatesForElpaLevel = (level: number): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => t.elpaLevels.includes(level))
}

export const getTemplatesForGrade = (grade: number): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => grade >= t.gradeRange[0] && grade <= t.gradeRange[1])
}

export const searchTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase()
  return workflowTemplates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Create a workflow from a template
 */
export const createWorkflowFromTemplate = (
  template: WorkflowTemplate,
  options: {
    name?: string
    authorId?: string
  } = {}
): Omit<LinguaFlowWorkflow, "id" | "createdAt" | "updatedAt"> => {
  return {
    name: options.name || `${template.name} (Copy)`,
    description: template.description,
    category: template.category,
    targetGrades: [`${template.gradeRange[0]}-${template.gradeRange[1]}`],
    targetELPALevels: template.elpaLevels,
    isTemplate: false,
    isPublic: false,
    createdBy: options.authorId || "anonymous",
    nodes: template.nodes.map(node => ({
      ...node,
      id: `${node.id}-${Date.now()}`,
    })),
    edges: template.edges.map(edge => ({
      ...edge,
      id: `${edge.id}-${Date.now()}`,
    })),
    tags: template.tags,
  }
}

export default workflowTemplates
