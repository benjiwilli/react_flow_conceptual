"use client"

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for screen reader users
 * WCAG 2.4.1 - Bypass Blocks
 */

export function SkipLinks() {
  return (
    <nav aria-label="Skip links" className="skip-links">
      <a 
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] bg-blue-800 text-white px-4 py-2 font-semibold"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-48 focus:z-[100] bg-blue-800 text-white px-4 py-2 font-semibold"
      >
        Skip to navigation
      </a>
    </nav>
  )
}
