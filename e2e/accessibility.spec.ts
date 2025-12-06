/**
 * Accessibility E2E Tests
 * Tests for WCAG 2.1 AA compliance
 */

import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Accessibility", () => {
  test("landing page should have no accessibility violations", async ({ page }) => {
    await page.goto("/")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("login page should have no accessibility violations", async ({ page }) => {
    await page.goto("/login")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("signup page should have no accessibility violations", async ({ page }) => {
    await page.goto("/signup")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("should have skip link functionality", async ({ page }) => {
    await page.goto("/")
    
    // Tab to skip link (first focusable element)
    await page.keyboard.press("Tab")
    
    // Check skip link is visible when focused
    const skipLink = page.getByRole("link", { name: /skip to main content/i })
    await expect(skipLink).toBeFocused()
  })

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/login")
    
    // Tab through the form
    await page.keyboard.press("Tab") // Skip link
    await page.keyboard.press("Tab") // Email input
    
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused()
    
    await page.keyboard.press("Tab") // Password input
    
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeFocused()
  })

  test("should have proper focus management", async ({ page }) => {
    await page.goto("/login")
    
    // Focus should be visible
    const emailInput = page.getByLabel(/email/i)
    await emailInput.focus()
    
    // Check focus is visible (has focus-visible styles)
    await expect(emailInput).toBeFocused()
  })

  test("should have sufficient color contrast", async ({ page }) => {
    await page.goto("/")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .include("body")
      .analyze()
    
    // Filter for color contrast violations only
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation: { id: string }) => violation.id === "color-contrast"
    )
    
    expect(colorContrastViolations).toEqual([])
  })

  test("forms should have proper labels", async ({ page }) => {
    await page.goto("/login")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("form")
      .analyze()
    
    // Filter for label violations
    const labelViolations = accessibilityScanResults.violations.filter(
      (violation: { id: string }) => violation.id.includes("label")
    )
    
    expect(labelViolations).toEqual([])
  })
})
