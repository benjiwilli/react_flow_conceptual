"use client"

/**
 * Authentication Context
 * Provides authentication state and methods for the entire application
 * Supports Teacher, Student, and Admin roles with Supabase Auth
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import type { User, Session } from "@supabase/supabase-js"

export interface TeacherProfile {
  id: string
  email: string
  display_name: string
  school_name?: string
  school_district?: string
  role: "teacher" | "admin"
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  display_name: string
  grade_level: number
  elpa_level: number
  primary_language: string
  classroom_id: string
  teacher_id: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: TeacherProfile | StudentProfile | null
  userType: "teacher" | "student" | "admin" | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateProfile: (updates: Partial<TeacherProfile | StudentProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<TeacherProfile | StudentProfile | null>(null)
  const [userType, setUserType] = useState<"teacher" | "student" | "admin" | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const loadUserProfile = useCallback(async (currentUser: User) => {
    try {
      // Check if teacher
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", currentUser.id)
        .single()

      if (teacherData) {
        setProfile(teacherData as TeacherProfile)
        setUserType(teacherData.role as "teacher" | "admin")
        return
      }

      // Check if student
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", currentUser.id)
        .single()

      if (studentData) {
        setProfile(studentData as StudentProfile)
        setUserType("student")
        return
      }

      // New user, create teacher profile by default
      const newTeacher: Omit<TeacherProfile, "created_at" | "updated_at"> = {
        id: currentUser.id,
        email: currentUser.email!,
        display_name: currentUser.user_metadata?.full_name || currentUser.email!.split("@")[0],
        school_name: currentUser.user_metadata?.school_name,
        school_district: currentUser.user_metadata?.school_district,
        role: "teacher"
      }

      const { data: created, error: createError } = await supabase
        .from("teachers")
        .insert(newTeacher)
        .select()
        .single()

      if (createError) {
        console.error("Error creating teacher profile:", createError)
        // Still set basic profile info from user metadata
        setProfile({
          ...newTeacher,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as TeacherProfile)
        setUserType("teacher")
        return
      }

      if (created) {
        setProfile(created as TeacherProfile)
        setUserType("teacher")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user)
        } else {
          setProfile(null)
          setUserType(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadUserProfile])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
      setUserType(null)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<TeacherProfile | StudentProfile>) => {
    if (!user || !profile) throw new Error("No user logged in")

    const { error } = await supabase
      .from(userType === "student" ? "students" : "teachers")
      .update(updates)
      .eq("id", user.id)

    if (error) throw error
    await loadUserProfile(user)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
