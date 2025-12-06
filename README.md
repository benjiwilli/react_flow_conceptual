# LinguaFlow

**AI-Powered ESL Learning Orchestrator for Alberta K-12**

LinguaFlow transforms a visual workflow builder into a specialized AI Agent Orchestration Platform designed for English as a Second Language (ESL) students in Alberta's K-12 education system. The platform enables educators to create personalized, adaptive learning pathways that connect multiple AI models to deliver scaffolded literacy and numeracy instruction tailored to each student's proficiency level, native language, and cultural context.

## Features

### For Teachers
- **Visual Workflow Builder** - Drag-and-drop interface to design learning pathways
- **40+ Node Types** - Learning, AI, Scaffolding, Interaction, Flow Control, and Output nodes
- **Real-time Classroom Dashboard** - Monitor student progress with intelligent alerts
- **Learning Analytics** - Track vocabulary acquisition, comprehension, and identify challenges
- **Curriculum Alignment** - Maps to Alberta Programs of Study and ESL Benchmarks

### For Students
- **Personalized Learning** - AI adapts content to each student's ELPA level (1-5)
- **L1 Bridge Support** - 14+ languages with translations and cultural context
- **Voice Input** - Speech recognition with pronunciation feedback
- **Visual Supports** - Images, diagrams, and graphic organizers
- **Celebration System** - Achievements, streaks, and encouraging feedback

## Tech Stack

- **Framework**: Next.js 15 App Router with React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components + Geist fonts
- **Workflow Engine**: React Flow / XYFlow for diagramming
- **Icons**: Lucide React
- **Animations**: canvas-confetti for celebrations

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build
```

## AI Configuration

Set the following environment variables before running AI-backed workflows:

- `AI_OPENAI_API_KEY` (required) — primary provider key for the Vercel AI SDK
- `AI_DEFAULT_MODEL` (optional) — default model id (e.g., `gpt-4o-mini` or `openai/gpt-4o`)
- `AI_DEFAULT_TEMPERATURE` (optional) — override temperature for all calls

If no key is present, AI nodes will not be able to execute real model calls.

## AI Setup + Demo Workflow

1) Set env: create `.env.local` with `AI_OPENAI_API_KEY=your_key` (optional: `AI_DEFAULT_MODEL`, `AI_DEFAULT_TEMPERATURE`).
2) Install deps: `pnpm install` (or `npm install --legacy-peer-deps`).
3) Run dev server: `pnpm dev` (port 3000).
4) Open `/teacher/builder`, drop a few nodes, and click **Run**. The execution panel will stream events from `/api/execute`; if no key is set, runs will fail gracefully.

## Project Structure

```txt
/app
  /page.tsx                    → Landing page
  /teacher/builder/page.tsx    → Workflow Builder
  /teacher/classroom/page.tsx  → Classroom Management
  /classroom/[classId]/page.tsx → Live Classroom Dashboard
  /student/page.tsx            → Student Portal
  /student/session/[sessionId] → Learning Session

/components
  /builder                     → Workflow Builder Components
    node-palette.tsx           → Categorized node library
    node-inspector.tsx         → Node configuration panel
    execution-panel.tsx        → Real-time execution logs
    workflow-canvas.tsx        → React Flow canvas
  /nodes                       → Node Components by Category
    /esl                       → ESL-specific nodes
    /assessment                → Assessment nodes
    /orchestration             → AI & flow control nodes
  /student                     → Student Interface Components
  /classroom                   → Classroom Dashboard Components

/lib
  /types                       → TypeScript type definitions
  /constants                   → ELPA levels, curriculum, languages
  /engine                      → Workflow execution engine

/contexts                      → React Context providers
/hooks                         → Custom React hooks
```

## Node Categories

| Category | Color | Nodes |
|----------|-------|-------|
| Learning | Blue | Student Profile, Curriculum Selector, Content Generator, Math Problem Generator, Vocabulary Builder |
| AI | Purple | AI Model, Prompt Template, Structured Output |
| Scaffolding | Green | Scaffolding, L1 Bridge, Visual Support |
| Interaction | Orange | Human Input, Voice Input, Comprehension Check, Multiple Choice |
| Flow Control | Gray | Proficiency Router, Loop, Merge, Conditional |
| Output | Teal | Progress Tracker, Feedback, Celebration |

## Design Principles

1. **Asset-Based Language Philosophy** - Students' first languages are assets, not deficits
2. **Krashen's i+1 Comprehensible Input** - Content adjusted to one level above proficiency
3. **Alberta Curriculum Alignment** - Maps to Programs of Study and ESL Benchmarks
4. **Teacher as Designer, AI as Differentiator** - Teachers design; AI personalizes at scale
5. **Transparent AI** - Students see AI as a learning partner

## ELPA Levels

| Level | Name | Description |
|-------|------|-------------|
| 1 | Beginning | New to English, relies on visuals and L1 |
| 2 | Developing | Understands simple sentences |
| 3 | Expanding | Engages with grade-level content with support |
| 4 | Bridging | Approaching grade-level proficiency |
| 5 | Proficient | Meets grade-level expectations |

## Supported Languages

Mandarin, Cantonese, Punjabi, Arabic, Spanish, Tagalog, Ukrainian, Vietnamese, Korean, Farsi, Hindi, Urdu, French, Somali

---

## ⚠️ Important: Security & Authentication

> **DEMO MODE**: This application is designed for demonstration and educational purposes. API routes do not currently implement authentication.

### Known Limitations

1. **No API Authentication** - All API routes (`/api/*`) are publicly accessible. In a production deployment:
   - Implement Supabase Auth with teacher/student roles
   - Add middleware to verify JWT tokens on all API routes
   - Ensure RLS policies are enforced with actual user context

2. **Student Data Privacy** - Before deploying in a real school environment:
   - Implement FERPA/PIPEDA compliant authentication
   - Ensure student data is properly scoped to authorized teachers
   - Add audit logging for data access

3. **Rate Limiting** - API endpoints lack rate limiting. For production:
   - Add rate limiting to prevent AI API cost abuse
   - Implement per-classroom execution limits

### Recommended Production Steps

```bash
# 1. Set up Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # Server-side only

# 2. Implement auth middleware (see lib/auth/middleware.ts)
# 3. Test RLS policies with real user contexts
# 4. Set up rate limiting via Upstash Redis or similar
```

---

## License

MIT

---

*Built for Alberta's diverse learners, honoring their linguistic and cultural assets.*
