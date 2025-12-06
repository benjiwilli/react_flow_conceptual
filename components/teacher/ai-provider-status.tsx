"use client"

/**
 * AI Provider Status Component
 * Displays the status of configured AI providers
 */

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, Bot } from "lucide-react"

interface ProviderStatus {
  provider: string
  available: boolean
  configured: boolean
  error?: string
}

export function AIProviderStatus() {
  const [statuses, setStatuses] = useState<ProviderStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const response = await fetch("/api/ai/status")
        if (response.ok) {
          const data = await response.json()
          setStatuses(data.providers)
        }
      } catch (error) {
        console.error("Failed to fetch AI provider statuses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatuses()
  }, [])

  const getStatusIcon = (status: ProviderStatus) => {
    if (status.available) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (status.configured) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    return <XCircle className="h-4 w-4 text-gray-400" />
  }

  const getStatusBadge = (status: ProviderStatus) => {
    if (status.available) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    }
    if (status.configured) {
      return <Badge variant="secondary">Configured</Badge>
    }
    return <Badge variant="outline">Not Configured</Badge>
  }

  const providerDisplayNames: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic (Claude)",
    google: "Google (Gemini)",
    azure: "Azure OpenAI",
    mock: "Mock Provider",
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  const activeProvider = statuses.find((s) => s.available && s.provider !== "mock")
  const hasRealProvider = statuses.some((s) => s.available && s.provider !== "mock")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Providers
        </CardTitle>
        {activeProvider && (
          <p className="text-sm text-muted-foreground">
            Using: <span className="font-medium">{providerDisplayNames[activeProvider.provider]}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!hasRealProvider && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-yellow-700 dark:text-yellow-400">
                  No AI Provider Configured
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Using mock responses. Set AI_OPENAI_API_KEY or another provider key to enable AI features.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {statuses.map((status) => (
            <div
              key={status.provider}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className="text-sm font-medium">
                  {providerDisplayNames[status.provider] || status.provider}
                </span>
              </div>
              {getStatusBadge(status)}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Configure providers by setting environment variables. See{" "}
            <code className="px-1 py-0.5 bg-muted rounded text-xs">
              .env.local.example
            </code>{" "}
            for details.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
