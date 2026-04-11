# Architectural Gaps Analysis

**Date:** 2026-04-11
**Source:** Research Report vs Codebase Implementation Comparison
**Researcher:** Grok (Next.js 15+ App Router Architecture)
**Decay Risk:** Low (core RSC boundaries stable)

## Summary
The codebase **partially aligns** with the research report's recommendations. Several critical gaps exist that need addressing.

## 1. **RSC Boundaries - PARTIAL COMPLIANCE**

### Correct Implementation:
- `app/(store)/basket/page.tsx` - Server Component with Suspense
- `app/actions/checkout/reserveStock.ts` - Proper `'use server'` directive
- `lib/stripe.ts` - Server-only Stripe instance

### Critical Gaps:
- **`app/(store)/checkout/address/page.tsx`** - Unnecessary `'use client'` directive
- **`app/(store)/checkout/payment/page.tsx`** - Unnecessary `'use client'` directive

### Impact:
- Bundle bloat from client-side rendering of what should be Server Components
- Missing streaming benefits for initial page load

## 2. **Environment Variables - CORRECT**

### Proper Implementation:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` used only in client (`lib/stripe-promise.ts`)
- `STRIPE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` server-only
- No client-side access to secrets detected

## 3. **Server Actions vs Route Handlers - CORRECT**

### Proper Implementation:
- `reserveStock` - Server Action for internal mutations
- `/api/webhooks/stripe/route.ts` - Route Handler for external webhooks
- Clear separation of concerns

## 4. **Missing Architecture Patterns**

### Suspense Implementation:
- No Suspense boundaries around slow data fetching
- Missing loading states for address/payment pages

### Server-First Data Fetching:
- Address/payment pages fetch data client-side via `useEffect`
- Should fetch data server-side and pass as props

### Client Component Boundaries:
- Client components too high in the tree
- Should wrap only interactive islands, not entire pages

## 5. **Specific Fixes Required**

### High Priority:
1. Convert `app/(store)/checkout/address/page.tsx` to Server Component
2. Convert `app/(store)/checkout/payment/page.tsx` to Server Component
3. Move client-side data fetching to Server Components
4. Add Suspense boundaries for streaming

### Medium Priority:
1. Extract client-side logic to dedicated client components
2. Implement loading.tsx files for better UX
3. Add error boundaries

## 6. **Recommended Architecture**

```typescript
// Correct pattern:
app/(store)/checkout/address/page.tsx        // Server Component
  - fetches data server-side
  - passes props to AddressForm

app/(store)/checkout/payment/page.tsx       // Server Component
  - fetches guest session server-side
  - passes props to StripePaymentForm
```

## 7. **Compliance Score**

| Area | Status | Score |
|------|---------|-------|
| RSC Boundaries | Partial | 60% |
| Environment Variables | Correct | 100% |
| Server Actions | Correct | 100% |
| Data Fetching Pattern | Needs Work | 40% |
| Suspense/Streaming | Missing | 20% |

**Overall Compliance: 64%**

## Verdict
The codebase follows the research recommendations at ~64% compliance. The core patterns (Server Actions, env vars) are correct, but RSC boundaries need significant optimization to achieve the streaming and performance benefits outlined in the research.

## Next Steps
1. Fix RSC boundaries in checkout pages
2. Implement server-side data fetching
3. Add Suspense boundaries for better UX
4. Optimize client component placement
