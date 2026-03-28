# Curriculum: Next.js 15 App Router Mastery

## Course Overview
**Duration:** 2 weeks daily study
**Examination:** L1-01-nextjs-app-router.md
**Prerequisites:** React fundamentals, TypeScript basics

---

## Module 1: First Principles (Days 1-3)

### Day 1: The Server/Client Divide
**Core Concept:** Why separate server and client rendering?

**Study Materials:**
- Read: React Server Components RFC (github.com/reactjs/rfcs)
- Read: nextjs.org/docs/app (App Router fundamentals)
- Watch: Next.js App Router course (Vercel official)

**Practice:**
- Create mental model diagram of request lifecycle
- Write 300-word explanation of why SSR benefits performance
- Draw component tree showing server/client boundaries

**Validation:**
- Can explain RSC vs SSR vs CSR without looking at notes
- Can identify which APIs are server-only vs client-only

### Day 2: Rendering Patterns
**Core Concepts:** Static, Dynamic, Streaming

**Study Materials:**
- Read: nextjs.org/docs/app/building-your-application/rendering
- Read: nextjs.org/docs/app/building-your-application/routing

**Practice:**
- Create route with all three rendering modes
- Implement loading.tsx boundaries
- Experiment with Suspense boundaries

**Validation:**
- Can predict rendering mode for any given route
- Can explain streaming to a junior developer

### Day 3: Data Fetching Architecture
**Core Concepts:** Server Components fetching, caching, revalidation

**Study Materials:**
- Read: nextjs.org/docs/app/building-your-application/data-fetching
- Read: nextjs.org/docs/app/building-your-application/caching

**Practice:**
- Implement fetch with { cache: 'no-store' }
- Implement fetch with revalidate
- Implement on-demand revalidation

**Validation:**
- Can explain fetch cache options table
- Can debug stale data issues

---

## Module 2: Implementation Patterns (Days 4-7)

### Day 4: Server Components Deep Dive
**Topics:** Async components, error handling, not-found

**Practice:**
- Create async Server Component with loading state
- Implement error.tsx boundary
- Implement not-found.tsx
- Handle params and searchParams

**Code Challenge:**
Build a Server Component that:
- Accepts dynamic route params
- Fetches data asynchronously
- Shows loading UI
- Handles errors gracefully
- Returns 404 for missing data

### Day 5: Client Components & Boundaries
**Topics:** 'use client', hooks, browser APIs

**Practice:**
- Create Client Component with useState/useEffect
- Compose Client inside Server Component
- Pass serialized props correctly
- Use browser-only APIs safely

**Code Challenge:**
Build an interactive product carousel:
- Server Component fetches products
- Client Component handles interactions
- Proper boundary between them

### Day 6: Route Handlers & API
**Topics:** app/api routes, HTTP methods, responses

**Practice:**
- Create GET/POST/PUT/DELETE handlers
- Handle request validation
- Return proper status codes
- Handle errors

**Code Challenge:**
Build a REST API for basket operations:
- GET /api/basket - return current basket
- POST /api/basket - add item
- DELETE /api/basket/[id] - remove item

### Day 7: Middleware & Auth
**Topics:** Middleware.ts, Clerk integration, route protection

**Practice:**
- Create middleware with matcher config
- Implement auth checks
- Set custom headers
- Handle redirects

**Code Challenge:**
Implement middleware that:
- Protects /checkout and /account routes
- Sets auth headers for downstream use
- Redirects unauthenticated users

---

## Module 3: Advanced Patterns (Days 8-11)

### Day 8: Parallel & Sequential Data Fetching
**Topics:** Promise.all, waterfalls, request deduplication

**Practice:**
- Implement parallel fetching with Promise.all
- Identify and fix waterfall issues
- Use React cache() for deduplication

**Code Challenge:**
Optimize this page to fetch in parallel:
```tsx
// BEFORE: Sequential (bad)
const products = await getProducts();
const categories = await getCategories();
const featured = await getFeatured();

// AFTER: Your optimized version
```

### Day 9: Server Actions
**Topics:** 'use server', mutations, revalidation

**Practice:**
- Create Server Action for form submission
- Implement revalidatePath
- Handle errors in actions
- Use startTransition

**Code Challenge:**
Build add-to-basket Server Action:
- Updates database
- Revalidates basket page
- Handles errors
- Shows optimistic UI

### Day 10: Intercepting & Parallel Routes
**Topics:** @modal, (.) routes, slots

**Practice:**
- Create modal with intercepted route
- Implement parallel route for sidebar
- Understand slot-based routing

### Day 11: Performance Optimization
**Topics:** Image optimization, lazy loading, bundle analysis

**Practice:**
- Configure next/image properly
- Implement dynamic imports
- Analyze bundle with @next/bundle-analyzer
- Optimize Core Web Vitals

**Code Challenge:**
Achieve 90+ Lighthouse score:
- Optimize LCP image
- Implement proper loading
- Reduce JS bundle
- Pass all accessibility checks

---

## Module 4: Integration & Mastery (Days 12-14)

### Day 12: Integration with CMS
**Topics:** Sanity integration, type safety, previews

**Practice:**
- Fetch from Sanity in Server Component
- Implement type-safe queries
- Set up draft mode preview

**Code Challenge:**
Build blog post page:
- Fetches from Sanity
- Renders Portable Text
- Implements preview mode
- Handles draft/published

### Day 13: Error Handling & Monitoring
**Topics:** Error boundaries, logging, Sentry

**Practice:**
- Implement error.tsx boundaries
- Set up Sentry integration
- Create error reporting utilities
- Handle different error types

### Day 14: Production Readiness
**Topics:** Build optimization, deployment, monitoring

**Practice:**
- Optimize build configuration
- Deploy to production
- Set up monitoring
- Configure proper headers

**Final Challenge:**
Build complete e-commerce product page:
- Server Component fetches product
- Client Component handles add-to-cart
- Image optimization
- SEO metadata
- Error handling
- Loading states

---

## Daily Practice Schedule

**Morning (60 min):**
- 20 min: Read/watch theory
- 30 min: Code implementation
- 10 min: Self-explanation (Feynman technique)

**Evening (30 min):**
- 15 min: Review day's code
- 15 min: Spaced repetition of previous topics

---

## Assessment Checkpoints

| Checkpoint | Date | Pass Criteria |
|------------|------|---------------|
| Server/Client mental model | Day 3 | Can whiteboard without notes |
| Data fetching patterns | Day 7 | Can implement any pattern on demand |
| Performance optimization | Day 11 | Achieve 90+ Lighthouse |
| Full integration | Day 14 | Build production-ready page |

**Final Examination:** Complete L1-01 examination with 100% closed-book success.

---

## Resources

**Official Documentation:**
- nextjs.org/docs/app
- react.dev/learn
- nextjs.org/docs/app/building-your-application

**Video Courses:**
- Next.js App Router (Vercel)
- React Server Components Explained

**Practice Projects:**
- Personal blog with Sanity
- E-commerce product catalog
- Dashboard with real-time data

---

*Curriculum Version: 1.0*
*Prerequisites: React, TypeScript*
*Outcome: Production-ready Next.js 15 expertise*
