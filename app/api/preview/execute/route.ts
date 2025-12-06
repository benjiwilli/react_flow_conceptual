/**
 * Preview Execution API
 * Handles node execution during workflow preview
 */

import { NextRequest, NextResponse } from "next/server"

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
    case "input":
    case "textInput":
    case "text-input":
      // Input nodes pass through their value
      output = nodeData.defaultValue || inputs[String(nodeData.inputKey)] || ""
      break

    case "process":
    case "text-process":
      // Process nodes transform input
      const processInput = Object.values(inputs)[0] || ""
      const processType = nodeData.processType || "passthrough"
      switch (processType) {
        case "uppercase":
          output = String(processInput).toUpperCase()
          break
        case "lowercase":
          output = String(processInput).toLowerCase()
          break
        case "trim":
          output = String(processInput).trim()
          break
        case "reverse":
          output = String(processInput).split("").reverse().join("")
          break
        default:
          output = processInput
      }
      break

    case "ai":
    case "ai-response":
    case "aiResponse":
      // AI nodes would call the AI API - simulate response
      output = `[AI Response to: "${Object.values(inputs)[0] || "No input"}"]`
      break

    case "conditional":
    case "condition":
      // Conditional nodes evaluate a condition
      const conditionInput = Object.values(inputs)[0]
      try {
        // Simple evaluation - in production, use a safe evaluator
        output = {
          result: Boolean(conditionInput),
          branch: Boolean(conditionInput) ? "true" : "false",
        }
      } catch {
        output = { result: false, branch: "false", error: "Invalid condition" }
      }
      break

    case "output":
    case "text-output":
      // Output nodes format the final result
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

    case "vocabulary":
    case "vocabulary-check":
      // ESL vocabulary node
      output = {
        word: Object.values(inputs)[0] || nodeData.word,
        correct: Math.random() > 0.3,
        feedback: "Good attempt!",
      }
      break

    case "pronunciation":
    case "pronunciation-check":
      // ESL pronunciation node
      output = {
        score: Math.floor(60 + Math.random() * 40),
        feedback: "Clear pronunciation!",
      }
      break

    case "grammar":
    case "grammar-check":
      // ESL grammar node
      const text = String(Object.values(inputs)[0] || "")
      output = {
        original: text,
        corrected: text,
        suggestions: [],
        score: 85 + Math.floor(Math.random() * 15),
      }
      break

    case "reading-comprehension":
      // Reading comprehension assessment
      output = {
        comprehensionLevel: "intermediate",
        score: 70 + Math.floor(Math.random() * 30),
        feedback: "Good understanding of the main ideas.",
      }
      break

    case "numeracy":
    case "math":
      // Numeracy node
      const mathInput = String(Object.values(inputs)[0] || "0")
      try {
        // Safe math evaluation - in production, use a proper math parser
        output = {
          expression: mathInput,
          result: eval(mathInput), // Note: Use safe-eval in production
          correct: true,
        }
      } catch {
        output = {
          expression: mathInput,
          result: null,
          correct: false,
          error: "Invalid expression",
        }
      }
      break

    default:
      // Unknown node type - pass through
      output = Object.values(inputs)[0] || null
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
    console.error("Preview execution error:", error)
    return NextResponse.json(
      { error: "Failed to execute node", details: String(error) },
      { status: 500 }
    )
  }
}
