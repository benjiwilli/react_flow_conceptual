"use client"

import { useState } from "react"

export function SkipLinks() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="skip-links">
      <a 
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 ${
          visible ? "block" : ""
        }`}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-48 bg-blue-600 text-white p-2 z-50 ${
          visible ? "block" : ""
        }`}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        Skip to navigation
      </a>
    </div>
  )
}
