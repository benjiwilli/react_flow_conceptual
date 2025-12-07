# VerbaPath

**Beautifully simple. Powerfully personalized.**

VerbaPath is an AI-powered ESL learning orchestrator designed for Alberta K-12 educators. Create adaptive learning pathways that honor each student's language, culture, and pace.

---

## Design Philosophy

VerbaPath is built on principles of purposeful simplicity:

- **Every element earns its place** — No decoration without function
- **Content breathes** — Generous white space lets ideas resonate
- **Honest materials** — Clean surfaces, subtle depth, refined typography
- **Quiet confidence** — The interface recedes; learning advances

---

## Quick Start

### Demo Mode (No Setup Required)

VerbaPath works out of the box in **Demo Mode**:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring.

### Production Setup

```bash
# Copy environment template
cp .env.example .env.local

# Configure your settings
nano .env.local
```

Required for AI features:
- `AI_OPENAI_API_KEY` — OpenAI API key for AI-powered content generation

---

## Features

### For Teachers
- **Visual Workflow Builder** — Drag-and-drop interface to design learning pathways
- **40+ Node Types** — Learning, AI, Scaffolding, Interaction, Flow Control, and Output nodes
- **Pre-built Templates** — Math Word Problem Decoder, Reading Comprehension, and more
- **Real-time Classroom Dashboard** — Monitor student progress with intelligent alerts
- **Learning Analytics** — Track vocabulary acquisition and identify challenges
- **Curriculum Alignment** — Maps to Alberta Programs of Study and ESL Benchmarks

### For Students
- **Personalized Learning** — AI adapts content to each student's ELPA level (1-5)
- **L1 Bridge Support** — 14+ languages with translations and cultural context
- **Voice Input** — Speech recognition with pronunciation feedback
- **Visual Supports** — Images, diagrams, and graphic organizers
- **Celebration System** — Achievements, streaks, and encouraging feedback

---

## Tech Stack

- **Framework**: Next.js 15 App Router with React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components + Geist fonts
- **Workflow Engine**: React Flow / XYFlow for diagramming
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Vercel AI SDK with OpenAI
- **Testing**: Jest + Playwright + @axe-core for accessibility

---

## Project Structure

```
/app
  /page.tsx                    → Landing page
  /teacher/builder/page.tsx    → Workflow Builder
  /teacher/classroom/page.tsx  → Classroom Management
  /classroom/[classId]/page.tsx → Live Classroom Dashboard
  /student/page.tsx            → Student Portal

/components
  /builder                     → Workflow Builder Components
  /nodes                       → Node Components by Category
  /student                     → Student Interface Components
  /classroom                   → Classroom Dashboard Components
  /ui                          → UI components (Jony Ive-inspired)

/lib
  /types                       → TypeScript type definitions
  /constants                   → ELPA levels, curriculum, languages
  /engine                      → Workflow execution engine
```

---

## Node Categories

| Category | Purpose |
|----------|---------|
| **Learning** | Student Profile, Curriculum Selector, Content Generator, Vocabulary Builder |
| **AI** | AI Model, Prompt Template, Structured Output |
| **Scaffolding** | Scaffolding, L1 Bridge, Visual Support |
| **Interaction** | Human Input, Voice Input, Comprehension Check, Multiple Choice |
| **Flow Control** | Proficiency Router, Loop, Merge, Conditional |
| **Output** | Progress Tracker, Feedback, Celebration |

---

## ELPA Levels

| Level | Name | Description |
|-------|------|-------------|
| 1 | Beginning | New to English, relies on visuals and L1 |
| 2 | Developing | Understands simple sentences |
| 3 | Expanding | Engages with grade-level content with support |
| 4 | Bridging | Approaching grade-level proficiency |
| 5 | Proficient | Meets grade-level expectations |

---

## Supported Languages

Mandarin, Cantonese, Punjabi, Arabic, Spanish, Tagalog, Ukrainian, Vietnamese, Korean, Farsi, Hindi, Urdu, French, Somali

---

## Design Principles

1. **Asset-Based Language Philosophy** — Students' first languages are assets, not deficits
2. **Krashen's i+1 Comprehensible Input** — Content adjusted to one level above proficiency
3. **Alberta Curriculum Alignment** — Maps to Programs of Study and ESL Benchmarks
4. **Teacher as Designer, AI as Differentiator** — Teachers design; AI personalizes at scale
5. **Transparent AI** — Students see AI as a learning partner

---

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run accessibility audit
npm run test:a11y
```

---

## License

MIT

---

*Built for Alberta's diverse learners, honoring their linguistic and cultural assets.*
