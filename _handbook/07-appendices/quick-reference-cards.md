# Appendices: Quick Reference Cards

---

## QRC-1: The /Implement Protocol (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    /IMPLEMENT QUICK REFERENCE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INPUT: Rough Scope + Rough DoDs                                  │
│                      ↓                                              │
│  PHASE 1: PLAN AND CONTAIN (OUTPUT ONLY)                          │
│    1. Explicit Refined Scope                                        │
│    2. Explicit Refined DoDs                                         │
│    3. Read-Only Context Paths ← FORBIDDEN TO MODIFY                 │
│    4. Allowed Write Scope Paths ← ONLY THESE MAY CHANGE             │
│    5. Verification Command                                          │
│                      ↓                                              │
│  PHASE 2: EXECUTE (MODIFY FILES)                                  │
│    • Execute DoDs in exact order                                  │
│    • Contain all changes within Allowed Write Scope                 │
│    • Use scoped Tailwind only (no global CSS)                     │
│                      ↓                                              │
│  PHASE 3: VERIFY (RUN COMMAND)                                      │
│    • Execute verification command                                   │
│    • If fails: revert, re-evaluate, fix                           │
│    • Do NOT proceed until 100% pass                               │
│                      ↓                                              │
│  HUMAN VISUAL VERIFICATION (PAUSE)                                │
│    • UI/DOM state review required                                   │
│    • Type "approved" to continue                                    │
│                      ↓                                              │
│  COMMIT GENERATION (PRESENT MESSAGE)                              │
│    • Use taxonomy from COMMIT_TEMPLATE.txt                        │
│    • Do NOT auto-execute                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-2: The Component Archaeology Protocol (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│              COMPONENT ARCHAEOLOGY - DEBUG PROTOCOL                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  STEP 1: ANALYZE WHAT THE PROBLEM IS                               │
│    • Observed behavior vs Expected behavior                         │
│    • Precise technical description                                │
│                                                                     │
│  STEP 2: DETERMINE RELEVANT COMPONENTS                              │
│    • List all potentially involved components                     │
│    • Map data flow between them                                   │
│                                                                     │
│  STEP 3: INDIVIDUAL COMPONENT ANALYSIS                            │
│    • For each: state, props, logic, failure points                │
│                                                                     │
│  STEP 4: COMPONENT CHAIN ANALYSIS                                   │
│    • How do they interact as connected chain?                     │
│    • Where does data transform?                                 │
│                                                                     │
│  STEP 5: INVESTIGATE BEFORE PROPOSING SOLUTIONS                   │
│    • Add logging, verify assumptions                              │
│    • DO NOT FIX YET                                               │
│                                                                     │
│  STEP 6: SOLVE AS ASKED                                           │
│    • Minimal fix to root cause                                    │
│    • No bonus improvements                                          │
│    • Prefer upstream over downstream                              │
│                                                                     │
│  RULE: Prefer single-line changes when sufficient                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-3: The Four-Pass Component Build (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│           FOUR-PASS COMPONENT BUILD SEQUENCE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PASS 1 — SKELETON                                                  │
│    ✓ All components render without errors                           │
│    ✓ No styling                                                     │
│    ✓ No data (mock acceptable)                                    │
│    ✓ Build passes                                                   │
│                      ↓                                              │
│  PASS 2 — DATA                                                      │
│    ✓ Real data flows through all components                       │
│    ✓ No styling                                                     │
│    ✓ Data matches expected schema                                   │
│                      ↓                                              │
│  PASS 3 — DESKTOP (1280px)                                          │
│    Layer 1: Structure - Semantic HTML/JSX, no classes             │
│    Layer 2: Layout - Tailwind flex/grid/spacing only              │
│    Layer 3: Surface - Colors, typography, brand tokens              │
│    Layer 4: Interaction - Hover states, transitions                 │
│                      ↓                                              │
│  PASS 4 — MOBILE (375px)                                            │
│    [Same 4 layers, mobile viewport]                               │
│                                                                     │
│  CRITICAL RULE: Each pass locks before advancing.                 │
│  No mixing passes.                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-4: Commit Taxonomy Decision Tree (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│              COMMIT TAXONOMY DECISION TREE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Does this close a DoD item on a sprint?                            │
│                      ↓                                              │
│        ┌─────────────┴─────────────┐                                │
│       YES                          NO                               │
│        ↓                            ↓                               │
│   Use A - Forward              What type of work?                 │
│   Progress                          ↓                               │
│                      ┌──────────────┼──────────────┐              │
│                    Bug            Refactor        Config            │
│                     ↓               ↓               ↓               │
│                   Use B          Use C          Use D             │
│               Critical Fix                                    Polish│
│                                      ↓                              │
│                                    Config → Use E                   │
│                                    only                             │
│                                                                     │
│  DIFFICULTY:                                                      │
│  1 = trivial | 2 = easy | 3 = medium-easy | 5 = medium            │
│  8 = difficult | 13 = very difficult                              │
│                                                                     │
│  FORMAT:                                                          │
│  Difficulty: <N> - <A|B|C|D|E>, <Category> (<scope>): <action>    │
│  — → closes DoD item [N] on [SprintName]                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-5: Scope Threat Response (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│               SCOPE THREAT RESPONSE PROTOCOL                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DETECTED: "While I'm here, I should also fix..."                 │
│                      ↓                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  RESPONSE PROTOCOL                                             │  │
│  │                                                                │  │
│  │  1. STOP - Do not implement                                    │  │
│  │  2. DOCUMENT - Add to FUTURE_SPRINTS.md                        │  │
│  │  3. RETURN - Go back to original scope                         │  │
│  │  4. SCHEDULE - Plan separate sprint for the finding            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                      ↓                                              │
│  DOCUMENTATION TEMPLATE:                                            │
│  ```                                                               │
│  ## [Date] - While working on [Scope]                              │
│  - **Noticed:** [What was found]                                  │
│  - **Location:** [File/line]                                       │
│  - **Impact:** [If not fixed]                                      │
│  - **Suggested Sprint:** [When to address]                        │
│  ```                                                               │
│                                                                     │
│  EXCEPTION: Only fix now if:                                       │
│  • Can be completed in <15 minutes                                 │
│  • Doesn't require new tests                                       │
│  • Doesn't expand testing surface                                  │
│  • Human explicitly approves scope expansion                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-6: Timeline Defense - Daily Check (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│              DAILY COVER CHECK - TIMELINE DEFENSE                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SCOPE THREATS           [ ] Did I modify files outside scope?      │
│                          [ ] Did I fix anything "while I was there"?│
│                          [ ] Did scope expand beyond contract?      │
│                                                                     │
│  QUALITY THREATS         [ ] Did I commit code without tests?      │
│                          [ ] Did I skip visual verification?        │
│                          [ ] Did I test only on primary browser?   │
│                                                                     │
│  TIMELINE THREATS        [ ] Did any task take >50% longer?        │
│                          [ ] Did I discover new blockers?          │
│                          [ ] Am I waiting on dependencies?         │
│                                                                     │
│  COVERAGE VERIFICATION   [ ] Did I verify previous scope works?   │
│                          [ ] Did I run regression tests?         │
│                          [ ] Is critical path clear?                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  If ANY checked: STOP and escalate.                                │
│  If ALL unchecked: Continue with confidence.                       │
│                                                                     │
│  Threat Response:                                                  │
│  • Document the threat                                              │
│  • Assess impact on timeline                                        │
│  • Decide: absorb / escalate / replan                              │
│  • Never ignore - always address                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-7: The Cover & Move Strategy (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│               COVER & MOVE - TIMELINE STRATEGY                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  COVER (Establish Defensive Positions):                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Scope has explicit boundaries and trigger conditions            │
│  • Every critical path has enumerated test contracts               │
│  • Browser/device support is pre-defined and bounded               │
│  • Design system compliance is automated                           │
│  • Daily threat detection is ritualized                            │
│  • Definition of Done is explicit and verified                     │
│                                                                     │
│                      ↓ COVER SECURE? YES ↓                         │
│                                                                     │
│  MOVE (Advance Progress):                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Advance only when coverage is verified                          │
│  • Move: Cleanup → Integration → Testing → Launch                   │
│  • Each move follows Priority Connection sequence                   │
│  • Never advance leaving untested pathways behind                   │
│                                                                     │
│  PRIORITY CONNECTION SEQUENCE:                                     │
│  1. Foundation Coverage (Immediate)                               │
│     → Browser matrix, pathway enumeration, daily check              │
│                                                                     │
│  2. Scope Hardening (Concurrent)                                   │
│     → Trigger conditions, cleanup, visual checklist               │
│                                                                     │
│  3. Verification Coverage (Sequential)                             │
│     → Pathway tests, cross-browser, visual regression             │
│                                                                     │
│  4. Launch Readiness (Final)                                       │
│     → DoD verification, regression suite, post-build check        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-8: Agent Selection Matrix (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   AGENT SELECTION MATRIX                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TASK TYPE          │ PRIMARY AGENT    │ CHECKPOINTS                 │
│  ───────────────────┼──────────────────┼────────────────────────────│
│  New feature        │ /implement       │ Visual verification         │
│  Bug investigation  │ /debug           │ Root cause approval         │
│  Production hotfix  │ /debug → /impl   │ Urgent review               │
│  Refactoring        │ /implement       │ Regression testing          │
│  Test creation      │ /test            │ Coverage review             │
│  Sprint planning    │ /sprint          │ Scope approval              │
│  Code auditing      │ /audit           │ Finding review              │
│  Documentation      │ /research        │ Accuracy check              │
│  Git operations     │ /commit          │ Pre-commit review           │
│                                                                     │
│  MULTI-AGENT WORKFLOWS:                                            │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  New Feature:   /sprint → /implement → /test → /commit             │
│                                                                     │
│  Bug Fix:       /debug → [human approves] → /implement → /test       │
│                                                                     │
│  Refactor:      /sprint → /implement → /audit → /commit            │
│                                                                     │
│  NAMING CONVENTION: [TYPE][##]_[SCOPE]_[STATUS]                   │
│  D=Debug I=Implement T=Test A=Audit R=Research F=Fix S=Sprint      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-9: The Layer Sequencing Rules (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│                 LAYER SEQUENCING RULES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FOR SPRINTS (High Level):                                         │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│  Pass 1 — Skeleton:     All components, NO styling                 │
│           ↓                                                         │
│  Pass 2 — Data Pass:   All components, REAL data, NO styling     │
│           ↓                                                         │
│  Pass 3 — Build Pass:  One component at a time, FULL scope         │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  WITHIN PASS 3 (Per Component):                                    │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│  Layer 1 — Structure:  Semantic HTML/JSX skeleton                │
│                        • No classes                               │
│                        • No logic                                 │
│                        • Pure markup structure                    │
│           ↓                                                         │
│  Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing         │
│                        • No colors                                │
│                        • No typography                            │
│                        • No borders                               │
│           ↓                                                         │
│  Layer 3 — Surface:      Colors, typography, brand tokens         │
│                        • Design system tokens only                │
│                        • No arbitrary values                      │
│           ↓                                                         │
│  Layer 4 — Interaction:  Hover states, transitions, animations      │
│                        • Progressive enhancement                  │
│                        • Performance-conscious                      │
│                                                                     │
│  CRITICAL: Each layer locks before next. No mixing.               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QRC-10: The "NOT TO-DO" Triggers (One Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│              NOT TO-DO LIST - OPERATIONAL TRIGGERS                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  AVOID ONE-OFF'S                                                     │
│  Trigger: Before any "quick addition"                              │
│  Check:  [ ] Exists elsewhere in codebase? → Use existing         │
│          [ ] Can be reused in 3+ places? → If no, it's one-off     │
│          [ ] Increases testing surface? → Evaluate cost            │
│          [ ] Can be deferred? → Add to FUTURE_SPRINTS.md           │
│                                                                     │
│  NO PREMATURE OPTIMIZATION                                           │
│  Trigger: When considering optimization                             │
│  Check:  [ ] Measured bottleneck affecting UX? → YES, optimize    │
│          [ ] Security vulnerability? → YES, optimize              │
│          [ ] Data integrity risk? → YES, optimize                   │
│          [ ] "Might be slow someday"? → NO, measure first           │
│          [ ] "This is inefficient" (no data)? → NO, measure first   │
│                                                                     │
│  NO PREMATURE ABSTRACTION                                            │
│  Trigger: When considering abstraction                              │
│  Check:  [ ] Needed in 3+ places? → If no, wait                   │
│          [ ] Can be deferred? → Document, don't do                │
│                                                                     │
│  NO MANY PRIORITIES                                                  │
│  Trigger: When adding a priority                                   │
│  Check:  [ ] Currently <3 active priorities? → OK to add          │
│          [ ] 3+ active priorities? → Complete one first           │
│                                                                     │
│  NO AVAILABILITY FIXES                                               │
│  Trigger: "While I'm here..."                                      │
│  Check:  [ ] <15 min to complete?                                   │
│          [ ] No new tests needed?                                   │
│          [ ] No scope expansion?                                    │
│          → ALL YES: Can fix now                                     │
│          → ANY NO: Add to FUTURE_SPRINTS.md                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

**End of Quick Reference Cards**
