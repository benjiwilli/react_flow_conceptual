/**
 * Workflow Execution API Route
 * Executes learning pathways with streaming support
 * 
 * @api {POST} /api/execute Execute a workflow
 * @apiName ExecuteWorkflow
 * @apiGroup Workflows
 * @apiVersion 1.0.0
 * 
 * @apiDescription
 * Executes a VerbaPath workflow for a student, returning results via Server-Sent Events (SSE).
 * Each node execution emits events that can be consumed in real-time.
 * 
 * **Authentication:** Optional (rate limited by IP when unauthenticated)
 * **Rate Limits:**
 * - Authenticated teachers: 500 executions/day
 * - Per IP: 30 requests/minute
 * 
 * @apiBody {Object} workflow - The workflow definition
 * @apiBody {String} workflow.id - Workflow unique identifier
 * @apiBody {String} workflow.name - Workflow display name
 * @apiBody {Array} workflow.nodes - Array of node definitions
 * @apiBody {Array} workflow.edges - Array of edge connections
 * @apiBody {Object} student - Student profile for personalization
 * @apiBody {String} student.id - Student unique identifier
 * @apiBody {String} student.gradeLevel - Grade level (K-12)
 * @apiBody {String} student.nativeLanguage - Primary L1 language code
 * @apiBody {Number} student.elpaLevel - ELPA proficiency level (1-5)
 * @apiBody {Object} [options] - Execution options
 * 
 * @apiSuccess {Stream} SSE Event stream with node execution results
 * @apiSuccessExample {text} Success Response (SSE):
 *   event: node_started
 *   data: {"nodeId":"node1","type":"student-profile"}
 *   
 *   event: node_completed
 *   data: {"nodeId":"node1","output":{...}}
 *   
 *   event: workflow_completed
 *   data: {"success":true,"duration":1234}
 * 
 * @apiError (400) InvalidPayload The request body failed validation
 * @apiError (429) RateLimited Too many requests
 * @apiError (500) ExecutionError An error occurred during workflow execution
 */

import { WorkflowExecutor } from "@/lib/engine/executor"
import type { VerbaPathWorkflow } from "@/lib/types/workflow"
import type { StudentProfile } from "@/lib/types/student"
import { z } from "zod"
import { checkExecutionLimit, checkIpLimit } from "@/lib/middleware/rate-limiter"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const nodeSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    data: z.record(z.any()).optional(),
  })
  .passthrough()

const edgeSchema = z
  .object({
    id: z.string().optional(),
    source: z.string(),
    target: z.string(),
  })
  .passthrough()

const workflowSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().default("Untitled Workflow"),
  description: z.string().default(""),
  nodes: z.array(nodeSchema).min(1, "Workflow must include at least one node"),
  edges: z.array(edgeSchema).default([]),
  targetGrades: z.array(z.string()).default([]),
  targetELPALevels: z.array(z.number()).default([]),
  curriculumOutcomes: z.array(z.string()).default([]),
  estimatedDuration: z.number().default(0),
  createdBy: z.string().default("builder"),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
  isTemplate: z.boolean().default(false),
  category: z.string().default("custom"),
})

const studentSchema = z.object({
  id: z.string(),
  firstName: z.string().default("Student"),
  lastName: z.string().default("Demo"),
  gradeLevel: z.string(),
  nativeLanguage: z.string(),
  additionalLanguages: z.array(z.string()).default([]),
  elpaLevel: z.number(),
  literacyLevel: z.number().default(0),
  numeracyLevel: z.number().default(0),
  learningStyles: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  culturalBackground: z.string().default(""),
  accommodations: z.array(z.string()).default([]),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
  schoolId: z.string().default(""),
  teacherId: z.string().default(""),
})

const requestSchema = z.object({
  workflow: workflowSchema,
  student: studentSchema,
  options: z.record(z.any()).optional(),
})

// POST /api/execute - Execute a workflow with SSE streaming
export async function POST(request: Request) {
  const encoder = new TextEncoder()

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               request.headers.get("x-real-ip") || 
               "unknown"

    // Check IP rate limit first (returns null if rate limiting not configured)
    const ipLimitResult = await checkIpLimit(ip)
    if (ipLimitResult && !ipLimitResult.success) {
      const retryAfter = ipLimitResult.reset 
        ? Math.ceil((ipLimitResult.reset - Date.now()) / 1000) 
        : 60
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      )
    }

    // Try to get authenticated user for additional rate limiting
    let teacherId: string | null = null
    try {
      const supabase = await createSupabaseServerClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        teacherId = session.user.id

        // Check teacher's daily execution limit (returns RateLimitCheck with allowed + limits)
        const teacherLimitResult = await checkExecutionLimit(teacherId)
        if (!teacherLimitResult.allowed) {
          const teacherLimit = teacherLimitResult.limits.teacher
          return new Response(
            JSON.stringify({
              error: "Daily execution limit exceeded",
              message: "You have reached your daily workflow execution limit. Please try again tomorrow.",
              limit: teacherLimit?.limit ?? 500,
              remaining: teacherLimit?.remaining ?? 0,
              limitType: teacherLimitResult.limitType,
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            }
          )
        }
      }
    } catch {
      // Auth is optional, continue without it
    }

    const parsed = requestSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload",
          issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { workflow, student } = parsed.data

    // Track abort state from client disconnect
    let aborted = false
    const abortController = new AbortController()

    // Listen for client disconnect via request.signal
    request.signal.addEventListener("abort", () => {
      aborted = true
      abortController.abort()
    })

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: string, data: unknown) => {
          // Don't send events if client disconnected
          if (aborted) return
          try {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(payload))
          } catch {
            // Stream may be closed, ignore
          }
        }

        const executor = new WorkflowExecutor({ enableStreaming: true }, {
          onNodeStart: (nodeId, node) => send("node-start", { nodeId, nodeType: node.type, label: node.data?.label }),
          onNodeComplete: (nodeId, output) => send("node-complete", { nodeId, output }),
          onNodeError: (nodeId, error) => send("node-error", { nodeId, message: error.message }),
          onProgress: (progress, totalNodes, completedNodes) =>
            send("progress", { progress, totalNodes, completedNodes }),
          onStreamToken: (event) => send("stream-token", event),
          onExecutionComplete: (execution) => {
            send("complete", { status: execution.status, error: execution.error })
            if (!aborted) {
              try { controller.close() } catch { /* already closed */ }
            }
          },
        })

        Promise.resolve()
          .then(() => {
            // Check if already aborted before starting
            if (aborted) {
              throw new Error("Client disconnected")
            }
            return executor.execute(workflow as VerbaPathWorkflow, student as StudentProfile)
          })
          .catch((error) => {
            if (!aborted) {
              send("error", { message: error instanceof Error ? error.message : "Execution failed" })
              try { controller.close() } catch { /* already closed */ }
            }
          })
      },
      cancel() {
        // Called when the stream is cancelled (client disconnects)
        aborted = true
        abortController.abort()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
