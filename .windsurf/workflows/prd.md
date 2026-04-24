---
description: Generate simplest possible PRD in /docs folder - verified ground first, then scope, solution design, red phase tests, build order
---

# /prd Command - Simplest Possible PRD Generation

**Role:** Generate a single, simple PRD in /docs folder for a feature.

**Output:** PRD file at `docs/[feature-name]/prd.md` with:
- What Is (verified ground - 2-3 sentences, reality-based facts only)
- What Should Be (verified ground - 2-3 sentences, simplest possible target)
- Scope statement (pure user flow, no technical details)
- Solution design (max 4 validated DoD items)
- Red phase tests (max 2 realistic test specs)
- Build order (max 2 atomic RGR steps with clear separation)

**Total DoD Items:** Max 8 (4 solution + 2 tests + 2 build steps)

**Critical Order:** Verify current state first, then verify target state, then define requirements. No requirements before verification.

---

## Execution Steps

### Step 1: Verify "What Is" (Current State)
Use tools to collect evidence about current state: read_file, grep, bash commands. Cite file paths, line numbers, command outputs. Reality-based facts only, no assumptions. use /verify to verify each point.

### Step 2: Verify "What Should Be" (Target State)
Research relevant best practices, core basics and common solutions. Process and design simplest possible, robust, professional solution. Verify it. Is  design simplest possible, robust, professional solution? Yes/no. If no, repeat.

### Step 3: Generate PRD Content
Use `.windsurf/workflows/prd-template.md` to generate:
- **Scope Statement:** Complete user flow with every step verified - "user does step 1 -> system shows result 1 -> user does step 2 -> system shows result 2" - no steps skipped
- **Solution Design:** Pure english, max 5 sentences, simplest possible validated solution design.
- **Red Phase Tests:** Max 2-8 items, realistic test specs with exact arrange, assert, act delineated. use /verify for each test. Must be DoD item [ ] format. Must be simplest possible.
- **Build Order:** Max 2-8 items, atomic RGR sequence with NO scope creep at any step. must /verify sequence order is cover and move: each step builds verified ground for the next step. /verify that. must be simplest possible. each step applies red phase test as specification (input/output, not mixing implementation with tests) - implement - run test to verify.

**Critical Rules:**
- Red test step = ONLY writing red test, never implementation
- Build order steps start from verified ground
- Each step is atomic and Cover & Move validated
- Total DoD items ≤ 8

### Step 4: Save to /docs
Create directory: `docs/[feature-name]/`
Save file: `docs/[feature-name]/prd.md`

### Step 5: Verify Simplicity
Run rabbit-hole-check on the PRD:
1. Is this SIMPLE? (≤ 8 DoD items, <5 min to explain)
2. Is this CLEAR? (Exact start/end states, verifiable outcomes)
3. Does this start from VERIFIED GROUND? (Previous step confirmed, no assumptions)

If any answer is NO, revise PRD until all answers are YES.

---

