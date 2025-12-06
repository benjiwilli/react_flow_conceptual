/**
 * Stream Manager
 * Handles streaming responses from AI models
 */

import type { StreamEvent } from "@/lib/types/execution"

export type StreamCallback = (event: StreamEvent) => void

export class StreamManager {
  private listeners: Map<string, StreamCallback[]> = new Map()
  private activeStreams: Map<string, AbortController> = new Map()

  /**
   * Subscribe to stream events for a specific node
   */
  subscribe(nodeId: string, callback: StreamCallback): () => void {
    const existing = this.listeners.get(nodeId) ?? []
    this.listeners.set(nodeId, [...existing, callback])

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(nodeId) ?? []
      this.listeners.set(
        nodeId,
        callbacks.filter((cb) => cb !== callback),
      )
    }
  }

  /**
   * Emit a stream event
   */
  emit(nodeId: string, event: StreamEvent): void {
    const callbacks = this.listeners.get(nodeId) ?? []
    callbacks.forEach((callback) => callback(event))
  }

  /**
   * Start a new stream for a node
   */
  startStream(nodeId: string): AbortController {
    // Cancel any existing stream for this node
    this.cancelStream(nodeId)

    const controller = new AbortController()
    this.activeStreams.set(nodeId, controller)

    this.emit(nodeId, {
      type: "start",
      nodeId,
      timestamp: new Date(),
    })

    return controller
  }

  /**
   * Send a token event
   */
  sendToken(nodeId: string, token: string): void {
    this.emit(nodeId, {
      type: "token",
      nodeId,
      content: token,
      timestamp: new Date(),
    })
  }

  /**
   * Complete a stream
   */
  completeStream(nodeId: string, finalContent: string): void {
    this.emit(nodeId, {
      type: "complete",
      nodeId,
      content: finalContent,
      timestamp: new Date(),
    })

    this.activeStreams.delete(nodeId)
  }

  /**
   * Cancel a stream
   */
  cancelStream(nodeId: string): void {
    const controller = this.activeStreams.get(nodeId)
    if (controller) {
      controller.abort()
      this.activeStreams.delete(nodeId)
    }
  }

  /**
   * Cancel all active streams
   */
  cancelAll(): void {
    this.activeStreams.forEach((controller, _nodeId) => {
      controller.abort()
    })
    this.activeStreams.clear()
  }

  /**
   * Check if a stream is active
   */
  isStreaming(nodeId: string): boolean {
    return this.activeStreams.has(nodeId)
  }
}

// Singleton instance
let streamManagerInstance: StreamManager | null = null

export const getStreamManager = (): StreamManager => {
  if (!streamManagerInstance) {
    streamManagerInstance = new StreamManager()
  }
  return streamManagerInstance
}
