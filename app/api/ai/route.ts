import { NextResponse } from "next/server"
import { generateTextCompletion, streamTextCompletion } from "@/lib/engine/ai-client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, messages, model, temperature, maxOutputTokens, system, stream } = body || {}

    if (!prompt && !messages) {
      return NextResponse.json({ error: "Prompt or messages are required" }, { status: 400 })
    }

    if (stream) {
      const { textStream } = await streamTextCompletion({
        prompt,
        messages,
        model,
        temperature,
        maxOutputTokens,
        system,
      })

      const encoder = new TextEncoder()
      const streamBody = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const token of textStream) {
              controller.enqueue(encoder.encode(token))
            }
          } catch (error) {
            controller.error(error)
            return
          }
          controller.close()
        },
      })

      return new Response(streamBody, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      })
    }

    const result = await generateTextCompletion({
      prompt,
      messages,
      model,
      temperature,
      maxOutputTokens,
      system,
    })

    return NextResponse.json({ text: result.text, usage: result.usage })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
