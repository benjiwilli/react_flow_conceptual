/**
 * Jest Configuration for LinguaFlow
 * Unit and integration testing setup with React Testing Library
 */

const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
})

/** @type {import('jest').Config} */
const customJestConfig = {
  // Setup files to run after jest is initialized
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  
  // Test environment
  testEnvironment: "jsdom",
  
  // Module path aliases (match tsconfig paths)
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/contexts/(.*)$": "<rootDir>/contexts/$1",
    "^@/types/(.*)$": "<rootDir>/types/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
  
  // Test patterns
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/", // Playwright tests
    "<rootDir>/__tests__/helpers/", // Test utilities, not tests
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "contexts/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
  ],
  
  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  
  // Verbose output
  verbose: true,
  
  // Max workers for CI environments
  maxWorkers: process.env.CI ? 2 : "50%",
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig)
