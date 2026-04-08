# Research: Fastest Testing for URL Parameters & GROQ Filtering

**Date:** 2026-04-02  
**Scope:** Testing URL parameter parsing and GROQ query filtering in Next.js 15 + Sanity applications  
**Target Audience:** Pragmatic web developers needing rapid feedback loops  

## Research Scope Contract
- **Topic:** Efficient testing strategies for URL parsing and database query filtering
- **First Principles:** Tests must be fast to write, fast to run, and provide immediate value
- **Fundamentals:** URL param parsing, GROQ query construction, filter logic verification
- **Scope Boundary:** Not covering full E2E integration tests, not covering UI component testing
- **Target Audience:** Developers working on similar filter/debug workflows
- **Decay Risk:** Medium - Next.js 15 searchParams API may evolve

## Multi-Source Triangulation

### Source 1: Next.js Official Documentation
**URL:** https://nextjs.org/docs/app/guides/testing/vitest  
**Credibility:** Canonical  
**Date:** 2025  
**Key Claim:** Vitest + React Testing Library for unit tests, Playwright for async Server Components  
**Verification Status:** ✅ Verified  

### Source 2: Sanity Studio Vision Tool  
**URL:** https://www.sanity.io/docs/sanity-studio-quickstart/querying-content-with-groq  
**Credibility:** Official  
**Date:** 2025  
**Key Claim:** Vision tool allows instant GROQ query testing with authenticated session  
**Verification Status:** ✅ Verified  

### Source 3: Community Consensus (Reddit/Stack Overflow patterns)
**Credibility:** Medium  
**Key Claim:** Server Components testing still challenging, URL param testing requires mocking searchParams promise  
**Verification Status:** ⚠️ Context-Dependent  

## First Principles Analysis

### Core Problem Being Solved
How to test data flow from URL → parsing → query construction → database results without full stack overhead.

### Underlying Constraints
1. Next.js 15 searchParams are async (promises) in Server Components
2. GROQ queries require actual Sanity dataset for meaningful testing
3. Filter logic has edge cases (comma separation, OR vs AND logic)
4. Tests must be faster than manual debugging (our 15min console approach)

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Console debugging | Instant feedback | Manual, no regression protection | Live debugging sessions |
| Unit tests | Automated, fast | Requires mocking setup | Repeated verification |
| Vision tool | Real data, instant | No test automation | Query development |
| E2E tests | Full coverage | Slow, brittle | Pre-deployment verification |

## Code Fundamentals

### Fundamental: URL Parameter Parsing
**Claim:** Next.js 15 searchParams are promises in Server Components

**Verification:**
- [x] Located in our codebase: `app/(store)/products/[...slug]/page.tsx`
- [ ] Test created: Need to create
- [x] Source inspected: Next.js docs confirm promise API

**Actual Behavior:**
```typescript
const query = await searchParams; // Must await the promise
const filters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];
```

**Edge Cases:**
1. Comma-separated values: `brand:Hifiman,brand:Focal`
2. Empty arrays vs undefined
3. Multiple same-key parameters

### Fundamental: GROQ Query Construction
**Claim:** Vision tool provides instant query testing

**Verification:**
- [x] Located in our codebase: `sanity/lib/products/getProductsByVfsKeys.ts`
- [ ] Test created: Need to create  
- [x] Source inspected: Sanity docs confirm Vision availability

**Actual Behavior:**
- Paste query into `http://localhost:3000/studio/vision`
- Click Fetch to see results with authenticated data
- Cannot test URL parsing logic here

## Best Practices (Verified)

### Practice: Unit Test URL Parsing Logic
**Consensus:** High - Vitest + React Testing Library

**Supporting Evidence:**
- Next.js official docs recommend Vitest
- Community patterns show jsdom environment works

**Counter-Evidence:**
- Server Components require special handling (async promises)

**Verdict:** ✅ Recommended for parsing logic, ⚠️ Context-Dependent for full Server Components

**When to Use:** Isolate parsing functions into separate modules for easy testing

### Practice: Use Vision Tool for GROQ Development
**Consensus:** High - Official Sanity recommendation

**Supporting Evidence:**
- Sanity docs explicitly recommend Vision for query testing
- Uses authenticated session (sees drafts)

**Counter-Evidence:**
- No automated test coverage

**Verdict:** ✅ Recommended for development, supplement with unit tests

**When to Use:** During query development, not for regression testing

## Common Solutions Landscape

### Solution: Manual Console Debugging
**Prevalence:** Common (our current approach)
**Type:** Workaround

**Pros:**
- Zero setup time
- Works with real data
- Immediate feedback

**Cons:**
- No regression protection
- Manual cleanup required
- Not scalable

**Real-World Pain Points:**
- Forgets to remove console.log statements
- Cannot test edge cases systematically

**Recommendation:** Use for initial debugging, transition to tests

### Solution: Unit Tests with Mocked Data
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Automated regression protection
- Fast execution
- Can test edge cases

**Cons:**
- Requires setup time
- Mock data may diverge from reality

**Real-World Pain Points:**
- Mock maintenance overhead
- Tests become brittle

**Recommendation:** Use for stable parsing logic

### Solution: Integration Tests with Test Database
**Prevalence:** Niche
**Type:** Professional

**Pros:**
- Tests with real data shape
- End-to-end verification
- Reliable regression protection

**Cons:**
- Complex setup
- Slower execution
- Requires test data management

**Real-World Pain Points:**
- Test environment drift
- Data seeding complexity

**Recommendation:** Use for critical paths, not for rapid development

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Next.js 15 searchParams are promises | Next.js docs | Documentation |
| Vision tool allows instant GROQ testing | Sanity docs | Documentation |
| Vitest works for client components | Next.js docs | Documentation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Server Components are easily testable | Reddit posts show Promise rendering issues | Modified - requires special handling |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Next.js searchParams API | High | 2025-12 |
| GROQ syntax | Low | 2026-12 |
| Vitest Server Component support | Medium | 2025-09 |

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Extract URL parsing to pure function | Easier unit testing, no Server Component complexity | Create `parseFilterParams` utility |
| Use Vision tool for GROQ development | Fastest feedback loop with real data | Development workflow |
| Add unit tests for filter logic edge cases | Prevent regressions like comma-separated bug | Test suite |
| Keep console debugging for live issues | Still fastest for unknown problems | Debug workflow |

### Immediate Actions
1. Create `tests/lib/filters/urlParams.test.ts` for parsing logic
2. Extract `parseFilterParams` function from page component
3. Create test cases for comma-separated filters
4. Add GROQ query examples to documentation

### Recommended Testing Workflow

#### Phase 1: Development (Fastest)
```bash
# 1. Develop GROQ queries in Vision tool
open http://localhost:3000/studio/vision

# 2. Test URL parsing with console logs (current approach)
# Add console.log, visit URL, observe output
```

#### Phase 2: Stabilization (Medium)
```bash
# 3. Extract parsing logic to testable function
# 4. Write unit tests for edge cases
npm run test

# 5. Remove console logs
```

#### Phase 3: Production (Slow but Thorough)
```bash
# 6. Add integration tests with test database
npm run test:e2e
```

### Quickest Implementation Strategy

**Time to First Test: 5 minutes**
```typescript
// tests/lib/filters/urlParams.test.ts
import { describe, it, expect } from 'vitest';
import { parseFilterParams } from '@/lib/filters/urlParams';

describe('parseFilterParams', () => {
  it('handles comma-separated filters', () => {
    const params = new URLSearchParams('f=brand:Hifiman,brand:Focal');
    const result = parseFilterParams(params);
    expect(result.filters).toEqual(['brand:Hifiman', 'brand:Focal']);
  });
});
```

**Setup Time: 2 minutes (if Vitest already configured)**
**Execution Time: <1 second**
**Coverage:** Edge cases, regression protection

This approach gives us the fastest path from our current console debugging to automated tests while maintaining the rapid feedback loop we need for development.
