# Pre-Flight Infrastructure Check — Baseline Verification

**Date:** 2026-03-31
**Source:** AI-Leverage Infrastructure Sprint
**Severity:** High
**Frequency:** Every Sprint

## The Problem
Build failure during sprint verification caused 5 min false correlation investigation. Was the error from sprint work or pre-existing infrastructure? Without baseline knowledge, every build error triggers reactive debugging.

## Root Cause
Skipped baseline build verification before sprint start. Sprint spec included Pre-Flight Checklist (SC5) but didn't execute it as first step. Build failure was pre-existing JSON parse error in catalogue-index generation, completely unrelated to infrastructure sprint work.

## The Lesson
**Always verify baseline before sprint work.** Pre-existing infrastructure errors masquerade as sprint regressions, wasting 15+ min per incident on false correlation investigations.

## Prevention Rule

### Sprint Specification Requirement
Every sprint MUST include as **DoD 0** (before all other DoDs):

```markdown
### DoD 0: Pre-Sprint Baseline
- [ ] Run `npm run build` and document result
- [ ] If build fails: Document pre-existing failures, mark as KNOWN ISSUE
- [ ] If build passes: Proceed with confidence
```

### Pre-Flight Checklist (from implement.md)
1. **Branch Check:** Verify on correct branch (`git status`)
2. **Baseline Build:** Run `npm run build` and document result
   - If build fails: Document pre-existing failures before sprint work
   - If build passes: Proceed with confidence
3. **Scope Lock:** Confirm no other sprint work in progress

## Applicability

**When to apply:**
- Every sprint start
- Every debug session start
- Before any significant work unit

**When violations occur:**
- Build error appears mid-sprint
- Time wasted verifying if error is "yours"
- False correlation investigations
- Reactive instead of proactive verification

## Historical Evidence

- `auto-lessons.md:79-126` — Lesson 3: 15 min wasted on false correlation
- This sprint: 5 min wasted verifying pre-existing JSON parse error

## Integration

**Updated:** `.windsurf/workflows/implement.md` Phase 1 — Pre-Flight Checklist subsection added

**Keywords:** sprint, baseline, build, verification, pre-flight, infrastructure, regression, false-correlation
