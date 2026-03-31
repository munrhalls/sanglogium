# failures: Debug Data Assumption

**Date:** 2026-03-31  
**Source:** Debug — Product images not showing on PLP cards  
**Severity:** High  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Product cards displayed placeholder instead of actual product images. `/debug` command executed but fix failed — images still not rendering.

**Assumed:** Image data structure issue (`_ref` vs `_id`)

**Reality:** Never verified what data Sanity actually returned. True root cause unknown — could be: missing image in CMS, GROQ query not returning image field, image URL construction failure, or CDN issue.

## Root Cause

**Assumption over verification:**
- Modified `ProductImage.tsx` to handle both `_ref` and `_id` properties
- Never confirmed what data Sanity actually returned
- No data verification at any point in the chain

**Bottlenecks:**
- **Time sink:** ~15 minutes reading component chain (ProductCard → ProductImage → urlFor → getProductsByVfsKeys) without testing actual data
- **No data verification:** Added debug logging but never executed code to see logs
- **Build verification ≠ fix verification:** Build passed but bug persisted

## The Fix (What Was Needed)

```typescript
// Add to ProductImage.tsx for immediate visibility
console.log('[ProductImage] raw image:', image);

// Or: Check browser Network tab for Sanity response
// Or: Add temporary render of image JSON to DOM to see actual data
<pre>{JSON.stringify(image, null, 2)}</pre>
```

**Actual fix requires:**
1. See what Sanity returns
2. Identify where data flow breaks
3. Fix the actual issue (not assumed issue)

## Prevention

**Add to /debug protocol Phase 1:**

```markdown
### Before any code changes:
1. Identify where actual data flows (GROQ query → component)
2. Add temporary data logging/rendering to see actual values
3. Verify hypothesis against real data before implementing fix
```

**Critical distinction:** Build passing ≠ Bug fixed. Need runtime verification.

## Applicability

**When to apply this lesson:**
- Debugging UI not rendering expected data
- Working with external APIs/CMS data
- Build passes but functionality broken
- Any assumption about data structure

**Keywords for retrieval:**
- "debug"
- "assumption"
- "data"
- "verification"
- "build"
- "runtime"
- "sanity"
- "image"
- "logging"

**Related lessons:**
- [diagnostic-query-mismatch.md](diagnostic-query-mismatch.md) — Complete tracing
- [build-passing-not-bug-fixed.md](../anti-patterns/build-passing-not-bug-fixed.md) — Build vs runtime

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] INDEX.md — Keywords added
- [ ] `/debug` workflow — Add data verification step
- [ ] Test coverage — Add integration test with real image data

**Date integrated:** 2026-03-31
