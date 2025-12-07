"use client"

/**
 * Demo Mode Banner
 * Shows a dismissible banner when the app is running in demo mode
 */

import { useState, useSyncExternalStore } from "react"
import { AlertTriangle, X, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Check demo mode at module level to avoid hydration issues
function getIsDemoMode(): boolean {
  if (typeof window === "undefined") return false
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const notConfigured = !supabaseUrl || 
    supabaseUrl === "https://demo.supabase.co" ||
    supabaseUrl === "https://your-project.supabase.co"
  return demoMode || notConfigured
}

function getIsDismissed(): boolean {
  if (typeof window === "undefined") return true
  return sessionStorage.getItem("demo-banner-dismissed") === "true"
}

// External store for dismissed state
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function DemoModeBanner() {
  const isDismissed = useSyncExternalStore(subscribe, getIsDismissed, () => true)
  const [dismissed, setDismissed] = useState(isDismissed)
  const isDemo = useSyncExternalStore(subscribe, getIsDemoMode, () => false)

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem("demo-banner-dismissed", "true")
  }

  if (!isDemo || dismissed || isDismissed) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">Demo Mode</span>
          </div>
          <span className="text-sm text-amber-100 hidden sm:inline">
            Running with sample data. No authentication required.
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            href="https://github.com/your-repo/verbapath#getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs text-amber-100 hover:text-white transition-colors"
          >
            Setup Guide
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline demo warning for specific features
 */
export function DemoWarning({ 
  feature = "This feature",
  className = ""
}: { 
  feature?: string
  className?: string 
}) {
  const isDemo = useSyncExternalStore(subscribe, getIsDemoMode, () => false)

  if (!isDemo) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md ${className}`}>
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{feature} uses simulated data in demo mode.</span>
    </div>
  )
}
