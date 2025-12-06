/**
 * Simple logging utility that respects environment
 * In production, logs are minimized; in development, full logging is enabled
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const isDev = process.env.NODE_ENV === "development"

interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

function formatMessage(level: LogLevel, args: unknown[]): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  return `${prefix} ${args.map(arg => 
    typeof arg === "object" ? JSON.stringify(arg) : String(arg)
  ).join(" ")}`
}

export const logger: Logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(formatMessage("debug", args))
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(formatMessage("info", args))
    }
  },
  
  warn: (...args: unknown[]) => {
    // Warnings always logged
    console.warn(formatMessage("warn", args))
  },
  
  error: (...args: unknown[]) => {
    // Errors always logged
    console.error(formatMessage("error", args))
  },
}

export default logger
