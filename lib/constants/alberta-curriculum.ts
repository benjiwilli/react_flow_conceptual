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

// Alberta curriculum outcomes aligned with Programs of Study
// Expanded set covering K-6 ELA and Math with ELPA alignment
export const SAMPLE_OUTCOMES: LearningOutcome[] = [
  // ============================================================================
  // Kindergarten Outcomes
  // ============================================================================
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
    id: "ela-k-2",
    code: "ELA.K.2",
    description: "Connect sounds and symbols in language",
    subjectArea: "english-language-arts",
    gradeLevel: "K",
    division: "K-3",
    strand: "Comprehend and Respond",
    specificOutcome: "Recognize that letters represent sounds",
    elpaAlignment: {
      level: 1,
      domain: "reading",
      descriptor: "Identifies letters and some letter sounds",
      canDoStatements: [
        "Points to letters when named",
        "Recognizes own name in print",
        "Associates some letters with sounds",
      ],
    },
  },
  {
    id: "math-k-1",
    code: "MATH.K.N1",
    description: "Say the number sequence from 1 to 10",
    subjectArea: "mathematics",
    gradeLevel: "K",
    division: "K-3",
    strand: "Number",
    specificOutcome: "Develop number sense to 10",
    elpaAlignment: {
      level: 1,
      domain: "speaking",
      descriptor: "Counts orally with support",
      canDoStatements: [
        "Repeats number words 1-10",
        "Points and counts objects",
        "Shows numbers with fingers",
      ],
    },
  },

  // ============================================================================
  // Grade 1 Outcomes
  // ============================================================================
  {
    id: "ela-1-1",
    code: "ELA.1.1",
    description: "Express ideas and develop understanding",
    subjectArea: "english-language-arts",
    gradeLevel: "1",
    division: "K-3",
    strand: "Comprehend and Respond",
    specificOutcome: "Listen and respond to texts",
    elpaAlignment: {
      level: 2,
      domain: "listening",
      descriptor: "Follows simple oral directions",
      canDoStatements: [
        "Identifies main idea with visual support",
        "Answers yes/no questions about stories",
        "Points to pictures that match words",
      ],
    },
  },
  {
    id: "ela-1-2",
    code: "ELA.1.2",
    description: "Use strategies and cues to make meaning from texts",
    subjectArea: "english-language-arts",
    gradeLevel: "1",
    division: "K-3",
    strand: "Comprehend and Respond",
    specificOutcome: "Apply phonics knowledge to decode words",
    elpaAlignment: {
      level: 2,
      domain: "reading",
      descriptor: "Decodes simple CVC words",
      canDoStatements: [
        "Reads simple sight words",
        "Sounds out CVC words",
        "Uses pictures to understand text",
      ],
    },
  },
  {
    id: "math-1-1",
    code: "MATH.1.N1",
    description: "Say the number sequence from 0 to 100",
    subjectArea: "mathematics",
    gradeLevel: "1",
    division: "K-3",
    strand: "Number",
    specificOutcome: "Develop number sense to 100",
    elpaAlignment: {
      level: 2,
      domain: "speaking",
      descriptor: "Counts to 100 with some support",
      canDoStatements: [
        "Says numbers 1-100 in sequence",
        "Counts objects to 20",
        "Identifies numbers when written",
      ],
    },
  },
  {
    id: "math-1-2",
    code: "MATH.1.N3",
    description: "Describe and apply mental mathematics strategies for addition and subtraction to 18",
    subjectArea: "mathematics",
    gradeLevel: "1",
    division: "K-3",
    strand: "Number",
    specificOutcome: "Use addition and subtraction in problem-solving",
    elpaAlignment: {
      level: 2,
      domain: "reading",
      descriptor: "Understands simple math word problems with support",
      canDoStatements: [
        "Identifies 'add' and 'take away' in problems",
        "Uses manipulatives to solve problems",
        "Draws pictures to show math",
      ],
    },
  },

  // ============================================================================
  // Grade 2 Outcomes
  // ============================================================================
  {
    id: "ela-2-1",
    code: "ELA.2.1",
    description: "Comprehend and respond to a variety of texts",
    subjectArea: "english-language-arts",
    gradeLevel: "2",
    division: "K-3",
    strand: "Comprehend and Respond",
    specificOutcome: "Identify main ideas and supporting details",
    elpaAlignment: {
      level: 2,
      domain: "reading",
      descriptor: "Reads simple texts with support",
      canDoStatements: [
        "Identifies characters in a story",
        "Retells beginning, middle, end",
        "Answers literal questions about text",
      ],
    },
  },
  {
    id: "ela-2-2",
    code: "ELA.2.3",
    description: "Use writing to express ideas and information",
    subjectArea: "english-language-arts",
    gradeLevel: "2",
    division: "K-3",
    strand: "Create and Express",
    specificOutcome: "Write simple sentences using proper conventions",
    elpaAlignment: {
      level: 2,
      domain: "writing",
      descriptor: "Writes simple sentences with support",
      canDoStatements: [
        "Writes simple sentences using word banks",
        "Copies sentence patterns",
        "Labels pictures with words",
      ],
    },
  },
  {
    id: "math-2-1",
    code: "MATH.2.N2",
    description: "Compare and order numbers up to 100",
    subjectArea: "mathematics",
    gradeLevel: "2",
    division: "K-3",
    strand: "Number",
    specificOutcome: "Use place value to understand numbers",
    elpaAlignment: {
      level: 2,
      domain: "reading",
      descriptor: "Reads number words to 100",
      canDoStatements: [
        "Identifies 'more', 'less', 'equal'",
        "Reads two-digit numbers",
        "Uses number line with support",
      ],
    },
  },

  // ============================================================================
  // Grade 3 Outcomes
  // ============================================================================
  {
    id: "ela-3-1",
    code: "ELA.3.1",
    description: "Demonstrate comprehension of grade-appropriate texts",
    subjectArea: "english-language-arts",
    gradeLevel: "3",
    division: "K-3",
    strand: "Comprehend and Respond",
    specificOutcome: "Use comprehension strategies before, during, and after reading",
    elpaAlignment: {
      level: 3,
      domain: "reading",
      descriptor: "Reads grade-level text with moderate support",
      canDoStatements: [
        "Makes predictions about text",
        "Identifies main idea and details",
        "Makes text-to-self connections",
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
  {
    id: "math-3-2",
    code: "MATH.3.N5",
    description: "Describe and apply mental mathematics strategies for multiplication",
    subjectArea: "mathematics",
    gradeLevel: "3",
    division: "K-3",
    strand: "Number",
    specificOutcome: "Understand multiplication as repeated addition",
    elpaAlignment: {
      level: 3,
      domain: "reading",
      descriptor: "Understands multiplication word problems",
      canDoStatements: [
        "Identifies 'groups of' and 'times'",
        "Reads multiplication vocabulary",
        "Solves simple word problems with support",
      ],
    },
  },

  // ============================================================================
  // Grade 4 Outcomes
  // ============================================================================
  {
    id: "ela-4-1",
    code: "ELA.4.1",
    description: "Construct meaning from a variety of texts",
    subjectArea: "english-language-arts",
    gradeLevel: "4",
    division: "4-6",
    strand: "Comprehend and Respond",
    specificOutcome: "Use inference to understand implicit meanings",
    elpaAlignment: {
      level: 3,
      domain: "reading",
      descriptor: "Makes simple inferences from text",
      canDoStatements: [
        "Identifies cause and effect",
        "Makes predictions using text evidence",
        "Compares and contrasts elements",
      ],
    },
  },
  {
    id: "ela-4-2",
    code: "ELA.4.3",
    description: "Create original texts to express ideas",
    subjectArea: "english-language-arts",
    gradeLevel: "4",
    division: "4-6",
    strand: "Create and Express",
    specificOutcome: "Write paragraphs with supporting details",
    elpaAlignment: {
      level: 3,
      domain: "writing",
      descriptor: "Writes organized paragraphs with support",
      canDoStatements: [
        "Writes topic sentences",
        "Adds supporting details",
        "Uses transition words",
      ],
    },
  },
  {
    id: "math-4-1",
    code: "MATH.4.N3",
    description: "Demonstrate understanding of multiplication to 9 × 9 and division",
    subjectArea: "mathematics",
    gradeLevel: "4",
    division: "4-6",
    strand: "Number",
    specificOutcome: "Apply multiplication and division in problem-solving",
    elpaAlignment: {
      level: 3,
      domain: "reading",
      descriptor: "Solves multi-step word problems with support",
      canDoStatements: [
        "Identifies operations needed",
        "Reads and interprets word problems",
        "Shows work with diagrams",
      ],
    },
  },
  {
    id: "math-4-2",
    code: "MATH.4.N6",
    description: "Demonstrate understanding of fractions",
    subjectArea: "mathematics",
    gradeLevel: "4",
    division: "4-6",
    strand: "Number",
    specificOutcome: "Represent and compare fractions",
    elpaAlignment: {
      level: 3,
      domain: "reading",
      descriptor: "Understands fraction vocabulary",
      canDoStatements: [
        "Reads fraction words (half, quarter, third)",
        "Identifies fractions in real-world contexts",
        "Compares fractions with visual support",
      ],
    },
  },

  // ============================================================================
  // Grade 5 Outcomes
  // ============================================================================
  {
    id: "ela-5-1",
    code: "ELA.5.1",
    description: "Analyze and synthesize ideas from a variety of sources",
    subjectArea: "english-language-arts",
    gradeLevel: "5",
    division: "4-6",
    strand: "Comprehend and Respond",
    specificOutcome: "Draw conclusions using multiple sources",
    elpaAlignment: {
      level: 4,
      domain: "reading",
      descriptor: "Reads grade-level text with minimal support",
      canDoStatements: [
        "Synthesizes information from multiple sources",
        "Distinguishes fact from opinion",
        "Analyzes author's purpose",
      ],
    },
  },
  {
    id: "math-5-1",
    code: "MATH.5.N1",
    description: "Represent and describe whole numbers to 1 000 000",
    subjectArea: "mathematics",
    gradeLevel: "5",
    division: "4-6",
    strand: "Number",
    specificOutcome: "Read, write, and order large numbers",
    elpaAlignment: {
      level: 4,
      domain: "reading",
      descriptor: "Reads large number words",
      canDoStatements: [
        "Reads numbers in word and numeral form",
        "Uses place value vocabulary fluently",
        "Interprets numbers in context",
      ],
    },
  },

  // ============================================================================
  // Grade 6 Outcomes
  // ============================================================================
  {
    id: "ela-6-1",
    code: "ELA.6.1",
    description: "Evaluate and interpret texts critically",
    subjectArea: "english-language-arts",
    gradeLevel: "6",
    division: "4-6",
    strand: "Comprehend and Respond",
    specificOutcome: "Analyze literary elements and techniques",
    elpaAlignment: {
      level: 4,
      domain: "reading",
      descriptor: "Analyzes literary texts independently",
      canDoStatements: [
        "Identifies theme and symbolism",
        "Evaluates author's craft",
        "Makes connections across texts",
      ],
    },
  },
  {
    id: "math-6-1",
    code: "MATH.6.N2",
    description: "Solve problems involving whole numbers and decimal numbers",
    subjectArea: "mathematics",
    gradeLevel: "6",
    division: "4-6",
    strand: "Number",
    specificOutcome: "Apply operations with decimals in real-world contexts",
    elpaAlignment: {
      level: 4,
      domain: "reading",
      descriptor: "Solves complex word problems",
      canDoStatements: [
        "Interprets multi-step problems",
        "Identifies relevant information",
        "Explains solution strategies",
      ],
    },
  },

  // ============================================================================
  // Cross-Curricular Speaking & Listening
  // ============================================================================
  {
    id: "ela-oral-k3",
    code: "ELA.ORAL.K3",
    description: "Develop oral communication skills",
    subjectArea: "english-language-arts",
    gradeLevel: "K-3",
    division: "K-3",
    strand: "Collaborate and Communicate",
    specificOutcome: "Participate in oral language activities",
    elpaAlignment: {
      level: 2,
      domain: "speaking",
      descriptor: "Participates in structured conversations",
      canDoStatements: [
        "Responds to questions about familiar topics",
        "Shares ideas in small groups",
        "Uses complete sentences with support",
      ],
    },
  },
  {
    id: "ela-oral-46",
    code: "ELA.ORAL.46",
    description: "Communicate ideas effectively through oral presentations",
    subjectArea: "english-language-arts",
    gradeLevel: "4-6",
    division: "4-6",
    strand: "Collaborate and Communicate",
    specificOutcome: "Present information clearly and confidently",
    elpaAlignment: {
      level: 4,
      domain: "speaking",
      descriptor: "Gives organized presentations",
      canDoStatements: [
        "Presents information logically",
        "Uses academic vocabulary",
        "Responds to questions from audience",
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
