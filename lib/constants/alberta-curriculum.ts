/**
 * Alberta Curriculum Standards and Outcomes
 * Aligned with Alberta Programs of Study
 */

import type { LearningOutcome } from "../types/curriculum"

export const CURRICULUM_STRANDS = {
  "english-language-arts": [
    "Comprehend and Respond",
    "Manage Ideas and Information",
    "Create and Express",
    "Collaborate and Communicate",
  ],
  mathematics: ["Number", "Patterns and Relations", "Shape and Space", "Statistics and Probability"],
} as const

export const ESL_BENCHMARKS_DOMAINS = [
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
  "Socio-Cultural Competence",
] as const

// Sample curriculum outcomes - to be expanded
export const SAMPLE_OUTCOMES: LearningOutcome[] = [
  {
    id: "ela-k-1",
    code: "ELA.K.1",
    description: "Share ideas, information and experiences with others",
    subjectArea: "english-language-arts",
    gradeLevel: "K",
    division: "K-3",
    strand: "Create and Express",
    specificOutcome: "Express ideas and feelings through oral language",
    elpaAlignment: {
      level: 1,
      domain: "speaking",
      descriptor: "Uses single words and short phrases to communicate",
      canDoStatements: [
        "Names familiar objects and people",
        "Responds to simple questions with one word",
        "Repeats words and phrases",
      ],
    },
  },
  {
    id: "math-3-1",
    code: "MATH.3.N1",
    description: "Say the number sequence from 0 to 1000",
    subjectArea: "mathematics",
    gradeLevel: "3",
    division: "K-3",
    strand: "Number",
    specificOutcome: "Develop number sense to 1000",
    elpaAlignment: {
      level: 2,
      domain: "reading",
      descriptor: "Reads number words with support",
      canDoStatements: [
        "Reads number words to 100",
        "Identifies place value vocabulary",
        "Follows written math instructions with visual support",
      ],
    },
  },
]

export const getOutcomesByGrade = (grade: string): LearningOutcome[] => {
  return SAMPLE_OUTCOMES.filter((outcome) => outcome.gradeLevel === grade)
}

export const getOutcomesBySubject = (subject: string): LearningOutcome[] => {
  return SAMPLE_OUTCOMES.filter((outcome) => outcome.subjectArea === subject)
}

export const getOutcomesByELPALevel = (level: 1 | 2 | 3 | 4 | 5): LearningOutcome[] => {
  return SAMPLE_OUTCOMES.filter((outcome) => outcome.elpaAlignment?.level === level)
}
