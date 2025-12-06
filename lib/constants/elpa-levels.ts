/**
 * ELPA (English Language Proficiency Assessment) Level Definitions
 * Based on Alberta Education ESL Proficiency Benchmarks
 */

export interface ELPALevelDefinition {
  level: 1 | 2 | 3 | 4 | 5
  name: string
  description: string
  listening: string[]
  speaking: string[]
  reading: string[]
  writing: string[]
  typicalTimeframe: string
  instructionalFocus: string[]
}

export const ELPA_LEVELS: ELPALevelDefinition[] = [
  {
    level: 1,
    name: "Beginning",
    description: "Students are new to English and rely heavily on visual cues and L1 support.",
    listening: [
      "Responds to simple greetings and commands",
      "Identifies common objects when named",
      "Follows one-step directions with visual support",
    ],
    speaking: ["Uses single words or short phrases", "Names familiar objects and people", "Repeats modeled language"],
    reading: ["Recognizes some letters and sounds", "Matches words to pictures", "Reads environmental print"],
    writing: ["Copies letters and words", "Labels pictures with single words", "Writes name and familiar words"],
    typicalTimeframe: "0-6 months",
    instructionalFocus: [
      "Survival vocabulary",
      "Visual supports essential",
      "L1 bridges encouraged",
      "Total Physical Response (TPR)",
    ],
  },
  {
    level: 2,
    name: "Developing",
    description: "Students understand simple sentences and communicate basic needs.",
    listening: [
      "Follows two-step directions",
      "Understands main idea of simple conversations",
      "Identifies key vocabulary in context",
    ],
    speaking: ["Uses simple sentences", "Asks and answers basic questions", "Participates in routine conversations"],
    reading: [
      "Reads simple sentences with familiar vocabulary",
      "Uses pictures to support comprehension",
      "Identifies main characters and events",
    ],
    writing: ["Writes simple sentences", "Uses basic punctuation", "Organizes ideas with support"],
    typicalTimeframe: "6-12 months",
    instructionalFocus: ["Sentence frames", "Graphic organizers", "Word banks", "Partner work"],
  },
  {
    level: 3,
    name: "Expanding",
    description: "Students engage with grade-level content with moderate support.",
    listening: [
      "Follows multi-step directions",
      "Understands main ideas and some details",
      "Comprehends academic vocabulary in context",
    ],
    speaking: [
      "Uses compound and complex sentences",
      "Expresses opinions with reasons",
      "Participates in academic discussions",
    ],
    reading: [
      "Reads grade-level text with support",
      "Identifies main idea and supporting details",
      "Uses context clues for unfamiliar words",
    ],
    writing: [
      "Writes paragraphs with topic sentences",
      "Uses transition words",
      "Edits for basic grammar and spelling",
    ],
    typicalTimeframe: "1-2 years",
    instructionalFocus: ["Academic vocabulary", "Text structures", "Scaffolded writing", "Small group instruction"],
  },
  {
    level: 4,
    name: "Bridging",
    description: "Students approach grade-level proficiency with minimal support.",
    listening: ["Understands most academic discourse", "Identifies implicit meanings", "Follows complex explanations"],
    speaking: [
      "Explains complex ideas clearly",
      "Uses academic language appropriately",
      "Engages in extended discussions",
    ],
    reading: [
      "Comprehends grade-level texts independently",
      "Analyzes text for purpose and audience",
      "Makes inferences and predictions",
    ],
    writing: [
      "Writes multi-paragraph compositions",
      "Uses varied sentence structures",
      "Develops ideas with examples and evidence",
    ],
    typicalTimeframe: "2-4 years",
    instructionalFocus: [
      "Critical thinking",
      "Independent learning strategies",
      "Nuanced vocabulary",
      "Genre-specific writing",
    ],
  },
  {
    level: 5,
    name: "Proficient",
    description: "Students demonstrate near-native proficiency in academic contexts.",
    listening: [
      "Fully participates in academic settings",
      "Understands nuance and figurative language",
      "Evaluates spoken arguments",
    ],
    speaking: [
      "Communicates with fluency and accuracy",
      "Adjusts register appropriately",
      "Presents information effectively",
    ],
    reading: [
      "Reads and analyzes complex texts",
      "Evaluates author perspective and bias",
      "Synthesizes information from multiple sources",
    ],
    writing: [
      "Writes for various purposes and audiences",
      "Demonstrates control of conventions",
      "Produces polished, revised work",
    ],
    typicalTimeframe: "4-7 years",
    instructionalFocus: [
      "Advanced academic skills",
      "Continued vocabulary development",
      "Monitoring for gaps",
      "Mainstream transition support",
    ],
  },
]

export const getELPALevel = (level: 1 | 2 | 3 | 4 | 5): ELPALevelDefinition => {
  return ELPA_LEVELS.find((l) => l.level === level)!
}

export const getScaffoldingForLevel = (level: 1 | 2 | 3 | 4 | 5): string[] => {
  const scaffolding: Record<number, string[]> = {
    1: ["visual-supports", "l1-translation", "single-words", "tpr", "realia"],
    2: ["sentence-frames", "word-banks", "graphic-organizers", "partner-work"],
    3: ["text-structures", "academic-vocabulary", "scaffolded-writing"],
    4: ["critical-thinking", "independent-strategies", "genre-writing"],
    5: ["advanced-analysis", "synthesis", "peer-review"],
  }
  return scaffolding[level]
}
