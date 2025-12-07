"use client"

import { useCallback } from "react"
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  WifiOff,
  ServerOff,
  FileQuestion,
  ShieldAlert,
  Clock,
  Frown,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "./button"

/**
 * Error State Components
 * 
 * Design Philosophy (Jony Ive inspired):
 * - Calm, non-threatening error presentation
 * - Encouraging language that maintains confidence
 * - Clear, actionable next steps
 * - Visual warmth despite the error condition
 */

type ErrorType = 
  | "generic"
  | "network" 
  | "server" 
  | "not-found" 
  | "unauthorized" 
  | "timeout"
  | "empty"

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  message?: string
  suggestion?: string
  onRetry?: () => void
  onBack?: () => void
  showHomeLink?: boolean
  className?: string
  children?: React.ReactNode
}

const errorConfig: Record<ErrorType, {
  icon: React.ElementType
  title: string
  message: string
  suggestion: string
  color: string
}> = {
  generic: {
    icon: AlertCircle,
    title: "Something went wrong",
    message: "We encountered an unexpected issue. Don't worry, these things happen!",
    suggestion: "Try refreshing the page or come back in a moment.",
    color: "text-amber-500",
  },
  network: {
    icon: WifiOff,
    title: "Connection lost",
    message: "It looks like you're offline or having network trouble.",
    suggestion: "Check your internet connection and try again.",
    color: "text-blue-500",
  },
  server: {
    icon: ServerOff,
    title: "Server hiccup",
    message: "Our servers are taking a short break. They'll be back soon!",
    suggestion: "This usually resolves quickly. Try again in a few moments.",
    color: "text-purple-500",
  },
  "not-found": {
    icon: FileQuestion,
    title: "Page not found",
    message: "We couldn't find what you're looking for.",
    suggestion: "The page may have moved or the link might be outdated.",
    color: "text-slate-500",
  },
  unauthorized: {
    icon: ShieldAlert,
    title: "Access needed",
    message: "You'll need to sign in to view this content.",
    suggestion: "Please log in with your teacher or student account.",
    color: "text-rose-500",
  },
  timeout: {
    icon: Clock,
    title: "Taking too long",
    message: "This request is taking longer than expected.",
    suggestion: "Try again or check if you're working with a large workflow.",
    color: "text-orange-500",
  },
  empty: {
    icon: Sparkles,
    title: "Nothing here yet",
    message: "This space is waiting for you to create something amazing!",
    suggestion: "Get started by adding your first item.",
    color: "text-indigo-500",
  },
}

export function ErrorState({
  type = "generic",
  title,
  message,
  suggestion,
  onRetry,
  onBack,
  showHomeLink = true,
  className,
  children,
}: ErrorStateProps) {
  const config = errorConfig[type]
  const Icon = config.icon
  
  const displayTitle = title || config.title
  const displayMessage = message || config.message
  const displaySuggestion = suggestion || config.suggestion

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center animate-fade-up",
      className
    )}>
      {/* Icon with subtle background */}
      <div className={cn(
        "mb-6 p-4 rounded-2xl bg-secondary/50",
        config.color
      )}>
        <Icon className="h-10 w-10" strokeWidth={1.5} />
      </div>
      
      {/* Title */}
      <h2 className="text-2xl font-medium tracking-tight mb-3 text-foreground">
        {displayTitle}
      </h2>
      
      {/* Message */}
      <p className="text-muted-foreground max-w-md mb-2 leading-relaxed">
        {displayMessage}
      </p>
      
      {/* Suggestion */}
      <p className="text-sm text-muted-foreground/70 max-w-md mb-8">
        {displaySuggestion}
      </p>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="rounded-full px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="rounded-full px-6 shadow-subtle hover:shadow-elevated transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {showHomeLink && !onBack && (
          <Button 
            variant="outline" 
            asChild
            className="rounded-full px-6"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        )}
      </div>
      
      {/* Custom content slot */}
      {children && (
        <div className="mt-8">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Inline error for form fields and small areas
 */
interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-destructive animate-fade-in",
      className
    )}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Error boundary fallback component
 */
interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorBoundaryFallback({ 
  error, 
  resetErrorBoundary 
}: ErrorBoundaryFallbackProps) {
  return (
    <ErrorState
      type="generic"
      title="Oops! Something unexpected happened"
      message="We've noted this issue and are working on it."
      suggestion={process.env.NODE_ENV === "development" ? error.message : undefined}
      onRetry={resetErrorBoundary}
    />
  )
}

/**
 * Empty state for lists, grids, and content areas
 */
interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon = Sparkles, 
  title, 
  message, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      <div className="mb-5 p-4 rounded-2xl bg-secondary/40 text-muted-foreground">
        <Icon className="h-8 w-8" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-medium mb-2 text-foreground">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="rounded-full px-6 shadow-subtle hover:shadow-elevated transition-all"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Loading error with retry
 */
interface LoadingErrorProps {
  message?: string
  onRetry: () => void
  className?: string
}

export function LoadingError({ 
  message = "Failed to load content", 
  onRetry,
  className 
}: LoadingErrorProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 px-4 text-center animate-fade-in",
      className
    )}>
      <Frown className="h-8 w-8 text-muted-foreground mb-3" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="rounded-full"
      >
        <RefreshCw className="h-3.5 w-3.5 mr-2" />
        Retry
      </Button>
    </div>
  )
}
