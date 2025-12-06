# 🎯 LinguaFlow Gap Closure Implementation Plan

**Document Version:** 1.0  
**Created:** December 6, 2025  
**Scope:** Production-ready implementation of all identified gaps  
**Est. Timeline:** 4-6 weeks for full production deployment  
**Priority:** Critical for K-12 school deployment

---

## Executive Overview

This plan provides detailed technical implementation steps for closing the 7 gaps identified in the pre-submission audit. The plan is organized by priority, with **Critical** gaps (Authentication, Rate Limiting) addressed first, followed by **High Priority** (WCAG, Testing), and finally **Enhancements** (Preview Panel, Multi-AI, Curriculum).

**Total Effort Estimate:** 25-35 developer days  
**Recommended Team:** 2 developers (parallel track)  
**Risk Reduction:** Addresses all production blockers for school deployment

---

## 🎯 GAP #1: Authentication & Authorization System

**Priority:** 🔴 **CRITICAL**  
**Effort:** 3-4 days  
**Risk:** Student data privacy violations, FERPA/PIPEDA non-compliance  
**Status:** Not implemented (intentional for demo)

### 1.1 Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘

User Types:
├── Teacher (can create workflows, manage classrooms, view all student data)
├── Student (can execute workflows, view own progress)
└── Admin (can manage teachers/schools, system configuration)

Auth Flow:
1. User signs up/logs in via Supabase Auth
2. JWT token issued and stored in cookie
3. Middleware verifies token on all API routes
4. Role-based access control enforced
5. Row Level Security filters data by user context
```

### 1.2 Implementation Steps

#### Day 1: Supabase Auth Setup

**Step 1.1: Configure Supabase Authentication**

```bash
# In Supabase dashboard:
# 1. Enable Email+Password auth
# 2. Configure Google OAuth (for school Google accounts)
# 3. Set up proper redirect URLs
# 4. Enable PKCE flow for security
```

**Step 1.2: Create Auth Context**

File: `contexts/auth-context.tsx`

```typescript
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

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
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<TeacherProfile | StudentProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<TeacherProfile | StudentProfile | null>(null)
  const [userType, setUserType] = useState<"teacher" | "student" | "admin" | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user)
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
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setProfile(null)
          setUserType(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const loadUserProfile = async (user: User) => {
    try {
      // Check if teacher
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", user.id)
        .single()

      if (teacherData) {
        setProfile(teacherData as TeacherProfile)
        setUserType(teacherData.role)
        return
      }

      // Check if student
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single()

      if (studentData) {
        setProfile(studentData as StudentProfile)
        setUserType("student")
        return
      }

      // New user, create teacher profile by default
      const newTeacher: Omit<TeacherProfile, "created_at" | "updated_at"> = {
        id: user.id,
        email: user.email!,
        display_name: user.user_metadata?.full_name || user.email!.split("@")[0],
        school_name: user.user_metadata?.school_name,
        school_district: user.user_metadata?.school_district,
        role: "teacher"
      }

      const { data: created } = await supabase
        .from("teachers")
        .insert(newTeacher)
        .select()
        .single()

      if (created) {
        setProfile(created as TeacherProfile)
        setUserType("teacher")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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

  const value = {
    user,
    session,
    profile,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
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
```

#### Day 2: Authentication UI

**Step 2.1: Create Login Page**

File: `app/login/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      router.push("/teacher/builder")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to LinguaFlow</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2.2: Add Auth Middleware**

File: `middleware.ts`

```typescript
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/", "/login", "/signup", "/student/session/*"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Allow public paths
  if (PUBLIC_PATHS.some(publicPath => 
    publicPath === path || 
    (publicPath.includes("*") && path.startsWith(publicPath.replace("/*", "")))
  )) {
    return res
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

#### Day 3: API Route Protection

**Step 3.1: Create API Authentication Wrapper**

File: `lib/auth/api-middleware.ts`

```typescript
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    role: "teacher" | "student" | "admin"
  }
}

/**
 * Middleware to protect API routes with JWT authentication
 */
export async function withAuth(
  req: NextRequest,
  handler: (authReq: AuthenticatedRequest) => Promise<NextResponse>
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error || !session) {
    return NextResponse.json(
      { error: "Unauthorized" },
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

  // Attach user to request
  const authReq = req as AuthenticatedRequest
  authReq.user = {
    id: session.user.id,
    email: session.user.email!,
    role: role as "teacher" | "student" | "admin"
  }

  return handler(authReq)
}

/**
 * Middleware to enforce role-based access
 */
export function withRole(
  allowedRoles: ("teacher" | "student" | "admin")[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withAuth(req, async (authReq) => {
      if (!allowedRoles.includes(authReq.user.role)) {
        return NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        )
      }
      return handler(authReq)
    })
  }
}
```

**Step 3.2: Protect API Routes**

Update all API routes to use authentication. Example for `/api/workflows`:

File: `app/api/workflows/route.ts`

```typescript
import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/api-middleware"
import { createClient } from "@/lib/supabase/client"

// GET /api/workflows - List workflows for teacher
export const GET = withRole(["teacher", "admin"], async (req) => {
  const supabase = createClient()
  
  const { data: workflows, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("teacher_id", req.user.id) // Scope to teacher
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(workflows)
})

// POST /api/workflows - Create new workflow
export const POST = withRole(["teacher", "admin"], async (req) => {
  const supabase = createClient()
  const body = await req.json()
  
  const { data: workflow, error } = await supabase
    .from("workflows")
    .insert({
      ...body,
      teacher_id: req.user.id, // Force teacher_id from auth
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(workflow)
})
```

#### Day 4: Row Level Security & Data Scoping

**Step 4.1: Update RLS Policies**

File: Update `scripts/002-create-policies.sql`

```sql
-- Workflows: Teachers can only see their own workflows
CREATE POLICY "Teachers can manage own workflows" ON workflows
  FOR ALL USING (auth.uid() = teacher_id);

-- Students: Students can only see their own data
CREATE POLICY "Students can view own profile" ON students
  FOR SELECT USING (auth.uid() = id);

-- Classrooms: Teachers can manage their classrooms
CREATE POLICY "Teachers can manage own classrooms" ON classrooms
  FOR ALL USING (
    auth.uid() = teacher_id OR
    auth.uid() IN (
      SELECT teacher_id FROM classrooms WHERE id = classrooms.id
    )
  );

-- Progress data scoped to teacher's students
CREATE POLICY "Teachers can view student progress" ON progress
  FOR SELECT USING (
    auth.uid() IN (
      SELECT teacher_id FROM students WHERE id = progress.student_id
    )
  );
```

**Step 4.2: Create Student Registration Flow**

File: `app/teacher/students/new/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

export default function NewStudentPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    display_name: "",
    grade_level: 4,
    elpa_level: 3,
    primary_language: "en"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const password = crypto.randomUUID() // Auto-generated password
    const email = `${formData.display_name.toLowerCase().replace(/\s+/g, '.')}@student.linguaflow.local`

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "student",
        display_name: formData.display_name
      }
    })

    if (authError) throw authError

    // 2. Create student profile
    const { error: profileError } = await supabase.from("students").insert({
      id: authData.user.id,
      display_name: formData.display_name,
      grade_level: formData.grade_level,
      elpa_level: formData.elpa_level,
      primary_language: formData.primary_language,
      teacher_id: user?.id,
      classroom_id: formData.classroom_id
    })

    if (profileError) throw profileError
    
    // Show student credentials to teacher
    alert(`Student account created! Email: ${email}, Password: ${password}`)
  }

  // ... form UI
}
```

---

## 🔒 GAP #2: Rate Limiting & Cost Protection

**Priority:** 🔴 **CRITICAL**  
**Effort:** 2-3 days  
**Risk:** AI API abuse, cost overrun, DDoS vulnerability  
**Status:** Not implemented

### 2.1 Implementation Strategy

Use Upstash Redis for distributed rate limiting (serverless-friendly):

```
Rate Limiting Rules:
├── Per-teacher daily limit: 500 workflow executions
├── Per-classroom hourly limit: 100 executions  
├── Per-IP minute limit: 30 requests
└── Burst allowance: 10 executions/minute

Cost Protection:
├── Monthly budget alerts at 80%, 95%, 100%
├── Automatic throttling when approaching limits
├── Teacher dashboard showing usage/costs
└── Student-level execution quotas
```

### 2.2 Implementation Steps

#### Day 1: Upstash Setup

**Step 1.1: Install Dependencies**

```bash
npm install @upstash/redis @upstash/ratelimit
```

**Step 1.2: Configure Upstash Client**

File: `lib/upstash/client.ts`

```typescript
import { Redis } from "@upstash/redis"

export const redis = Redis.fromEnv() // Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

**Step 1.3: Create Rate Limiter**

File: `lib/middleware/rate-limiter.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/upstash/client"

// Daily limit for teachers: 500 executions
export const teacherDailyLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(500, "86400 s"), // 24 hours
  analytics: true,
})

// Hourly limit per classroom: 100 executions
export const classroomHourlyLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(100, "3600 s"), // 1 hour
  analytics: true,
})

// Per-minute burst limit: 10 executions
export const burstLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
})

// Per-IP limit: 30 requests/minute
export const ipLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
})

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkExecutionLimit(
  teacherId: string,
  classroomId?: string
): Promise<{
  allowed: boolean
  limits: {
    teacher: RateLimitResult
    classroom?: RateLimitResult
    burst: RateLimitResult
  }
}> {
  const [teacherResult, classroomResult, burstResult] = await Promise.all([
    teacherDailyLimit.limit(`teacher:${teacherId}:daily`),
    classroomId ? classroomHourlyLimit.limit(`classroom:${classroomId}:hourly`) : null,
    burstLimit.limit(`teacher:${teacherId}:burst`),
  ])

  const allowed = 
    teacherResult.success &&
    (!classroomResult || classroomResult.success) &&
    burstResult.success

  return {
    allowed,
    limits: {
      teacher: teacherResult,
      classroom: classroomResult || undefined,
      burst: burstResult,
    },
  }
}
```

#### Day 2: Apply Rate Limiting to API Routes

**Step 2.1: Update Execute API with Rate Limiting**

File: `app/api/execute/route.ts`

```typescript
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/api-middleware"
import { checkExecutionLimit } from "@/lib/middleware/rate-limiter"
import { headers } from "next/headers"
import { ipLimit } from "@/lib/middleware/rate-limiter"

export const POST = withAuth(async (req) => {
  const headersList = headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { classroom_id } = await req.json()
  
  // Check IP rate limit
  const ipResult = await ipLimit.limit(`ip:${ip}`)
  if (!ipResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        details: "IP rate limit exceeded. Please wait before trying again.",
        retryAfter: ipResult.reset,
      },
      { status: 429 }
    )
  }

  // Check execution limits
  const rateCheck = await checkExecutionLimit(req.user.id, classroom_id)
  
  if (!rateCheck.allowed) {
    // Determine which limit was hit
    const limitType = !rateCheck.limits.teacher.success
      ? "daily teacher limit"
      : !rateCheck.limits.burst.success
      ? "burst limit"
      : "classroom hourly limit"

    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        details: `You have reached your ${limitType}. Limits reset at ${new Date(
          Math.max(
            rateCheck.limits.teacher.reset,
            rateCheck.limits.classroom?.reset || 0,
            rateCheck.limits.burst.reset
          )
        ).toLocaleString()}.`,
        limits: {
          teacher: {
            remaining: rateCheck.limits.teacher.remaining,
            total: rateCheck.limits.teacher.limit,
          },
          classroom: rateCheck.limits.classroom && {
            remaining: rateCheck.limits.classroom.remaining,
            total: rateCheck.limits.classroom.limit,
          },
          burst: {
            remaining: rateCheck.limits.burst.remaining,
            total: rateCheck.limits.burst.limit,
          },
        },
      },
      { status: 429 }
    )
  }

  // Log the execution attempt
  await logExecution(req.user.id, classroom_id, {
    teacherRemaining: rateCheck.limits.teacher.remaining,
    classroomRemaining: rateCheck.limits.classroom?.remaining,
  })

  // Continue with normal execution
  const result = await executeWorkflow(req)
  return result
})

async function logExecution(
  teacherId: string,
  classroomId: string | undefined,
  limits: any
) {
  const supabase = createClient()
  
  await supabase.from("execution_logs").insert({
    teacher_id: teacherId,
    classroom_id: classroomId,
    timestamp: new Date().toISOString(),
    limits_snapshot: limits,
  })
}
```

**Step 2.2: Create Usage Dashboard Component**

File: `components/teacher/usage-dashboard.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UsageStats {
  teacherId: string
  dailyUsed: number
  dailyLimit: number
  hourlyUsed?: number
  hourlyLimit?: number
  periodReset: Date
  costEstimate: number // in USD
}

export function UsageDashboard({ teacherId }: { teacherId: string }) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsageStats()
  }, [teacherId])

  const loadUsageStats = async () => {
    try {
      const res = await fetch(`/api/teacher/usage?teacher_id=${teacherId}`)
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load usage stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading usage statistics...</div>
  if (!stats) return <div>Failed to load usage statistics</div>

  const dailyPercentage = (stats.dailyUsed / stats.dailyLimit) * 100
  const hourlyPercentage = stats.hourlyUsed 
    ? (stats.hourlyUsed / stats.hourlyLimit) * 100 
    : 0

  return (
    <div className="space-y-4">
      {dailyPercentage > 80 && (
        <Alert variant={dailyPercentage > 95 ? "destructive" : "warning"}>
          <AlertDescription>
            {dailyPercentage > 95 
              ? "⚠️ You have reached 95% of your daily limit. Please contact admin to increase quota."
              : "⚠️ You are approaching your daily execution limit."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Executions</span>
              <span>{stats.dailyUsed} / {stats.dailyLimit}</span>
            </div>
            <Progress value={dailyPercentage} className="h-2" />
            <p className="text-xs text-slate-500">
              Resets: {stats.periodReset.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {stats.hourlyUsed !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Hourly Usage (Classroom)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Executions</span>
                <span>{stats.hourlyUsed} / {stats.hourlyLimit}</span>
              </div>
              <Progress value={hourlyPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estimated Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.costEstimate.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500">
            Based on ${(stats.costEstimate / stats.dailyUsed).toFixed(3)} per execution
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Day 3: Alert System Integration

**Step 3.1: Add Budget Alert Notifications**

File: `lib/cost-alerts.ts`

```typescript
import { createClient } from "@/lib/supabase/client"

const COST_THRESHOLDS = [
  { percentage: 80, message: "You've used 80% of your monthly budget" },
  { percentage: 95, message: "⚠️ CRITICAL: You've used 95% of your monthly budget" },
  { percentage: 100, message: "🛑 BUDGET EXCEEDED: All executions paused" }
]

export async function checkBudgetAlerts(teacherId: string) {
  const supabase = createClient()
  
  // Get monthly usage
  const { data: usage } = await supabase
    .from("execution_logs")
    .select("*")
    .gte("timestamp", new Date(new Date().setDate(1)).toISOString())
    .eq("teacher_id", teacherId)

  const monthlyLimit = 15000 // executions per month
  const used = usage?.length || 0
  const percentage = (used / monthlyLimit) * 100

  // Check thresholds
  for (const threshold of COST_THRESHOLDS) {
    if (percentage >= threshold.percentage) {
      await sendBudgetAlert(teacherId, threshold.message, percentage)
    }
  }
}

async function sendBudgetAlert(teacherId: string, message: string, percentage: number) {
  const supabase = createClient()
  
  // Add to teacher_alerts table
  await supabase.from("teacher_alerts").insert({
    teacher_id: teacherId,
    type: "budget_warning",
    severity: percentage >= 95 ? "high" : "medium",
    message,
    created_at: new Date().toISOString(),
    read: false
  })

  // Send email notification (if configured)
  if (process.env.SENDGRID_API_KEY) {
    await sendEmailAlert(teacherId, message)
  }
}
```

---

## 🎨 GAP #5: WCAG 2.1 AA Accessibility Compliance

**Priority:** 🔴 **HIGH** (Legal requirement for K-12)  
**Effort:** 3-5 days for audit + fixes  
**Risk:** Legal liability, excluding students with disabilities  
**Status:** Not verified

### 5.1 Accessibility Audit Process

```
Compliance Checklist:
├── Perceivable (WCAG 1.x)
│   ├── Text alternatives for non-text content
│   ├── Captions for multimedia
│   ├── Adaptable layout (responsive)
│   └── Distinguishable (color contrast, audio control)
├── Operable (WCAG 2.x)
│   ├── Keyboard accessible (all functionality)
│   ├── Enough time (no timeouts)
│   ├── Seizure safe (no flashing)
│   └── Navigable (focus order, links, headings)
├── Understandable (WCAG 3.x)
│   ├── Readable text
│   ├── Predictable navigation
│   └── Input assistance (labels, errors)
└── Robust (WCAG 4.x)
    ├── Valid HTML
    └── Name/role/value for custom components
```

### 5.2 Implementation Steps

#### Day 1: Automated Audit & Baseline

**Step 1.1: Install Testing Tools**

```bash
npm install --save-dev axe-core @axe-core/react @axe-core/cli pa11y lighthouse
```

**Step 1.2: Create Automated Test Script**

File: `scripts/accessibility-audit.js`

```javascript
const axe = require("axe-core")
const { chromium } = require("playwright")

const PAGES_TO_TEST = [
  { path: "/", name: "Landing Page" },
  { path: "/login", name: "Login Page" },
  { path: "/teacher/builder", name: "Workflow Builder" },
  { path: "/student/session/test", name: "Student Session" },
  { path: "/classroom/test", name: "Classroom Dashboard" }
]

async function runAccessibilityAudit() {
  const browser = await chromium.launch()
  const violations = []

  for (const page of PAGES_TO_TEST) {
    const context = await browser.newContext()
    const browserPage = await context.newPage()
    
    try {
      await browserPage.goto(`http://localhost:3000${page.path}`)
      
      // Inject axe-core
      await browserPage.addScriptTag({
        path: require.resolve("axe-core")
      })
      
      // Run audit
      const results = await browserPage.evaluate(() => {
        return axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa"] // WCAG 2.1 Level A & AA
          }
        })
      })
      
      if (results.violations.length > 0) {
        violations.push({
          page: page.name,
          path: page.path,
          violations: results.violations
        })
      }
      
      console.log(`✓ ${page.name}: ${results.violations.length} violations`)
    } catch (error) {
      console.error(`✗ ${page.name}:`, error.message)
    }
    
    await context.close()
  }
  
  await browser.close()
  
  // Generate report
  if (violations.length > 0) {
    console.log("\n❌ Accessibility Violations Found:")
    violations.forEach(({ page, path, violations }) => {
      console.log(`\n${page} (${path}):`)
      violations.forEach(violation => {
        console.log(`  - [${violation.impact}] ${violation.description}`)
        console.log(`    Help: ${violation.help}`)
      })
    })
    process.exit(1)
  } else {
    console.log("\n✅ All pages pass WCAG 2.1 AA audit!")
    process.exit(0)
  }
}

runAccessibilityAudit().catch(console.error)
```

**Step 1.3: Run Baseline Audit**

```bash
# Add to package.json
{
  "scripts": {
    "audit:accessibility": "node scripts/accessibility-audit.js"
  }
}

# Run audit
npm run build && npm start &
sleep 5 # Wait for server
npm run audit:accessibility
```

#### Day 2: Fix Color Contrast Issues

**Step 2.1: Audit Current Colors**

Based on typical violations found:

```typescript
// File: styles/accessibility-fixes.css

/* Fix node colors for WCAG 2.1 AA compliance (4.5:1 contrast ratio) */

/* Learning Nodes - Blue */
.bg-node-learning {
  background-color: #1e3a8a; /* Darker blue for 4.5:1 contrast on white text */
}
.border-node-learning {
  border-color: #1e3a8a;
}

/* AI Nodes - Purple */
.bg-node-ai {
  background-color: #6b21a8; /* Darker purple */
}
.border-node-ai {
  border-color: #6b21a8;
}

/* Scaffolding Nodes - Green */
.bg-node-scaffolding {
  background-color: #166534; /* Darker green */
}
.border-node-scaffolding {
  border-color: #166534;
}

/* Interaction Nodes - Orange */
.bg-node-interaction {
  background-color: #c2410c; /* Darker orange */
}
.border-node-interaction {
  border-color: #c2410c;
}

/* Ensure all text meets contrast requirements */
.text-white {
  color: #ffffff;
}

.text-slate-900 {
  color: #0f172a; /* Ensure dark enough contrast on light backgrounds */
}
```

**Step 2.2: Add High Contrast Mode Toggle**

File: `components/accessibility/high-contrast-toggle.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }, [enabled])

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="high-contrast"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <Label htmlFor="high-contrast">High Contrast Mode</Label>
    </div>
  )
}
```

**Step 2.3: Create High Contrast Styles**

File: `styles/high-contrast.css`

```css
/* High contrast mode for WCAG AAA compliance (7:1 ratio) */
.high-contrast {
  /* Increase all text contrast */
  --color-text-primary: #000000;
  --color-text-secondary: #000000;
  --color-background: #ffffff;
  
  /* Ensure borders are visible */
  --color-border: #000000;
  
  /* Remove subtle backgrounds */
  --color-surface: #ffffff;
}

.high-contrast .bg-slate-50 {
  background-color: #ffffff !important;
}

.high-contrast .text-slate-500 {
  color: #000000 !important;
}

.high-contrast button,
.high-contrast .btn {
  border: 2px solid #000000;
}

/* Add focus indicators */
.high-contrast *:focus {
  outline: 3px solid #000000;
  outline-offset: 2px;
}
```

#### Day 3: Keyboard Navigation

**Step 3.1: Fix Canvas Keyboard Accessibility**

File: `components/builder/workflow-canvas.tsx`

```typescript
import { useEffect, useRef } from "react"
import ReactFlow, { ReactFlowProvider } from "reactflow"

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A: Add new node
      if (event.ctrlKey && event.key === "a") {
        event.preventDefault()
        // Open node palette
        setShowNodePalette(true)
      }
      
      // Delete: Remove selected node
      if (event.key === "Delete" && selectedNode) {
        event.preventDefault()
        handleDeleteNode(selectedNode)
      }
      
      // Arrow keys: Move selected node
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && selectedNode) {
        event.preventDefault()
        handleMoveNode(selectedNode, event.key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedNode])

  return (
    <div 
      ref={reactFlowWrapper}
      className="w-full h-full"
      role="application"
      aria-label="Workflow canvas"
      tabIndex={0} // Make canvas focusable
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          // Add keyboard navigation
          deleteKeyCode={["Delete", "Backspace"]}
          selectionKeyCode={["Shift"]}
          multiSelectionKeyCode={["Control"]}
        />
      </ReactFlowProvider>
    </div>
  )
}
```

**Step 3.2: Add Skip Links**

File: `components/accessibility/skip-links.tsx`

```typescript
"use client"

import { useState } from "react"

export function SkipLinks() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="skip-links">
      <a 
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 ${
          visible ? "block" : ""
        }`}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-48 bg-blue-600 text-white p-2 z-50 ${
          visible ? "block" : ""
        }`}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        Skip to navigation
      </a>
    </div>
  )
}
```

Add to `app/layout.tsx`:

```typescript
import { SkipLinks } from "@/components/accessibility/skip-links"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLinks />
        <div id="navigation">...</div>
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
```

#### Day 4: Screen Reader Compatibility

**Step 4.1: Add ARIA Labels to Node Components**

File: Update node components with proper ARIA

```typescript
// Example for student-profile-node.tsx

export function StudentProfileNode({ data }) {
  return (
    <div 
      className="node-container"
      role="region"
      aria-label={`Student profile: ${data.displayName || "Not configured"}`}
    >
      <div className="node-header">
        <h3 id={`${data.id}-title`}>Student Profile</h3>
        <span 
          className="visually-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          {data.isConfigured ? "Configured" : "Needs configuration"}
        </span>
      </div>
      
      <div className="node-settings" aria-labelledby={`${data.id}-title`}>
        {/* Settings form with proper labels */}
        <label htmlFor={`${data.id}-student-name`}>
          Student Name
        </label>
        <input 
          id={`${data.id}-student-name`}
          type="text"
          aria-describedby={`${data.id}-name-help`}
        />
        <p id={`${data.id}-name-help`} className="help-text">
          Enter the student's display name
        </p>
      </div>
    </div>
  )
}
```

**Step 4.2: Add Live Regions for Dynamic Content**

File: `components/student/learning-interface.tsx`

```typescript
// Add live region for streaming content
<div 
  className="content-area"
  aria-live="polite"
  aria-atomic="false"
  aria-busy={isStreaming ? "true" : "false"}
>
  {streamedContent && (
    <div className="streaming-content">
      {streamedContent}
    </div>
  )}
</div>

// Announce progress changes
useEffect(() => {
  if (progress > 0) {
    // Update live region
    const liveRegion = document.getElementById("progress-announcement")
    if (liveRegion) {
      liveRegion.textContent = `Progress: ${progress} out of ${total} questions completed`
    }
  }
}, [progress, total])

// In JSX:
<div 
  id="progress-announcement"
  className="sr-only"
  role="status"
  aria-live="polite"
/>
```

**Step 4.3: Fix Form Accessibility**

File: `components/ui/form.tsx` (enhanced)

```typescript
import { forwardRef } from "react"
import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  error?: string
  required?: boolean
  description?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, name, type = "text", error, required, description, ...props }, ref) => {
    const inputId = `field-${name}`
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>
          {label}
          {required && <span aria-label="required"> *</span>}
        </Label>
        
        {description && (
          <p id={descriptionId} className="text-sm text-slate-600">
            {description}
          </p>
        )}
        
        <Input
          id={inputId}
          name={name}
          type={type}
          required={required}
          aria-describedby={[errorId, descriptionId].filter(Boolean).join(" ")}
          aria-invalid={error ? "true" : "false"}
          ref={ref}
          {...props}
        />
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"
```

---

## 🧪 GAP #6: Testing Infrastructure

**Priority:** 🟡 **HIGH** (Production reliability)  
**Effort:** 5-7 days  
**Risk:** Undetected bugs, regressions, deployment failures  
**Status:** Completely missing

### 6.1 Testing Strategy

```
Testing Pyramid:
├── Unit Tests (70%)
│   ├── Node runners (30+ functions)
│   ├── AI client functions
│   ├── Utility functions
│   └── Type validation
├── Integration Tests (20%)
│   ├── Workflow execution engine
│   ├── API route handlers
│   ├── Database operations
│   └── Authentication flow
└── E2E Tests (10%)
    ├── Teacher creates and publishes workflow
    ├── Student completes learning session
    ├── Real-time classroom monitoring
    └── Full user journeys
```

### 6.2 Implementation Steps

#### Day 1: Test Environment Setup

**Step 1.1: Install Testing Dependencies**

```bash
npm install --save-dev \
  jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @types/jest jest-environment-jsdom \
  playwright @playwright/test \
  msw @mswjs/data \
  axe-core jest-axe
```

**Step 1.2: Configure Jest**

File: `jest.config.js`

```javascript
const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/*.stories.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
}

module.exports = createJestConfig(customJestConfig)
```

File: `jest.setup.js`

```javascript
import "@testing-library/jest-dom"
import { toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)
```

#### Day 2: Unit Tests for Node Runners

**Step 2.1: Create Test Utilities**

File: `lib/engine/__tests__/test-helpers.ts`

```typescript
import type { LinguaFlowNode, ExecutionContext } from "@/lib/types"
import type { StudentProfile } from "@/lib/types/student"

export const mockStudent: StudentProfile = {
  id: "student-123",
  display_name: "Test Student",
  grade_level: 4,
  elpa_level: 3,
  primary_language: "zh",
  secondary_languages: ["en"],
  interests: ["math", "science"],
  strengths: [],
  areasForGrowth: [],
  accessibility_needs: {
    visual_support: false,
    audio_support: false,
    motor_support: false,
    extended_time: false
  },
  teacher_id: "teacher-123",
  classroom_id: "classroom-123"
}

export const mockContext: ExecutionContext = {
  studentProfile: mockStudent,
  variables: {},
  conversationHistory: [],
  accumulatedContent: [],
  currentLanguageLevel: 3,
  adaptations: []
}

export const createMockNode = (overrides = {}): LinguaFlowNode => ({
  id: "node-123",
  type: "student-profile",
  position: { x: 0, y: 0 },
  data: {
    label: "Test Node",
    nodeType: "student-profile",
    category: "learning",
    config: {}
  },
  ...overrides
})
```

**Step 2.2: Test Student Profile Node**

File: `lib/engine/__tests__/node-runners.student-profile.test.ts`

```typescript
import { runStudentProfileNode } from "../node-runners"
import { mockContext, createMockNode } from "./test-helpers"

describe("runStudentProfileNode", () => {
  it("should return student profile from context", async () => {
    const node = createMockNode({ type: "student-profile" })
    const result = await runStudentProfileNode(node, {}, mockContext)

    expect(result.output.studentProfile).toEqual(mockContext.studentProfile)
    expect(result.output.elpaLevel).toBe(mockContext.currentLanguageLevel)
    expect(result.output.nativeLanguage).toBe(mockStudent.primary_language)
    expect(result.output.gradeLevel).toBe(mockStudent.grade_level)
  })

  it("should handle missing student profile gracefully", async () => {
    const node = createMockNode({ type: "student-profile" })
    const emptyContext = { ...mockContext, studentProfile: undefined }

    await expect(
      runStudentProfileNode(node, {}, emptyContext)
    ).rejects.toThrow("Student profile not found in context")
  })
})
```

**Step 2.3: Test AI Client with Mocking**

File: `lib/engine/__tests__/ai-client.test.ts`

```typescript
import { generateTextCompletion, streamTextCompletion } from "../ai-client"
import { rest } from "msw"
import { setupServer } from "msw/node"

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("AI Client", () => {
  describe("generateTextCompletion", () => {
    it("should call OpenAI API with correct parameters", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Generated content" } }],
        usage: { total_tokens: 50 }
      }

      server.use(
        rest.post("https://api.openai.com/v1/chat/completions", (req, res, ctx) => {
          return res(ctx.json(mockResponse))
        })
      )

      const result = await generateTextCompletion({
        model: "gpt-4o-mini",
        prompt: "Test prompt",
        temperature: 0.7
      })

      expect(result.output).toBe("Generated content")
    })

    it("should fallback to mock when API key is not set", async () => {
      // Temporarily clear API key
      const originalKey = process.env.AI_OPENAI_API_KEY
      delete process.env.AI_OPENAI_API_KEY

      const result = await generateTextCompletion({
        model: "gpt-4o-mini",
        prompt: "Test prompt",
      })

      expect(result.output).toBeTruthy() // Should return mock content
      expect(result.mock).toBe(true)

      // Restore API key
      process.env.AI_OPENAI_API_KEY = originalKey
    })
  })

  describe("streamTextCompletion", () => {
    it("should stream content chunks", async () => {
      const mockChunks = ["Hello ", "world ", "from ", "AI"]
      let chunkIndex = 0

      server.use(
        rest.post("https://api.openai.com/v1/chat/completions", (req, res, ctx) => {
          return res(
            ctx.json({
              choices: [{
                message: { content: mockChunks[chunkIndex++] }
              }]
            })
          )
        })
      )

      const chunks = []
      for await (const chunk of streamTextCompletion({
        model: "gpt-4o-mini",
        prompt: "Test prompt",
      })) {
        chunks.push(chunk)
      }

      expect(chunks.join("")).toBe(mockChunks.join(""))
    })
  })
})
```

#### Day 3: API Route Integration Tests

**Step 3.1: Test Workflow API**

File: `app/api/workflows/__tests__/route.test.ts`

```typescript
import { POST } from "../route"
import { createClient } from "@/lib/supabase/client"
import { mockTeacherSession } from "./test-helpers"

// Mock Supabase
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn()
}))

jest.mock("@/lib/auth/api-middleware", () => ({
  withRole: (allowedRoles, handler) => handler
}))

describe("POST /api/workflows", () => {
  it("should create workflow for authenticated teacher", async () => {
    const mockWorkflow = {
      name: "Test Workflow",
      nodes: [],
      edges: []
    }

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({
        data: [{ id: "wf-123", ...mockWorkflow }],
        error: null
      }),
      select: jest.fn().mockReturnThis(),
      single: jest.fn()
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

    const request = new Request("http://localhost:3000/api/workflows", {
      method: "POST",
      body: JSON.stringify(mockWorkflow),
      headers: { "Content-Type": "application/json" }
    })

    // Mock authenticated request
    request.user = { id: "teacher-123", role: "teacher" }

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.id).toBe("wf-123")
    expect(mockSupabase.from).toHaveBeenCalledWith("workflows")
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      ...mockWorkflow,
      teacher_id: "teacher-123"
    })
  })

  it("should reject unauthorized requests", async () => {
    const request = new Request("http://localhost:3000/api/workflows", {
      method: "POST",
      body: JSON.stringify({ name: "Test" })
    })

    // No user on request
    const response = await POST(request)
    
    expect(response.status).toBe(401)
  })
})
```

**Step 3.2: Create Test Database Seeder**

File: `lib/supabase/__tests__/seed.ts`

```typescript
import { createClient } from "@/lib/supabase/client"

export async function seedTestData() {
  const supabase = createClient()
  
  // Create test teacher
  const { data: teacher } = await supabase.from("teachers").insert({
    id: "test-teacher-123",
    email: "teacher@example.com",
    display_name: "Test Teacher",
    role: "teacher"
  })

  // Create test classroom
  const { data: classroom } = await supabase.from("classrooms").insert({
    name: "Test Classroom",
    grade_level: 4,
    teacher_id: "test-teacher-123"
  })

  // Create test students
  const { data: students } = await supabase.from("students").insert([
    {
      display_name: "Test Student 1",
      grade_level: 4,
      elpa_level: 3,
      primary_language: "zh",
      classroom_id: classroom.id,
      teacher_id: "test-teacher-123"
    },
    {
      display_name: "Test Student 2",
      grade_level: 4,
      elpa_level: 2,
      primary_language: "es",
      classroom_id: classroom.id,
      teacher_id: "test-teacher-123"
    }
  ])

  // Create test workflow template
  const { data: workflow } = await supabase.from("workflows").insert({
    name: "Test Math Workflow",
    teacher_id: "test-teacher-123",
    nodes: [...], // Minimal test workflow
    edges: []
  })

  return { teacher, classroom, students, workflow }
}

export async function cleanupTestData() {
  const supabase = createClient()
  
  // Delete in reverse order to maintain referential integrity
  await supabase.from("workflows").delete().eq("teacher_id", "test-teacher-123")
  await supabase.from("students").delete().eq("teacher_id", "test-teacher-123")
  await supabase.from("classrooms").delete().eq("teacher_id", "test-teacher-123")
  await supabase.from("teachers").delete().eq("id", "test-teacher-123")
}
```

#### Day 4: E2E Tests with Playwright

**Step 4.1: Configure Playwright**

File: `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run build && npm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 4.2: Create E2E Test for Teacher Workflow**

File: `e2e/teacher-workflow.spec.ts`

```typescript
import { test, expect } from "@playwright/test"
import { seedTestData, cleanupTestData } from "../lib/supabase/__tests__/seed"

test.describe("Teacher Creates Workflow", () => {
  let testData: any

  test.beforeAll(async () => {
    testData = await seedTestData()
  })

  test.afterAll(async () => {
    await cleanupTestData()
  })

  test("complete workflow creation journey", async ({ page }) => {
    // Login as teacher
    await page.goto("/login")
    await page.fill('input[type="email"]', "teacher@example.com")
    await page.fill('input[type="password"]', "password")
    await page.click('button[type="submit"]')

    // Navigate to builder
    await page.goto("/teacher/builder")
    await expect(page).toHaveURL(/\/teacher\/builder/)

    // Create new workflow
    await page.click('button:has-text("New Workflow")')
    await page.fill('input[name="name"]', "E2E Test Workflow")
    await page.fill('textarea[name="description"]', "Test workflow description")
    await page.click('button:has-text("Create")')

    // Add nodes to canvas
    const canvas = page.locator("[role='application'][aria-label='Workflow canvas']")
    await canvas.waitFor()

    // Drag student profile node
    await page.dragAndDrop(
      '[data-node-type="student-profile"]',
      '[role="application"]'
    )

    // Configure student profile node
    await page.click('[data-node-id]') // Select the node
    await page.fill('input[placeholder="Student name"]', "Test Student")
    await page.selectOption('select[name="grade_level"]', "4")
    await page.selectOption('select[name="elpa_level"]', "3")

    // Add content generator node
    await page.dragAndDrop(
      '[data-node-type="content-generator"]',
      '[role="application"]'
    )

    // Connect nodes
    const nodes = await page.locator('[data-node-id]').all()
    expect(nodes.length).toBe(2)

    // Save workflow
    await page.click('button:has-text("Save")')
    await expect(page.locator("text=Workflow saved successfully")).toBeVisible()

    // Execute workflow
    await page.click('button:has-text("Run")')
    
    // Wait for execution to complete
    await expect(page.locator("text=Execution completed")).toBeVisible({ timeout: 30000 })
  })
})
```

**Step 4.3: Test Student Learning Journey**

File: `e2e/student-journey.spec.ts`

```typescript
import { test, expect } from "@playwright/test"
import { seedTestData } from "../lib/supabase/__tests__/seed"

test.describe("Student Learning Session", () => {
  let testData: any
  let sessionUrl: string

  test.beforeAll(async () => {
    testData = await seedTestData()
    
    // Start a learning session
    const response = await fetch("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: testData.students[0].id,
        workflow_id: testData.workflow.id
      })
    })
    
    const { id } = await response.json()
    sessionUrl = `/student/session/${id}`
  })

  test("student can complete learning session", async ({ page }) => {
    await page.goto(sessionUrl)
    
    // Verify content is displayed
    await expect(page.locator("[role='main']")).toBeVisible()
    
    // Wait for AI content to stream
    await page.waitForTimeout(2000)
    
    // Answer question (multiple choice)
    const options = page.locator('input[type="radio"]')
    await options.first().click()
    
    // Submit answer
    await page.click('button:has-text("Submit")')
    
    // Verify feedback
    await expect(page.locator("text=Feedback:")).toBeVisible()
    
    // Progress to next question
    await page.click('button:has-text("Next")')
    
    // Complete session
    await expect(page.locator("text=Session Complete")).toBeVisible({ timeout: 60000 })
    
    // Verify celebration
    await expect(page.locator("[data-testid='celebration']")).toBeVisible()
  })

  test("keyboard navigation works", async ({ page }) => {
    await page.goto(sessionUrl)
    
    // Tab through interface
    await page.keyboard.press("Tab")
    await expect(page.locator(':focus')).toBeVisible()
    
    // Answer with keyboard
    await page.keyboard.press("Space") // Select first option
    await page.keyboard.press("Tab")
    await page.keyboard.press("Enter") // Submit
    
    await expect(page.locator("text=Feedback:")).toBeVisible()
  })
})
```

#### Day 5: Accessibility Tests & CI Integration

**Step 5.1: Add Accessibility Tests**

File: `e2e/accessibility.spec.ts`

```typescript
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("WCAG 2.1 AA Compliance", () => {
  const pages = [
    { path: "/", name: "Landing" },
    { path: "/login", name: "Login" },
    { path: "/teacher/builder", name: "Workflow Builder" }
  ]

  for (const { path, name } of pages) {
    test(`${name} page meets WCAG 2.1 AA`, async ({ page }) => {
      await page.goto(path)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })
  }

  test("high contrast mode works", async ({ page }) => {
    await page.goto("/login")
    
    // Enable high contrast
    await page.click('[role="switch"]')
    
    // Check contrast ratios
    const contrastResults = await new AxeBuilder({ page })
      .withRules(["color-contrast-enhanced"]) // WCAG AAA
      .analyze()
    
    expect(contrastResults.violations).toEqual([])
  })
})
```

**Step 5.2: CI/CD Integration**

File: `.github/workflows/test.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22.11.0'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm test -- --coverage --maxWorkers=2
      
      - name: Run type check
        run: npx tsc --noEmit
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          AI_OPENAI_API_KEY: ${{ secrets.TEST_OPENAI_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      
      - name: Upload coverage reports
        uses : codecov/codecov-action@v3
        with:
          directory: ./coverage/
      
      - name: Build application
        run: npm run build
```

**Step 5.3: Coverage Gates**

File: `jest.config.js` (add coverage thresholds)

```javascript
coverageThreshold: {
  global: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
  "./lib/engine/": {
    branches: 85,
    functions: 85,
    lines: 85,
  },
  "./components/student/": {
    branches: 80,
    functions: 80,
    lines: 80,
  }
}
```

---

## 👁️ GAP #3: Student Preview Panel

**Priority:** 🟢 **LOW**  
**Effort:** 1-2 days  
**Risk:** Minor UX improvement, not blocking  
**Status:** Button exists, feature not implemented

### 3.1 Implementation Plan

```
Preview Panel Flow:
├── Teacher clicks "Preview" button in builder
├── Modal/side panel opens with student view
├── Workflow executes with mock student context
├── Teacher can interact as student would
├── Real-time updates as teacher modifies workflow
└── One-click return to builder
```

### 3.2 Implementation Steps

#### Day 1: Create Preview Context

**Step 1.1: Create Preview Context**

File: `contexts/preview-context.tsx`

```typescript
"use client"

import { createContext, useContext, useState } from "react"
import type { StudentProfile } from "@/lib/types/student"
import type { WorkflowExecution } from "@/lib/types/execution"

interface PreviewContextType {
  isPreviewMode: boolean
  mockStudent: StudentProfile
  execution: WorkflowExecution | null
  isExecuting: boolean
  startPreview: (workflow: LinguaFlowWorkflow) => void
  stopPreview: () => void
  updateMockStudent: (updates: Partial<StudentProfile>) => void
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined)

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [mockStudent, setMockStudent] = useState<StudentProfile>({
    id: "preview-student",
    display_name: "Preview Student",
    grade_level: 4,
    elpa_level: 3,
    primary_language: "zh",
    secondary_languages: ["en"],
    interests: ["math", "reading"],
    strengths: [],
    areasForGrowth: [],
    accessibility_needs: {
      visual_support: false,
      audio_support: false,
      motor_support: false,
      extended_time: false
    },
    teacher_id: "preview-teacher",
    classroom_id: "preview-classroom"
  })
  
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const startPreview = async (workflow: LinguaFlowWorkflow) => {
    setIsPreviewMode(true)
    setIsExecuting(true)
    
    try {
      const response = await fetch("/api/execute/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow,
          student: mockStudent
        })
      })
      
      const result = await response.json()
      setExecution(result)
    } catch (error) {
      console.error("Preview execution failed:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const stopPreview = () => {
    setIsPreviewMode(false)
    setExecution(null)
  }

  const updateMockStudent = (updates: Partial<StudentProfile>) => {
    setMockStudent(prev => ({ ...prev, ...updates }))
  }

  const value = {
    isPreviewMode,
    mockStudent,
    execution,
    isExecuting,
    startPreview,
    stopPreview,
    updateMockStudent
  }

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  const context = useContext(PreviewContext)
  if (context === undefined) {
    throw new Error("usePreview must be used within PreviewProvider")
  }
  return context
}
```

**Step 1.2: Create Preview API**

File: `app/api/execute/preview/route.ts`

```typescript
import { NextResponse } from "next/server"
import { WorkflowExecutor } from "@/lib/engine/executor"
import type { LinguaFlowWorkflow, StudentProfile } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { workflow, student } = await request.json()
    
    // Create executor
    const executor = new WorkflowExecutor({
      enableStreaming: false, // No streaming in preview
      debugMode: false
    })

    // Execute workflow
    const execution = await executor.execute(workflow, student)
    
    return NextResponse.json({
      execution,
      success: true
    })
  } catch (error) {
    console.error("Preview execution error:", error)
    return NextResponse.json(
      { 
        error: "Preview execution failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
```

#### Day 2: Preview Panel UI

**Step 2.1: Create Preview Panel Component**

File: `components/builder/preview-panel.tsx`

```typescript
"use client"

import { useState } from "react"
import { usePreview } from "@/contexts/preview-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { LearningInterface } from "@/components/student/learning-interface"

interface PreviewPanelProps {
  workflow: LinguaFlowWorkflow
}

export function PreviewPanel({ workflow }: PreviewPanelProps) {
  const { 
    isPreviewMode, 
    mockStudent, 
    execution, 
    isExecuting,
    startPreview, 
    stopPreview, 
    updateMockStudent 
  } = usePreview()

  if (!isPreviewMode) return null

  return (
    <Dialog 
      open={isPreviewMode} 
      onOpenChange={(open) => {
        if (!open) stopPreview()
      }}
      className="max-w-6xl"
    >
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Student Preview</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Student Profile Configuration */}
          <div className="w-80 space-y-4 overflow-y-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Mock Student Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={mockStudent.display_name}
                      onChange={(e) => updateMockStudent({ display_name: e.target.value })}
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Grade Level</label>
                    <Select
                      value={mockStudent.grade_level.toString()}
                      onValueChange={(value) => updateMockStudent({ grade_level: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8].map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">ELPA Level</label>
                    <Select
                      value={mockStudent.elpa_level.toString()}
                      onValueChange={(value) => updateMockStudent({ elpa_level: parseInt(value) as 1 | 2 | 3 | 4 | 5 })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            ELPA Level {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Primary Language</label>
                    <Select
                      value={mockStudent.primary_language}
                      onValueChange={(value) => updateMockStudent({ primary_language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">Mandarin</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => startPreview(workflow)} disabled={isExecuting}>
              {isExecuting ? "Running..." : "Refresh Preview"}
            </Button>
          </div>

          {/* Student View Simulation */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4">
            <Tabs defaultValue="desktop">
              <TabsList>
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="tablet">Tablet</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>
              
              <TabsContent 
                value="desktop" 
                className="m-0 h-full"
              >
                <div className="bg-white rounded h-full">
                  {execution ? (
                    <LearningInterface 
                      sessionId="preview-session"
                      execution={execution}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Click "Refresh Preview" to see student view</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tablet">
                <div className="max-w-md mx-auto bg-white rounded h-full">
                  {execution && (
                    <LearningInterface 
                      sessionId="preview-session"
                      execution={execution}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="mobile">
                <div className="max-w-sm mx-auto bg-white rounded h-full">
                  {execution && (
                    <LearningInterface 
                      sessionId="preview-session"
                      execution={execution}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={stopPreview}>
            Close Preview
          </Button>
          <Button onClick={() => {
            // Copy workflow to clipboard as JSON
            navigator.clipboard.writeText(JSON.stringify(workflow, null, 2))
          }}>
            Copy Workflow JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2.2: Integrate with Builder**

File: Update `components/builder/workflow-builder.tsx`

```typescript
import { PreviewProvider, usePreview } from "@/contexts/preview-context"
import { PreviewPanel } from "./preview-panel"

export function WorkflowBuilder() {
  const { currentWorkflow } = useWorkflowBuilder()
  const { startPreview } = usePreview()

  return (
    <PreviewProvider>
      <div className="workflow-builder">
        {/* Header with preview button */}
        <div className="builder-header">
          <h1>Workflow Builder</h1>
          <div className="builder-actions">
            <Button
              variant="outline"
              onClick={() => currentWorkflow && startPreview(currentWorkflow)}
              disabled={!currentWorkflow?.nodes.length}
              title={!currentWorkflow?.nodes.length ? "Add nodes to enable preview" : ""}
            >
              👁️ Preview Student View
            </Button>
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleRun}>Run</Button>
          </div>
        </div>

        {/* Main content */}
        <div className="builder-content">
          <NodePalette />
          <WorkflowCanvas />
          <NodeInspector />
          <ExecutionPanel />
        </div>

        {/* Preview Modal */}
        {currentWorkflow && <PreviewPanel workflow={currentWorkflow} />}
      </div>
    </PreviewProvider>
  )
}
```

---

## 🤖 GAP #4: Multi-AI Provider Validation

**Priority:** 🟢 **LOW**  
**Effort:** 1-2 days  
**Risk:** Minimal - OpenAI works fine for MVP  
**Status:** Configs defined, only OpenAI tested

### 4.1 Implementation Steps

#### Day 1: Provider Testing & Validation

**Step 1.1: Add Provider Credentials**

Update `.env.example`:

```bash
# AI Providers (set at least one)
AI_OPENAI_API_KEY=your_openai_key
AI_ANTHROPIC_API_KEY=your_anthropic_key
AI_GOOGLE_API_KEY=your_google_key
AI_GROQ_API_KEY=your_groq_key

# Model configurations
AI_OPENAI_MODEL=gpt-4o-mini
AI_ANTHROPIC_MODEL=claude-3-haiku
AI_GOOGLE_MODEL=gemini-pro
AI_GROQ_MODEL=llama3-70b
```

**Step 1.2: Test Anthropic Integration**

File: `lib/engine/__tests__/ai-client.anthropic.test.ts`

```typescript
import { generateTextCompletion } from "../ai-client"

describe("Anthropic Claude Integration", () => {
  it("should generate text with Claude", async () => {
    const result = await generateTextCompletion({
      model: "anthropic/claude-3-haiku",
      prompt: "Say hello in a friendly way",
      temperature: 0.7
    })

    expect(result.output).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  it("should handle Claude-specific features", async () => {
    const result = await generateTextCompletion({
      model: "anthropic/claude-3-haiku",
      prompt: "Explain photosynthesis",
      system: "You are a 4th grade science teacher. Keep it simple.",
      maxTokens: 150
    })

    expect(result.output.length).toBeLessThan(150)
  })
})
```

**Step 1.3: Add Provider Capability Matrix**

File: `lib/constants/ai-providers.ts`

```typescript
export interface ProviderConfig {
  id: string
  name: string
  models: string[]
  supportedFeatures: {
    streaming: boolean
    structuredOutput: boolean
    functionCalling: boolean
    vision: boolean
  }
  pricing: {
    inputPer1k: number
    outputPer1k: number
  }
  rateLimits: {
    rpm: number
    tpm: number
  }
}

export const AI_PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
    supportedFeatures: {
      streaming: true,
      structuredOutput: true,
      functionCalling: true,
      vision: true
    },
    pricing: {
      inputPer1k: 0.0015,
      outputPer1k: 0.002
    },
    rateLimits: {
      rpm: 500, // requests per minute
      tpm: 40000 // tokens per minute
    }
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-3-5-sonnet", "claude-3-haiku"],
    supportedFeatures: {
      streaming: true,
      structuredOutput: true,
      functionCalling: false,
      vision: true
    },
    pricing: {
      inputPer1k: 0.003,
      outputPer1k: 0.015
    },
    rateLimits: {
      rpm: 300,
      tpm: 20000
    }
  },
  google: {
    id: "google",
    name: "Google",
    models: ["gemini-pro", "gemini-flash"],
    supportedFeatures: {
      streaming: true,
      structuredOutput: true,
      functionCalling: true,
      vision: true
    },
    pricing: {
      inputPer1k: 0.001,
      outputPer1k: 0.002
    },
    rateLimits: {
      rpm: 360,
      tpm: 10000
    }
  },
  groq: {
    id: "groq",
    name: "Groq",
    models: ["llama3-70b", "mixtral-8x7b"],
    supportedFeatures: {
      streaming: true,
      structuredOutput: false,
      functionCalling: false,
      vision: false
    },
    pricing: {
      inputPer1k: 0.0008,
      outputPer1k: 0.0008
    },
    rateLimits: {
      rpm: 30,
      tpm: 7000
    }
  }
}
```

#### Day 2: Provider Selection UI

**Step 2.1: Add Provider Selector to AI Model Node**

File: Update `components/nodes/orchestration/ai-model-node.tsx`

```typescript
import { AI_PROVIDERS } from "@/lib/constants/ai-providers"

export function AIModelNode({ data, isSelected }) {
  const providers = Object.values(AI_PROVIDERS)
  const selectedProvider = AI_PROVIDERS[data.provider]
  
  const availableModels = selectedProvider?.models || []

  return (
    <div className="ai-model-node">
      <Select
        value={data.provider || "openai"}
        onValueChange={(provider) => 
          onUpdate({ provider, model: AI_PROVIDERS[provider].models[0] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          {providers.map(provider => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center gap-2">
                <span>{provider.name}</span>
                <Badge variant="outline">
                  ${((provider.pricing.inputPer1k + provider.pricing.outputPer1k) / 2).toFixed(3)}/1K
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {data.provider && (
        <Select
          value={data.model}
          onValueChange={(model) => onUpdate({ model })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map(model => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Show capabilities */}
      {data.provider && (
        <div className="mt-2 text-xs text-slate-600">
          <p className="flex items-center gap-1">
            <span className={selectedProvider.supportedFeatures.streaming ? "text-green-600" : "text-red-600"}>
              {selectedProvider.supportedFeatures.streaming ? "✓" : "✗"}
            </span>
            Streaming
          </p>
          <p className="flex items-center gap-1">
            <span className={selectedProvider.supportedFeatures.structuredOutput ? "text-green-600" : "text-red-600"}>
              {selectedProvider.supportedFeatures.structuredOutput ? "✓" : "✗"}
            </span>
            Structured Output
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 2.2: Add Provider Status Dashboard**

File: `components/teacher/provider-status.tsx`

```typescript
import { AI_PROVIDERS } from "@/lib/constants/ai-providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProviderStatusDashboard() {
  const [providerStatuses, setProviderStatuses] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check provider health
    const checkProviders = async () => {
      const statuses = {}
      
      for (const [id, provider] of Object.entries(AI_PROVIDERS)) {
        try {
          // Quick health check
          const response = await fetch(`/api/ai/health?provider=${id}`)
          statuses[id] = response.ok
        } catch (error) {
          statuses[id] = false
        }
      }
      
      setProviderStatuses(statuses)
    }
    
    checkProviders()
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(AI_PROVIDERS).map(([id, provider]) => (
        <Card key={id}>
          <CardHeader>
            <CardTitle className="text-sm">{provider.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={providerStatuses[id] ? "default" : "destructive"}
              className="mb-2"
            >
              {providerStatuses[id] ? "Online" : "Offline"}
            </Badge>
            <ul className="text-xs text-slate-600 space-y-1">
              {provider.models.slice(0, 2).map(model => (
                <li key={model}>{model}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 📚 GAP #7: Complete Curriculum Data Import

**Priority:** 🟢 **LOW**  
**Effort:** 3-5 days  
**Risk:** Content gaps, but samples sufficient for demo  
**Status:** Sample data only

### 7.1 Data Import Strategy

```
Alberta Curriculum Sources:
├── ELA (English Language Arts) - Grades K-12
├── Mathematics - Grades K-12  
├── Science - Grades K-12
├── Social Studies - Grades K-12
└── ESL Benchmarks - ELPA 1-5

Import Method:
├── Manual entry: Sample data created ✅
├── Spreadsheet upload: Bulk import from structured files
├── Web scraping: From Alberta Education website
└── API integration: If official API becomes available
```

### 7.2 Implementation Steps

#### Day 1-2: Create Import Scripts

**Step 2.1: Spreadsheet Parser**

File: `scripts/import-curriculum.ts`

```typescript
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"

interface CurriculumRow {
  subject: string
  grade: string
  strand: string
  outcome: string
  indicator: string
  elpa_suggestions?: string
}

export async function importFromSpreadsheet(filePath: string) {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<CurriculumRow>(sheet)

  const supabase = createClient()

  for (const row of rows) {
    // Parse grade range (e.g., "4-6" or just "4")
    const [minGrade, maxGrade] = row.grade.includes("-")
      ? row.grade.split("-").map(g => parseInt(g.trim()))
      : [parseInt(row.grade), parseInt(row.grade)]

    // Parse ELPA suggestions
    const suggestedNodes = row.elpa_suggestions
      ? row.elpa_suggestions.split(",").map(s => s.trim())
      : ["content-generator", "scaffolding"]

    // Insert into database
    const { error } = await supabase.from("curriculum_outcomes").insert({
      subject_area: row.subject.toLowerCase(),
      grade_range: { min: minGrade, max: maxGrade },
      strand: row.strand,
      outcome: row.outcome,
      indicator: row.indicator,
      suggested_nodes: suggestedNodes,
      vocabulary_terms: extractVocabulary(row.indicator),
      common_misconceptions: [],
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error(`Failed to insert: ${row.outcome}`, error)
    } else {
      console.log(`✓ Imported: ${row.subject} Grade ${row.grade} - ${row.outcome}`)
    }
  }
}

function extractVocabulary(indicator: string): string[] {
  // Simple vocabulary extraction logic
  const words = indicator.split(/\s+/)
  return words
    .filter(word => word.length > 4)
    .map(word => word.toLowerCase().replace(/[^a-z]/g, ""))
    .filter(Boolean)
    .slice(0, 5) // Top 5 potential vocabulary words
}
```

**Step 2.2: Math Problem Generator Expansion**

File: `lib/constants/math-problem-types.ts`

```typescript
export const MATH_PROBLEM_TYPES = {
  // Existing: Basic arithmetic
  addition: {
    name: "Addition",
    generate: (level) => generateAddition(level),
    grades: [1, 2, 3]
  },
  subtraction: {
    name: "Subtraction", 
    generate: (level) => generateSubtraction(level),
    grades: [1, 2, 3]
  },
  
  // New: Advanced operations
  multiplication: {
    name: "Multiplication",
    generate: (level) => generateMultiplication(level),
    grades: [3, 4, 5]
  },
  division: {
    name: "Division",
    generate: (level) => generateDivision(level), 
    grades: [3, 4, 5]
  },
  fractions: {
    name: "Fractions",
    generate: (level) => generateFractions(level),
    grades: [4, 5, 6]
  },
  decimals: {
    name: "Decimals",
    generate: (level) => generateDecimals(level),
    grades: [4, 5, 6]
  },
  word_problems: {
    name: "Word Problems",
    generate: (level, context) => generateWordProblem(level, context),
    grades: [3, 4, 5, 6]
  }
}

function generateMultiplication(level: number) {
  const max = level === 3 ? 10 : level === 4 ? 12 : 15
  const a = Math.floor(Math.random() * max) + 1
  const b = Math.floor(Math.random() * max) + 1
  
  return {
    question: `${a} × ${b}`,
    answer: a * b,
    operation: "multiplication",
    difficulty: level
  }
}

function generateWordProblem(level: number, studentContext: any) {
  // Generate culturally relevant word problems
  const templates = [
    {
      context: "farm",
      template: (
        `A farmer has {total} {items}. ` +
        `He gives away {given}. ` +
        `How many {items} does he have left?`
      ),
      generator: (level) => {
        const total = level * 10 + Math.floor(Math.random() * 20)
        const given = Math.floor(Math.random() * total)
        const items = ["apples", "oranges", "eggs"][Math.floor(Math.random() * 3)]
        
        return {
          question: `A farmer has ${total} ${items}. He gives away ${given}. How many ${items} does he have left?`,
          answer: total - given,
          variables: { total, given, items }
        }
      }
    },
    {
      context: "store",
      template: (
        `{name} buys {quantity} {item} at ${price} each. ` +  
        `How much does {name} spend?`
      ),
      generator: (level, studentName) => {
        const quantity = level + Math.floor(Math.random() * 5)
        const price = (Math.random() * 5 + 1).toFixed(2)
        const item = ["books", "pencils", "notebooks"][Math.floor(Math.random() * 3)]
        
        return {
          question: `${studentName} buys ${quantity} ${item} at $${price} each. How much does ${studentName} spend?`,
          answer: quantity * parseFloat(price),
          variables: { name: studentName, quantity, item, price }
        }
      }
    }
  ]
  
  const template = templates[Math.floor(Math.random() * templates.length)]
  const problem = template.generator(level, studentName)
  
  return {
    ...problem,
    context: template.context,
    difficulty: level
  }
}
```

#### Day 3-4: ESL Benchmark Expansion

**Step 3.1: Detailed ELPA Standards**

File: Expand `lib/constants/elpa-levels.ts`

```typescript
export const ELPA_DETAILED_STANDARDS = {
  1: {
    // Existing data...
    benchmarks: {
      listening: [
        "Follows simple one-step directions",
        "Identifies key words in familiar contexts",
        "Responds to basic questions with gestures/single words"
      ],
      speaking: [
        "Produces simple words and phrases",
        "Repeats modeled language",
        "Uses memorized expressions"
      ],
      reading: [
        "Recognizes alphabet and letter sounds",
        "Identifies familiar words in context",
        "Uses pictures to support comprehension"
      ],
      writing: [
        "Copies letters and words",
        "Labels pictures with single words",
        "Produces simple phrases with support"
      ]
    },
    vocabulary_targets: ["numbers 1-20", "colors", "family members", "school objects"],
    grammar_targets: ["simple present", "subject pronouns", "articles a/an"]
  },
  
  // Add detailed benchmarks for levels 2-5...
  2: {
    benchmarks: {
      listening: [
        /* ... */
      ]
    }
  }
}

// Add crosswalk to Alberta curriculum
export const CURRICULUM_CROSSWALK = {
  math: {
    "4.N.1": {
      elpa_level: 3,
      scaffold_needs: ["vocabulary", "visuals"],
      language_functions: ["describe", "compare", "explain"],
      vocabulary: ["place value", "digit", "round", "estimate"],
      sentence_frames: [
        "The number {number} has {count} digits.",
        "{Number} rounds to {rounded} because..."
      ]
    }
  },
  
  science: {
    /* ... */
  }
}
```

**Step 3.2: Auto-Scaffolding Recommendations**

File: `lib/engine/auto-scaffold-recommendations.ts`

```typescript
import { ELPA_DETAILED_STANDARDS, CURRICULUM_CROSSWALK } from "@/lib/constants"

export function generateScaffoldingRecommendations(
  studentProfile: StudentProfile,
  curriculumOutcome: string
) {
  const elpaLevel = studentProfile.elpa_level
  const subject = extractSubject(curriculumOutcome)
  
  const recommendations = {
    vocabulary: [],
    sentence_frames: [],
    visual_supports: [],
    l1_bridges: [],
    comprehension_checks: []
  }
  
  // Base recommendations by ELPA level
  const elpaStandards = ELPA_DETAILED_STANDARDS[elpaLevel]
  
  if (elpaLevel <= 2) {
    recommendations.visual_supports.push("pictures", "diagrams", "realia")
    recommendations.l1_bridges.push("key_terms", "concept_explanation")
  }
  
  if (elpaLevel <= 3) {
    recommendations.sentence_frames.push(...elpaStandards.sentence_frames)
  }
  
  // Curriculum-specific recommendations
  const crosswalk = CURRICULUM_CROSSWALK[subject]?.[curriculumOutcome]
  if (crosswalk) {
    recommendations.vocabulary.push(...crosswalk.vocabulary)
    recommendations.sentence_frames.push(...crosswalk.sentence_frames)
  }
  
  return recommendations
}

function extractSubject(outcomeCode: string): string {
  if (outcomeCode.startsWith("4.N")) return "math"
  if (outcomeCode.startsWith("4.S")) return "science"
  if (outcomeCode.startsWith("4.SS")) return "social"
  return "general"
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: Production Readiness (Weeks 1-3)

| Week | Day | Gaps Addressed | Deliverable |
|------|-----|----------------|-------------|
| **Week 1** | Mon-Tue | Gap #1 Auth (Days 1-2) | Authentication system with JWT, RLS, roles |
| | Wed-Thu | Gap #1 Auth (Days 3-4) | Protected API routes, student registration |
| | Fri | Gap #2 Rate Limit (Day 1) | Upstash setup, rate limiter implementation |
| **Week 2** | Mon-Tue | Gap #2 Rate Limit (Days 2-3) | Usage dashboard, budget alerts |
| | Wed-Fri | Gap #5 WCAG (Days 1-3) | Color contrast, keyboard nav, ARIA fixes |
| **Week 3** | Mon-Tue | Gap #5 WCAG (Days 4-5) | Screen reader tests, audit automation |
| | Wed-Fri | Gap #6 Testing (Days 1-3) | Jest setup, unit tests, API tests |

### Phase 2: Quality Assurance (Weeks 4-5)

| Week | Day | Gaps Addressed | Deliverable |
|------|-----|----------------|-------------|
| **Week 4** | Mon-Tue | Gap #6 Testing (Days 4-5) | E2E tests, CI/CD integration, coverage gates |
| | Wed-Thu | Gap #3 Preview (Days 1-2) | Preview panel, multi-device testing |
| | Fri | Gap #4 AI Providers (Days 1-2) | Provider testing, selector UI |
| **Week 5** | Mon-Wed | Gap #7 Curriculum (Days 1-3) | Import scripts, ESL benchmarks, math generators |
| | Thu-Fri | Bug fixes, polish | All tests passing, demo verification |

### Phase 3: Deployment (Week 6)

| Week | Day | Activity |
|------|-----|----------|
| **Week 6** | Mon | Production environment setup (Supabase, Vercel, Upstash) |
| | Tue | Deploy and verify authentication |
| | Wed | Load testing, rate limiting validation |
| | Thu | Accessibility final audit |
| | Fri | Documentation, training materials, launch preparation |

---

## 🎯 SUCCESS METRICS

### Code Quality
- ✅ 75%+ test coverage across all modules
- ✅ 0 ESLint errors, 0 TypeScript errors
- ✅ All WCAG 2.1 AA automated tests passing
- ✅ 100% API endpoints protected with auth
- ✅ Rate limiting functional on all AI endpoints

### Functionality
- ✅ Teachers can register and manage classrooms
- ✅ Students receive auto-generated credentials
- ✅ Workflow preview works across desktop/tablet/mobile
- ✅ Usage dashboard shows accurate limits and costs
- ✅ All 5 AI providers validated and selectable
- ✅ Full Alberta curriculum loaded and searchable

### Performance
- ⚡ Build time < 5 seconds
- ⚡ API response time < 200ms (p95)
- ⚡ Page load time < 3 seconds
- ⚡ AI generation: < 5 seconds (non-streaming)
- ⚡ Concurrent users: 100+ per classroom

### Security
- 🔒 0 vulnerabilities in npm audit
- 🔒 All secrets in environment variables
- 🔒 JWT tokens with proper expiration
- 🔒 Rate limits preventing abuse verified
- 🔒 Row Level Security working for multi-tenancy

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All unit tests pass (75%+ coverage)
- [ ] All E2E tests pass
- [ ] Accessibility audit passes (0 violations)
- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Rate limiting tested with simulated load
- [ ] Authentication flow tested end-to-end
- [ ] Preview panel tested across devices
- [ ] Usage dashboard verified accurate
- [ ] Provider switcher tested
- [ ] Curriculum data imported and searchable
- [ ] Backup strategy configured
- [ ] Monitoring and logging configured
- [ ] Documentation updated

### Production Deployment
- [ ] Deploy to production environment
- [ ] Run smoke tests on production
- [ ] Verify auth with real users
- [ ] Test rate limiting with production keys
- [ ] Monitor initial usage for 24 hours
- [ ] Validate cost tracking accuracy
- [ ] Confirm accessibility with real assistive tech
- [ ] Teacher training session completed

### Post-Deployment
- [ ] User feedback collection system active
- [ ] Bug tracking system monitored
- [ ] Performance monitoring dashboard active
- [ ] Cost monitoring alerts configured
- [ ] Regular security audits scheduled
- [ ] Quarterly accessibility reviews planned
- [ ] Feature roadmap updated based on feedback

---

## 📞 SUPPORT & MAINTENANCE

### Ongoing Tasks (Post-Launch)

**Weekly:**
- Review usage metrics and costs
- Monitor error logs and fix critical bugs
- Update dependencies (security patches)

**Monthly:**
- Run full test suite
- Accessibility spot checks
- User feedback review and prioritization
- Cost analysis and optimization

**Quarterly:**
- Full accessibility audit
- Security vulnerability assessment
- Performance review and optimization
- Curriculum data updates (if available)
- Feature roadmap planning

---

**Plan Version:** 1.0  
**Last Updated:** December 6, 2025  
**Next Review:** After Phase 1 completion (3 weeks)
