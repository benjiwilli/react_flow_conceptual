/**
 * AI Status API
 * Returns the status of configured AI providers
 */

import { NextResponse } from "next/server"
import { getAllProviderStatuses, getBestAvailableProvider } from "@/lib/ai/provider-config"

export async function GET() {
  try {
    const providers = getAllProviderStatuses()
    const activeProvider = getBestAvailableProvider()

    return NextResponse.json({
      providers,
      activeProvider,
      aiAvailable: activeProvider !== null && activeProvider !== "mock",
    })
  } catch (error) {
    console.error("Failed to get AI status:", error)
    return NextResponse.json(
      { error: "Failed to get AI status" },
      { status: 500 }
    )
  }
}
