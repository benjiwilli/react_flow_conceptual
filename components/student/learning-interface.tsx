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
  Send,
  Lightbulb,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { VoiceRecorder } from "./voice-recorder"
import { CelebrationOverlay } from "./visual-feedback"

export interface LearningContent {
  type: "text" | "question" | "multiple-choice" | "voice-prompt" | "visual"
  content: string
  translation?: string
  vocabulary?: VocabularyItem[]
  visual?: string
  audio?: string
}

export interface VocabularyItem {
  word: string
  definition: string
  translation?: string
  pronunciation?: string
}

export interface QuestionData {
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-100/50 blur-3xl" />
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <CelebrationOverlay onComplete={() => setShowCelebration(false)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md transition-all duration-200">
        <div className="container flex h-16 items-center justify-between px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/student"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {studentName.charAt(0)}
              </div>
              <span className="font-semibold text-lg text-slate-800">Hi, {studentName}!</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-600"
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
              className="h-10 w-10 rounded-full hover:bg-amber-50 text-amber-500 hover:text-amber-600"
            >
              <Lightbulb className={cn("h-5 w-5", showHint ? "fill-current" : "")} />
            </Button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="px-0 w-full h-1.5 bg-slate-100">
           <div 
             className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
             style={{ width: `${progress}%` }}
           />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl px-4 py-8 mx-auto relative z-1">
        <div className="mb-6 flex items-center justify-between text-sm text-slate-500 font-medium">
          <span className="bg-white/50 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm shadow-sm">
            Activity {currentStep} of {totalSteps}
          </span>
          <span className="bg-white/50 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm shadow-sm">
            {Math.round(progress)}% Complete
          </span>
        </div>

        {/* Content Card */}
        <Card className="mb-8 overflow-hidden bg-white/90 backdrop-blur-sm shadow-xl border-slate-100 rounded-3xl transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-8">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="mb-8 overflow-hidden bg-white shadow-xl border-blue-100 rounded-3xl ring-4 ring-blue-50">
              <CardContent className="p-8">
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
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4 mt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={currentStep <= 1}
            className="h-14 px-8 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-white/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={isLoading || isStreaming}
            className="h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 text-lg font-semibold"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
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
    <div className="space-y-6 py-4 animate-fade-in">
      {/* Shimmer header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      {/* Content shimmer */}
      <SkeletonText lines={3} />
      
      {/* Visual placeholder */}
      <Skeleton className="h-40 w-full rounded-2xl" />
      
      {/* Vocabulary shimmer */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      
      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-sm text-muted-foreground ml-2">Loading your activity...</span>
      </div>
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
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-subtle">
          <Sparkles className="h-9 w-9 text-blue-500" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center border-2 border-white shadow-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to learn!</h3>
      <p className="text-muted-foreground max-w-xs">
        Your learning activity is being prepared. Get ready for something amazing!
      </p>
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
    <div className="space-y-8">
      {/* Main Content */}
      <div className="prose prose-lg prose-slate max-w-none">
        <p className="text-2xl leading-relaxed text-slate-800 font-medium">{content.content}</p>
      </div>

      {/* Translation (L1 Bridge) */}
      {content.translation && (
        <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
          <p className="text-lg text-amber-900 font-medium relative z-10" dir="auto">{content.translation}</p>
        </div>
      )}

      {/* Vocabulary */}
      {content.vocabulary && content.vocabulary.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Key Words
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.vocabulary.map((item, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-white shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600"
                  onClick={() => onPlayAudio(item.word)}
                  disabled={!audioEnabled}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-slate-800 mb-1">{item.word}</p>
                  <p className="text-sm text-slate-600 leading-snug">{item.definition}</p>
                  {item.translation && (
                    <p className="text-sm text-blue-600 mt-2 font-medium">{item.translation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual */}
      {content.visual && (
        <div className="rounded-2xl overflow-hidden border-4 border-white shadow-lg relative h-64 sm:h-80 bg-slate-100">
          <Image
            src={content.visual}
            alt="Visual support"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
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
    <div className="space-y-6">
      {/* Question */}
      <h3 className="text-xl font-semibold text-slate-900 leading-snug">{question.prompt}</h3>

      {/* Hint */}
      {showHint && question.hint && (
        <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 bg-yellow-100 rounded-full shrink-0 text-yellow-600">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="pt-1">
            <p className="font-bold text-xs text-yellow-600 uppercase tracking-wide mb-1">Hint</p>
            <p className="text-base text-yellow-900">{question.hint}</p>
          </div>
        </div>
      )}

      {/* Answer Input based on type */}
      {question.type === "multiple-choice" && question.options ? (
        <div className="grid gap-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className={cn(
                "w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group",
                selectedOption === option.id
                  ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-200 ring-offset-1"
                  : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-md"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                selectedOption === option.id
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-300 group-hover:border-slate-400"
              )}>
                {selectedOption === option.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
              <span className={cn(
                "text-lg font-medium",
                selectedOption === option.id ? "text-blue-900" : "text-slate-700"
              )}>{option.text}</span>
            </button>
          ))}
        </div>
      ) : question.type === "voice" ? (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="p-6 bg-slate-50 rounded-3xl w-full text-center">
             <VoiceRecorder
              isRecording={isRecording}
              onStart={onStartRecording}
              onStop={onStopRecording}
              onResult={onVoiceResult}
            />
            <p className="text-sm text-slate-500 mt-4 font-medium">
              {isRecording ? "Listening..." : "Tap microphone to answer"}
            </p>
          </div>
          
          {answer && (
            <div className="w-full p-6 rounded-2xl bg-blue-50 border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">Transcript</p>
              <p className="text-lg font-medium text-slate-900">"{answer}"</p>
            </div>
          )}
        </div>
      ) : question.type === "number" ? (
        <div className="relative">
          <Input
            type="number"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your number..."
            className="h-16 text-2xl px-6 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all shadow-sm focus:ring-4 focus:ring-blue-100"
          />
        </div>
      ) : (
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[140px] text-lg p-5 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all shadow-sm focus:ring-4 focus:ring-blue-100 resize-none"
        />
      )}

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={onSubmit}
          disabled={
            question.type === "multiple-choice" ? !selectedOption : !answer.trim()
          }
          className="flex-1 h-14 text-lg rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-1"
        >
          <Send className="h-5 w-5 mr-3" />
          Submit Answer
        </Button>
      </div>
    </div>
  )
}

export default LearningInterface
