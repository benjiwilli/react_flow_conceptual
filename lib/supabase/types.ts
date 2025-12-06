// Database type definitions for Supabase
// Generated from scripts/001-create-tables.sql schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teacher_profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          school: string | null
          district: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          school?: string | null
          district?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          school?: string | null
          district?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          teacher_id: string
          name: string
          grade_level: number
          elpa_level: number
          primary_language: string
          secondary_languages: string[] | null
          interests: string[] | null
          accessibility_needs: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          grade_level: number
          elpa_level: number
          primary_language: string
          secondary_languages?: string[] | null
          interests?: string[] | null
          accessibility_needs?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          grade_level?: number
          elpa_level?: number
          primary_language?: string
          secondary_languages?: string[] | null
          interests?: string[] | null
          accessibility_needs?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          teacher_id: string
          name: string
          grade_level: number
          subject: string | null
          school_year: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          grade_level: number
          subject?: string | null
          school_year: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          grade_level?: number
          subject?: string | null
          school_year?: string
          created_at?: string
        }
      }
      classroom_students: {
        Row: {
          classroom_id: string
          student_id: string
          joined_at: string
        }
        Insert: {
          classroom_id: string
          student_id: string
          joined_at?: string
        }
        Update: {
          classroom_id?: string
          student_id?: string
          joined_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          author_id: string
          name: string
          description: string | null
          nodes: Json
          edges: Json
          target_grades: number[] | null
          target_elpa_levels: number[] | null
          subject: string | null
          tags: string[] | null
          is_public: boolean
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          name: string
          description?: string | null
          nodes: Json
          edges: Json
          target_grades?: number[] | null
          target_elpa_levels?: number[] | null
          subject?: string | null
          tags?: string[] | null
          is_public?: boolean
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          name?: string
          description?: string | null
          nodes?: Json
          edges?: Json
          target_grades?: number[] | null
          target_elpa_levels?: number[] | null
          subject?: string | null
          tags?: string[] | null
          is_public?: boolean
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_sessions: {
        Row: {
          id: string
          student_id: string
          workflow_id: string
          status: string
          current_node_id: string | null
          context: Json | null
          started_at: string
          completed_at: string | null
          duration_seconds: number
        }
        Insert: {
          id?: string
          student_id: string
          workflow_id: string
          status?: string
          current_node_id?: string | null
          context?: Json | null
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number
        }
        Update: {
          id?: string
          student_id?: string
          workflow_id?: string
          status?: string
          current_node_id?: string | null
          context?: Json | null
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number
        }
      }
      progress_records: {
        Row: {
          id: string
          session_id: string
          student_id: string
          node_id: string
          response: Json | null
          is_correct: boolean | null
          score: number | null
          time_spent_seconds: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          node_id: string
          response?: Json | null
          is_correct?: boolean | null
          score?: number | null
          time_spent_seconds?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          node_id?: string
          response?: Json | null
          is_correct?: boolean | null
          score?: number | null
          time_spent_seconds?: number | null
          recorded_at?: string
        }
      }
      vocabulary_progress: {
        Row: {
          id: string
          student_id: string
          word: string
          translation: string | null
          language: string
          mastery_level: number
          times_seen: number
          times_correct: number
          last_seen_at: string
        }
        Insert: {
          id?: string
          student_id: string
          word: string
          translation?: string | null
          language: string
          mastery_level?: number
          times_seen?: number
          times_correct?: number
          last_seen_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          word?: string
          translation?: string | null
          language?: string
          mastery_level?: number
          times_seen?: number
          times_correct?: number
          last_seen_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          student_id: string
          session_id: string | null
          assessment_type: string
          score: number
          max_score: number
          details: Json | null
          recorded_at: string
        }
        Insert: {
          id?: string
          student_id: string
          session_id?: string | null
          assessment_type: string
          score: number
          max_score: number
          details?: Json | null
          recorded_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          session_id?: string | null
          assessment_type?: string
          score?: number
          max_score?: number
          details?: Json | null
          recorded_at?: string
        }
      }
      workflow_assignments: {
        Row: {
          id: string
          classroom_id: string
          workflow_id: string
          assigned_by: string
          due_date: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          classroom_id: string
          workflow_id: string
          assigned_by: string
          due_date?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          classroom_id?: string
          workflow_id?: string
          assigned_by?: string
          due_date?: string | null
          assigned_at?: string
        }
      }
      teacher_favorites: {
        Row: {
          teacher_id: string
          workflow_id: string
          added_at: string
        }
        Insert: {
          teacher_id: string
          workflow_id: string
          added_at?: string
        }
        Update: {
          teacher_id?: string
          workflow_id?: string
          added_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type TeacherProfile = Database["public"]["Tables"]["teacher_profiles"]["Row"]
export type Student = Database["public"]["Tables"]["students"]["Row"]
export type Classroom = Database["public"]["Tables"]["classrooms"]["Row"]
export type Workflow = Database["public"]["Tables"]["workflows"]["Row"]
export type LearningSession = Database["public"]["Tables"]["learning_sessions"]["Row"]
export type ProgressRecord = Database["public"]["Tables"]["progress_records"]["Row"]
export type VocabularyProgress = Database["public"]["Tables"]["vocabulary_progress"]["Row"]
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]
export type WorkflowAssignment = Database["public"]["Tables"]["workflow_assignments"]["Row"]
