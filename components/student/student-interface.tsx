/**
 * Student Interface Component
 * Simplified, friendly UI for students
 */

"use client"

import { useState } from "react"
import { BookOpen, Star, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStudent } from "@/contexts/student-context"

export function StudentInterface() {
  const { currentStudent } = useStudent()
  const [activities] = useState<{ id: string; title: string; type: string; completed: boolean }[]>([])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Friendly Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-semibold">Hello{currentStudent ? `, ${currentStudent.firstName}` : ""}!</h1>
              <p className="text-xs text-muted-foreground">Ready to learn today?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="font-medium">0 Stars</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {/* Today's Activities */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold">Today&apos;s Activities</h2>

          {activities.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-4 h-16 w-16 text-blue-200" />
                <h3 className="text-lg font-medium">No activities yet</h3>
                <p className="text-sm text-muted-foreground">Your teacher will assign activities soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activities.map((activity) => (
                <Card
                  key={activity.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${activity.completed ? "bg-green-50" : "bg-white"}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                    <CardDescription>{activity.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant={activity.completed ? "secondary" : "default"}>
                      {activity.completed ? "Review" : "Start"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Activities Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
