/**
 * Node Runners
 * Individual execution handlers for each node type
 * These runners process inputs and produce outputs for workflow execution
 */

import type { LinguaFlowNode, LinguaFlowNodeData } from "@/lib/types/workflow"
import type { ExecutionContext } from "@/lib/types/execution"

export interface NodeRunnerResult {
  output: Record<string, unknown>
  nextNodeId?: string
  shouldPause?: boolean
  streamContent?: string
}

export type NodeRunner = (
  node: LinguaFlowNode,
  input: Record<string, unknown>,
  context: ExecutionContext,
) => Promise<NodeRunnerResult>

// ============================================================================
// Learning Nodes
// ============================================================================

/**
 * Student Profile Node Runner
 * Initializes student context for the workflow
 */
export const runStudentProfileNode: NodeRunner = async (node, input, context) => {
  return {
    output: {
      studentProfile: context.studentProfile,
      elpaLevel: context.currentLanguageLevel,
      nativeLanguage: context.studentProfile.nativeLanguage,
      gradeLevel: context.studentProfile.gradeLevel,
      interests: context.studentProfile.interests,
    },
  }
}

/**
 * Curriculum Selector Node Runner
 * Selects curriculum outcomes based on student profile
 */
export const runCurriculumSelectorNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  return {
    output: {
      subjectArea: config.subjectArea || "ela",
      gradeLevel: context.studentProfile.gradeLevel,
      outcomes: config.specificOutcomes || [],
      strand: config.strand || "",
    },
  }
}

/**
 * Content Generator Node Runner
 * Generates instructional content (mock implementation)
 */
export const runContentGeneratorNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  // Mock content generation based on ELPA level
  const elpaLevel = context.currentLanguageLevel
  const contentType = config.contentType as string || "passage"
  
  const mockContent = generateMockContent(elpaLevel, contentType)
  
  return {
    output: {
      content: mockContent.content,
      vocabulary: mockContent.vocabulary,
      readabilityScore: mockContent.readabilityScore,
      adjustedLevel: elpaLevel,
    },
  }
}

/**
 * Vocabulary Builder Node Runner
 */
export const runVocabularyBuilderNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const sourceContent = input.content as string || ""
  
  // Mock vocabulary extraction
  const mockVocabulary = [
    { word: "farmer", definition: "A person who grows crops or raises animals", l1Translation: "农夫" },
    { word: "neighbor", definition: "A person who lives near you", l1Translation: "邻居" },
    { word: "subtract", definition: "Take away from a number", l1Translation: "减去" },
  ]
  
  return {
    output: {
      vocabulary: mockVocabulary.slice(0, (config.maxWords as number) || 5),
      sourceContent,
    },
  }
}

// ============================================================================
// Scaffolding Nodes
// ============================================================================

/**
 * Scaffolded Content Node Runner
 * Generates content adapted to student's level
 */
export const runScaffoldedContentNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const elpaLevel = context.currentLanguageLevel
  
  // Generate scaffolding based on ELPA level
  const scaffolding = generateScaffoldingForLevel(elpaLevel)
  
  return {
    output: {
      content: input.content || "",
      scaffolding,
      adjustedLevel: elpaLevel,
      supports: scaffolding.elements,
    },
  }
}

/**
 * L1 Bridge Node Runner
 * Provides first-language support
 */
export const runL1BridgeNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const nativeLanguage = context.studentProfile.nativeLanguage as string || "mandarin"
  
  // Mock translation - in production would use translation API
  const mockTranslations: Record<string, string> = {
    mandarin: "这是翻译后的内容",
    spanish: "Este es el contenido traducido",
    arabic: "هذا هو المحتوى المترجم",
    punjabi: "ਇਹ ਅਨੁਵਾਦਿਤ ਸਮੱਗਰੀ ਹੈ",
    ukrainian: "Це перекладений вміст",
  }
  
  return {
    output: {
      originalContent: input.content || "",
      translatedContent: mockTranslations[nativeLanguage] || "Translation not available",
      targetLanguage: nativeLanguage,
      bridgeType: config.bridgeType || "key-terms-only",
    },
  }
}

// ============================================================================
// AI Nodes
// ============================================================================

/**
 * AI Model Node Runner
 * Executes AI model inference (mock implementation)
 */
export const runAIModelNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  // Mock AI response - in production would use Vercel AI SDK
  const mockResponse = `Based on your input, here is a helpful response tailored to ELPA level ${context.currentLanguageLevel}. This content uses simpler vocabulary and shorter sentences appropriate for the student's proficiency.`
  
  return {
    output: {
      response: mockResponse,
      model: config.model || "gpt-4o-mini",
      tokensUsed: 150,
      temperature: config.temperature || 0.7,
    },
  }
}

/**
 * Prompt Template Node Runner
 */
export const runPromptTemplateNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  let template = config.template as string || ""
  
  // Simple variable interpolation
  const variables = {
    ...input,
    studentName: context.studentProfile.firstName,
    elpaLevel: context.currentLanguageLevel,
    gradeLevel: context.studentProfile.gradeLevel,
    nativeLanguage: context.studentProfile.nativeLanguage,
  }
  
  for (const [key, value] of Object.entries(variables)) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), String(value))
  }
  
  return {
    output: {
      prompt: template,
      variables: Object.keys(variables),
    },
  }
}

// ============================================================================
// Interaction Nodes
// ============================================================================

/**
 * Human Input Node Runner
 * Pauses for human input
 */
export const runHumanInputNode: NodeRunner = async (node, input, context) => {
  return {
    output: {
      prompt: (node.data.config as Record<string, unknown>).prompt || "Please provide your response:",
      inputType: (node.data.config as Record<string, unknown>).inputType || "text",
    },
    shouldPause: true,
  }
}

/**
 * Human-in-Loop Node Runner (alias)
 */
export const runHumanInLoopNode: NodeRunner = runHumanInputNode

/**
 * Comprehension Check Node Runner
 */
export const runComprehensionCheckNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  // Generate mock comprehension questions
  const mockQuestions = [
    { id: "q1", question: "What is the main idea of this passage?", type: "main-idea" },
    { id: "q2", question: "What happened first in the story?", type: "sequence" },
    { id: "q3", question: "What does the word 'subtract' mean?", type: "vocabulary" },
  ]
  
  return {
    output: {
      questions: mockQuestions.slice(0, (config.questionCount as number) || 3),
      passThreshold: (config.passThreshold as number) || 70,
      content: input.content,
    },
  }
}

// ============================================================================
// Flow Control Nodes
// ============================================================================

/**
 * Router Node Runner
 * Determines next path based on conditions
 */
export const runRouterNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const criteria = config.routingCriteria as string || "elpa-level"
  
  let selectedRoute = "default"
  let nextNodeId: string | undefined
  
  // Simple routing logic based on ELPA level
  if (criteria === "elpa-level") {
    const level = context.currentLanguageLevel
    if (level <= 2) {
      selectedRoute = "needs-support"
    } else if (level >= 4) {
      selectedRoute = "advanced"
    } else {
      selectedRoute = "on-track"
    }
  }
  
  return {
    output: {
      selectedRoute,
      routingReason: `Student routed based on ${criteria}`,
      inputScore: input.score,
    },
    nextNodeId,
  }
}

/**
 * Loop Node Runner
 * Handles iteration logic
 */
export const runLoopNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const iteration = (input._loopIteration as number) || 0
  const maxIterations = (config.maxIterations as number) || 5
  
  return {
    output: {
      iteration: iteration + 1,
      isComplete: iteration >= maxIterations - 1,
      items: input.items || [],
    },
  }
}

/**
 * Conditional Node Runner
 */
export const runConditionalNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const condition = config.condition as string || "true"
  
  // Simple condition evaluation (in production would use safe eval)
  let result = true
  if (condition.includes("elpaLevel")) {
    const threshold = parseInt(condition.match(/\d+/)?.[0] || "3")
    result = context.currentLanguageLevel >= threshold
  }
  
  return {
    output: {
      conditionMet: result,
      conditionEvaluated: condition,
    },
  }
}

/**
 * Parallel Node Runner
 */
export const runParallelNode: NodeRunner = async (node, input, context) => {
  return {
    output: {
      ...input,
      parallelStart: true,
    },
  }
}

// ============================================================================
// Output Nodes
// ============================================================================

/**
 * Progress Tracker Node Runner
 */
export const runProgressTrackerNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  return {
    output: {
      progress: {
        questionsAnswered: input.questionsAnswered || 0,
        correctAnswers: input.correctAnswers || 0,
        timeSpent: input.timeSpent || 0,
        vocabularyLearned: input.vocabularyLearned || [],
      },
      report: `Student progress tracked successfully`,
      persistData: config.persistData || true,
    },
  }
}

/**
 * Feedback Generator Node Runner
 */
export const runFeedbackGeneratorNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const score = input.score as number || 0
  
  let feedbackMessage = ""
  if (score >= 80) {
    feedbackMessage = "Excellent work! You're doing amazing! 🌟"
  } else if (score >= 60) {
    feedbackMessage = "Good job! Keep practicing and you'll get even better! 💪"
  } else {
    feedbackMessage = "Nice try! Let's review this together and try again. You can do it! 🎯"
  }
  
  return {
    output: {
      feedback: feedbackMessage,
      score,
      style: config.feedbackStyle || "encouraging",
    },
  }
}

/**
 * Celebration Node Runner
 */
export const runCelebrationNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  return {
    output: {
      celebration: {
        type: config.celebrationType || "confetti",
        message: "Congratulations! You've reached a milestone! 🎉",
        soundEnabled: config.soundEnabled || false,
        animationEnabled: config.animationEnabled || true,
      },
      trigger: true,
    },
  }
}

// ============================================================================
// Numeracy Nodes
// ============================================================================

/**
 * Word Problem Decoder Node Runner
 */
export const runWordProblemDecoderNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  // Mock word problem with scaffolding
  const problem = {
    text: "The farmer had 24 apples. He gave 8 to his neighbor. How many apples does the farmer have now?",
    operation: "subtraction",
    numbers: [24, 8],
    keywords: ["gave", "how many left"],
    visualHint: "Start with 24, take away 8",
  }
  
  return {
    output: {
      problem,
      scaffolding: context.currentLanguageLevel <= 2 ? "full" : "partial",
      vocabulary: problem.keywords,
    },
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateMockContent(elpaLevel: number, contentType: string): { content: string; vocabulary: string[]; readabilityScore: number } {
  const contentByLevel: Record<number, { content: string; vocabulary: string[] }> = {
    1: {
      content: "The cat sat. The cat is big. The cat is soft.",
      vocabulary: ["cat", "sat", "big", "soft"],
    },
    2: {
      content: "The cat sat on the mat. The cat likes to play. The cat is very soft.",
      vocabulary: ["cat", "mat", "play", "soft"],
    },
    3: {
      content: "The farmer had many apples in his basket. He wanted to share them with his neighbor. He gave some apples away.",
      vocabulary: ["farmer", "apples", "basket", "neighbor", "share"],
    },
    4: {
      content: "The industrious farmer harvested his apple crop early this morning. He decided to distribute some of his produce to nearby residents who might appreciate the fresh fruit.",
      vocabulary: ["industrious", "harvested", "distribute", "produce", "appreciate"],
    },
    5: {
      content: "Agricultural practices in rural communities often emphasize the importance of neighborly cooperation. Local farmers frequently exchange surplus produce, fostering a sense of community while reducing food waste.",
      vocabulary: ["agricultural", "cooperation", "surplus", "fostering", "reducing"],
    },
  }
  
  const levelContent = contentByLevel[elpaLevel] || contentByLevel[3]
  
  return {
    content: levelContent.content,
    vocabulary: levelContent.vocabulary,
    readabilityScore: elpaLevel * 2,
  }
}

function generateScaffoldingForLevel(elpaLevel: number): { elements: string[]; intensity: string } {
  const scaffolding: Record<number, { elements: string[]; intensity: string }> = {
    1: { elements: ["visual-supports", "l1-translation", "single-words", "realia"], intensity: "full" },
    2: { elements: ["sentence-frames", "word-banks", "graphic-organizers"], intensity: "high" },
    3: { elements: ["text-structures", "academic-vocabulary", "scaffolded-writing"], intensity: "moderate" },
    4: { elements: ["critical-thinking", "independent-strategies"], intensity: "light" },
    5: { elements: ["advanced-analysis", "synthesis", "peer-review"], intensity: "minimal" },
  }
  
  return scaffolding[elpaLevel] || scaffolding[3]
}

// ============================================================================
// Node Runner Registry
// ============================================================================

export const nodeRunners: Record<string, NodeRunner> = {
  // Learning Nodes
  "student-profile": runStudentProfileNode,
  "curriculum-selector": runCurriculumSelectorNode,
  "content-generator": runContentGeneratorNode,
  "vocabulary-builder": runVocabularyBuilderNode,
  
  // Scaffolding Nodes
  "scaffolded-content": runScaffoldedContentNode,
  "l1-bridge": runL1BridgeNode,
  
  // AI Nodes
  "ai-model": runAIModelNode,
  "prompt-template": runPromptTemplateNode,
  
  // Interaction Nodes
  "human-input": runHumanInputNode,
  "human-in-loop": runHumanInLoopNode,
  "comprehension-check": runComprehensionCheckNode,
  
  // Flow Control Nodes
  router: runRouterNode,
  "proficiency-router": runRouterNode,
  loop: runLoopNode,
  conditional: runConditionalNode,
  parallel: runParallelNode,
  
  // Output Nodes
  "progress-tracker": runProgressTrackerNode,
  "feedback-generator": runFeedbackGeneratorNode,
  "feedback": runFeedbackGeneratorNode,
  celebration: runCelebrationNode,
  
  // Numeracy Nodes
  "word-problem-decoder": runWordProblemDecoderNode,
}

export const getNodeRunner = (nodeType: string): NodeRunner | undefined => {
  return nodeRunners[nodeType]
}

export const hasNodeRunner = (nodeType: string): boolean => {
  return nodeType in nodeRunners
}
