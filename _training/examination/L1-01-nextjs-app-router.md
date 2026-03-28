# Layer 1 Examination: Next.js 15 App Router

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 90 minutes

**Prerequisites (MUST complete before starting):**
- [ ] React 18 fundamentals (hooks, JSX, component lifecycle)
- [ ] TypeScript basics (generics, type narrowing, module resolution)
- [ ] HTTP fundamentals (request/response cycle, caching headers)

**I attest that I have completed the prerequisites:** _________________ (signature)

---

## Section A: First Principles Foundation (20 minutes)

### A1. Core Concept: Server Components vs Client Components

**Question 1: From first principles, explain WHY Next.js 15 defaults to Server Components.**

*Do not describe HOW they work. Explain the fundamental problem they solve and why the default matters.*

Your explanation:
```
[Write here - minimum 150 words]










```

**Gap Detection Prompt:** What am I missing about the bundle size implications?
```
[Identify 3+ gaps in your understanding]




```

### A2. Mental Model: The Request Lifecycle

**Question 2: Draw the mental model (describe in words) of a single request from browser to response.**

Include these checkpoints:
1. When does the boundary between server/client occur?
2. Where is React running at each phase?
3. When is JavaScript sent to the browser?
4. Where does the "hydration" concept fit in?

Your description:
```
[Write here - step-by-step with explicit handoff points]










```

**Truth Check:** Can you derive the caching behavior from this model?
- [ ] Yes, I can explain why `cache: 'no-store'` behaves as it does
- [ ] No, I need to review

---

## Section B: Closed-Book Implementation Challenge (30 minutes)

**Instructions:** Complete the following WITHOUT documentation. All code must be syntactically valid.

### B1: Server Component with Data Fetching

Create a Server Component that:
1. Fetches data from an external API (simulate with `async/await`)
2. Accepts a search parameter via props
3. Handles the loading state WITHOUT `useEffect` or `useState`
4. Implements proper error handling

```tsx
// app/products/page.tsx
// Write complete implementation:















```

**Self-Assessment:** Does this compile? ___________

### B2: Client Component Integration

Create a Client Component that:
1. Accepts the fetched data as a prop
2. Has client-side interactivity (button click)
3. Uses `useState` appropriately
4. Is correctly marked as a Client Component

```tsx
// app/components/ProductClient.tsx
'use client';

// Write complete implementation:















```

**Self-Assessment:** Can I explain why 'use client' is needed here? ___________

### B3: The Boundary Pattern

Show how to compose B1 and B2 correctly. What is the critical rule about passing data between them?

```tsx
// Show the composition:










```

**Critical Rule I Must Explain:** _________________________________________________

---

## Section C: Edge Case & Failure Mode Analysis (20 minutes)

**For each scenario, identify the failure mode and the fix.**

### C1: The "useState in Server Component" Error

**Scenario:** You accidentally use `useState` in a Server Component.

**Error Message:** (Fill in what you expect)
```



```

**Root Cause (first principles):**
```




```

**The Fix:**
```



```

### C2: The "window is not defined" Error

**Scenario:** You reference `window` in a component that renders on the server.

**Why this happens (execution context analysis):**
```




```

**Two valid fixes (code both):**
```tsx
// Fix 1:






// Fix 2:






```

### C3: The Serialization Boundary

**Scenario:** You try to pass a function from Server to Client Component as a prop.

**Why this fails (protocol-level explanation):**
```




```

**The architectural constraint this reveals:**
```




```

### C4: Dynamic Route Caching Issue

**Scenario:** Your dynamic route is returning stale data.

**Caching layers involved (list in order):**
1. ___________________
2. ___________________
3. ___________________

**Debug checklist:**
- [ ] Check `next.config.ts` cache headers
- [ ] Check `fetch()` cache option
- [ ] Check `export const dynamic` setting
- [ ] Check `export const revalidate` setting

---

## Section D: Open-Book Verification (15 minutes)

**Now consult the Next.js 15 documentation. For each item, correct your answers above.**

### D1: Corrections from Section B

| Item | My Answer | Documentation Truth | Gap Identified |
|------|-----------|---------------------|----------------|
| B1 error handling | | | |
| B2 'use client' placement | | | |
| B3 boundary rule | | | |

### D2: Version-Specific Knowledge

**Critical for 2026 development:**

Next.js 15 specific changes from 14:
1. ___________________________________________________
2. ___________________________________________________
3. ___________________________________________________

Turbopack vs Webpack (when to use each):
- Turbopack: ___________________________________________
- Webpack: ____________________________________________

---

## Section E: Integration Preview (5 minutes)

**How does Next.js 15 interact with these technologies in YOUR codebase?**

### E1: Sanity CMS Integration

The critical integration point: _________________________________________________

Why Server Components matter for Sanity queries: _________________________________

### E2: TypeScript Integration

The critical type consideration for Server Components: ___________________________

### E3: Tailwind CSS Integration

Why Tailwind works seamlessly with Server Components: _____________________________

---

## Final Attestation

**I can now:**
- [ ] Explain Server/Client Component boundary from first principles
- [ ] Implement Server Components without hooks
- [ ] Identify serialization constraints
- [ ] Debug caching issues systematically
- [ ] Explain Next.js 15 specific changes

**I need to revisit (mark for re-examination within 48 hours):**
- [ ] Server Component mental model
- [ ] Client Component markers
- [ ] Caching layers
- [ ] Other: _______________

**Signed:** _________________ **Date:** ___________

**Next examination:** _________________ (scheduled topic)

---

## Cross-Reference

**Prerequisites:**
- React 18 Fundamentals
- TypeScript Basics
- HTTP/Cache Fundamentals

**Dependents:**
- Sanity Integration (Layer 2)
- Server Actions (Layer 2)
- Authentication Flows (Layer 2)

**Conflicts/Alternatives:**
- Pages Router (legacy, avoid for new code)
- Remix (different server/client model)
- Gatsby (static generation focus)

**Authoritative Sources:**
1. https://nextjs.org/docs (App Router section)
2. https://react.dev/reference/react (Server Components RFC)
3. https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
