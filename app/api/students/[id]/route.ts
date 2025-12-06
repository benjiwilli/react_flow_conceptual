/**
 * Individual Student API Route
 * Get, update, delete specific student
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"
import type { StudentProfile, GradeLevel, ELPALevel, SupportedLanguage, LearningStyle } from "@/lib/types/student"

// Mock students for demo
const mockStudents: Record<string, StudentProfile> = {
  "student-1": {
    id: "student-1",
    firstName: "Maria",
    lastName: "Garcia",
    gradeLevel: "4",
    elpaLevel: 2,
    literacyLevel: 2,
    numeracyLevel: 3,
    nativeLanguage: "spanish",
    additionalLanguages: [],
    interests: ["soccer", "animals"],
    learningStyles: ["visual"],
    culturalBackground: "Mexican",
    accommodations: [],
    schoolId: "school-1",
    teacherId: "teacher-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "student-2": {
    id: "student-2",
    firstName: "Wei",
    lastName: "Chen",
    gradeLevel: "4",
    elpaLevel: 3,
    literacyLevel: 3,
    numeracyLevel: 4,
    nativeLanguage: "mandarin",
    additionalLanguages: [],
    interests: ["math", "video games"],
    learningStyles: ["visual", "reading-writing"],
    culturalBackground: "Chinese",
    accommodations: [],
    schoolId: "school-1",
    teacherId: "teacher-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

// GET /api/students/[id] - Get student by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json({ error: "Student not found" }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const student: StudentProfile = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        gradeLevel: String(data.grade_level) as GradeLevel,
        elpaLevel: data.elpa_level as ELPALevel,
        literacyLevel: data.literacy_level as ELPALevel,
        numeracyLevel: data.numeracy_level as ELPALevel,
        nativeLanguage: data.native_language as SupportedLanguage,
        additionalLanguages: (data.additional_languages || []) as SupportedLanguage[],
        interests: data.interests || [],
        learningStyles: (data.learning_styles || []) as LearningStyle[],
        culturalBackground: data.cultural_background || "",
        accommodations: data.accommodations || [],
        schoolId: data.school_id || "",
        teacherId: data.teacher_id || "",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }

      return NextResponse.json({ student })
    }
  }

  // Fall back to mock data
  const student = mockStudents[id]
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 })
  }

  return NextResponse.json({ student })
}

// PATCH /api/students/[id] - Update student
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        // Map fields to database columns
        if (body.firstName !== undefined) updateData.first_name = body.firstName
        if (body.lastName !== undefined) updateData.last_name = body.lastName
        if (body.gradeLevel !== undefined) updateData.grade_level = parseInt(body.gradeLevel)
        if (body.elpaLevel !== undefined) updateData.elpa_level = body.elpaLevel
        if (body.literacyLevel !== undefined) updateData.literacy_level = body.literacyLevel
        if (body.numeracyLevel !== undefined) updateData.numeracy_level = body.numeracyLevel
        if (body.nativeLanguage !== undefined) updateData.native_language = body.nativeLanguage
        if (body.additionalLanguages !== undefined) updateData.additional_languages = body.additionalLanguages
        if (body.interests !== undefined) updateData.interests = body.interests
        if (body.learningStyles !== undefined) updateData.learning_styles = body.learningStyles
        if (body.culturalBackground !== undefined) updateData.cultural_background = body.culturalBackground
        if (body.accommodations !== undefined) updateData.accommodations = body.accommodations

        const { data, error } = await supabase
          .from("students")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const student: StudentProfile = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          gradeLevel: String(data.grade_level) as GradeLevel,
          elpaLevel: data.elpa_level as ELPALevel,
          literacyLevel: data.literacy_level as ELPALevel,
          numeracyLevel: data.numeracy_level as ELPALevel,
          nativeLanguage: data.native_language as SupportedLanguage,
          additionalLanguages: (data.additional_languages || []) as SupportedLanguage[],
          interests: data.interests || [],
          learningStyles: (data.learning_styles || []) as LearningStyle[],
          culturalBackground: data.cultural_background || "",
          accommodations: data.accommodations || [],
          schoolId: data.school_id || "",
          teacherId: data.teacher_id || "",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        }

        return NextResponse.json({ student })
      }
    }

    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update student" },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
}
