/**
 * API Authentication Middleware
 * Provides JWT authentication and role-based access control for API routes
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface AuthenticatedUser {
  id: string
  email: string
  role: "teacher" | "student" | "admin"
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser
}

/**
 * Middleware to protect API routes with JWT authentication
 */
export async function withAuth(
  req: NextRequest,
  handler: (authReq: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      )
    }

    // Get user profile to determine role
    const { data: teacherData } = await supabase
      .from("teachers")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", session.user.id)
      .single()

    const role = teacherData?.role || (studentData ? "student" : "teacher")

    // Create authenticated request object
    const authReq = Object.assign(req, {
      user: {
        id: session.user.id,
        email: session.user.email!,
        role: role as "teacher" | "student" | "admin"
      }
    }) as AuthenticatedRequest

    return handler(authReq)
  } catch {
    return NextResponse.json(
      { error: "Authentication failed", message: "Unable to verify credentials" },
      { status: 401 }
    )
  }
}

/**
 * Middleware to enforce role-based access
 * Wraps a handler function with authentication and role verification
 */
export function withRole(
  allowedRoles: ("teacher" | "student" | "admin")[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    return withAuth(req, async (authReq) => {
      if (!allowedRoles.includes(authReq.user.role)) {
        return NextResponse.json(
          { 
            error: "Forbidden", 
            message: "Insufficient permissions for this action",
            requiredRoles: allowedRoles,
            currentRole: authReq.user.role
          },
          { status: 403 }
        )
      }
      return handler(authReq)
    })
  }
}

/**
 * Helper to get current user from server context
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    // Get user profile to determine role
    const { data: teacherData } = await supabase
      .from("teachers")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", session.user.id)
      .single()

    const role = teacherData?.role || (studentData ? "student" : "teacher")

    return {
      id: session.user.id,
      email: session.user.email!,
      role: role as "teacher" | "student" | "admin"
    }
  } catch {
    return null
  }
}
