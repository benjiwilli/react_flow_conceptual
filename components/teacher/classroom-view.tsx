/**
 * Classroom View Component
 * Real-time monitoring of student progress
 */

"use client"

import { useState } from "react"
import { Play, Pause, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClassroom } from "@/contexts/classroom-context"

export function ClassroomView() {
  const { students, isClassroomActive, startClassroom, endClassroom, getClassroomStats } = useClassroom()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const stats = getClassroomStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Classroom Session</h1>
            {isClassroomActive && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Activity className="h-3 w-3 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isClassroomActive ? (
              <Button onClick={() => startClassroom(crypto.randomUUID())}>
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            ) : (
              <Button variant="destructive" onClick={endClassroom}>
                <Pause className="mr-2 h-4 w-4" />
                End Session
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {/* Stats Bar */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                {stats.completedWorkflows}
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedWorkflows}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                %
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageProgress.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No students in session</h3>
                <p className="text-sm text-muted-foreground">Students will appear here when they join the class</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((studentStatus) => (
                  <Card key={studentStatus.studentId} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{studentStatus.student.firstName}</p>
                          <p className="text-xs text-muted-foreground">ELPA Level {studentStatus.student.elpaLevel}</p>
                        </div>
                        <div
                          className={`h-2 w-2 rounded-full ${studentStatus.isActive ? "bg-green-500" : "bg-gray-300"}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
