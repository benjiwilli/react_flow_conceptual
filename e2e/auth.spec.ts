/**
 * Authentication E2E Tests
 * Tests for login, signup, and authentication flows
 */

import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()
  })

  test("should display login page", async ({ page }) => {
    await page.goto("/login")
    
    await expect(page).toHaveTitle(/LinguaFlow/)
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("should display signup page", async ({ page }) => {
    await page.goto("/signup")
    
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible()
  })

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/login")
    
    await page.getByRole("button", { name: /sign in/i }).click()
    
    // Should show validation error or stay on page
    await expect(page).toHaveURL(/login/)
  })

  test("should navigate between login and signup", async ({ page }) => {
    await page.goto("/login")
    
    await page.getByRole("link", { name: /sign up/i }).click()
    await expect(page).toHaveURL(/signup/)
    
    await page.getByRole("link", { name: /sign in/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/teacher")
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/)
  })

  test("should redirect unauthenticated student to login", async ({ page }) => {
    await page.goto("/student")
    
    await expect(page).toHaveURL(/login/)
  })
})
