/**
 * Alberta Curriculum Types for LinguaFlow
 * Aligned with Alberta Programs of Study
 */

export type SubjectArea = "english-language-arts" | "mathematics" | "science" | "social-studies" | "esl-benchmarks"

export type CurriculumDivision = "K-3" | "4-6" | "7-9" | "10-12"

export interface LearningOutcome {
  id: string
  code: string
  description: string
  subjectArea: SubjectArea
  gradeLevel: string
  division: CurriculumDivision
  strand: string
  specificOutcome: string
  elpaAlignment?: ELPAOutcomeAlignment
}

export interface ELPAOutcomeAlignment {
  level: 1 | 2 | 3 | 4 | 5
  domain: "listening" | "speaking" | "reading" | "writing"
  descriptor: string
  canDoStatements: string[]
}

export interface CurriculumStandard {
  id: string
  name: string
  description: string
  outcomes: LearningOutcome[]
  prerequisites: string[]
  assessmentCriteria: string[]
}

export interface LessonPlan {
  id: string
  title: string
  description: string
  targetGrades: string[]
  targetELPALevels: (1 | 2 | 3 | 4 | 5)[]
  outcomes: string[]
  workflowId: string
  duration: number
  materials: string[]
  teacherNotes: string
}
