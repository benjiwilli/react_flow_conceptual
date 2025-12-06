/**
 * Students API Route
 * CRUD operations for student profiles
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"
import type { StudentProfile, ELPALevel, GradeLevel, SupportedLanguage } from "@/lib/types/student"

// Mock data for when Supabase is not configured
const mockStudents: StudentProfile[] = [
  {
    id: "student-1",
    firstName: "Maria",
    lastName: "Garcia",
    gradeLevel: "4" as GradeLevel,
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
  {
    id: "student-2",
    firstName: "Wei",
    lastName: "Chen",
    gradeLevel: "4" as GradeLevel,
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
  {
    id: "student-3",
    firstName: "Ahmed",
    lastName: "Hassan",
    gradeLevel: "4" as GradeLevel,
    elpaLevel: 2,
    literacyLevel: 2,
    numeracyLevel: 2,
    nativeLanguage: "arabic",
    additionalLanguages: [],
    interests: ["reading", "science"],
    learningStyles: ["auditory"],
    culturalBackground: "Egyptian",
    accommodations: [],
    schoolId: "school-1",
    teacherId: "teacher-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// GET /api/students - List all students (for teacher)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get("teacherId")
  const gradeLevel = searchParams.get("gradeLevel")
  const elpaLevel = searchParams.get("elpaLevel")

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      let query = supabase.from("students").select("*")
      
      if (teacherId) {
        query = query.eq("teacher_id", teacherId)
      }
      if (gradeLevel) {
        query = query.eq("grade_level", parseInt(gradeLevel))
      }
      if (elpaLevel) {
        query = query.eq("elpa_level", parseInt(elpaLevel))
      }
      
      const { data, error } = await query
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      // Map database rows to StudentProfile type
      const students = (data || []).map((s) => ({
        id: s.id,
        firstName: s.name?.split(" ")[0] || "",
        lastName: s.name?.split(" ").slice(1).join(" ") || "",
        gradeLevel: String(s.grade_level) as GradeLevel,
        elpaLevel: s.elpa_level as ELPALevel,
        literacyLevel: s.elpa_level as ELPALevel,
        numeracyLevel: s.elpa_level as ELPALevel,
        nativeLanguage: (s.primary_language || "other") as SupportedLanguage,
        additionalLanguages: (s.secondary_languages || []) as SupportedLanguage[],
        interests: s.interests || [],
        learningStyles: ["visual"] as StudentProfile["learningStyles"],
        culturalBackground: "",
        accommodations: [],
        schoolId: "",
        teacherId: s.teacher_id || "",
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }))
      
      return NextResponse.json({ students })
    }
  }

  // Return mock data when Supabase not configured
  let filtered = [...mockStudents]
  if (gradeLevel) {
    filtered = filtered.filter((s) => s.gradeLevel === gradeLevel)
  }
  if (elpaLevel) {
    filtered = filtered.filter((s) => s.elpaLevel === parseInt(elpaLevel))
  }
  if (teacherId) {
    filtered = filtered.filter((s) => s.teacherId === teacherId)
  }
  
  return NextResponse.json({ students: filtered })
}

// POST /api/students - Create new student
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const fullName = `${body.firstName} ${body.lastName}`.trim()
        const { data, error } = await supabase
          .from("students")
          .insert({
            teacher_id: body.teacherId,
            name: fullName,
            grade_level: parseInt(body.gradeLevel) || 4,
            elpa_level: body.elpaLevel || 1,
            primary_language: body.nativeLanguage || "other",
            secondary_languages: body.additionalLanguages || [],
            interests: body.interests || [],
            accessibility_needs: body.accommodations?.length ? { accommodations: body.accommodations } : null,
          })
          .select()
          .single()
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        const student: StudentProfile = {
          id: data.id,
          firstName: body.firstName,
          lastName: body.lastName,
          gradeLevel: body.gradeLevel as GradeLevel,
          elpaLevel: data.elpa_level as ELPALevel,
          literacyLevel: body.literacyLevel || data.elpa_level as ELPALevel,
          numeracyLevel: body.numeracyLevel || data.elpa_level as ELPALevel,
          nativeLanguage: body.nativeLanguage as SupportedLanguage,
          additionalLanguages: body.additionalLanguages || [],
          interests: body.interests || [],
          learningStyles: body.learningStyles || ["visual"],
          culturalBackground: body.culturalBackground || "",
          accommodations: body.accommodations || [],
          schoolId: body.schoolId || "",
          teacherId: data.teacher_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        }
        
        return NextResponse.json({ student }, { status: 201 })
      }
    }

    // Return mock response when Supabase not configured
    const student: StudentProfile = {
      id: crypto.randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      gradeLevel: body.gradeLevel as GradeLevel,
      elpaLevel: body.elpaLevel || 1,
      literacyLevel: body.literacyLevel || body.elpaLevel || 1,
      numeracyLevel: body.numeracyLevel || body.elpaLevel || 1,
      nativeLanguage: body.nativeLanguage || "other",
      additionalLanguages: body.additionalLanguages || [],
      interests: body.interests || [],
      learningStyles: body.learningStyles || ["visual"],
      culturalBackground: body.culturalBackground || "",
      accommodations: body.accommodations || [],
      schoolId: body.schoolId || "",
      teacherId: body.teacherId || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create student"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
