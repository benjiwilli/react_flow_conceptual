/**
 * Classroom Dashboard Page
 * Real-time view of student progress during class sessions
 */

"use client"

import { useState, useCallback, useMemo } from "react"
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
  Bell,
  Target,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentGrid, type StudentStatus } from "@/components/classroom/student-grid"
import { AnalyticsDashboard } from "@/components/classroom/analytics-dashboard"
import { AssessmentBreakdown } from "@/components/classroom/assessment-breakdown"
import { TeacherAlerts, generateStudentAlert, type TeacherAlert } from "@/components/classroom/teacher-alerts"
import { ReportExport } from "@/components/classroom/report-export"
import { useClassroomRealtime, type RealtimeStudentStatus } from "@/hooks/use-classroom-realtime"
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
  const [showAlerts, setShowAlerts] = useState(false)
  
  // Initialize with some demo alerts
  const [alerts, setAlerts] = useState<TeacherAlert[]>(() => [
    generateStudentAlert("5", "Dmitri", "struggling", "is struggling with reading comprehension"),
    generateStudentAlert("3", "Sofia", "idle", "has been inactive for 5 minutes"),
    generateStudentAlert("2", "Wei", "completed"),
  ])

  // Connect to real-time classroom updates
  const handleRealtimeAlert = useCallback((alert: { type: string; studentId: string; message: string }) => {
    const studentName = MOCK_STUDENTS.find(s => s.studentId === alert.studentId)?.student.firstName || "Student"
    // Map realtime status to alert type
    const alertTypeMap: Record<string, "struggling" | "idle" | "completed" | "help-requested" | "achievement"> = {
      struggling: "struggling",
      idle: "idle",
      completed: "completed",
      "needs-help": "help-requested",
      working: "achievement",
    }
    const alertType = alertTypeMap[alert.type] || "struggling"
    const newAlert = generateStudentAlert(
      alert.studentId,
      studentName,
      alertType,
      alert.message
    )
    setAlerts((prev) => [newAlert, ...prev].slice(0, 20)) // Keep max 20 alerts
  }, [])

  const {
    students: realtimeStudents,
    isConnected,
    error: realtimeError,
  } = useClassroomRealtime({
    classroomId: classId,
    onAlert: handleRealtimeAlert,
    pollIntervalMs: 5000,
  })

  // Merge realtime data with mock data for demo (realtime takes precedence)
  const students = useMemo(() => {
    if (realtimeStudents.size === 0) {
      return MOCK_STUDENTS // Use mock data when no realtime data
    }
    
    // Merge: update mock students with realtime data if available
    return MOCK_STUDENTS.map(mockStudent => {
      const realtimeData = realtimeStudents.get(mockStudent.studentId)
      if (!realtimeData) return mockStudent
      
      // Map realtime status to StudentStatus
      const statusMap: Record<RealtimeStudentStatus["status"], StudentStatus> = {
        idle: "idle",
        working: "working",
        completed: "completed",
        struggling: "struggling",
        "needs-help": "needs-help",
      }
      
      return {
        ...mockStudent,
        status: statusMap[realtimeData.status] || mockStudent.status,
        currentStep: Math.round((realtimeData.progress / 100) * mockStudent.totalSteps),
        score: realtimeData.score ?? mockStudent.score,
        timeSpent: realtimeData.timeSpentSeconds,
        lastActivity: realtimeData.lastActivity,
        currentNodeName: realtimeData.currentNodeName ?? mockStudent.currentNodeName,
        needsAttention: realtimeData.needsAttention,
        attentionReason: realtimeData.attentionReason,
        isActive: realtimeData.status !== "idle" && realtimeData.status !== "completed",
      }
    })
  }, [realtimeStudents])

  // Calculate metrics from current student data
  const metrics = useMemo(() => {
    const activeStudents = students.filter(s => s.isActive).length
    const completedStudents = students.filter(s => s.status === "completed").length
    const avgScore = students.reduce((sum, s) => sum + (s.score || 0), 0) / students.length
    const avgTime = students.reduce((sum, s) => sum + s.timeSpent, 0) / students.length / 60
    const strugglingCount = students.filter(s => s.status === "struggling" || s.status === "needs-help").length

    const elpaDistribution = students.reduce((acc, s) => {
      const level = s.student.elpaLevel
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<ELPALevel, number>)

    return {
      ...MOCK_METRICS,
      totalStudents: students.length,
      activeStudents,
      completionRate: Math.round((completedStudents / students.length) * 100),
      averageScore: Math.round(avgScore),
      averageTimeMinutes: Math.round(avgTime),
      strugglingCount,
      elpaDistribution: {
        1: elpaDistribution[1] || 0,
        2: elpaDistribution[2] || 0,
        3: elpaDistribution[3] || 0,
        4: elpaDistribution[4] || 0,
        5: elpaDistribution[5] || 0,
      },
    }
  }, [students])

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId === selectedStudentId ? undefined : studentId)
  }

  const handleSendMessage = (studentId: string) => {
    // TODO: Implement message sending via sendToStudent from useClassroomRealtime
    void studentId
  }

  const handleProvideHint = (studentId: string) => {
    // TODO: Implement hint sending via sendToStudent from useClassroomRealtime
    void studentId
  }

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }, [])

  const handleMarkAlertRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    )
  }, [])

  const handleTakeAction = useCallback((alert: TeacherAlert) => {
    setSelectedStudentId(alert.studentId)
    setActiveTab("students")
    setShowAlerts(false)
    handleMarkAlertRead(alert.id)
  }, [handleMarkAlertRead])

  const unreadAlertCount = alerts.filter((a) => !a.isRead).length

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="container flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Demo Mode:</strong> This dashboard shows simulated data. Authentication is not enabled.
            See README.md for production deployment steps.
          </span>
        </div>
      </div>

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
            {/* Connection status indicator */}
            <span
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-blue-100 text-blue-700"
                  : realtimeError
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
              title={realtimeError || (isConnected ? "Real-time updates active" : "Using polling fallback")}
            >
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isConnected ? "Live" : realtimeError ? "Error" : "Polling"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showAlerts ? "secondary" : "outline"}
              size="icon"
              className="relative"
              onClick={() => setShowAlerts(!showAlerts)}
            >
              <Bell className="h-4 w-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  {unreadAlertCount}
                </span>
              )}
            </Button>
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
        <div className="flex gap-6">
          {/* Main Panel */}
          <div className={showAlerts ? "flex-1" : "w-full"}>
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
                  <TabsTrigger value="assessments" className="gap-2">
                    <Target className="h-4 w-4" />
                    Assessments
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {activeTab === "analytics" && (
                    <ReportExport
                      classroomName="Grade 4 - Math Word Problems"
                      metrics={metrics}
                      students={students.map((s) => ({
                        id: s.studentId,
                        name: `${s.student.firstName} ${s.student.lastName}`,
                        elpaLevel: s.student.elpaLevel,
                        completionRate: (s.currentStep / s.totalSteps) * 100,
                        averageScore: s.score || 0,
                        timeSpent: Math.round(s.timeSpent / 60),
                        strengths: s.streakCount > 2 ? ["Consistent progress"] : [],
                        challenges: s.needsAttention ? [s.attentionReason || "Needs support"] : [],
                      }))}
                    />
                  )}
                  {activeTab === "students" && (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              <TabsContent value="students" className="mt-0">
                <StudentGrid
                  students={students}
                  onSelectStudent={handleSelectStudent}
                  onSendMessage={handleSendMessage}
                  onProvideHint={handleProvideHint}
                  selectedStudentId={selectedStudentId}
                  viewMode={viewMode}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <AnalyticsDashboard
                  metrics={metrics}
                  insights={MOCK_INSIGHTS}
                  sessionDuration={15}
                />
              </TabsContent>

              <TabsContent value="assessments" className="mt-0">
                <AssessmentBreakdown classId={classId} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Alerts Panel */}
          {showAlerts && (
            <div className="w-96 shrink-0">
              <TeacherAlerts
                alerts={alerts}
                onDismiss={handleDismissAlert}
                onMarkRead={handleMarkAlertRead}
                onTakeAction={handleTakeAction}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
