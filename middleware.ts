/**
 * Next.js Middleware
 * Handles authentication and route protection
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/student/session", // Student sessions use separate auth
]

// Paths that require teacher/admin role
const TEACHER_PATHS = [
  "/teacher",
  "/classroom",
]

// Paths that require student role
const STUDENT_PATHS = [
  "/student/activity",
  "/student/portal",
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + "/")
  )

  // Allow API routes to handle their own auth
  if (path.startsWith("/api")) {
    return response
  }

  // Allow static files
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".") // Files with extensions
  ) {
    return response
  }

  // If public path, allow access
  if (isPublicPath) {
    // If logged in and trying to access login/signup, redirect to appropriate dashboard
    if (session && (path === "/login" || path === "/signup")) {
      return NextResponse.redirect(new URL("/teacher/builder", request.url))
    }
    return response
  }

  // Protected route - require authentication
  if (!session) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-based access control
  const isTeacherPath = TEACHER_PATHS.some(p => path.startsWith(p))
  const isStudentPath = STUDENT_PATHS.some(p => path.startsWith(p))

  if (isTeacherPath || isStudentPath) {
    // Get user role from database
    const { data: teacherData } = await supabase
      .from("teachers")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const { data: studentData } = await supabase
      .from("students")
      .select("id")
      .eq("id", session.user.id)
      .single()

    const isTeacher = !!teacherData
    const isStudent = !!studentData
    const isAdmin = teacherData?.role === "admin"

    // Teachers and admins can access teacher paths
    if (isTeacherPath && !isTeacher && !isAdmin) {
      return NextResponse.redirect(new URL("/student", request.url))
    }

    // Students can only access student paths
    if (isStudentPath && !isStudent && !isAdmin) {
      return NextResponse.redirect(new URL("/teacher/builder", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
