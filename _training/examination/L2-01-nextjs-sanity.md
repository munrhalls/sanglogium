# Layer 2 Examination: Next.js + Sanity Integration

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 120 minutes

**Prerequisites (ALL must be completed first):**
- [ ] L1-01 Next.js App Router (signed)
- [ ] L1-05 Sanity CMS + GROQ (signed)
- [ ] L1-02 TypeScript 5.x (signed)

**I attest I have passed all prerequisite examinations:** _________________

---

## Section A: Integration Architecture (25 minutes)

### A1: The Data Flow Mental Model

**Question 1: Map the complete data flow from Sanity to browser.**

```
Sanity CDN → __________ → __________ → __________ → Browser DOM

At each arrow, answer:
1. What format is the data in? (JSON/RSC/HTML/JS)
2. What transformation happens?
3. Where does caching occur?
4. What can fail here?
```

Your detailed map:
```



























```

### A2: Server Component Fetching Strategy

**Question 2: Your codebase fetches data in Server Components. Why?**

Benefits of fetching in Server Component vs Client Component:

| Aspect | Server Component | Client Component |
|--------|------------------|------------------|
| Bundle size impact | | |
| SEO | | |
| Time-to-first-byte | | |
| Authentication complexity | | |
| Cache control | | |

**The critical architectural decision this enables:** _______________________

---

## Section B: Closed-Book Implementation (40 minutes)

### B1: Type-Safe Data Fetching Pattern

Implement the complete data fetching pattern used in your codebase:

```typescript
// lib/sanity/queries/getProductsByVfsKeys.ts
// Write the complete implementation with proper typing:












































```

**Type safety checkpoints:**
- [ ] Query returns typed data (not `any`)
- [ ] Error handling preserves type information
- [ ] Sanity client is properly typed

### B2: Server Component with Params

Create a Server Component for `/products/[category]/page.tsx`:

```tsx
// Your implementation:

























































```

**Must handle:**
- Params extraction
- SearchParams handling
- Error boundaries
- Not found cases
- Loading states (without useState)

### B3: Image Optimization Integration

Sanity provides image URLs. Your app uses `next/image`. Write the integration:

```typescript
// lib/sanity/imageUrl.ts
// Reconstruct the custom loader for next/image:











































```

**Why use Sanity CDN instead of Next.js image optimization?** ____________

---

## Section C: Debugging Integration Failures (25 minutes)

### C1: The "Missing Data" Scenario

**Problem:** Product data appears in Sanity Studio but not on the page.

**Debug checklist (ordered by likelihood):**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
4. ___________________________________________
5. ___________________________________________

**How to verify at each step:**
```










```

### C2: The "Type Mismatch" Error

**Problem:** TypeScript error: `Property 'X' does not exist on type 'Y'` from Sanity query.

**Root cause analysis:**
```
Possible causes:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

**The fix workflow:**
```
Step 1: ___________________________________________
Step 2: ___________________________________________
Step 3: ___________________________________________
```

### C3: The "Cache Stale" Scenario

**Problem:** Content updated in Sanity but page still shows old data.

**Caching layers to check (in order):**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
4. ___________________________________________

**Immediate fix vs. proper fix:**
- Immediate: ___________________________________________
- Proper: ___________________________________________

---

## Section D: Your Codebase Deep Dive (20 minutes)

### D1: VFS Integration Pattern

Examine `app/actions/categories.ts` or similar:

**The VFS query pattern in your codebase:**
```typescript
// Explain how products are queried by catalogue path:
















```

**Why pre-compute the catalogue index?** _________________________________

### D2: Homepage Data Flow

Trace the data flow for the homepage:

```
Sanity document: _________________________________
GROQ query location: ____________________________
Server Component: _______________________________
Props passed to: ________________________________
Client Component (if any): _______________________
```

**Critical architectural decision:** _____________________________________

---

## Section E: Open-Book Verification (10 minutes)

### E1: Sanity + Next.js Latest Best Practices

```
Practice: ___________________________________________
Does your codebase follow it? _________________________
Migration needed? _____________________________________
```

### E2: Your Corrections

| Integration | My Implementation | Correct Pattern | Gap |
|-------------|-------------------|-----------------|-----|
| B1 query | | | |
| B2 Server Component | | | |
| B3 image loader | | | |

---

## Final Attestation

**I can now:**
- [ ] Architect type-safe Server Component data fetching
- [ ] Debug data flow issues systematically
- [ ] Implement proper image optimization with Sanity
- [ ] Understand the VFS pattern deeply
- [ ] Handle caching at multiple layers

**Critical gaps for re-examination:**
- [ ] ___________________________________________
- [ ] ___________________________________________

**Signed:** _________________ **Date:** ___________

---

## Cross-Reference

**Prerequisites:** L1 Next.js, L1 Sanity, L1 TypeScript

**Dependents:**
- Server Actions integration (Layer 2)
- Real-time previews (Layer 2)
- Search implementation (Layer 2)

**Authoritative Sources:**
1. https://next-sanity.vercel.app/docs
2. https://www.sanity.io/docs/nextjs-introduction
3. Your `lib/sanity/` directory

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
