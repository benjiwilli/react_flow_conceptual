/**
 * Student Learning Session Page
 * Dynamic page for running learning activities with real workflow execution
 */

"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { LearningInterface } from "@/components/student/learning-interface"
import type { StudentProfile } from "@/lib/types/student"
import type { VerbaPathWorkflow } from "@/lib/types/workflow"
import type { NodeExecution } from "@/lib/types/execution"
import { DEMO_WORKFLOW } from "@/lib/constants/demo-workflow"

interface LearningContent {
  type: "text" | "question" | "multiple-choice" | "voice-prompt" | "visual"
  content: string
  translation?: string
  vocabulary?: { word: string; definition: string; translation?: string }[]
}

interface QuestionData {
  prompt: string
  type: "text" | "number" | "multiple-choice" | "voice"
  options?: { id: string; text: string }[]
  hint?: string
}

interface SessionState {
  workflow: VerbaPathWorkflow | null
  student: StudentProfile | null
  nodeExecutions: NodeExecution[]
  currentNodeIndex: number
  isPaused: boolean
  awaitingInput: boolean
  currentContent: LearningContent | null
  currentQuestion: QuestionData | null
}

export default function SessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sessionId = params.sessionId as string
  const workflowId = searchParams.get("workflowId")
  const studentId = searchParams.get("studentId")

  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [sessionState, setSessionState] = useState<SessionState>({
    workflow: null,
    student: null,
    nodeExecutions: [],
    currentNodeIndex: 0,
    isPaused: false,
    awaitingInput: false,
    currentContent: null,
    currentQuestion: null,
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (error) {
      console.error("Session error:", error)
    }
  }, [error])

  

  // Start workflow execution via SSE
  // Record progress to /api/progress
  const recordProgress = useCallback(async () => {
    if (!sessionState.student || !sessionState.workflow) return

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studentId: sessionState.student.id,
          workflowId: sessionState.workflow.id,
          nodeExecutions: sessionState.nodeExecutions,
          completedAt: new Date().toISOString(),
        }),
      })
    } catch {
      // Silent fail for progress recording
    }
  }, [sessionId, sessionState])

  // Handle SSE events from execution
  const handleSSEEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    switch (eventType) {
      case "node-start":
        setSessionState((prev) => ({
          ...prev,
          currentNodeIndex: prev.nodeExecutions.length,
        }))
        break

      case "node-complete": {
        const output = data.output as Record<string, unknown>
        const nodeExecution: NodeExecution = {
          nodeId: data.nodeId as string,
          nodeType: (data as { nodeType?: string }).nodeType || "unknown",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          input: {},
          output,
        }

        setSessionState((prev) => {
          const newState = {
            ...prev,
            nodeExecutions: [...prev.nodeExecutions, nodeExecution],
          }

          // Extract content/questions from output
          if (output.content) {
            newState.currentContent = {
              type: "text",
              content: String(output.content),
              translation: output.translatedContent as string,
              vocabulary: output.vocabulary as { word: string; definition: string; translation?: string }[],
            }
          }

          if (output.questions || output.prompt) {
            newState.currentQuestion = {
              prompt: String(output.prompt || (output.questions as { question: string }[])?.[0]?.question || ""),
              type: (output.inputType as "text" | "number" | "multiple-choice" | "voice") || "text",
              hint: output.hint as string,
            }
            newState.awaitingInput = true
          }

          return newState
        })
        break
      }

      case "stream-token":
        setStreamingText((prev) => prev + (data.content || ""))
        break

      case "progress":
        // Progress updates handled via node executions count
        break

      case "complete":
        setIsStreaming(false)
        // Record progress to API
        recordProgress()
        break

      case "error":
        setError(data.message as string)
        setIsStreaming(false)
        break
    }
  }, [recordProgress])

  const startExecution = useCallback(async (workflow: VerbaPathWorkflow, student: StudentProfile) => {
    setIsStreaming(true)
    setStreamingText("")
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, student }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to start execution")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim()) continue

          const eventMatch = line.match(/^event: (\S+)/)
          const dataMatch = line.match(/^data: (.+)$/m)

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1]
            const eventData = JSON.parse(dataMatch[1])

            handleSSEEvent(eventType, eventData)
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message)
      }
    } finally {
      setIsStreaming(false)
      setIsLoading(false)
    }
  }, [handleSSEEvent])

  // Fetch workflow and student data, then start execution
  useEffect(() => {
    async function initializeSession() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch student profile
        let student: StudentProfile | null = null
        if (studentId) {
          const studentRes = await fetch(`/api/students/${studentId}`)
          if (studentRes.ok) {
            const data = await studentRes.json()
            student = data.student
          }
        }

        // If no student found, use demo student
        if (!student) {
          student = {
            id: studentId || "demo-student",
            firstName: "Student",
            lastName: "Demo",
            gradeLevel: "4",
            nativeLanguage: "mandarin",
            additionalLanguages: [],
            elpaLevel: 3,
            literacyLevel: 3,
            numeracyLevel: 3,
            learningStyles: ["visual"],
            interests: ["math", "stories"],
            culturalBackground: "",
            accommodations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            schoolId: "demo",
            teacherId: "demo",
          }
        }

        // Fetch workflow
        let workflow: VerbaPathWorkflow | null = null
        if (workflowId) {
          const workflowRes = await fetch(`/api/workflows/${workflowId}`)
          if (workflowRes.ok) {
            const data = await workflowRes.json()
            workflow = data.workflow
          }
        }

        // If no workflow from API, try localStorage
        if (!workflow) {
          try {
            const storedWorkflow = localStorage.getItem(`session-workflow-${sessionId}`)
            if (storedWorkflow) {
              workflow = JSON.parse(storedWorkflow)
            }
          } catch {
            // localStorage may not be available (SSR or private browsing)
          }
        }

        // If still no workflow, use demo workflow for demonstration
        if (!workflow) {
          workflow = DEMO_WORKFLOW
        }

        setSessionState((prev) => ({
          ...prev,
          student,
          workflow,
        }))

        // Start workflow execution if we have both
        if (workflow && student) {
          await startExecution(workflow, student)
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize session")
        setIsLoading(false)
      }
    }

    initializeSession()

    const currentEventSource = eventSourceRef.current
    const currentAbortController = abortControllerRef.current

    return () => {
      currentEventSource?.close()
      currentAbortController?.abort()
    }
  }, [sessionId, workflowId, studentId, startExecution])

  // Handle answer submission
  const handleSubmitAnswer = useCallback(async (answer: string) => {
    setSessionState((prev) => ({
      ...prev,
      awaitingInput: false,
      currentQuestion: null,
    }))

    // In a full implementation, this would resume workflow execution with the user's input
    // For now, we record the answer and move to next step
    const nodeExecution: NodeExecution = {
      nodeId: `user-input-${Date.now()}`,
      nodeType: "user-response",
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      input: {},
      output: { userAnswer: answer },
    }

    setSessionState((prev) => ({
      ...prev,
      nodeExecutions: [...prev.nodeExecutions, nodeExecution],
    }))
  }, [])

  const handleRequestHint = useCallback(() => {
    // Could trigger hint generation via AI
  }, [])

  const handlePlayAudio = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const handleNext = useCallback(() => {
    setSessionState((prev) => ({
      ...prev,
      currentNodeIndex: Math.min(prev.currentNodeIndex + 1, prev.nodeExecutions.length - 1),
    }))
  }, [])

  const handleBack = useCallback(() => {
    setSessionState((prev) => ({
      ...prev,
      currentNodeIndex: Math.max(prev.currentNodeIndex - 1, 0),
    }))
  }, [])

  // Calculate progress
  const totalSteps = sessionState.workflow?.nodes.length || 10
  const completedSteps = sessionState.nodeExecutions.length
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <LearningInterface
      sessionId={sessionId}
      studentName={sessionState.student?.firstName || "Student"}
      content={sessionState.currentContent || undefined}
      question={sessionState.currentQuestion || undefined}
      progress={progress}
      totalSteps={totalSteps}
      currentStep={completedSteps + 1}
      isLoading={isLoading}
      isStreaming={isStreaming}
      streamingText={streamingText}
      onSubmitAnswer={handleSubmitAnswer}
      onRequestHint={handleRequestHint}
      onPlayAudio={handlePlayAudio}
      onNext={handleNext}
      onBack={handleBack}
    />
  )
}
