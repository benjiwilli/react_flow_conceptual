"use client"

import { useRef, useLayoutEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Page Transition Component
 * 
 * Design Philosophy (Jony Ive inspired):
 * - Smooth, elegant transitions between pages
 * - Subtle animation that doesn't distract
 * - Maintains visual continuity during navigation
 * 
 * Note: Uses CSS-only animations to avoid React state synchronization issues
 */

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-up", className)}>
      {children}
    </div>
  )
}

/**
 * Fade wrapper for content - CSS-only animation
 */
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 300, 
  className
}: FadeInProps) {
  return (
    <div
      className={cn(
        "animate-fade-up opacity-0",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: "forwards"
      }}
    >
      {children}
    </div>
  )
}

/**
 * Staggered fade in for lists of items - CSS-only animation
 */
interface StaggeredFadeInProps {
  children: React.ReactNode[]
  delayBetween?: number
  initialDelay?: number
  className?: string
  itemClassName?: string
}

export function StaggeredFadeIn({ 
  children, 
  delayBetween = 50, 
  initialDelay = 0,
  className,
  itemClassName
}: StaggeredFadeInProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div 
          key={index}
          className={cn("animate-fade-up opacity-0", itemClassName)}
          style={{ 
            animationDelay: `${initialDelay + (index * delayBetween)}ms`,
            animationFillMode: "forwards"
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * Scale in animation for modal-like content - controlled by CSS class
 */
interface ScaleInProps {
  children: React.ReactNode
  show: boolean
  className?: string
}

export function ScaleIn({ children, show, className }: ScaleInProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        show 
          ? "opacity-100 scale-100" 
          : "opacity-0 scale-95 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Slide in animation for sidebars and panels
 */
interface SlideInProps {
  children: React.ReactNode
  show: boolean
  direction?: "left" | "right" | "top" | "bottom"
  className?: string
}

export function SlideIn({ 
  children, 
  show, 
  direction = "right",
  className 
}: SlideInProps) {
  const transforms = {
    left: show ? "translate-x-0" : "-translate-x-full",
    right: show ? "translate-x-0" : "translate-x-full",
    top: show ? "translate-y-0" : "-translate-y-full",
    bottom: show ? "translate-y-0" : "translate-y-full",
  }

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        show ? "opacity-100" : "opacity-0",
        transforms[direction],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Collapse animation for expandable content
 */
interface CollapseProps {
  children: React.ReactNode
  show: boolean
  className?: string
}

export function Collapse({ children, show, className }: CollapseProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out overflow-hidden",
        show ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Animated presence wrapper - simple show/hide with animation
 */
interface AnimatedPresenceProps {
  children: React.ReactNode
  show: boolean
  className?: string
  enterAnimation?: string
  exitAnimation?: string
}

export function AnimatedPresence({ 
  children, 
  show, 
  className,
  enterAnimation = "animate-fade-in",
  exitAnimation = ""
}: AnimatedPresenceProps) {
  if (!show) return null
  
  return (
    <div className={cn(enterAnimation, className)}>
      {children}
    </div>
  )
}

/**
 * Loading shimmer overlay
 */
interface ShimmerOverlayProps {
  className?: string
}

export function ShimmerOverlay({ className }: ShimmerOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
    </div>
  )
}
