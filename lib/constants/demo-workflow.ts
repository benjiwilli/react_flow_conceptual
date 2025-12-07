/**
 * Demo Workflow
 * A simple, complete workflow for demonstration purposes
 * Used when no workflow is specified in the session URL
 */

import type { LinguaFlowWorkflow } from "@/lib/types/workflow"

export const DEMO_WORKFLOW: LinguaFlowWorkflow = {
  id: "demo-workflow",
  name: "Welcome to LinguaFlow!",
  description: "A sample learning activity demonstrating the platform's capabilities",
  nodes: [
    {
      id: "node-1",
      type: "student-profile",
      position: { x: 100, y: 200 },
      data: {
        label: "Student Profile",
        nodeType: "student-profile",
        category: "learning",
        config: {},
      },
    },
    {
      id: "node-2",
      type: "content-generator",
      position: { x: 350, y: 200 },
      data: {
        label: "Welcome Message",
        nodeType: "content-generator",
        category: "learning",
        config: {
          contentType: "passage",
          topic: "Welcome to your learning journey",
        },
      },
    },
    {
      id: "node-3",
      type: "vocabulary-builder",
      position: { x: 600, y: 100 },
      data: {
        label: "Key Vocabulary",
        nodeType: "vocabulary-builder",
        category: "learning",
        config: {
          maxWords: 3,
          includeL1: true,
          includeVisuals: true,
        },
      },
    },
    {
      id: "node-4",
      type: "comprehension-check",
      position: { x: 600, y: 300 },
      data: {
        label: "Quick Check",
        nodeType: "comprehension-check",
        category: "assessment",
        config: {
          questionCount: 2,
          passThreshold: 50,
        },
      },
    },
    {
      id: "node-5",
      type: "celebration",
      position: { x: 850, y: 200 },
      data: {
        label: "Well Done!",
        nodeType: "celebration",
        category: "output",
        config: {
          celebrationType: "confetti",
          message: "Great job completing this demo!",
        },
      },
    },
  ],
  edges: [
    { id: "edge-1-2", source: "node-1", target: "node-2" },
    { id: "edge-2-3", source: "node-2", target: "node-3" },
    { id: "edge-2-4", source: "node-2", target: "node-4" },
    { id: "edge-3-5", source: "node-3", target: "node-5" },
    { id: "edge-4-5", source: "node-4", target: "node-5" },
  ],
  targetGrades: ["3", "4", "5", "6"],
  targetELPALevels: [1, 2, 3, 4, 5],
  curriculumOutcomes: [],
  estimatedDuration: 5,
  createdBy: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
  isTemplate: true,
  category: "custom",
}

/**
 * Demo student profile for testing
 */
export const DEMO_STUDENT = {
  id: "demo-student",
  firstName: "Demo",
  lastName: "Student",
  gradeLevel: "4" as const,
  nativeLanguage: "mandarin" as const,
  additionalLanguages: [],
  elpaLevel: 3 as const,
  literacyLevel: 3,
  numeracyLevel: 3,
  learningStyles: ["visual"],
  interests: ["math", "stories", "science"],
  culturalBackground: "",
  accommodations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  schoolId: "demo-school",
  teacherId: "demo-teacher",
}
