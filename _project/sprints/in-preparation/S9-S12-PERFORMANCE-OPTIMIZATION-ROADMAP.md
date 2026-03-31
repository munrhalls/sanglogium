# S9-S12 Performance Optimization Roadmap

**Status:** IN PREPARATION  
**Created:** March 31, 2026  
**Target:** Fix critical performance issues from audit  
**Prerequisite:** S8-PERFORMANCE-TESTING-INFRASTRUCTURE must be complete  
**Estimated Total Duration:** 8-12 development days  

---

## EXECUTIVE SUMMARY

This roadmap defines the sequence of 4 performance optimization sprints required to address the critical performance gaps identified in the March 31, 2026 audit. Each sprint is designed to be executed by a fresh AI agent with full context from this document and the completed S8 testing infrastructure.

### Critical Metrics (Current vs Target)

| Metric | Current | Target | Sprint |
|--------|---------|--------|--------|
| TTFB | 10.9s | <600ms | S9 |
| LCP | 7.7s | <2.5s | S10 |
| Speed Index | 22.5s | <4s | S9 + S10 |
| Unused JavaScript | 265KB | <100KB | S11 |
| Redirect Time | 2.17s | 0ms | S12 |
| Lighthouse Score | 57/100 | >75 | All |

---

## SPRINT SEQUENCE

### Sprint 9: TTFB Optimization
**Priority:** P0 — Emergency  
**Estimated Duration:** 3-4 days  
**Root Cause:** Sequential Sanity API calls on homepage (9 requests, no caching)  

**Target State:**
- TTFB reduced from 10.9s to <600ms
- Homepage data fetched in 1-2 batched Sanity requests
- Edge caching implemented for homepage data
- DataLoader pattern for request deduplication

**Key Implementation Areas:**
- `app/(store)/lib/fetchHomepageData.ts` — Batch/deduplicate 9 parallel requests
- `sanity/lib/client.ts` — Add request caching layer
- `app/(store)/page.tsx` — Edge runtime consideration, streaming

**Scope Lock Rules:**
1. NO changes to image loading (separate sprint)
2. NO changes to bundle size (separate sprint)
3. NO changes to Clerk/auth (separate sprint)
4. NO changes to design system or styling
5. MUST maintain existing data shapes for components

**Success Criteria:**
- TTFB < 600ms in production
- Sanity API calls ≤ 2 per homepage load
- All homepage components receive same data shape
- Existing tests pass

---

### Sprint 10: LCP Optimization
**Priority:** P0 — Emergency  
**Estimated Duration:** 2-3 days  
**Root Cause:** Hero image blocked by slow server response + resource loading  

**Target State:**
- LCP reduced from 7.7s to <2.5s
- Hero image has resource hints (preload, preconnect)
- Critical CSS inlined for above-fold content
- Image priority loading optimized

**Key Implementation Areas:**
- `app/(store)/layout.tsx` — Add resource hints for hero image
- `app/components/features/homepage/hero/Hero.tsx` — Optimize image loading strategy
- `app/globals.css` — Critical CSS extraction (if applicable)
- Sanity image CDN configuration for fast first byte

**Scope Lock Rules:**
1. NO changes to data fetching (addressed in S9)
2. NO changes to bundle size (separate sprint)
3. NO changes to hero image asset (optimization only)
4. MUST maintain hero component API contract
5. MUST maintain responsive image behavior

**Success Criteria:**
- LCP < 2.5s in production
- Hero image loads with `fetchpriority="high"`
- Resource hints present in `<head>`
- No layout shift from image loading

---

### Sprint 11: Bundle Optimization
**Priority:** P1 — High  
**Estimated Duration:** 2-3 days  
**Root Cause:** 265KB unused JavaScript from Clerk, icons, heavy dependencies  

**Target State:**
- Unused JavaScript reduced from 265KB to <100KB
- Clerk loaded only on auth-required routes
- Icons tree-shaken to used subset only
- Dynamic imports for heavy components

**Key Implementation Areas:**
- `app/(store)/layout.tsx` — Remove ClerkProvider from public pages
- `middleware.ts` — Optimize Clerk middleware matcher
- `app/components/ui/icons/` — Audit and tree-shake icon imports
- `next.config.ts` — Add `experimental.optimizePackageImports`
- `package.json` — Review heavy dependencies (moment, lodash, etc.)

**Scope Lock Rules:**
1. NO changes to data fetching (addressed in S9)
2. NO changes to image loading (addressed in S10)
3. NO changes to auth flow behavior (only loading strategy)
4. MUST maintain all existing functionality
5. MUST maintain icon availability in components

**Success Criteria:**
- Unused JavaScript < 100KB (measured by Lighthouse)
- Total JS bundle < 400KB
- First Load JS < 250KB
- No auth functionality regression

---

### Sprint 12: Redirect Elimination
**Priority:** P1 — High  
**Estimated Duration:** 1-2 days  
**Root Cause:** Clerk auth handshake causing 2.17s redirect chain on public pages  

**Target State:**
- Zero unnecessary redirects on public pages
- Clerk only initialized on protected routes
- Fast path for anonymous users

**Key Implementation Areas:**
- `middleware.ts` — Reconfigure Clerk matcher to exclude public routes
- `app/(store)/layout.tsx` — Conditional ClerkProvider injection
- `app/layout.tsx` — Consider root layout without global Clerk
- Auth route grouping strategy

**Scope Lock Rules:**
1. NO changes to data fetching (addressed in S9)
2. NO changes to image loading (addressed in S10)
3. NO changes to bundle size (addressed in S11)
4. MUST maintain all protected routes functionality
5. MUST maintain session state across route changes

**Success Criteria:**
- No Clerk redirects on `/`, `/products`, `/brand/*` public pages
- Protected routes (`/account`, `/checkout`) still require auth
- TTFB improvement of ~500ms from redirect elimination
- Redirect chain eliminated from Lighthouse report

---

## DEPENDENCIES & SEQUENCING

```
S8: Testing Infrastructure (PREREQUISITE)
    ↓
S9: TTFB Optimization ← Critical path, highest impact
    ↓
S10: LCP Optimization ← Depends on S9 (fast server response needed first)
    ↓
S11: Bundle Optimization ← Can parallel with S10 after S9
    ↓
S12: Redirect Elimination ← Can parallel with S11
```

**Critical Path:** S8 → S9 → S10  
**Parallelizable:** S11 and S12 can run concurrently after S9 completes  

---

## SHARED CONTEXT FOR FRESH AGENTS

### From Performance Audit (March 31, 2026)

**Critical Findings:**
1. **TTFB: 10.9s** — Sequential 9 Sanity API calls, no caching
2. **LCP: 7.7s** — Hero image blocked by slow TTFB, no resource hints
3. **Unused JS: 265KB** — Clerk loaded on all pages, full icon library
4. **Redirect: 2.17s** — Clerk handshake on public pages

**Positive Foundations:**
- CLS: 0.001 (excellent)
- Image formats: AVIF/WebP configured
- Next.js optimizations: CSS inline, package hints present
- Basic performance tests already exist

### Tech Stack Context

- **Framework:** Next.js 15 (App Router, Server Components)
- **Data:** Sanity CMS (`useCdn: true`, image CDN)
- **Auth:** Clerk (`@clerk/nextjs`)
- **Styling:** Tailwind CSS (scoped, no globals.css changes)
- **Testing:** Playwright + Lighthouse CI
- **Hosting:** Vercel (Edge Runtime available)

### Key Files Reference

```
app/
  (store)/
    page.tsx                    # Homepage with 9 data fetches
    lib/fetchHomepageData.ts    # Parallel but unbatched requests
    layout.tsx                  # ClerkProvider here affects all pages
    
sanity/
  lib/client.ts                 # Sanity client config
  lib/api/                      # Individual data fetchers

next.config.ts                  # Image optimization, experimental features
middleware.ts                   # Clerk middleware
```

---

## RISK MITIGATION

### Cross-Sprint Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| S9 changes break data for S10/S11 | HIGH | Maintain exact data shapes, only change fetch mechanism |
| Bundle changes affect auth | MEDIUM | Test auth flows after S11, before S12 |
| Optimizations regress on deployment | MEDIUM | S8 infrastructure provides automated regression detection |
| Edge runtime incompatibility | MEDIUM | Test on Vercel preview, not just local |

### Agent Handoff Checklist

For each sprint, the fresh agent should verify:

- [ ] S8 testing infrastructure is deployed and running
- [ ] Baseline metrics captured from production
- [ ] Previous sprint completed and merged (if applicable)
- [ ] No open PRs modifying the same files
- [ ] Design system constraints understood (see user rules)

---

## SPRINT SPECIFICATION TEMPLATES

When creating detailed sprint specs, use this structure:

```markdown
## S[N]-[NAME] Sprint

**Status:** READY FOR EXECUTION  
**Created:** [Date]  
**Target:** [One-line goal]  
**Estimated Duration:** [X-Y days]  
**Depends On:** [Previous sprints]  

### Executive Summary
[Context and gap coverage]

### 1. Regression Risk Analysis & Containment
[Table of code areas at risk]
[Pre-sprint regression tests]

### 2. Scope Lock Rules
[5-6 strict rules]

### 3. Scope Contracts
[3-5 contracts with Pass 1/2/3 and Layer 1-4]

### 4. Execution Sequence
[Phase breakdown]

### 5. Verification Commands
[Per-contract and final build gate]

### 6. Anti-Patterns
[What not to do]
```

---

## MEASUREMENT & SUCCESS

### Primary Metrics (Tracked via S8 Infrastructure)

| Metric | Tool | Target |
|--------|------|--------|
| TTFB | Playwright + RUM | <600ms |
| LCP | Lighthouse CI | <2.5s |
| Unused JS | Lighthouse CI | <100KB |
| Redirects | Lighthouse CI | 0 wasted ms |
| Lighthouse Score | Lighthouse CI | >75 |

### Secondary Metrics

- Time to Interactive (TTI) < 3.8s
- Total Blocking Time (TBT) < 200ms
- Speed Index < 4s
- First Contentful Paint (FCP) < 1.8s

### Regression Protection

After all sprints complete:
- Any PR increasing TTFB by >100ms fails CI
- Any PR increasing LCP by >200ms fails CI
- Any PR increasing bundle by >50KB fails CI
- Any PR introducing redirects fails CI

---

## POST-SPRINT STATE

After S9-S12 complete, the application should have:

1. **Fast TTFB** (<600ms) via optimized data fetching
2. **Fast LCP** (<2.5s) via optimized image loading
3. **Lean Bundle** (<400KB total) via tree-shaking
4. **No Redirects** on public pages
5. **Monitoring** via S8 infrastructure for regression prevention

**Next Phase Unlocked:**
- Advanced optimizations (ISR, React Server Components streaming)
- Feature work with performance guarantees
- Mobile-specific performance tuning

---

**END OF ROADMAP**
