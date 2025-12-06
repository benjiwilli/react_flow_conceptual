import { generateObject, generateText, streamText, type CoreMessage } from "ai"
import { z } from "zod"

/**
 * Thin wrapper around the Vercel AI SDK so node runners stay lean.
 * Provides helpers for plain text, streaming text, and structured output.
 */

export interface AIRequestOptions {
  prompt?: string
  system?: string
  model?: string
  temperature?: number
  maxOutputTokens?: number
  messages?: CoreMessage[]
}

export interface AIStructuredRequest<TOutput> extends AIRequestOptions {
  schema: z.ZodType<TOutput>
}

const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || "gpt-4o-mini"
const DEFAULT_TEMPERATURE = Number(process.env.AI_DEFAULT_TEMPERATURE ?? 0.3)

const resolveModel = (model?: string) => model || DEFAULT_MODEL
const resolveTemperature = (temperature?: number) =>
  typeof temperature === "number" ? temperature : DEFAULT_TEMPERATURE

const buildPromptPayload = (options: AIRequestOptions) => {
  if (options.messages && options.messages.length > 0) {
    return { messages: options.messages }
  }

  return { prompt: options.prompt ?? "" }
}

const ensureProviderConfigured = () => {
  if (!process.env.AI_OPENAI_API_KEY) {
    throw new Error("Missing AI provider key. Set AI_OPENAI_API_KEY in your environment.")
  }
}

export async function generateTextCompletion(options: AIRequestOptions) {
  ensureProviderConfigured()

  const result = await generateText({
    model: resolveModel(options.model),
    temperature: resolveTemperature(options.temperature),
    maxOutputTokens: options.maxOutputTokens,
    system: options.system,
    ...buildPromptPayload(options),
  })

  return {
    text: result.text,
    usage: result.usage,
    finishReason: result.finishReason,
  }
}

export async function streamTextCompletion(options: AIRequestOptions) {
  ensureProviderConfigured()

  const result = await streamText({
    model: resolveModel(options.model),
    temperature: resolveTemperature(options.temperature),
    maxOutputTokens: options.maxOutputTokens,
    system: options.system,
    ...buildPromptPayload(options),
  })

  return {
    textStream: result.textStream,
    toTextStreamResponse: result.toTextStreamResponse,
  }
}

export async function generateStructuredOutput<TOutput>(options: AIStructuredRequest<TOutput>) {
  ensureProviderConfigured()

  const result = await generateObject({
    model: resolveModel(options.model),
    temperature: resolveTemperature(options.temperature),
    maxOutputTokens: options.maxOutputTokens,
    system: options.system,
    ...buildPromptPayload(options),
    schema: options.schema,
  })

  return {
    object: result.object,
    usage: result.usage,
  }
}

export const aiEnvStatus = () => ({
  defaultModel: DEFAULT_MODEL,
  hasOpenAIKey: Boolean(process.env.AI_OPENAI_API_KEY),
})

// ============================================================================
// Image Generation
// ============================================================================

export interface ImageGenerationOptions {
  prompt: string
  style?: "illustration" | "diagram" | "photo" | "graphic-organizer"
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  quality?: "standard" | "hd"
}

export interface ImageGenerationResult {
  url: string
  altText: string
  generatedByAI: boolean
}

const IMAGE_GENERATION_ENABLED = process.env.AI_ENABLE_IMAGE_GENERATION === "true"
const IMAGE_MODEL = process.env.AI_IMAGE_MODEL || "dall-e-3"
const IMAGE_QUALITY = (process.env.AI_IMAGE_QUALITY as "standard" | "hd") || "standard"

/**
 * Generate an AI image for visual support in learning content.
 * Falls back to placeholder if image generation is disabled or fails.
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { prompt, style = "illustration", size = "1024x1024", quality } = options

  // Check if image generation is enabled and API key exists
  if (!IMAGE_GENERATION_ENABLED || !process.env.AI_OPENAI_API_KEY) {
    return {
      url: getPlaceholderImageUrl(style),
      altText: `Visual support: ${prompt}`,
      generatedByAI: false,
    }
  }

  try {
    // Enhance prompt for educational context
    const enhancedPrompt = buildEducationalImagePrompt(prompt, style)

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality: quality || IMAGE_QUALITY,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Image generation error:", error)
      return {
        url: getPlaceholderImageUrl(style),
        altText: `Visual support: ${prompt}`,
        generatedByAI: false,
      }
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      return {
        url: getPlaceholderImageUrl(style),
        altText: `Visual support: ${prompt}`,
        generatedByAI: false,
      }
    }

    return {
      url: imageUrl,
      altText: generateAltText(prompt, style),
      generatedByAI: true,
    }
  } catch (error) {
    console.error("Image generation failed:", error)
    return {
      url: getPlaceholderImageUrl(style),
      altText: `Visual support: ${prompt}`,
      generatedByAI: false,
    }
  }
}

/**
 * Build an educational-focused prompt for image generation
 */
function buildEducationalImagePrompt(basePrompt: string, style: string): string {
  const styleInstructions: Record<string, string> = {
    illustration: "Create a clean, colorful, child-friendly illustration. Use simple shapes and bright colors. Avoid text in the image.",
    diagram: "Create a clear educational diagram with labeled parts. Use simple lines and shapes. Suitable for K-12 students.",
    photo: "Create a realistic, high-quality photograph suitable for educational materials. Safe for all ages.",
    "graphic-organizer": "Create a visual graphic organizer with clear sections and connections. Use boxes, arrows, and clean lines.",
  }

  return `${styleInstructions[style] || styleInstructions.illustration}

Topic: ${basePrompt}

Requirements:
- Safe and appropriate for elementary and middle school students
- Clear and easy to understand
- No text unless absolutely necessary
- High contrast and accessible colors
- Educational and engaging`
}

/**
 * Get placeholder image URL based on style
 */
function getPlaceholderImageUrl(style: string): string {
  const placeholders: Record<string, string> = {
    illustration: "/visuals/placeholder-illustration.svg",
    diagram: "/visuals/placeholder-diagram.svg",
    photo: "/visuals/placeholder-photo.svg",
    "graphic-organizer": "/visuals/placeholder-graphic-organizer.svg",
  }
  return placeholders[style] || placeholders.illustration
}

/**
 * Generate descriptive alt text for accessibility
 */
function generateAltText(prompt: string, style: string): string {
  const styleLabels: Record<string, string> = {
    illustration: "Illustration showing",
    diagram: "Diagram explaining",
    photo: "Photograph depicting",
    "graphic-organizer": "Graphic organizer for",
  }
  return `${styleLabels[style] || "Visual support for"} ${prompt}`
}

export const imageEnvStatus = () => ({
  imageGenerationEnabled: IMAGE_GENERATION_ENABLED,
  imageModel: IMAGE_MODEL,
  imageQuality: IMAGE_QUALITY,
  hasOpenAIKey: Boolean(process.env.AI_OPENAI_API_KEY),
})
