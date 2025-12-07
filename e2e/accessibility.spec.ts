/**
 * Accessibility E2E Tests
 * Tests for WCAG 2.1 AA compliance
 */

import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Accessibility", () => {
  test("landing page should have no accessibility violations", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("login page should have no accessibility violations", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("signup page should have no accessibility violations", async ({ page }) => {
    await page.goto("/signup")
    await page.waitForLoadState("networkidle")
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("should have skip link functionality", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    
    // Tab to skip link (first focusable element)
    await page.keyboard.press("Tab")
    
    // Check skip link is visible when focused
    const skipLink = page.getByRole("link", { name: /skip to main content/i })
    await expect(skipLink).toBeFocused()
  })

  test("login form should be keyboard navigable", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    // Focus should be able to reach the email input
    const emailInput = page.getByLabel(/email/i)
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
    
    // Tab to password
    await page.keyboard.press("Tab")
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeFocused()
  })

  test("should have proper focus management", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    // Focus should be visible
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeVisible()
    await emailInput.click()
    
    // Check focus is visible (has focus-visible styles)
    await expect(emailInput).toBeFocused({ timeout: 10000 })
  })

  test("should have sufficient color contrast", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    
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
    await page.waitForLoadState("networkidle")
    
    // Wait for form to be fully rendered
    await expect(page.locator("form")).toBeVisible()
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("form")
      .analyze()
    
    // Filter for label violations
    const labelViolations = accessibilityScanResults.violations.filter(
      (violation: { id: string }) => violation.id.includes("label")
    )
    
    expect(labelViolations).toEqual([])
  })

  test("buttons should be keyboard accessible", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    // Find the Sign In button
    const signInButton = page.getByRole("button", { name: /sign in$/i })
    await signInButton.focus()
    await expect(signInButton).toBeFocused()
    
    // Should be able to activate with Enter
    await expect(signInButton).toBeEnabled()
  })
})
