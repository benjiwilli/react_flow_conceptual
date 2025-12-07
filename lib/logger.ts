/**
 * Production-Ready Logging Utility
 * Provides structured logging with environment-aware output levels
 * In production, only warnings and errors are logged; in development, full logging is enabled
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"

interface LogContext {
  requestId?: string
  userId?: string
  sessionId?: string
  action?: string
  duration?: number
  [key: string]: unknown
}

interface Logger {
  debug: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, error?: Error | unknown, context?: LogContext) => void
  // Structured logging methods
  api: (method: string, path: string, statusCode: number, duration: number, context?: LogContext) => void
  performance: (operation: string, duration: number, context?: LogContext) => void
  security: (event: string, context?: LogContext) => void
  audit: (action: string, userId: string, context?: LogContext) => void
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ""
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

function formatStructuredLog(data: Record<string, unknown>): string {
  if (isDev) {
    return JSON.stringify(data, null, 2)
  }
  // In production, single-line JSON for log aggregators
  return JSON.stringify(data)
}

function shouldLog(level: LogLevel): boolean {
  // In test mode, suppress most logs
  if (isTest) {
    return level === "error"
  }
  // In production, only warnings and errors
  if (!isDev) {
    return level === "warn" || level === "error"
  }
  return true
}

export const logger: Logger = {
  debug: (message: string, context?: LogContext) => {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", message, context))
    }
  },

  info: (message: string, context?: LogContext) => {
    if (shouldLog("info")) {
      console.info(formatMessage("info", message, context))
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, context))
    }
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (shouldLog("error")) {
      const errorDetails = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error
      console.error(formatMessage("error", message, { ...context, error: errorDetails }))
    }
  },

  // API request/response logging
  api: (method: string, path: string, statusCode: number, duration: number, context?: LogContext) => {
    if (shouldLog("info")) {
      const logData = {
        type: "api",
        timestamp: new Date().toISOString(),
        method,
        path,
        statusCode,
        duration: `${duration}ms`,
        ...context,
      }
      console.info(formatStructuredLog(logData))
    }
  },

  // Performance metrics logging
  performance: (operation: string, duration: number, context?: LogContext) => {
    if (shouldLog("info")) {
      const logData = {
        type: "performance",
        timestamp: new Date().toISOString(),
        operation,
        duration: `${duration}ms`,
        ...context,
      }
      console.info(formatStructuredLog(logData))
    }
  },

  // Security event logging (always logged)
  security: (event: string, context?: LogContext) => {
    const logData = {
      type: "security",
      timestamp: new Date().toISOString(),
      event,
      ...context,
    }
    console.warn(formatStructuredLog(logData))
  },

  // Audit trail logging (always logged)
  audit: (action: string, userId: string, context?: LogContext) => {
    const logData = {
      type: "audit",
      timestamp: new Date().toISOString(),
      action,
      userId,
      ...context,
    }
    console.info(formatStructuredLog(logData))
  },
}

/**
 * Create a child logger with preset context
 */
export function createLogger(defaultContext: LogContext): Logger {
  return {
    debug: (msg, ctx) => logger.debug(msg, { ...defaultContext, ...ctx }),
    info: (msg, ctx) => logger.info(msg, { ...defaultContext, ...ctx }),
    warn: (msg, ctx) => logger.warn(msg, { ...defaultContext, ...ctx }),
    error: (msg, err, ctx) => logger.error(msg, err, { ...defaultContext, ...ctx }),
    api: (method, path, status, duration, ctx) => 
      logger.api(method, path, status, duration, { ...defaultContext, ...ctx }),
    performance: (op, duration, ctx) => 
      logger.performance(op, duration, { ...defaultContext, ...ctx }),
    security: (event, ctx) => logger.security(event, { ...defaultContext, ...ctx }),
    audit: (action, userId, ctx) => logger.audit(action, userId, { ...defaultContext, ...ctx }),
  }
}

/**
 * Performance timer utility
 */
export function startTimer(): () => number {
  const start = performance.now()
  return () => Math.round(performance.now() - start)
}

export default logger
