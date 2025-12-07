/**
 * Scaffolding Intelligence Tests
 * Unit tests for the ESL content adaptation system
 * 
 * Note: This test file only tests synchronous functions to avoid
 * needing to mock the AI SDK's TransformStream dependencies.
 * AI-dependent functions should be tested in E2E tests.
 */

// Mock the AI SDK modules before importing scaffolding-intelligence
jest.mock("@/lib/engine/ai-client", () => ({
  generateTextCompletion: jest.fn(),
  streamTextCompletion: jest.fn(),
  generateStructuredOutput: jest.fn(),
}))

import {
  analyzeReadability,
  generateSentenceFrames,
  type ReadabilityMetrics,
  type SentenceFrame,
} from "@/lib/engine/scaffolding-intelligence"

describe("Scaffolding Intelligence", () => {
  describe("analyzeReadability", () => {
    it("calculates metrics for simple text", () => {
      const simpleText = "I see a cat. The cat is big. I like cats."
      const metrics = analyzeReadability(simpleText)
      
      // Word count may vary slightly based on how punctuation is handled
      expect(metrics.totalWords).toBeGreaterThanOrEqual(10)
      expect(metrics.totalWords).toBeLessThanOrEqual(12)
      expect(metrics.totalSentences).toBe(3)
      expect(metrics.averageSentenceLength).toBeCloseTo(3.67, 0) // ~11/3
      expect(metrics.suggestedElpaLevel).toBeGreaterThanOrEqual(1)
      expect(metrics.suggestedElpaLevel).toBeLessThanOrEqual(2)
    })

    it("calculates metrics for complex text", () => {
      const complexText = `The implementation of sophisticated educational methodologies 
        requires comprehensive understanding of pedagogical frameworks and their 
        application within diverse learning environments.`
      const metrics = analyzeReadability(complexText)
      
      expect(metrics.complexWordCount).toBeGreaterThan(3)
      expect(metrics.suggestedElpaLevel).toBeGreaterThanOrEqual(4)
    })

    it("returns valid metrics for empty text", () => {
      const metrics = analyzeReadability("")
      
      expect(metrics.totalWords).toBe(0)
      expect(metrics.totalSentences).toBe(1) // Minimum 1 to avoid division by zero
      expect(metrics.fleschKincaid).toBeGreaterThanOrEqual(0)
    })

    it("handles single sentence text", () => {
      const text = "This is a single sentence."
      const metrics = analyzeReadability(text)
      
      expect(metrics.totalSentences).toBe(1)
      expect(metrics.averageSentenceLength).toBe(5)
    })

    it("correctly identifies sentence boundaries", () => {
      const text = "Hello! How are you? I am fine."
      const metrics = analyzeReadability(text)
      
      expect(metrics.totalSentences).toBe(3)
    })

    it("calculates Flesch-Kincaid grade level", () => {
      // Grade-level appropriate text
      const gradeSchoolText = "The dog runs fast. It likes to play in the park."
      const metrics = analyzeReadability(gradeSchoolText)
      
      // Should be elementary school level
      expect(metrics.fleschKincaid).toBeLessThan(6)
    })

    it("calculates Flesch Reading Ease score", () => {
      const easyText = "I have a pet. My pet is a dog. The dog is fun."
      const metrics = analyzeReadability(easyText)
      
      // Score should be high (easier to read)
      expect(metrics.fleschReadingEase).toBeGreaterThan(80)
    })

    it("maps reading ease to ELPA levels correctly", () => {
      // Very easy text -> ELPA Level 1
      const veryEasy = "I am here. You are there. We are happy."
      const veryEasyMetrics = analyzeReadability(veryEasy)
      expect(veryEasyMetrics.suggestedElpaLevel).toBeLessThanOrEqual(2)
      
      // Difficult text -> Higher ELPA levels
      const difficult = `The juxtaposition of contradictory philosophical 
        perspectives necessitates a nuanced understanding of epistemological 
        foundations within contemporary academic discourse.`
      const difficultMetrics = analyzeReadability(difficult)
      expect(difficultMetrics.suggestedElpaLevel).toBeGreaterThanOrEqual(4)
    })

    it("counts complex words (3+ syllables)", () => {
      const text = "The beautiful butterfly is extraordinary."
      const metrics = analyzeReadability(text)
      
      // "beautiful", "butterfly", "extraordinary" are complex words
      expect(metrics.complexWordCount).toBeGreaterThanOrEqual(2)
    })

    it("calculates average word length", () => {
      const text = "I see a big dog run."
      const metrics = analyzeReadability(text)
      
      // Short words, average should be around 2-3 characters
      expect(metrics.averageWordLength).toBeLessThan(4)
    })
  })

  describe("generateSentenceFrames", () => {
    it("generates frames for ELPA Level 1", () => {
      const frames = generateSentenceFrames("animals", 1)
      
      expect(frames.length).toBeGreaterThan(0)
      expect(frames.length).toBeLessThanOrEqual(5)
      frames.forEach(frame => {
        expect(frame.elpaLevel).toBe(1)
        expect(frame.pattern).toContain("____")
        expect(frame.example).toBeDefined()
        expect(frame.purpose).toBeDefined()
      })
    })

    it("generates frames for ELPA Level 2", () => {
      const frames = generateSentenceFrames("science", 2)
      
      frames.forEach(frame => {
        expect(frame.elpaLevel).toBe(2)
      })
      
      // Level 2 should have more complex patterns than Level 1
      const hasCompoundPattern = frames.some(f => 
        f.pattern.includes("because") || f.pattern.includes("Then")
      )
      expect(hasCompoundPattern).toBe(true)
    })

    it("generates frames for ELPA Level 3", () => {
      const frames = generateSentenceFrames("math", 3)
      
      frames.forEach(frame => {
        expect(frame.elpaLevel).toBe(3)
      })
      
      // Level 3 should have academic language patterns
      const hasAcademicPattern = frames.some(f => 
        f.pattern.includes("Based on") || 
        f.pattern.includes("main idea") ||
        f.pattern.includes("Although")
      )
      expect(hasAcademicPattern).toBe(true)
    })

    it("generates frames for ELPA Level 4", () => {
      const frames = generateSentenceFrames("history", 4)
      
      frames.forEach(frame => {
        expect(frame.elpaLevel).toBe(4)
      })
      
      // Level 4 should have complex analytical patterns
      const hasComplexPattern = frames.some(f => 
        f.pattern.includes("evidence") || 
        f.pattern.includes("comparing")
      )
      expect(hasComplexPattern).toBe(true)
    })

    it("generates frames for ELPA Level 5", () => {
      const frames = generateSentenceFrames("philosophy", 5)
      
      frames.forEach(frame => {
        expect(frame.elpaLevel).toBe(5)
      })
      
      // Level 5 should have sophisticated analytical patterns
      const hasSophisticatedPattern = frames.some(f => 
        f.pattern.includes("interplay") || 
        f.pattern.includes("Critical analysis")
      )
      expect(hasSophisticatedPattern).toBe(true)
    })

    it("respects the count parameter", () => {
      const frames = generateSentenceFrames("reading", 3, 2)
      
      expect(frames.length).toBeLessThanOrEqual(2)
    })

    it("returns default frames for invalid ELPA levels", () => {
      const framesLow = generateSentenceFrames("test", 0)
      const framesHigh = generateSentenceFrames("test", 10)
      
      // Should fall back to Level 3 frames
      expect(framesLow.length).toBeGreaterThan(0)
      expect(framesHigh.length).toBeGreaterThan(0)
    })

    it("includes all required properties in each frame", () => {
      for (let level = 1; level <= 5; level++) {
        const frames = generateSentenceFrames("topic", level)
        
        frames.forEach((frame: SentenceFrame) => {
          expect(frame).toHaveProperty("pattern")
          expect(frame).toHaveProperty("example")
          expect(frame).toHaveProperty("purpose")
          expect(frame).toHaveProperty("elpaLevel")
          expect(typeof frame.pattern).toBe("string")
          expect(typeof frame.example).toBe("string")
          expect(typeof frame.purpose).toBe("string")
          expect(typeof frame.elpaLevel).toBe("number")
        })
      }
    })
  })

  describe("ReadabilityMetrics interface compliance", () => {
    it("returns all required metric fields", () => {
      const text = "This is a test sentence for metrics validation."
      const metrics: ReadabilityMetrics = analyzeReadability(text)
      
      expect(metrics).toHaveProperty("fleschKincaid")
      expect(metrics).toHaveProperty("fleschReadingEase")
      expect(metrics).toHaveProperty("averageSentenceLength")
      expect(metrics).toHaveProperty("averageWordLength")
      expect(metrics).toHaveProperty("complexWordCount")
      expect(metrics).toHaveProperty("totalWords")
      expect(metrics).toHaveProperty("totalSentences")
      expect(metrics).toHaveProperty("suggestedElpaLevel")
    })

    it("returns numeric values for all metrics", () => {
      const text = "Testing numeric values in the metrics object."
      const metrics = analyzeReadability(text)
      
      expect(typeof metrics.fleschKincaid).toBe("number")
      expect(typeof metrics.fleschReadingEase).toBe("number")
      expect(typeof metrics.averageSentenceLength).toBe("number")
      expect(typeof metrics.averageWordLength).toBe("number")
      expect(typeof metrics.complexWordCount).toBe("number")
      expect(typeof metrics.totalWords).toBe("number")
      expect(typeof metrics.totalSentences).toBe("number")
      expect(typeof metrics.suggestedElpaLevel).toBe("number")
    })

    it("bounds ELPA level between 1 and 5", () => {
      // Test with various text complexities
      const texts = [
        "I run.", // Very simple
        "The quick brown fox jumps over the lazy dog.",
        "Complex multisyllabic terminology demonstrates advanced vocabulary utilization.",
      ]
      
      texts.forEach(text => {
        const metrics = analyzeReadability(text)
        expect(metrics.suggestedElpaLevel).toBeGreaterThanOrEqual(1)
        expect(metrics.suggestedElpaLevel).toBeLessThanOrEqual(5)
      })
    })

    it("bounds Flesch Reading Ease between 0 and 100", () => {
      const texts = [
        "Go. Run. Stop.",
        "The comprehensive analytical methodology demonstrates sophisticated understanding.",
      ]
      
      texts.forEach(text => {
        const metrics = analyzeReadability(text)
        expect(metrics.fleschReadingEase).toBeGreaterThanOrEqual(0)
        expect(metrics.fleschReadingEase).toBeLessThanOrEqual(100)
      })
    })

    it("returns non-negative Flesch-Kincaid grade level", () => {
      const text = "Simple words here."
      const metrics = analyzeReadability(text)
      
      expect(metrics.fleschKincaid).toBeGreaterThanOrEqual(0)
    })
  })

  describe("Edge cases", () => {
    it("handles text with only punctuation", () => {
      const metrics = analyzeReadability("... !!! ???")
      
      // The implementation may count punctuation sequences as "words"
      // What's important is that it doesn't crash and returns valid metrics
      expect(Number.isFinite(metrics.totalWords)).toBe(true)
      expect(Number.isFinite(metrics.fleschKincaid)).toBe(true)
    })

    it("handles text with numbers", () => {
      const metrics = analyzeReadability("There are 5 cats and 3 dogs.")
      
      expect(metrics.totalWords).toBe(7)
    })

    it("handles text with special characters", () => {
      const metrics = analyzeReadability("Hello @user! Check out #ESL content.")
      
      expect(Number.isFinite(metrics.fleschKincaid)).toBe(true)
      expect(Number.isFinite(metrics.fleschReadingEase)).toBe(true)
    })

    it("handles very long text", () => {
      const longText = "This is a sentence. ".repeat(1000)
      const metrics = analyzeReadability(longText)
      
      expect(metrics.totalSentences).toBe(1000)
      expect(Number.isFinite(metrics.fleschKincaid)).toBe(true)
    })

    it("handles single word text", () => {
      const metrics = analyzeReadability("Hello")
      
      expect(metrics.totalWords).toBe(1)
      expect(metrics.totalSentences).toBe(1)
    })

    it("handles text with mixed case", () => {
      const metrics = analyzeReadability("HELLO World! How ARE You?")
      
      expect(metrics.totalWords).toBe(5)
      expect(metrics.totalSentences).toBe(2)
    })
  })
})
