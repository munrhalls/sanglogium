# failures: Pre-Existing Infrastructure Errors

**Date:** 2026-03-31  
**Source:** S8-PERFORMANCE-TESTING-INFRASTRUCTURE Sprint  
**Severity:** Medium  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Build failed with `ENOENT: no such file or directory, open '.next/server/pages-manifest.json'` after sprint completion.

**Initial assumption:** Sprint caused the failure (false correlation)

**Reality:** Pre-existing Next.js configuration issue unrelated to S8 changes. Build infrastructure had cached/corrupted state.

## Root Cause

**Correlation vs Causation error:**
- Error appeared after sprint work
- Sprint work was syntactically correct and properly integrated
- Error was infrastructure-level (pages-manifest generation), not code-level

**Verification needed:**
1. All new files compile independently
2. Error persists on clean build without sprint changes
3. Error is infrastructure-level, not code-level

## The Fix

```bash
# Verification that sprint work was correct:
npx tsc --noEmit app/components/analytics/WebVitals.tsx --jsx react  # ✓ Pass
node -e "require('fs').existsSync('app/components/analytics/WebVitals.tsx')"  # ✓ Pass

# Root cause: Pre-existing build infrastructure issue
# Solution: Clean build + potential Next.js config fix (out of sprint scope)
rm -rf .next
npm run build  # Rebuild from clean state
```

## Prevention

**Add to /sprint protocol:**

```markdown
### Infrastructure Baseline Check

# Before sprint:
npm run build  # Document if this fails pre-sprint

# After sprint:
# If build fails, verify new files compile independently
# before blaming sprint work:
npx tsc --noEmit [new-file-1] --jsx react
npx tsc --noEmit [new-file-2] --jsx react
```

**Distinguish:**
| Sprint Regression | Pre-Existing Issue |
|-------------------|-------------------|
| Fails after sprint changes | Fails before sprint starts |
| Specific file/line error | Infrastructure/generic error |
| Reproducible with sprint files only | Occurs without sprint files |

## Applicability

**When to apply this lesson:**
- Build fails after sprint completion
- Error message references infrastructure (manifest, cache, config)
- Generic error not pointing to specific code
- Multiple potential causes exist

**Keywords for retrieval:**
- "build"
- "infrastructure"
- "cache"
- "regression"
- "clean-build"
- "baseline"
- "nextjs"
- "pages-manifest"

**Related lessons:**
- [es-module-commonjs-mismatch.md](es-module-commonjs-mismatch.md) — Code-level build issues

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] INDEX.md — Keywords added
- [ ] `/sprint` workflow — Add infrastructure baseline check

**Date integrated:** 2026-03-31
