# Theme 01: Next.js 15 App Router & Server Components

## SangLogium Context
Next.js 15 App Router is the foundation of the entire application. Every page defaults to Server Components. Data fetching is parallelized. The routing structure determines how VFS, auth, and checkout flows work.

**Critical Files:**
- `app/(store)/products/[...category]/page.tsx` — Category pages with parallel data fetching
- `app/(store)/checkout/*/page.tsx` — Checkout wizard flow
- `app/(store)/page.tsx` — Homepage with orchestrated data fetching
- `app/(admin)/manager/page.tsx` — Role-based admin views

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at documentation. Binary pass/fail.

#### Server vs Client Components
- [ ] When does a Server Component become a Client Component?
- [ ] What directive marks a Client Component?
- [ ] Can a Server Component import a Client Component? Vice versa?
- [ ] What happens if you put 'use client' at the top of a page.tsx file?
- [ ] Where should data fetching logic live: Server or Client Component?

#### Data Fetching Patterns
- [ ] How does React's cache() function work with RSCs?
- [ ] What happens when you call the same fetch in multiple RSCs?
- [ ] How do you parallelize multiple data fetches in a Server Component?
- [ ] What is the difference between async Server Components and useEffect fetching?

#### Route Structure
- [ ] What does the (store) group do in app/(store)/?
- [ ] How do catch-all routes like [...category] work?
- [ ] What is the difference between [...slug] and [[...slug]]?
- [ ] How do parallel routes work (@modal, @drawer)?

#### Caching & Revalidation
- [ ] What are the three types of caching in Next.js 15?
- [ ] How do you disable caching for a specific fetch?
- [ ] What does revalidatePath() do vs revalidateTag()?
- [ ] When should you use dynamic rendering over static?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Server Component Fundamentals

**First Principles:**
- Server Components execute on the server, sending only HTML to the client
- Zero JavaScript shipped for pure Server Components
- Direct backend resource access (databases, file systems, CMS)

**Key Concepts:**
1. **Component Boundary Rules**
   - Server Components can import Client Components
   - Client Components CANNOT import Server Components directly
   - Props can be passed from Server to Client (serialized)
   - Children pattern: Server passes Server Components as children to Client

2. **Data Fetching in RSCs**
   ```tsx
   // Parallel fetching pattern used in SangLogium
   const [products, filters, sortOptions] = await Promise.all([
     getProducts(),
     getFilters(),
     getSortOptions()
   ]);
   ```

3. **React cache() for Deduplication**
   - React automatically deduplicates identical fetches during render
   - Custom data functions should use cache() for explicit control
   - Critical for preventing redundant Sanity API calls

**SangLogium Application:**
- Homepage uses parallel fetching for Hero, Main, Bottom sections
- Product pages fetch filters, sort options, and products concurrently
- Each component manages its own data (zero prop-drilling)

---

### Module 2: Client Component Boundaries

**When to Use 'use client':**
1. Event listeners (onClick, onSubmit)
2. React hooks (useState, useEffect, useContext)
3. Browser APIs (window, document, localStorage)
4. Custom hooks that use any of the above

**SangLogium Patterns:**
- Drawer shell components (URL state + history)
- Form handling with react-hook-form
- Cart state management with Zustand
- Interactive filters (client-side toggle, server-side apply)

**Anti-Patterns to Avoid:**
- Marking entire pages as 'use client'
- Fetching data in useEffect that could be in RSC
- Moving server logic to client to 'fix' hydration issues

---

### Module 3: Routing Architecture

**Route Groups:**
- (store) — Customer-facing pages (shared layout)
- (admin) — Management interface (auth-guarded)
- (studio) — Sanity Studio (separate layout)

**Dynamic Routes:**
```
/products/[...category]/page.tsx
├── /products/headphones
├── /products/headphones/open-back
└── /products/audio-electronics/dacs
```

**Parallel Routes (SangLogium does not use native):**
- Native parallel routes (@modal) cause performance issues
- SangLogium uses URL-based drawers instead (nuqs library)
- Faster, simpler, full history support

---

### Module 4: Caching Strategy

**Three-Layer Caching:**
1. **Request Memoization** (React) — Same request, same render
2. **Data Cache** (Next.js) — Persisted across requests
3. **Full Route Cache** — Static HTML at build time

**SangLogium Configuration:**
```tsx
// Force dynamic for user-specific or time-sensitive data
export const dynamic = 'force-dynamic';

// Revalidate for semi-static content
export const revalidate = 3600; // 1 hour

// Tag-based revalidation for Sanity content
fetch(sanityQuery, { next: { tags: ['products'] } });
```

**Critical Decisions:**
- Product pages: Dynamic (filters change, inventory changes)
- Homepage: ISR with daily revalidation (via GitHub Actions cron)
- Catalogue index: Build-time generation (VFS pre-computation)

---

## Layer 2: Integration Examination

### Integration Challenge 1: RSC + Sanity + TypeScript

**Scenario:** Build a category page that:
1. Receives category slug from URL params (async)
2. Fetches products from Sanity using typed GROQ query
3. Handles loading states without 'use client'
4. Returns proper TypeScript types to child components

**Constraints:**
- Must use Server Component
- Must parallelize filter and product fetching
- Must handle case where category does not exist
- Must not use any Client Component directives

**Verification:**
- [ ] TypeScript compiles with zero errors
- [ ] No 'use client' in the implementation
- [ ] Network tab shows parallel requests
- [ ] 404 handling works for invalid categories

---

### Integration Challenge 2: Server-First Data Orchestration

**Scenario:** Replicate the SangLogium homepage data pattern

**Requirements:**
1. Create a page that fetches 3 independent data sources
2. Each source should have its own data function with cache()
3. Fetch in parallel using Promise.all()
4. Pass typed data to section components
5. One section should be a Client Component (interactive carousel)

**Success Criteria:**
- [ ] Three data functions defined with cache()
- [ ] Promise.all() for parallel execution
- [ ] Section components receive typed props
- [ ] Client Component receives data as props (not fetches itself)
- [ ] Zero prop-drilling (each section manages its own data)

---

## Layer 3: Systems Examination

### Systems Challenge: Architecture Decision Record

**Scenario:** You are adding a real-time notification feature to SangLogium

**Options:**
1. Server-sent events (SSE) via Route Handler
2. WebSocket server separate from Next.js
3. Polling with SWR/React Query in Client Component
4. Inngest delayed jobs with client polling

**Your Task:**
1. Analyze each option against SangLogium constraints
2. Consider: auth (Clerk), infrastructure (Netlify), complexity, realtime needs
3. Document decision with trade-offs
4. Provide implementation sketch

**Evaluation Criteria:**
- [ ] Decision considers Server/Client boundary rules
- [ ] Auth integration is addressed
- [ ] Infrastructure constraints considered (Netlify serverless)
- [ ] Clear winner with justified trade-offs

---

## Stress Test Scenarios

### Scenario 1: Hydration Mismatch Debug

**Given:**
```tsx
// Server Component
export default async function Page() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// ProductList is a Client Component
'use client';
export function ProductList({ products }) {
  const [filtered, setFiltered] = useState(products);
  // ...
}
```

**Problem:** Hydration mismatch error in console

**Questions:**
1. Why is this happening?
2. How do you fix it without removing 'use client'?
3. How do you fix it by removing 'use client'?

---

### Scenario 2: Performance Bottleneck

**Symptom:** Category page takes 3 seconds to load

**Investigation:**
1. Network tab shows 5 sequential requests
2. Each request is a separate Sanity fetch
3. Components are nested: Parent fetches, passes to Child, which fetches again

**Fix Required:**
- Convert to parallel fetching
- Identify why cache() is not deduplicating
- Refactor component boundary for optimal data flow

---

## Quick Reference: Decision Matrix

| Situation | Use Server Component? | Use Client Component? |
|-----------|----------------------|----------------------|
| Fetching from CMS | YES | Never (use RSC) |
| Handling onClick | No | YES |
| Using useState | No | YES |
| SEO-critical content | YES | Only if hydrated |
| Complex forms | Minimal client | YES for interaction |
| Data transformation | YES | Only if interactive |

---

## Completion Checklist

- [ ] Can explain React cache() with examples
- [ ] Can identify Server vs Client boundary violations
- [ ] Can debug hydration mismatches
- [ ] Can implement parallel data fetching
- [ ] Can make caching strategy decisions
- [ ] Can explain SangLogium's server-first architecture rationale

---

*Next: Theme 02 — TypeScript with Sanity Typegen*
