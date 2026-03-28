# Cover Against Timeline Failure: Complete Skill Curriculum
### Evidence-Based Defense Against Software Project Schedule Collapse
#### Constraint: 6-7 Day Free Trial Window · Zero Budget · 7 Critical Milestones

---

> **How to read this document**
> This curriculum teaches the mental representation of **schedule safety** — the internal model that distinguishes projects that ship from projects that don't. Each theme builds the reflex to recognize timeline risk before it becomes deadline failure. Read completely before attempting any milestone. Knowledge without practice is useless; practice without knowledge is blind.

---

## Preface: Why Projects Miss Deadlines

### The Fundamental Error

Software projects do not miss deadlines because of technical difficulty. They miss deadlines because of **cognitive errors in planning**:

1. **The Estimation Fallacy**: Believing that "how long will this take?" is answerable before design
2. **The Scope Expansion Reflex**: Allowing "what I noticed while building" to become "what I must build now"
3. **The Buffer Consumption Trap**: Treating safety margins as available scope
4. **The Integration Blindspot**: Ignoring the cost of making separately-built pieces work together

### The 6-7 Day Constraint Is Not The Problem

Your constraint is not the free trial window. Your constraint is the **number of scope contracts you can complete in sequence**. If a scope contract takes 6 hours, you can complete ~8-10 scope contracts in 6 days. If you can complete 8-10 scope contracts, you can ship 7 milestones. The math works **if** you do not violate the principles in this curriculum.

### Evidence-Based vs. Hope-Based Scheduling

Hope-based scheduling: "I think I can finish this in 2 days."
Evidence-based scheduling: "My velocity history shows I complete scope contracts of this size in 6-8 hours. The confidence interval for completion is 85% within 24 hours."

This curriculum teaches evidence-based scheduling for AI-assisted development under extreme constraints.

---

## Theme 1: Appetite-Based Shaping

### The Mental Representation Being Built

> "Before asking 'how long will this take?' ask 'how much time do I want to spend?' Then design a solution that fits within that appetite."

Appetite is not an estimate. It is a **budget**. You are not predicting the future. You are setting a constraint and designing within it.

### What Appetite-Based Shaping Is

Shaping is the pre-coding work of defining what a deliverable will and will not include, designed to fit within a predetermined time appetite. It answers: what solution fits in the time I'm willing to spend?

It operates **entirely before any code is written**. Once coding begins, shaping is complete. Changing the shape mid-build is a scope change requiring explicit acceptance of deadline risk.

Shaping is **not**:
- Estimating tasks ("I think this will take 4 hours")
- Writing pseudocode for the full implementation
- Making a todo list of things to code

Shaping **is**:
- Defining the maximum time appetite for this deliverable
- Identifying the core elements that must exist
- Explicitly ruling out elements that don't fit the appetite
- Writing a scope contract that enforces the boundary

### First Principle Behind Appetite-Based Shaping

**Your appetite is knowable; the work required is not.** You know how much time you can afford to spend. You do not know — and cannot know — exactly how long unfamiliar technical work will take. Estimation pretends knowledge you don't have. Appetite accepts ignorance and constrains design to fit what you do know: your deadline.

### Sub-Skill 1.1: The Appetite Decision

For each milestone, decide the appetite before any design work:

```
MILESTONE: [name]
CRITICAL PATH: [the one thing that must work]

APPETITE ALLOCATION:
- Total available: [6-7 days total across all milestones]
- This milestone appetite: [X days]
- Hard deadline: [specific date/time]
- Circuit breaker: If not done by deadline, what gets cut?

SCOPE CONTRACTS WITHIN THIS APPETITE:
1. [Scope contract 1] — Appetite: [hours]
2. [Scope contract 2] — Appetite: [hours]
3. [Maximum 3-5 scope contracts total per milestone]
```

**Concrete example — Milestone 1 (Catalog Item → Products Page):**

```
MILESTONE: Catalogue Item → Products Page
CRITICAL PATH: Click category → See correct products

APPETITE ALLOCATION:
- Total available: 1 day (of 6-7)
- This milestone appetite: 6-8 hours
- Hard deadline: End of Day 1
- Circuit breaker: If VFS issues block progress, hardcode category mapping

SCOPE CONTRACTS:
1. VFS Data Integrity Validation — Appetite: 1 hour
2. Slug-to-ID Resolution Path — Appetite: 1 hour
3. Descendant Key Unrolling — Appetite: 1 hour
4. GROQ Query Integration — Appetite: 2 hours
5. End-to-End Verification — Appetite: 2 hours
```

**Why maximum 3-5 scope contracts per milestone:**

Every scope contract has overhead: context loading, test writing, verification. Beyond 5 scope contracts per milestone, overhead dominates. If you need more than 5 scope contracts to describe a milestone, the milestone is too large. Split it.

**Violation consequence — timeline death spiral:**

Without appetite-based shaping, you shape by discovery: "I'll know what needs to be done once I'm in it." This guarantees that your initial estimate was wrong, that you'll discover necessary work you didn't account for, and that your deadline is now impossible. You don't fail because the work was hard. You fail because you didn't shape it.

---

### Sub-Skill 1.2: The Circuit Breaker Rule

**The Circuit Breaker:** If a scope contract exceeds its appetite by 50%, it does not get more time. It gets simplified or cut.

```
SCOPE CONTRACT: VFS Data Integrity
APPETITE: 1 hour
CIRCUIT BREAKER: At 1.5 hours, abandon VFS and hardcode mapping

EXECUTION:
Hour 1: Attempt VFS validation
Hour 1.5: Assessment — Is VFS working?
  → YES: Continue to next scope contract
  → NO: Execute circuit breaker → hardcode mapping
```

**Why circuit breakers are non-negotiable:**

Without circuit breakers, single scope contracts consume entire milestones. A 1-hour scope contract that takes 6 hours destroys your timeline. The circuit breaker enforces the hard truth: if it doesn't fit the appetite, it doesn't ship this cycle.

**Concrete circuit breaker examples for your 7 milestones:**

| Milestone | Scope Contract | Appetite | Circuit Breaker |
|-----------|----------------|----------|-----------------|
| 1. Catalog → Products | VFS Integration | 4 hours | Hardcode category mapping |
| 2. Products UI | Full RWD | 6 hours | Desktop-only, mobile deferred |
| 3. Basket UI | Design system | 6 hours | Basic styling, polish deferred |
| 4. Checkout UI | Design replication | 4 hours | Functional but unstyled |
| 5. Checkout robustness | Full tests | 6 hours | Critical path tests only |
| 6. User account | Core features | 6 hours | View-only, edit deferred |
| 7. Authentication | Basic auth | 6 hours | Clerk basic, custom deferred |

---

### Sub-Skill 1.3: Vertical Slice Sequencing

**The Rule:** Build one complete feature end-to-end before building multiple features partially.

Wrong approach:
- Build all 20 category pages skeletons
- Then add data to all 20
- Then style all 20
- Then test all 20

Right approach:
- Build one category page completely (skeleton → data → style → test)
- Verify it works
- Apply the working pattern to remaining 19

**Why vertical slices save timelines:**

Integration risk is the silent killer of software schedules. You believe 5 components are "80% done" but integration reveals they don't fit together. The last 20% takes 80% of the time. Vertical slices force integration immediately. You know something works before investing in replicating it.

**Application to your sprint workflow:**

Your sprint command already enforces this with:
```
Pass 1 — Skeleton (all components)
Pass 2 — Data (all components)
Pass 3 — Build (one component at a time)
```

The critical discipline: **Do not proceed to Pass 2 until Pass 1 proves integration works.** Do not proceed to Pass 3 until Pass 2 proves data flow works.

---

## Theme 2: Fixed Time, Variable Scope

### The Mental Representation Being Built

> "The deadline is fixed. The scope is variable. This is not negotiable. Every project that ships on time operates this way. Every project that fails tries to fix both."

### The Impossibility Proof

In project management, three variables exist:
1. Time (deadline)
2. Scope (what gets built)
3. Quality (how well it works)

You can fix any two. You cannot fix all three. Attempting to fix all three guarantees failure of at least one.

- Fixed time + fixed scope → quality collapses (bugs, technical debt)
- Fixed time + fixed quality → scope must vary
- Fixed scope + fixed quality → time must vary

Your constraint is time. Therefore, scope varies.

### Sub-Skill 2.1: The Scope Hammer

**Definition:** The scope hammer is the discipline of cutting scope when time runs low, not extending time when scope runs high.

**The Scope Hammer Checklist (execute in order):**

1. **Cut features entirely** — Remove whole scope contracts, not parts of many
2. **Simplify implementations** — Replace elegant solutions with working solutions
3. **Defer edge cases** — Handle 80% case now, 20% case later
4. **Hardcode over generalize** — Specific working code over abstract flexible code

**Concrete scope hammer applications for your milestones:**

```
MILESTONE 1: Catalog → Products
Original scope: Full VFS integration with all descendant queries
Hammered scope (if time low): 
  - Hardcode 3 top-level categories
  - Defer deep category nesting
  - 2 hours saved

MILESTONE 2: Products Page UI
Original scope: Full RWD with all breakpoints
Hammered scope (if time low):
  - Desktop (1280px) only
  - Mobile layout: single column stack
  - No fine-tuned intermediate breakpoints
  - 4 hours saved

MILESTONE 5: Checkout Robustness
Original scope: Full test coverage for all paths
Hammered scope (if time low):
  - Critical path tests only (payment flow)
  - Edge case tests deferred
  - Unit tests for payment functions only
  - 3 hours saved
```

**Why this feels wrong but is right:**

The scope hammer feels like giving up, like accepting lower quality. It is not. It is **acknowledging reality**. A feature that works and ships is higher quality than an elegant feature that doesn't exist. Users cannot use code that isn't deployed.

---

### Sub-Skill 2.2: The Must/Should/Won't Protocol

Before coding any milestone, classify every element:

```
MILESTONE: [name]

MUST (Ship blocker — non-negotiable):
- [ ] Core functionality works
- [ ] Critical path tested
- [ ] No breaking bugs

SHOULD (Important but can defer):
- [ ] Full RWD coverage
- [ ] Edge case handling
- [ ] Performance optimization
- [ ] Documentation

WON'T THIS CYCLE (Explicitly excluded):
- [ ] Advanced features
- [ ] Non-critical paths
- [ ] Refactoring
- [ ] "Would be nice" improvements
```

**The rule:** If you're at 80% of time and less than 100% of MUST items, cut all SHOULD items immediately and assess if MUST items need hammering.

---

### Sub-Skill 2.3: The Kill List

**The Kill List:** A pre-written list of what gets cut if time runs low.

Writing the kill list **before** pressure exists is critical. During pressure, everything feels essential. The kill list is written when you're calm and can see what actually matters.

```
MILESTONE 2: Products Page UI Design System

KILL LIST (execute in order if time < 2 hours remaining):
1. Cut: Animation polish (hover transitions)
2. Cut: Custom scrollbar styling
3. Cut: Fine-grained breakpoint tuning (use 3 breakpoints, not 6)
4. Cut: Skeleton loading states (use simple spinner)
5. Cut: Advanced filter UI (basic dropdown only)
6. CIRCUIT BREAKER: If still behind, cut mobile-specific layout (stack layout only)
```

---

## Theme 3: Velocity Tracking

### The Mental Representation Being Built

> "Your estimation history is the only evidence for future predictions. Track actual completion time or accept that your estimates are fiction."

### Evidence-Based Scheduling (Joel Spolsky)

Joel Spolsky's Evidence-Based Scheduling (EBS) reveals that:
1. Individual task estimates are always wrong
2. Individual velocity (actual/estimate ratio) is consistent per person
3. Aggregate predictions across many tasks become accurate

**For your 6-7 day constraint, you don't have time for aggregate predictions.** You need per-scope-contract tracking to calibrate immediately.

### Sub-Skill 3.1: The Scope Contract Time Log

Track actual time spent per scope contract:

```
SPRINT: Catalogue → Products Integration
DATE: 2026-03-27

SCOPE CONTRACT TIME LOG:

| Contract | Est. | Actual | Velocity | Notes |
|----------|------|--------|----------|-------|
| VFS Data Integrity | 1h | 1.5h | 0.67 | Build script issues |
| Slug Resolution | 1h | 0.5h | 2.0 | Already worked |
| Descendant Unrolling | 1h | 0.75h | 1.33 | Straightforward |
| GROQ Integration | 2h | 3h | 0.67 | Query syntax issues |
| E2E Verification | 2h | 1h | 2.0 | Used existing tests |
| **TOTAL** | **7h** | **6.25h** | **1.12** | **Under budget** |
```

**How to use velocity data:**

- Velocity > 1.0: You overestimated (conservative, safe)
- Velocity 0.7-1.0: Normal estimation variance
- Velocity < 0.7: You significantly underestimated (dangerous for timeline)

If you have velocity < 0.7 on any scope contract, **immediately revise remaining estimates upward by 50%** and execute the kill list.

---

### Sub-Skill 3.2: The Daily Velocity Check

At the end of each day, calculate cumulative velocity:

```
DAY 1 SUMMARY (2026-03-27):
Milestone 1 progress: 5/5 scope contracts complete
Actual time: 6.25 hours
Estimated time: 7 hours
Velocity: 1.12

TIMELINE PROJECTION:
Remaining milestones: 6
Average scope contracts per milestone: 4
Projected scope contracts remaining: 24
Projected time at current velocity: 21 hours
Days remaining: 5
Hours available: ~40
SAFETY MARGIN: 19 hours (48%)
```

**If safety margin drops below 10%, execute emergency protocol:**
1. Cut all SHOULD items from remaining milestones
2. Cut one entire milestone (lowest priority)
3. Re-evaluate circuit breakers for stricter thresholds

---

### Sub-Skill 3.3: Git Commit Velocity Indicators

Your git history tells you if you're making progress:

**Healthy velocity pattern:**
```
14:00 - [test] Add VFS data integrity tests
14:45 - [test] Verify slug resolution for all 20 categories
15:30 - [feat] Implement descendant key unrolling
16:15 - [test] Validate GROQ query execution
17:00 - [feat] Wire category page to VFS query
18:00 - [verify] Manual smoke tests pass — Milestone 1 complete
```

**Unhealthy velocity pattern:**
```
14:00 - [wip] Start VFS integration
16:00 - [wip] Debugging VFS issues
18:00 - [wip] Still debugging, found another bug
20:00 - [wip] Trying different approach
22:00 - [wip] Giving up on VFS, starting hardcode
```

**The 2-hour rule:** If any scope contract has no commit in 2 hours, you're stuck. Execute circuit breaker or ask for help. Do not continue on the stuck path.

---

## Theme 4: Regression Containment

### The Mental Representation Being Built

> "One regression can consume more time than 5 features. Regression risk is timeline risk."

### The Math of Regressions

Scope contract completion time: 1-2 hours
Regression investigation time: 2-6 hours
Regression multiplier: 2x-6x

**One regression can destroy a milestone.**

### Sub-Skill 4.1: The Regression Pre-Flight

Before any scope contract, identify what could break:

```
SCOPE CONTRACT: VFS GROQ Integration
REGRESSION PRE-FLIGHT:

COMPONENTS AT RISK:
- [ ] Existing product pages (non-VFS)
- [ ] Filter/sort functionality
- [ ] Navigation rendering
- [ ] "All Products" page

REGRESSION TESTS REQUIRED:
- [ ] Run: npm run build (catches TypeScript issues)
- [ ] Run: npx playwright test smoke.spec.ts
- [ ] Manual: Verify navigation still renders
- [ ] Manual: Click existing product page

EXECUTE BEFORE: Any code changes
EXECUTE AFTER: Scope contract complete
```

**The rule:** No scope contract is "done" until regression tests pass. The time to catch regressions is immediately after the scope contract, not at milestone end.

---

### Sub-Skill 4.2: The Zero-Blast-Radius Discipline

**From your windsurf rules:**
- ALL styling MUST use scoped Tailwind utility classes ONLY
- NEVER modify global CSS files unless explicitly requested
- NO arbitrary global CSS modifications permitted

**Why this is a timeline protection:**

Global changes have unbounded blast radius. A Tailwind config change can break 20 components. Fixing 20 components takes 20x longer than the original change. Scoped changes have bounded blast radius. You know exactly what could break.

**The scoped change protocol:**

```
CHANGE REQUEST: Update button styling on product cards

BLAST RADIUS ASSESSMENT:
Global approach: Modify tailwind.config.ts → Risk: All buttons in app
Scoped approach: Add classes to ProductCard component → Risk: Only ProductCard

VERDICT: Scoped approach only. If design system doesn't support, 
design system change is a SEPARATE scope contract with its own 
regression testing requirements.
```

---

### Sub-Skill 4.3: The Git Diff Review

Before every commit, review the diff:

```bash
git diff --stat
```

**Red flags in diff stats:**
- 10+ files changed for a "small" feature
- Configuration files modified unexpectedly
- Files outside the scope contract touched
- Large deletions without explanation

**The 5-file rule:** If a scope contract touches more than 5 files, stop and verify. Either the scope contract is too large or you're causing unintended changes.

---

## Theme 5: AI Leverage Maximization (Zero Budget)

### The Mental Representation Being Built

> "AI is not a coding assistant. AI is a scope execution engine. Your job is to write scope contracts so precisely that AI can execute them deterministically."

### The Free Trial Constraint

You have 6-7 days of Windsurf. After that, AI assistance may be unavailable or degraded. You must maximize leverage during the trial window.

### Sub-Skill 5.1: The Sprint/Implement Split

Your workflow already captures this:

```
HUMAN (you): Write the sprint .todo file
  ↓ Define scope contracts
  ↓ Sequence DoD layers
  ↓ Set circuit breakers
  ↓ Identify regression risks

AI (/implement): Execute one scope contract
  ↓ Follow refined scope exactly
  ↓ Execute DoD layers in sequence
  ↓ Run verification commands
  ↓ Generate git commit
```

**Why this split maximizes leverage:**

AI excels at deterministic execution within clear boundaries. Humans excel at defining those boundaries. Separating the activities lets each operate at their strength.

---

### Sub-Skill 5.2: The Precision Prompt Discipline

Every interaction with AI must include:

1. **Explicit scope:** Exactly what to build, no more
2. **Explicit DoDs:** How you will verify it's done
3. **Explicit forbidden scope:** What not to touch
4. **Verification command:** How to prove zero regressions

**Vague prompt (wastes AI cycles):**
```
"Fix the VFS integration"
```

**Precision prompt (maximizes AI leverage):**
```
SCOPE: Update getSelectedProducts.ts to use VFS key intersection
  using count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
FORBIDDEN: Do not modify any other query files
  Do not change filter/sort logic
  Do not touch UI components
DoD: 
  1. GROQ syntax validates
  2. npm run build passes
  3. Test query returns expected products
VERIFICATION: npm run build && npx tsx tests/vfs-query.test.ts
```

---

### Sub-Skill 5.3: The Model Selection Protocol

You mentioned using "SWE-1.5 model." Free tier AI services have usage limits. Use them strategically:

**High-leverage activities (use best model):**
- Sprint planning (/sprint command)
- Architecture decisions
- Debugging complex issues
- Code review

**Lower-leverage activities (use any available model):**
- Routine file reads
- Simple edits
- Running commands
- Documentation

**The 80/20 rule:** 80% of your timeline risk comes from 20% of your decisions. Use your best AI leverage on that 20%.

---

## Theme 6: Sequencing Discipline

### The Mental Representation Being Built

> "The order in which you build determines whether you ship. Right components in wrong order = failure."

### Your 7 Milestones — Correct Order

You've identified the correct sequence:

```
1. Catalog → Products (critical path)
2. Products UI (design system)
3. Basket UI (design system)
4. Checkout UI (design system)
5. Checkout robustness (tests/docs)
6. User account
7. Authentication
```

**Why this order is correct:**

Milestone 1 establishes the data flow. Without it, nothing else can function.
Milestones 2-4 build the UI shell. Without them, there's nothing to interact with.
Milestone 5 hardens the payment flow. Without it, you can't take money.
Milestones 6-7 are user convenience. Without them, the app still works.

---

### Sub-Skill 6.1: The Dependency Graph Rule

Before sequencing, map dependencies:

```
MILESTONE DEPENDENCY GRAPH:

M1: Catalog → Products
  ↓ Required by: M2, M3, M4, M5, M6, M7

M2: Products UI
  ↓ Requires: M1
  ↓ Required by: M3, M4, M5

M3: Basket UI
  ↓ Requires: M1, M2
  ↓ Required by: M4, M5

M4: Checkout UI
  ↓ Requires: M1, M2, M3
  ↓ Required by: M5

M5: Checkout Robustness
  ↓ Requires: M1, M2, M3, M4

M6: User Account
  ↓ Requires: M7

M7: Authentication
  ↓ Standalone (can parallel with M1-M5 if resources available)
```

**The rule:** Never work on a milestone until all its dependencies are complete. Parallel work on dependent milestones creates integration risk.

---

### Sub-Skill 6.2: The Daily Sequencing Check

Each morning, verify:

```
DAILY SEQUENCING CHECK:

YESTERDAY'S COMMITMENTS:
✓ Milestone 1, Scope Contract 3 complete

TODAY'S COMMITMENTS:
→ Milestone 1, Scope Contracts 4-5

BLOCKERS:
None

YESTERDAY'S VELOCITY: 1.12 (ahead of estimate)
TIMELINE RISK: Low

SCOPE HAMMER STANDBY: None required
```

**If blockers exist, resolve immediately or execute circuit breaker.**

---

## Theme 7: The Kill Switch Protocol

### The Mental Representation Being Built

> "Knowing when to stop is as important as knowing what to build. The kill switch is your last resort to protect the timeline."

### The Kill Switch Conditions

Execute the kill switch (abandon current approach, use fallback) if:

1. **Velocity drops below 0.5** for two consecutive scope contracts
2. **Blockers exceed 2 hours** without resolution
3. **Regression count exceeds 3** in a single scope contract
4. **Time remaining < 20%** of original estimate with < 50% scope complete

---

### Sub-Skill 7.1: The Pre-Written Fallbacks

For each milestone, define the fallback before starting:

```
MILESTONE 1: Catalog → Products

PRIMARY APPROACH: Full VFS integration
FALLBACK APPROACH: Hardcoded category mapping
FALLBACK TRIGGER: VFS integration > 4 hours
FALLBACK QUALITY: Functional but manual updates required

MILESTONE 2: Products UI

PRIMARY APPROACH: Full design system replication
FALLBACK APPROACH: Basic Tailwind utility classes
FALLBACK TRIGGER: UI polish > 8 hours
FALLBACK QUALITY: Functional, not pixel-perfect

MILESTONE 5: Checkout Robustness

PRIMARY APPROACH: Full test coverage
FALLBACK APPROACH: Critical path tests only
FALLBACK TRIGGER: Test coverage < 60% after 6 hours
FALLBACK QUALITY: Payment flow tested, edge cases deferred
```

**Why pre-write fallbacks:**

When you're behind schedule, your judgment is impaired by stress. Pre-written fallbacks remove judgment from the decision. The decision was already made when you were calm.

---

## Appendix A: Your 6-7 Day Execution Plan

### Day 1: Milestone 1 — Catalog → Products Critical Path

**Appetite:** 1 day (6-8 hours)
**Circuit breaker:** 4 hours → hardcode mapping
**Kill list:** 
1. Cut deep category nesting (use top-level only)
2. Cut advanced filtering
3. Cut pagination (show all products)

**Expected outcome:** Click category → see correct products

---

### Day 2: Milestone 2 — Products UI Design System

**Appetite:** 1 day (6-8 hours)
**Circuit breaker:** 6 hours → desktop-only
**Kill list:**
1. Cut animation polish
2. Cut fine-grained breakpoints
3. Cut skeleton states

**Expected outcome:** Product grid matches homepage design quality

---

### Day 3: Milestone 3 — Basket UI Design System

**Appetite:** 1 day (6-8 hours)
**Circuit breaker:** 6 hours → basic styling
**Kill list:**
1. Cut basket animations
2. Cut advanced quantity controls
3. Cut promo code UI

**Expected outcome:** Basket displays with design system applied

---

### Day 4: Milestone 4 — Checkout UI Design System

**Appetite:** 1 day (6-8 hours)
**Circuit breaker:** 6 hours → functional but unstyled
**Kill list:**
1. Cut multi-step flow (single page)
2. Cut advanced form validation
3. Cut order summary styling

**Expected outcome:** Checkout form displays with design system applied

---

### Day 5: Milestone 5 — Checkout Robustness

**Appetite:** 1 day (6-8 hours)
**Circuit breaker:** 6 hours → critical path tests only
**Kill list:**
1. Cut integration tests
2. Cut edge case coverage
3. Cut load tests
4. Cut full documentation (minimal only)

**Expected outcome:** Payment flow tested, documented

---

### Day 6-7: Milestone 6-7 — User Account + Authentication

**Appetite:** 1-2 days (6-12 hours)
**Circuit breaker:** 6 hours → view-only, Clerk basic
**Kill list:**
1. Cut account editing
2. Cut order history
3. Cut advanced Clerk customization
4. Cut social auth

**Expected outcome:** Users can register, login, view basic profile

---

## Appendix B: Velocity Tracking Template

```markdown
## VELOCITY LOG — Milestone [X]

### Day [Date]

| Scope Contract | Est. | Actual | Velocity | Status |
|----------------|------|--------|----------|--------|
| | | | | |
| | | | | |
| | | | | |

**Daily Velocity:** 
**Cumulative Velocity:** 
**Timeline Safety Margin:** 
**Risk Level:** Low / Medium / High

### Blockers
- 

### Kill List Executions
- 

### Circuit Breaker Triggers
- 
```

---

## Final Principle: You Can Ship This

The difference between projects that ship and projects that don't is not technical ability. It is **the discipline to accept constraints and design within them**.

Your 6-7 day constraint is real. Your 7 milestones are achievable. The principles in this curriculum — appetite-based shaping, fixed time variable scope, velocity tracking, regression containment, AI leverage maximization, sequencing discipline, and kill switch protocol — form a complete defense against timeline failure.

The cover is real. Use it.
