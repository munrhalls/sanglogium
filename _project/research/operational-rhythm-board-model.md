# Operational Rhythm: The Board State Model

## Research Scope Contract

- **Topic:** A chess-inspired operational framework for AI-assisted web development in real-time
- **First Principles:** 
  1. You cannot trust your mental model of the codebase — only verified behavior counts
  2. Every change has a "position after" that either increases or decreases optionality
  3. Time estimates are unreliable; state transitions are verifiable
- **Fundamentals:** Build compilation, runtime rendering, test verification
- **Scope Boundary:** Framework design only; no implementation changes to checkout flow
- **Target Audience:** Developer using Windsurf IDE with AI assistance
- **Decay Risk:** Medium — framework must adapt to project state changes

---

## Phase 1: Intelligence Gathering — Current Position

### Experimental Data (Ground Truth)

**Experiment 1: Does the project compile?**
```bash
npx next build --no-lint
```
Result: ✅ **SUCCESS** (exit code 0, 85 seconds, 45/45 static pages generated)
Conclusion: Code is structurally valid. TypeScript compiles. No syntax errors in checkout pages.

**Experiment 2: Does lint work?**
```bash
npx eslint app/\(store\)/checkout/payment/page.tsx --max-warnings=0
```
Result: ❌ **BROKEN** — ESLint config error: `no-undef` rule has invalid `"allow"` property
Conclusion: Linting infrastructure is misconfigured. Cannot use lint as quality gate.

**Experiment 3: What is the checkout test infrastructure state?**
File: `app/(test)/checkout-seed/route.ts` line 17: guards against `NODE_ENV === "production"`
File: `.env.local` line 1: `NODE_ENV=production`
Conclusion: Test seed route is **dead**. Cannot seed checkout sessions for local testing.

**Experiment 4: What do the beads say is the highest priority?**
```bash
bd ready
```
Result: 20 open issues. Top 4 P1:
1. Security: Stripe idempotency keys
2. Basket → address page iron-session transition
3. Production UI implementation
4. Auto-select cheapest carrier logic

---

## Phase 2: First Principles Analysis

### Core Problem Being Solved

In AI-assisted web development, the developer's internal model of "what works" diverges from reality. The AI amplifies this divergence by confidently generating code that may or may not fit the actual architecture. The operational rhythm must **close the gap between mental model and verified state** faster than the gap grows.

### Underlying Constraints

1. **Hidden state**: You cannot see the full system state at once (env vars, session state, API credentials)
2. **Toolchain fragility**: Build tools, linters, and test runners can fail independently of the code
3. **Architecture drift**: Code evolves; tests and docs may reference deleted patterns
4. **AI hallucination**: The AI may reference non-existent files, APIs, or patterns

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Fix lint first | Clean codebase | May not unblock runtime | Lint is blocking build |
| Fix runtime first | User-facing progress | May build on unstable base | No compile errors, page broken |
| Fix tests first | Regression safety | May test wrong architecture | Tests verify current code |
| Verify before fix | No wasted effort | Takes time upfront | Unknown state |

### Failure Modes

1. **Assumption cascade**: Believing "tests pass" → "code works" → "ship it" (tests may test deleted architecture)
2. **Tool confusion**: Running `tsc` triggers `eslint` → false failure → wasted debugging
3. **Env blindness**: Changing code when the real blocker is `NODE_ENV=production`

---

## Iteration 1: The Ground Truth Loop

### Framework

```
1. POSITION SCAN: What do I know is true right now?
   - Compile? (npm run build)
   - Runtime? (dev server + browser)
   - Tests? (relevant test files)

2. CANDIDATE MOVES: What single action could I take?
   - Fix a file
   - Change a config
   - Run a test
   - Verify a behavior

3. POSITION AFTER: For each move, what would I know?
   - Would compilation still pass?
   - Would the page render?
   - Would the test pass?

4. SELECTION: Pick the move with highest INFORMATION GAIN per EFFORT
   - "Effort" = number of files touched × risk of breakage
   - "Information gain" = new verified truths about the system

5. EXECUTE: Do the move

6. VERIFY: Did reality match expectation?
   - If yes: mark as GREEN (verified working)
   - If no: mark as RED (known broken, needs fix)
   - If untested: mark as YELLOW (unverified)

7. LOOP: Return to step 1
```

### Experimental Test of Iteration 1

Applied to current project:
- Position scan: Build passes ✅, Lint broken ❌, Seed route dead ❌
- Candidate moves: Fix lint config, fix NODE_ENV, fix tests, add idempotency keys
- Selection by information gain: Fixing NODE_ENV → enables seed route → enables runtime verification of ALL checkout guards
- Execute: Would require editing `.env.local` line 1
- Position after: Seed route works → can test guards → know if payment page actually renders

**Verdict**: Iteration 1 works but has a flaw. "Information gain per effort" is still vague. Need a more concrete evaluation function.

---

## Iteration 2: The Three-Layer Gate

### Insight from Iteration 1

The "position" has three independent dimensions. You cannot verify runtime if compilation fails. You cannot trust tests if runtime is broken. The layers are **ordered dependencies**.

### Framework

```
Layer 1 — COMPILE GATE
  Check: npm run build (or npx tsc --noEmit)
  State: GREEN (pass) / RED (fail)
  If RED: fix compilation errors ONLY. Do not touch runtime or tests.
  If GREEN: proceed to Layer 2.

Layer 2 — RUNTIME GATE
  Check: Start dev server, visit the page/feature in browser
  State: GREEN (renders correctly) / RED (error/crash/404) / YELLOW (untested)
  If RED: identify the FIRST error. Fix only that error.
  If GREEN: proceed to Layer 3.

Layer 3 — VERIFICATION GATE
  Check: Run relevant test suite (unit, integration, e2e)
  State: GREEN (pass) / RED (fail) / GRAY (stale — tests test deleted code)
  If GRAY: tests need rewriting to match current architecture.
  If RED: fix the failing test or the code it tests.
```

### Experimental Test of Iteration 2

Applied to checkout payment page:
- Layer 1: `npm run build --no-lint` → ✅ GREEN (compiles)
- Layer 2: Cannot test because seed route requires `NODE_ENV=development` → 🔴 RED
- Layer 3: Tests reference `PaymentPageClient`, `sessionStorage`, `basketReservation` → ⚪ GRAY (stale)

**Next move by framework**: Layer 2 is RED → fix the blocker → change `.env.local` NODE_ENV
**Position after**: Seed route works → Layer 2 becomes testable → can verify guards

**Verdict**: Iteration 2 is better. The layers are clear. But "fix the blocker" is still vague. What if there are multiple blockers? Need prioritization within a layer.

---

## Iteration 3: The Board State Model (Final)

### Core Insight

In chess, you evaluate moves by asking: "After this move, what is my position?" You don't estimate time. You estimate **optionality** — does this move open lines, protect the king, control center?

In web development, the equivalent is: **"After this change, what becomes possible that was impossible before?"**

### The Board

The board is your codebase + environment + toolchain. Each "square" is a capability:

| Capability | State | Meaning |
|-----------|-------|---------|
| Project compiles | 🟢 GREEN | Verified: `npm run build` passes |
| Lint works | 🔴 RED | Verified: config error prevents lint |
| Payment page renders | 🟡 YELLOW | Unverified: cannot test (seed route dead) |
| Payment guards work | 🟡 YELLOW | Unverified: no runtime access |
| Shipping page renders | 🟡 YELLOW | Unverified: cannot test |
| Seed route works | 🔴 RED | Verified: `NODE_ENV=production` blocks it |
| Tests verify current code | ⚪ GRAY | Verified: tests reference deleted architecture |
| Idempotency keys added | 🟡 YELLOW | Unverified: issue open, not implemented |

### The Opposition

The opposition is **entropy** — everything that makes the system less knowable:
- Stale tests that test deleted code
- Misconfigured env vars
- Broken lint config
- Outdated documentation
- AI-generated code that doesn't match architecture

**Opposition pieces**:
- The False Positive (tests pass but code is wrong)
- The Ghost Dependency (code references a file that was moved)
- The Silent Breaker (change works in dev, fails in prod)
- The Time Trap ("this will only take 5 minutes" — it takes 2 hours)

### Candidate Move Evaluation

Instead of "time needed," evaluate moves by **three verifiable metrics**:

1. **UPSTREAMNESS** (how close to the root of the dependency chain?)
   - Fix `NODE_ENV` → enables seed route → enables ALL checkout testing
   - Add idempotency keys → important but doesn't unblock anything

2. **CERTAINTY DELTA** (how much does this move increase verified knowledge?)
   - Fix `NODE_ENV` → verify seed route → now know if guards work (high delta)
   - Add idempotency keys → verify one Stripe call (low delta)

3. **REVERSIBILITY** (can I undo this if it breaks something?)
   - Edit `.env.local` → trivial to revert
   - Refactor payment page → may break downstream pages

### The Operational Rhythm

```
BEFORE ANY CODING SESSION:

1. BOARD SCAN (5 minutes)
   Run: npm run build --no-lint
   Check: Did it pass?
   → If RED: fix compilation. Session ends when build passes.
   → If GREEN: scan the board for RED and YELLOW squares.

2. MOVE GENERATION (5 minutes)
   List every RED and YELLOW square relevant to your goal.
   For each, rate: Upstreamness (1-3), Certainty Delta (1-3), Reversibility (1-3)

3. MOVE SELECTION (2 minutes)
   Pick the move with highest: (Upstreamness × Certainty Delta) / Risk
   Risk = (Files touched × Downstream dependents)

4. EXECUTE (variable)
   Make the change. Touch MINIMUM files.

5. POSITION VERIFICATION (5 minutes)
   Re-run the gate that was RED or YELLOW.
   Did it turn GREEN?
   → YES: Document in commit. Move to next square.
   → NO: Revert. Document blocker. End session.

6. COMMIT (2 minutes)
   Message: "fix(scope): what changed — verified [gate] now GREEN"
   Tag: DoD:1 (verified), DoD:0 (unverified)
```

### Applying to Current Checkout Position

**Goal**: Make payment page verifiable.

Board state:
| Square | State | Blocker |
|--------|-------|---------|
| Build | 🟢 | None |
| Lint | 🔴 | Config error |
| Seed route | 🔴 | NODE_ENV=production |
| Payment render | 🟡 | Seed route dead |
| Guard test | 🟡 | No runtime access |
| Tests | ⚪ | Test deleted architecture |

Candidate moves:

| Move | Upstream | Certainty | Reversibility | Files | Score |
|------|----------|-----------|---------------|-------|-------|
| Fix NODE_ENV | 3 (unblocks all checkout) | 3 (enables full runtime test) | 3 (1-line revert) | 1 | 27/1 = 27 |
| Fix lint config | 1 (lint only) | 1 (lint doesn't affect runtime) | 3 | 1 | 3/1 = 3 |
| Rewrite tests | 2 (tests verify code) | 2 (but tests may still fail) | 2 | 5+ | 8/5 = 1.6 |
| Add idempotency | 1 (single feature) | 1 (doesn't unblock anything) | 3 | 1 | 3/1 = 3 |

**Selected move**: Fix `NODE_ENV` in `.env.local`
**Position after**: Seed route works → Payment page becomes testable → Can verify guards → Now know if payment page actually renders or has runtime errors

### Why This Satisfies the Criteria

| Criterion | How The Board State Model Satisfies It |
|-----------|----------------------------------------|
| **Actionable** | Every step is a concrete command (run build, check gate, edit file) |
| **Extremely relevant** | Directly derived from the actual checkout codebase state |
| **Never destabilizing** | "Reversibility" metric prevents risky moves; abort if verification fails |
| **Experimentally provable** | Build was run (85s, exit 0); lint error was reproduced; env misconfig was found |
| **Upstream-first** | "Upstreamness" metric prioritizes root blockers |
| **Simplest possible** | Three colors (GREEN/RED/YELLOW), three metrics, one formula |

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Project compiles | `npm run build --no-lint` exit 0, 85s | Terminal command |
| Lint is broken | ESLint `no-undef` config error | Terminal command |
| Seed route blocked | `.env.local` line 1 = `NODE_ENV=production` | File read |
| Tests are stale | `tests/checkout/payment/page.test.tsx` mocks `useRouter` + `sessionStorage` | File read |
| Build triggers lint on tsc | `npx tsc --noEmit` ran ESLint unexpectedly | Terminal command |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "All checkout code is broken" | Build passes; code compiles | ❌ FALSIFIED — code is structurally valid |
| "Tests are completely useless" | May still catch some errors | ⚠️ PARTIAL — tests are stale but not all wrong |
| "Fixing lint is most important" | Lint doesn't block build or runtime | ❌ FALSIFIED — lint is nice-to-have, not critical path |

---

## Synthesis: Actionable Takeaways

### For This Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Change `NODE_ENV` to `development` in `.env.local` | Unblocks ALL checkout testing; highest upstreamness score | Edit line 1 of `.env.local` |
| Add `CHECKOUT_SEED_SECRET` | Required for seed route to respond | Add to `.env.local` |
| Deprecate old payment tests | They test deleted architecture | Mark files as stale, don't run them |
| Fix lint config later | Not on critical path; can use `--no-lint` for now | Low priority |

### The Framework Itself

| Decision | Rationale |
|----------|-----------|
| Use color-coded board state | Visual, intuitive, no time estimates needed |
| Evaluate by optionality (what becomes possible) | More reliable than time estimates |
| Three-layer gates (compile → runtime → verify) | Prevents assumption cascades |
| Abort if verification fails | Prevents building on broken state |
| Commit after each GREEN square | Creates rollback points |

### Open Questions

1. Does the seed route actually work after fixing `NODE_ENV`? (Needs runtime test)
2. Does the payment page render after seeding a valid session? (Needs browser test)
3. Do the funnel guards redirect correctly? (Needs manual navigation test)

---

## How to Use This Tomorrow

1. Open Windsurf
2. Run: `npm run build --no-lint`
3. If GREEN: open `_project/research/operational-rhythm-board-model.md` → Section "Applying to Current Checkout Position"
4. Pick the highest-scoring move
5. Execute. Verify. Commit.
6. Update the board state in a scratch file.

**Never start coding without a board scan.**
