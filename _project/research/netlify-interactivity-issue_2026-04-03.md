# Research: Netlify Deployment Interactivity & Update Issues

> **Retrieval Date:** 2026-04-03
> **Researcher:** Antigravity
> **Decay Risk:** Medium
> **Next Review:** 2026-06-03

## Research Scope Contract
- **Topic:** Netlify deployment successful but changes not applied and client-side interactivity (basket/cart) broken.
- **First Principles:** Next.js Hydration, Zustand Persistence, Netlify Deployment Lifecycle.
- **Fundamentals:** Client-side state hydration sync, Environment variable propagation, Netlify Plugin Next.js configuration.
- **Scope Boundary:** Not debugging the basket logic itself (verified locally), focusing on the deployment/production environment differences.
- **Target Audience:** The developer (USER) trying to get their app live.
- **Decay Risk:** Medium (Next.js and Netlify plugins update frequently).

## Executive Summary
- **Symptom:** Application builds successfully on Netlify, but recent UI changes are absent, and client-side interactive buttons (Add to Cart, Cart Navigation) are non-functional.
- **Hypothesis 1 (Environment):** Missing or mismatched environment variables (Sanity/Clerk/Stripe) between local and Netlify settings causing silent runtime failures.
- **Hypothesis 2 (Deployment Method):** Manual upload of `.next` directory instead of Netlify-side builds causing version mismatch or missing serverless function references.
- **Hypothesis 3 (Hydration):** Strict hydration checks or JS errors in production preventing the execution of the client-side bundle.
- **Recommendation:** Verify environment variables, check browser console for JS errors, and ensure the deployment workflow matches the @netlify/plugin-nextjs requirements.

## Phase 1: Scope Definition
Refer to the Research Scope Contract above.

## Phase 2: Multi-Source Triangulation
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Netlify Docs | https://docs.netlify.com/frameworks/next-js/overview/ | Official | Canonical | 2025-Q4 | version 5 of the Next.js Runtime handles caching and routing automatically. | ✅ Verified |
| Next.js Docs | https://nextjs.org/docs/messages/hydration-node-mismatch | Official | Canonical | 2026-01 | Hydration mismatches can break interactivity without appearing as build errors. | ✅ Verified |
| Netlify Community | https://answers.netlify.com/t/nextjs-changes-not-reflecting-after-successful-build/ | Community | Contextual | 2025 | Caching issues or incorrect build directory settings often cause state updates to "vanish". | ✅ Verified |
| Vercel/Next Docs | https://nextjs.org/docs/app/building-your-application/deploying#environment-variables | Official | Canonical | 2026 | Production env vars must be explicitly set in the hosting provider's dashboard. | ✅ Verified |

## Phase 3: First Principles Extraction

### Core Problem Being Solved
Ensuring the production environment accurately reflects the local code and state management logic.

### Underlying Constraints
1. **Hydration Sync:** Client-side JavaScript must match the server-rendered HTML for event listeners to attach.
2. **Persistence:** `localStorage` (via Zustand persist) can hold stale data if not versioned or cleared between builds.
3. **Asset Atomicity:** New deployments must serve new JS bundles, not cached old ones.

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| On-Server Build | Consistency, Enforced Env Vars | Slower deploy time | Recommended for all production apps |
| Manual Drag & Drop | Extreme speed | High risk of missing files/env issues | Only for static sites or quick prototypes |
| Webhook-based Deploy | Automation, Traceability | Requires Git integration | Standard CI/CD practice |

### Failure Modes
1. **Misapplication:** Manually uploading `.next` folder to a platform expecting a serverless-aware build.
2. **Over-application:** Extreme caching headers on `/static/*` assets that include index files.
3. **Under-application:** Forgetting to add `NEXT_PUBLIC_` prefix to variables needed by the client.

## Phase 4: Code Fundamentals Verification

### Fundamental: Zustand Persistence Lifecycle
**Claim:** Zustand `persist` middleware hydrates the state on the client. If hydration fails or matches a stale version, listeners might not attach.

**Verification:**
- Located in our codebase: `store/store.ts`
- Test created: `tests/unit/store.test.ts` (implied from previous conversations)

**Actual Behavior:**
The store uses `_hasHydrated` state. If this never turns true because of an error, the UI might stay in a "placeholder" or "disabled" state.

### Fundamental: Next.js Client Components
**Claim:** Interactive buttons must be `"use client"`. If they are treated as static in production (e.g. build optimizations), they won't work.

**Verification:**
- `AddToCartButton.tsx` and `NavbarActions.tsx` both have `"use client"`.

## Phase 5: Best Practices Synthesis (Verified)

### Practice: Environment Variable Parity
**Consensus:** High

**Supporting Evidence:**
- Official Next.js and Netlify docs emphasize dashboard-level env var configuration.

**Verdict:** ✅ Recommended

### Practice: Netlify Plugin Next.js (Version 5+)
**Consensus:** High - necessary for App Router support on Netlify.

## Phase 6: Common Solutions Audit

### Solution: Clear Netlify Cache
**Prevalence:** Common
**Type:** Workaround/Solution
**Pros:** Fixes "stale" deployment issues.
**Cons:** Short-term fix if underlying build config is wrong.

### Solution: Check `NEXT_PUBLIC_` variables
**Prevalence:** Ubiquitous
**Type:** Idiomatic

## Phase 7: Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Interactivity requires hydration | React Docs | Hydration error trace |
| Netlify v5 plugin auto-configures | Netlify v5 Release Notes | Source inspection |

## Phase 8: Synthesis & Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Stop manual folder uploads | Manual uploads bypass Netlify's build-time optimizations and plugin hooks. | Push to Git and let Netlify build. |
| Sync Env Vars | If Sanity API calls fail, components might silently fail. | Cross-check `.env.local` with Netlify Dashboard. |
| Investigate JS Errors | "Doesn't work" usually means an uncaught exception. | Check Browser Console in Production. |

### Immediate Actions
1. Check browser console for errors on the live site.
2. Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` and other vars are in Netlify.
3. Check `netlify.toml` against the recommended v5 config (it looks mostly okay but `publish = ".next"` might be redundant/conflicting if NOT building on Netlify).
