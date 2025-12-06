/**
 * LinguaFlow Engine Exports
 * Core execution engine for workflow processing
 */

export { WorkflowExecutor, createExecutor, type ExecutorConfig, type ExecutorCallbacks } from "./executor"
export {
  nodeRunners,
  getNodeRunner,
  hasNodeRunner,
  // Learning Node Runners
  runStudentProfileNode,
  runCurriculumSelectorNode,
  runContentGeneratorNode,
  runVocabularyBuilderNode,
  // Scaffolding Node Runners
  runScaffoldedContentNode,
  runL1BridgeNode,
  // AI Node Runners
  runAIModelNode,
  runPromptTemplateNode,
  // Interaction Node Runners
  runHumanInputNode,
  runHumanInLoopNode,
  runComprehensionCheckNode,
  // Flow Control Node Runners
  runRouterNode,
  runLoopNode,
  runConditionalNode,
  runParallelNode,
  // Output Node Runners
  runProgressTrackerNode,
  runFeedbackGeneratorNode,
  runCelebrationNode,
  // Numeracy Node Runners
  runWordProblemDecoderNode,
  // Types
  type NodeRunner,
  type NodeRunnerResult,
} from "./node-runners"
export { StreamManager, getStreamManager, type StreamCallback } from "./stream-manager"
export {
  // Scaffolding Intelligence
  analyzeReadability,
  adjustContentToLevel,
  extractVocabulary,
  generateL1Bridge,
  generateSentenceFrames,
  // Types
  type ReadabilityMetrics,
  type AdjustedContent,
  type ExtractedVocabulary,
  type L1Bridge,
  type SentenceFrame,
} from "./scaffolding-intelligence"
export {
  // AI Client
  generateTextCompletion,
  streamTextCompletion,
  generateStructuredOutput,
  aiEnvStatus,
} from "./ai-client"
