"use client"

/**
 * Learning Interface Component
 * Student-facing UI for completing learning activities
 * 
 * Design Goals:
 * - Minimal, distraction-free
 * - Large touch targets for younger students
 * - Voice-first capability
 * - Progress visibility without anxiety
 * - Celebration of achievements
 */

import { useState, useCallback } from "react"
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  Send,
  Lightbulb,
  ChevronRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { VoiceRecorder } from "./voice-recorder"
import { CelebrationOverlay } from "./visual-feedback"

interface LearningContent {
  type: "text" | "question" | "multiple-choice" | "voice-prompt" | "visual"
  content: string
  translation?: string
  vocabulary?: VocabularyItem[]
  visual?: string
  audio?: string
}

interface VocabularyItem {
  word: string
  definition: string
  translation?: string
  pronunciation?: string
}

interface QuestionData {
  prompt: string
  type: "text" | "number" | "multiple-choice" | "voice"
  options?: { id: string; text: string }[]
  hint?: string
}

interface LearningInterfaceProps {
  sessionId: string
  studentName?: string
  content?: LearningContent
  question?: QuestionData
  progress: number
  totalSteps: number
  currentStep: number
  isLoading?: boolean
  isStreaming?: boolean
  streamingText?: string
  onSubmitAnswer: (answer: string) => void
  onRequestHint: () => void
  onPlayAudio: (text: string) => void
  onNext: () => void
  onBack: () => void
}

export function LearningInterface({
  sessionId: _sessionId,
  studentName = "Student",
  content,
  question,
  progress,
  totalSteps,
  currentStep,
  isLoading = false,
  isStreaming = false,
  streamingText = "",
  onSubmitAnswer,
  onRequestHint,
  onPlayAudio,
  onNext,
  onBack,
}: LearningInterfaceProps) {
  const [answer, setAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const handleSubmit = useCallback(() => {
    if (question?.type === "multiple-choice" && selectedOption) {
      onSubmitAnswer(selectedOption)
    } else if (answer.trim()) {
      onSubmitAnswer(answer)
      setAnswer("")
    }
  }, [answer, selectedOption, question, onSubmitAnswer])

  const handleVoiceResult = useCallback(
    (transcription: string) => {
      setAnswer(transcription)
      onSubmitAnswer(transcription)
    },
    [onSubmitAnswer]
  )

  const handleRequestHint = useCallback(() => {
    setShowHint(true)
    onRequestHint()
  }, [onRequestHint])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Celebration Overlay */}
      {showCelebration && (
        <CelebrationOverlay onComplete={() => setShowCelebration(false)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-medium text-lg">Hi, {studentName}!</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="h-10 w-10"
            >
              {audioEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRequestHint}
              className="h-10 w-10"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl px-4 py-6">
        {/* Content Card */}
        <Card className="mb-6 overflow-hidden bg-white shadow-sm">
          <CardContent className="p-6">
            {isLoading ? (
              <LoadingState />
            ) : isStreaming ? (
              <StreamingContent text={streamingText} />
            ) : content ? (
              <ContentDisplay
                content={content}
                audioEnabled={audioEnabled}
                onPlayAudio={onPlayAudio}
              />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        {/* Question/Input Card */}
        {question && !isLoading && (
          <Card className="mb-6 overflow-hidden bg-white shadow-sm">
            <CardContent className="p-6">
              <QuestionDisplay
                question={question}
                answer={answer}
                selectedOption={selectedOption}
                showHint={showHint}
                isRecording={isRecording}
                onAnswerChange={setAnswer}
                onOptionSelect={setSelectedOption}
                onStartRecording={() => setIsRecording(true)}
                onStopRecording={() => setIsRecording(false)}
                onVoiceResult={handleVoiceResult}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={currentStep <= 1}
            className="h-12 px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={isLoading || isStreaming}
            className="h-12 px-6"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// Sub-Components
// ============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
      <p className="text-muted-foreground">Getting ready...</p>
    </div>
  )
}

function StreamingContent({ text }: { text: string }) {
  return (
    <div className="prose prose-lg max-w-none">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm text-blue-600">Generating...</span>
      </div>
      <p className="text-lg leading-relaxed">{text}<span className="animate-pulse">▌</span></p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        <Lightbulb className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ready to learn!</h3>
      <p className="text-muted-foreground">Content will appear here</p>
    </div>
  )
}

interface ContentDisplayProps {
  content: LearningContent
  audioEnabled: boolean
  onPlayAudio: (text: string) => void
}

function ContentDisplay({ content, audioEnabled, onPlayAudio }: ContentDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="prose prose-lg max-w-none">
        <p className="text-xl leading-relaxed">{content.content}</p>
      </div>

      {/* Translation (L1 Bridge) */}
      {content.translation && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-amber-900" dir="auto">{content.translation}</p>
        </div>
      )}

      {/* Vocabulary */}
      {content.vocabulary && content.vocabulary.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Key Words
          </h4>
          <div className="grid gap-3">
            {content.vocabulary.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onPlayAudio(item.word)}
                  disabled={!audioEnabled}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <p className="font-semibold">{item.word}</p>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                  {item.translation && (
                    <p className="text-sm text-blue-600 mt-1">{item.translation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual */}
      {content.visual && (
        <div className="rounded-lg overflow-hidden border relative h-48">
          <Image
            src={content.visual}
            alt="Visual support"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
    </div>
  )
}

interface QuestionDisplayProps {
  question: QuestionData
  answer: string
  selectedOption: string | null
  showHint: boolean
  isRecording: boolean
  onAnswerChange: (value: string) => void
  onOptionSelect: (id: string) => void
  onStartRecording: () => void
  onStopRecording: () => void
  onVoiceResult: (text: string) => void
  onSubmit: () => void
}

function QuestionDisplay({
  question,
  answer,
  selectedOption,
  showHint,
  isRecording,
  onAnswerChange,
  onOptionSelect,
  onStartRecording,
  onStopRecording,
  onVoiceResult,
  onSubmit,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Question */}
      <p className="text-lg font-medium">{question.prompt}</p>

      {/* Hint */}
      {showHint && question.hint && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{question.hint}</p>
        </div>
      )}

      {/* Answer Input based on type */}
      {question.type === "multiple-choice" && question.options ? (
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                selectedOption === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span className="text-lg">{option.text}</span>
            </button>
          ))}
        </div>
      ) : question.type === "voice" ? (
        <div className="flex flex-col items-center gap-4">
          <VoiceRecorder
            isRecording={isRecording}
            onStart={onStartRecording}
            onStop={onStopRecording}
            onResult={onVoiceResult}
          />
          {answer && (
            <div className="w-full p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">What you said:</p>
              <p className="font-medium">{answer}</p>
            </div>
          )}
        </div>
      ) : question.type === "number" ? (
        <Input
          type="number"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer..."
          className="h-14 text-xl"
        />
      ) : (
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer..."
          className="min-h-[100px] text-lg"
        />
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          onClick={onSubmit}
          disabled={
            question.type === "multiple-choice" ? !selectedOption : !answer.trim()
          }
          className="flex-1 h-14 text-lg"
        >
          <Send className="h-5 w-5 mr-2" />
          Submit Answer
        </Button>
      </div>
    </div>
  )
}

export default LearningInterface
