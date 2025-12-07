/**
 * Test Utilities for VerbaPath
 * Custom render functions and test helpers
 */

import React, { ReactElement } from "react"
import { render, RenderOptions } from "@testing-library/react"

// Import providers
import { ThemeProvider } from "@/components/theme-provider"

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

// Mock user data for testing
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
  },
}

export const mockTeacherProfile = {
  id: "test-user-id",
  email: "teacher@school.com",
  full_name: "Test Teacher",
  role: "teacher" as const,
  school_name: "Test School",
  grade_levels: ["3", "4", "5"],
  esl_certification: "TESL",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockStudentProfile = {
  id: "test-student-id",
  email: "student@school.com",
  full_name: "Test Student",
  role: "student" as const,
  grade: "4",
  elpa_level: 2,
  teacher_id: "test-user-id",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// All the providers wrapper
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing-library
export * from "@testing-library/react"
export { customRender as render }

// Helper to wait for async state updates
export const waitForStateUpdate = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

// Helper to create a mock workflow
export const createMockWorkflow = (overrides = {}) => ({
  id: "test-workflow-id",
  name: "Test Workflow",
  description: "A test workflow",
  nodes: [],
  edges: [],
  metadata: {
    grade_level: "4",
    elpa_levels: [1, 2, 3],
    subject_area: "reading",
    estimated_duration: 15,
    curriculum_tags: ["vocabulary"],
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Helper to create mock node data
export const createMockNode = (type: string, overrides = {}) => ({
  id: `node-${Math.random().toString(36).substr(2, 9)}`,
  type,
  position: { x: 100, y: 100 },
  data: {
    label: `Test ${type} Node`,
    ...overrides,
  },
})

// Accessibility test helper using jest-axe
export { toHaveNoViolations } from "jest-axe"
import { configureAxe, toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

export const axe = configureAxe({
  rules: {
    // Disable some rules that may cause false positives in test environment
    region: { enabled: false },
  },
})
