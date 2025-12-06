/**
 * Node Registry - Complete configuration for all LinguaFlow nodes
 * Defines metadata, default values, and port definitions for each node type
 */

import type {
  NodeTypeConfig,
  NodeCategory,
  AllNodeTypes,
  StudentProfileNodeData,
  CurriculumSelectorNodeData,
  ContentGeneratorNodeData,
  MathProblemGeneratorNodeData,
  VocabularyBuilderNodeData,
  AIModelNodeData,
  PromptTemplateNodeData,
  StructuredOutputNodeData,
  ScaffoldingNodeData,
  L1BridgeNodeData,
  VisualSupportNodeData,
  HumanInputNodeData,
  VoiceInputNodeData,
  ComprehensionCheckNodeData,
  MultipleChoiceNodeData,
  FreeResponseNodeData,
  OralPracticeNodeData,
  ProficiencyRouterNodeData,
  LoopNodeData,
  MergeNodeData,
  ConditionalNodeData,
  ProgressTrackerNodeData,
  FeedbackNodeData,
  CelebrationNodeData,
} from "@/lib/types/nodes"

// ============================================================================
// Category Colors (matches design system from vision)
// ============================================================================

export const CATEGORY_COLORS: Record<NodeCategory, { bg: string; border: string; text: string; light: string }> = {
  learning: {
    bg: "bg-blue-500",
    border: "border-blue-500",
    text: "text-blue-600",
    light: "bg-blue-100",
  },
  ai: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    text: "text-purple-600",
    light: "bg-purple-100",
  },
  scaffolding: {
    bg: "bg-emerald-500",
    border: "border-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-100",
  },
  interaction: {
    bg: "bg-orange-500",
    border: "border-orange-500",
    text: "text-orange-600",
    light: "bg-orange-100",
  },
  flow: {
    bg: "bg-slate-500",
    border: "border-slate-500",
    text: "text-slate-600",
    light: "bg-slate-100",
  },
  output: {
    bg: "bg-teal-500",
    border: "border-teal-500",
    text: "text-teal-600",
    light: "bg-teal-100",
  },
}

// ============================================================================
// Category Labels
// ============================================================================

export const CATEGORY_LABELS: Record<NodeCategory, { label: string; description: string }> = {
  learning: {
    label: "Learning Nodes",
    description: "Student profile, curriculum, and content generation",
  },
  ai: {
    label: "AI Model Nodes",
    description: "AI model configuration and prompt engineering",
  },
  scaffolding: {
    label: "Scaffolding Nodes",
    description: "Language support, visuals, and L1 bridges",
  },
  interaction: {
    label: "Interaction Nodes",
    description: "Student input, voice, and comprehension checks",
  },
  flow: {
    label: "Flow Control Nodes",
    description: "Routing, loops, and conditional logic",
  },
  output: {
    label: "Output Nodes",
    description: "Progress tracking, feedback, and celebrations",
  },
}

// ============================================================================
// Node Registry
// ============================================================================

export const NODE_REGISTRY: NodeTypeConfig[] = [
  // -------------------------------------------------------------------------
  // Learning Nodes
  // -------------------------------------------------------------------------
  {
    type: "student-profile",
    category: "learning",
    label: "Student Profile",
    description: "Entry point that captures student context for personalization",
    icon: "User",
    color: "blue",
    defaultData: {
      label: "Student Profile",
      category: "learning",
      isConfigured: false,
    } as Partial<StudentProfileNodeData>,
    inputs: [],
    outputs: [
      {
        id: "context",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
  },
  {
    type: "curriculum-selector",
    category: "learning",
    label: "Curriculum Selector",
    description: "Select Alberta curriculum outcomes for the lesson",
    icon: "BookOpen",
    color: "blue",
    defaultData: {
      label: "Curriculum Selector",
      category: "learning",
      isConfigured: false,
      crossCurricular: false,
      difficultyAdjustment: 0,
    } as Partial<CurriculumSelectorNodeData>,
    inputs: [
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
    outputs: [
      {
        id: "outcomes",
        label: "Curriculum Outcomes",
        type: "object",
        required: true,
      },
    ],
  },
  {
    type: "content-generator",
    category: "learning",
    label: "Content Generator",
    description: "Generate instructional content using AI",
    icon: "FileText",
    color: "blue",
    defaultData: {
      label: "Content Generator",
      category: "learning",
      isConfigured: false,
      contentType: "passage",
      length: "medium",
      complexityLevel: "auto",
      includeVisuals: false,
    } as Partial<ContentGeneratorNodeData>,
    inputs: [
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
      {
        id: "curriculum",
        label: "Curriculum",
        type: "object",
        required: false,
      },
    ],
    outputs: [
      {
        id: "content",
        label: "Generated Content",
        type: "content",
        required: true,
      },
    ],
  },
  {
    type: "math-problem-generator",
    category: "learning",
    label: "Math Problem Generator",
    description: "Create math problems with language scaffolding",
    icon: "Calculator",
    color: "blue",
    defaultData: {
      label: "Math Problem Generator",
      category: "learning",
      isConfigured: false,
      problemType: "word-problem",
      scaffoldLevel: "vocabulary-only",
      wordProblem: true,
      includeVisuals: true,
    } as Partial<MathProblemGeneratorNodeData>,
    inputs: [
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
    outputs: [
      {
        id: "problem",
        label: "Math Problem",
        type: "object",
        required: true,
      },
    ],
  },
  {
    type: "vocabulary-builder",
    category: "learning",
    label: "Vocabulary Builder",
    description: "Extract and teach key vocabulary from content",
    icon: "BookA",
    color: "blue",
    defaultData: {
      label: "Vocabulary Builder",
      category: "learning",
      isConfigured: false,
      maxWords: 5,
      includeL1Translations: true,
      includeVisuals: true,
      includeAudio: true,
      focusType: "tier-2",
      contextSentences: true,
    } as Partial<VocabularyBuilderNodeData>,
    inputs: [
      {
        id: "content",
        label: "Content",
        type: "content",
        required: true,
      },
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: false,
      },
    ],
    outputs: [
      {
        id: "vocabulary",
        label: "Vocabulary Set",
        type: "array",
        required: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // AI Model Nodes
  // -------------------------------------------------------------------------
  {
    type: "ai-model",
    category: "ai",
    label: "AI Model",
    description: "Configure and invoke AI models",
    icon: "Brain",
    color: "purple",
    defaultData: {
      label: "AI Model",
      category: "ai",
      isConfigured: false,
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt: "",
      streamResponse: true,
      retryOnFailure: true,
      maxRetries: 3,
    } as Partial<AIModelNodeData>,
    inputs: [
      {
        id: "prompt",
        label: "Prompt",
        type: "string",
        required: true,
      },
      {
        id: "context",
        label: "Context",
        type: "object",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        label: "AI Response",
        type: "string",
        required: true,
      },
    ],
  },
  {
    type: "prompt-template",
    category: "ai",
    label: "Prompt Template",
    description: "Build dynamic prompts with variables",
    icon: "FileCode",
    color: "purple",
    defaultData: {
      label: "Prompt Template",
      category: "ai",
      isConfigured: false,
      template: "",
      variables: [],
      outputFormat: "text",
    } as Partial<PromptTemplateNodeData>,
    inputs: [
      {
        id: "variables",
        label: "Variables",
        type: "object",
        required: false,
      },
    ],
    outputs: [
      {
        id: "prompt",
        label: "Constructed Prompt",
        type: "string",
        required: true,
      },
    ],
  },
  {
    type: "structured-output",
    category: "ai",
    label: "Structured Output",
    description: "Parse AI output into structured data",
    icon: "Braces",
    color: "purple",
    defaultData: {
      label: "Structured Output",
      category: "ai",
      isConfigured: false,
      schema: "",
      schemaName: "",
      validateOutput: true,
      fallbackBehavior: "retry",
    } as Partial<StructuredOutputNodeData>,
    inputs: [
      {
        id: "input",
        label: "Raw Input",
        type: "string",
        required: true,
      },
    ],
    outputs: [
      {
        id: "data",
        label: "Structured Data",
        type: "object",
        required: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Scaffolding Nodes
  // -------------------------------------------------------------------------
  {
    type: "scaffolding",
    category: "scaffolding",
    label: "Scaffolding",
    description: "Adjust content complexity based on proficiency",
    icon: "Layers",
    color: "emerald",
    defaultData: {
      label: "Scaffolding",
      category: "scaffolding",
      isConfigured: false,
      scaffoldingType: "add-supports",
      preserveMeaning: true,
      scaffoldElements: ["sentence-starters", "word-banks"],
      autoAdjust: true,
    } as Partial<ScaffoldingNodeData>,
    inputs: [
      {
        id: "content",
        label: "Content",
        type: "content",
        required: true,
      },
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
    outputs: [
      {
        id: "scaffolded",
        label: "Scaffolded Content",
        type: "content",
        required: true,
      },
    ],
  },
  {
    type: "l1-bridge",
    category: "scaffolding",
    label: "L1 Bridge",
    description: "First-language support for concept understanding",
    icon: "Languages",
    color: "emerald",
    defaultData: {
      label: "L1 Bridge",
      category: "scaffolding",
      isConfigured: false,
      bridgeType: "key-terms-only",
      displayMode: "inline",
      targetLanguages: [],
      translateConcepts: true,
      culturalContext: true,
      showPronunciation: false,
    } as Partial<L1BridgeNodeData>,
    inputs: [
      {
        id: "content",
        label: "Content",
        type: "content",
        required: true,
      },
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
    outputs: [
      {
        id: "bilingual",
        label: "Bilingual Content",
        type: "content",
        required: true,
      },
    ],
  },
  {
    type: "visual-support",
    category: "scaffolding",
    label: "Visual Support",
    description: "Generate or attach visual representations",
    icon: "Image",
    color: "emerald",
    defaultData: {
      label: "Visual Support",
      category: "scaffolding",
      isConfigured: false,
      visualType: "illustration",
      generationMethod: "ai-generated",
      altTextRequired: true,
    } as Partial<VisualSupportNodeData>,
    inputs: [
      {
        id: "content",
        label: "Content",
        type: "content",
        required: true,
      },
    ],
    outputs: [
      {
        id: "visual",
        label: "Visual Content",
        type: "object",
        required: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Interaction Nodes
  // -------------------------------------------------------------------------
  {
    type: "human-input",
    category: "interaction",
    label: "Human Input",
    description: "Pause workflow for student response",
    icon: "MessageSquare",
    color: "orange",
    defaultData: {
      label: "Human Input",
      category: "interaction",
      isConfigured: false,
      inputType: "text",
      prompt: "",
      retryAllowed: true,
      maxRetries: 3,
      hintAvailable: true,
    } as Partial<HumanInputNodeData>,
    inputs: [
      {
        id: "prompt",
        label: "Prompt",
        type: "string",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        label: "Student Response",
        type: "string",
        required: true,
      },
    ],
  },
  {
    type: "voice-input",
    category: "interaction",
    label: "Voice Input",
    description: "Capture and process spoken input",
    icon: "Mic",
    color: "orange",
    defaultData: {
      label: "Voice Input",
      category: "interaction",
      isConfigured: false,
      expectedLanguage: "english",
      pronunciationFeedback: true,
      modelAudioPlayback: true,
      transcriptionRequired: true,
      maxDuration: 60,
    } as Partial<VoiceInputNodeData>,
    inputs: [
      {
        id: "prompt",
        label: "Prompt",
        type: "string",
        required: false,
      },
    ],
    outputs: [
      {
        id: "transcription",
        label: "Transcription",
        type: "string",
        required: true,
      },
      {
        id: "analysis",
        label: "Pronunciation Analysis",
        type: "object",
        required: false,
      },
    ],
  },
  {
    type: "comprehension-check",
    category: "interaction",
    label: "Comprehension Check",
    description: "Assess understanding before proceeding",
    icon: "CheckCircle",
    color: "orange",
    defaultData: {
      label: "Comprehension Check",
      category: "interaction",
      isConfigured: false,
      questionCount: 3,
      questionTypes: ["literal", "vocabulary"],
      passThreshold: 70,
      adaptiveQuestions: true,
      showFeedback: true,
    } as Partial<ComprehensionCheckNodeData>,
    inputs: [
      {
        id: "content",
        label: "Content",
        type: "content",
        required: true,
      },
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
    outputs: [
      {
        id: "result",
        label: "Check Result",
        type: "object",
        required: true,
      },
      {
        id: "passed",
        label: "Passed",
        type: "boolean",
        required: true,
      },
    ],
  },
  {
    type: "multiple-choice",
    category: "interaction",
    label: "Multiple Choice",
    description: "Present multiple choice questions",
    icon: "ListChecks",
    color: "orange",
    defaultData: {
      label: "Multiple Choice",
      category: "interaction",
      isConfigured: false,
      question: "",
      options: [],
      correctAnswer: "",
      shuffleOptions: true,
      showFeedback: true,
      allowPartialCredit: false,
    } as Partial<MultipleChoiceNodeData>,
    inputs: [
      {
        id: "question",
        label: "Question Data",
        type: "object",
        required: false,
      },
    ],
    outputs: [
      {
        id: "answer",
        label: "Selected Answer",
        type: "string",
        required: true,
      },
      {
        id: "correct",
        label: "Is Correct",
        type: "boolean",
        required: true,
      },
    ],
  },
  {
    type: "free-response",
    category: "interaction",
    label: "Free Response",
    description: "Open-ended text response from student",
    icon: "PenLine",
    color: "orange",
    defaultData: {
      label: "Free Response",
      category: "interaction",
      isConfigured: false,
      prompt: "",
      aiGrading: true,
    } as Partial<FreeResponseNodeData>,
    inputs: [
      {
        id: "prompt",
        label: "Prompt",
        type: "string",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        label: "Student Response",
        type: "string",
        required: true,
      },
      {
        id: "evaluation",
        label: "Evaluation",
        type: "object",
        required: false,
      },
    ],
  },
  {
    type: "oral-practice",
    category: "interaction",
    label: "Oral Practice",
    description: "Speaking practice with scenarios",
    icon: "Speech",
    color: "orange",
    defaultData: {
      label: "Oral Practice",
      category: "interaction",
      isConfigured: false,
      scenario: "classroom",
      turns: 3,
      recordingEnabled: true,
      feedbackType: "end",
    } as Partial<OralPracticeNodeData>,
    inputs: [
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: true,
      },
    ],
    outputs: [
      {
        id: "transcript",
        label: "Conversation Transcript",
        type: "array",
        required: true,
      },
      {
        id: "assessment",
        label: "Assessment",
        type: "object",
        required: false,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Flow Control Nodes
  // -------------------------------------------------------------------------
  {
    type: "proficiency-router",
    category: "flow",
    label: "Proficiency Router",
    description: "Route students based on demonstrated ability",
    icon: "GitBranch",
    color: "slate",
    defaultData: {
      label: "Proficiency Router",
      category: "flow",
      isConfigured: false,
      routingCriteria: { type: "elpa-level" },
      paths: [
        { id: "support", label: "Needs Support", condition: "level <= 2" },
        { id: "track", label: "On Track", condition: "level == 3" },
        { id: "advance", label: "Ready to Advance", condition: "level >= 4" },
      ],
      defaultPath: "track",
      evaluateOnInput: true,
    } as Partial<ProficiencyRouterNodeData>,
    inputs: [
      {
        id: "assessment",
        label: "Assessment Result",
        type: "object",
        required: true,
      },
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: false,
      },
    ],
    outputs: [
      {
        id: "support",
        label: "Needs Support",
        type: "any",
        required: false,
      },
      {
        id: "track",
        label: "On Track",
        type: "any",
        required: false,
      },
      {
        id: "advance",
        label: "Ready to Advance",
        type: "any",
        required: false,
      },
    ],
  },
  {
    type: "loop",
    category: "flow",
    label: "Loop",
    description: "Repeat a section of the workflow",
    icon: "Repeat",
    color: "slate",
    defaultData: {
      label: "Loop",
      category: "flow",
      isConfigured: false,
      loopType: "count-based",
      maxIterations: 5,
      bodyNodeIds: [],
      aggregateResults: true,
    } as Partial<LoopNodeData>,
    inputs: [
      {
        id: "items",
        label: "Items/Count",
        type: "any",
        required: true,
      },
    ],
    outputs: [
      {
        id: "current",
        label: "Current Item",
        type: "any",
        required: true,
      },
      {
        id: "results",
        label: "Aggregated Results",
        type: "array",
        required: false,
      },
    ],
  },
  {
    type: "merge",
    category: "flow",
    label: "Merge",
    description: "Combine outputs from multiple branches",
    icon: "GitMerge",
    color: "slate",
    defaultData: {
      label: "Merge",
      category: "flow",
      isConfigured: false,
      mergeStrategy: "aggregate",
      waitForAll: true,
    } as Partial<MergeNodeData>,
    inputs: [
      {
        id: "input1",
        label: "Input 1",
        type: "any",
        required: true,
      },
      {
        id: "input2",
        label: "Input 2",
        type: "any",
        required: true,
      },
    ],
    outputs: [
      {
        id: "merged",
        label: "Merged Output",
        type: "any",
        required: true,
      },
    ],
  },
  {
    type: "conditional",
    category: "flow",
    label: "Conditional",
    description: "Branch based on conditions",
    icon: "Split",
    color: "slate",
    defaultData: {
      label: "Conditional",
      category: "flow",
      isConfigured: false,
      condition: "",
      trueLabel: "Yes",
      falseLabel: "No",
      evaluationType: "boolean",
    } as Partial<ConditionalNodeData>,
    inputs: [
      {
        id: "input",
        label: "Input",
        type: "any",
        required: true,
      },
    ],
    outputs: [
      {
        id: "true",
        label: "True",
        type: "any",
        required: true,
      },
      {
        id: "false",
        label: "False",
        type: "any",
        required: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Output Nodes
  // -------------------------------------------------------------------------
  {
    type: "progress-tracker",
    category: "output",
    label: "Progress Tracker",
    description: "Record and display student progress",
    icon: "TrendingUp",
    color: "teal",
    defaultData: {
      label: "Progress Tracker",
      category: "output",
      isConfigured: false,
      metricsToTrack: ["accuracy", "time-on-task", "attempts"],
      persistData: true,
      reportFormat: "visual",
      notifyTeacher: false,
    } as Partial<ProgressTrackerNodeData>,
    inputs: [
      {
        id: "session",
        label: "Session Data",
        type: "object",
        required: true,
      },
      {
        id: "results",
        label: "Assessment Results",
        type: "object",
        required: false,
      },
    ],
    outputs: [
      {
        id: "report",
        label: "Progress Report",
        type: "object",
        required: true,
      },
    ],
  },
  {
    type: "feedback",
    category: "output",
    label: "Feedback",
    description: "Provide encouraging, constructive feedback",
    icon: "MessageCircle",
    color: "teal",
    defaultData: {
      label: "Feedback",
      category: "output",
      isConfigured: false,
      feedbackStyle: "growth-mindset",
      includeCorrectAnswer: true,
      culturalToneAdjustment: true,
      encouragementLevel: "high",
      personalized: true,
      l1Support: false,
    } as Partial<FeedbackNodeData>,
    inputs: [
      {
        id: "response",
        label: "Student Response",
        type: "string",
        required: true,
      },
      {
        id: "expected",
        label: "Expected Answer",
        type: "string",
        required: false,
      },
      {
        id: "student",
        label: "Student Context",
        type: "student-context",
        required: false,
      },
    ],
    outputs: [
      {
        id: "feedback",
        label: "Feedback Message",
        type: "string",
        required: true,
      },
    ],
  },
  {
    type: "celebration",
    category: "output",
    label: "Celebration",
    description: "Celebrate achievements and maintain motivation",
    icon: "PartyPopper",
    color: "teal",
    defaultData: {
      label: "Celebration",
      category: "output",
      isConfigured: false,
      celebrationType: "confetti",
      milestoneDefinitions: [],
      soundEnabled: true,
      animationEnabled: true,
      shareToClassroom: false,
    } as Partial<CelebrationNodeData>,
    inputs: [
      {
        id: "milestone",
        label: "Milestone",
        type: "object",
        required: true,
      },
    ],
    outputs: [
      {
        id: "celebrated",
        label: "Celebration Shown",
        type: "boolean",
        required: true,
      },
    ],
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

export const getNodesByCategory = (category: NodeCategory): NodeTypeConfig[] => {
  return NODE_REGISTRY.filter((node) => node.category === category)
}

export const getNodeConfig = (type: AllNodeTypes): NodeTypeConfig | undefined => {
  return NODE_REGISTRY.find((node) => node.type === type)
}

export const getAllCategories = (): NodeCategory[] => {
  return ["learning", "ai", "scaffolding", "interaction", "flow", "output"]
}

export const getCategoryColor = (category: NodeCategory) => {
  return CATEGORY_COLORS[category]
}
