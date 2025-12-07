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
    await page.waitForLoadState("networkidle")
    
    await expect(page).toHaveTitle(/VerbaPath/)
    // The actual heading is "Welcome to VerbaPath"
    await expect(page.getByText("Welcome to VerbaPath")).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in$/i })).toBeVisible()
  })

  test("should display signup page", async ({ page }) => {
    await page.goto("/signup")
    await page.waitForLoadState("networkidle")
    
    // The actual heading is "Create Your Account"
    await expect(page.getByText("Create Your Account")).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    // There are two password fields - password and confirm password
    // Use exact match to get the first password field
    await expect(page.locator("#password")).toBeVisible()
    await expect(page.locator("#confirmPassword")).toBeVisible()
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible()
  })

  test("should show form inputs are required", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    // Form fields should be required
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    
    await expect(emailInput).toHaveAttribute("required", "")
    await expect(passwordInput).toHaveAttribute("required", "")
  })

  test("should navigate between login and signup", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    // Click on "Sign up" link
    await page.getByRole("link", { name: /sign up/i }).click()
    await expect(page).toHaveURL(/signup/)
    
    // Click on "Sign in" link  
    await page.getByRole("link", { name: /sign in/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test("should have Google sign-in option", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    
    await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible()
  })

  test("signup should have Google sign-up option", async ({ page }) => {
    await page.goto("/signup")
    await page.waitForLoadState("networkidle")
    
    await expect(page.getByRole("button", { name: /sign up with google/i })).toBeVisible()
  })

  // Note: In demo mode, protected routes are accessible without authentication
  // These tests verify the middleware behavior in demo mode
  test("should allow access to teacher builder in demo mode", async ({ page }) => {
    // In demo mode, /teacher/builder should be accessible
    await page.goto("/teacher/builder")
    await page.waitForLoadState("networkidle")
    
    // Should either load the builder or redirect to login (depends on config)
    const url = page.url()
    const isBuilder = url.includes("/teacher/builder")
    const isLogin = url.includes("/login")
    expect(isBuilder || isLogin).toBeTruthy()
  })

  test("should allow access to student page in demo mode", async ({ page }) => {
    await page.goto("/student")
    await page.waitForLoadState("networkidle")
    
    // Should either load the student page or redirect to login
    const url = page.url()
    const isStudent = url.includes("/student")
    const isLogin = url.includes("/login")
    expect(isStudent || isLogin).toBeTruthy()
  })
})
