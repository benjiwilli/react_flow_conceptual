/**
 * AI Provider Configuration
 * Supports multiple AI providers with validation and failover
 */

export type AIProvider = "openai" | "anthropic" | "google" | "azure" | "mock"

export interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
  endpoint?: string
  maxTokens?: number
  temperature?: number
}

export interface AIProviderStatus {
  provider: AIProvider
  available: boolean
  configured: boolean
  error?: string
}

// Default configurations for each provider
export const DEFAULT_CONFIGS: Record<AIProvider, Partial<AIProviderConfig>> = {
  openai: {
    model: "gpt-4o-mini",
    maxTokens: 1000,
    temperature: 0.7,
  },
  anthropic: {
    model: "claude-3-haiku-20240307",
    maxTokens: 1000,
    temperature: 0.7,
  },
  google: {
    model: "gemini-1.5-flash",
    maxTokens: 1000,
    temperature: 0.7,
  },
  azure: {
    model: "gpt-4",
    maxTokens: 1000,
    temperature: 0.7,
  },
  mock: {
    model: "mock-model",
    maxTokens: 1000,
    temperature: 0.7,
  },
}

// Environment variable names for each provider
export const ENV_KEYS: Record<AIProvider, { apiKey: string; endpoint?: string }> = {
  openai: {
    apiKey: "AI_OPENAI_API_KEY",
  },
  anthropic: {
    apiKey: "AI_ANTHROPIC_API_KEY",
  },
  google: {
    apiKey: "AI_GOOGLE_API_KEY",
  },
  azure: {
    apiKey: "AI_AZURE_API_KEY",
    endpoint: "AI_AZURE_ENDPOINT",
  },
  mock: {
    apiKey: "MOCK_API_KEY", // Not required
  },
}

/**
 * Validate that required environment variables are set for a provider
 */
export function validateProvider(provider: AIProvider): AIProviderStatus {
  if (provider === "mock") {
    return { provider, available: true, configured: true }
  }

  const envKeys = ENV_KEYS[provider]
  const apiKey = process.env[envKeys.apiKey]
  const endpoint = envKeys.endpoint ? process.env[envKeys.endpoint] : undefined

  if (!apiKey) {
    return {
      provider,
      available: false,
      configured: false,
      error: `Missing ${envKeys.apiKey} environment variable`,
    }
  }

  if (envKeys.endpoint && !endpoint) {
    return {
      provider,
      available: false,
      configured: false,
      error: `Missing ${envKeys.endpoint} environment variable`,
    }
  }

  return { provider, available: true, configured: true }
}

/**
 * Get configuration for a provider, merging defaults with environment settings
 */
export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  const envKeys = ENV_KEYS[provider]
  const defaults = DEFAULT_CONFIGS[provider]

  return {
    provider,
    apiKey: provider !== "mock" ? process.env[envKeys.apiKey] : undefined,
    endpoint: envKeys.endpoint ? process.env[envKeys.endpoint] : undefined,
    model: process.env.AI_DEFAULT_MODEL || defaults.model,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || String(defaults.maxTokens)),
    temperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || String(defaults.temperature)),
  }
}

/**
 * Get the best available provider (for failover)
 */
export function getBestAvailableProvider(): AIProvider | null {
  const preferredOrder: AIProvider[] = ["openai", "anthropic", "google", "azure", "mock"]
  
  for (const provider of preferredOrder) {
    const status = validateProvider(provider)
    if (status.available) {
      return provider
    }
  }

  return null
}

/**
 * Get all provider statuses for dashboard display
 */
export function getAllProviderStatuses(): AIProviderStatus[] {
  const providers: AIProvider[] = ["openai", "anthropic", "google", "azure", "mock"]
  return providers.map(validateProvider)
}
