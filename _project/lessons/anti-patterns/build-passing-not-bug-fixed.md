# anti-patterns: Build Passing Equals Bug Fixed

**Date:** 2026-03-31  
**Source:** Debug — Product images not showing on PLP cards  
**Severity:** High  
**Frequency:** Recurring (common debugging trap)  
**Status:** Active

---

## The Anti-Pattern

**The trap:** Assuming that because `npm run build` passes, the bug is fixed.

**What actually happened:**
- Product cards showed placeholder instead of images
- `/debug` executed, fix attempted
- Build passed
- Images still not rendering (bug persisted)
- Time wasted: ~20 minutes of ineffective "fixing"

## Why This Is Dangerous

Build passing only verifies:
- ✅ Syntax is valid
- ✅ Types compile
- ✅ Static analysis passes

Build passing does NOT verify:
- ❌ Logic is correct
- ❌ Data flows as expected
- ❌ Runtime behavior matches intent
- ❌ Bug is actually fixed

## The Root Cause of the Trap

**Assumption over verification:**
- Assumed image data structure issue (`_ref` vs `_id`) without verifying actual Sanity response
- Changed code based on hypothesis rather than evidence
- Never confirmed what data Sanity actually returned

**Verification gaps:**
- Added debug logging but never executed code to see logs
- Never checked browser Network tab for Sanity response
- No runtime data verification

## Correct Approach

**Data-First Debugging Protocol:**

```markdown
### Before any code changes:
1. Identify where actual data flows (GROQ query → component)
2. Add temporary data logging/rendering to see actual values
3. Verify hypothesis against real data before implementing fix
4. Verify fix with runtime check, not just build
```

**Example implementation:**
```typescript
// Add to component for immediate visibility
console.log('[Component] raw data:', data);

// Or render data to DOM temporarily
<pre>{JSON.stringify(data, null, 2)}</pre>

// Or check Network tab for actual API response
```

## Prevention Checklist

**When debugging:**
- [ ] See actual data before hypothesizing
- [ ] Verify at each layer: API response → props → component render
- [ ] Build passing ≠ bug fixed — always verify runtime
- [ ] Add temporary instrumentation if data is invisible

## Applicability

**When to apply this lesson:**
- Debugging any data-related issue
- UI not rendering as expected
- Working with external APIs (Sanity, CMS, etc.)
- "Fix" implemented but problem persists

**Keywords for retrieval:**
- "debug"
- "assumption"
- "data"
- "verification"
- "build"
- "runtime"
- "logging"

**Related lessons:**
- [diagnostic-query-mismatch.md](../failures/diagnostic-query-mismatch.md) — Complete tracing
- [groq-reference-syntax.md](../failures/groq-reference-syntax.md) — Schema verification

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/anti-patterns/` — This file
- [x] INDEX.md — Keywords added
- [ ] `/debug` workflow — Add data verification step

**Date integrated:** 2026-03-31
