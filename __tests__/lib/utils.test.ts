/**
 * Utility Functions Tests
 * Unit tests for shared utility functions
 */

import { cn } from "@/lib/utils"

describe("cn utility", () => {
  it("merges class names correctly", () => {
    const result = cn("base-class", "additional-class")
    expect(result).toBe("base-class additional-class")
  })

  it("handles conditional classes", () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      "base",
      isActive && "active",
      isDisabled && "disabled"
    )
    
    expect(result).toBe("base active")
  })

  it("handles undefined and null values", () => {
    const result = cn("base", undefined, null, "valid")
    expect(result).toBe("base valid")
  })

  it("handles empty strings", () => {
    const result = cn("base", "", "valid")
    expect(result).toBe("base valid")
  })

  it("merges tailwind classes correctly (last wins)", () => {
    const result = cn("bg-red-500", "bg-blue-500")
    expect(result).toBe("bg-blue-500")
  })

  it("handles arrays of classes", () => {
    const result = cn(["class1", "class2"], "class3")
    expect(result).toBe("class1 class2 class3")
  })

  it("handles objects with boolean values", () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    })
    
    expect(result).toBe("base active")
  })

  it("handles complex tailwind merge scenarios", () => {
    // Test padding merge
    const result1 = cn("p-4", "px-2")
    expect(result1).toContain("px-2")
    expect(result1).toContain("p-4")
    
    // Test conflicting flex classes
    const result2 = cn("flex-row", "flex-col")
    expect(result2).toBe("flex-col")
  })

  it("returns empty string for no valid classes", () => {
    const result = cn(undefined, null, false, "")
    expect(result).toBe("")
  })
})
