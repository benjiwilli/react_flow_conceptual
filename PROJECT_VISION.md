# LinguaFlow: AI-Powered ESL Learning Orchestrator for Alberta K-12

## Executive Summary

LinguaFlow transforms the existing React Flow node-based workflow builder into a specialized **AI Agent Orchestration Platform** designed specifically for **English as a Second Language (ESL) students in Alberta's K-12 education system**. The platform enables educators to create personalized, adaptive learning pathways that connect multiple AI models to deliver scaffolded literacy and numeracy instruction tailored to each student's proficiency level, native language, and cultural context.

---

## Project Vision

### The Problem

Alberta's K-12 classrooms serve increasingly diverse student populations with varying English Language Proficiency Assessment (ELPA) levels. Teachers face the impossible task of differentiating instruction for 25-30 students, each requiring:
- Different levels of language scaffolding
- First-language (L1) bridges for concept understanding
- Culturally relevant content and examples
- Adaptive pacing based on comprehension
- Support at the intersection of literacy AND numeracy (math word problems are particularly challenging)

Current solutions are either too generic (one-size-fits-all AI tutors) or too labor-intensive (manual differentiation for each student).

### The Solution

LinguaFlow provides a **visual workflow builder** where educators design "Learning Pathways" - chains of AI-powered nodes that automatically adapt content to each student's profile. A single pathway can serve an entire classroom, with personalization happening automatically at runtime.

**Example Workflow: "Math Word Problem Decoder"**
\`\`\`
Student Profile → Curriculum Selector → Problem Generator → L1 Bridge 
    → Visual Math Builder → Scaffolded Solution → Practice Generator → Progress Tracker
\`\`\`

This single workflow, designed once by a teacher, automatically:
1. Generates grade-appropriate word problems aligned to Alberta curriculum
2. Translates key concepts through the student's native language
3. Provides visual representations based on proficiency level
4. Scaffolds solution steps with language support
5. Creates practice problems at the right difficulty
6. Tracks progress over time

---

## Target Users

### Primary: Alberta K-12 Educators
- ESL/ELL specialists
- Classroom teachers with diverse learners
- Learning coaches and instructional designers
- Educational assistants supporting ESL students

### Secondary: Students (Simplified Interface)
- Students in grades K-12 with ELPA levels 1-5
- Primary L1 languages: Mandarin, Punjabi, Arabic, Spanish, Tagalog, Ukrainian, Filipino, Vietnamese, Korean, Farsi

### Tertiary: Administrators
- School and district ESL coordinators
- Curriculum developers
- Assessment specialists

---

## Core Design Principles

### 1. Asset-Based Language Philosophy
Students' first languages are **assets, not deficits**. The platform explicitly uses L1 as a bridge to English comprehension, honoring linguistic diversity while building English proficiency.

### 2. Krashen's i+1 Comprehensible Input
All content is automatically adjusted to be one level above the student's current proficiency - challenging enough to promote growth, accessible enough to maintain confidence.

### 3. Alberta Curriculum Alignment
Every learning pathway maps directly to Alberta's Programs of Study outcomes and ESL Benchmarks, ensuring instructional relevance.

### 4. Teacher as Designer, AI as Differentiator
Teachers bring pedagogical expertise to design learning pathways; AI handles the heavy lifting of personalization at scale.

### 5. Transparent AI
Students see AI as a learning partner. The system explains its scaffolding decisions in student-friendly language.

---

## System Architecture Overview

### Current Codebase Foundation

The existing React Flow implementation provides:

\`\`\`
/components
  /nodes
    input-node.tsx       → Will become StudentProfileNode
    output-node.tsx      → Will become ProgressOutputNode
    process-node.tsx     → Will become ScaffoldingNode
    conditional-node.tsx → Will become ProficiencyRouterNode
    code-node.tsx        → Will become CustomLogicNode
  workflow-builder.tsx   → Main canvas (needs UI/UX overhaul)
  node-library.tsx       → Sidebar for dragging nodes
  node-config-panel.tsx  → Right panel for node settings
  custom-edge.tsx        → Connection lines between nodes
/lib
  types.ts              → Type definitions (needs major expansion)
  workflow-utils.ts     → Node creation utilities
\`\`\`

### Target Architecture

\`\`\`
/app
  /page.tsx                        → Landing/Dashboard
  /builder/page.tsx                → Workflow Builder (Teacher Mode)
  /student/[sessionId]/page.tsx    → Student Learning Interface
  /classroom/[classId]/page.tsx    → Classroom Dashboard
  /api
    /execute/route.ts              → Workflow Execution Engine
    /ai/route.ts                   → AI Model Gateway
    /students/route.ts             → Student Profile Management
    /progress/route.ts             → Progress Tracking

/components
  /nodes
    /learning                      → ESL-Specific Learning Nodes
      student-profile-node.tsx
      curriculum-selector-node.tsx
      content-generator-node.tsx
      scaffolding-node.tsx
      l1-bridge-node.tsx
      vocabulary-builder-node.tsx
      oral-practice-node.tsx
      comprehension-check-node.tsx
      progress-tracker-node.tsx
    /ai                            → AI Model Nodes
      ai-model-node.tsx
      prompt-template-node.tsx
      structured-output-node.tsx
    /data                          → Data Flow Nodes
      merge-node.tsx
      router-node.tsx
      loop-node.tsx
      variable-node.tsx
    /interaction                   → User Interaction Nodes
      human-input-node.tsx
      voice-input-node.tsx
      multiple-choice-node.tsx
      free-response-node.tsx
  /builder
    workflow-canvas.tsx            → Enhanced React Flow canvas
    node-palette.tsx               → Categorized node library
    node-inspector.tsx             → Detailed node configuration
    execution-panel.tsx            → Real-time execution logs
    preview-panel.tsx              → Student view preview
  /student
    learning-interface.tsx         → Simplified student UI
    voice-recorder.tsx             → Speech input component
    visual-feedback.tsx            → Progress animations
  /classroom
    student-grid.tsx               → Real-time class progress
    analytics-dashboard.tsx        → Learning analytics

/lib
  /types
    nodes.ts                       → Node type definitions
    student.ts                     → Student profile types
    curriculum.ts                  → Alberta curriculum types
    execution.ts                   → Workflow execution types
  /execution
    engine.ts                      → Graph traversal & execution
    ai-client.ts                   → AI SDK integration
    streaming.ts                   → Real-time streaming support
  /curriculum
    alberta-standards.ts           → Programs of Study data
    elpa-levels.ts                 → ELPA benchmark definitions
  /i18n
    translations.ts                → L1 language support
    language-bridge.ts             → Concept translation utilities

/hooks
  use-workflow-execution.ts        → Execution state management
  use-student-session.ts           → Student session management
  use-voice-input.ts               → Speech recognition
  use-real-time-sync.ts            → Classroom sync
\`\`\`

---

## Node Type Specifications

### Category 1: Student & Context Nodes

#### StudentProfileNode
**Purpose:** Entry point that captures student identity and context
**Inputs:** None (starting node)
**Outputs:** StudentContext object
**Configuration:**
- Student name or anonymous ID
- Grade level (K-12)
- ELPA proficiency level (1-5)
- Primary language (dropdown with common Alberta ESL languages)
- Secondary languages
- Interests/topics for engagement
- Accessibility needs (visual, audio, motor)
- Learning preferences
**Behavior:** Flows student context to all downstream nodes for personalization

\`\`\`typescript
interface StudentContext {
  id: string
  gradeLevel: number // 0-12 (0 = Kindergarten)
  elpaLevel: 1 | 2 | 3 | 4 | 5
  primaryLanguage: LanguageCode
  secondaryLanguages: LanguageCode[]
  interests: string[]
  accessibilityNeeds: AccessibilityOptions
  previousSessionData?: SessionHistory
}
\`\`\`

#### CurriculumSelectorNode
**Purpose:** Selects learning objectives from Alberta curriculum
**Inputs:** StudentContext
**Outputs:** CurriculumObjective[]
**Configuration:**
- Subject area (ELA, Mathematics, Science, Social Studies)
- Strand/Outcome selector (hierarchical based on Programs of Study)
- Difficulty adjustment (+/- from grade level)
- Cross-curricular connections toggle
**Behavior:** Filters appropriate curriculum objectives based on student grade and proficiency

### Category 2: Content Generation Nodes

#### ContentGeneratorNode
**Purpose:** Creates instructional content using AI
**Inputs:** StudentContext, CurriculumObjective
**Outputs:** GeneratedContent
**Configuration:**
- Content type (passage, story, explanation, example, problem)
- Length (short/medium/long or word count)
- Complexity level (auto from ELPA or manual override)
- Include visuals toggle
- Cultural relevance settings
**AI Behavior:** Uses student context to generate content at i+1 level

#### MathProblemGeneratorNode
**Purpose:** Creates math word problems with linguistic scaffolding
**Inputs:** StudentContext, MathObjective
**Outputs:** MathProblem with scaffolds
**Configuration:**
- Problem type (addition, subtraction, multiplication, etc.)
- Number range
- Context/theme (aligned to student interests)
- Scaffold level (none, vocabulary only, sentence starters, full support)
**Behavior:** Generates culturally relevant problems with language support

#### VocabularyBuilderNode
**Purpose:** Extracts and teaches key vocabulary
**Inputs:** Content (text)
**Outputs:** VocabularySet with L1 translations
**Configuration:**
- Max words to extract
- Include L1 translations
- Include visual representations
- Include audio pronunciation
- Word type filter (nouns, verbs, academic vocabulary)
**AI Behavior:** Identifies challenging vocabulary and generates multi-modal supports

### Category 3: Scaffolding & Adaptation Nodes

#### ScaffoldingNode
**Purpose:** Adjusts content complexity based on proficiency
**Inputs:** RawContent, StudentContext
**Outputs:** ScaffoldedContent
**Configuration:**
- Scaffolding type (simplify, add supports, enrich)
- Scaffold elements (sentence starters, word banks, graphic organizers)
- Preserve meaning threshold
**AI Behavior:** Rewrites content to target i+1 level while preserving learning objectives

#### L1BridgeNode
**Purpose:** Provides first-language support for concept understanding
**Inputs:** Content, StudentContext.primaryLanguage
**Outputs:** BilingualContent
**Configuration:**
- Bridge type (full translation, key terms only, concept explanation)
- Display mode (side-by-side, hover, toggle)
- Languages to support (based on classroom demographics)
**AI Behavior:** Translates with cultural context, not just literal translation

#### VisualSupportNode
**Purpose:** Generates or attaches visual representations
**Inputs:** Content
**Outputs:** VisuallyEnhancedContent
**Configuration:**
- Visual type (diagram, illustration, photo, graphic organizer)
- Generation method (AI-generated, placeholder, linked image)
- Alt text requirements
**Behavior:** Creates visual scaffolds for comprehension

### Category 4: Interaction Nodes

#### HumanInputNode
**Purpose:** Pauses workflow for student response
**Inputs:** Prompt, InputType
**Outputs:** StudentResponse
**Configuration:**
- Input type (text, voice, multiple choice, drawing)
- Time limit (optional)
- Retry allowed
- Hint availability
**Behavior:** Renders appropriate input interface and waits for response

#### VoiceInputNode
**Purpose:** Captures and processes spoken input
**Inputs:** Prompt, ExpectedPatterns
**Outputs:** TranscribedText, PronunciationAnalysis
**Configuration:**
- Language expected (English, L1, or mixed)
- Pronunciation feedback enabled
- Model audio playback option
**Behavior:** Uses speech-to-text with pronunciation analysis

#### ComprehensionCheckNode
**Purpose:** Assesses understanding before proceeding
**Inputs:** Content, StudentContext
**Outputs:** ComprehensionResult, NextAction
**Configuration:**
- Question count
- Question types (literal, inferential, vocabulary)
- Pass threshold
- Remediation path (if below threshold)
**AI Behavior:** Generates comprehension questions at appropriate level

### Category 5: Routing & Control Flow Nodes

#### ProficiencyRouterNode
**Purpose:** Routes students to different paths based on demonstrated ability
**Inputs:** AssessmentResult, StudentContext
**Outputs:** Multiple paths (e.g., "Needs Support", "On Track", "Ready to Advance")
**Configuration:**
- Routing criteria
- Path labels
- Default path
**Behavior:** Conditional branching based on student performance

#### LoopNode
**Purpose:** Repeats a section of workflow (e.g., practice problems)
**Inputs:** Items to iterate, BodyNodes
**Outputs:** AggregatedResults
**Configuration:**
- Loop type (count-based, until-success, until-mastery)
- Exit conditions
- Max iterations
**Behavior:** Executes sub-workflow for each item or until condition met

#### MergeNode
**Purpose:** Combines outputs from multiple branches
**Inputs:** Multiple inputs
**Outputs:** Combined output
**Configuration:**
- Merge strategy (concatenate, select best, aggregate)
**Behavior:** Joins parallel execution paths

### Category 6: Output & Progress Nodes

#### ProgressTrackerNode
**Purpose:** Records student progress and learning data
**Inputs:** SessionData, AssessmentResults
**Outputs:** ProgressReport
**Configuration:**
- Metrics to track
- Database connection
- Report format
**Behavior:** Persists learning data for longitudinal tracking

#### FeedbackNode
**Purpose:** Provides encouraging, constructive feedback
**Inputs:** StudentResponse, CorrectAnswer, StudentContext
**Outputs:** Feedback message
**Configuration:**
- Feedback style (encouraging, corrective, explanatory)
- Include correct answer
- Cultural tone adjustment
**AI Behavior:** Generates personalized, culturally appropriate feedback

#### CelebrationNode
**Purpose:** Marks achievement and maintains motivation
**Inputs:** MilestoneReached
**Outputs:** Celebration display
**Configuration:**
- Celebration type (animation, badge, message)
- Milestone definitions
**Behavior:** Triggers positive reinforcement

### Category 7: AI Model Nodes

#### AIModelNode
**Purpose:** Core AI inference node with model selection
**Inputs:** Prompt, Context
**Outputs:** AIResponse
**Configuration:**
- Model provider (OpenAI, Anthropic, Google, local)
- Model name (gpt-4, claude-3, etc.)
- Temperature
- Max tokens
- System prompt
- Structured output schema (optional)
**Behavior:** Executes AI inference with selected model

#### PromptTemplateNode
**Purpose:** Constructs prompts with variable interpolation
**Inputs:** Variables from upstream nodes
**Outputs:** Constructed prompt string
**Configuration:**
- Template text with {{variable}} syntax
- Variable mappings
- Conditional sections
**Behavior:** Builds dynamic prompts from workflow context

---

## Workflow Execution Engine

### Execution Model

The workflow executes as a **directed acyclic graph (DAG)** with support for:
- **Sequential execution:** Nodes run in topological order
- **Parallel branches:** Independent paths execute concurrently
- **Conditional branching:** Router nodes direct flow based on conditions
- **Loops:** Repeat sections with loop nodes
- **Streaming:** AI responses stream in real-time to the UI

### Execution State Machine

\`\`\`typescript
type ExecutionState = 
  | { status: 'idle' }
  | { status: 'running', currentNodeId: string, progress: number }
  | { status: 'waiting_for_input', nodeId: string, inputType: InputType }
  | { status: 'paused', resumeData: ResumeContext }
  | { status: 'completed', results: ExecutionResults }
  | { status: 'error', error: ExecutionError, failedNodeId: string }
\`\`\`

### Engine Implementation

\`\`\`typescript
// lib/execution/engine.ts

interface ExecutionEngine {
  // Start workflow execution
  execute(workflow: Workflow, studentContext: StudentContext): Promise<ExecutionResult>
  
  // Pause execution (for human input nodes)
  pause(executionId: string): Promise<PauseState>
  
  // Resume after pause
  resume(executionId: string, input: UserInput): Promise<ExecutionResult>
  
  // Subscribe to execution events
  onNodeStart(callback: (nodeId: string) => void): void
  onNodeComplete(callback: (nodeId: string, output: any) => void): void
  onStream(callback: (nodeId: string, chunk: string) => void): void
  onError(callback: (nodeId: string, error: Error) => void): void
}
\`\`\`

### AI SDK Integration

All AI interactions use the Vercel AI SDK for:
- Multi-provider support (OpenAI, Anthropic, Google, etc.)
- Streaming responses
- Structured output with Zod schemas
- Tool calling for advanced agents

\`\`\`typescript
// lib/execution/ai-client.ts
import { generateText, streamText, generateObject } from 'ai'

async function executeAINode(node: AIModelNode, context: ExecutionContext) {
  const model = node.data.model // e.g., "openai/gpt-4o"
  
  if (node.data.streaming) {
    const result = await streamText({
      model,
      prompt: node.data.prompt,
      system: buildSystemPrompt(context.studentContext),
    })
    return result.textStream
  }
  
  if (node.data.structuredOutput) {
    return generateObject({
      model,
      prompt: node.data.prompt,
      schema: node.data.outputSchema,
    })
  }
  
  return generateText({ model, prompt: node.data.prompt })
}
\`\`\`

---

## User Interface Design

### Teacher Mode: Workflow Builder

#### Layout
\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│ LinguaFlow                                    [Preview] [Save] [Share]  │
├──────────────┬──────────────────────────────────────────┬───────────────┤
│              │                                          │               │
│  NODE        │                                          │  INSPECTOR    │
│  PALETTE     │          WORKFLOW CANVAS                 │               │
│              │                                          │  [Node Config]│
│  [Learning]  │   ┌─────┐      ┌─────┐      ┌─────┐     │               │
│  [AI Models] │   │Start│──────│ AI  │──────│Check│     │  Properties   │
│  [Data Flow] │   └─────┘      └─────┘      └─────┘     │  Connections  │
│  [Interact]  │                                          │  Execution    │
│              │                                          │               │
├──────────────┴──────────────────────────────────────────┴───────────────┤
│ EXECUTION LOG                                              [Run] [Debug]│
│ > Student Profile loaded (ELPA Level 3, Mandarin L1)                    │
│ > Generating content at Grade 4 level...                                │
│ > Content scaffolded with vocabulary support                            │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Node Palette Categories
1. **Learning Nodes** (Blue) - Student profile, curriculum, content generation
2. **AI Model Nodes** (Purple) - Model selection, prompts, structured output
3. **Scaffolding Nodes** (Green) - Language support, visual aids, L1 bridges
4. **Interaction Nodes** (Orange) - Student input, voice, comprehension checks
5. **Flow Control Nodes** (Gray) - Routing, loops, merging
6. **Output Nodes** (Teal) - Progress, feedback, celebration

#### Design System
- **Color Palette:** 
  - Primary: Deep blue (#1e40af) - Trust, education
  - Secondary: Warm amber (#f59e0b) - Energy, encouragement
  - Neutrals: Slate grays
  - Success: Emerald green
  - Each node category has a distinct accent color

### Student Mode: Learning Interface

#### Design Goals
- Minimal, distraction-free
- Large touch targets for younger students
- Voice-first capability
- Progress visibility without anxiety
- Celebration of achievements

#### Layout (Responsive)
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ ☰   LinguaFlow   [?]                           Hi, Maria!  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │           [CONTENT AREA]                            │   │
│   │                                                     │   │
│   │    "The farmer had 24 apples. He gave 8 to         │   │
│   │     his neighbor. How many does he have now?"       │   │
│   │                                                     │   │
│   │    农夫 (farmer) - a person who grows food          │   │
│   │                                                     │   │
│   │    [Visual: Farm scene with apple counting]         │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Your answer:                                       │   │
│   │  ┌───────────────────────────────────────────────┐  │   │
│   │  │                                               │  │   │
│   │  └───────────────────────────────────────────────┘  │   │
│   │                                   [🎤] [Submit →]   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Progress: ████████░░░░░░░░░░░░  4/10 problems            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Classroom Dashboard

#### Real-Time Class View
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ Grade 4 - Math Word Problems                    [All] [Working] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Ahmed   │ │ Wei     │ │ Sofia   │ │ Priya   │ │ Dmitri  │   │
│  │ ████░░  │ │ ██████  │ │ ███░░░  │ │ █████░  │ │ ████░░  │   │
│  │ Q5/10   │ │ Done!   │ │ Q4/10   │ │ Q6/10   │ │ Q5/10   │   │
│  │ 🟢 Good │ │ 🏆 100% │ │ 🟡 Help?│ │ 🟢 Good │ │ 🟢 Good │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ... (more students)                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Class Insights:                                                 │
│ • 3 students struggling with "subtraction" vocabulary           │
│ • Average completion: 52%                                       │
│ • Sofia has been stuck for 3 minutes - consider check-in        │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Data Models

### Student Profile

\`\`\`typescript
interface StudentProfile {
  id: string
  displayName: string
  gradeLevel: number
  
  // Language profile
  elpaLevel: 1 | 2 | 3 | 4 | 5
  elpaSubScores?: {
    listening: number
    speaking: number
    reading: number
    writing: number
  }
  primaryLanguage: LanguageCode
  secondaryLanguages: LanguageCode[]
  
  // Learning profile
  interests: string[]
  strengths: string[]
  areasForGrowth: string[]
  
  // Accessibility
  accessibilityNeeds: {
    visualSupport: boolean
    audioSupport: boolean
    motorSupport: boolean
    extendedTime: boolean
  }
  
  // Classroom context
  classroomId?: string
  teacherId: string
  
  createdAt: Date
  updatedAt: Date
}

type LanguageCode = 
  | 'en' // English
  | 'zh' // Mandarin
  | 'pa' // Punjabi
  | 'ar' // Arabic
  | 'es' // Spanish
  | 'tl' // Tagalog
  | 'uk' // Ukrainian
  | 'vi' // Vietnamese
  | 'ko' // Korean
  | 'fa' // Farsi
  | string // Other ISO 639-1 codes
\`\`\`

### Workflow Definition

\`\`\`typescript
interface Workflow {
  id: string
  name: string
  description: string
  
  // Curriculum alignment
  subjectArea: 'ela' | 'math' | 'science' | 'social' | 'cross-curricular'
  gradeRange: { min: number, max: number }
  curriculumOutcomes: string[]
  
  // React Flow data
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  
  // Metadata
  author: string
  isTemplate: boolean
  tags: string[]
  
  createdAt: Date
  updatedAt: Date
}

interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number, y: number }
  data: NodeData
}

type NodeType = 
  // Learning nodes
  | 'student-profile'
  | 'curriculum-selector'
  | 'content-generator'
  | 'math-problem-generator'
  | 'vocabulary-builder'
  
  // Scaffolding nodes
  | 'scaffolding'
  | 'l1-bridge'
  | 'visual-support'
  
  // AI nodes
  | 'ai-model'
  | 'prompt-template'
  | 'structured-output'
  
  // Interaction nodes
  | 'human-input'
  | 'voice-input'
  | 'comprehension-check'
  | 'multiple-choice'
  
  // Flow control
  | 'proficiency-router'
  | 'loop'
  | 'merge'
  
  // Output nodes
  | 'progress-tracker'
  | 'feedback'
  | 'celebration'
\`\`\`

### Session & Progress

\`\`\`typescript
interface LearningSession {
  id: string
  studentId: string
  workflowId: string
  
  // Execution state
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  currentNodeId: string
  executionLog: ExecutionLogEntry[]
  
  // Progress data
  startedAt: Date
  completedAt?: Date
  duration: number // seconds
  
  // Results
  responses: StudentResponse[]
  assessmentResults: AssessmentResult[]
  progressMetrics: ProgressMetrics
}

interface ProgressMetrics {
  questionsAttempted: number
  questionsCorrect: number
  accuracyRate: number
  timePerQuestion: number[]
  vocabularyEncountered: string[]
  scaffoldingUsed: string[]
  l1BridgesAccessed: number
}
\`\`\`

---

## Alberta Curriculum Integration

### ELPA Level Definitions

\`\`\`typescript
const ELPA_LEVELS = {
  1: {
    name: 'Beginning',
    description: 'Student is new to English with limited vocabulary',
    characteristics: [
      'Single words or short phrases',
      'Heavy reliance on visuals and L1',
      'Needs extensive scaffolding',
    ],
    scaffoldingApproach: 'full-support',
    readingLevel: 'pre-primer',
  },
  2: {
    name: 'Developing',
    description: 'Student can understand simple sentences',
    characteristics: [
      'Simple sentences with common vocabulary',
      'Benefits from visual support',
      'Can follow familiar routines',
    ],
    scaffoldingApproach: 'high-support',
    readingLevel: 'grade-1-2',
  },
  3: {
    name: 'Expanding',
    description: 'Student can participate in classroom activities',
    characteristics: [
      'Paragraphs with some academic vocabulary',
      'Can comprehend grade-level content with support',
      'May need pre-teaching of key vocabulary',
    ],
    scaffoldingApproach: 'moderate-support',
    readingLevel: 'grade-3-4',
  },
  4: {
    name: 'Bridging',
    description: 'Student approaching grade-level proficiency',
    characteristics: [
      'Complex sentences and academic language',
      'Minimal scaffolding needed',
      'May have gaps in specific vocabulary areas',
    ],
    scaffoldingApproach: 'light-support',
    readingLevel: 'grade-5-6',
  },
  5: {
    name: 'Extending',
    description: 'Student meets grade-level expectations',
    characteristics: [
      'Grade-appropriate complexity',
      'Independent work possible',
      'May benefit from enrichment',
    ],
    scaffoldingApproach: 'enrichment',
    readingLevel: 'grade-appropriate',
  },
}
\`\`\`

### Curriculum Outcome Mapping

\`\`\`typescript
interface CurriculumOutcome {
  code: string // e.g., "4.N.1"
  subject: 'ela' | 'math' | 'science' | 'social'
  gradeLevel: number
  strand: string
  outcome: string
  indicators: string[]
  
  // For node configuration
  suggestedNodes: NodeType[]
  commonMisconceptions: string[]
  vocabularyTerms: string[]
  crossCurricularLinks: string[]
}
\`\`\`

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Transform current skeleton into ESL-focused architecture

#### Week 1: Type System & Data Models
- [ ] Expand `lib/types.ts` with all node types and data structures
- [ ] Create `lib/types/student.ts` for student profile types
- [ ] Create `lib/types/curriculum.ts` for Alberta curriculum types
- [ ] Create `lib/types/execution.ts` for workflow execution types
- [ ] Set up Supabase database schema for persistence

#### Week 2: Core Node Components
- [ ] Refactor existing nodes to new architecture
- [ ] Create `StudentProfileNode` component
- [ ] Create `ContentGeneratorNode` component
- [ ] Create `ScaffoldingNode` component
- [ ] Create `AIModelNode` component with AI SDK integration
- [ ] Update `node-library.tsx` with new categorized structure

#### Week 3: Workflow Builder UI Refresh
- [ ] Redesign `workflow-builder.tsx` with new layout
- [ ] Create categorized `node-palette.tsx`
- [ ] Build enhanced `node-inspector.tsx`
- [ ] Implement new color system and design tokens
- [ ] Add Alberta-themed branding

### Phase 2: AI Integration (Weeks 4-6)
**Goal:** Build execution engine with AI SDK

#### Week 4: Execution Engine Core
- [ ] Create `lib/execution/engine.ts` - graph traversal logic
- [ ] Implement node execution handlers for each type
- [ ] Build execution state machine
- [ ] Create `ExecutionPanel` component for real-time logs

#### Week 5: AI SDK Integration
- [ ] Set up AI SDK with Vercel AI Gateway
- [ ] Implement `ai-client.ts` for model abstraction
- [ ] Build streaming support for AI nodes
- [ ] Create `PromptTemplateNode` with variable interpolation
- [ ] Implement `StructuredOutputNode` with Zod schemas

#### Week 6: Scaffolding Intelligence
- [ ] Implement i+1 level adjustment algorithm
- [ ] Build vocabulary extraction and translation
- [ ] Create readability analysis for content
- [ ] Implement L1 bridge functionality for top 10 languages

### Phase 3: Student Experience (Weeks 7-9)
**Goal:** Build simplified student-facing interface

#### Week 7: Student Interface Foundation
- [ ] Create `/student/[sessionId]/page.tsx` route
- [ ] Build `learning-interface.tsx` component
- [ ] Implement input components (text, multiple-choice)
- [ ] Create progress indicators and navigation

#### Week 8: Voice & Accessibility
- [ ] Implement `voice-recorder.tsx` with speech-to-text
- [ ] Add text-to-speech for content playback
- [ ] Build pronunciation feedback system
- [ ] Implement accessibility features (screen reader, high contrast)

#### Week 9: Engagement Features
- [ ] Create `CelebrationNode` with animations
- [ ] Build streak and achievement system
- [ ] Implement encouraging feedback generation
- [ ] Add cultural celebration calendar integration

### Phase 4: Classroom Features (Weeks 10-12)
**Goal:** Enable teacher monitoring and management

#### Week 10: Classroom Dashboard
- [ ] Create `/classroom/[classId]/page.tsx`
- [ ] Build real-time student grid view
- [ ] Implement Supabase Realtime for live updates
- [ ] Create teacher alert system for struggling students

#### Week 11: Analytics & Reporting
- [ ] Build progress analytics dashboard
- [ ] Create individual student reports
- [ ] Implement class-wide insights
- [ ] Generate report card language suggestions

#### Week 12: Workflow Templates
- [ ] Create template library system
- [ ] Build 5+ starter templates:
  - Math Word Problem Decoder
  - Reading Comprehension Builder
  - Vocabulary Explorer
  - Oral Language Practice
  - Writing Scaffold
- [ ] Implement template sharing between teachers

### Phase 5: Polish & Scale (Weeks 13-16)
**Goal:** Production readiness

#### Week 13-14: Testing & Refinement
- [ ] User testing with Alberta teachers
- [ ] Student testing sessions
- [ ] Performance optimization
- [ ] Edge case handling

#### Week 15: Documentation & Training
- [ ] Create teacher onboarding tutorial
- [ ] Build in-app help system
- [ ] Write documentation for workflow creation
- [ ] Create video walkthroughs

#### Week 16: Launch Preparation
- [ ] Security audit
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Load testing
- [ ] Deployment pipeline

---

## Database Schema (Supabase)

\`\`\`sql
-- Students and profiles
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  elpa_level INTEGER NOT NULL CHECK (elpa_level BETWEEN 1 AND 5),
  primary_language TEXT NOT NULL,
  secondary_languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  accessibility_needs JSONB DEFAULT '{}',
  classroom_id UUID REFERENCES classrooms(id),
  teacher_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject_area TEXT NOT NULL,
  grade_min INTEGER NOT NULL,
  grade_max INTEGER NOT NULL,
  curriculum_outcomes TEXT[] DEFAULT '{}',
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning sessions
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  workflow_id UUID REFERENCES workflows(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  current_node_id TEXT,
  execution_log JSONB DEFAULT '[]',
  responses JSONB DEFAULT '[]',
  progress_metrics JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0
);

-- Progress tracking
CREATE TABLE progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  session_id UUID REFERENCES learning_sessions(id) NOT NULL,
  curriculum_outcome TEXT,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- Policies (teachers see their students, students see their own data)
CREATE POLICY "Teachers can view their students"
  ON students FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage their classrooms"
  ON classrooms FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "Authors can manage their workflows"
  ON workflows FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Public workflows are visible"
  ON workflows FOR SELECT
  USING (is_public = TRUE);
\`\`\`

---

## API Routes

### `/api/execute/route.ts`
Workflow execution endpoint with streaming support

### `/api/ai/route.ts`
AI model gateway for all node AI calls

### `/api/students/route.ts`
Student CRUD operations

### `/api/progress/route.ts`
Progress tracking and analytics

### `/api/classroom/route.ts`
Real-time classroom management

---

## File Creation Order for AI Agent

When implementing this project, create files in this order to manage dependencies:

### Step 1: Types and Utilities
1. `lib/types/nodes.ts`
2. `lib/types/student.ts`
3. `lib/types/curriculum.ts`
4. `lib/types/execution.ts`
5. `lib/curriculum/elpa-levels.ts`
6. `lib/curriculum/alberta-standards.ts`

### Step 2: Node Components
7. `components/nodes/learning/student-profile-node.tsx`
8. `components/nodes/learning/curriculum-selector-node.tsx`
9. `components/nodes/learning/content-generator-node.tsx`
10. `components/nodes/ai/ai-model-node.tsx`
11. `components/nodes/ai/prompt-template-node.tsx`
12. `components/nodes/scaffolding/scaffolding-node.tsx`
13. `components/nodes/scaffolding/l1-bridge-node.tsx`
14. `components/nodes/interaction/human-input-node.tsx`
15. `components/nodes/flow/proficiency-router-node.tsx`
16. `components/nodes/output/progress-tracker-node.tsx`
17. `components/nodes/output/feedback-node.tsx`

### Step 3: Builder Components
18. `components/builder/node-palette.tsx`
19. `components/builder/node-inspector.tsx`
20. `components/builder/execution-panel.tsx`
21. `components/builder/workflow-canvas.tsx`

### Step 4: Execution Engine
22. `lib/execution/engine.ts`
23. `lib/execution/ai-client.ts`
24. `lib/execution/streaming.ts`
25. `lib/execution/handlers/` (one per node type)

### Step 5: Student Interface
26. `components/student/learning-interface.tsx`
27. `components/student/voice-recorder.tsx`
28. `components/student/visual-feedback.tsx`
29. `app/student/[sessionId]/page.tsx`

### Step 6: Classroom Features
30. `components/classroom/student-grid.tsx`
31. `components/classroom/analytics-dashboard.tsx`
32. `app/classroom/[classId]/page.tsx`

### Step 7: API Routes
33. `app/api/execute/route.ts`
34. `app/api/ai/route.ts`
35. `app/api/students/route.ts`
36. `app/api/progress/route.ts`

### Step 8: Database Setup
37. `scripts/001-create-tables.sql`
38. `scripts/002-create-policies.sql`
39. `scripts/003-seed-templates.sql`

---

## Success Metrics

### Student Outcomes
- Improved ELPA scores over time
- Increased engagement (session duration, completion rates)
- Reduced time to comprehension
- Growth in vocabulary acquisition

### Teacher Adoption
- Number of workflows created
- Templates shared between teachers
- Time saved on differentiation
- Teacher satisfaction scores

### System Performance
- Workflow execution latency < 500ms
- AI response streaming < 100ms first token
- 99.9% uptime during school hours
- Support for 30 concurrent students per classroom

---

## Future Roadmap

### Version 2.0
- Parent portal with progress visibility
- Integration with PowerSchool/other SIS
- Offline mode for limited connectivity schools
- Indigenous language support (Cree, Blackfoot)

### Version 3.0
- Multi-modal AI (image understanding for student work)
- Collaborative student activities
- AI teaching assistant suggestions
- Provincial analytics dashboard for Alberta Education

---

## Conclusion

LinguaFlow represents a paradigm shift in ESL education technology: from generic AI tutors to teacher-designed, student-personalized learning pathways. By leveraging the power of AI orchestration while keeping educators in control, we can deliver truly differentiated instruction at scale - meeting each of Alberta's diverse learners exactly where they are.

The existing React Flow codebase provides an excellent foundation. With systematic implementation of this plan, we can transform it into a powerful tool that serves Alberta's ESL students while respecting their linguistic and cultural assets.

---

*Document Version: 1.0*
*Created: December 2024*
*For: LinguaFlow Development Team*
