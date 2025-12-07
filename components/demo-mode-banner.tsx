"use client"

import { AlertCircle } from "lucide-react"

export function DemoModeBanner() {
  // Check if we are in demo mode
  // In a real implementation, this might check an env var or auth state
  // For now, we assume if Supabase keys are default/missing, we are in demo mode
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

  if (!isDemo) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-900 flex items-center justify-center">
      <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
      <span>
        <strong>Demo Mode:</strong> Authentication is simulated and data will not be saved permanently. 
        <a href="https://github.com/your-repo/verbapath#setup" className="underline ml-2 hover:text-amber-950">
          Set up production keys
        </a>
      </span>
    </div>
  )
}
