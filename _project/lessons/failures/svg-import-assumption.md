# failures: SVG Import Assumption

**Date:** 2026-03-31  
**Source:** S7-BASKET-DESIGN-ALIGNMENT Sprint  
**Severity:** Medium  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Build failed with `Element type is invalid: expected string/class/function but got: object` on `/basket` page.

## Root Cause

`SegmentTitle.tsx` used direct SVG import:
```tsx
import LogoOrbit from "@/public/logo-orbit.svg";
<LogoOrbit className="h-8 w-8 text-brand-400" />
```

**Assumed SVGR was configured. It was not.**

**Bottleneck:** Sprint spec showed SVG component usage in Component 1 example without prerequisite check. Followed spec literally without verifying build tooling.

## The Fix

```tsx
// Before (broken):
import LogoOrbit from "@/public/logo-orbit.svg";
<LogoOrbit className="h-8 w-8 text-brand-400" />

// After (working):
import Image from "next/image";
<Image src="/logo-orbit.svg" alt="" width={32} height={32} className="h-8 w-8" />
```

**Fix duration:** ~2 minutes. 15 seconds to fix, rest was build verification.

## Prevention

**Add "Prerequisites Check" to sprint specs:**

```markdown
### Before Pass 3 Build Phase:
- [ ] Verify build tooling exists (SVGR, PostCSS plugins, etc.)
- [ ] Check next.config.js for required configurations
- [ ] Test one instance before replicating pattern
```

**For SVG imports specifically:**
- Check if SVGR is configured in `next.config.js`
- If unsure, use Next.js `Image` component instead
- Don't assume component imports work without verification

## Applicability

**When to apply this lesson:**
- Working with static assets (SVG, images)
- Using component imports for non-JS files
- Build fails with "expected string/class/function but got: object"
- Sprint specs show patterns without explicit prerequisite checks

**Keywords for retrieval:**
- "svg"
- "import"
- "svgr"
- "build"
- "nextjs"
- "image"
- "assumption"
- "prerequisite"

**Related lessons:**
- [functional-grouping.md](../patterns/functional-grouping.md) — Build tooling within groups

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] INDEX.md — Keywords added
- [ ] `/sprint` workflow — Add prerequisites check to Pass 3

**Date integrated:** 2026-03-31
