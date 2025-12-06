/**
 * AI Provider Client
 * Unified interface for calling different AI providers
 */

import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, streamText } from "ai"
import {
  AIProvider,
  getProviderConfig,
  validateProvider,
  getBestAvailableProvider,
} from "./provider-config"

export interface AIRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  provider?: AIProvider
  stream?: boolean
}

export interface AIResponse {
  text: string
  provider: AIProvider
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Create AI provider instance based on provider type
 */
function createProviderInstance(provider: AIProvider) {
  const config = getProviderConfig(provider)

  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey: config.apiKey,
      })

    case "anthropic":
      return createAnthropic({
        apiKey: config.apiKey,
      })

    case "google":
      return createGoogleGenerativeAI({
        apiKey: config.apiKey,
      })

    case "azure":
      // Azure OpenAI has a different setup
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.endpoint,
      })

    case "mock":
    default:
      return null
  }
}

/**
 * Get the model identifier for a provider
 */
function getModel(provider: ReturnType<typeof createProviderInstance>, providerType: AIProvider) {
  const config = getProviderConfig(providerType)
  
  if (!provider || providerType === "mock") {
    return null
  }

  switch (providerType) {
    case "openai":
    case "azure":
      return (provider as ReturnType<typeof createOpenAI>)(config.model || "gpt-4o-mini")
    case "anthropic":
      return (provider as ReturnType<typeof createAnthropic>)(config.model || "claude-3-haiku-20240307")
    case "google":
      return (provider as ReturnType<typeof createGoogleGenerativeAI>)(config.model || "gemini-1.5-flash")
    default:
      return null
  }
}

/**
 * Generate mock response for testing without API keys
 */
function generateMockResponse(prompt: string): AIResponse {
  const mockResponses = [
    "This is a mock AI response for testing purposes.",
    "Great question! Here's a sample response from the mock provider.",
    "I'm a mock AI assistant. In production, this would be a real response.",
    `You asked: "${prompt.slice(0, 50)}..." - This is a simulated response.`,
  ]

  return {
    text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
    provider: "mock",
    model: "mock-model",
    usage: {
      promptTokens: Math.floor(prompt.length / 4),
      completionTokens: 50,
      totalTokens: Math.floor(prompt.length / 4) + 50,
    },
  }
}

/**
 * Generate AI response (non-streaming)
 */
export async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  const { prompt, systemPrompt, temperature, provider: requestedProvider } = request

  // Determine which provider to use
  let provider = requestedProvider || getBestAvailableProvider()
  
  if (!provider) {
    // Fall back to mock if no providers available
    provider = "mock"
  }

  // Validate provider
  const status = validateProvider(provider)
  if (!status.available && provider !== "mock") {
    // Try to failover to another provider
    provider = getBestAvailableProvider() || "mock"
  }

  // Use mock provider if no real providers available
  if (provider === "mock") {
    return generateMockResponse(prompt)
  }

  const config = getProviderConfig(provider)
  const providerInstance = createProviderInstance(provider)
  const model = getModel(providerInstance, provider)

  if (!model) {
    return generateMockResponse(prompt)
  }

  try {
    const result = await generateText({
      model,
      prompt,
      system: systemPrompt,
      maxRetries: 2,
      temperature: temperature || config.temperature,
    })

    // Extract usage from result - the AI SDK v4 uses inputTokens/outputTokens
    const usage = result.usage as unknown as { inputTokens?: number; outputTokens?: number } | undefined

    return {
      text: result.text,
      provider,
      model: config.model || "unknown",
      usage: usage ? {
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      } : undefined,
    }
  } catch (error) {
    console.error(`AI provider error (${provider}):`, error)
    
    // Try failover to another provider
    const fallbackProvider = getBestAvailableProvider()
    if (fallbackProvider && fallbackProvider !== provider) {
      console.log(`Attempting failover from ${provider} to ${fallbackProvider}`)
      return generateAIResponse({ ...request, provider: fallbackProvider })
    }

    // Last resort: mock response
    return generateMockResponse(prompt)
  }
}

/**
 * Generate streaming AI response
 */
export async function* streamAIResponse(request: AIRequest): AsyncGenerator<string> {
  const { prompt, systemPrompt, temperature, provider: requestedProvider } = request

  const provider = requestedProvider || getBestAvailableProvider()
  
  if (!provider || provider === "mock") {
    // Mock streaming response
    const mockResponse = "This is a mock streaming response. Each word appears with a delay."
    const words = mockResponse.split(" ")
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      yield word + " "
    }
    return
  }

  const config = getProviderConfig(provider)
  const providerInstance = createProviderInstance(provider)
  const model = getModel(providerInstance, provider)

  if (!model) {
    yield "Error: No AI model available"
    return
  }

  try {
    const result = streamText({
      model,
      prompt,
      system: systemPrompt,
      maxRetries: 2,
      temperature: temperature || config.temperature,
    })

    for await (const textPart of result.textStream) {
      yield textPart
    }
  } catch (error) {
    console.error(`AI streaming error (${provider}):`, error)
    yield `Error: ${String(error)}`
  }
}

/**
 * Check if AI is available (any provider configured)
 */
export function isAIAvailable(): boolean {
  return getBestAvailableProvider() !== null
}
