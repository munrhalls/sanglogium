# Research: Next.js 15 with React Server Components - Proper Setup Architecture
**Date:** 2026-04-11
**Purpose:** Research proper system setup for Next.js 15 with RSC, client state management, and environment variables
**Focus:** System-level architecture that prevents common pitfalls and brittleness

---

## Research Scope Contract
- **Topic:** Next.js 15 App Router with React Server Components proper architecture
- **First Principles:** Server-first data fetching, client-side state boundaries, environment variable security
- **Fundamentals:** Server Components vs Client Components, state management patterns, environment variable flow
- **Scope Boundary:** Focus on system architecture, not component-level implementation
- **Target Audience:** System architects and development teams
- **Decay Risk:** Medium - Next.js evolves rapidly but core principles stable

---

## Phase 1: Multi-Source Triangulation

### Official Documentation
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Next.js Docs | https://nextjs.org/docs/app/building-your-application/rendering/server-components | Official | Canonical | 2026-03 | "Server Components run only on server" | Verified |
| Next.js Docs | https://nextjs.org/docs/app/building-your-application/data-fetching | Official | Canonical | 2026-03 | "Data fetching in Server Components is async" | Verified |
| Next.js Docs | https://nextjs.org/docs/app/api-reference/functions | Official | Canonical | 2026-03 | "Route Handlers replace API Routes" | Verified |

### Source of Truth Code
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Next.js GitHub | https://github.com/vercel/next.js | Source | Ground Truth | 2026-03 | "Server Components have no client runtime" | Verified |
| React GitHub | https://github.com/facebook/react | Source | Ground Truth | 2026-03 | "use client marks Client Components" | Verified |

---

## Phase 2: First Principles Analysis

### Core Problem Being Solved
Separate server-only operations from client-side interactivity while maintaining data flow integrity.

### Underlying Constraints
1. **Server Components have no client runtime** - cannot use hooks, event handlers, or browser APIs
2. **Environment variables are server-only by default** - only NEXT_PUBLIC_* exposed to client
3. **State cannot be shared across server/client boundary** - must be serialized
4. **Network requests are async** - Server Components handle this naturally, Client Components need async patterns

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Server Components | Zero client JS, direct data access | No interactivity, no state | Data-heavy pages |
| Client Components | Full interactivity, state management | Client JS bundle, indirect data | Interactive UI |
| Hybrid (RSC + CC) | Best of both worlds | Complexity, data flow overhead | Most apps |

### Failure Modes
1. **Misapplication:** Using server-only code in Client Components
2. **Over-application:** Making everything Client Components
3. **Under-application:** Trying to use browser APIs in Server Components

---

## Phase 3: Code Fundamentals Verification

### Fundamental: Environment Variable Flow
**Claim:** Only NEXT_PUBLIC_* vars available on client

**Verification:**
- [x] Located in our codebase: `.env.local` has UPSTASH_REDIS_REST_URL (not NEXT_PUBLIC_*)
- [x] Test created: Client-side access returns undefined
- [x] Source inspected: Next.js source shows only NEXT_PUBLIC_* exposed

**Actual Behavior:**
Server: `process.env.UPSTASH_REDIS_REST_URL` = "https://..."
Client: `process.env.UPSTASH_REDIS_REST_URL` = undefined

**Edge Cases:**
1. Build-time env vars vs runtime env vars
2. Server Components vs Client Components access patterns

### Fundamental: State Updates in React
**Claim:** setState during render causes errors

**Verification:**
- [x] Located in our codebase: `usePreCheckout.ts` setState in render
- [x] Test created: Clicking checkout caused Router update error
- [x] Source inspected: React source shows render phase immutability

**Actual Behavior:**
React throws "Cannot update a component while rendering a different component"

**Edge Cases:**
1. useEffect cleanup functions
2. Event handlers vs render functions

---

## Phase 4: Best Practices (Verified)

### Practice: Server-First Data Fetching
**Consensus:** High - Official Next.js recommendation

**Supporting Evidence:**
- Next.js Docs: "Data fetching in Server Components is recommended"
- Vercel Blog: "Server Components reduce client bundle size"

**Counter-Evidence (Falsification Attempts):**
- None - this is core to RSC architecture

**Verdict:** Recommended

**When to Use:** Always for initial data load
**When to Skip:** Real-time updates, user interactions

### Practice: Client Component Boundary
**Consensus:** High - Clear separation required

**Supporting Evidence:**
- React Docs: "use client marks boundary"
- Next.js Docs: "Children of Client Components must be Client Components"

**Counter-Evidence (Falsification Attempts):**
- Server Components can't be imported in Client Components

**Verdict:** Recommended

**When to Use:** Any interactivity, state, browser APIs
**When to Skip:** Pure data display, formatting

### Practice: Environment Variable Naming
**Consensus:** High - Security requirement

**Supporting Evidence:**
- Next.js Docs: "NEXT_PUBLIC_ prefix for client access"
- Security Best Practices: "Never expose secrets to client"

**Counter-Evidence (Falsification Attempts):**
- None - this is a security boundary

**Verdict:** Recommended

**When to Use:** Any env var needed on client
**When to Skip:** Server-only operations

---

## Phase 5: Common Solutions Landscape

### Solution: API Routes for Client-Server Communication
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Pros:**
- Clean separation of concerns
- Type-safe with TypeScript
- Reusable across components

**Cons:**
- Additional network hop
- More boilerplate than direct imports

**Real-World Pain Points:**
- Forgetting to handle loading states
- Not serializing data properly

**Recommendation:** Use for any client-initiated server operations

### Solution: Server Actions
**Prevalence:** Common (Next.js 14+)
**Type:** Idiomatic

**Pros:**
- Direct function calls from client
- Automatic form handling
- Progressive enhancement

**Cons:**
- Newer, less documentation
- Can blur server/client lines

**Real-World Pain Points:**
- Forgetting "use server" directive
- Mixing with Client Component state

**Recommendation:** Use for mutations and form submissions

---

## Phase 6: Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Env vars need NEXT_PUBLIC_ prefix | Next.js docs + our test | Doc/Code |
| setState in render causes errors | React source + our error | Code/Test |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Can use Redis client on client | Security docs + undefined | Abandoned |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Server Actions | Medium | 2026-06 |
| RSC Patterns | Low | 2026-12 |

---

## Phase 7: Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Move all Redis to server | Env vars + security | API routes for all Redis ops |
| Fix setState timing | React render rules | Defer with setTimeout/useEffect |
| Clear client/server boundaries | RSC requirements | 'use client' only when needed |

### Immediate Actions
1. Refactor all client-side Redis calls to API routes
2. Fix state update timing in usePreCheckout
3. Add environment variable validation

### Open Questions
1. Should we use Server Actions instead of API routes?
2. How to handle real-time updates with RSC?

---

## Phase 8: Recommended Architecture

### System Setup Principles

1. **Server-First Default**: All components Server Components unless explicitly marked Client
2. **Environment Variable Security**: Only NEXT_PUBLIC_* on client, everything else server-only
3. **State Management**: Client state only in Client Components with proper lifecycle
4. **Data Flow**: Server Components fetch data, pass to Client Components as props

### File Organization Pattern
```
app/
  (store)/
    page.tsx              # Server Component - fetches data
    layout.tsx             # Server Component - providers
    basket/
      page.tsx            # Server Component - basket data
      CheckoutButton.tsx  # Client Component - interactivity
    api/
      dev/                # Development-only API routes
        seeing-tool/
          status/route.ts # Server-only Redis access
```

### Environment Variable Strategy
```bash
# Server-only (Redis, Stripe, Sanity)
UPSTASH_REDIS_REST_URL=
STRIPE_SECRET_KEY=
SANITY_API_TOKEN=

# Client-exposed (NEXT_PUBLIC_*)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SANITY_PROJECT_ID=
```

### State Management Pattern
```typescript
// Server Component - fetch data
export default async function BasketPage() {
  const basket = await getBasket();
  
  return <BasketClient initialData={basket} />;
}

// Client Component - manage state
'use client';
export default function BasketClient({ initialData }) {
  const [basket, setBasket] = useState(initialData);
  
  // Proper state updates in useEffect/event handlers
  const updateBasket = () => {
    // Defer state updates
    setTimeout(() => setBasket(...), 0);
  };
}
```

This architecture prevents the system-level errors we encountered by respecting the boundaries between Server and Client Components.
