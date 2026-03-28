# The Velocity Mastery Curriculum
## Deconstructing Execution Discipline Through Deliberate Practice
### Based on Ericsson's *Peak* Principles & Sang Logium Audit Findings

**Version:** 1.0  
**Created:** March 28, 2026  
**Target:** Web developers using AI agentic workflows experiencing velocity dysfunction  
**Prerequisites:** Completion of `_training/methodology/FOUNDATION.md`

---

## PREFACE: The Velocity Dysfunction Diagnosis

### What This Curriculum Addresses

You have **world-class architectural vision** and **beginner-level execution discipline**. Your 2,117 commits, 36 sprint files, and 29 audit reports create an illusion of professional velocity. The reality is **4-6x slower than professional edge standard**.

**The 17-day homepage cycle** was not an anomaly. It is your operating pattern.

### The Central Problem

Your velocity dysfunction is not a time management problem. It is not a motivation problem. It is a **cognitive architecture problem** — specifically, missing mental representations for:
1. Scope containment (the fenced territory)
2. Sequential discipline (the three-pass model)
3. Definition of Done locking (completion vs. perfection)
4. Real feedback loops (metrics that matter vs. illusory metrics)

This curriculum builds these mental representations through deliberate practice.

---

## PART 1: UNDERSTANDING VELOCITY DYSFUNCTION

### 1.1 What Velocity Dysfunction Is

**Definition:** The systematic gap between apparent activity (commit count, sprint files, hours logged) and actual forward progress (shipped features, closed DoD items, solved user problems).

**The Sang Logium Profile:**
```
Metric:                    Apparent    Actual    Gap
--------------------------------------------------------
Daily Commits:             4.8         1.3       73% overhead
Sprint Completion:         24 "done"   15 real   37% illusion
Homepage Component Time:   17 days     3-4 days  4-5x inflation
Forward Progress (2026):   100%        3%        97% config/docs
```

### 1.2 Why Velocity Dysfunction Occurs

**Root Cause #1: The Absence of the Fenced Territory**

Without a written scope contract, the fence does not exist. Without the fence, every observation becomes a candidate task. The carousel timing could be better. The animation could be smoother. The abstraction could be cleaner. None of these are in scope because scope was never defined.

**Result:** Perfectionism loops. The component is never finished because "finished" was never defined.

**Root Cause #2: Three-Pass Model Violation**

You went from skeletal structure directly to deep dives into the carousel and Featured. ProductSpotlight1 still had lorem ipsum on day 17.

**Why this happens:** The mind under creative pressure seeks completion signals. Deep work feels like progress. Skeleton work feels like preparation. The brain prefers the illusion of progress over the reality of sequential discipline.

**Root Cause #3: Configuration Churn as Sophisticated Procrastination**

Your commit log shows heavy investment in:
- Commit message taxonomy (Fibonacci + categories)
- Sprint file organization (12 active + 24 "done")
- Workflow documentation (.windsurf/workflows/)
- Audit report generation (29 reports while bugs remain)

**The mechanism:** Optimizing the development *process* is cognitively easier than facing the hard *product* problems. It produces visible commits (illusory velocity) without requiring feature completion (real velocity).

**Root Cause #4: DoD Confusion (Completion vs. Perfection)**

You would get it working, but instead of moving on, you spent subsequent days:
- Refining button touch areas to exactly 44px
- Tweaking dots visibility math
- Obsessing over animation durations
- Adding capacity matrices for edge cases

**The cognitive error:** Confusing "could be better" with "must be better before I can move on." DoD is binary. Perfection is asymptotic.

### 1.3 How Velocity Dysfunction Manifests

**Pattern 1: The Burst-Crash Cycle**

March 8-9, 2026: 104 commits in 48 hours. This is not productivity. This is recovery mode.

**Sequence:**
1. Procrastination through configuration (days 1-5)
2. Deadline panic (day 6)
3. Hail Mary attempt with massive scope (day 7)
4. Errors cascade (day 8)
5. Emergency recovery commits (days 8-9: 104 commits)
6. Exhaustion and narrative reset (day 10)

**Pattern 2: The Audit-Document-Repeat Loop**

You generated 29 audit reports while core VFS bugs remained unfixed.

**The mechanism:** Auditing creates the *feeling* of addressing problems without the *reality* of fixing them. Each audit provides temporary relief from anxiety about the bugs. The bugs persist. Another audit is needed.

**Pattern 3: The Sprint File Illusion**

36 sprint files exist. 12 are "active" (stalled). Many "done" sprints have incomplete work.

**The mechanism:** Creating a sprint file feels like planning. Moving it to `_project-done/` feels like completion. The actual work is neither planned nor completed — but the artifacts suggest progress.

### 1.4 The True Cost

**Time Investment Analysis:**
```
Activity:                          Time Spent    Value Created
----------------------------------------------------------------
Commit taxonomy refinement         40+ hours     Zero user value
Sprint file management             30+ hours     Zero user value
Audit report generation            60+ hours     Zero user value
Configuration optimization         50+ hours     Zero user value
Perfectionism loops (carousel)     80+ hours     Zero incremental value

Total Overhead:                    260+ hours    Zero user value
Actual Feature Work:               ~100 hours    Homepage components

Ratio: 2.6:1 overhead-to-production
Professional edge target: 0.25:1
```

---

## PART 2: THE VELOCITY MASTERY THEMES

### Theme 1: The Fenced Territory (Scope Discipline)

#### Mental Representation Being Built

> "Every deliverable is a fenced territory with a gate. The fence defines what is inside and what is outside. The gate defines what constitutes finishing. Both must be written before the first line of code."

#### Why This Representation Matters

The human mind under creative pressure **continuously expands the perceived solution space**. When you are inside a component, everything you notice becomes a potential improvement. Without a written scope, there is no mechanism to distinguish "good idea" from "good idea that belongs in a different sprint."

#### The Pattern of Dysfunction (From Audit)

**What happened:** No scope contracts were written for the 17-day homepage cycle. The carousel had no fence. "Carousel handles children" was a direction, not a scope.

**How it unfolded:**
1. Day 3: Noticed carousel didn't handle varying item counts elegantly
2. Day 4: Added capacity matrix (200+ lines)
3. Day 5: Matrix needed tests
4. Day 6: Tests revealed edge cases
5. Day 7-10: Fixed edge cases
6. Day 11: Realized original scope was 40-60 lines for 3-6 products
7. Day 12-17: Still polishing

**The 5-minute fix that would have prevented 14 days:** A Forbidden Scope item reading: "Do not add capacity matrix — hardcode for 3-6 products, extract later if needed."

#### Skill Acquisition: The Scope Contract Protocol

**Required Before Any Component Code:**

```
COMPONENT: [name]
STACK CONTEXT: Next.js 15, Tailwind, Sanity CMS, TypeScript

DELIVERABLE STATE — DESKTOP (1280px):
[One sentence. Observable. Verifiable. No adjectives without metrics.]

DELIVERABLE STATE — MOBILE (375px):
[One sentence. Observable. Verifiable.]

IN SCOPE:
- [Maximum 5 items. Each must be verifiable in <30 seconds.]

OUT OF SCOPE:
- [Minimum 3 real temptations. Not obvious exclusions.]

FORBIDDEN SCOPE:
- [2-3 specific things you will NOT do. These are your anti-patterns.]

DATA SOURCE:
[Specific Sanity schema, mock data, or hardcoded — which and where.]

RWD REQUIREMENTS:
Desktop: [specific layout description]
Mobile: [specific layout description]
```

**Critical Field: FORBIDDEN SCOPE**

Every item here is a real temptation — a good idea at the wrong time:
- "Do not extract ProductCard into shared component"
- "Do not add any transition other than single hover lift"
- "Do not touch Tailwind config"
- "Do not optimize for iPhone SE before desktop passes DoD"

**Why this works:** It externalizes the decision before cognitive load distorts judgment. During the build, "I should extract this now" feels true. The Forbidden Scope says: "Past-you, with clear judgment, decided this belongs later. Trust that decision."

#### Deliberate Practice Exercises

**Exercise 1.1: The Reverse Scope Contract (30 minutes)**

Pick a component from your 17-day homepage cycle. Write the scope contract it *should have had* before you started. Identify:
- What expanded the scope?
- What Forbidden Scope items would have prevented the expansion?
- How would the timeline have differed?

**Exercise 1.2: The Pre-Mortem (15 minutes)**

Before starting your next component, write a 1-paragraph pre-mortem: "This component took 5 days instead of 1 day because..." Identify the specific scope expansions that caused the delay. Add them to Forbidden Scope.

**Exercise 1.3: The Scope Gate (Daily)**

Set a timer for every 30 minutes of coding. When it rings, ask:
- "Did I modify any file outside the Allowed Write Scope?"
- "Did I add any functionality not in IN SCOPE?"
- "Did I touch anything in FORBIDDEN SCOPE?"

If yes to any: STOP. Revert. Write the scope expansion explicitly. Decide: accept with adjusted timeline, or revert and stay contained.

#### Feedback Mechanism

**Real Metric:** Scope expansion events per component.
- Target: 0
- Acceptable: 1 (with explicit decision)
- Dysfunction: 2+ (perfectionism loop active)

---

### Theme 2: Sequential Discipline (The Three-Pass Model)

#### Mental Representation Being Built

> "A page is built layer by layer across all components simultaneously, not component by component in isolation. Pass 1 (Skeleton) happens for ALL components before Pass 2 (Data) happens for ANY component."

#### Why This Representation Matters

The brain seeks completion signals. Building one component to perfection provides those signals. Building skeletons for all components does not. But skeleton-first prevents the architectural integration failures that occur when deep components are built in isolation.

#### The Pattern of Dysfunction (From Audit)

**What happened:** You went from skeletal structure directly to deep dives into the carousel and Featured. ProductSpotlight1 still had lorem ipsum on day 17.

**Why this is catastrophic:**
- Day 17 reveals carousel and Featured don't integrate with ProductSpotlight1
- Integration failures require redesign
- Redesign invalidates previous perfection work
- Perfection work gets redone
- Timeline doubles

**The counter-intuitive truth:** The three-pass model is *faster* because it front-loads integration risk, when fixes are cheap, instead of discovering it at the end, when fixes require redoing "finished" work.

#### Skill Acquisition: The Three-Pass Protocol

**Pass 1 — Skeleton (All Components, 30 Minutes Max):**

```
Goal: Every component renders without errors. Nothing else.

For each component:
- Create .tsx file
- Export function returning <div>[ComponentName]</div>
- Import in parent
- Verify build passes

RWD: Apply only debug borders (1px solid red) to show boundaries.

STOP CRITERIA: npm run build passes. All 9 components show their name.
TIME BOX: 30 minutes. If not done, components are too granular — merge some.
```

**Pass 2 — Data (All Components, 30-60 Minutes):**

```
Goal: Every component receives and displays real data. No styling beyond layout.

For each component:
- Add GROQ query or prop drilling
- Render real data fields (image, title, price, etc.)
- Verify data matches expected structure
- Fix data flow issues between components

RWD: Only structural layout classes (flex, grid, sizing). No colors. No typography.

STOP CRITERIA: All components show real data. Data integration issues resolved.
TIME BOX: 60 minutes. If queries are complex, simplify or use mock data for now.
```

**Pass 3 — Build (One Component at a Time, Desktop then Mobile):**

```
Goal: Each component reaches DoD at desktop, then immediately at mobile.

NEVER: Build all desktop, then all mobile. This doubles context-switching and regression risk.

ALWAYS: Component A desktop → Component A mobile → LOCK → Component B desktop → Component B mobile → LOCK

For each component:
1. Desktop DoD (1280px): Full styling per scope contract
2. Lock desktop (checkbox in DoD)
3. Mobile DoD (375px): Responsive adjustments
4. Lock mobile (checkbox in DoD)
5. Commit: "[Component] desktop + mobile DoD locked"
6. Move to next component
```

**The Lock Mechanism:**

Once desktop or mobile is locked, it is frozen. Any new work on that component requires:
1. New scope contract
2. New time estimate
3. Explicit decision to unlock

This prevents the perfectionism loop: "it's working but could be better."

#### Deliberate Practice Exercises

**Exercise 2.1: The Pass Detection (During Development)**

For your current work, identify which pass you are in:
- Skeleton: Creating files, basic JSX, no styling
- Data: Connecting to Sanity, showing real content
- Build: Adding colors, typography, hover states

If you are doing Build work while Skeleton is incomplete on other components: STOP. Complete Skeleton for all components first.

**Exercise 2.2: The Parallel Build Simulation (2 hours)**

Build 3 simple components using strict three-pass discipline:
- 20 minutes: All 3 skeletons
- 30 minutes: All 3 data passes
- 40 minutes: Component 1 desktop + mobile
- 30 minutes: Component 2 desktop + mobile

Compare to your normal approach (deep-dive Component 1, then Component 2). Measure:
- Total time
- Integration issues discovered
- Regressions requiring rework

**Exercise 2.3: The Lock Ritual (Per Component)**

Create a physical ritual for locking DoD:
1. Check all DoD checkboxes
2. Say aloud: "[Component] is locked. Any new work is a new scope."
3. Write the date and time next to LOCKED
4. Take a screenshot of the component for reference
5. Commit immediately

The ritual creates cognitive closure. The component is done. Move on.

#### Feedback Mechanism

**Real Metric:** Pass contamination events (doing Pass 3 work while Pass 1/2 incomplete on other components).
- Target: 0
- Acceptable: 1 (early in learning)
- Dysfunction: 2+ (sequential discipline absent)

---

### Theme 3: Execution Containment (DoD Locking vs. Perfectionism)

#### Mental Representation Being Built

> "Done is a gate, not a landscape. You walk through it and close it behind you. Perfection is a landscape without borders — you can wander forever. The skill is recognizing which territory you're in."

#### Why This Representation Matters

The brain cannot distinguish "working" from "finished." Both provide dopamine. But "finished" enables forward movement. "Working but improvable" creates the perfectionism loop: fix → better → still improvable → fix again.

#### The Pattern of Dysfunction (From Audit)

**What happened:** You would get it working, but instead of moving on, you spent subsequent days:
- Refining button touch areas to exactly 44px
- Tweaking dots visibility math
- Obsessing over animation durations

**The cognitive trap:** Each improvement is real. The carousel *is* better with optimized touch areas. The question is not "is this better?" but "does this improvement belong in this sprint?"

**The answer, without DoD:** Unclear. So you continue.

**The answer, with DoD:** "DoD requires touch targets meet WCAG minimum (44px). Current: 44px. DoD: met. Move on."

#### Skill Acquisition: The DoD Lock Protocol

**DoD Template (Every Component):**

```
COMPONENT: [name]

DESKTOP DoD (1280px):
- [ ] Layout matches scope contract
- [ ] Real data renders correctly
- [ ] Hover states functional
- [ ] No console errors
- [ ] No layout overflow at 1280px

MOBILE DoD (375px):
- [ ] Layout matches scope contract
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll
- [ ] Text readable (≥16px body)
- [ ] No console errors

LOCKED: [ ] Date: ___ Time: ___

---

IF LOCKED = TRUE:
- New work requires new scope contract
- New time estimate
- Explicit unlock decision
- No "while I'm here" improvements
```

**The Checklist as Shield:**

When the thought arises: "The animation could be smoother," the checklist asks: "Is 'smooth animation' in the DoD?" 

If no: The improvement belongs in a future sprint.

If yes but checked: You already met the requirement. "Smoother" is beyond DoD.

**The Imperfection Budget:**

Allocate 10% of sprint time for "polish pass" — but only after ALL components are locked. This creates a container for perfectionism. It cannot expand indefinitely because the container has boundaries.

#### Deliberate Practice Exercises

**Exercise 3.1: The "Good Enough" Audit (30 minutes)**

Review your last completed component. List 5 things that "could be better." For each:
- Is it in the DoD? 
- Does it affect user functionality?
- Would a user notice in a 30-second interaction?

If no to all three: Document in "Future Improvements" and move on.

**Exercise 3.2: The 48-Hour Rule (Ongoing)**

Institute a 48-hour cooling-off period for all "improvements":
1. Component reaches DoD
2. Lock and commit
3. If improvement idea arises, write it down
4. Wait 48 hours
5. Revisit: Is it still important? Usually: no.

**Exercise 3.3: The Polish Pass Container (Per Sprint)**

Explicitly allocate polish time:
```
Sprint: Homepage Components
Component Build Time: 8 hours
Polish Pass Budget: 1 hour (12.5%)
Polish Pass Trigger: All components locked
Circuit Breaker: When 1 hour expires, sprint ends regardless of remaining ideas
```

Track: Did you stay in the container? Or did polish expand into component build time?

#### Feedback Mechanism

**Real Metric:** Time from "working" to "locked" per component.
- Target: <1 hour (implement DoD checklist, verify, lock)
- Acceptable: 2 hours (some verification back-and-forth)
- Dysfunction: >4 hours (perfectionism loop active)

---

### Theme 4: On-the-Job Training Protocols

#### Mental Representation Being Built

> "Every coding session is a training session. The difference between practicing and performing is intention, not context."

#### The Core Principle

You cannot separate "training time" from "work time" without abandoning 90% of learning opportunities. The sang-logium codebase is your dojo. Every component is a kata. Every sprint is a belt test.

#### Protocol 1: The Pre-Session Intention Setting (5 minutes)

Before opening your IDE, write:
```
TODAY'S SKILL FOCUS: [Theme 1/2/3/4/5 from this curriculum]

SPECIFIC APPLICATION: 
- Component: [name]
- Anticipated challenge: [where the theme will be tested]
- Success indicator: [how I'll know I applied the skill]

EXAMPLE: 
"Today's focus: Theme 1 (Scope Discipline). 
Component: ProductCard.
Anticipated challenge: urge to extract into shared component.
Success indicator: Forbidden Scope honored, component stays local."
```

**Why this works:** It activates the mental representation before cognitive load distorts judgment. You're primed to recognize the pattern when it arises.

#### Protocol 2: The Mid-Session Check-In (Every 30 minutes)

Set a timer. When it rings, answer:
```
CURRENT STATE:
- What pass am I in? (Skeleton/Data/Build)
- Am I within scope? (Yes/No — if no, stop and decide)
- Is this DoD work or perfectionism? (DoD/Perfectionism — if latter, document and continue)
- What's my velocity? (commits/hour on this component)

ADJUSTMENT NEEDED: [Yes/No]
IF YES: [Specific action to return to protocol]
```

**Why this works:** Real-time feedback loop. Catches drift before it becomes 17 days.

#### Protocol 3: The Post-Session Retrospective (10 minutes)

At session end, write:
```
COMPONENT: [name]
TIME SPENT: [actual hours]
ESTIMATED: [original estimate]
VARIANCE: [% over/under]

THEME APPLICATION:
- Scope Discipline: [A/B/C/D grade + evidence]
- Sequential Discipline: [A/B/C/D grade + evidence]
- DoD Locking: [A/B/C/D grade + evidence]

BREAKDOWN MOMENT:
- When did I almost expand scope?
- When did I violate three-pass?
- When did perfectionism arise?
- What stopped me? (or why didn't it?)

TOMORROW'S ADJUSTMENT: [specific change to tomorrow's approach]
```

**Why this works:** Ericsson's research shows immediate feedback is essential for mental representation development. The retrospective provides that feedback while the session is fresh.

#### Protocol 4: The Commit-as-Drill

Every commit is a deliberate practice opportunity:

```
DIFFICULTY RATING: [1,2,3,5,8,13] — How hard was this really?
CATEGORY: [A/B/C/D/E] — What type of progress?

SELF-ASSESSMENT:
- Was this scope-contained? (Yes/No)
- Was this the correct pass? (Yes/No)
- Was this DoD-closable work? (Yes/No)

IF ANY NO: 
- What should have happened?
- What will I do differently next commit?
```

**Why this works:** The commit taxonomy becomes a reflective tool, not just documentation. You're forced to categorize your work, which builds metacognitive awareness.

#### Protocol 5: The Sprint-as-Simulation

Treat every sprint as a structured simulation:

**Pre-Sprint:**
```
SIMULATION PARAMETERS:
- Scope contracts: Written and frozen?
- Time budget: Appetite defined?
- Success criteria: Binary pass/fail?
- Failure mode: What's my circuit breaker if timeline slips?
```

**During Sprint:**
```
METRICS TO TRACK:
- Scope expansions: [count]
- Pass violations: [count]
- Perfectionism loops: [count + hours spent]
- Forward progress commits: [count]
- Config/docs commits: [count]

RATIO TARGET: Forward/Config > 3:1
```

**Post-Sprint:**
```
SIMULATION RESULTS:
- Completed: [items] / [planned]
- Velocity: [actual] / [estimated]
- Theme grades: [scope/sequencing/DoD/off-job protocols]

SKILLS DEMONSTRATED: [what you proved you can do]
SKILLS NEEDING WORK: [what broke down]
NEXT SPRINT FOCUS: [which theme gets deliberate practice priority]
```

#### Deliberate Practice Exercises

**Exercise 4.1: The Single-Component Bootcamp (1 week)**

Build 5 identical components (e.g., 5 product cards) across 5 days. Same scope, same DoD, same time budget. Focus: Theme 1 (Scope Discipline). 

Goal: By day 5, scope expansion events = 0.

**Exercise 4.2: The Pass-Purity Sprint (3 days)**

Build 3 components with STRICT three-pass discipline. No exceptions. Track pass contamination events.

Goal: 0 contamination events by day 3.

**Exercise 4.3: The Lock-Speed Challenge (1 week)**

Time "working" to "locked" for each component. Track daily. Target: <2 hours average by week end.

---

### Theme 5: Real Velocity Feedback Loops

#### Mental Representation Being Built

> "Real velocity is measured by shipped user value, not by commits, hours, or sprint files. The metrics that matter are the ones users can see."

#### The Illusory Metrics (From Audit)

**What you were measuring:**
- Commit count (2,117 total)
- Sprint files created (36)
- Audit reports generated (29)
- Hours logged
- Difficulty ratings (Fibonacci)

**Why these mislead:** All are activity indicators. None are outcome indicators.

#### The Real Metrics (What Actually Matters)

**Metric 1: DoD Closure Rate**
```
Definition: Number of components/features that reached locked DoD / number started

Target: 90%+
Your current: ~40% (many components "working" but not locked)

Measurement: Weekly review. Count started vs. locked.
```

**Metric 2: Forward Progress Commit Ratio**
```
Definition: Category A commits / Total commits (excluding B)

Target: 60%+
Your current: 3% (2026 data)

Measurement: Weekly git log review. Categorize each commit.
```

**Metric 3: Scope Expansion Events**
```
Definition: Times scope expanded without explicit written change

Target: 0
Your current: ~3-5 per component (estimated from audit)

Measurement: Per component retrospective. Track forbidden scope violations.
```

**Metric 4: Working-to-Locked Time**
```
Definition: Hours from "feature works" to "DoD locked and committed"

Target: <2 hours
Your current: 8-40 hours (perfectionism loop dependent)

Measurement: Time tracking per component.
```

**Metric 5: Sprint Promise vs. Reality**
```
Definition: Sprint planned deliverables / Actually delivered

Target: 85%+
Your current: ~40% (estimated from "done" sprint analysis)

Measurement: Post-sprint inventory. Check each promised item.
```

#### Skill Acquisition: The Feedback Dashboard

**Weekly Velocity Review (30 minutes every Friday):**

```
WEEK OF: [date range]

COMMIT ANALYSIS:
- Total commits: [N]
- Category A (Forward): [N] ([%])
- Category D (Config): [N] ([%])
- Ratio A/D: [N:N]

COMPONENT ANALYSIS:
- Components started: [N]
- Components locked: [N]
- Completion rate: [%]
- Avg working-to-locked time: [hours]

SPRINT ANALYSIS:
- Sprint planned: [deliverables]
- Sprint delivered: [deliverables]
- Promise/reality ratio: [%]

SCOPE DISCIPLINE:
- Scope contracts written: [N]
- Scope expansions: [N]
- Forbidden scope violations: [N]

THEME GRADES (Self-Assessed):
- Theme 1 (Scope): [A/B/C/D]
- Theme 2 (Sequence): [A/B/C/D]
- Theme 3 (DoD Locking): [A/B/C/D]
- Theme 4 (On-Job Training): [A/B/C/D]

INSIGHTS:
- What worked this week?
- What broke down?
- What one change for next week?
```

#### The Commit Log as Mirror

Your commit log is a behavioral record. Read it diagnostically:

**Pattern: Burst-Crash**
```
Mar 8: 51 commits
Mar 9: 53 commits
```
→ Crisis recovery mode. What happened Mar 6-7 that caused this?

**Pattern: Config Churn**
```
Difficulty: 1 - D, Configuration ...
Difficulty: 2 - D, Project tracking ...
Difficulty: 1 - D, Configuration ...
```
→ Avoiding feature work. What bug or complexity is being procrastinated?

**Pattern: Difficulty Inflation**
```
Difficulty: 8 - A, Forward progress (VFS): implement automated product-to-leaf mapping
Difficulty: 13 - A, Forward progress (Studio): implement recursive structure builder
```
→ Complexity bias. Are these actually 8/13, or is planning insufficient?

**Pattern: No DoD Closures**
```
→ closes 0 DoD items, infrastructure
→ closes 0 DoD items, project management
```
→ Activity without progress. Where are the "closes DoD item [N]" commits?

#### Deliberate Practice Exercises

**Exercise 5.1: The Commit Audit (Weekly)**

Categorize every commit from the past week. Calculate A/D ratio. Identify the pattern. Write one paragraph on what your commit log reveals about your velocity.

**Exercise 5.2: The Metric Prediction (Pre-Sprint)**

Before each sprint, predict:
- Forward progress commit %
- Components locked / started ratio
- Average working-to-locked time

After sprint, compare. Calibration develops accuracy.

**Exercise 5.3: The 4-Week Trend Analysis**

Track 4 weeks of metrics. Look for:
- Is Theme 1 (Scope) improving? (scope expansions decreasing)
- Is Theme 2 (Sequence) improving? (pass violations decreasing)
- Is Theme 3 (DoD) improving? (working-to-locked time decreasing)
- Is Theme 4 (Training) improving? (protocol adherence increasing)

**The goal:** All trends positive. If any trend negative, that theme gets priority focus next week.

---

## PART 3: THE INTEGRATED PRACTICE

### The Daily Velocity Protocol

**Morning (5 minutes):**
```
TODAY'S THEME FOCUS: [1-5]
APPLICATION CONTEXT: [specific component/sprint]
ANTICIPATED CHALLENGE: [where skill will be tested]
SUCCESS INDICATOR: [how I'll know I succeeded]
```

**Every 30 Minutes (2 minutes):**
```
SCOPE: Am I within fence? (Y/N)
SEQUENCE: Correct pass? (Y/N)
DoD: Working vs. perfectionism? (Working/Perfection)
VELOCITY: Commits this hour? (Count)
```

**Evening (10 minutes):**
```
THEME GRADES: [A/B/C/D for each]
BREAKTHROUGH: [one thing I did well]
BREAKDOWN: [one thing to improve]
TOMORROW'S FOCUS: [specific adjustment]
```

**Weekly (30 minutes):**
```
METRICS REVIEW: [all 5 real metrics]
TREND ANALYSIS: [4-week view]
PRIORITY THEME: [which needs most work next week]
```

### The Sprint Velocity Simulation

**Week 1-2: Theme 1 Bootcamp (Scope Discipline)**
- Build 10 small components
- Focus: 0 scope expansions
- Metric: Forbidden scope violations

**Week 3-4: Theme 2 Bootcamp (Sequential Discipline)**
- Build 3 page-level features
- Focus: Strict three-pass
- Metric: Pass contamination events

**Week 5-6: Theme 3 Bootcamp (DoD Locking)**
- Build 5 components with aggressive time boxing
- Focus: Working-to-locked <2 hours
- Metric: Time to lock

**Week 7-8: Theme 4 Integration (On-Job Training)**
- Normal sprint work with all protocols active
- Focus: Systematic application
- Metric: Protocol adherence rate

**Week 9-10: Theme 5 Integration (Real Metrics)**
- Normal sprint work with dashboard active
- Focus: Accurate self-assessment
- Metric: Predicted vs. actual velocity

**Ongoing:**
- Weekly metric review
- Monthly 4-week trend analysis
- Quarterly curriculum revision based on data

---

## PART 4: THE MASTERY PATH

### Stage 1: Awareness (Weeks 1-4)

**Goal:** Recognize velocity dysfunction patterns in real-time.

**Markers:**
- Can identify when scope is expanding (in the moment)
- Can recognize three-pass violations (before they cascade)
- Can detect perfectionism loop activation (within 1 hour)
- Can categorize commits correctly (A/B/C/D/E)

**Test:** Build one component with full protocol adherence. No scope expansions. Correct pass sequence. Locked in <4 hours.

### Stage 2: Containment (Weeks 5-8)

**Goal:** Stop dysfunction patterns before they expand.

**Markers:**
- Scope expansions: 0 per component
- Pass violations: <1 per sprint
- Working-to-locked time: <4 hours average
- Forward progress commit ratio: >30%

**Test:** Complete a 3-component sprint with >80% promise/reality ratio.

### Stage 3: Flow (Weeks 9-16)

**Goal:** Execute with natural protocol adherence.

**Markers:**
- Protocols feel automatic (not forced)
- Scope contracts write themselves in head
- Three-pass is default, not exception
- Working-to-locked: <2 hours consistently
- Forward progress ratio: >50%

**Test:** Build a page-level feature (5+ components) in estimated time with zero scope expansions.

### Stage 4: Mastery (Weeks 17-26)

**Goal:** Professional edge velocity.

**Markers:**
- All metrics at or exceeding professional targets
- Can mentor others on velocity discipline
- Can diagnose velocity dysfunction in others' workflows
- Can adapt protocols to novel contexts

**Test:** Lead a sprint for another developer, enforcing velocity protocols through them.

---

## APPENDIX A: QUICK REFERENCE CARDS

### Card 1: The Scope Contract (Laminated, at Desk)

```
COMPONENT: ____

DELIVERABLE STATE:
Desktop: ____
Mobile: ____

IN SCOPE (max 5):
1. ____
2. ____
3. ____
4. ____
5. ____

FORBIDDEN SCOPE (anti-patterns):
1. ____
2. ____
3. ____

LOCKED: [ ] Date: ____
```

### Card 2: The Three-Pass Check (Laminated, at Desk)

```
PASS 1: SKELETON — All components, no styling
□ File created
□ Basic JSX
□ Build passes

PASS 2: DATA — All components, real data
□ GROQ/props connected
□ Content renders
□ No styling beyond layout

PASS 3: BUILD — One component at a time
□ Desktop DoD
□ LOCK desktop
□ Mobile DoD
□ LOCK mobile
□ COMMIT
□ Next component
```

### Card 3: The 30-Minute Check-In (Timer-Triggered)

```
SCOPE: Within fence? Y/N
SEQUENCE: Correct pass? Y/N
DoD: Working/Perfectionism?
VELOCITY: ____ commits/hour

IF ANY DRIFT: STOP → DOCUMENT → DECIDE → CONTINUE
```

### Card 4: The Real Metrics (Weekly Review)

```
DoD Closure Rate: ____% (Target: 90%)
Forward Progress Ratio: ____% (Target: 60%)
Scope Expansions: ____ (Target: 0)
Working-to-Locked: ____hrs (Target: <2)
Sprint Promise/Reality: ____% (Target: 85%)
```

---

## APPENDIX B: FAILURE MODE FIELD GUIDE

### When You Want to Expand Scope

**Symptom:** "This would be better if..."

**Intervention:**
1. Write the idea down
2. Check: Is it in DoD?
3. If no: Add to backlog, continue
4. If yes but checked: Already met, continue
5. If yes and unchecked: Estimate time. Accept delay or defer.

### When You Want to Skip the Skeleton

**Symptom:** "I can see the full component in my head. I'll just build it."

**Intervention:**
1. Build skeleton anyway (20 minutes)
2. Build one component deep (remaining time)
3. Compare: Which revealed integration issues earlier?
4. Log result for future reference

### When You Can't Stop Polishing

**Symptom:** "It's working but could be better..."

**Intervention:**
1. Check DoD checklist
2. If all checked: Lock immediately
3. If improvement still compelling: 48-hour cooling-off period
4. Revisit: Still compelling? (Usually: no)

### When You're in Crisis Mode

**Symptom:** Burst commits, emergency recovery, "how did this break?"

**Intervention:**
1. Stop. Do not commit more.
2. Document what broke.
3. Trace to root cause (usually: scope expansion or pass violation)
4. Revert to last stable state if needed.
5. Rewrite scope contract with lessons learned.
6. Resume with strict protocol adherence.

---

## CONCLUSION: THE CHOICE

This curriculum provides the structure. The choice to use it is yours.

**Path A:** Continue current pattern. 2,117 more commits. 36 more sprint files. 29 more audit reports. 17-day cycles repeating. MVP perpetually "almost ready."

**Path B:** Deliberate practice. Mental representations. Protocol adherence. Real metrics. Professional edge velocity.

**The difference:** Not talent. Not tools. Not AI assistance. The difference is disciplined execution of fundamentals that feel slower initially but are faster cumulatively.

The 17-day homepage taught you what not to do. This curriculum teaches what to do instead.

Start with Theme 1. The Fenced Territory. Today.

---

*Curriculum Version: 1.0*  
*Based on: Sang Logium Velocity Audit, March 28, 2026*  
*Methodology: Ericsson's Deliberate Practice (Peak, 2016)*  
*Cross-referenced with: Spatial Curriculum v3, First Principles Handbook, Foundation Methodology*
