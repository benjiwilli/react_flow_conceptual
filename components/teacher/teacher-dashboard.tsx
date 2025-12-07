/**
 * Teacher Dashboard Component
 * Overview of students, workflows, and class progress
 */

"use client"

import Link from "next/link"
import { Plus, Users, BookOpen, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">VerbaPath</h1>
          <nav className="flex items-center gap-4">
            <Link href="/teacher/builder">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Pathway
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back, Teacher</h2>
          <p className="text-muted-foreground">Manage your ESL learning pathways and track student progress</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Learning Pathways</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Active pathways</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <Link href="/teacher/builder">
              <CardHeader>
                <CardTitle>Create Learning Pathway</CardTitle>
                <CardDescription>Build a new AI-powered learning experience for your students</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <Link href="/teacher/classroom">
              <CardHeader>
                <CardTitle>Start Classroom Session</CardTitle>
                <CardDescription>Monitor student progress in real-time during class</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <Link href="/teacher/students">
              <CardHeader>
                <CardTitle>Manage Students</CardTitle>
                <CardDescription>View and update student profiles and ELPA levels</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  )
}
