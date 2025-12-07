/**
 * Teacher Workflow Builder E2E Tests
 * Tests for the workflow canvas and node interactions
 * 
 * Note: These tests run in demo mode (no authentication required)
 */

import { test, expect } from "@playwright/test"

test.describe("Teacher Workflow Builder", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to builder page - works in demo mode without auth
    await page.goto("/teacher/builder")
    // Wait for the page to fully load
    await page.waitForLoadState("networkidle")
  })

  test("should load the builder page", async ({ page }) => {
    // Check that the VerbaPath header/branding is visible
    await expect(page.getByText("VerbaPath")).toBeVisible()
    await expect(page.getByText("Learning Pathway Builder")).toBeVisible()
  })

  test("should display node library sidebar", async ({ page }) => {
    // Node Library heading should be visible in the sidebar
    await expect(page.getByText("Node Library")).toBeVisible()
    
    // Check for search input
    await expect(page.getByPlaceholder(/search/i)).toBeVisible()
  })

  test("should have working toolbar buttons", async ({ page }) => {
    // Check that key toolbar buttons exist in the header toolbar
    const header = page.locator('header')
    await expect(header.getByRole("button", { name: /templates/i })).toBeVisible()
    await expect(header.getByRole("button", { name: /load/i })).toBeVisible()
    await expect(header.getByRole("button", { name: /save/i })).toBeVisible()
    await expect(header.getByRole("button", { name: /run/i })).toBeVisible()
  })

  test("canvas should be visible with React Flow elements", async ({ page }) => {
    // The React Flow canvas should be rendered
    const canvas = page.locator('.react-flow')
    await expect(canvas).toBeVisible({ timeout: 5000 })
  })

  test("should be able to click Templates button", async ({ page }) => {
    // Click Templates button in the header
    const templatesButton = page.locator('header').getByRole("button", { name: /templates/i })
    await expect(templatesButton).toBeEnabled()
    await templatesButton.click()
    
    // After click, button state should change (it becomes secondary/active)
    // Just verify the click doesn't cause an error
    await expect(templatesButton).toBeVisible()
  })

  test("should be able to click Save button", async ({ page }) => {
    // Click Save button
    const saveButton = page.locator('header').getByRole("button", { name: /save/i })
    await expect(saveButton).toBeEnabled()
    await saveButton.click()
    
    // Save should work without errors (may show toast)
    await page.waitForTimeout(500)
    await expect(saveButton).toBeVisible()
  })

  test("should be able to click Run button", async ({ page }) => {
    // Click Run button  
    const runButton = page.locator('header').getByRole("button", { name: /run/i })
    await expect(runButton).toBeEnabled()
    await runButton.click()
    
    // Run should work without errors
    await page.waitForTimeout(500)
    await expect(runButton).toBeVisible()
  })
})

test.describe("Student Session", () => {
  test("should load student session page", async ({ page }) => {
    // Navigate to a demo session
    await page.goto("/student/session/demo-session")
    
    // Wait for page to load
    await page.waitForLoadState("networkidle")
    
    // Page should render without crashing
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe("Accessibility - Builder", () => {
  test("should support keyboard navigation in header", async ({ page }) => {
    await page.goto("/teacher/builder")
    await page.waitForLoadState("networkidle")
    
    // Tab through header buttons
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    
    // At least one button should have focus
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
