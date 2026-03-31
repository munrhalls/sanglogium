# Prompting: Signal Density Optimization for Opus

**Date:** 2026-03-31
**Source:** AI-Leverage Workflow Optimization Reflection
**Severity:** Critical
**Frequency:** Every sprint — applies to all Opus invocations

---

## The Problem

Opus token costs are high, but the real waste is **discovery tokens**. When Opus reads raw research (8000 tokens) to write a sprint doc, most input is noise — generic knowledge, unverified patterns, prose explanations.

**Evidence:** `CORE_PRIORITY_LEARNING.MD:184-194`, `THE CORE GROUND FACTOR.md`

**Measured Impact:** 
- 90 min actual output in 12 hours = 7.5% efficiency
- Re-entry cost per agent window = 10-30 min
- Token cost inflated 10× by undigested input

---

## Root Cause

**Role confusion:** Opus was doing discovery (reading docs, scanning code, extracting patterns) when it should only do synthesis (deciding scope sequence, structuring sprint doc).

Discovery is cheap — any model can do it. Synthesis under constraints is where Opus earns its cost.

---

## The Fix

### `/compress` Command Protocol

**Purpose:** Pre-digest all context before Opus sees it

**Execution:**
```bash
# Cheap model (Kimi, Haiku, free tier) runs one job:
# 1. Read all raw research output
# 2. Read all relevant codebase files
# 3. Output single compressed markdown

/compress
  Input: 8000 tokens of raw research + audit + codebase
  Output: 800 tokens of load-bearing facts only
```

**Compression Rules:**
- No prose, no explanation
- Only verified precedents from live components
- No suggested patterns, no hallucinated tokens
- Token names must be component classes (from addComponents), not utilities
- File paths must exist (verified)
- GROQ shapes from live queries only

**Example Output:**
```markdown
## Compressed Context for PLP Sprint

### Intent
Products discovery UI: grid → filters → pagination

### Design System Ground Truth
- card surface: `bg-surface-card` (verified in ProductCard.tsx)
- grid gap: `gap-4` (verified in PLPPage.tsx)
- typography: `text-body-01` (from config)

### Codebase Ground Truth
- analogous: `app/(store)/brand/[brand]/page.tsx`
- GROQ pattern: `*[_type == "product" && brand == $brand]`
- file path: `app/(store)/products/page.tsx` (exists)

### Constraints
- Server Component default
- Pagination: `?page=1&limit=12`
- No client-side fetch
```

---

## Prevention (Actionable Rules)

### Rule 1: Opus Never Discovers
**Before any Opus call:**
```bash
/compress → compressed_context.md
/sprint [with compressed_context.md as input only]
```

### Rule 2: Signal Density > Information Volume
**Ground factor formula:**
```
Signal Density = (Load-bearing facts) ÷ (Time to produce context)
```

Maximize this ratio. 800 dense tokens > 8000 scattered tokens.

### Rule 3: Cheap Model = Extraction, Opus = Decision
| Task | Model | Cost |
|------|-------|------|
| Read docs, scan code, extract patterns | Kimi/Haiku/Local | ~$0 |
| Decide scope sequence, structure sprint | Opus | ~$0.50-2.00 |
| Execute sprint (Cascades) | Sonnet/Haiku | ~$0.10-0.50 |

---

## Applicability

**When to apply:**
- Every sprint requiring Opus synthesis
- Any research output > 1000 tokens
- Multi-file codebase context needed
- Token budget constraint active

**Keywords:** ["signal-density", "token-cost", "opus", "compression", "cheap-model", "discovery", "synthesis", "ground-factor"]

---

## Integration with /learn

After `/compress` + `/sprint` execution:
```bash
/learn
  Capture: Did compression eliminate hallucinated tokens?
  Capture: Was Opus output quality identical with 10× less input?
  Capture: Did re-entry cost reduce with denser context?
```

---

## Compound Effect

**Per-sprint savings:**
- Token cost: 10× reduction
- Re-entry time: 10-30 min → 0 (self-contained sprint doc)
- Review time: 5 min (dense context = faster verification)

**Daily impact (3-5 sprints):**
- 1.5-3 hours reclaimed from cognitive overhead
- ~$5-10 saved in Opus tokens
- Faster review = faster ship

**Next work unit will benefit:** Pre-compressed context templates for VFS, Sanity, FSM, Checkout.
