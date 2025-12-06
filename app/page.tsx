/**
 * LinguaFlow Landing Page
 * AI-Powered ESL Learning Orchestrator for Alberta K-12
 */

import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  Languages,
  Brain,
  Target,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">LinguaFlow</span>
            <Badge variant="secondary" className="ml-2">Beta</Badge>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/teacher" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Teacher Portal
            </Link>
            <Link href="/student" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Student Portal
            </Link>
            <Button asChild>
              <Link href="/teacher/builder">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Learning Pathways
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Personalized ESL Learning
            <span className="text-primary block">at Scale</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create AI-powered learning pathways that automatically adapt to each student&apos;s 
            proficiency level, native language, and cultural context. Designed for Alberta K-12 classrooms.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/teacher/builder">
                Build a Pathway
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/classroom/demo">
                View Demo Classroom
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Designed for ESL Success
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Brain}
            title="AI-Powered Differentiation"
            description="Multiple AI models work together to generate content at each student's i+1 comprehensible input level."
          />
          <FeatureCard
            icon={Languages}
            title="L1 Bridge Support"
            description="First language support for 14+ languages common in Alberta, providing cultural context and key term translations."
          />
          <FeatureCard
            icon={Target}
            title="Curriculum Aligned"
            description="Every pathway maps to Alberta Programs of Study outcomes and ESL Benchmarks for instructional relevance."
          />
          <FeatureCard
            icon={BookOpen}
            title="Visual Workflow Builder"
            description="Drag-and-drop interface lets teachers design learning pathways without coding knowledge."
          />
          <FeatureCard
            icon={Users}
            title="Real-Time Classroom View"
            description="Monitor every student's progress in real-time with intelligent alerts for students needing help."
          />
          <FeatureCard
            icon={BarChart3}
            title="Learning Analytics"
            description="Track vocabulary acquisition, comprehension growth, and identify common challenges across your class."
          />
        </div>
      </section>

      {/* ELPA Levels Section */}
      <section className="container px-4 py-16 bg-muted/30 rounded-3xl my-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Built for ELPA Levels 1-5
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Automatically scaffolds content based on student proficiency
          </p>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { level: 1, name: "Beginning", color: "bg-red-500" },
              { level: 2, name: "Developing", color: "bg-orange-500" },
              { level: 3, name: "Expanding", color: "bg-yellow-500" },
              { level: 4, name: "Bridging", color: "bg-green-500" },
              { level: 5, name: "Proficient", color: "bg-blue-500" },
            ].map((elpa) => (
              <div key={elpa.level} className="text-center">
                <div className={`h-16 w-16 rounded-full ${elpa.color} mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl`}>
                  {elpa.level}
                </div>
                <p className="font-medium">{elpa.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Get Started</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <QuickLinkCard
            href="/teacher/builder"
            title="Workflow Builder"
            description="Design personalized learning pathways"
            icon={BookOpen}
          />
          <QuickLinkCard
            href="/teacher/classroom"
            title="Classroom Dashboard"
            description="Monitor student progress in real-time"
            icon={Users}
          />
          <QuickLinkCard
            href="/student"
            title="Student Portal"
            description="Access learning activities"
            icon={Star}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">LinguaFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered ESL Learning for Alberta K-12
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: typeof Brain
  title: string
  description: string
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

interface QuickLinkCardProps {
  href: string
  title: string
  description: string
  icon: typeof Brain
}

function QuickLinkCard({ href, title, description, icon: Icon }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
        </CardContent>
      </Card>
    </Link>
  )
}
