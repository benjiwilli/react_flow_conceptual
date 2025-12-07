# LinguaFlow

**AI-Powered ESL Learning Orchestrator for Alberta K-12**

LinguaFlow transforms a visual workflow builder into a specialized AI Agent Orchestration Platform designed for English as a Second Language (ESL) students in Alberta's K-12 education system. The platform enables educators to create personalized, adaptive learning pathways that connect multiple AI models to deliver scaffolded literacy and numeracy instruction tailored to each student's proficiency level, native language, and cultural context.

## 🚀 Quick Start

### Demo Mode (No Setup Required)

LinguaFlow works out of the box in **Demo Mode** - perfect for exploring features without any configuration:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

> 🎯 **For Educators**: See our [Educator Quick Start Guide](./docs/EDUCATOR_QUICK_START.md) for a hands-on introduction.

### Production Setup

Copy the example environment file and configure your settings:

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

Required for AI features:
- `AI_OPENAI_API_KEY` - OpenAI API key for AI-powered content generation

Optional for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## ✨ Features

### For Teachers
- **Visual Workflow Builder** - Drag-and-drop interface to design learning pathways
- **40+ Node Types** - Learning, AI, Scaffolding, Interaction, Flow Control, and Output nodes
- **Pre-built Templates** - Math Word Problem Decoder, Reading Comprehension, and more
- **Real-time Classroom Dashboard** - Monitor student progress with intelligent alerts
- **Learning Analytics** - Track vocabulary acquisition, comprehension, and identify challenges
- **Curriculum Alignment** - Maps to Alberta Programs of Study and ESL Benchmarks

### For Students
- **Personalized Learning** - AI adapts content to each student's ELPA level (1-5)
- **L1 Bridge Support** - 14+ languages with translations and cultural context
- **Voice Input** - Speech recognition with pronunciation feedback
- **Visual Supports** - Images, diagrams, and graphic organizers
- **Celebration System** - Achievements, streaks, and encouraging feedback

## 🛠 Tech Stack

- **Framework**: Next.js 15 App Router with React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components + Geist fonts
- **Workflow Engine**: React Flow / XYFlow for diagramming
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Vercel AI SDK with OpenAI
- **Testing**: Jest + Playwright + @axe-core for accessibility
- **Icons**: Lucide React
- **Animations**: canvas-confetti for celebrations

## 📁 Project Structure

```txt
/app
  /page.tsx                    → Landing page
  /login/page.tsx              → Teacher/Admin login
  /signup/page.tsx             → Registration
  /teacher/builder/page.tsx    → Workflow Builder
  /teacher/classroom/page.tsx  → Classroom Management
  /classroom/[classId]/page.tsx → Live Classroom Dashboard
  /student/page.tsx            → Student Portal
  /student/session/[sessionId] → Learning Session

/components
  /builder                     → Workflow Builder Components
  /nodes                       → Node Components by Category
  /student                     → Student Interface Components
  /classroom                   → Classroom Dashboard Components
  /ui                          → shadcn/ui components

/lib
  /types                       → TypeScript type definitions
  /constants                   → ELPA levels, curriculum, languages
  /engine                      → Workflow execution engine
  /supabase                    → Database clients

/contexts                      → React Context providers
/hooks                         → Custom React hooks
/e2e                           → End-to-end tests (Playwright)
/__tests__                     → Unit tests (Jest)
/docs                          → Documentation
```

## 🎨 Node Categories

| Category | Color | Example Nodes |
|----------|-------|---------------|
| Learning | Blue | Student Profile, Curriculum Selector, Content Generator, Vocabulary Builder |
| AI | Purple | AI Model, Prompt Template, Structured Output |
| Scaffolding | Green | Scaffolding, L1 Bridge, Visual Support |
| Interaction | Orange | Human Input, Voice Input, Comprehension Check, Multiple Choice |
| Flow Control | Gray | Proficiency Router, Loop, Merge, Conditional |
| Output | Teal | Progress Tracker, Feedback, Celebration |

## 🧪 Testing

```bash
# Run unit tests (69 tests)
npm test

# Run E2E tests (26 tests on Chromium)
npm run test:e2e

# Run accessibility audit
npm run test:a11y

# Run all tests
npm run test:all
```

### Test Coverage Summary

| Test Type | Tests | Status |
|-----------|-------|--------|
| Unit Tests | 69 | ✅ Passing |
| E2E Tests (Chromium) | 26 | ✅ Passing |
| Lint | 0 warnings | ✅ Clean |
| Build | Production | ✅ Passing |

## 🏭 Production Features

### Rate Limiting
API endpoints are protected with Upstash Redis rate limiting:
- **Per IP**: 30 requests/minute
- **Per Teacher (daily)**: 500 executions
- **Per Classroom (hourly)**: 100 executions
- **Burst Protection**: 10 requests/minute

### Health Check Endpoint
Monitor system status at `/api/health`:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T19:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "checks": {
    "database": "up",
    "redis": "up",
    "ai": "up"
  },
  "environment": "production"
}
```

### Error Handling
- **Error Boundaries**: React error boundaries throughout the application
- **Structured Logging**: Production-ready logging with audit trails
- **Graceful Degradation**: Demo mode when services are unavailable

### CI/CD Pipeline
GitHub Actions workflow for:
- Lint and type checking
- Unit tests with coverage
- E2E tests on Chromium
- Accessibility tests
- Security audit
- Production build verification

## 📚 Documentation

- [Educator Quick Start Guide](./docs/EDUCATOR_QUICK_START.md) - Get started in 5 minutes
- [Gap Closure Quick Start](./GAP_CLOSURE_QUICK_START.md) - Production deployment guide
- [Implementation Plan](./GAP_CLOSURE_IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [Project Vision](./PROJECT_VISION.md) - Design philosophy and goals

## 🎓 ELPA Levels

| Level | Name | Description |
|-------|------|-------------|
| 1 | Beginning | New to English, relies on visuals and L1 |
| 2 | Developing | Understands simple sentences |
| 3 | Expanding | Engages with grade-level content with support |
| 4 | Bridging | Approaching grade-level proficiency |
| 5 | Proficient | Meets grade-level expectations |

## 🌍 Supported Languages

Mandarin, Cantonese, Punjabi, Arabic, Spanish, Tagalog, Ukrainian, Vietnamese, Korean, Farsi, Hindi, Urdu, French, Somali

## 🎯 Design Principles

1. **Asset-Based Language Philosophy** - Students' first languages are assets, not deficits
2. **Krashen's i+1 Comprehensible Input** - Content adjusted to one level above proficiency
3. **Alberta Curriculum Alignment** - Maps to Programs of Study and ESL Benchmarks
4. **Teacher as Designer, AI as Differentiator** - Teachers design; AI personalizes at scale
5. **Transparent AI** - Students see AI as a learning partner

---

## ⚠️ Security & Authentication

> **DEMO MODE**: When Supabase is not configured, the application runs in Demo Mode with all features accessible. This is ideal for evaluation and development.

### Production Deployment

For production use in real school environments:

1. **Configure Supabase Auth** - Set up authentication with teacher/student roles
2. **Enable RLS Policies** - Protect student data with row-level security
3. **Add Rate Limiting** - Prevent API abuse (use Upstash Redis)
4. **FERPA/PIPEDA Compliance** - Ensure student data privacy requirements are met

See [Gap Closure Quick Start](./GAP_CLOSURE_QUICK_START.md) for detailed production steps.

---

## 📄 License

MIT

---

*Built for Alberta's diverse learners, honoring their linguistic and cultural assets.*
