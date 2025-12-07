/**
 * Preview Execution API
 * Handles node execution during workflow preview
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface ExecuteRequest {
  nodeId: string
  nodeType: string
  nodeData: Record<string, unknown>
  inputs: Record<string, unknown>
}

interface ExecuteResponse {
  output: unknown
  metadata?: {
    executionTime: number
    tokenUsage?: number
  }
}

// Simulate node execution based on type
async function executeNode(
  nodeType: string,
  nodeData: Record<string, unknown>,
  inputs: Record<string, unknown>
): Promise<{ output: unknown; executionTime: number }> {
  const startTime = Date.now()

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

  let output: unknown

  switch (nodeType) {
    // === VerbaPath ESL Node Types ===
    case "student-profile":
      output = {
        studentId: "preview-student",
        firstName: "Maria",
        lastName: "Garcia",
        gradeLevel: "4",
        elpaLevel: inputs.elpaLevel || 3,
        nativeLanguage: inputs.nativeLanguage || "spanish",
        interests: ["soccer", "animals"],
        learningStyles: ["visual"],
      }
      break

    case "curriculum-selector":
      output = {
        subjectArea: nodeData.subjectArea || "ela",
        strand: nodeData.strand || "reading",
        outcome: "Students will analyze character development in narrative texts",
        gradeLevel: "4",
        benchmarks: ["Identify main idea", "Make inferences", "Analyze vocabulary"],
      }
      break

    case "content-generator":
      output = {
        content: "The little fox ran quickly through the forest. She was looking for her family. The trees were tall and green. Birds sang in the branches above her head.",
        readabilityLevel: 3,
        wordCount: 32,
        vocabulary: ["quickly", "forest", "branches"],
      }
      break

    case "vocabulary-builder":
      output = {
        words: [
          { word: "quickly", definition: "moving fast", translation: "rápidamente", partOfSpeech: "adverb" },
          { word: "forest", definition: "a large area with many trees", translation: "bosque", partOfSpeech: "noun" },
          { word: "branches", definition: "parts of a tree", translation: "ramas", partOfSpeech: "noun" },
        ],
        sentenceExamples: [
          "The rabbit hopped quickly across the field.",
          "We went for a walk in the forest.",
        ],
      }
      break

    case "scaffolded-content":
    case "scaffolding":
      output = {
        originalContent: inputs.content || "Original content here",
        scaffoldedContent: "🌟 Let's learn together!\n\n📖 **Reading:** The little fox ran quickly through the forest.\n\n🔤 **Key Words:**\n- quickly = fast, rápidamente\n- forest = bosque\n\n❓ **Think about:** Where is the fox going?",
        scaffoldType: nodeData.scaffoldingType || "step-by-step",
        elpaLevel: 3,
      }
      break

    case "l1-bridge":
      output = {
        originalText: inputs.content || "The fox ran through the forest.",
        translatedText: "El zorro corrió por el bosque.",
        keyTerms: [
          { english: "fox", translation: "zorro" },
          { english: "forest", translation: "bosque" },
          { english: "ran", translation: "corrió" },
        ],
        bridgeType: nodeData.bridgeType || "key-terms-only",
      }
      break

    case "visual-support":
      output = {
        visualType: nodeData.visualType || "illustration",
        description: "An illustration showing a small orange fox running through a green forest",
        altText: "A fox running in a forest",
        url: "/visuals/placeholder-illustration.svg",
      }
      break

    case "ai-model":
      output = {
        response: `Based on your ELPA Level 3, here's a simplified explanation: The story is about a little fox who is trying to find her family in a big forest.`,
        model: nodeData.model || "gpt-4o-mini",
        tokensUsed: 45,
      }
      break

    case "prompt-template":
      output = {
        generatedPrompt: `Create a reading comprehension activity for a Grade 4 student at ELPA Level 3 about: ${inputs.topic || "forest animals"}`,
        variables: { gradeLevel: "4", elpaLevel: "3", topic: inputs.topic || "forest animals" },
      }
      break

    case "structured-output":
      output = {
        questions: [
          { id: "q1", question: "What animal is the story about?", type: "multiple-choice", options: ["fox", "rabbit", "bear", "bird"] },
          { id: "q2", question: "Where is the fox?", type: "short-answer" },
        ],
        format: "quiz",
      }
      break

    case "human-input":
      output = {
        prompt: nodeData.prompt || "What do you think happens next?",
        inputType: nodeData.inputType || "text",
        awaiting: true,
        response: inputs.userResponse || null,
      }
      break

    case "voice-input":
      output = {
        prompt: nodeData.prompt || "Say the sentence out loud",
        transcription: inputs.transcription || "The fox ran through the forest",
        confidence: 0.92,
      }
      break

    case "comprehension-check":
      output = {
        questions: [
          { question: "What is the main character?", options: [{ id: "a", text: "A fox" }, { id: "b", text: "A bird" }], correctAnswer: "a" },
          { question: "Where does the story take place?", options: [{ id: "a", text: "City" }, { id: "b", text: "Forest" }], correctAnswer: "b" },
        ],
        passThreshold: nodeData.passThreshold || 70,
      }
      break

    case "multiple-choice":
      output = {
        question: nodeData.question || "Which word means 'fast'?",
        options: nodeData.options || [
          { id: "a", text: "slowly" },
          { id: "b", text: "quickly" },
          { id: "c", text: "quietly" },
        ],
        correctAnswer: "b",
        selectedAnswer: inputs.answer,
        isCorrect: inputs.answer === "b",
      }
      break

    case "free-response":
      output = {
        prompt: nodeData.prompt || "Describe what happened in the story",
        response: inputs.response || "",
        wordCount: (inputs.response as string)?.split(" ").length || 0,
      }
      break

    case "oral-practice":
      output = {
        targetPhrase: nodeData.phrase || "The fox ran quickly",
        userRecording: inputs.recording || null,
        pronunciationScore: 85,
        feedback: "Good job! Try to emphasize the word 'quickly'.",
      }
      break

    case "proficiency-router":
      const score = inputs.score as number || 75
      output = {
        score,
        route: score >= 70 ? "mastered" : "needs-review",
        criteria: nodeData.routingCriteria || "score",
      }
      break

    case "loop":
      const currentIteration = (inputs.iteration as number) || 0
      const maxIterations = (nodeData.maxIterations as number) || 3
      output = {
        iteration: currentIteration + 1,
        maxIterations,
        continueLoop: currentIteration < maxIterations,
      }
      break

    case "merge":
      output = {
        mergedData: { ...inputs },
        sourceCount: Object.keys(inputs).length,
      }
      break

    case "conditional":
    case "condition":
      const conditionResult = Boolean(inputs.condition ?? (inputs.score && (inputs.score as number) >= 70))
      output = {
        result: conditionResult,
        branch: conditionResult ? "true" : "false",
      }
      break

    case "progress-tracker":
      output = {
        metrics: {
          comprehensionScore: inputs.comprehensionScore || 85,
          vocabularyGrowth: "+5 words",
          timeSpent: "8 minutes",
        },
        badges: ["Quick Learner", "Vocabulary Star"],
      }
      break

    case "feedback":
      output = {
        feedbackType: nodeData.feedbackStyle || "encouraging",
        message: inputs.isCorrect 
          ? "Great job! You understood the main ideas perfectly! 🌟" 
          : "Good try! Let's look at this together. The fox was looking for her family.",
        includeExplanation: nodeData.includeExplanation || true,
      }
      break

    case "celebration":
      output = {
        celebrationType: nodeData.celebrationType || "confetti",
        message: nodeData.message || "Congratulations! You completed the activity! 🎉",
        achievement: "Reading Champion",
      }
      break

    case "word-problem-decoder":
      output = {
        problem: "Maria has 15 apples. She gives 7 to her friend. How many apples does Maria have now?",
        steps: [
          { step: 1, description: "Identify: Maria starts with 15 apples" },
          { step: 2, description: "Action: She gives away 7 apples" },
          { step: 3, description: "Operation: Subtraction (15 - 7)" },
          { step: 4, description: "Answer: 8 apples" },
        ],
        answer: 8,
        vocabulary: ["gives", "how many", "apples"],
      }
      break

    // === Generic Node Types ===
    case "input":
    case "textInput":
    case "text-input":
      output = nodeData.defaultValue || inputs[String(nodeData.inputKey)] || ""
      break

    case "output":
    case "text-output":
      const outputFormat = nodeData.format as string || "text"
      const outputInput = Object.values(inputs)[0]
      switch (outputFormat) {
        case "json":
          output = { value: outputInput }
          break
        case "markdown":
          output = `**Result:** ${outputInput}`
          break
        default:
          output = outputInput
      }
      break

    default:
      // Unknown node type - pass through with basic info
      output = {
        nodeType,
        inputs: inputs,
        message: `Node type "${nodeType}" executed in preview mode`,
      }
  }

  const executionTime = Date.now() - startTime

  return { output, executionTime }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json()
    const { nodeId, nodeType, nodeData, inputs } = body

    if (!nodeId || !nodeType) {
      return NextResponse.json(
        { error: "Missing required fields: nodeId, nodeType" },
        { status: 400 }
      )
    }

    const { output, executionTime } = await executeNode(nodeType, nodeData || {}, inputs || {})

    const response: ExecuteResponse = {
      output,
      metadata: {
        executionTime,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error("Preview execution error", error)
    return NextResponse.json(
      { error: "Failed to execute node" },
      { status: 500 }
    )
  }
}
