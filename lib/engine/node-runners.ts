/**
 * Node Runners
 * Individual execution handlers for each node type
 * These runners process inputs and produce outputs for workflow execution
 */

import type { LinguaFlowNode } from "@/lib/types/workflow"
import type { ExecutionContext } from "@/lib/types/execution"
import type { AIModelNodeData, PromptTemplateNodeData, StructuredOutputNodeData } from "@/lib/types/nodes"
import { generateStructuredOutput, generateTextCompletion, streamTextCompletion, generateImage } from "./ai-client"
import { z } from "zod"

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
 * Generates instructional content using AI (with mock fallback)
 */
export const runContentGeneratorNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  const elpaLevel = context.currentLanguageLevel
  const contentType = config.contentType as string || "passage"
  const topic = (input.topic as string) || (config.topic as string) || "everyday activities"
  const gradeLevel = context.studentProfile.gradeLevel || "4"
  
  // Try to use real AI if available
  try {
    const systemPrompt = `You are an ESL content generator for Alberta K-12 students. 
Generate ${contentType} content that is:
- Appropriate for Grade ${gradeLevel} students
- Written at ELPA Level ${elpaLevel} (1=beginner, 5=advanced)
- Culturally inclusive and engaging
- Educational and aligned with learning objectives

For ELPA Level ${elpaLevel}:
${elpaLevel <= 2 ? "Use simple sentences, basic vocabulary, and clear structures." : ""}
${elpaLevel === 3 ? "Use moderately complex sentences with some academic vocabulary." : ""}
${elpaLevel >= 4 ? "Use more sophisticated language and academic structures." : ""}`

    const prompt = `Generate a ${contentType} about "${topic}" for an ESL student.
Keep it concise (50-100 words for lower levels, 100-200 words for higher levels).
Include 3-5 key vocabulary words at the end.`

    const result = await generateTextCompletion({
      prompt,
      system: systemPrompt,
      temperature: 0.7,
    })

    // Parse vocabulary from response if included
    const lines = result.text.split("\n")
    const vocabIndex = lines.findIndex(l => l.toLowerCase().includes("vocabulary") || l.toLowerCase().includes("key words"))
    
    let content = result.text
    let vocabulary: string[] = []
    
    if (vocabIndex !== -1) {
      content = lines.slice(0, vocabIndex).join("\n").trim()
      vocabulary = lines.slice(vocabIndex + 1)
        .filter(l => l.trim())
        .map(l => l.replace(/^[-•*\d.]+\s*/, "").trim())
        .slice(0, 5)
    }

    return {
      output: {
        content,
        vocabulary,
        readabilityScore: elpaLevel * 2,
        adjustedLevel: elpaLevel,
        generatedByAI: true,
      },
    }
  } catch {
    // Fall back to mock content if AI is not available
    const mockContent = generateMockContent(elpaLevel, contentType)
    
    return {
      output: {
        content: mockContent.content,
        vocabulary: mockContent.vocabulary,
        readabilityScore: mockContent.readabilityScore,
        adjustedLevel: elpaLevel,
        generatedByAI: false,
      },
    }
  }
}

/**
 * Vocabulary Builder Node Runner
 */
export const runVocabularyBuilderNode: NodeRunner = async (node, input, _context) => {
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
 * Provides first-language support using AI translation (with fallback)
 */
export const runL1BridgeNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const nativeLanguage = context.studentProfile.nativeLanguage as string || "mandarin"
  const bridgeType = (config.bridgeType as string) || "key-terms-only"
  const content = (input.content as string) || ""
  
  // Language name mapping for prompts
  const languageNames: Record<string, string> = {
    mandarin: "Mandarin Chinese",
    cantonese: "Cantonese Chinese",
    spanish: "Spanish",
    arabic: "Arabic",
    punjabi: "Punjabi",
    ukrainian: "Ukrainian",
    vietnamese: "Vietnamese",
    korean: "Korean",
    farsi: "Farsi/Persian",
    tagalog: "Tagalog",
    hindi: "Hindi",
    urdu: "Urdu",
    french: "French",
    somali: "Somali",
  }
  
  const targetLanguage = languageNames[nativeLanguage] || nativeLanguage
  
  try {
    let prompt = ""
    const systemPrompt = `You are a translation assistant for ESL students. Provide culturally appropriate translations that help bridge understanding.`
    
    if (bridgeType === "full") {
      prompt = `Translate the following text to ${targetLanguage}:\n\n"${content}"`
    } else if (bridgeType === "key-terms-only") {
      prompt = `Extract 3-5 key vocabulary terms from this text and provide translations to ${targetLanguage} with brief definitions:
      
"${content}"

Format: word - definition - translation`
    } else {
      prompt = `Provide a brief concept explanation in ${targetLanguage} for this English text:
      
"${content}"

Keep the explanation simple and culturally relevant.`
    }
    
    const result = await generateTextCompletion({
      prompt,
      system: systemPrompt,
      temperature: 0.3,
    })
    
    return {
      output: {
        originalContent: content,
        translatedContent: result.text,
        targetLanguage: nativeLanguage,
        bridgeType,
        generatedByAI: true,
      },
    }
  } catch {
    // Mock translation fallback
    const mockTranslations: Record<string, string> = {
      mandarin: "这是翻译后的内容",
      spanish: "Este es el contenido traducido",
      arabic: "هذا هو المحتوى المترجم",
      punjabi: "ਇਹ ਅਨੁਵਾਦਿਤ ਸਮੱਗਰੀ ਹੈ",
      ukrainian: "Це перекладений вміст",
      vietnamese: "Đây là nội dung đã dịch",
      korean: "번역된 내용입니다",
      farsi: "این محتوای ترجمه شده است",
    }
    
    return {
      output: {
        originalContent: content,
        translatedContent: mockTranslations[nativeLanguage] || "Translation not available",
        targetLanguage: nativeLanguage,
        bridgeType,
        generatedByAI: false,
      },
    }
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
  const config = (node.data.config || node.data) as Partial<AIModelNodeData>

  const prompt =
    (input.prompt as string) ||
    (input.content as string) ||
    (input.text as string) ||
    config.systemPrompt ||
    ""

  if (!prompt) {
    throw new Error("AI model node requires a prompt from upstream or configuration")
  }

  const modelId = resolveModelId(config.model, config.provider)

  const request = {
    prompt,
    system: config.systemPrompt,
    model: modelId,
    temperature: config.temperature,
    maxOutputTokens: config.maxTokens,
  }

  if (config.streamResponse) {
    const { textStream } = await streamTextCompletion(request)
    let fullText = ""

    for await (const token of textStream) {
      fullText += token
      context.emitStreamToken?.(token)
    }

    return {
      output: {
        response: fullText,
        model: modelId,
        temperature: config.temperature,
        streamed: true,
      },
      streamContent: fullText,
    }
  }

  const result = await generateTextCompletion(request)

  return {
    output: {
      response: result.text,
      model: modelId,
      temperature: config.temperature,
      usage: result.usage,
    },
  }
}

/**
 * Prompt Template Node Runner
 */
export const runPromptTemplateNode: NodeRunner = async (node, input, context) => {
  const config = (node.data.config || node.data) as Partial<PromptTemplateNodeData>
  let template = config.template || ""

  const variables = buildVariableMap(input, context)

  template = applyVariables(template, variables)

  if (config.conditionalSections?.length) {
    for (const section of config.conditionalSections) {
      const conditionHolds = evaluateCondition(section.condition, variables, context)
      if (conditionHolds) {
        template += `\n${applyVariables(section.content, variables)}`
      }
    }
  }

  return {
    output: {
      prompt: template,
      variables,
    },
  }
}

export const runStructuredOutputNode: NodeRunner = async (node, input, _context) => {
  const config = (node.data.config || node.data) as Partial<StructuredOutputNodeData>
  const rawSchema = config.schema
  const validateOutput = config.validateOutput !== false // default true
  const fallbackBehavior = config.fallbackBehavior || "error"
  const maxRetries = 2 // for retry fallback behavior
  const prompt =
    (input.prompt as string) ||
    (input.input as string) ||
    (input.response as string) ||
    ""

  if (!rawSchema) {
    return {
      output: {
        error: "Structured Output node is missing a schema",
        raw: prompt,
      },
    }
  }

  if (!prompt) {
    throw new Error("Structured Output node requires upstream text to parse")
  }

  // If validation is disabled, just return the raw prompt as-is (no AI call)
  if (!validateOutput) {
    return {
      output: {
        data: prompt,
        raw: prompt,
        validationPassed: false,
        validationSkipped: true,
      },
    }
  }

  let schema: z.ZodTypeAny

  try {
    const parsedSchema = typeof rawSchema === "string" ? JSON.parse(rawSchema) : rawSchema
    schema = buildZodSchema(parsedSchema)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown schema parse error"
    return {
      output: {
        error: "Invalid schema",
        raw: prompt,
        schemaError: message,
      },
    }
  }

  // Helper to attempt structured output generation
  const attemptGeneration = async (attempt: number) => {
    const retryHint = attempt > 1 
      ? `\n\n(Attempt ${attempt}: Please ensure the response strictly matches the required JSON schema.)` 
      : ""
    
    return generateStructuredOutput({
      prompt: prompt + retryHint,
      schema,
      model: (config as Record<string, unknown>).model as string | undefined,
    })
  }

  // Try generation with retry support
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= (fallbackBehavior === "retry" ? maxRetries : 1); attempt++) {
    try {
      const result = await attemptGeneration(attempt)

      return {
        output: {
          data: result.object,
          raw: prompt,
          validationPassed: true,
          attempts: attempt,
        },
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown structured output error")
      
      // If not retrying or this was the last attempt, handle fallback
      if (fallbackBehavior !== "retry" || attempt >= maxRetries) {
        break
      }
      // Otherwise continue to next retry attempt
    }
  }

  // Handle fallback behavior on failure
  const errorMessage = lastError?.message || "Unknown structured output error"

  switch (fallbackBehavior) {
    case "raw-text":
      // Return the raw prompt text instead of erroring
      return {
        output: {
          data: prompt,
          raw: prompt,
          validationPassed: false,
          fallbackUsed: "raw-text",
          originalError: errorMessage,
        },
      }

    case "retry":
      // All retries exhausted, return error with retry info
      return {
        output: {
          data: null,
          raw: prompt,
          validationPassed: false,
          error: errorMessage,
          retriesExhausted: true,
          maxRetries,
        },
      }

    case "error":
    default:
      // Default: return error
      return {
        output: {
          data: null,
          raw: prompt,
          validationPassed: false,
          error: errorMessage,
        },
      }
  }
}

// ============================================================================
// Interaction Nodes
// ============================================================================

/**
 * Human Input Node Runner
 * Pauses for human input
 */
export const runHumanInputNode: NodeRunner = async (node, _input, _context) => {
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
 * Generates comprehension questions using AI (with fallback)
 * When responses are provided, evaluates and saves assessment results
 */
export const runComprehensionCheckNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const questionCount = (config.questionCount as number) || 3
  const content = (input.content as string) || ""
  const elpaLevel = context.currentLanguageLevel
  const passThreshold = (config.passThreshold as number) || 70

  // Check if this is an evaluation call (responses provided)
  const responses = input.responses as Array<{ questionId: string; answer: string }> | undefined
  const questions = input.questions as Array<{ id: string; question: string; type: string; answer?: string }> | undefined

  if (responses && questions) {
    // Evaluate responses and save assessment
    const evaluationResult = await evaluateComprehensionResponses(
      questions,
      responses,
      node.id,
      context
    )

    return {
      output: {
        ...evaluationResult,
        passThreshold,
        passed: evaluationResult.score >= passThreshold,
        content,
      },
    }
  }
  
  // Generate questions mode
  try {
    const systemPrompt = `You are an ESL assessment creator. Generate reading comprehension questions appropriate for ELPA Level ${elpaLevel} students.
    
For Level ${elpaLevel}:
${elpaLevel <= 2 ? "Create simple, literal questions with clear answer options." : ""}
${elpaLevel === 3 ? "Include both literal and simple inferential questions." : ""}
${elpaLevel >= 4 ? "Include inferential and analytical questions." : ""}`

    const prompt = `Create ${questionCount} comprehension questions for this text:

"${content}"

Format each question as:
Q1: [question]
Type: [literal/inferential/vocabulary]
Answer: [correct answer]`

    const result = await generateTextCompletion({
      prompt,
      system: systemPrompt,
      temperature: 0.5,
    })
    
    // Parse questions from response
    const lines = result.text.split("\n")
    const parsedQuestions: Array<{ id: string; question: string; type: string; answer?: string }> = []
    let currentQuestion: { id: string; question: string; type: string; answer?: string } | null = null
    
    for (const line of lines) {
      const qMatch = line.match(/^Q(\d+):\s*(.+)/)
      if (qMatch) {
        if (currentQuestion) parsedQuestions.push(currentQuestion)
        currentQuestion = { id: `q${qMatch[1]}`, question: qMatch[2].trim(), type: "literal" }
      } else if (currentQuestion) {
        const typeMatch = line.match(/^Type:\s*(.+)/i)
        const answerMatch = line.match(/^Answer:\s*(.+)/i)
        if (typeMatch) currentQuestion.type = typeMatch[1].trim().toLowerCase()
        if (answerMatch) currentQuestion.answer = answerMatch[1].trim()
      }
    }
    if (currentQuestion) parsedQuestions.push(currentQuestion)
    
    return {
      output: {
        questions: parsedQuestions.length > 0 ? parsedQuestions : generateMockQuestions(questionCount),
        passThreshold,
        content,
        generatedByAI: parsedQuestions.length > 0,
      },
      shouldPause: true, // Pause for student responses
    }
  } catch {
    // Fallback to mock questions
    return {
      output: {
        questions: generateMockQuestions(questionCount),
        passThreshold,
        content,
        generatedByAI: false,
      },
      shouldPause: true,
    }
  }
}

/**
 * Evaluate comprehension responses and save assessment results
 */
async function evaluateComprehensionResponses(
  questions: Array<{ id: string; question: string; type: string; answer?: string }>,
  responses: Array<{ questionId: string; answer: string }>,
  nodeId: string,
  context: ExecutionContext
): Promise<{
  score: number
  questionResults: Array<{ questionId: string; isCorrect: boolean; feedback: string }>
  feedback: string
  assessmentSaved: boolean
}> {
  const questionResults: Array<{ questionId: string; isCorrect: boolean; feedback: string }> = []
  let correctCount = 0

  for (const question of questions) {
    const response = responses.find((r) => r.questionId === question.id)
    const studentAnswer = response?.answer || ""
    const correctAnswer = question.answer || ""

    const normalizedStudent = studentAnswer.trim().toLowerCase()
    const normalizedCorrect = correctAnswer.trim().toLowerCase()
    const hasComparableAnswers = normalizedStudent.length > 0 && normalizedCorrect.length > 0

    // Simple matching that allows partial overlaps but avoids empty answers scoring as correct
    const isCorrect = hasComparableAnswers && (
      normalizedStudent === normalizedCorrect ||
      normalizedCorrect.includes(normalizedStudent) ||
      normalizedStudent.includes(normalizedCorrect)
    )

    if (isCorrect) correctCount++

    questionResults.push({
      questionId: question.id,
      isCorrect,
      feedback: isCorrect 
        ? "Correct! Great job!" 
        : `The answer was: ${correctAnswer}`,
    })
  }

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const feedback = generateComprehensionFeedback(score, context.currentLanguageLevel)

  // Save assessment result via API
  let assessmentSaved = false
  try {
    // Extract IDs from context (may be in studentProfile or variables)
    const studentId = (context.studentProfile?.id as string) || 
                      (context.variables?.studentId as string) || 
                      "unknown"
    const sessionId = (context.variables?.sessionId as string) || undefined
    const workflowId = (context.variables?.workflowId as string) || undefined

    const assessmentPayload = {
      studentId,
      sessionId,
      workflowId,
      assessmentType: "comprehension-check",
      score,
      maxScore: 100,
      nodeId,
      questionResults: questionResults.map((qr) => ({
        questionId: qr.questionId,
        studentAnswer: responses.find((r) => r.questionId === qr.questionId)?.answer || "",
        isCorrect: qr.isCorrect,
        pointsEarned: qr.isCorrect ? 1 : 0,
        hintsUsed: 0,
        scaffoldingUsed: [],
      })),
      feedback,
    }

    // Use internal API endpoint to save assessment
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/assessments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentPayload),
      }
    )

    if (response.ok) {
      assessmentSaved = true
    }
  } catch (error) {
    console.error("Failed to save comprehension assessment:", error)
  }

  return {
    score,
    questionResults,
    feedback,
    assessmentSaved,
  }
}

/**
 * Generate feedback message based on score and ELPA level
 */
function generateComprehensionFeedback(score: number, elpaLevel: number): string {
  if (score >= 90) {
    return "Excellent work! You understood the text very well! 🌟"
  } else if (score >= 70) {
    return "Good job! You understood most of the text. Keep practicing! 👍"
  } else if (score >= 50) {
    return elpaLevel <= 2
      ? "Nice try! Let's look at the text together to understand it better."
      : "You got some answers right! Review the text and try again."
  } else {
    return elpaLevel <= 2
      ? "It's okay! Reading takes practice. Let's try with some help."
      : "Don't worry! Let's go through the text again together."
  }
}

function generateMockQuestions(count: number) {
  const mockQuestions = [
    { id: "q1", question: "What is the main idea of this passage?", type: "main-idea" },
    { id: "q2", question: "What happened first in the story?", type: "sequence" },
    { id: "q3", question: "What does the word 'subtract' mean?", type: "vocabulary" },
    { id: "q4", question: "Why do you think this happened?", type: "inference" },
    { id: "q5", question: "How did the character feel?", type: "inference" },
  ]
  return mockQuestions.slice(0, count)
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
export const runLoopNode: NodeRunner = async (node, input, _context) => {
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
export const runParallelNode: NodeRunner = async (node, input, _context) => {
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
export const runProgressTrackerNode: NodeRunner = async (node, input, _context) => {
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
export const runFeedbackGeneratorNode: NodeRunner = async (node, input, _context) => {
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
export const runCelebrationNode: NodeRunner = async (node, _input, _context) => {
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

/**
 * Math Problem Generator Node Runner
 * Generates math problems with language scaffolding
 */
export const runMathProblemGeneratorNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const scaffoldLevel = (config.scaffoldLevel as string) || "vocabulary-only"
  
  // Generate problem based on type
  const problems: Record<string, { text: string; answer: number; operation: string; visual?: string }> = {
    addition: {
      text: "Maria has 15 stickers. Her friend gives her 8 more stickers. How many stickers does Maria have now?",
      answer: 23,
      operation: "addition",
      visual: "🌟 15 + 🌟 8 = ?",
    },
    subtraction: {
      text: "There are 20 birds on a tree. 7 birds fly away. How many birds are left on the tree?",
      answer: 13,
      operation: "subtraction",
      visual: "🐦 20 - 🐦 7 = ?",
    },
    multiplication: {
      text: "A farmer has 4 rows of apple trees. Each row has 6 trees. How many apple trees does the farmer have in total?",
      answer: 24,
      operation: "multiplication",
      visual: "🌳🌳🌳🌳🌳🌳 × 4 = ?",
    },
    division: {
      text: "Ahmed has 24 candies. He wants to share them equally among 4 friends. How many candies will each friend get?",
      answer: 6,
      operation: "division",
      visual: "🍬 24 ÷ 4 = ?",
    },
  }
  
  const operation = (config.operation as string) || "addition"
  const problem = problems[operation] || problems.addition
  
  // Add vocabulary support based on ELPA level
  const vocabulary = context.currentLanguageLevel <= 2 
    ? [
        { word: "more", translation: "más (Spanish) / 更多 (Mandarin)" },
        { word: "total", translation: "total (Spanish) / 总数 (Mandarin)" },
      ]
    : []
  
  return {
    output: {
      problem: {
        ...problem,
        scaffoldLevel,
        vocabulary,
      },
      answer: problem.answer,
      operation: problem.operation,
      visual: problem.visual,
    },
  }
}

// ============================================================================
// Additional Scaffolding Nodes
// ============================================================================

/**
 * Visual Support Node Runner
 * Generates or provides visual aids for content using AI image generation
 */
export const runVisualSupportNode: NodeRunner = async (node, input, _context) => {
  const config = node.data.config as Record<string, unknown>
  const visualType = (config.visualType as string) || "illustration"
  const generateAltText = config.generateAltText !== false
  const useAIGeneration = config.useAIGeneration === true
  
  // Extract content description for image generation
  const contentDescription = (input.content as string) || 
    (input.topic as string) || 
    (config.description as string) || 
    "educational visual support"

  // Try AI generation if enabled
  if (useAIGeneration) {
    try {
      const result = await generateImage({
        prompt: contentDescription,
        style: visualType as "illustration" | "diagram" | "photo" | "graphic-organizer",
      })

      return {
        output: {
          visual: {
            url: result.url,
            altText: generateAltText ? result.altText : undefined,
            type: visualType,
            generatedByAI: result.generatedByAI,
          },
          originalContent: input.content,
          visualType,
          altText: generateAltText ? result.altText : undefined,
        },
      }
    } catch (error) {
      console.error("Visual support AI generation failed, using fallback:", error)
      // Fall through to mock visuals
    }
  }

  // Fallback to mock visual generation
  const visualsByType: Record<string, { url: string; altText: string; type: string }> = {
    illustration: {
      url: "/visuals/placeholder-illustration.svg",
      altText: `An illustration representing: ${contentDescription}`,
      type: "illustration",
    },
    diagram: {
      url: "/visuals/placeholder-diagram.svg",
      altText: `A diagram explaining: ${contentDescription}`,
      type: "diagram",
    },
    "graphic-organizer": {
      url: "/visuals/placeholder-graphic-organizer.svg",
      altText: `A graphic organizer for: ${contentDescription}`,
      type: "graphic-organizer",
    },
    photo: {
      url: "/visuals/placeholder-photo.svg",
      altText: `A photograph related to: ${contentDescription}`,
      type: "photo",
    },
  }
  
  const visual = visualsByType[visualType] || visualsByType.illustration
  
  return {
    output: {
      visual: {
        ...visual,
        generatedByAI: false,
      },
      originalContent: input.content,
      visualType,
      altText: generateAltText ? visual.altText : undefined,
    },
  }
}

/**
 * General Scaffolding Node Runner (different from scaffolded-content)
 */
export const runScaffoldingNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const scaffoldingType = (config.scaffoldingType as string) || "add-supports"
  
  const elpaLevel = context.currentLanguageLevel
  const scaffolding = generateScaffoldingForLevel(elpaLevel)
  
  // Generate appropriate scaffolds based on type
  const scaffolds: Record<string, string[]> = {
    "simplify": ["Simplified vocabulary", "Shorter sentences", "Basic grammar structures"],
    "add-supports": scaffolding.elements,
    "enrich": ["Extended vocabulary", "Complex sentence patterns", "Academic language"],
  }
  
  return {
    output: {
      content: input.content,
      scaffoldingType,
      scaffolds: scaffolds[scaffoldingType] || scaffolds["add-supports"],
      intensity: scaffolding.intensity,
      adjustedForLevel: elpaLevel,
    },
  }
}

// ============================================================================
// Additional Interaction Nodes
// ============================================================================

/**
 * Voice Input Node Runner
 * Handles voice/speech input from students
 */
export const runVoiceInputNode: NodeRunner = async (node, _input, _context) => {
  const config = node.data.config as Record<string, unknown>
  
  return {
    output: {
      prompt: config.prompt || "Please speak your answer:",
      expectedLanguage: config.expectedLanguage || "english",
      providePronunciationFeedback: config.providePronunciationFeedback !== false,
      modelAudioEnabled: config.modelAudioEnabled || false,
    },
    shouldPause: true, // Pause for voice input
  }
}

/**
 * Multiple Choice Node Runner
 * Presents multiple choice questions
 */
export const runMultipleChoiceNode: NodeRunner = async (node, input, _context) => {
  const config = node.data.config as Record<string, unknown>
  
  // Use provided options or generate mock ones
  const options = (config.options as Array<{ id: string; text: string }>) || [
    { id: "a", text: "Option A" },
    { id: "b", text: "Option B" },
    { id: "c", text: "Option C" },
    { id: "d", text: "Option D" },
  ]
  
  return {
    output: {
      question: (config.question as string) || input.question || "Select the correct answer:",
      options,
      correctAnswer: config.correctAnswer,
      shuffleOptions: config.shuffleOptions !== false,
      showFeedback: config.showFeedback !== false,
    },
    shouldPause: true, // Pause for student selection
  }
}

/**
 * Free Response Node Runner
 * Handles open-ended text responses
 */
export const runFreeResponseNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  
  return {
    output: {
      prompt: (config.prompt as string) || input.prompt || "Write your response:",
      minLength: (config.minLength as number) || 10,
      maxLength: (config.maxLength as number) || 500,
      showWordCount: config.showWordCount !== false,
      provideSentenceStarters: context.currentLanguageLevel <= 2,
      sentenceStarters: context.currentLanguageLevel <= 2 
        ? ["I think...", "The answer is...", "This shows that..."]
        : undefined,
    },
    shouldPause: true, // Pause for student response
  }
}

/**
 * Oral Practice Node Runner
 * Facilitates speaking practice activities
 */
export const runOralPracticeNode: NodeRunner = async (node, input, _context) => {
  const config = node.data.config as Record<string, unknown>
  
  return {
    output: {
      prompt: (config.prompt as string) || "Practice saying this sentence:",
      targetSentence: (config.targetSentence as string) || input.content,
      modelAudioUrl: config.modelAudioUrl,
      feedbackType: (config.feedbackType as string) || "end",
      recordingTimeLimit: (config.recordingTimeLimit as number) || 60,
      allowRetry: config.allowRetry !== false,
      maxAttempts: (config.maxAttempts as number) || 3,
    },
    shouldPause: true, // Pause for oral practice
  }
}

// ============================================================================
// Additional Flow Control Nodes
// ============================================================================

/**
 * Merge Node Runner
 * Combines outputs from multiple branches
 */
export const runMergeNode: NodeRunner = async (node, input, _context) => {
  const config = node.data.config as Record<string, unknown>
  const mergeStrategy = (config.mergeStrategy as string) || "concatenate"
  
  // Input will contain all outputs from upstream nodes
  let mergedOutput: unknown
  
  switch (mergeStrategy) {
    case "concatenate":
      // Concatenate all array values
      if (Array.isArray(input.items)) {
        mergedOutput = input.items
      } else {
        mergedOutput = Object.values(input).flat()
      }
      break
    case "select-best":
      // Select the output with highest score (if available)
      if (input.scores && Array.isArray(input.scores)) {
        const maxScore = Math.max(...input.scores)
        const bestIndex = input.scores.indexOf(maxScore)
        mergedOutput = (input.items as unknown[])?.[bestIndex] || input
      } else {
        mergedOutput = input
      }
      break
    case "aggregate":
      // Aggregate into a single object
      mergedOutput = { ...input }
      break
    default:
      mergedOutput = input
  }
  
  return {
    output: {
      merged: mergedOutput,
      mergeStrategy,
      inputCount: Object.keys(input).length,
    },
  }
}

/**
 * Variable Node Runner
 * Stores and retrieves variables in the execution context
 */
export const runVariableNode: NodeRunner = async (node, input, context) => {
  const config = node.data.config as Record<string, unknown>
  const variableName = (config.variableName as string) || "variable"
  const operation = (config.operation as string) || "set"
  
  if (operation === "set") {
    context.variables[variableName] = input.value || input
  }
  
  return {
    output: {
      variableName,
      value: context.variables[variableName],
      operation,
    },
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

const resolveModelId = (model?: string, provider?: string) => {
  if (!model) return undefined
  if (provider && !model.includes("/")) {
    return `${provider}/${model}`
  }
  return model
}

const buildVariableMap = (input: Record<string, unknown>, context: ExecutionContext) => ({
  ...input,
  studentName: context.studentProfile.firstName,
  elpaLevel: context.currentLanguageLevel,
  gradeLevel: context.studentProfile.gradeLevel,
  nativeLanguage: context.studentProfile.nativeLanguage,
})

const applyVariables = (template: string, variables: Record<string, unknown>) => {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key) => {
    const value = variables[key]
    return value !== undefined ? String(value) : ""
  })
}

const evaluateCondition = (
  condition: string,
  variables: Record<string, unknown>,
  context: ExecutionContext,
) => {
  const normalized = condition?.trim() || ""
  if (!normalized) return false

  const gteMatch = normalized.match(/elpaLevel\s*>=\s*(\d+)/i)
  if (gteMatch) {
    return context.currentLanguageLevel >= Number(gteMatch[1])
  }

  const lteMatch = normalized.match(/elpaLevel\s*<=\s*(\d+)/i)
  if (lteMatch) {
    return context.currentLanguageLevel <= Number(lteMatch[1])
  }

  if (normalized in variables) {
    return Boolean(variables[normalized])
  }

  return false
}

const buildZodSchema = (definition: unknown): z.ZodTypeAny => {
  if (!definition || typeof definition !== "object") {
    return z.any()
  }

  const schema = definition as {
    type?: string
    properties?: Record<string, unknown>
    items?: unknown
    enum?: unknown[]
    required?: string[]
  }

  switch (schema.type) {
    case "object": {
      const required = new Set(schema.required || [])
      const shape: Record<string, z.ZodTypeAny> = {}

      for (const [key, value] of Object.entries(schema.properties || {})) {
        const propertySchema = buildZodSchema(value)
        shape[key] = required.has(key) ? propertySchema : propertySchema.optional()
      }

      return z.object(shape)
    }
    case "array": {
      return z.array(buildZodSchema(schema.items))
    }
    case "string": {
      if (Array.isArray(schema.enum) && schema.enum.length > 0) {
        const [first, ...rest] = schema.enum as [string, ...string[]]
        return z.enum([first, ...rest])
      }
      return z.string()
    }
    case "number":
    case "integer": {
      return z.number()
    }
    case "boolean": {
      return z.boolean()
    }
    default: {
      if (Array.isArray(definition)) {
        return z.array(buildZodSchema(definition[0]))
      }
      return z.any()
    }
  }
}

function generateMockContent(elpaLevel: number, _contentType: string): { content: string; vocabulary: string[]; readabilityScore: number } {
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
  scaffolding: runScaffoldingNode,
  "visual-support": runVisualSupportNode,
  
  // AI Nodes
  "ai-model": runAIModelNode,
  "prompt-template": runPromptTemplateNode,
  "structured-output": runStructuredOutputNode,
  
  // Interaction Nodes
  "human-input": runHumanInputNode,
  "human-in-loop": runHumanInLoopNode,
  "comprehension-check": runComprehensionCheckNode,
  "voice-input": runVoiceInputNode,
  "multiple-choice": runMultipleChoiceNode,
  "free-response": runFreeResponseNode,
  "oral-practice": runOralPracticeNode,
  
  // Flow Control Nodes
  router: runRouterNode,
  "proficiency-router": runRouterNode,
  loop: runLoopNode,
  conditional: runConditionalNode,
  parallel: runParallelNode,
  merge: runMergeNode,
  variable: runVariableNode,
  
  // Output Nodes
  "progress-tracker": runProgressTrackerNode,
  "feedback-generator": runFeedbackGeneratorNode,
  "feedback": runFeedbackGeneratorNode,
  celebration: runCelebrationNode,
  
  // Numeracy Nodes
  "word-problem-decoder": runWordProblemDecoderNode,
  "math-problem-generator": runMathProblemGeneratorNode,
}

export const getNodeRunner = (nodeType: string): NodeRunner | undefined => {
  return nodeRunners[nodeType]
}

export const hasNodeRunner = (nodeType: string): boolean => {
  return nodeType in nodeRunners
}
