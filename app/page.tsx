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
 * - The interface recedes; learning advances
 */

import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Globe2,
  Brain,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { HighContrastToggle } from "@/components/accessibility/high-contrast-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal, purposeful, glass morphism */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="container flex h-16 items-center justify-between px-6 md:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-subtle transition-all duration-300 group-hover:scale-105 group-hover:shadow-elevated">
              <span className="text-lg font-semibold text-primary-foreground">V</span>
            </div>
            <span className="text-xl font-medium tracking-tight">VerbaPath</span>
          </Link>
          <nav id="navigation" className="flex items-center gap-2 md:gap-6">
            <Link 
              href="/teacher" 
              className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-gentle px-3 py-2 rounded-lg hover:bg-secondary/60"
            >
              Teachers
            </Link>
            <Link 
              href="/student" 
              className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-gentle px-3 py-2 rounded-lg hover:bg-secondary/60"
            >
              Students
            </Link>
            <Button asChild className="rounded-full px-5 md:px-6 shadow-subtle hover:shadow-elevated transition-all">
              <Link href="/teacher/builder">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero - Let the message breathe with generous space */}
      <section className="pt-36 md:pt-44 pb-24 md:pb-32 px-6">
        <div className="container max-w-4xl mx-auto text-center animate-fade-up">
          {/* Badge - subtle, informative */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 text-sm text-muted-foreground mb-8 md:mb-10 shadow-subtle border border-border/50">
            <Sparkles className="h-4 w-4 text-primary/70" />
            <span>AI-Powered Learning Pathways</span>
          </div>
          
          {/* Hero headline - typography as design */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6 md:mb-8 leading-[1.08]">
            Every student&apos;s path
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">is unique.</span>
          </h1>
          
          {/* Subheadline - supporting, not competing */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed">
            Create adaptive learning experiences that honor each student&apos;s 
            language, culture, and pace. Designed for Alberta K-12 ESL educators.
          </p>
          
          {/* CTAs - clear hierarchy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 h-12 md:h-14 text-base shadow-elevated hover:shadow-floating transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto" 
              asChild
            >
              <Link href="/teacher/builder">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 h-12 md:h-14 text-base border-border/60 hover:bg-secondary/60 hover:border-border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto" 
              asChild
            >
              <Link href="/classroom/demo">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Elevated statement with visual breathing room */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-secondary/20 to-secondary/40">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mb-6 md:mb-8">
            Simplicity is the ultimate sophistication.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            VerbaPath removes complexity so teachers can focus on what matters: 
            designing meaningful learning experiences. Our visual workflow builder 
            transforms pedagogical expertise into personalized AI-powered pathways.
          </p>
        </div>
      </section>

      {/* Value Props - Three pillars with icons */}
      <section className="py-24 md:py-32 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 stagger-children">
            <ValuePillar
              icon={<Globe2 className="h-6 w-6" />}
              title="14+ Languages"
              description="L1 bridge support honors students' native languages as assets. Cultural context built in."
            />
            <ValuePillar
              icon={<Brain className="h-6 w-6" />}
              title="Adaptive AI"
              description="Content automatically adjusts to each student's ELPA level using i+1 comprehensible input theory."
            />
            <ValuePillar
              icon={<BarChart3 className="h-6 w-6" />}
              title="Real-Time Insight"
              description="Know which students need support before they ask. Live classroom dashboards with intelligent alerts."
            />
          </div>
        </div>
      </section>

      {/* Features - Clean grid with refined cards */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mb-4">
              Purposefully designed.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Every feature exists to serve teachers and students.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 stagger-children">
            <FeatureCard
              title="Visual Design"
              description="Drag, drop, connect. Build learning pathways as intuitively as you think about them."
            />
            <FeatureCard
              title="Intelligent Adaptation"
              description="AI that understands ELPA levels, scaffolds content, and bridges native languages."
            />
            <FeatureCard
              title="Real-Time Insight"
              description="See every student's journey. Know who needs help before they ask."
            />
            <FeatureCard
              title="L1 Bridge Support"
              description="14+ languages. Cultural context. First languages honored as assets, not barriers."
            />
            <FeatureCard
              title="Curriculum Aligned"
              description="Every pathway maps to Alberta Programs of Study. Instructionally relevant by design."
            />
            <FeatureCard
              title="Celebrate Growth"
              description="Meaningful feedback and celebration that motivates continued learning."
            />
          </div>
        </div>
      </section>

      {/* ELPA Levels - Elegant progression visualization */}
      <section className="py-24 md:py-32 px-6">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mb-4">
              From beginning to proficient.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
              Content automatically adapts to each student&apos;s ELPA level.
            </p>
          </div>
          
          {/* ELPA Level progression */}
          <div className="flex items-end justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[
              { level: 1, name: "Beginning", height: "h-12 sm:h-14" },
              { level: 2, name: "Developing", height: "h-16 sm:h-20" },
              { level: 3, name: "Expanding", height: "h-20 sm:h-24" },
              { level: 4, name: "Bridging", height: "h-24 sm:h-28" },
              { level: 5, name: "Proficient", height: "h-28 sm:h-32" },
            ].map((elpa, index) => (
              <div key={elpa.level} className="text-center group flex flex-col items-center">
                <div 
                  className={`${elpa.height} w-12 sm:w-14 md:w-16 lg:w-20 rounded-xl md:rounded-2xl bg-gradient-to-t from-primary/20 to-primary/5 border border-primary/10 flex items-end justify-center pb-2 md:pb-3 transition-all duration-300 group-hover:from-primary/30 group-hover:to-primary/10 group-hover:scale-105 group-hover:shadow-elevated`}
                >
                  <span className="text-lg sm:text-xl md:text-2xl font-medium text-primary/80 group-hover:text-primary transition-colors">
                    {elpa.level}
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{elpa.name}</p>
              </div>
            ))}
          </div>
          
          {/* Connecting visual - progress line */}
          <div className="mt-8 md:mt-10 flex justify-center">
            <div className="h-1 w-64 md:w-80 rounded-full bg-gradient-to-r from-primary/5 via-primary/30 to-primary/60"></div>
          </div>
        </div>
      </section>

      {/* CTA - Confident, simple, inviting */}
      <section className="py-28 md:py-40 px-6 bg-gradient-to-b from-secondary/30 to-secondary/10">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Ready to begin?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-12">
            Create your first learning pathway in minutes.
          </p>
          <Button 
            size="lg" 
            className="rounded-full px-10 h-14 text-base md:text-lg shadow-elevated hover:shadow-floating transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
            asChild
          >
            <Link href="/teacher/builder">
              Open Workflow Builder
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer - Minimal, refined */}
      <footer className="border-t border-border/50 py-10 md:py-12 px-6 bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-subtle">
              <span className="text-sm font-semibold text-primary-foreground">V</span>
            </div>
            <span className="font-medium">VerbaPath</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <HighContrastToggle />
            <p className="text-sm text-muted-foreground text-center md:text-left">
              AI-Powered ESL Learning for Alberta K-12
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ============================================
 * Component Definitions
 * ============================================ */

interface ValuePillarProps {
  icon: React.ReactNode
  title: string
  description: string
}

function ValuePillar({ icon, title, description }: ValuePillarProps) {
  return (
    <div className="text-center p-6 md:p-8">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/5 text-primary mb-5 shadow-subtle">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-medium mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="group p-5 md:p-6 rounded-2xl bg-background border border-border/50 shadow-subtle transition-all duration-300 hover:shadow-elevated hover:border-border/80 hover:-translate-y-0.5">
      <h3 className="text-base md:text-lg font-medium mb-2 transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  )
}
