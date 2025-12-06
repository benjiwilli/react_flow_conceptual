/**
 * Comprehensive Node Type Definitions for LinguaFlow
 * ESL-focused AI Orchestration Platform for Alberta K-12
 */

import type { Node } from "@xyflow/react"
import type { ELPALevel, GradeLevel, SupportedLanguage } from "./student"
import type { SubjectArea } from "./curriculum"

// ============================================================================
// Node Categories
// ============================================================================

export type NodeCategory =
  | "learning" // Student & context nodes (blue)
  | "ai" // AI model nodes (purple)
  | "scaffolding" // Language support nodes (green)
  | "interaction" // User interaction nodes (orange)
  | "flow" // Control flow nodes (gray)
  | "output" // Output & progress nodes (teal)

// ============================================================================
// Node Types by Category
// ============================================================================

export type LearningNodeType =
  | "student-profile"
  | "curriculum-selector"
  | "content-generator"
  | "math-problem-generator"
  | "vocabulary-builder"

export type AINodeType = "ai-model" | "prompt-template" | "structured-output"

export type ScaffoldingNodeType =
  | "scaffolding"
  | "l1-bridge"
  | "visual-support"
  | "comprehensible-input"
  | "reading-passage"

export type InteractionNodeType =
  | "human-input"
  | "voice-input"
  | "comprehension-check"
  | "multiple-choice"
  | "free-response"
  | "oral-practice"

export type FlowNodeType = "proficiency-router" | "loop" | "merge" | "parallel" | "conditional" | "variable"

export type OutputNodeType = "progress-tracker" | "feedback" | "celebration" | "speaking-assessment"

export type AllNodeTypes =
  | LearningNodeType
  | AINodeType
  | ScaffoldingNodeType
  | InteractionNodeType
  | FlowNodeType
  | OutputNodeType

// ============================================================================
// Base Node Data Interface
// ============================================================================

export interface BaseNodeData {
  label: string
  description?: string
  category: NodeCategory
  isConfigured: boolean
  validationErrors?: string[]
}

// ============================================================================
// Learning Node Data Types
// ============================================================================

export interface StudentProfileNodeData extends BaseNodeData {
  category: "learning"
  studentId?: string
  gradeLevel?: GradeLevel
  elpaLevel?: ELPALevel
  primaryLanguage?: SupportedLanguage
  secondaryLanguages?: SupportedLanguage[]
  interests?: string[]
  accessibilityNeeds?: AccessibilityOptions
  learningPreferences?: LearningPreference[]
}

export interface AccessibilityOptions {
  visualSupport: boolean
  audioSupport: boolean
  motorSupport: boolean
  extendedTime: boolean
  textToSpeech: boolean
  highContrast: boolean
}

export type LearningPreference = "visual" | "auditory" | "kinesthetic" | "reading-writing"

export interface CurriculumSelectorNodeData extends BaseNodeData {
  category: "learning"
  subjectArea?: SubjectArea
  gradeLevel?: GradeLevel
  strand?: string
  specificOutcomes?: string[]
  difficultyAdjustment?: -2 | -1 | 0 | 1 | 2
  crossCurricular?: boolean
}

export interface ContentGeneratorNodeData extends BaseNodeData {
  category: "learning"
  contentType: ContentType
  length: "short" | "medium" | "long"
  wordCount?: number
  complexityLevel?: ELPALevel | "auto"
  includeVisuals?: boolean
  culturalRelevance?: CulturalRelevanceSettings
  topic?: string
  prompt?: string
}

export type ContentType = "passage" | "story" | "explanation" | "example" | "problem" | "dialogue" | "instructions"

export interface CulturalRelevanceSettings {
  enabled: boolean
  preferredContext?: string
  avoidContext?: string[]
}

export interface MathProblemGeneratorNodeData extends BaseNodeData {
  category: "learning"
  problemType: MathProblemType
  operationType?: MathOperation[]
  numberRange?: { min: number; max: number }
  context?: string
  scaffoldLevel: ScaffoldLevel
  includeVisuals?: boolean
  wordProblem: boolean
}

export type MathProblemType = "computation" | "word-problem" | "pattern" | "geometry" | "measurement" | "data"
export type MathOperation = "addition" | "subtraction" | "multiplication" | "division" | "mixed"
export type ScaffoldLevel = "none" | "vocabulary-only" | "sentence-starters" | "full-support"

export interface VocabularyBuilderNodeData extends BaseNodeData {
  category: "learning"
  maxWords: number
  includeL1Translations: boolean
  includeVisuals: boolean
  includeAudio: boolean
  wordTypeFilter?: WordType[]
  focusType: VocabularyFocusType
  contextSentences: boolean
}

export type WordType = "noun" | "verb" | "adjective" | "adverb" | "academic" | "content-specific"
export type VocabularyFocusType = "high-frequency" | "academic" | "content-specific" | "tier-2" | "tier-3"

// ============================================================================
// AI Node Data Types
// ============================================================================

export interface AIModelNodeData extends BaseNodeData {
  category: "ai"
  provider: AIProvider
  model: AIModel
  temperature: number
  maxTokens: number
  systemPrompt: string
  streamResponse: boolean
  retryOnFailure: boolean
  maxRetries?: number
  fallbackModel?: AIModel
  structuredOutput?: boolean
  outputSchema?: string
}

export type AIProvider = "openai" | "anthropic" | "google" | "groq" | "local"

export type AIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "claude-sonnet-4-20250514"
  | "claude-3-haiku"
  | "claude-3-opus"
  | "gemini-pro"
  | "gemini-flash"
  | "llama-3"
  | "mixtral"

export interface PromptTemplateNodeData extends BaseNodeData {
  category: "ai"
  template: string
  variables: TemplateVariable[]
  conditionalSections?: ConditionalSection[]
  outputFormat?: "text" | "json" | "markdown"
}

export interface TemplateVariable {
  name: string
  source: "upstream" | "context" | "static"
  defaultValue?: string
  required: boolean
}

export interface ConditionalSection {
  condition: string
  content: string
}

export interface StructuredOutputNodeData extends BaseNodeData {
  category: "ai"
  schema: string // JSON Schema or Zod schema definition
  schemaName: string
  validateOutput: boolean
  fallbackBehavior: "error" | "raw-text" | "retry"
}

// ============================================================================
// Scaffolding Node Data Types
// ============================================================================

export interface ScaffoldingNodeData extends BaseNodeData {
  category: "scaffolding"
  scaffoldingType: ScaffoldingType
  targetLevel?: ELPALevel
  preserveMeaning: boolean
  scaffoldElements: ScaffoldElement[]
  autoAdjust: boolean
}

export type ScaffoldingType = "simplify" | "add-supports" | "enrich" | "differentiate"

export type ScaffoldElement =
  | "sentence-starters"
  | "word-banks"
  | "graphic-organizers"
  | "visual-supports"
  | "l1-glossary"
  | "audio-support"
  | "examples"
  | "hints"

export interface L1BridgeNodeData extends BaseNodeData {
  category: "scaffolding"
  bridgeType: BridgeType
  displayMode: BridgeDisplayMode
  targetLanguages: SupportedLanguage[]
  translateConcepts: boolean
  culturalContext: boolean
  showPronunciation: boolean
}

export type BridgeType = "full-translation" | "key-terms-only" | "concept-explanation" | "cognates"
export type BridgeDisplayMode = "side-by-side" | "hover" | "toggle" | "inline"

export interface VisualSupportNodeData extends BaseNodeData {
  category: "scaffolding"
  visualType: VisualType
  generationMethod: "ai-generated" | "placeholder" | "linked" | "upload"
  altTextRequired: boolean
  captionLanguage?: SupportedLanguage
  imageStyle?: string
}

export type VisualType = "diagram" | "illustration" | "photo" | "graphic-organizer" | "chart" | "infographic"

export interface ComprehensibleInputNodeData extends BaseNodeData {
  category: "scaffolding"
  inputMode: "text" | "audio" | "video" | "multimodal"
  adjustToLevel: boolean
  repeatOption: boolean
  slowdownOption: boolean
  highlightKeywords: boolean
}

export interface ReadingPassageNodeData extends BaseNodeData {
  category: "scaffolding"
  genre: PassageGenre
  length: "short" | "medium" | "long"
  readabilityTarget: ELPALevel | "auto"
  includeComprehensionQuestions: boolean
  highlightVocabulary: boolean
  audioVersion: boolean
}

export type PassageGenre =
  | "narrative"
  | "informational"
  | "procedural"
  | "persuasive"
  | "poetry"
  | "dialogue"
  | "news"
  | "academic"

// ============================================================================
// Interaction Node Data Types
// ============================================================================

export interface HumanInputNodeData extends BaseNodeData {
  category: "interaction"
  inputType: InputType
  prompt: string
  placeholder?: string
  timeLimit?: number
  retryAllowed: boolean
  maxRetries?: number
  hintAvailable: boolean
  hints?: string[]
  validation?: InputValidation
}

export type InputType = "text" | "number" | "multiple-choice" | "drawing" | "voice" | "file"

export interface InputValidation {
  required: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  customValidator?: string
}

export interface VoiceInputNodeData extends BaseNodeData {
  category: "interaction"
  expectedLanguage: "english" | "l1" | "mixed"
  pronunciationFeedback: boolean
  modelAudioPlayback: boolean
  transcriptionRequired: boolean
  maxDuration?: number
  silenceTimeout?: number
}

export interface ComprehensionCheckNodeData extends BaseNodeData {
  category: "interaction"
  questionCount: number
  questionTypes: QuestionType[]
  passThreshold: number
  remediationPath?: string
  adaptiveQuestions: boolean
  showFeedback: boolean
}

export type QuestionType = "literal" | "inferential" | "vocabulary" | "main-idea" | "sequence" | "cause-effect"

export interface MultipleChoiceNodeData extends BaseNodeData {
  category: "interaction"
  question: string
  options: ChoiceOption[]
  correctAnswer: string
  shuffleOptions: boolean
  showFeedback: boolean
  allowPartialCredit: boolean
}

export interface ChoiceOption {
  id: string
  text: string
  isCorrect: boolean
  feedback?: string
}

export interface FreeResponseNodeData extends BaseNodeData {
  category: "interaction"
  prompt: string
  minWords?: number
  maxWords?: number
  rubric?: string
  aiGrading: boolean
  keyPoints?: string[]
  scaffolding?: string
}

export interface OralPracticeNodeData extends BaseNodeData {
  category: "interaction"
  scenario: ConversationScenario
  turns: number
  modelPhrases?: string[]
  pronunciationTargets?: string[]
  recordingEnabled: boolean
  feedbackType: "immediate" | "end" | "none"
}

export type ConversationScenario =
  | "greeting"
  | "asking-directions"
  | "ordering-food"
  | "classroom"
  | "phone-call"
  | "interview"
  | "custom"

// ============================================================================
// Flow Control Node Data Types
// ============================================================================

export interface ProficiencyRouterNodeData extends BaseNodeData {
  category: "flow"
  routingCriteria: RoutingCriteria
  paths: RouterPath[]
  defaultPath: string
  evaluateOnInput: boolean
}

export interface RoutingCriteria {
  type: "elpa-level" | "score" | "custom" | "assessment-result"
  thresholds?: number[]
  customLogic?: string
}

export interface RouterPath {
  id: string
  label: string
  condition: string
  targetNodeId?: string
}

export interface LoopNodeData extends BaseNodeData {
  category: "flow"
  loopType: LoopType
  maxIterations: number
  exitCondition?: string
  itemsSource?: string
  bodyNodeIds: string[]
  aggregateResults: boolean
}

export type LoopType = "count-based" | "until-success" | "until-mastery" | "for-each"

export interface MergeNodeData extends BaseNodeData {
  category: "flow"
  mergeStrategy: MergeStrategy
  waitForAll: boolean
  timeout?: number
}

export type MergeStrategy = "concatenate" | "select-best" | "aggregate" | "first-complete"

export interface ParallelNodeData extends BaseNodeData {
  category: "flow"
  branchCount: number
  executionMode: "concurrent" | "sequential"
  collectResults: boolean
}

export interface ConditionalNodeData extends BaseNodeData {
  category: "flow"
  condition: string
  trueLabel: string
  falseLabel: string
  evaluationType: "boolean" | "expression" | "ai-evaluate"
}

export interface VariableNodeData extends BaseNodeData {
  category: "flow"
  variableName: string
  variableType: "string" | "number" | "boolean" | "array" | "object"
  operation: "set" | "get" | "increment" | "append" | "transform"
  value?: unknown
  transformFunction?: string
}

// ============================================================================
// Output Node Data Types
// ============================================================================

export interface ProgressTrackerNodeData extends BaseNodeData {
  category: "output"
  metricsToTrack: ProgressMetric[]
  persistData: boolean
  reportFormat: "summary" | "detailed" | "visual"
  notifyTeacher: boolean
  thresholdAlerts?: ThresholdAlert[]
}

export type ProgressMetric =
  | "accuracy"
  | "time-on-task"
  | "attempts"
  | "vocabulary-learned"
  | "skills-mastered"
  | "scaffolds-used"
  | "l1-bridges-accessed"

export interface ThresholdAlert {
  metric: ProgressMetric
  threshold: number
  direction: "above" | "below"
  message: string
}

export interface FeedbackNodeData extends BaseNodeData {
  category: "output"
  feedbackStyle: FeedbackStyle
  includeCorrectAnswer: boolean
  culturalToneAdjustment: boolean
  encouragementLevel: "high" | "medium" | "low"
  personalized: boolean
  l1Support: boolean
}

export type FeedbackStyle = "encouraging" | "corrective" | "explanatory" | "growth-mindset" | "custom"

export interface CelebrationNodeData extends BaseNodeData {
  category: "output"
  celebrationType: CelebrationType
  milestoneDefinitions: MilestoneDefinition[]
  soundEnabled: boolean
  animationEnabled: boolean
  shareToClassroom: boolean
}

export type CelebrationType = "animation" | "badge" | "message" | "confetti" | "sound" | "points"

export interface MilestoneDefinition {
  id: string
  name: string
  description: string
  trigger: string
  reward?: string
}

export interface SpeakingAssessmentNodeData extends BaseNodeData {
  category: "output"
  assessmentType: "pronunciation" | "fluency" | "comprehension" | "full"
  targetSounds?: string[]
  rubric: SpeakingRubric
  recordResponse: boolean
  provideFeedback: boolean
}

export interface SpeakingRubric {
  criteria: RubricCriterion[]
  scoringType: "holistic" | "analytic"
  maxScore: number
}

export interface RubricCriterion {
  name: string
  weight: number
  levels: { score: number; description: string }[]
}

// ============================================================================
// Node Configuration Registry
// ============================================================================

export interface NodeTypeConfig {
  type: AllNodeTypes
  category: NodeCategory
  label: string
  description: string
  icon: string
  color: string
  defaultData: Partial<BaseNodeData>
  inputs: PortDefinition[]
  outputs: PortDefinition[]
}

export interface PortDefinition {
  id: string
  label: string
  type: "any" | "string" | "number" | "boolean" | "object" | "array" | "student-context" | "content"
  required: boolean
}

// ============================================================================
// Typed Node Helper
// ============================================================================

export type LinguaFlowNodeData =
  | StudentProfileNodeData
  | CurriculumSelectorNodeData
  | ContentGeneratorNodeData
  | MathProblemGeneratorNodeData
  | VocabularyBuilderNodeData
  | AIModelNodeData
  | PromptTemplateNodeData
  | StructuredOutputNodeData
  | ScaffoldingNodeData
  | L1BridgeNodeData
  | VisualSupportNodeData
  | ComprehensibleInputNodeData
  | ReadingPassageNodeData
  | HumanInputNodeData
  | VoiceInputNodeData
  | ComprehensionCheckNodeData
  | MultipleChoiceNodeData
  | FreeResponseNodeData
  | OralPracticeNodeData
  | ProficiencyRouterNodeData
  | LoopNodeData
  | MergeNodeData
  | ParallelNodeData
  | ConditionalNodeData
  | VariableNodeData
  | ProgressTrackerNodeData
  | FeedbackNodeData
  | CelebrationNodeData
  | SpeakingAssessmentNodeData

// LinguaFlowNode uses Node type with a generic Record to satisfy the constraint
export type LinguaFlowNode = Node<Record<string, unknown> & Partial<LinguaFlowNodeData>, AllNodeTypes>
