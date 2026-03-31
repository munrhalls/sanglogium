# Codebase Acceleration Audit
## Sang Logium — Current State Assessment
**Date:** 2026-03-31  
**Scope:** Sprint Readiness, System Throughput, Critical Path Analysis  
**Output:** Strategic acceleration roadmap for AI-leverage maximization

---

## Executive Summary

### Current State: PRE-SPRINT (Ready for Execution)

Three active sprints are **spec-complete and ready for execution** — representing approximately 40-60 hours of focused work to achieve professional MVP readiness.

| Sprint | Status | Est. Hours | Critical Path |
|--------|--------|------------|---------------|
| **PLP_FIXES** | Ready | 12-16h | YES — Blocks UI Polish |
| **UI_POLISH** | Ready | 16-20h | Depends on PLP_FIXES |
| **AI_LEVERAGE_INFRA** | Ready | 8-12h | Parallel track |

**Verdict:** No blockers. Execution-ready with clear sequencing.

---

## 1. End-State Delineation (Current vs Target)

### Current System State (Desktop 1280px)
```
[NAV HEADER — full width, brand-400]
├── Logo (left)
├── Nav links (center)
└── User/Cart icons (right)

[HOMEPAGE — max-w-content, mx-auto]
├── Hero section (static, unlinked to VFS)
├── Category cards (static, hardcoded)
└── ProductSpotlights (legacy singleton data)

[PLP — /products/[...slug]]
├── ShopHeader (generic, not contextual)
├── ControlsBar
│   ├── SortDropdown (NON-FUNCTIONAL)
│   └── ResultCount
├── BodyRow (flex, gap-8)
│   ├── Sidebar (w-60)
│   │   └── FilterSidebar (5-10s LAG, returns 0 products)
│   └── ProductGrid (flex-1)
│       └── ProductCard[]
│           └── ProductImage (PLACEHOLDER — no images)

[PDP — /product/[slug]]
├── "Something Went Wrong" ERROR
└── Cannot load product details

[BASKET — /basket]
├── Functional (S7 completed)
└── Needs performance optimization
```

### Target State (Post-Sprints)
```
[NAV HEADER — unchanged]

[HOMEPAGE — VFS-driven, dynamic]
├── Hero section (linked to featured categories)
├── FeaturedSection[3-4] (VFS-resolved, dynamic)
│   └── ProductGrid with real products

[PLP — fully functional]
├── Contextual ShopHeader (type-overline + breadcrumb)
├── ControlsBar
│   ├── SortDropdown (FUNCTIONAL: A-Z, Price)
│   └── ResultCount
├── BodyRow
│   ├── Sidebar (w-60, visual separation)
│   │   └── FilterSidebar (<100ms response, working filters)
│   └── ProductGrid
│       └── ProductCard[] (actual Sanity images)

[PDP — /product/[slug]]
├── ProductDetail (fully rendered)
├── ImageGallery (with zoom modal)
└── RelatedProducts carousel
```

---

## 2. Critical Path Analysis

### 2.1 What Blocks Shipping

**TIER 0: Catastrophic (Cannot Demo)**
| Issue | Root Cause | Sprint | Fix Duration |
|-------|------------|--------|--------------|
| PDP "Something Went Wrong" | Query by slug expects _id | PLP_FIXES SC5 | 30 min |
| PLP 0 products with filters | GROQ `brand->name` vs `brand` | PLP_FIXES SC3 | 5 min |

**TIER 1: Broken Experience (Shippable But Embarrassing)**
| Issue | Root Cause | Sprint | Fix Duration |
|-------|------------|--------|--------------|
| Product images not rendering | Query not returning image._ref | PLP_FIXES SC1 | 1-2h |
| Filter lag (5-10s) | useFilters triggers full re-render | PLP_FIXES SC2 | 2-3h |
| Sorting non-functional | Sort state not passed to query | PLP_FIXES SC4 | 1h |

**TIER 2: Missing Polish (Acceptable but Not Professional)**
| Issue | Root Cause | Sprint | Fix Duration |
|-------|------------|--------|--------------|
| No image zoom on PDP | Missing modal implementation | UI_POLISH SC2 | 4-6h |
| No related products | Missing carousel + query | UI_POLISH SC3 | 4-6h |
| Hardcoded gray colors | text-gray-600 vs tokens | UI_POLISH SC1 | 30 min |
| No reusable Checkbox | Inline implementation | UI_POLISH SC5 | 2h |

**TIER 3: Architecture Debt (Long-term Impact)**
| Issue | Root Cause | Sprint | Fix Duration |
|-------|------------|--------|--------------|
| Homepage uses legacy singleton | Not using VFS | UI_POLISH SC4 | 8-12h |
| Context loss per session | No context templates | AI_LEVERAGE_INFRA | 4-6h |
| Data assumptions unverified | No verification gate | AI_LEVERAGE_INFRA | 2-4h |

### 2.2 Dependency Graph

```
PLP_FIXES (12-16h)
├── SC3: Filter Logic — MUST FIRST
│   └── Unblocks: Product display
├── SC1: Product Images — depends on SC3 data
├── SC2: Filter Performance — independent
├── SC4: Sorting — independent
└── SC5: PDP Error — independent

UI_POLISH (16-20h) — BLOCKED until PLP_FIXES complete
├── SC5: Checkbox — FIRST (enables SC1, SC3)
├── SC1: Empty State — depends on Checkbox
├── SC2: Image Zoom — independent
├── SC3: Related Products — depends on PLP ProductCard
└── SC4: Homepage VFS — LAST (complex, architecture)

AI_LEVERAGE_INFRA (8-12h) — PARALLEL track
├── Context templates (VFS, Sanity, FSM, Checkout)
├── Data Verification Gate (debug workflow)
├── Pre-Sprint Infrastructure Check
├── MCP Retrieval Extension
└── DoD Operationalization
```

---

## 3. Gap Analysis (G-XX)

### Critical Gaps (Block Professional Release)

| ID | Component | Current | Target | Severity | Sprint |
|----|-----------|---------|--------|----------|--------|
| G-01 | ProductCard image | Placeholder | Sanity CDN image | **Critical** | PLP_FIXES SC1 |
| G-02 | FilterSidebar | 5-10s lag, 0 results | <100ms, working | **Critical** | PLP_FIXES SC2-3 |
| G-03 | SortDropdown | Visual only | Functional sort | **Critical** | PLP_FIXES SC4 |
| G-04 | PDP | Error state | Product details | **Critical** | PLP_FIXES SC5 |

### High Priority Gaps (UX Impact)

| ID | Component | Current | Target | Severity | Sprint |
|----|-----------|---------|--------|----------|--------|
| G-05 | ImageGallery | Thumbnail swap | Zoom modal | High | UI_POLISH SC2 |
| G-06 | ProductDetail | Static only | Related products carousel | High | UI_POLISH SC3 |
| G-07 | Checkbox | Inline (3 locations) | Reusable component | Medium | UI_POLISH SC5 |
| G-08 | ProductGrid empty | text-gray-600 | text-secondary token | Medium | UI_POLISH SC1 |

### Architecture Gaps (Scalability Impact)

| ID | System | Current | Target | Severity | Sprint |
|----|--------|---------|--------|----------|--------|
| G-09 | Homepage data | Legacy singleton | VFS-resolved | Medium | UI_POLISH SC4 |
| G-10 | Context retrieval | 10-30min rebuild | Instant templates | Medium | AI_LEVERAGE_INFRA |
| G-11 | Data verification | Assumption-based | Evidence-first | Medium | AI_LEVERAGE_INFRA |
| G-12 | Pre-sprint checks | Manual | Automated baseline | Low | AI_LEVERAGE_INFRA |

---

## 4. Risk Matrix & Regression Containment

### Files at Critical Risk

| File | Risk Level | Reason | Containment |
|------|------------|--------|-------------|
| `ProductCard.tsx` | **CRITICAL** | Shared: Homepage + PLP + PDP related | Regression test after EVERY edit |
| `tailwind.config.ts` | **CRITICAL** | Global design system | READ-ONLY — no token additions |
| `globals.css` | HIGH | Global styles | NO MODIFICATIONS allowed |
| `FilterSidebar.tsx` | HIGH | Core PLP functionality | Test filter logic pre/post changes |
| `getProductsByVfsKeys.ts` | HIGH | Data fetching | All changes upstream, no side effects |

### Cross-Cut Risk Analysis

```
ProductCard.tsx Risk Chain:
├── Homepage featured section uses ProductCard
├── PLP ProductGrid uses ProductCard  
├── PDP RelatedProducts will use ProductCard
└── ONE CHANGE affects THREE contexts
    
    Mitigation:
    ├── Homepage regression test per sprint
    ├── Visual diff on PLP + PDP + Homepage
    └── Shared component audit after each edit
```

---

## 5. Sequencing for Maximum Throughput

### Recommended Execution Order

**PHASE 1: Critical Path (Day 1-2)**
```bash
# Execute: PLP_FIXES — SC3 first (filter logic)
# Duration: 4-6 hours
# Outcome: Products display, filters work
```

**PHASE 2: Foundation (Day 2-3)**
```bash
# Execute: PLP_FIXES — SC1, SC2, SC4, SC5
# Duration: 8-12 hours
# Outcome: PLP fully functional, PDP loads
```

**PHASE 3: Infrastructure (Parallel to Phase 2)**
```bash
# Execute: AI_LEVERAGE_INFRA — all scope contracts
# Duration: 8-12 hours (can parallelize)
# Outcome: Future sprints 40-60% faster
```

**PHASE 4: Polish (Day 4-5)**
```bash
# Execute: UI_POLISH — SC5, SC1, SC2, SC3
# Duration: 12-16 hours
# Outcome: Professional UX, reusable components
```

**PHASE 5: Architecture (Day 6-7)**
```bash
# Execute: UI_POLISH — SC4 (Homepage VFS)
# Duration: 8-12 hours
# Outcome: Dynamic homepage, no hardcoded categories
```

### Expected Velocity per Sprint

| Sprint | Est. Hours | Actual Risk | Buffer |
|--------|------------|-------------|--------|
| PLP_FIXES | 12-16h | Low (specs detailed) | 4h |
| AI_LEVERAGE_INFRA | 8-12h | Low (infrastructure) | 4h |
| UI_POLISH | 16-20h | Medium (cross-component) | 6h |
| **TOTAL** | **36-48h** | | **14h** |

---

## 6. Verification Gates

### Pre-Sprint Verification

```bash
# Critical: Establish baseline before ANY changes
npm run build

# Document pre-existing failures (if any)
# If build fails pre-sprint, HALT — infrastructure issue
```

### Per Scope Contract Verification

```bash
# After EACH scope contract:
1. npm run build                    # Must pass
2. /test scope:"[Contract Name]"    # DoD verification  
3. Visual check: PLP → filter → PDP # End-to-end flow
```

### Post-Sprint Lock Criteria

| Sprint | Lock Criteria | Verification |
|--------|---------------|--------------|
| PLP_FIXES | All 5 bugs fixed | Manual test: PLP → filter → sort → PDP |
| AI_LEVERAGE_INFRA | Scripts runnable, workflows updated | `node scripts/context-for-*-task.mjs` |
| UI_POLISH | Design system compliance | No `text-gray-*` in components |

---

## 7. Acceleration Recommendations

### Immediate (This Week)

1. **Execute PLP_FIXES SC3 first** — Filter logic unblocks everything else
2. **Parallelize AI_LEVERAGE_INFRA** — Run alongside PLP fixes (no dependencies)
3. **No scope drift** — Fix bugs before adding features (discipline)

### Short-Term (Next 2 Weeks)

1. **Enable VFS data flow** — Homepage VFS migration (SC4) unlocks dynamic content
2. **Complete component library** — Checkbox → other reusable UI components
3. **Add Playwright coverage** — Critical paths tested (PLP → PDP → Basket)

### Medium-Term (Month)

1. **Optimize performance** — Lighthouse CI targets (90+ all categories)
2. **FSM implementation** — Order lifecycle management (checkout flow)
3. **Admin dashboard** — (admin)/manager + packer interfaces

---

## 8. Strategic Bottleneck Analysis

### What Limits Throughput Now

| Bottleneck | Current Impact | Post-Sprints Impact |
|------------|----------------|---------------------|
| **Data inconsistency** (VFS) | PLP shows 0 products | Resolved — VFS fully functional |
| **Context rebuild** (10-30min/session) | Slow sprint starts | Instant via scripts/MCP |
| **Assumption-based debugging** | Wasted fixes (Lesson 4) | Data-first verification gate |
| **Shared component fragility** | Homepage regressions | Regression tests per change |
| **No reusable UI library** | Inline implementations | Checkbox → full component library |

### What Will Limit Throughput After

| Future Bottleneck | Mitigation Strategy |
|-------------------|---------------------|
| **Checkout flow complexity** | FSM pattern + Inngest queues |
| **Performance at scale** | Sanity CDN + Next.js cache |
| **Multi-user admin** | Role-based access + audit logging |
| **Real-time inventory** | WebSocket + optimistic updates |

---

## 9. Key Metrics Dashboard

### Current State Metrics

| Metric | Current | Target | Sprint |
|--------|---------|--------|--------|
| **Build status** | Unknown (needs baseline) | ✅ Pass | PLP_FIXES |
| **PLP products display** | ❌ 0 images | ✅ All images | PLP_FIXES SC1 |
| **Filter response time** | ❌ 5-10s | ✅ <100ms | PLP_FIXES SC2 |
| **Filter accuracy** | ❌ 0 results | ✅ Correct matches | PLP_FIXES SC3 |
| **Sort functionality** | ❌ Non-functional | ✅ Working | PLP_FIXES SC4 |
| **PDP load** | ❌ Error | ✅ Product details | PLP_FIXES SC5 |
| **Homepage dynamism** | ❌ Hardcoded | ✅ VFS-driven | UI_POLISH SC4 |

### Post-Sprint Target Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| **End-to-end flow** | PLP → filter → sort → PDP → basket | Manual test |
| **Design system compliance** | 100% token usage | `grep -r "text-gray-" app/components` |
| **Component reusability** | Checkbox, Card, Grid shared | Component audit |
| **Sprint start time** | <5 min (context scripts) | Time measurement |
| **Debug efficiency** | 0 assumption-based fixes | Lesson tracking |

---

## 10. Appendix: Lesson Integration

### Critical Lessons from `_project/lessons/auto-lessons.md`

| Lesson | Prevention Codified | Workflow Updated |
|--------|---------------------|------------------|
| **Lesson 4** — Data assumption failure | Data Verification Gate mandatory | `debug.md` |
| **Lesson 6** — Schema-query mismatch | STOP at data layer, verify schema | `diagnostic-sprint.md` |
| **Lesson 3** — Pre-existing errors | Pre-Flight Checklist (build baseline) | `sprint.md` |
| **Lesson 5** — Protocol rigidity | Execution Mode flag (gate/continuous) | `implement.md` |

### Future Sprint Pre-Load

All future sprints must query `_project/lessons/INDEX.md` for relevant keywords before execution. Lessons 6-8 (GROQ/schema verification) are **mandatory pre-read** for any data-related diagnostics.

---

## Summary: Acceleration Path

**Current State:** 3 sprints spec-complete, ready for execution  
**Blockers:** None (infrastructure healthy)  
**Critical Path:** PLP_FIXES SC3 → SC1-5 → UI_POLISH  
**Parallel Track:** AI_LEVERAGE_INFRA (can run anytime)  
**Est. Time to Professional MVP:** 36-48 hours of focused execution  
**Risk Level:** Low (detailed specs, clear DoDs, regression containment)

**Next Action:** Execute `PLP_FIXES` starting with SC3 (Filter Logic).
