/**
 * ELPA Levels Constants Tests
 * Unit tests for ELPA level definitions and utilities
 */

import {
  ELPA_LEVELS,
  getELPALevel,
  getScaffoldingForLevel,
  type ELPALevelDefinition,
} from "@/lib/constants/elpa-levels"

describe("ELPA Levels Constants", () => {
  describe("ELPA_LEVELS array", () => {
    it("contains exactly 5 levels", () => {
      expect(ELPA_LEVELS).toHaveLength(5)
    })

    it("has levels numbered 1 through 5", () => {
      const levels = ELPA_LEVELS.map(l => l.level)
      expect(levels).toEqual([1, 2, 3, 4, 5])
    })

    it("has unique level names", () => {
      const names = ELPA_LEVELS.map(l => l.name)
      const uniqueNames = [...new Set(names)]
      expect(names.length).toBe(uniqueNames.length)
    })

    it("contains expected level names", () => {
      const names = ELPA_LEVELS.map(l => l.name)
      expect(names).toContain("Beginning")
      expect(names).toContain("Developing")
      expect(names).toContain("Expanding")
      expect(names).toContain("Bridging")
      expect(names).toContain("Proficient")
    })

    it("each level has all required properties", () => {
      ELPA_LEVELS.forEach((level: ELPALevelDefinition) => {
        expect(level).toHaveProperty("level")
        expect(level).toHaveProperty("name")
        expect(level).toHaveProperty("description")
        expect(level).toHaveProperty("listening")
        expect(level).toHaveProperty("speaking")
        expect(level).toHaveProperty("reading")
        expect(level).toHaveProperty("writing")
        expect(level).toHaveProperty("typicalTimeframe")
        expect(level).toHaveProperty("instructionalFocus")
      })
    })

    it("each level has non-empty skill arrays", () => {
      ELPA_LEVELS.forEach((level: ELPALevelDefinition) => {
        expect(level.listening.length).toBeGreaterThan(0)
        expect(level.speaking.length).toBeGreaterThan(0)
        expect(level.reading.length).toBeGreaterThan(0)
        expect(level.writing.length).toBeGreaterThan(0)
        expect(level.instructionalFocus.length).toBeGreaterThan(0)
      })
    })

    it("Level 1 (Beginning) has appropriate characteristics", () => {
      const level1 = ELPA_LEVELS.find(l => l.level === 1)!
      
      expect(level1.name).toBe("Beginning")
      expect(level1.description).toContain("new to English")
      expect(level1.typicalTimeframe).toBe("0-6 months")
      expect(level1.instructionalFocus).toContain("Visual supports essential")
      expect(level1.instructionalFocus).toContain("L1 bridges encouraged")
    })

    it("Level 5 (Proficient) has appropriate characteristics", () => {
      const level5 = ELPA_LEVELS.find(l => l.level === 5)!
      
      expect(level5.name).toBe("Proficient")
      expect(level5.description).toContain("near-native proficiency")
      expect(level5.typicalTimeframe).toBe("4-7 years")
    })

    it("progression shows increasing complexity", () => {
      // Level 1 reading should be simpler than Level 5
      const level1 = ELPA_LEVELS.find(l => l.level === 1)!
      const level5 = ELPA_LEVELS.find(l => l.level === 5)!
      
      // Level 1 should mention basic skills
      expect(level1.reading.join(" ").toLowerCase()).toMatch(/recognizes|matches|reads/)
      
      // Level 5 should mention advanced skills
      expect(level5.reading.join(" ").toLowerCase()).toMatch(/analyzes|evaluates|synthesizes/)
    })
  })

  describe("getELPALevel function", () => {
    it("returns correct level for each valid input", () => {
      expect(getELPALevel(1).name).toBe("Beginning")
      expect(getELPALevel(2).name).toBe("Developing")
      expect(getELPALevel(3).name).toBe("Expanding")
      expect(getELPALevel(4).name).toBe("Bridging")
      expect(getELPALevel(5).name).toBe("Proficient")
    })

    it("returns complete level definition", () => {
      const level = getELPALevel(3)
      
      expect(level.level).toBe(3)
      expect(level.name).toBe("Expanding")
      expect(Array.isArray(level.listening)).toBe(true)
      expect(Array.isArray(level.speaking)).toBe(true)
      expect(Array.isArray(level.reading)).toBe(true)
      expect(Array.isArray(level.writing)).toBe(true)
      expect(typeof level.description).toBe("string")
      expect(typeof level.typicalTimeframe).toBe("string")
    })

    it("returns consistent results for same input", () => {
      const level1_first = getELPALevel(2)
      const level1_second = getELPALevel(2)
      
      expect(level1_first).toEqual(level1_second)
    })
  })

  describe("getScaffoldingForLevel function", () => {
    it("returns array of scaffolding strategies", () => {
      for (let level = 1; level <= 5; level++) {
        const scaffolding = getScaffoldingForLevel(level as 1 | 2 | 3 | 4 | 5)
        expect(Array.isArray(scaffolding)).toBe(true)
        expect(scaffolding.length).toBeGreaterThan(0)
      }
    })

    it("Level 1 includes visual supports and L1 translation", () => {
      const scaffolding = getScaffoldingForLevel(1)
      
      expect(scaffolding).toContain("visual-supports")
      expect(scaffolding).toContain("l1-translation")
    })

    it("Level 2 includes sentence frames", () => {
      const scaffolding = getScaffoldingForLevel(2)
      
      expect(scaffolding).toContain("sentence-frames")
      expect(scaffolding).toContain("word-banks")
    })

    it("Level 3 includes academic vocabulary support", () => {
      const scaffolding = getScaffoldingForLevel(3)
      
      expect(scaffolding).toContain("academic-vocabulary")
    })

    it("Level 4 includes critical thinking", () => {
      const scaffolding = getScaffoldingForLevel(4)
      
      expect(scaffolding).toContain("critical-thinking")
      expect(scaffolding).toContain("independent-strategies")
    })

    it("Level 5 includes advanced analysis", () => {
      const scaffolding = getScaffoldingForLevel(5)
      
      expect(scaffolding).toContain("advanced-analysis")
      expect(scaffolding).toContain("synthesis")
    })

    it("scaffolding complexity increases with level", () => {
      const level1 = getScaffoldingForLevel(1)
      const level5 = getScaffoldingForLevel(5)
      
      // Level 1 should have more basic support
      expect(level1.some(s => s.includes("visual") || s.includes("l1"))).toBe(true)
      
      // Level 5 should have more advanced support
      expect(level5.some(s => s.includes("advanced") || s.includes("synthesis"))).toBe(true)
    })
  })

  describe("Level progression validation", () => {
    it("each level builds on the previous", () => {
      // Verify that skills mentioned in higher levels assume lower level mastery
      const level1Reading = ELPA_LEVELS[0].reading.join(" ").toLowerCase()
      const level2Reading = ELPA_LEVELS[1].reading.join(" ").toLowerCase()
      const level3Reading = ELPA_LEVELS[2].reading.join(" ").toLowerCase()
      
      // Level 1: recognizes letters
      expect(level1Reading).toMatch(/letters|sounds|matches/)
      
      // Level 2: reads sentences
      expect(level2Reading).toMatch(/sentences|reads|simple/)
      
      // Level 3: engages with grade-level content
      expect(level3Reading).toMatch(/grade-level|main idea/)
    })

    it("timeframes show cumulative progression", () => {
      const timeframes = ELPA_LEVELS.map(l => l.typicalTimeframe)
      
      // Check that timeframes mention increasing durations
      expect(timeframes[0]).toContain("months")
      expect(timeframes[4]).toContain("years")
    })
  })

  describe("Type safety", () => {
    it("level property is strongly typed", () => {
      // This test verifies TypeScript typing is correct
      const level: ELPALevelDefinition = ELPA_LEVELS[0]
      const levelNumber: 1 | 2 | 3 | 4 | 5 = level.level
      
      expect([1, 2, 3, 4, 5]).toContain(levelNumber)
    })

    it("arrays contain strings", () => {
      ELPA_LEVELS.forEach(level => {
        level.listening.forEach(item => expect(typeof item).toBe("string"))
        level.speaking.forEach(item => expect(typeof item).toBe("string"))
        level.reading.forEach(item => expect(typeof item).toBe("string"))
        level.writing.forEach(item => expect(typeof item).toBe("string"))
        level.instructionalFocus.forEach(item => expect(typeof item).toBe("string"))
      })
    })
  })
})
