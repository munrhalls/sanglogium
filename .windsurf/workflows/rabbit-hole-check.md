---
description: Pre-flight check to prevent rabbit holes before starting work
---

# Rabbit Hole Prevention Protocol

**MANDATORY Pre-Flight Check (before ANY work):**

Answer these 3 questions. If ANY answer is NO, STOP and clarify/simplify:

1. **Is this SIMPLE?** (Can be explained in <5 minutes, minimal steps, no unnecessary complexity)
2. **Is this CLEAR?** (Exact start/end states, no ambiguity, verifiable outcomes)
3. **Does this start from VERIFIED GROUND?** (Previous step confirmed working, no assumptions)

## Rabbit Hole Definition

Work that is:
- NOT simple (takes >5 min to explain, unnecessary complexity)
- NOT clear (ambiguous start/end, unverifiable outcomes)
- Violates Cover & Move (starting from unverified ground or building in unclear order)

## When to Use

**ALWAYS before starting any work:**
- Feature implementation
- Bug fixing
- Sprint planning
- Architecture decisions
- Test writing
- Refactoring

## What to Do If Any Answer is NO

- **NOT SIMPLE:** Break into smaller steps, remove complexity, use existing infrastructure
- **NOT CLEAR:** Define exact start/end states, specify verifiable outcomes, remove ambiguity
- **NOT VERIFIED GROUND:** Verify previous step works, confirm dependencies, no assumptions

## PRD-Specific Check

For PRDs generated via `/prd` command, verify:

1. **"What Is" section present?** (2-3 sentences, reality-based facts only, no assumptions/overcomplications)
2. **"What Should Be" section present?** (2-3 sentences, simplest possible target, viability-focused, minimal changes)
3. **Total DoD items ≤ 8?** (4 solution + 2 tests + 2 build steps max)
4. **Red test steps separated from implementation?** (No scope creep - red test = ONLY test writing)
5. **Build order starts from verified ground?** (Each step atomic, Cover & Move validated)
6. **Each item simplest possible?** (No unnecessary complexity, <5 min to explain)

**Example PRD Check:**

**PRD:** "Checkout Queue with 10 DoD items, missing verification sections"

**Check:**
1. "What Is" section present? NO - Missing verification of current state
2. "What Should Be" section present? NO - Missing verification of target state
3. Total DoD items ≤ 8? NO - 10 items exceeds limit
4. Red test steps separated? YES
5. Build order verified ground? YES
6. Each item simplest possible? YES

**Result:** STOP. Add verification sections and reduce to max 8 DoD items.

**Example**

**Task:** "Add search to the product page"

**Check:**
1. Simple? NO - Too vague, multiple interpretations
2. Clear? NO - No exact start/end states
3. Verified ground? YES - Product page exists

**Result:** STOP. Clarify scope: "Add search bar to product page that filters by name using existing search API"

**Re-check:**
1. Simple? YES - Single feature, uses existing API
2. Clear? YES - Search bar + name filter
3. Verified ground? YES - Product page exists, search API exists

**Result:** PROCEED
