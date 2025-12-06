"use client"

/**
 * Visual Feedback Components
 * Celebrations, progress animations, and encouragement displays
 */

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Star,
  Trophy,
  Sparkles,
  Heart,
  ThumbsUp,
  Zap,
  Crown,
  Target,
  Flame,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import confetti from "canvas-confetti"

// ============================================================================
// Celebration Overlay
// ============================================================================

interface CelebrationOverlayProps {
  type?: "confetti" | "stars" | "sparkles"
  message?: string
  subMessage?: string
  duration?: number
  onComplete?: () => void
}

export function CelebrationOverlay({
  type = "confetti",
  message = "Great job!",
  subMessage = "You got it right!",
  duration = 3000,
  onComplete,
}: CelebrationOverlayProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Trigger confetti
    if (type === "confetti") {
      const count = 200
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      }

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        })
      }

      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2, { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      fire(0.1, { spread: 120, startVelocity: 45 })
    }

    // Auto-hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [type, duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center animate-bounce shadow-2xl">
            <Star className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Floating Stars */}
        {type === "stars" && (
          <>
            <FloatingIcon icon={Star} delay={0} className="absolute -top-4 -left-16" />
            <FloatingIcon icon={Star} delay={100} className="absolute -top-8 left-16" />
            <FloatingIcon icon={Star} delay={200} className="absolute top-0 -right-12" />
            <FloatingIcon icon={Sparkles} delay={300} className="absolute -bottom-4 -left-8" />
            <FloatingIcon icon={Sparkles} delay={400} className="absolute -bottom-2 right-8" />
          </>
        )}

        {/* Message */}
        <div className="mt-8 text-center">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">{message}</h2>
          <p className="mt-2 text-xl text-white/90 drop-shadow">{subMessage}</p>
        </div>
      </div>
    </div>
  )
}

function FloatingIcon({
  icon: Icon,
  delay = 0,
  className,
}: {
  icon: typeof Star
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
    </div>
  )
}

// ============================================================================
// Answer Feedback
// ============================================================================

interface AnswerFeedbackProps {
  isCorrect: boolean | null
  message?: string
  correctAnswer?: string
  explanation?: string
  onDismiss?: () => void
}

export function AnswerFeedback({
  isCorrect,
  message,
  correctAnswer,
  explanation,
  onDismiss: _onDismiss,
}: AnswerFeedbackProps) {
  if (isCorrect === null) return null

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 animate-in slide-in-from-bottom-4 duration-300",
        isCorrect
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      )}
    >
      <div className="flex items-start gap-3">
        {isCorrect ? (
          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
        ) : (
          <XCircle className="h-6 w-6 text-red-500 shrink-0" />
        )}
        <div className="flex-1">
          <p className={cn("font-semibold", isCorrect ? "text-green-700" : "text-red-700")}>
            {message || (isCorrect ? "Correct!" : "Not quite...")}
          </p>
          {!isCorrect && correctAnswer && (
            <p className="mt-1 text-gray-600">
              The correct answer is: <strong>{correctAnswer}</strong>
            </p>
          )}
          {explanation && (
            <p className="mt-2 text-sm text-gray-500">{explanation}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Progress Celebration
// ============================================================================

interface ProgressCelebrationProps {
  milestone: "started" | "halfway" | "almost" | "completed"
  streakCount?: number
}

export function ProgressCelebration({ milestone, streakCount }: ProgressCelebrationProps) {
  const milestoneConfig = {
    started: {
      icon: Flame,
      message: "Great start!",
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    halfway: {
      icon: Target,
      message: "Halfway there!",
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    almost: {
      icon: Zap,
      message: "Almost done!",
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    completed: {
      icon: Trophy,
      message: "Completed!",
      color: "text-amber-500",
      bg: "bg-amber-100",
    },
  }

  const config = milestoneConfig[milestone]
  const Icon = config.icon

  return (
    <div className={cn("p-4 rounded-lg flex items-center gap-3", config.bg)}>
      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", config.bg)}>
        <Icon className={cn("h-6 w-6", config.color)} />
      </div>
      <div>
        <p className={cn("font-semibold", config.color)}>{config.message}</p>
        {streakCount && streakCount > 1 && (
          <p className="text-sm text-muted-foreground">
            {streakCount} correct in a row! 🔥
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Star Rating Display
// ============================================================================

interface StarRatingProps {
  score: number
  maxScore: number
  size?: "sm" | "md" | "lg"
}

export function StarRating({ score, maxScore, size = "md" }: StarRatingProps) {
  const percentage = (score / maxScore) * 100
  const stars =
    percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0

  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            i <= stars
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Achievement Badge
// ============================================================================

interface AchievementBadgeProps {
  type: "first-try" | "speed" | "streak" | "mastery" | "helper"
  label?: string
  animate?: boolean
}

export function AchievementBadge({ type, label, animate = true }: AchievementBadgeProps) {
  const badgeConfig = {
    "first-try": {
      icon: Target,
      color: "bg-blue-500",
      label: "First Try!",
    },
    speed: {
      icon: Zap,
      color: "bg-yellow-500",
      label: "Speed Star!",
    },
    streak: {
      icon: Flame,
      color: "bg-orange-500",
      label: "On Fire!",
    },
    mastery: {
      icon: Crown,
      color: "bg-purple-500",
      label: "Mastered!",
    },
    helper: {
      icon: Heart,
      color: "bg-pink-500",
      label: "Great Helper!",
    },
  }

  const config = badgeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium",
        config.color,
        animate && "animate-in zoom-in-50 duration-500"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label || config.label}</span>
    </div>
  )
}

// ============================================================================
// Encouragement Message
// ============================================================================

interface EncouragementMessageProps {
  type: "trying" | "improving" | "persisting" | "helping"
  studentName?: string
}

const ENCOURAGEMENT_MESSAGES = {
  trying: [
    "Great effort! Keep going!",
    "You're trying so hard!",
    "Every try makes you better!",
    "I believe in you!",
  ],
  improving: [
    "You're getting better!",
    "Look how much you've learned!",
    "Wow, you're improving!",
    "Keep up the great work!",
  ],
  persisting: [
    "Don't give up!",
    "You can do this!",
    "Almost there!",
    "Keep trying!",
  ],
  helping: [
    "You're a great helper!",
    "Thanks for helping!",
    "You're so kind!",
    "Great teamwork!",
  ],
}

export function EncouragementMessage({ type, studentName }: EncouragementMessageProps) {
  // Use a function to compute the initial message to avoid synchronous setState in effect
  const getRandomMessage = useCallback(() => {
    const messages = ENCOURAGEMENT_MESSAGES[type]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    return studentName ? `${studentName}, ${randomMessage.toLowerCase()}` : randomMessage
  }, [type, studentName])

  const [message, setMessage] = useState(getRandomMessage)

  // Only update when type or studentName changes, using setTimeout to avoid sync setState
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMessage(getRandomMessage())
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [getRandomMessage])

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
      <ThumbsUp className="h-5 w-5 text-blue-500" />
      <p className="text-sm font-medium text-blue-700">{message}</p>
    </div>
  )
}

// ============================================================================
// Loading Animation
// ============================================================================

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Streak Counter
// ============================================================================

interface StreakCounterProps {
  count: number
  max?: number
}

export function StreakCounter({ count, max = 10 }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: Math.min(count, max) }).map((_, i) => (
          <Flame
            key={i}
            className={cn(
              "h-5 w-5 -ml-1 first:ml-0 transition-all duration-300",
              i < count ? "text-orange-500" : "text-gray-300"
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
      {count > max && (
        <span className="text-sm font-medium text-orange-500">+{count - max}</span>
      )}
    </div>
  )
}

export default CelebrationOverlay
