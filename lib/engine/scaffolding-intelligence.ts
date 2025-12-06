/**
 * Scaffolding Intelligence
 * AI-powered content adaptation for ESL students
 * Implements Krashen's i+1 comprehensible input hypothesis
 */

import { z } from "zod"
import { generateStructuredOutput, generateTextCompletion } from "./ai-client"

// ============================================================================
// Readability Analysis
// ============================================================================

export interface ReadabilityMetrics {
  fleschKincaid: number
  fleschReadingEase: number
  averageSentenceLength: number
  averageWordLength: number
  complexWordCount: number
  totalWords: number
  totalSentences: number
  suggestedElpaLevel: number
}

/**
 * Analyze text readability using simple metrics
 * In production, enhance with AI-based analysis
 */
export function analyzeReadability(text: string): ReadabilityMetrics {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0)
  
  const totalWords = words.length
  const totalSentences = Math.max(sentences.length, 1)
  const avgSentenceLength = totalWords / totalSentences
  const avgSyllablesPerWord = syllableCount / Math.max(totalWords, 1)
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(totalWords, 1)
  
  // Flesch-Kincaid Grade Level
  const fleschKincaid = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
  
  // Flesch Reading Ease (0-100, higher is easier)
  const fleschReadingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  
  // Count complex words (3+ syllables)
  const complexWordCount = words.filter(w => countSyllables(w) >= 3).length
  
  // Map to ELPA level (1-5)
  const suggestedElpaLevel = mapFleschToElpa(fleschReadingEase)
  
  return {
    fleschKincaid: Math.max(0, Math.round(fleschKincaid * 10) / 10),
    fleschReadingEase: Math.max(0, Math.min(100, Math.round(fleschReadingEase * 10) / 10)),
    averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    averageWordLength: Math.round(avgWordLength * 10) / 10,
    complexWordCount,
    totalWords,
    totalSentences,
    suggestedElpaLevel,
  }
}

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "")
  if (cleaned.length <= 3) return 1
  
  const vowels = cleaned.match(/[aeiouy]+/g)
  let count = vowels ? vowels.length : 1
  
  // Subtract silent e
  if (cleaned.endsWith("e")) count--
  // Handle -le ending
  if (cleaned.endsWith("le") && cleaned.length > 2) count++
  
  return Math.max(1, count)
}

function mapFleschToElpa(fleschScore: number): number {
  if (fleschScore >= 90) return 1 // Very easy
  if (fleschScore >= 70) return 2 // Easy
  if (fleschScore >= 50) return 3 // Fairly difficult
  if (fleschScore >= 30) return 4 // Difficult
  return 5 // Very difficult
}

// ============================================================================
// i+1 Content Adjustment
// ============================================================================

export interface ContentAdjustmentOptions {
  targetElpaLevel: number
  preserveMeaning: boolean
  addVocabularySupport: boolean
  addSentenceFrames: boolean
}

export interface AdjustedContent {
  originalText: string
  adjustedText: string
  originalLevel: number
  targetLevel: number
  adjustments: string[]
  vocabularyNotes: VocabularyNote[]
}

export interface VocabularyNote {
  word: string
  simplification?: string
  definition: string
  contextSentence?: string
}

const adjustedContentSchema = z.object({
  adjustedText: z.string(),
  adjustments: z.array(z.string()),
  vocabularyNotes: z.array(z.object({
    word: z.string(),
    simplification: z.string().optional(),
    definition: z.string(),
    contextSentence: z.string().optional(),
  })),
})

/**
 * Adjust content to target ELPA level using AI
 * Implements i+1 hypothesis - content should be slightly above current level
 */
export async function adjustContentToLevel(
  text: string,
  currentElpaLevel: number,
  options: Partial<ContentAdjustmentOptions> = {}
): Promise<AdjustedContent> {
  const targetLevel = options.targetElpaLevel ?? Math.min(currentElpaLevel + 1, 5)
  const metrics = analyzeReadability(text)
  
  // If content is already at appropriate level, return with minimal changes
  if (Math.abs(metrics.suggestedElpaLevel - targetLevel) <= 1) {
    return {
      originalText: text,
      adjustedText: text,
      originalLevel: metrics.suggestedElpaLevel,
      targetLevel,
      adjustments: ["Content is already at appropriate level"],
      vocabularyNotes: [],
    }
  }
  
  const systemPrompt = `You are an ESL content adaptation specialist for Alberta K-12 students.
Your task is to adjust text to ELPA Level ${targetLevel} (1=Beginning, 5=Bridging).

Guidelines for Level ${targetLevel}:
${getElpaGuidelines(targetLevel)}

Adjust the text while:
1. Preserving the core meaning and educational content
2. Using vocabulary appropriate for the target level
3. Adjusting sentence complexity (shorter sentences for lower levels)
4. Adding context clues for challenging vocabulary
5. Maintaining engagement and cultural relevance`

  const prompt = `Adjust this text to ELPA Level ${targetLevel}:

Original text:
${text}

Current readability suggests ELPA Level ${metrics.suggestedElpaLevel}.
${options.addVocabularySupport ? "Include vocabulary support notes." : ""}
${options.addSentenceFrames ? "Add sentence frames where helpful." : ""}`

  try {
    const result = await generateStructuredOutput({
      system: systemPrompt,
      prompt,
      schema: adjustedContentSchema,
    })

    return {
      originalText: text,
      adjustedText: result.object.adjustedText,
      originalLevel: metrics.suggestedElpaLevel,
      targetLevel,
      adjustments: result.object.adjustments,
      vocabularyNotes: result.object.vocabularyNotes,
    }
  } catch {
    // Fallback to rule-based adjustment
    return ruleBasedAdjustment(text, metrics.suggestedElpaLevel, targetLevel)
  }
}

function getElpaGuidelines(level: number): string {
  const guidelines: Record<number, string> = {
    1: `- Use simple, high-frequency words (sight words, everyday vocabulary)
- Keep sentences very short (3-5 words)
- Use present tense primarily
- Include visual cues and repetition
- Use concrete nouns and simple verbs`,
    2: `- Use basic vocabulary with some content-specific words
- Keep sentences short (5-8 words)
- Use simple sentence structures (SVO)
- Include context clues for new vocabulary
- Use common transition words`,
    3: `- Use grade-level vocabulary with support
- Moderate sentence length (8-12 words)
- Include compound sentences
- Use varied sentence beginnings
- Include academic vocabulary with definitions`,
    4: `- Use grade-level academic vocabulary
- Varied sentence length (10-15 words)
- Include complex sentences with clauses
- Use passive voice occasionally
- Include figurative language with explanation`,
    5: `- Use advanced academic vocabulary
- Complex sentence structures
- Include abstract concepts
- Use varied literary devices
- Match grade-level text complexity`,
  }
  return guidelines[level] || guidelines[3]
}

function ruleBasedAdjustment(
  text: string,
  originalLevel: number,
  targetLevel: number
): AdjustedContent {
  const adjustments: string[] = []
  let adjustedText = text

  if (targetLevel < originalLevel) {
    // Simplify
    // Break long sentences
    adjustedText = adjustedText.replace(/([.!?])\s*/g, "$1\n").trim()
    adjustments.push("Broke long sentences into shorter ones")
    
    // Simplify common complex words
    const simplifications: Record<string, string> = {
      "utilize": "use",
      "demonstrate": "show",
      "approximately": "about",
      "sufficient": "enough",
      "additional": "more",
      "frequently": "often",
      "immediately": "now",
      "previously": "before",
    }
    
    for (const [complex, simple] of Object.entries(simplifications)) {
      if (adjustedText.toLowerCase().includes(complex)) {
        adjustedText = adjustedText.replace(new RegExp(complex, "gi"), simple)
        adjustments.push(`Simplified "${complex}" to "${simple}"`)
      }
    }
  }

  return {
    originalText: text,
    adjustedText,
    originalLevel,
    targetLevel,
    adjustments: adjustments.length > 0 ? adjustments : ["Applied rule-based simplification"],
    vocabularyNotes: [],
  }
}

// ============================================================================
// Vocabulary Extraction
// ============================================================================

export interface ExtractedVocabulary {
  word: string
  partOfSpeech: string
  definition: string
  l1Translation?: string
  imageUrl?: string
  difficulty: "basic" | "intermediate" | "advanced"
  contextSentence: string
}

const vocabularySchema = z.object({
  vocabulary: z.array(z.object({
    word: z.string(),
    partOfSpeech: z.string(),
    definition: z.string(),
    difficulty: z.enum(["basic", "intermediate", "advanced"]),
    contextSentence: z.string(),
  })),
})

/**
 * Extract key vocabulary from text using AI
 */
export async function extractVocabulary(
  text: string,
  elpaLevel: number,
  maxWords: number = 10,
  nativeLanguage?: string
): Promise<ExtractedVocabulary[]> {
  const systemPrompt = `You are a vocabulary specialist for ESL students at ELPA Level ${elpaLevel}.
Extract key vocabulary words that students at this level should learn.
Focus on:
- Academic vocabulary
- Content-specific terms
- Words with multiple meanings
- Words that may have cognates in other languages`

  const prompt = `Extract up to ${maxWords} key vocabulary words from this text for an ELPA Level ${elpaLevel} student:

${text}

For each word, provide:
1. The word and its part of speech
2. A student-friendly definition
3. A difficulty rating (basic/intermediate/advanced)
4. A simple context sentence`

  try {
    const result = await generateStructuredOutput({
      system: systemPrompt,
      prompt,
      schema: vocabularySchema,
    })

    const vocabulary = result.object.vocabulary.map((v) => ({
      ...v,
      l1Translation: undefined,
      imageUrl: undefined,
    }))

    // Add L1 translations if requested
    if (nativeLanguage) {
      return await addL1Translations(vocabulary, nativeLanguage)
    }

    return vocabulary
  } catch {
    // Fallback to simple extraction
    return simpleVocabularyExtraction(text, maxWords)
  }
}

function simpleVocabularyExtraction(text: string, maxWords: number): ExtractedVocabulary[] {
  const words = text.match(/\b[a-zA-Z]{4,}\b/g) || []
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))]
  
  return uniqueWords.slice(0, maxWords).map(word => ({
    word,
    partOfSpeech: "noun/verb",
    definition: `Definition for "${word}"`,
    difficulty: word.length > 7 ? "advanced" : word.length > 5 ? "intermediate" : "basic",
    contextSentence: `The word "${word}" appears in the text.`,
  }))
}

async function addL1Translations(
  vocabulary: ExtractedVocabulary[],
  nativeLanguage: string
): Promise<ExtractedVocabulary[]> {
  const translationPrompt = `Translate these English words to ${nativeLanguage}:
${vocabulary.map(v => v.word).join(", ")}

Return translations in the same order, separated by commas.`

  try {
    const result = await generateTextCompletion({ prompt: translationPrompt })
    const translations = result.text.split(",").map(t => t.trim())
    
    return vocabulary.map((v, i) => ({
      ...v,
      l1Translation: translations[i] || undefined,
    }))
  } catch {
    return vocabulary
  }
}

// ============================================================================
// L1 Bridge Generation
// ============================================================================

export interface L1Bridge {
  originalText: string
  keyTerms: Array<{
    english: string
    translation: string
    pronunciation?: string
  }>
  conceptExplanation?: string
  culturalNotes?: string[]
}

/**
 * Generate L1 bridge content for concept understanding
 */
export async function generateL1Bridge(
  text: string,
  nativeLanguage: string,
  bridgeType: "full-translation" | "key-terms" | "concept-explanation" = "key-terms"
): Promise<L1Bridge> {
  const languageNames: Record<string, string> = {
    mandarin: "Mandarin Chinese",
    spanish: "Spanish",
    arabic: "Arabic",
    punjabi: "Punjabi",
    ukrainian: "Ukrainian",
    tagalog: "Tagalog",
    vietnamese: "Vietnamese",
    korean: "Korean",
    farsi: "Farsi/Persian",
  }

  const targetLanguage = languageNames[nativeLanguage] || nativeLanguage

  const prompt = `Create an L1 bridge for this English text to help a ${targetLanguage}-speaking ESL student understand it better.

Text: ${text}

Bridge type: ${bridgeType}

${bridgeType === "full-translation" ? "Provide a full translation." : ""}
${bridgeType === "key-terms" ? "Identify 5-8 key terms and translate them." : ""}
${bridgeType === "concept-explanation" ? "Explain the main concepts using the student's native language as a bridge." : ""}

Also note any cultural considerations or helpful cognates.`

  try {
    const result = await generateTextCompletion({ prompt })
    
    // Parse the response to extract key terms
    const keyTermsMatch = result.text.match(/(\w+)\s*[-–:]\s*([^\n,]+)/g) || []
    const keyTerms = keyTermsMatch.slice(0, 8).map(match => {
      const parts = match.split(/[-–:]/)
      return {
        english: parts[0]?.trim() || "",
        translation: parts[1]?.trim() || "",
      }
    })

    return {
      originalText: text,
      keyTerms: keyTerms.length > 0 ? keyTerms : [
        { english: "text", translation: "translated text" }
      ],
      conceptExplanation: bridgeType === "concept-explanation" ? result.text : undefined,
      culturalNotes: [],
    }
  } catch {
    // Fallback mock bridge
    return {
      originalText: text,
      keyTerms: [
        { english: "example", translation: "[translation]" },
      ],
      culturalNotes: ["Translation service unavailable - using fallback"],
    }
  }
}

// ============================================================================
// Sentence Frame Generator
// ============================================================================

export interface SentenceFrame {
  pattern: string
  example: string
  purpose: string
  elpaLevel: number
}

/**
 * Generate sentence frames for a topic at the appropriate ELPA level
 */
export function generateSentenceFrames(
  topic: string,
  elpaLevel: number,
  count: number = 5
): SentenceFrame[] {
  const framesByLevel: Record<number, SentenceFrame[]> = {
    1: [
      { pattern: "I see a ____.", example: "I see a cat.", purpose: "Observation", elpaLevel: 1 },
      { pattern: "This is a ____.", example: "This is a book.", purpose: "Identification", elpaLevel: 1 },
      { pattern: "I like ____.", example: "I like apples.", purpose: "Preference", elpaLevel: 1 },
      { pattern: "The ____ is ____.", example: "The dog is big.", purpose: "Description", elpaLevel: 1 },
    ],
    2: [
      { pattern: "I think ____ because ____.", example: "I think it will rain because I see clouds.", purpose: "Reasoning", elpaLevel: 2 },
      { pattern: "First, ____. Then, ____.", example: "First, mix the flour. Then, add water.", purpose: "Sequence", elpaLevel: 2 },
      { pattern: "____ is similar to ____ because ____.", example: "A cat is similar to a lion because they both have fur.", purpose: "Comparison", elpaLevel: 2 },
    ],
    3: [
      { pattern: "Based on ____, I believe ____.", example: "Based on the evidence, I believe the hypothesis is correct.", purpose: "Evidence-based reasoning", elpaLevel: 3 },
      { pattern: "The main idea is ____, which is supported by ____.", example: "The main idea is conservation, which is supported by the recycling statistics.", purpose: "Main idea identification", elpaLevel: 3 },
      { pattern: "Although ____, it is important to consider ____.", example: "Although the experiment failed, it is important to consider what we learned.", purpose: "Counterargument", elpaLevel: 3 },
    ],
    4: [
      { pattern: "The evidence suggests that ____, however, ____.", example: "The evidence suggests that climate change is accelerating, however, mitigation efforts are increasing.", purpose: "Complex analysis", elpaLevel: 4 },
      { pattern: "When comparing ____ and ____, one notable difference is ____.", example: "When comparing democracy and monarchy, one notable difference is how leaders are chosen.", purpose: "Analytical comparison", elpaLevel: 4 },
    ],
    5: [
      { pattern: "The interplay between ____ and ____ demonstrates ____.", example: "The interplay between economic and social factors demonstrates the complexity of urban development.", purpose: "Synthesis", elpaLevel: 5 },
      { pattern: "Critical analysis of ____ reveals ____.", example: "Critical analysis of the primary sources reveals bias in historical accounts.", purpose: "Critical analysis", elpaLevel: 5 },
    ],
  }

  const frames = framesByLevel[elpaLevel] || framesByLevel[3]
  return frames.slice(0, count)
}

export default {
  analyzeReadability,
  adjustContentToLevel,
  extractVocabulary,
  generateL1Bridge,
  generateSentenceFrames,
}
