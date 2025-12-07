"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Store for high contrast preference
let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(callback: () => void): () => void {
  listeners.push(callback)
  
  // Also listen to system preference changes
  const mediaQuery = window.matchMedia("(prefers-contrast: more)")
  const handleMedia = () => {
    // Only update if no explicit user preference is stored
    if (localStorage.getItem("high-contrast") === null) {
      emitChange()
    }
  }
  mediaQuery.addEventListener("change", handleMedia)
  
  return () => {
    listeners = listeners.filter(l => l !== callback)
    mediaQuery.removeEventListener("change", handleMedia)
  }
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false
  // Check localStorage first for explicit user preference
  const stored = localStorage.getItem("high-contrast")
  if (stored !== null) return stored === "true"
  // Fall back to system preference
  return window.matchMedia("(prefers-contrast: more)").matches
}

function getServerSnapshot(): boolean {
  return false
}

export function HighContrastToggle() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Apply/remove high contrast class when state changes
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }, [enabled])

  const handleToggle = useCallback((checked: boolean) => {
    localStorage.setItem("high-contrast", String(checked))
    emitChange()
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="high-contrast"
        checked={enabled}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="high-contrast" className="cursor-pointer">High Contrast Mode</Label>
    </div>
  )
}
