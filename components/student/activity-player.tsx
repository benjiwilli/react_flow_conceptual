/**
 * Activity Player Component
 * Executes and displays learning activities for students
 */

"use client"

import { useState } from "react"
import { ArrowLeft, Volume2, HelpCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useExecution } from "@/contexts/execution-context"

interface ActivityPlayerProps {
  activityId: string
}

export function ActivityPlayer({ activityId }: ActivityPlayerProps) {
  const { isExecuting, streamingContent, currentStreamingNodeId } = useExecution()
  const [currentStep, setCurrentStep] = useState(0)
  const [, setShowHelp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/student" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Activity Content */}
      <main className="container max-w-2xl px-4 py-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            {/* Activity Title */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Activity</h1>
              <p className="text-muted-foreground">ID: {activityId}</p>
            </div>

            {/* Streaming Content Display */}
            {isExecuting && currentStreamingNodeId && (
              <div className="mb-6 rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-sm text-blue-700">Generating content...</span>
                </div>
                <p className="text-sm">{streamingContent[currentStreamingNodeId] || ""}</p>
              </div>
            )}

            {/* Placeholder Content */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-gray-200" />
              <h3 className="text-lg font-medium">Activity Content</h3>
              <p className="text-sm text-muted-foreground">Activity execution will appear here</p>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Button variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep((s) => s - 1)}>
                Previous
              </Button>
              <Button onClick={() => setCurrentStep((s) => s + 1)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
