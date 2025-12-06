// Supabase client and types
export { supabase, isSupabaseConfigured, getSupabaseClient, createServerClient } from "./client"
export type {
  Database,
  TeacherProfile,
  Student,
  Classroom,
  Workflow,
  LearningSession,
  ProgressRecord,
  VocabularyProgress,
  AssessmentResult,
  WorkflowAssignment,
} from "./types"
