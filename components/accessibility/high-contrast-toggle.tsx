"use client"

/**
 * High Contrast Toggle Component
 * Allows users to enable high contrast mode for better visibility
 * WCAG 1.4.3 - Contrast (Minimum)
 */

import { useEffect, useSyncExternalStore } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Contrast } from "lucide-react"

// External store for high contrast preference
function getSnapshot(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("high-contrast") === "true"
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function HighContrastToggle() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Apply high contrast class when enabled changes
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }, [enabled])

  const handleChange = (checked: boolean) => {
    localStorage.setItem("high-contrast", String(checked))
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new Event("storage"))
    
    if (checked) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="high-contrast"
        checked={enabled}
        onCheckedChange={handleChange}
        aria-describedby="high-contrast-description"
      />
      <Label 
        htmlFor="high-contrast" 
        className="flex items-center gap-2 cursor-pointer"
      >
        <Contrast className="h-4 w-4" />
        High Contrast Mode
      </Label>
      <span id="high-contrast-description" className="sr-only">
        Enable high contrast mode for improved visibility. This increases color contrast throughout the application.
      </span>
    </div>
  )
}
