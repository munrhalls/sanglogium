# COVER PROMPT: Evidence-Based Timeline Protection Protocol
## FOR: Sang-Logium 7-Milestone Sprint (6-7 Day Free Trial Window)
## CONTEXT: Next.js 15 + Sanity CMS + Stripe + Tailwind + TypeScript
## CONSTRAINT: Zero budget, maximize AI leverage, deterministic execution

---

## YOUR SITUATION

You have 6-7 days of Windsurf free trial remaining. You have 7 critical milestones to complete. You cannot afford timeline failure. This prompt implements the evidence-based cover from the curriculum.

**Your milestones (in dependency order):**
1. **M1:** Catalog item click → Products page shows correct products (VFS-based)
2. **M2:** Design system replication to Products page UI (full RWD)
3. **M3:** Design system replication to Basket feature
4. **M4:** Design system replication to Checkout UI
5. **M5:** Checkout robustness (tests, docs, hardening)
6. **M6:** User account management
7. **M7:** Authentication

**Your workflow:**
- `/sprint` command → Generates `.todo` sprint file with scope contracts, DoD layers
- `/implement` command → SWE 1.5 executes scope contracts deterministically
- You write the prompts, AI executes with zero deviation

---

## EXECUTION FRAMEWORK: THE 7 THEMES IN OPERATION

### THEME 1: APPETITE-BASED SHAPING (Execute Before Every Sprint)

**Rule:** Before any `/sprint` command, define the appetite. No exceptions.

**Format for each milestone:**

```
MILESTONE [N]: [Name]
CRITICAL PATH: [The one thing that must work]

APPETITE ALLOCATION:
- Total milestone appetite: [X hours]
- Hard deadline: [Day N, Time]
- Circuit breaker threshold: [50% of appetite = Y hours]
- Circuit breaker action: [Specific fallback]

SCOPE CONTRACTS (max 5 per milestone):
1. [Contract name] — Appetite: [hours] — Risk: [low/medium/high]
2. [Contract name] — Appetite: [hours] — Risk: [low/medium/high]
3. ...

KILL LIST (execute if time < 2 hours remaining):
1. Cut: [Specific feature]
2. Cut: [Specific feature]
3. Cut: [Specific feature]
4. CIRCUIT BREAKER: [Fallback behavior]
```

**Concrete example — M1 (Catalog → Products):**

```
MILESTONE 1: Catalog Item → Products Page
CRITICAL PATH: User clicks category → sees correct products

APPETITE ALLOCATION:
- Total milestone appetite: 6 hours
- Hard deadline: Day 1, 18:00
- Circuit breaker threshold: 3 hours
- Circuit breaker action: Hardcode category mapping, abandon VFS depth

SCOPE CONTRACTS:
1. VFS Data Integrity — 1h — Risk: medium (build script issues possible)
2. Slug-to-ID Resolution — 1h — Risk: low (code exists)
3. Descendant Key Unrolling — 1h — Risk: low (code exists)
4. GROQ Query Integration — 2h — Risk: medium (GROQ syntax issues possible)
5. E2E Verification — 1h — Risk: low (test execution)

KILL LIST:
1. Cut: Deep category nesting (use top-level only)
2. Cut: Advanced filtering on products page
3. Cut: Pagination (show all products)
4. CIRCUIT BREAKER: Hardcode 3 category mappings, defer full VFS
```

**Violation = timeline death:** If you start a sprint without defining appetite and circuit breaker, you accept that any scope contract can consume unlimited time. This kills timelines.

---

### THEME 2: FIXED TIME, VARIABLE SCOPE (Enforce Ruthlessly)

**Rule:** The deadline is fixed. The scope is variable. This is not negotiable.

**Must/Should/Won't Protocol (write before every milestone):**

```
MILESTONE [N]: [Name]

MUST (Ship blockers — if not done, milestone fails):
□ Core functionality works (define specifically)
□ Critical path tested
□ No breaking bugs
□ [Specific to this milestone]

SHOULD (Important but can defer):
□ Full RWD coverage (desktop + mobile)
□ Edge case handling
□ Performance optimization
□ Documentation completeness
□ Animation polish

WON'T THIS CYCLE (Explicit exclusions):
□ Advanced features beyond core path
□ Non-critical user flows
□ Refactoring of existing code
□ "Would be nice" improvements
□ Architecture improvements
```

**Scope Hammer (execute when time < 20% remaining):**

Order of cuts:
1. **Cut entire features** — Remove whole scope contracts, not parts
2. **Simplify implementations** — Replace elegant with working
3. **Defer edge cases** — Handle 80% case now, 20% later
4. **Hardcode over generalize** — Specific working code over abstract

**Concrete scope hammers for your milestones:**

```
M1 (Catalog → Products) — If behind:
  → Cut: Deep category nesting
  → Cut: Advanced filtering
  → Hammer: Hardcode 3 categories

M2 (Products UI) — If behind:
  → Cut: Animation polish
  → Cut: Skeleton loading states
  → Cut: Fine-grained breakpoints (use 3, not 6)
  → Hammer: Desktop-only, basic mobile

M3 (Basket UI) — If behind:
  → Cut: Basket animations
  → Cut: Advanced quantity controls
  → Cut: Promo code UI
  → Hammer: Basic styling only

M4 (Checkout UI) — If behind:
  → Cut: Multi-step flow
  → Cut: Advanced form validation
  → Cut: Order summary styling
  → Hammer: Single page, functional, unstyled

M5 (Checkout Robustness) — If behind:
  → Cut: Integration tests
  → Cut: Edge case coverage
  → Cut: Load tests
  → Hammer: Critical path tests only

M6-7 (Account + Auth) — If behind:
  → Cut: Account editing
  → Cut: Order history
  → Cut: Social auth
  → Hammer: Basic Clerk integration, view-only
```

---

### THEME 3: VELOCITY TRACKING (Measure or Perish)

**Rule:** Track actual time per scope contract. Use velocity to predict timeline risk.

**Velocity Log Template (copy for every scope contract):**

```
SCOPE CONTRACT: [Name]
MILESTONE: [N]
DATE: [YYYY-MM-DD]

ESTIMATED TIME: [X hours]
ACTUAL TIME: [Y hours]
VELOCITY: [estimated/actual = ratio]

INTERPRETATION:
- Velocity > 1.0: Overestimated (safe)
- Velocity 0.7-1.0: Normal variance
- Velocity < 0.7: UNDerestimated (DANGER)

IF VELOCITY < 0.7:
□ Immediately revise remaining estimates +50%
□ Review kill list for immediate execution
□ Consider circuit breaker

COMMIT HISTORY:
[HH:MM] - [commit message]
[HH:MM] - [commit message]

NOTES:
[What went wrong/right]
```

**Daily Velocity Check (end of every day):**

```
DAILY VELOCITY CHECK — Day [N]

MILESTONES COMPLETED: [count]
SCOPE CONTRACTS COMPLETED: [count]

CUMULATIVE ESTIMATED TIME: [X hours]
CUMULATIVE ACTUAL TIME: [Y hours]
CUMULATIVE VELOCITY: [X/Y = ratio]

TIMELINE PROJECTION:
- Remaining milestones: [count]
- Projected scope contracts remaining: [count]
- Projected time at current velocity: [hours]
- Days remaining: [count]
- Hours available: [count]
- SAFETY MARGIN: [hours] ([%])

RISK ASSESSMENT:
□ Low (safety margin > 20%)
□ Medium (safety margin 10-20%)
□ High (safety margin < 10%) → EXECUTE EMERGENCY PROTOCOL

EMERGENCY PROTOCOL (execute if HIGH risk):
1. Cut all SHOULD items from remaining milestones
2. Cut one entire milestone (lowest priority)
3. Tighten circuit breaker thresholds to 30%
```

**2-Hour Rule:** If any scope contract has no commit in 2 hours, you are stuck. Execute circuit breaker or ask for help. Do not continue stuck.

---

### THEME 4: REGRESSION CONTAINMENT (Protect Forward Progress)

**Rule:** One regression can consume more time than 5 features. Contain blast radius.

**Regression Pre-Flight (before every scope contract):**

```
SCOPE CONTRACT: [Name]

COMPONENTS AT RISK:
□ [List files that could break]
□ [List dependent components]
□ [List shared utilities used]

REGRESSION TESTS REQUIRED:
Before changes:
  □ npm run build (catches TypeScript errors)
  □ [Specific test command]
  □ [Manual verification step]

After changes:
  □ npm run build
  □ [Specific test command]
  □ [Manual verification step]
  □ Git diff review (max 5 files changed)

FORBIDDEN MODIFICATIONS:
□ Global CSS files (never)
□ Tailwind config (unless explicit scope contract)
□ Shared components outside scope
□ Files not in scope contract
```

**Zero-Blast-Radius Discipline:**

```
CHANGE TYPE: [Styling/Logic/Data]

BLAST RADIUS ASSESSMENT:
Global approach: [What would break globally]
  → Risk: [High/Unknown]
Scoped approach: [What changes locally]
  → Risk: [Low/Bounded]

VERDICT: [Global/Scoped]

IF GLOBAL REQUIRED:
□ Global change is its own scope contract
□ Separate regression testing required
□ Other work pauses until global change verified
```

**Git Diff Review (before every commit):**

```bash
git diff --stat
```

Red flags:
- 10+ files changed for "small" feature
- Configuration files touched unexpectedly
- Files outside scope contract modified
- Large unexplained deletions

**5-File Rule:** If scope contract touches > 5 files, stop. Either scope is too large or unintended changes occurred.

---

### THEME 5: AI LEVERAGE MAXIMIZATION (Zero Budget Strategy)

**Rule:** AI is a scope execution engine. Your job is to write scope contracts so precise that AI executes deterministically.

**Sprint/Implement Split:**

```
HUMAN (you) responsibilities:
  □ Write sprint .todo file with:
    - Scope contracts with appetite
    - Sequenced DoD layers
    - Circuit breakers defined
    - Regression risks identified
  □ Define explicit forbidden scope
  □ Set verification commands

AI (/implement) responsibilities:
  □ Execute scope contracts in exact order
  □ Follow DoD layers (Structure → Layout → Surface → Interaction)
  □ Stay within allowed write paths
  □ Run verification commands
  □ Generate git commit
```

**Precision Prompt Template (for every /implement):**

```
PHASE 1: PLAN AND CONTAIN (Output this before coding)

Explicit Refined Scope:
[Translate rough scope to strict technical target]

Explicit Refined DoDs:
[Atomic, sequential, mechanical tasks]

Read-Only Context Paths:
[List files for context only]

Allowed Write Scope Paths:
[List ONLY files permitted to modify]

Verification Command:
[Exact command to prove zero regressions]

PHASE 2: EXECUTION RULES
□ Execute DoDs in exact sequential order
□ Contain changes strictly within allowed paths
□ No global CSS modifications
□ No improvements outside scope
□ No future architecture work

PHASE 3: VERIFICATION
□ Run verification command
□ If fails: revert, re-evaluate, fix
□ If passes: pause for human visual verification
□ After human approval: generate git commit
```

**Forbidden Prompt Patterns (never use):**

❌ "Fix the VFS integration" (vague)
❌ "Make it look better" (subjective)
❌ "Optimize this" (no boundary)
❌ "Clean up the code" (no definition of done)

**Required Prompt Patterns (always use):**

✅ "Update [specific file] to [specific behavior]"
✅ "DoDs: 1) [verifiable outcome] 2) [verifiable outcome]"
✅ "Forbidden: [list what not to touch]"
✅ "Verification: [exact command]"

---

### THEME 6: SEQUENCING DISCIPLINE (Dependencies Kill Timelines)

**Rule:** Never work on a milestone until all dependencies complete. Parallel work on dependent milestones creates integration risk.

**Dependency Graph (your 7 milestones):**

```
M1: Catalog → Products
  ↓ Required by: M2, M3, M4, M5
  STATUS: [Not started / In progress / Complete]

M2: Products UI
  ↓ Requires: M1
  ↓ Required by: M3, M4, M5
  STATUS: [Not started / In progress / Complete]

M3: Basket UI
  ↓ Requires: M1, M2
  ↓ Required by: M4, M5
  STATUS: [Not started / In progress / Complete]

M4: Checkout UI
  ↓ Requires: M1, M2, M3
  ↓ Required by: M5
  STATUS: [Not started / In progress / Complete]

M5: Checkout Robustness
  ↓ Requires: M1, M2, M3, M4
  STATUS: [Not started / In progress / Complete]

M6: User Account
  ↓ Requires: M7
  STATUS: [Not started / In progress / Complete]

M7: Authentication
  ↓ Standalone (can parallel with M1-M5)
  STATUS: [Not started / In progress / Complete]
```

**Daily Sequencing Check (every morning):**

```
DAILY SEQUENCING CHECK — Day [N]

YESTERDAY'S COMMITMENTS:
□ [Scope contract] — [Complete/Partial/Incomplete]

TODAY'S COMMITMENTS:
→ [Scope contract]
→ [Scope contract]

BLOCKERS:
□ None
□ [Specific blocker] — Resolution: [action]

DEPENDENCY STATUS:
□ All dependencies complete — Proceed
□ Dependencies incomplete — STOP, wait for completion

VELOCITY STATUS:
□ On track (velocity >= 0.8)
□ At risk (velocity 0.5-0.8)
□ Behind (velocity < 0.5) — Execute kill list
```

---

### THEME 7: KILL SWITCH PROTOCOL (Last Resort Timeline Protection)

**Rule:** Execute kill switch when timeline risk becomes unacceptable.

**Kill Switch Conditions (execute if ANY true):**

```
□ Velocity < 0.5 for two consecutive scope contracts
□ Blockers exceed 2 hours without resolution
□ Regression count > 3 in single scope contract
□ Time remaining < 20% with scope < 50% complete
□ Safety margin < 10% per daily velocity check
```

**Kill Switch Actions (execute in order):**

```
1. IMMEDIATE HALT: Stop current work
2. ASSESS: What is the minimal viable version?
3. EXECUTE CIRCUIT BREAKER: Use pre-written fallback
4. CUT SCOPE: Apply kill list from appetite definition
5. SIMPLIFY: Reduce to working solution, defer elegance
6. DOCUMENT: Note what was cut (add to bugs.md or backlog)
7. RESUME: Continue with reduced scope
```

**Pre-Written Fallbacks (define before each milestone):**

```
MILESTONE 1: Catalog → Products
  Primary: Full VFS integration
  Fallback: Hardcoded category mapping
  Fallback trigger: > 4 hours
  Fallback quality: Functional, manual updates required

MILESTONE 2: Products UI
  Primary: Full design system replication
  Fallback: Basic Tailwind utilities
  Fallback trigger: > 6 hours
  Fallback quality: Functional, not pixel-perfect

MILESTONE 5: Checkout Robustness
  Primary: Full test coverage
  Fallback: Critical path tests only
  Fallback trigger: < 60% coverage after 6 hours
  Fallback quality: Payment flow tested, edge cases deferred
```

---

## CONCRETE 6-7 DAY EXECUTION PLAN

### Day 1: M1 — Catalog → Products Critical Path

**Appetite:** 6 hours
**Circuit breaker:** 4 hours → hardcode mapping
**Risk level:** Medium (VFS issues possible)

**Scope Contracts:**
1. VFS Data Integrity — 1h
2. Slug-to-ID Resolution — 1h
3. Descendant Key Unrolling — 1h
4. GROQ Query Integration — 2h
5. E2E Verification — 1h

**Kill list:**
1. Cut deep category nesting
2. Cut advanced filtering
3. Cut pagination
4. CIRCUIT BREAKER: Hardcode 3 categories

**End state:** Click category → see correct products

---

### Day 2: M2 — Products UI Design System

**Appetite:** 6 hours
**Circuit breaker:** 6 hours → desktop-only
**Risk level:** Low (patterns established on homepage)

**Scope Contracts:**
1. Structure pass (skeleton) — 1h
2. Layout pass (Tailwind grid/flex) — 1.5h
3. Surface pass (colors/typography) — 2h
4. Mobile pass (375px layout) — 1.5h

**Kill list:**
1. Cut animation polish
2. Cut fine-grained breakpoints
3. Cut skeleton loading states
4. CIRCUIT BREAKER: Desktop-only, defer mobile polish

**End state:** Product grid matches homepage design quality

---

### Day 3: M3 — Basket UI Design System

**Appetite:** 6 hours
**Circuit breaker:** 6 hours → basic styling
**Risk level:** Low

**Scope Contracts:**
1. Basket structure (drawer/modal) — 1h
2. Layout (items, quantities, total) — 1.5h
3. Surface (design system application) — 2h
4. Mobile layout — 1.5h

**Kill list:**
1. Cut basket animations
2. Cut advanced quantity controls
3. Cut promo code UI
4. CIRCUIT BREAKER: Functional basket, minimal styling

**End state:** Basket displays with design system applied

---

### Day 4: M4 — Checkout UI Design System

**Appetite:** 6 hours
**Circuit breaker:** 6 hours → functional but unstyled
**Risk level:** Medium (form complexity)

**Scope Contracts:**
1. Checkout page structure — 1h
2. Form layout (shipping, payment) — 1.5h
3. Surface (design system application) — 2h
4. Mobile layout — 1.5h

**Kill list:**
1. Cut multi-step flow
2. Cut advanced form validation
3. Cut order summary styling
4. CIRCUIT BREAKER: Single-page form, functional, unstyled

**End state:** Checkout form displays with design system applied

---

### Day 5: M5 — Checkout Robustness

**Appetite:** 6 hours
**Circuit breaker:** 6 hours → critical path tests only
**Risk level:** Medium (payment flow complexity)

**Scope Contracts:**
1. Payment flow tests — 2h
2. Error handling tests — 1.5h
3. Integration verification — 1.5h
4. Documentation — 1h

**Kill list:**
1. Cut integration tests
2. Cut edge case coverage
3. Cut load tests
4. CIRCUIT BREAKER: Critical path tests only, minimal docs

**End state:** Payment flow tested, documented

---

### Day 6-7: M6-7 — User Account + Authentication

**Appetite:** 6-12 hours (2 days)
**Circuit breaker:** 6 hours → view-only, Clerk basic
**Risk level:** Low (Clerk handles complexity)

**Scope Contracts:**
1. Clerk integration — 2h
2. Account view page — 2h
3. Basic styling — 2h
4. Mobile layout — 2h
5. Edge case handling — 2-4h

**Kill list:**
1. Cut account editing
2. Cut order history
3. Cut advanced Clerk customization
4. Cut social auth
5. CIRCUIT BREAKER: Basic Clerk, view-only account

**End state:** Users can register, login, view basic profile

---

## VERIFICATION PROTOCOL

### After Every Scope Contract:

```
□ npm run build (zero TypeScript errors)
□ [Test command from sprint file]
□ Git diff --stat (max 5 files)
□ Manual verification (if UI changes)
□ Commit with descriptive message
```

### End of Every Day:

```
□ Daily velocity check completed
□ Timeline projection updated
□ Risk assessment logged
□ Kill list review (if risk HIGH)
□ Git push to remote
```

### End of Every Milestone:

```
□ All scope contracts verified
□ Regression tests pass
□ Build succeeds
□ Manual smoke tests pass
□ Documentation updated
□ bugs.md updated (deferred issues)
□ Sprint marked complete
□ Velocity logged for milestone
```

---

## EMERGENCY PROTOCOLS

### If Behind Schedule (velocity < 0.7):

```
1. Triage: Which scope contracts are MUST vs SHOULD?
2. Cut: All SHOULD items immediately
3. Simplify: Reduce remaining MUST items to minimal viable
4. Hammer: Use hardcoded/fallback solutions
5. Log: Add cut items to bugs.md with label [DEFERRED]
6. Resume: Continue with reduced scope
```

### If Blocked (> 2 hours no progress):

```
1. Document: Write exact problem in notes
2. Attempt: One alternative approach (30 min max)
3. Decide: Continue or circuit breaker
4. Execute: Circuit breaker if still blocked
5. Log: Blocker reason and resolution
```

### If Regressions (> 3 in scope contract):

```
1. Halt: Stop current changes
2. Revert: Git reset to last known good state
3. Assess: What caused regressions?
4. Narrow: Reduce scope contract size
5. Isolate: Test each change independently
6. Resume: Smaller increments
```

---

## FINAL CHECKLIST: BEFORE YOU START

Confirm before beginning Day 1:

```
□ Read complete cover curriculum document
□ Understand 7 themes and their sub-skills
□ Appetite defined for M1 (6 hours)
□ Circuit breaker defined for M1 (hardcode mapping)
□ Kill list written for M1 (4 items)
□ Velocity tracking template ready
□ Git repo clean, no uncommitted changes
□ Sprint command ready to execute
□ /implement command understood
□ Timeline expectations realistic (7 milestones, 6-7 days)
```

---

## MANTRA: THE COVER IS REAL

The difference between projects that ship and projects that don't is not technical ability. It is the discipline to:

1. **Shape with appetite** — Define time budget before work
2. **Fix time, vary scope** — Deadline is immutable
3. **Track velocity** — Measure or accept fiction
4. **Contain regressions** — One bug can kill a timeline
5. **Leverage AI precisely** — Scope contracts, deterministic execution
6. **Sequence dependencies** — Right order or failure
7. **Kill switch ready** — Know when to stop and simplify

**You have 6-7 days. You have 7 milestones. The math works if you do not violate these principles.**

Execute.
