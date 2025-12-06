/**
 * Assessment Types for LinguaFlow
 * Tracking student progress and comprehension
 */

export type AssessmentType =
  | "comprehension-check"
  | "vocabulary-quiz"
  | "speaking-assessment"
  | "writing-sample"
  | "math-problem-set"
  | "listening-comprehension"
  | "oral-reading-fluency"

export type ScoreType = "percentage" | "rubric" | "pass-fail" | "elpa-level"

export interface Assessment {
  id: string
  type: AssessmentType
  title: string
  description: string
  targetELPALevel: 1 | 2 | 3 | 4 | 5
  questions: AssessmentQuestion[]
  rubric?: AssessmentRubric
  timeLimit?: number
  adaptiveDifficulty: boolean
}

export interface AssessmentQuestion {
  id: string
  type: "multiple-choice" | "short-answer" | "audio-response" | "drag-drop" | "fill-blank"
  prompt: string
  promptAudio?: string
  options?: string[]
  correctAnswer: string | string[]
  points: number
  scaffolding: QuestionScaffolding
  hints: string[]
}

export interface QuestionScaffolding {
  sentenceStarters?: string[]
  wordBank?: string[]
  visualSupport?: string
  l1Translation?: Record<string, string>
  simplifiedPrompt?: string
}

export interface AssessmentRubric {
  id: string
  criteria: RubricCriterion[]
  maxScore: number
}

export interface RubricCriterion {
  name: string
  description: string
  levels: RubricLevel[]
}

export interface RubricLevel {
  score: number
  label: string
  description: string
}

export interface AssessmentResult {
  id: string
  assessmentId: string
  studentId: string
  score: number
  scoreType: ScoreType
  completedAt: Date
  timeSpentSeconds: number
  questionResults: QuestionResult[]
  feedback: string
  recommendations: string[]
}

export interface QuestionResult {
  questionId: string
  studentAnswer: string
  isCorrect: boolean
  pointsEarned: number
  hintsUsed: number
  scaffoldingUsed: string[]
}
