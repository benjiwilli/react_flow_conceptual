import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from '@/components/providers'
import { SkipLinks } from '@/components/accessibility/skip-links'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import { DemoModeBanner } from '@/components/demo-mode-banner'
import './globals.css'
import '@/styles/accessibility-fixes.css'
import '@/styles/high-contrast.css'

export const metadata: Metadata = {
  title: 'VerbaPath - AI-Powered ESL Learning Orchestrator',
  description: 'Beautifully simple, powerfully personalized learning pathways for Alberta K-12 ESL students',
  generator: 'VerbaPath',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Providers>
          <ErrorBoundary>
            <SkipLinks />
            <DemoModeBanner />
            <main id="main-content">
              {children}
            </main>
            <Toaster />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
