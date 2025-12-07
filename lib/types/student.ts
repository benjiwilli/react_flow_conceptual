/**
 * Student Profile Types for VerbaPath ESL Learning Orchestrator
 * Alberta K-12 ESL Student Data Models
 */

export type GradeLevel = "K" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"

export type ELPALevel = 1 | 2 | 3 | 4 | 5

export type SupportedLanguage =
  | "mandarin"
  | "cantonese"
  | "punjabi"
  | "arabic"
  | "spanish"
  | "tagalog"
  | "ukrainian"
  | "vietnamese"
  | "korean"
  | "farsi"
  | "hindi"
  | "urdu"
  | "french"
  | "somali"
  | "other"

export type LearningStyle = "visual" | "auditory" | "kinesthetic" | "reading-writing"

export interface StudentProfile {
  id: string
  firstName: string
  lastName: string
  gradeLevel: GradeLevel
  nativeLanguage: SupportedLanguage
  additionalLanguages: SupportedLanguage[]
  elpaLevel: ELPALevel
  literacyLevel: ELPALevel
  numeracyLevel: ELPALevel
  learningStyles: LearningStyle[]
  interests: string[]
  culturalBackground: string
  accommodations: string[]
  createdAt: Date
  updatedAt: Date
  schoolId: string
  teacherId: string
}

export interface StudentProgress {
  id: string
  studentId: string
  workflowId: string
  nodeId: string
  completedAt: Date
  score?: number
  timeSpentSeconds: number
  attempts: number
  feedback: string
  artifacts: StudentArtifact[]
}

export interface StudentArtifact {
  id: string
  type: "text" | "audio" | "image" | "video"
  content: string
  createdAt: Date
}

export interface StudentSession {
  id: string
  studentId: string
  startedAt: Date
  endedAt?: Date
  workflowsCompleted: string[]
  totalTimeSeconds: number
}
