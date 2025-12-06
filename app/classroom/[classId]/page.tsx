/**
 * Classroom Dashboard Page
 * Real-time view of student progress during class sessions
 */

"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  Play,
  Pause,
  Activity,
  LayoutGrid,
  List,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentGrid, type StudentStatus } from "@/components/classroom/student-grid"
import { AnalyticsDashboard } from "@/components/classroom/analytics-dashboard"
import type { ELPALevel } from "@/lib/types/student"

// Mock data for demonstration
const MOCK_STUDENTS = [
  {
    studentId: "1",
    student: { id: "1", firstName: "Ahmed", lastName: "Hassan", gradeLevel: "4" as const, nativeLanguage: "arabic" as const, elpaLevel: 2 as ELPALevel },
    status: "working" as StudentStatus,
    isActive: true,
    currentStep: 5,
    totalSteps: 10,
    score: 80,
    timeSpent: 420,
    lastActivity: new Date(),
    currentNodeName: "Comprehension Check",
    needsAttention: false,
    streakCount: 3,
  },
  {
    studentId: "2",
    student: { id: "2", firstName: "Wei", lastName: "Chen", gradeLevel: "4" as const, nativeLanguage: "mandarin" as const, elpaLevel: 3 as ELPALevel },
    status: "completed" as StudentStatus,
    isActive: false,
    currentStep: 10,
    totalSteps: 10,
    score: 95,
    timeSpent: 380,
    lastActivity: new Date(),
    needsAttention: false,
    streakCount: 5,
  },
  {
    studentId: "3",
    student: { id: "3", firstName: "Sofia", lastName: "Martinez", gradeLevel: "4" as const, nativeLanguage: "spanish" as const, elpaLevel: 2 as ELPALevel },
    status: "struggling" as StudentStatus,
    isActive: true,
    currentStep: 3,
    totalSteps: 10,
    score: 50,
    timeSpent: 600,
    lastActivity: new Date(Date.now() - 180000),
    currentNodeName: "Math Problem",
    needsAttention: true,
    attentionReason: "Stuck for 3+ minutes on same question",
    streakCount: 0,
  },
  {
    studentId: "4",
    student: { id: "4", firstName: "Priya", lastName: "Patel", gradeLevel: "4" as const, nativeLanguage: "punjabi" as const, elpaLevel: 3 as ELPALevel },
    status: "working" as StudentStatus,
    isActive: true,
    currentStep: 7,
    totalSteps: 10,
    score: 85,
    timeSpent: 450,
    lastActivity: new Date(),
    currentNodeName: "Vocabulary Builder",
    needsAttention: false,
    streakCount: 4,
  },
  {
    studentId: "5",
    student: { id: "5", firstName: "Dmitri", lastName: "Volkov", gradeLevel: "4" as const, nativeLanguage: "ukrainian" as const, elpaLevel: 1 as ELPALevel },
    status: "needs-help" as StudentStatus,
    isActive: true,
    currentStep: 2,
    totalSteps: 10,
    score: 30,
    timeSpent: 720,
    lastActivity: new Date(),
    currentNodeName: "Reading Passage",
    needsAttention: true,
    attentionReason: "Requested help twice",
    streakCount: 0,
  },
]

const MOCK_METRICS = {
  totalStudents: 5,
  activeStudents: 4,
  completionRate: 20,
  averageScore: 68,
  averageTimeMinutes: 9,
  strugglingCount: 2,
  elpaDistribution: {
    1: 1,
    2: 2,
    3: 2,
    4: 0,
    5: 0,
  } as Record<ELPALevel, number>,
  topChallenges: [
    { topic: "Subtraction vocabulary", count: 3, percentage: 60 },
    { topic: "Reading comprehension", count: 2, percentage: 40 },
    { topic: "Word problems", count: 2, percentage: 40 },
  ],
  vocabularyMastery: [
    { word: "farmer", masteryRate: 80 },
    { word: "neighbor", masteryRate: 60 },
    { word: "subtract", masteryRate: 40 },
    { word: "remaining", masteryRate: 35 },
  ],
  recentTrends: {
    scoreChange: 5,
    completionChange: -2,
    timeChange: 1,
  },
}

const MOCK_INSIGHTS = [
  {
    studentId: "5",
    studentName: "Dmitri",
    insight: "Struggling with reading comprehension - consider L1 bridge support",
    type: "concern" as const,
    priority: "high" as const,
  },
  {
    studentId: "3",
    studentName: "Sofia",
    insight: "May need help with subtraction vocabulary",
    type: "concern" as const,
    priority: "medium" as const,
  },
  {
    studentId: "2",
    studentName: "Wei",
    insight: "Excellent progress! Ready for enrichment activities",
    type: "success" as const,
    priority: "low" as const,
  },
  {
    studentId: "4",
    studentName: "Priya",
    insight: "Strong vocabulary retention - building confidence",
    type: "success" as const,
    priority: "low" as const,
  },
]

export default function ClassroomPage() {
  const params = useParams()
  const classId = params.classId as string

  const [isSessionActive, setIsSessionActive] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState<string>()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("students")

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId === selectedStudentId ? undefined : studentId)
  }

  const handleSendMessage = (studentId: string) => {
    console.log("Send message to:", studentId)
  }

  const handleProvideHint = (studentId: string) => {
    console.log("Provide hint to:", studentId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Grade 4 - Math Word Problems</h1>
              <p className="text-sm text-muted-foreground">Classroom ID: {classId}</p>
            </div>
            {isSessionActive && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <Activity className="h-3 w-3 animate-pulse" />
                Live Session
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSessionActive ? (
              <Button variant="destructive" onClick={() => setIsSessionActive(false)}>
                <Pause className="h-4 w-4 mr-2" />
                End Session
              </Button>
            ) : (
              <Button onClick={() => setIsSessionActive(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="students" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {activeTab === "students" && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="students" className="mt-0">
            <StudentGrid
              students={MOCK_STUDENTS}
              onSelectStudent={handleSelectStudent}
              onSendMessage={handleSendMessage}
              onProvideHint={handleProvideHint}
              selectedStudentId={selectedStudentId}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard
              metrics={MOCK_METRICS}
              insights={MOCK_INSIGHTS}
              sessionDuration={15}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
