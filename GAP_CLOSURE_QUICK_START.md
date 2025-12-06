# 🚀 Gap Closure Quick Start Guide

**Jumpstart production deployment in hours, not days**

---

## ⚡ Immediate Actions (First 2 Hours)

### 1. Set Up Authentication (30 minutes)

**Step 1:** Install Supabase Auth
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

**Step 2:** Add to environment
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

**Step 3:** Copy-paste files (see full plan for complete code)
- `contexts/auth-context.tsx` → [View in full plan](#contextsauth-contexttsx)
- `middleware.ts` → [View in full plan](#middlewarets)
- Add auth to 1 API route as template:

```typescript
// app/api/workflows/route.ts
import { withAuth } from "@/lib/auth/api-middleware"

export const GET = withAuth(async (req) => {
  const supabase = createClient()
  const { data } = await supabase
    .from("workflows")
    .select("*")
    .eq("teacher_id", req.user.id)
  return NextResponse.json(data)
})
```

**Step 4:** Test in browser
- Go to `/login` → Create account → Should redirect to `/teacher/builder`
- Verify other routes redirect to login

### 2. Enable Rate Limiting (20 minutes)

**Step 1:** Install Upstash
```bash
npm install @upstash/redis @upstash/ratelimit
```

**Step 2:** Configure environment
```bash
# .env.local
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

**Step 3:** Add to execute route
```typescript
// app/api/execute/route.ts
import { checkExecutionLimit } from "@/lib/middleware/rate-limiter"

export const POST = withAuth(async (req) => {
  const rateCheck = await checkExecutionLimit(req.user.id, classroom_id)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }
  // ... rest of execution logic
})
```

**Step 4:** Monitor at `/teacher/dashboard/usage`

---

## 📋 Gap Implementation Checklist

### 🔴 Critical (Deploy Blockers)

- [ ] **Authentication**
  - [ ] Auth context wrapper in root layout
  - [ ] Login/Signup pages created
  - [ ] Middleware protecting routes
  - [ ] All API routes using `withAuth` wrapper
  - [ ] RLS policies enabled in Supabase
  - [ ] Test: Unauthorized requests return 401

- [ ] **Rate Limiting**
  - [ ] Upstash Redis client configured
  - [ ] Rate limiter middleware created
  - [ ] Applied to `/api/execute`
  - [ ] Usage dashboard component added
  - [ ] Test: Exceeding limits returns 429

- [ ] **WCAG Compliance**
  - [ ] Color contrast fixes applied (use darker node colors)
  - [ ] Keyboard navigation working (Tab, Enter, Arrow keys)
  - [ ] ARIA labels on all interactive elements
  - [ ] Screen reader test passed
  - [ ] Automated audit passing (`npm run audit:accessibility`)

### 🟡 High Priority (Production Ready)

- [ ] **Testing Infrastructure**
  - [ ] Jest configured and passing
  - [ ] Playwright E2E tests created for critical flows
  - [ ] CI/CD pipeline running tests
  - [ ] Coverage report generated (75%+ target)
  - [ ] Pre-commit hooks running tests

- [ ] **Preview Panel**
  - [ ] Preview context created
  - [ ] Preview API endpoint (`/api/execute/preview`)
  - [ ] Modal/side panel UI implemented
  - [ ] Mock student profile configurable
  - [ ] Test: Preview reflects workflow changes

### 🟢 Enhancements (Nice to Have)

- [ ] **Multi-AI Providers**
  - [ ] Anthropic API key tested
  - [ ] Google API key tested
  - [ ] Provider selector in AIModelNode
  - [ ] Provider status dashboard working

- [ ] **Curriculum Data**
  - [ ] ELA outcomes imported (K-12)
  - [ ] Math outcomes imported (K-12)
  - [ ] Science outcomes imported (K-12)
  - [ ] ESL benchmarks cross-referenced
  - [ ] Auto-scaffolding recommendations tested

---

## 🎯 Daily Implementation Schedule

### Week 1: Critical Paths

**Monday:**
- Morning (2 hrs): Set up Auth (install, config, basic login)
- Afternoon (2 hrs): Protect API routes (convert 5 critical endpoints)

**Tuesday:**
- Morning (2 hrs): Complete Auth (RLS, student registration, testing)
- Afternoon (2 hrs): Set up Rate Limiting (install, config, basic limits)

**Wednesday:**
- Morning (2 hrs): Rate limiting dashboard and alerts
- Afternoon (2 hrs): WCAG color contrast fixes

**Thursday:**
- Morning (2 hrs): WCAG keyboard navigation
- Afternoon (2 hrs): WCAG ARIA labels and screen reader

**Friday:**
- Morning (2 hrs): Automated accessibility audit setup
- Afternoon (2 hrs): Fix audit findings, document remaining issues

### Week 2: Testing & Polish

**Monday-Wednesday:**
- Set up Jest and Playwright
- Write tests for critical paths (auth, workflow execution, student flow)
- Integrate into CI/CD

**Thursday-Friday:**
- Preview panel implementation
- Multi-AI provider testing
- Bug fixes and polish

### Week 3: Content & Launch Prep

**Monday-Wednesday:**
- Import curriculum data
- Create curriculum search UI
- Test auto-scaffolding recommendations

**Thursday-Friday:**
- Load testing
- Production deployment
- Monitoring setup

---

## 🐛 Common Issues & Fixes

### Authentication Issues

**Problem:** "JWT token not verified"
```typescript
// In middleware.ts, ensure you're using the correct client:
const supabase = createMiddlewareClient({ req, res })
const { data: { session } } = await supabase.auth.getSession()
```

**Problem:** "RLS policies not working"
```sql
-- Ensure policies use auth.uid():
CREATE POLICY "Teachers can view own data" ON workflows
  FOR SELECT USING (auth.uid() = teacher_id);
```

### Rate Limiting Issues

**Problem:** "Rate limit always returning false"
```typescript
// Check Upstash connection:
const redis = Redis.fromEnv()
const test = await redis.ping()
console.log(test) // Should return "PONG"
```

**Problem:** "Limits too strict for demo"
```typescript
// Temporarily increase limits for testing:
export const teacherDailyLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5000, "86400 s"), // 5000 instead of 500
})
```

### WCAG Issues

**Problem:** "Color contrast still failing"
```css
/* Use this tool to check: https://webaim.org/resources/contrastchecker/ */
/* Target WCAG AA: 4.5:1 for normal text, 3:1 for large text */

/* Example fix: */
.bg-node-learning {
  background-color: #1e3a8a; /* Darker blue: 7.2:1 contrast */
}
```

**Problem:** "Keyboard can't reach canvas elements"
```typescript
// Add to WorkflowCanvas component:
<div 
  ref={reactFlowWrapper}
  tabIndex={0} // Make canvas focusable
  onKeyDown={handleKeyDown}
/>
```

---

## 📞 Support Resources

### Full Implementation Details
- See **`GAP_CLOSURE_IMPLEMENTATION_PLAN.md`** for complete code
- See **`PRE_SUBMISSION_AUDIT_INDEPENDENT.md`** for gap analysis

### Key Files Created
```
Authentication:
├── contexts/auth-context.tsx
├── app/login/page.tsx
├── middleware.ts
└── lib/auth/api-middleware.ts

Rate Limiting:
├── lib/middleware/rate-limiter.ts
├── components/teacher/usage-dashboard.tsx
└── lib/cost-alerts.ts

Testing:
├── jest.config.js
├── e2e/teacher-workflow.spec.ts
└── e2e/student-journey.spec.ts

WCAG:
├── scripts/accessibility-audit.js
├── styles/high-contrast.css
└── components/accessibility/skip-links.tsx
```

### Testing Commands
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run accessibility audit
npm run audit:accessibility

# Check coverage
npm run test:coverage
```

### Deployment Commands
```bash
# Full build with checks
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

---

## ✅ Pre-Launch Verification (30 minutes)

Run this checklist before going live:

```bash
# 1. Security scan (2 min)
npm audit --production
# Expected: 0 vulnerabilities

# 2. Build verification (3 min)
npm run build
# Expected: No errors, all pages generated

# 3. Unit tests (5 min)
npm test -- --bail
# Expected: All tests pass

# 4. E2E smoke tests (10 min)
npm run test:e2e -- --grep "@smoke"
# Expected: Critical flows pass

# 5. Accessibility scan (5 min)
npm run audit:accessibility
# Expected: 0 violations

# 6. Manual checks (5 min)
# - Create teacher account
# - Create student account  
# - Build and run simple workflow
# - Check rate limit dashboard
# - Verify auth required on API
```

---

## 🎉 You're Production Ready When...

✅ All items in Critical Path checklist complete  
✅ Test coverage ≥ 75%  
✅ Zero accessibility violations  
✅ Auth protecting all user data  
✅ Rate limiting preventing abuse  
✅ Preview panel working smoothly  
✅ Curriculum data searchable  
✅ Monitoring and logging active  

**Estimated time to production: 3-4 weeks following this guide**

---

## 🆘 Emergency Rollback Plan

If issues arise in production:

1. **Disable AI features immediately:**
   ```bash
   vercel env add AI_DISABLE_GENERATION=true
   # App falls back to mock responses
   ```

2. **Enable maintenance mode:**
   ```typescript
   // In middleware.ts
   if (process.env.MAINTENANCE_MODE === "true") {
     return NextResponse.redirect(new URL("/maintenance", req.url))
   }
   ```

3. **Database rollback:**
   ```bash
   # Use Supabase point-in-time recovery
   supabase db rollback --target "2025-12-06T09:00:00Z"
   ```

---

**Quick Start Guide v1.0** | For complete details, see `GAP_CLOSURE_IMPLEMENTATION_PLAN.md`
