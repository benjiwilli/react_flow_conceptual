/**
 * Workflow Executor Unit Tests
 * Tests for the core workflow execution engine
 */

import { WorkflowExecutor } from "@/lib/engine/executor"
import type { VerbaPathWorkflow, VerbaPathNode } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"
import type { WorkflowExecution } from "@/lib/types/execution"

// Mock the node runners
jest.mock("@/lib/engine/node-runners", () => ({
  getNodeRunner: jest.fn((nodeType: string) => {
    // Return mock runners for different node types
    const runners: Record<string, unknown> = {
      "student-profile": async (_node: VerbaPathNode, _input: Record<string, unknown>, context: { studentProfile: StudentProfile }) => ({
        output: { studentProfile: context.studentProfile, elpaLevel: 3 },
      }),
      "content-generator": async () => ({
        output: { content: "Generated content", vocabulary: ["word1", "word2"] },
      }),
      "human-input": async () => ({
        output: { prompt: "Enter your answer:", inputType: "text" },
        shouldPause: true,
      }),
      "progress-tracker": async () => ({
        output: { progress: { questionsAnswered: 5 }, report: "Progress tracked" },
      }),
      loop: async () => ({
        output: { iteration: 1, isComplete: false },
      }),
      conditional: async () => ({
        output: { conditionMet: true },
      }),
      celebration: async () => ({
        output: { celebration: { type: "confetti" }, trigger: true },
      }),
    }
    return runners[nodeType]
  }),
  hasNodeRunner: jest.fn(() => true),
}))

// Mock AI client
jest.mock("@/lib/engine/ai-client", () => ({
  generateTextCompletion: jest.fn().mockResolvedValue({ text: "AI response" }),
  streamTextCompletion: jest.fn().mockResolvedValue({
    textStream: (async function* () {
      yield "streamed"
    })(),
  }),
}))

// Helper to create a mock student
function createMockStudent(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: "test-student-1",
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
    ...overrides,
  }
}

// Helper to create a mock workflow
function createMockWorkflow(
  nodes: Partial<VerbaPathNode>[],
  edges: Array<{ source: string; target: string }> = []
): VerbaPathWorkflow {
  const fullNodes: VerbaPathNode[] = nodes.map((n, i) => ({
    id: n.id || `node-${i}`,
    type: n.type || "student-profile",
    position: n.position || { x: i * 100, y: 0 },
    data: n.data || { label: `Node ${i}`, config: {} },
  }))

  const fullEdges = edges.map((e, i) => ({
    id: `edge-${i}`,
    source: e.source,
    target: e.target,
  }))

  return {
    id: "test-workflow",
    name: "Test Workflow",
    description: "A test workflow",
    version: "1.0.0",
    nodes: fullNodes,
    edges: fullEdges,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
    templateType: "custom",
    targetGrade: "4",
    subjectArea: "ela",
    metadata: {},
  }
}

describe("WorkflowExecutor", () => {
  describe("Constructor", () => {
    it("should create executor with default config", () => {
      const executor = new WorkflowExecutor()
      expect(executor).toBeDefined()
    })

    it("should accept custom configuration", () => {
      const executor = new WorkflowExecutor({
        maxConcurrentNodes: 5,
        defaultTimeout: 60000,
        enableStreaming: false,
        debugMode: true,
      })
      expect(executor).toBeDefined()
    })

    it("should accept callbacks", () => {
      const callbacks = {
        onNodeStart: jest.fn(),
        onNodeComplete: jest.fn(),
        onNodeError: jest.fn(),
        onExecutionComplete: jest.fn(),
      }
      const executor = new WorkflowExecutor({}, callbacks)
      expect(executor).toBeDefined()
    })
  })

  describe("execute", () => {
    it("should execute a simple single-node workflow", async () => {
      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
      ])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result).toBeDefined()
      expect(result.id).toBeTruthy()
      expect(result.workflowId).toBe("test-workflow")
      expect(result.studentId).toBe("test-student-1")
    })

    it("should return completed status for successful execution", async () => {
      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
      ])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result.status).toBe("completed")
      expect(result.completedAt).toBeDefined()
    })

    it("should include execution context", async () => {
      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
      ])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result.context).toBeDefined()
      expect(result.context.studentProfile).toBeDefined()
      expect(result.context.currentLanguageLevel).toBe(3)
    })

    it("should call onNodeStart callback", async () => {
      const onNodeStart = jest.fn()
      const executor = new WorkflowExecutor({}, { onNodeStart })
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
      ])
      const student = createMockStudent()

      await executor.execute(workflow, student)

      expect(onNodeStart).toHaveBeenCalled()
    })

    it("should call onNodeComplete callback", async () => {
      const onNodeComplete = jest.fn()
      const executor = new WorkflowExecutor({}, { onNodeComplete })
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
      ])
      const student = createMockStudent()

      await executor.execute(workflow, student)

      expect(onNodeComplete).toHaveBeenCalled()
    })

    it("should call onExecutionComplete callback", async () => {
      const onExecutionComplete = jest.fn()
      const executor = new WorkflowExecutor({}, { onExecutionComplete })
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
      ])
      const student = createMockStudent()

      await executor.execute(workflow, student)

      expect(onExecutionComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
        })
      )
    })
  })

  describe("Workflow with multiple nodes", () => {
    it("should execute nodes in correct order based on edges", async () => {
      const nodeOrder: string[] = []
      const executor = new WorkflowExecutor(
        {},
        {
          onNodeStart: (nodeId) => nodeOrder.push(nodeId),
        }
      )

      const workflow = createMockWorkflow(
        [
          { id: "start", type: "student-profile" },
          { id: "middle", type: "content-generator" },
          { id: "end", type: "progress-tracker" },
        ],
        [
          { source: "start", target: "middle" },
          { source: "middle", target: "end" },
        ]
      )
      const student = createMockStudent()

      await executor.execute(workflow, student)

      // Start should be first
      expect(nodeOrder.indexOf("start")).toBeLessThan(nodeOrder.indexOf("middle"))
      expect(nodeOrder.indexOf("middle")).toBeLessThan(nodeOrder.indexOf("end"))
    })

    it("should track node executions", async () => {
      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow(
        [
          { id: "node-1", type: "student-profile" },
          { id: "node-2", type: "content-generator" },
        ],
        [{ source: "node-1", target: "node-2" }]
      )
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result.nodeExecutions).toBeDefined()
      expect(result.nodeExecutions.length).toBeGreaterThan(0)
    })
  })

  describe("pause and resume", () => {
    it("should pause execution", () => {
      const executor = new WorkflowExecutor()

      // Simulate an execution in progress by setting internal state
      // Note: This tests the pause method behavior
      executor.pause()

      // After pause without active execution, isAwaitingInput should be false
      expect(executor.isAwaitingInput()).toBe(false)
    })

    it("should return null when resuming without paused execution", async () => {
      const executor = new WorkflowExecutor()

      const result = await executor.resume({ answer: "test" })

      expect(result).toBeNull()
    })
  })

  describe("cancel", () => {
    it("should handle cancellation gracefully", () => {
      const executor = new WorkflowExecutor()

      // Cancel without active execution should not throw
      expect(() => executor.cancel()).not.toThrow()
    })
  })

  describe("isAwaitingInput", () => {
    it("should return false when not waiting for input", () => {
      const executor = new WorkflowExecutor()

      expect(executor.isAwaitingInput()).toBe(false)
    })
  })

  describe("getAwaitingInputNode", () => {
    it("should return null when not waiting for input", () => {
      const executor = new WorkflowExecutor()

      const result = executor.getAwaitingInputNode()

      expect(result).toBeNull()
    })
  })

  describe("Error handling", () => {
    it("should handle missing node runner gracefully", async () => {
      // Override the mock to return undefined for unknown types
      const { getNodeRunner } = require("@/lib/engine/node-runners")
      getNodeRunner.mockImplementation(() => undefined)

      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "node-1", type: "unknown-node-type" },
      ])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      // Should complete even if node runner is missing (skipped)
      expect(result).toBeDefined()
    })

    it("should set error state on execution failure", async () => {
      const { getNodeRunner } = require("@/lib/engine/node-runners")
      getNodeRunner.mockImplementation(() => async () => {
        throw new Error("Test error")
      })

      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "node-1", type: "error-node" },
      ])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result.status).toBe("failed")
      expect(result.error).toBeDefined()
    })
  })

  describe("Progress tracking", () => {
    it("should support onProgress callback in config", () => {
      const onProgress = jest.fn()
      const executor = new WorkflowExecutor({}, { onProgress })
      
      // Verify the executor accepts the callback without error
      expect(executor).toBeDefined()
    })

    it("should record node executions during workflow", async () => {
      // Reset mock to default behavior
      const { getNodeRunner } = require("@/lib/engine/node-runners")
      getNodeRunner.mockImplementation((type: string) => {
        return async () => ({
          output: { result: `${type} done` },
        })
      })

      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "node-1", type: "student-profile" },
        { id: "node-2", type: "content-generator" },
      ], [{ source: "node-1", target: "node-2" }])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      // Node executions should be recorded
      expect(result.nodeExecutions.length).toBeGreaterThan(0)
    })
  })
})

describe("Workflow Execution Scenarios", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe("Linear workflow", () => {
    it("should execute a linear workflow A -> B -> C", async () => {
      const { getNodeRunner } = require("@/lib/engine/node-runners")
      const executedNodes: string[] = []

      getNodeRunner.mockImplementation((type: string) => {
        return async (node: VerbaPathNode) => {
          executedNodes.push(node.id)
          return { output: { result: `${type} completed` } }
        }
      })

      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow(
        [
          { id: "A", type: "student-profile" },
          { id: "B", type: "content-generator" },
          { id: "C", type: "celebration" },
        ],
        [
          { source: "A", target: "B" },
          { source: "B", target: "C" },
        ]
      )
      const student = createMockStudent()

      await executor.execute(workflow, student)

      expect(executedNodes).toContain("A")
      expect(executedNodes).toContain("B")
      expect(executedNodes).toContain("C")
    })
  })

  describe("Empty workflow", () => {
    it("should handle empty workflow", async () => {
      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([], [])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result.status).toBe("completed")
      expect(result.nodeExecutions.length).toBe(0)
    })
  })

  describe("Single node workflow", () => {
    it("should execute single node workflow", async () => {
      const { getNodeRunner } = require("@/lib/engine/node-runners")
      getNodeRunner.mockImplementation(() => async () => ({
        output: { result: "single node completed" },
      }))

      const executor = new WorkflowExecutor()
      const workflow = createMockWorkflow([
        { id: "single", type: "student-profile" },
      ])
      const student = createMockStudent()

      const result = await executor.execute(workflow, student)

      expect(result.status).toBe("completed")
      expect(result.nodeExecutions.length).toBe(1)
    })
  })
})
