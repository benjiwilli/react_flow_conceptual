/**
 * Node Runners Unit Tests
 * Tests for individual workflow node execution handlers
 */

import type { VerbaPathNode } from "@/lib/types/workflow"
import type { ExecutionContext } from "@/lib/types/execution"
import {
  runStudentProfileNode,
  runCurriculumSelectorNode,
  runVocabularyBuilderNode,
  runScaffoldedContentNode,
  runHumanInputNode,
  runLoopNode,
  runConditionalNode,
  runMergeNode,
  runProgressTrackerNode,
  runFeedbackGeneratorNode,
  runCelebrationNode,
  getNodeRunner,
} from "@/lib/engine/node-runners"

// Mock the AI client to avoid actual API calls
jest.mock("@/lib/engine/ai-client", () => ({
  generateTextCompletion: jest.fn().mockResolvedValue({
    text: "Mock AI response content",
    usage: { promptTokens: 100, completionTokens: 50 },
  }),
  streamTextCompletion: jest.fn().mockResolvedValue({
    textStream: (async function* () {
      yield "Mock "
      yield "streamed "
      yield "content"
    })(),
  }),
  generateStructuredOutput: jest.fn().mockResolvedValue({
    object: { key: "value" },
  }),
  generateImage: jest.fn().mockResolvedValue({
    url: "https://example.com/image.png",
  }),
}))

// Helper to create a mock execution context
function createMockContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    studentProfile: {
      id: "test-student",
      firstName: "Test",
      lastName: "Student",
      gradeLevel: "4",
      nativeLanguage: "mandarin",
      additionalLanguages: [],
      elpaLevel: 3,
      literacyLevel: 3,
      numeracyLevel: 3,
      learningStyles: ["visual"],
      interests: ["math", "science"],
      culturalBackground: "",
      accommodations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      schoolId: "test-school",
      teacherId: "test-teacher",
    },
    variables: {},
    conversationHistory: [],
    accumulatedContent: [],
    currentLanguageLevel: 3,
    adaptations: [],
    ...overrides,
  }
}

// Helper to create a mock node
function createMockNode(type: string, config: Record<string, unknown> = {}): VerbaPathNode {
  return {
    id: `test-${type}-node`,
    type,
    position: { x: 0, y: 0 },
    data: {
      label: `Test ${type} Node`,
      config,
    },
  }
}

describe("Node Runners", () => {
  describe("runStudentProfileNode", () => {
    it("should return student profile data from context", async () => {
      const node = createMockNode("student-profile")
      const context = createMockContext()
      const input = {}

      const result = await runStudentProfileNode(node, input, context)

      expect(result.output).toHaveProperty("studentProfile")
      expect(result.output).toHaveProperty("elpaLevel", 3)
      expect(result.output).toHaveProperty("nativeLanguage", "mandarin")
      expect(result.output).toHaveProperty("gradeLevel", "4")
      expect(result.output).toHaveProperty("interests")
    })

    it("should include student interests", async () => {
      const node = createMockNode("student-profile")
      const context = createMockContext()
      const input = {}

      const result = await runStudentProfileNode(node, input, context)

      expect(result.output.interests).toContain("math")
      expect(result.output.interests).toContain("science")
    })
  })

  describe("runCurriculumSelectorNode", () => {
    it("should return curriculum data from config", async () => {
      const node = createMockNode("curriculum-selector", {
        subjectArea: "mathematics",
        strand: "number-operations",
        specificOutcomes: ["N4.1", "N4.2"],
      })
      const context = createMockContext()
      const input = {}

      const result = await runCurriculumSelectorNode(node, input, context)

      expect(result.output).toHaveProperty("subjectArea", "mathematics")
      expect(result.output).toHaveProperty("strand", "number-operations")
      expect(result.output).toHaveProperty("outcomes")
      expect(result.output.outcomes).toContain("N4.1")
    })

    it("should use default subject area if not specified", async () => {
      const node = createMockNode("curriculum-selector")
      const context = createMockContext()
      const input = {}

      const result = await runCurriculumSelectorNode(node, input, context)

      expect(result.output).toHaveProperty("subjectArea", "ela")
    })

    it("should include grade level from context", async () => {
      const node = createMockNode("curriculum-selector")
      const context = createMockContext()
      const input = {}

      const result = await runCurriculumSelectorNode(node, input, context)

      expect(result.output).toHaveProperty("gradeLevel", "4")
    })
  })

  describe("runVocabularyBuilderNode", () => {
    it("should return vocabulary items", async () => {
      const node = createMockNode("vocabulary-builder", { maxWords: 3 })
      const context = createMockContext()
      const input = { content: "The farmer helped their neighbor." }

      const result = await runVocabularyBuilderNode(node, input, context)

      expect(result.output).toHaveProperty("vocabulary")
      expect(Array.isArray(result.output.vocabulary)).toBe(true)
      expect((result.output.vocabulary as unknown[]).length).toBeLessThanOrEqual(3)
    })

    it("should include word, definition, and L1 translation", async () => {
      const node = createMockNode("vocabulary-builder")
      const context = createMockContext()
      const input = { content: "Test content" }

      const result = await runVocabularyBuilderNode(node, input, context)

      const vocabulary = result.output.vocabulary as Array<{
        word: string
        definition: string
        l1Translation: string
      }>
      expect(vocabulary[0]).toHaveProperty("word")
      expect(vocabulary[0]).toHaveProperty("definition")
      expect(vocabulary[0]).toHaveProperty("l1Translation")
    })

    it("should pass through source content", async () => {
      const node = createMockNode("vocabulary-builder")
      const context = createMockContext()
      const input = { content: "Original content here" }

      const result = await runVocabularyBuilderNode(node, input, context)

      expect(result.output).toHaveProperty("sourceContent", "Original content here")
    })
  })

  describe("runScaffoldedContentNode", () => {
    it("should generate scaffolding based on ELPA level", async () => {
      const node = createMockNode("scaffolded-content")
      const context = createMockContext({ currentLanguageLevel: 2 })
      const input = { content: "Test content" }

      const result = await runScaffoldedContentNode(node, input, context)

      expect(result.output).toHaveProperty("scaffolding")
      expect(result.output).toHaveProperty("adjustedLevel", 2)
      expect(result.output).toHaveProperty("supports")
    })

    it("should pass through content", async () => {
      const node = createMockNode("scaffolded-content")
      const context = createMockContext()
      const input = { content: "Pass through this" }

      const result = await runScaffoldedContentNode(node, input, context)

      expect(result.output).toHaveProperty("content", "Pass through this")
    })
  })

  describe("runHumanInputNode", () => {
    it("should pause execution for human input", async () => {
      const node = createMockNode("human-input", {
        prompt: "Please enter your answer:",
        inputType: "text",
      })
      const context = createMockContext()
      const input = {}

      const result = await runHumanInputNode(node, input, context)

      expect(result.shouldPause).toBe(true)
      expect(result.output).toHaveProperty("prompt", "Please enter your answer:")
      expect(result.output).toHaveProperty("inputType", "text")
    })

    it("should use default prompt if not configured", async () => {
      const node = createMockNode("human-input")
      const context = createMockContext()
      const input = {}

      const result = await runHumanInputNode(node, input, context)

      expect(result.output).toHaveProperty("prompt")
      expect(typeof result.output.prompt).toBe("string")
    })
  })

  describe("runLoopNode", () => {
    it("should initialize loop state on first call", async () => {
      const node = createMockNode("loop", {
        maxIterations: 5,
      })
      const context = createMockContext()
      const input = {}

      const result = await runLoopNode(node, input, context)

      // First call with no _loopIteration starts at iteration 1 (0+1)
      expect(result.output).toHaveProperty("iteration", 1)
      expect(result.output).toHaveProperty("isComplete")
    })

    it("should increment iteration count", async () => {
      const node = createMockNode("loop", { maxIterations: 5 })
      const context = createMockContext()
      const input = { _loopIteration: 2 }

      const result = await runLoopNode(node, input, context)

      expect(result.output.iteration).toBe(3)
    })

    it("should mark complete when max iterations reached", async () => {
      const node = createMockNode("loop", { maxIterations: 3 })
      const context = createMockContext()
      const input = { _loopIteration: 2 }

      const result = await runLoopNode(node, input, context)

      expect(result.output.isComplete).toBe(true)
    })
  })

  describe("runConditionalNode", () => {
    it("should evaluate simple equality condition", async () => {
      const node = createMockNode("conditional", {
        condition: "score >= 70",
      })
      const context = createMockContext()
      const input = { score: 85 }

      const result = await runConditionalNode(node, input, context)

      expect(result.output).toHaveProperty("conditionMet")
    })

    it("should return condition evaluation details", async () => {
      const node = createMockNode("conditional", {
        condition: "true",
      })
      const context = createMockContext()
      const input = { score: 85, data: "test" }

      const result = await runConditionalNode(node, input, context)

      expect(result.output).toHaveProperty("conditionMet")
      expect(result.output).toHaveProperty("conditionEvaluated")
    })

    it("should evaluate elpaLevel conditions", async () => {
      const node = createMockNode("conditional", {
        condition: "elpaLevel >= 3",
      })
      const context = createMockContext({ currentLanguageLevel: 4 })
      const input = {}

      const result = await runConditionalNode(node, input, context)

      expect(result.output.conditionMet).toBe(true)
    })
  })

  describe("runMergeNode", () => {
    it("should merge multiple inputs into array", async () => {
      const node = createMockNode("merge")
      const context = createMockContext()
      const input = {
        input1: { value: "a" },
        input2: { value: "b" },
      }

      const result = await runMergeNode(node, input, context)

      expect(result.output).toHaveProperty("merged")
    })

    it("should handle single input", async () => {
      const node = createMockNode("merge")
      const context = createMockContext()
      const input = { singleInput: "test" }

      const result = await runMergeNode(node, input, context)

      expect(result.output).toHaveProperty("merged")
    })
  })

  describe("runProgressTrackerNode", () => {
    it("should track progress metrics", async () => {
      const node = createMockNode("progress-tracker")
      const context = createMockContext()
      const input = {
        questionsAnswered: 5,
        correctAnswers: 3,
        timeSpent: 120,
      }

      const result = await runProgressTrackerNode(node, input, context)

      expect(result.output).toHaveProperty("progress")
      expect(result.output).toHaveProperty("report")
    })

    it("should include progress data structure", async () => {
      const node = createMockNode("progress-tracker")
      const context = createMockContext()
      const input = {
        questionsAnswered: 7,
        correctAnswers: 5,
      }

      const result = await runProgressTrackerNode(node, input, context)

      const progress = result.output.progress as Record<string, unknown>
      expect(progress).toHaveProperty("questionsAnswered", 7)
      expect(progress).toHaveProperty("correctAnswers", 5)
    })
  })

  describe("runFeedbackGeneratorNode", () => {
    it("should generate feedback based on performance", async () => {
      const node = createMockNode("feedback-generator", {
        feedbackStyle: "encouraging",
      })
      const context = createMockContext()
      const input = { score: 85, passed: true }

      const result = await runFeedbackGeneratorNode(node, input, context)

      expect(result.output).toHaveProperty("feedback")
      expect(typeof result.output.feedback).toBe("string")
    })

    it("should provide different feedback for different scores", async () => {
      const node = createMockNode("feedback-generator")
      const context = createMockContext()

      const highScoreResult = await runFeedbackGeneratorNode(node, { score: 95 }, context)
      const lowScoreResult = await runFeedbackGeneratorNode(node, { score: 45 }, context)

      expect(highScoreResult.output.feedback).not.toBe(lowScoreResult.output.feedback)
    })
  })

  describe("runCelebrationNode", () => {
    it("should trigger celebration for achievements", async () => {
      const node = createMockNode("celebration", {
        celebrationType: "confetti",
        message: "Great job!",
      })
      const context = createMockContext()
      const input = { achieved: true, score: 100 }

      const result = await runCelebrationNode(node, input, context)

      expect(result.output).toHaveProperty("celebration")
      expect(result.output).toHaveProperty("trigger", true)
    })

    it("should include celebration config", async () => {
      const node = createMockNode("celebration", { celebrationType: "stars" })
      const context = createMockContext()
      const input = { achieved: true }

      const result = await runCelebrationNode(node, input, context)

      const celebration = result.output.celebration as Record<string, unknown>
      expect(celebration).toHaveProperty("type")
      expect(celebration).toHaveProperty("message")
    })
  })

  describe("getNodeRunner", () => {
    it("should return correct runner for student-profile", () => {
      const runner = getNodeRunner("student-profile")
      expect(runner).toBe(runStudentProfileNode)
    })

    it("should return correct runner for curriculum-selector", () => {
      const runner = getNodeRunner("curriculum-selector")
      expect(runner).toBe(runCurriculumSelectorNode)
    })

    it("should return correct runner for vocabulary-builder", () => {
      const runner = getNodeRunner("vocabulary-builder")
      expect(runner).toBe(runVocabularyBuilderNode)
    })

    it("should return correct runner for human-input", () => {
      const runner = getNodeRunner("human-input")
      expect(runner).toBe(runHumanInputNode)
    })

    it("should return correct runner for loop", () => {
      const runner = getNodeRunner("loop")
      expect(runner).toBe(runLoopNode)
    })

    it("should return correct runner for conditional", () => {
      const runner = getNodeRunner("conditional")
      expect(runner).toBe(runConditionalNode)
    })

    it("should return correct runner for merge", () => {
      const runner = getNodeRunner("merge")
      expect(runner).toBe(runMergeNode)
    })

    it("should return correct runner for progress-tracker", () => {
      const runner = getNodeRunner("progress-tracker")
      expect(runner).toBe(runProgressTrackerNode)
    })

    it("should return correct runner for feedback-generator", () => {
      const runner = getNodeRunner("feedback-generator")
      expect(runner).toBe(runFeedbackGeneratorNode)
    })

    it("should return correct runner for celebration", () => {
      const runner = getNodeRunner("celebration")
      expect(runner).toBe(runCelebrationNode)
    })

    it("should return undefined for unknown node type", () => {
      const runner = getNodeRunner("unknown-node-type")
      expect(runner).toBeUndefined()
    })
  })
})

describe("Node Runner Edge Cases", () => {
  describe("Empty inputs", () => {
    it("should handle empty input for vocabulary builder", async () => {
      const node = createMockNode("vocabulary-builder")
      const context = createMockContext()
      const input = {}

      const result = await runVocabularyBuilderNode(node, input, context)

      expect(result.output).toHaveProperty("vocabulary")
      expect(result.output).toHaveProperty("sourceContent", "")
    })

    it("should handle empty input for scaffolded content", async () => {
      const node = createMockNode("scaffolded-content")
      const context = createMockContext()
      const input = {}

      const result = await runScaffoldedContentNode(node, input, context)

      expect(result.output).toHaveProperty("scaffolding")
      expect(result.output).toHaveProperty("content", "")
    })
  })

  describe("Missing configuration", () => {
    it("should use defaults when config is missing", async () => {
      const node = createMockNode("loop", {})
      const context = createMockContext()
      const input = {}

      const result = await runLoopNode(node, input, context)

      // Default maxIterations is 5, first call gives iteration = 1
      expect(result.output).toHaveProperty("iteration", 1)
      expect(result.output).toHaveProperty("isComplete")
    })
  })

  describe("Different ELPA levels", () => {
    it("should adapt scaffolding for level 1", async () => {
      const node = createMockNode("scaffolded-content")
      const context = createMockContext({ currentLanguageLevel: 1 })
      const input = { content: "test" }

      const result = await runScaffoldedContentNode(node, input, context)

      expect(result.output.adjustedLevel).toBe(1)
    })

    it("should adapt scaffolding for level 5", async () => {
      const node = createMockNode("scaffolded-content")
      const context = createMockContext({ currentLanguageLevel: 5 })
      const input = { content: "test" }

      const result = await runScaffoldedContentNode(node, input, context)

      expect(result.output.adjustedLevel).toBe(5)
    })
  })
})
