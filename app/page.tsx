/**
 * VerbaPath Landing Page
 * 
 * Design Philosophy (Jony Ive inspired):
 * - Purposeful simplicity over decorative complexity
 * - Generous white space that lets content breathe
 * - Typography as the primary design element
 * - Subtle depth through refined shadows
 * - Honest, confident presentation
 * - Every element earns its place
 */

import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal, purposeful */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-gentle group-hover:scale-105">
              <span className="text-lg font-semibold text-primary-foreground">V</span>
            </div>
            <span className="text-xl font-medium tracking-tight">VerbaPath</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link 
              href="/teacher" 
              className="text-sm text-muted-foreground hover:text-foreground transition-gentle"
            >
              Teachers
            </Link>
            <Link 
              href="/student" 
              className="text-sm text-muted-foreground hover:text-foreground transition-gentle"
            >
              Students
            </Link>
            <Button asChild className="rounded-full px-6">
              <Link href="/teacher/builder">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero - Let the message breathe */}
      <section className="pt-32 pb-24 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 text-sm text-muted-foreground mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Learning Pathways</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 leading-[1.1]">
            Every student&apos;s path
            <br />
            <span className="text-primary">is unique.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Create adaptive learning experiences that honor each student&apos;s 
            language, culture, and pace. Designed for Alberta K-12 ESL educators.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-elevated hover:shadow-lg transition-all hover:scale-105 active:scale-95" asChild>
              <Link href="/teacher/builder">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-8 h-12 text-base hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95" asChild>
              <Link href="/classroom/demo">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Simple statement */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
            Simplicity is the ultimate sophistication.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            VerbaPath removes complexity so teachers can focus on what matters: 
            designing meaningful learning experiences. Our visual workflow builder 
            transforms pedagogical expertise into personalized AI-powered pathways.
          </p>
        </div>
      </section>

      {/* Features - Clean grid, no clutter */}
      <section className="py-24 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
              Purposefully designed.
            </h2>
            <p className="text-lg text-muted-foreground">
              Every feature exists to serve teachers and students.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureBlock
              title="Visual Design"
              description="Drag, drop, connect. Build learning pathways as intuitively as you think about them."
            />
            <FeatureBlock
              title="Intelligent Adaptation"
              description="AI that understands ELPA levels, scaffolds content, and bridges native languages."
            />
            <FeatureBlock
              title="Real-Time Insight"
              description="See every student's journey. Know who needs help before they ask."
            />
            <FeatureBlock
              title="L1 Bridge Support"
              description="14+ languages. Cultural context. First languages honored as assets, not barriers."
            />
            <FeatureBlock
              title="Curriculum Aligned"
              description="Every pathway maps to Alberta Programs of Study. Instructionally relevant by design."
            />
            <FeatureBlock
              title="Celebrate Growth"
              description="Meaningful feedback and celebration that motivates continued learning."
            />
          </div>
        </div>
      </section>

      {/* ELPA Levels - Refined visualization */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
              From beginning to proficient.
            </h2>
            <p className="text-lg text-muted-foreground">
              Content automatically adapts to each student&apos;s ELPA level.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { level: 1, name: "Beginning" },
              { level: 2, name: "Developing" },
              { level: 3, name: "Expanding" },
              { level: 4, name: "Bridging" },
              { level: 5, name: "Proficient" },
            ].map((elpa, index) => (
              <div key={elpa.level} className="text-center group">
                <div 
                  className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 transition-gentle group-hover:bg-primary/20 group-hover:scale-105"
                  style={{ opacity: 0.4 + (index * 0.15) }}
                >
                  <span className="text-2xl md:text-3xl font-medium text-primary">
                    {elpa.level}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{elpa.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Simple, direct */}
      <section className="py-32 px-6">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Ready to begin?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Create your first learning pathway in minutes.
          </p>
          <Button size="lg" className="rounded-full px-10 h-14 text-lg" asChild>
            <Link href="/teacher/builder">
              Open Workflow Builder
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t py-8 px-6">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-semibold text-primary-foreground">V</span>
            </div>
            <span className="font-medium">VerbaPath</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-Powered ESL Learning for Alberta K-12
          </p>
        </div>
      </footer>
    </div>
  )
}

interface FeatureBlockProps {
  title: string
  description: string
}

function FeatureBlock({ title, description }: FeatureBlockProps) {
  return (
    <div className="group p-6 rounded-2xl transition-all duration-300 hover:bg-secondary/40 hover:backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-2 transition-gentle group-hover:text-primary">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
