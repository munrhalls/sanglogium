# Laws of Combat: Cover & Move - Timeline Defense Strategy
## Sang-Logium Project: Achieving Sum Total Timeline Coverage

**Document Purpose**: Systematic defense against time sinks, scope creep, and timeline erosion through verifiable, actionable strategies derived from software engineering best practices and military maneuver principles.

**Date**: 2026-03-27
**Classification**: Strategic Planning - EXECUTE ONLY

---

## Executive Summary

**"Cover & Move" Applied to Software Development**

The military concept of "cover and move" translates directly to software project management:
- **Cover**: Establish defensive positions that protect the timeline (testing, validation, scope enforcement)
- **Move**: Advance only when coverage is secure (no scope expansion without verification)
- **Never leave the timeline uncovered**: Every critical path must have defensive checkpoints

**Current Assessment of Master Task List**

| Element | Coverage Status | Risk Level | Action Required |
|---------|----------------|------------|-----------------|
| Visual Polish | Defined but unverified | MEDIUM | Needs concrete verification criteria |
| RWD (Portrait/Landscape) | Defined but unverified | HIGH | Must specify breakpoint testing matrix |
| End-to-End Testing | Defined but unverified | HIGH | Needs explicit pathway enumeration |
| Cross-Browser | Defined but unverified | HIGH | No browser matrix defined |
| Cross-Device (Old iOS/Android) | Defined but unverified | CRITICAL | This is a timeline killer if not bounded |
| One-Off Prevention | Acknowledged | LOW | Good - keep this |
| Premature Optimization Ban | Acknowledged | LOW | Good - but needs definition of "when" |

**Critical Gap Identified**: Your "NOT TO-DO LIST" is excellent philosophically, but lacks **trigger conditions** - when do these rules get enforced? Without explicit triggers, they become aspirational rather than operational.

---

## Thematic Organization: The 6 Pillars of Timeline Coverage

### PILLAR 1: Scope Fortification (Preventing Scope Creep)

**The Core Principle**: Scope creep is the #1 timeline killer. It doesn't announce itself - it arrives disguised as "small requests" and "quick fixes."

**Research Findings**:
- Asana research identifies 7 root causes: no scope definition, poor communication, unclear objectives, unrealistic objectives, too many stakeholders, ineffective change control, last-minute feedback
- Your existing `CATALOGUE_MIGRATION_SCOPE_DRIFT.md` confirms: "Scope focused on data migration without considering consumer impact"

**Your Current Task List Analysis**:
```
[ ] avoid one-off's
[ ] premature optimization
[ ] premature abstraction
[ ] tackling many priorities at once
[ ] fix something because of availability
```
**Strength**: You recognize these dangers
**Gap**: No enforcement mechanism, no early warning triggers

**Actionable Countermeasures**:

1. **The "Availability Fix" Trigger Protocol**
   - **Current State**: You correctly identify that fixing something "because of availability" violates timeline priorities
   - **Missing**: A decision tree for when "while I'm here" is actually acceptable
   - **Rule**: Only fix tangential issues if they can be completed in <15 minutes AND don't require testing beyond the current scope

2. **One-Off Prevention Checklist**
   - Before implementing any "quick addition":
     - [ ] Does it exist elsewhere in the codebase? (If yes, use existing pattern)
     - [ ] Can it be reused in 3+ places? (If no, it's a one-off)
     - [ ] Does it increase testing surface area? (If yes, evaluate cost)
     - [ ] Can it be deferred to a dedicated scope? (If yes, defer)

3. **Premature Optimization Decision Matrix**
   - The research confirms: "Premature optimization is the root of all evil" - but this is often misused as excuse for ignorance
   - **When TO optimize**:
     - Measured bottleneck affecting user experience
     - Security vulnerability
     - Data integrity risk
   - **When NOT to optimize**:
     - "This might be slow someday"
     - "This is inefficient" (without measurement)
     - Refactoring for "cleaner code" mid-sprint

**Integration with Your Task List**:
- Add to `The big NOT TO-DO LIST`: Specific trigger conditions for each item
- Create a `Scope Decision Log` documenting every time you say "no" to scope expansion

---

### PILLAR 2: Verification Depth (End-to-End Coverage)

**The Core Principle**: Build success ≠ Functional success. Your `CATALOGUE_MIGRATION_SCOPE_DRIFT.md` proves this: "Build passed but runtime errors occurred."

**Your Current State**:
```
The scope
    [ ] It's professionally functional, end-to-end, all critical pathways are fully checked and tested
```

**Gap**: "Fully checked and tested" is undefined. Without explicit pathway enumeration, this becomes unverifiable.

**Research-Based Solution**:

From Atlassian's Definition of Done research: "All code has been thoroughly tested via unit, integration, and end-to-end tests. Product increment has been deployed to a staging environment and tested by the team."

**Critical Pathway Enumeration for Sang-Logium**:

Based on your project structure, these pathways MUST be enumerated and tested:

**Tier 1: Revenue-Critical (Launch Blocker)**
1. Product catalog → Product detail page → Add to cart
2. Cart → Checkout → Payment (Stripe) → Order confirmation
3. Search → Results → Product detail
4. Navigation → Category → Filter → Sort → Product selection

**Tier 2: User Experience-Critical (Launch Blocker)**
1. Homepage load → Hero interaction → Featured product navigation
2. Mobile navigation drawer → Category selection
3. Account creation → Login → Order history
4. Basket management → Quantity update → Removal

**Tier 3: Operational-Critical (Post-Launch)**
1. Admin order management → Status updates
2. Inventory synchronization
3. Analytics tracking

**Actionable Testing Strategy**:

1. **The "Pathway Contract" Pattern**
   - Each pathway gets a contract file: `tests/contracts/[pathway-name].test.ts`
   - Contract tests the full chain: data fetch → render → interaction → outcome
   - Example structure from your existing work:
     ```typescript
     // tests/contracts/catalogue-to-product.test.ts
     describe('Catalogue → Product Critical Path', () => {
       it('renders category from VFS index', () => {})
       it('navigates to product detail', () => {})
       it('displays correct pricing', () => {})
       it('handles out-of-stock state', () => {})
     })
     ```

2. **Definition of Done (DoD) Template**
   - Based on industry research, your DoD must include:
     - [ ] Unit tests passing (>80% coverage for new code)
     - [ ] Integration tests for data fetching patterns
     - [ ] E2E tests for Tier 1 pathways
     - [ ] Visual regression for design system components
     - [ ] Mobile viewport testing (320px, 375px, 414px)
     - [ ] Cross-browser verification (Chrome, Safari, Firefox)

3. **The Build ≠ Function Verification Protocol**
   - From your scope drift lesson: "Build verification + runtime verification"
   - Create a `post-build-checklist.md` that runs AFTER every successful build:
     - [ ] Dev server starts without errors
     - [ ] Homepage loads in <3s
     - [ ] Navigation renders correctly
     - [ ] At least one critical path manually verified

---

### PILLAR 3: Cross-Browser & Device Reality

**The Core Principle**: "Full cross-device testing, works even on old iPhones and Androids" is a timeline death sentence unless bounded.

**Research Findings**:
- Cross-browser testing is time-consuming without strategy
- Frugal Testing research: "Resolving compatibility issues often delays project timelines"
- Industry best practice: Define supported browser matrix FIRST, then test

**Your Current Task**:
```
[ ] Full cross-browser testing, compatibility
[ ] Full cross-device testing, compatibility, works even on old iphones and androids
```

**Critical Issue**: "Old iPhones and Androids" is undefined. iPhone 6? Android 5? This ambiguity is a timeline risk.

**Actionable Strategy**:

1. **Define the Browser/Device Matrix**
   - **Tier 1 (Must Support)**:
     - Chrome (latest 2 versions)
     - Safari (latest 2 versions)
     - iOS Safari (latest 2 iOS versions)
   - **Tier 2 (Should Support)**:
     - Firefox (latest)
     - Chrome mobile (latest)
     - Samsung Internet (latest)
   - **Tier 3 (Best Effort)**:
     - IE11 (if business requires)
     - Old Android (Android 8+)
     - Old iOS (iOS 12+)

2. **The Progressive Enhancement Rule**
   - Core functionality MUST work in Tier 1
   - Enhanced features (animations, advanced CSS) can degrade gracefully in Tier 3
   - Document degradation strategy per feature

3. **Automated Testing Strategy**
   - Your existing Playwright setup is the right tool
   - Configure `playwright.config.ts` with explicit project matrix:
     ```javascript
     projects: [
       { name: 'chromium', use: { browserName: 'chromium' } },
       { name: 'webkit', use: { browserName: 'webkit' } },
       { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
       { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
     ]
     ```

4. **Old Device Reality Check**
   - Testing on "old iPhones and Androids" requires:
     - Physical device lab OR
     - BrowserStack/LambdaTest subscription ($$) OR
     - Simulator testing (limited accuracy)
   - **Recommendation**: Define "old" as iOS 14+ and Android 10+ for launch
   - Document older device support as post-launch enhancement

---

### PILLAR 4: Design System Adherence (Visual Polish Coverage)

**The Core Principle**: "Extremely visually polished" is achievable only with systematic verification, not subjective evaluation.

**Your Current State**:
```
The scope
    [ ] It's extremely visually polished and beautiful
```

**Gap**: No verification criteria for "polished and beautiful."

**Research Integration**:

From your `HOMEPAGE_DESIGN_SYSTEM_ADHERENCE_SPRINT.todo`, you already have:
- Complete design token inventory (colors, typography, spacing)
- Component class system (btn-*, card-*, input-*)
- 14 components analyzed with 3 low-severity exceptions

**Actionable Strategy**:

1. **The Visual Polish Checklist**
   - [ ] No hardcoded colors (verified via AST parsing)
   - [ ] No arbitrary Tailwind values (unless whitelisted)
   - [ ] Typography uses type-* classes exclusively
   - [ ] Spacing uses design tokens
   - [ ] Border radius uses token scale (sm, md, lg)
   - [ ] Shadows use defined shadow tokens
   - [ ] All images have proper aspect ratios
   - [ ] Hover states defined for all interactive elements
   - [ ] Focus states accessible
   - [ ] Loading states defined

2. **Visual Regression as Coverage**
   - Implement per your existing sprint plan:
     - Baseline screenshots for each homepage section
     - Playwright visual comparison tests
     - CI-integrated diff detection
   - **Key Point**: This is defensive coverage - catches unintended changes

3. **The "Beautiful" Definition**
   - Subjective quality needs reference points:
   - [ ] Consistent with competitor benchmarks (define 3 reference sites)
   - [ ] Animation smoothness (60fps target)
   - [ ] Typography hierarchy clear at all viewports
   - [ ] Color contrast WCAG AA compliant
   - [ ] No layout shifts during load (CLS < 0.1)

---

### PILLAR 5: Critical Path Management (Schedule Defense)

**The Core Principle**: The critical path determines earliest completion. Any slippage on the critical path directly delays launch.

**Research Findings**:
- Safran Project research: "Establishing a valid critical path is essential as it allows you to examine the effects of slippage as the project progresses"
- Critical path activities require "extra focus, energy, and attention"
- "The use of constraints and lags hinder free flowing paths and prohibit accurate float calculations"

**Your Current Task**:
```
[ ] COVER SUM TOTAL TIMELINE OF ENTIRE SANG-LOGIUM DONE
```

**Actionable Critical Path Strategy**:

1. **Identify the True Critical Path**
   Based on your existing sprints, the critical path is:
   ```
   VFS Data Integrity (COMPLETE)
   → Navigation Migration (COMPLETE)
   → Filter/Sort Legacy Cleanup (IN PROGRESS)
   → Product Page Critical Path Testing
   → Cross-Browser Verification
   → Launch
   ```

2. **The "Float" Concept Applied to Software**
   - Activities with "float" can slip without affecting launch
   - Activities on the critical path have ZERO float
   - Your scope has undefined float - everything seems critical

3. **Scope Sequencing Principles**
   - **Parallelizable**: Design system tests, visual regression setup
   - **Sequential (Critical Path)**: VFS cleanup → Product query integration → Checkout E2E
   - **Deferrable**: Search VFS integration, admin polish, analytics

4. **Schedule Risk Analysis**
   - Your current sprint structure is actually well-sequenced
   - Risk lies in: Legacy cleanup expanding into full refactor
   - **Coverage**: Define explicit "stop points" for each cleanup task

---

### PILLAR 6: Timeline Threat Detection (Early Warning System)

**The Core Principle**: Timeline threats don't announce themselves. You need active detection systems.

**Research-Based Warning Signs**:

From scope creep research:
1. No project scope → drifting requirements
2. Poor communication → misaligned expectations
3. Unclear objectives → working on wrong things
4. Too many stakeholders → conflicting priorities
5. Last-minute feedback → rework

**Your Project-Specific Threat Indicators**:

1. **The "Just While I'm Here" Alert**
   - Trigger: Finding yourself modifying files outside the current scope
   - Response: STOP. Document the finding. Schedule separate scope.

2. **The Legacy Cleanup Trap**
   - Trigger: "While fixing X, I noticed Y is also broken..."
   - Risk: Cleanup expands geometrically
   - Coverage: Strict 1:1 rule - one legacy fix per scope contract

3. **The Cross-Device Scope Expansion**
   - Trigger: Discovering iPhone 6 layout issues
   - Risk: Infinite device support rabbit hole
   - Coverage: Pre-defined device matrix (see PILLAR 3)

4. **The Perfect Polish Loop**
   - Trigger: "Just one more tweak to make it perfect"
   - Risk: Diminishing returns on visual polish
   - Coverage: Define "good enough" criteria per component

5. **The Testing Delay Pattern**
   - Trigger: "I'll write tests after I finish the feature"
   - Risk: Never-written tests, untested code in production
   - Coverage: Tests written BEFORE feature is marked complete

**Threat Detection Dashboard**:

Create a `DAILY_COVER_CHECK.md` with these questions:
```
## Daily Timeline Defense Check

### Scope Threats
- [ ] Did I modify any files outside today's scope?
- [ ] Did I fix anything "while I was there"?
- [ ] Did scope expand beyond the sprint contract?

### Quality Threats
- [ ] Did I commit code without tests?
- [ ] Did I skip visual verification?
- [ ] Did I test only on my primary browser?

### Timeline Threats
- [ ] Did any task take >50% longer than estimated?
- [ ] Did I discover new blockers?
- [ ] Am I waiting on external dependencies?

### Coverage Verification
- [ ] Did I verify the previous scope is still working?
- [ ] Did I run regression tests?
- [ ] Is the critical path still clear?
```

---

## Priority Connection: Start to End

### Phase 1: Foundation Coverage (IMMEDIATE)
**Goal**: Establish defensive positions before advancing

**Priority Order**:
1. **Define Browser/Device Matrix** (PILLAR 3)
   - This bounds a major timeline risk
   - Creates testable criteria for cross-device tasks

2. **Enumerate Critical Pathways** (PILLAR 2)
   - List all Tier 1 pathways explicitly
   - Create pathway contract files
   - This makes "end-to-end" verifiable

3. **Create Daily Cover Check** (PILLAR 6)
   - Establish threat detection habit
   - Document in `DAILY_COVER_CHECK.md`

### Phase 2: Scope Hardening (CONCURRENT)
**Goal**: Prevent scope creep through enforcement mechanisms

**Priority Order**:
4. **Add Triggers to NOT TO-DO List** (PILLAR 1)
   - Make each item actionable
   - Define decision criteria

5. **Complete Filter/Sort Legacy Cleanup** (PILLAR 5)
   - This is on your critical path
   - Define explicit stop point

6. **Visual Polish Checklist** (PILLAR 4)
   - Verify against existing design system audit
   - Complete the 3 low-severity exceptions

### Phase 3: Verification Coverage (SEQUENTIAL)
**Goal**: Ensure nothing advances without verification

**Priority Order**:
7. **Pathway Contract Tests** (PILLAR 2)
   - One test per Tier 1 pathway
   - Must pass before launch

8. **Cross-Browser Test Suite** (PILLAR 3)
   - Configure Playwright matrix
   - Run on every PR

9. **Visual Regression Baselines** (PILLAR 4)
   - Capture homepage section baselines
   - CI integration

### Phase 4: Launch Readiness (FINAL)
**Goal**: Verify coverage is complete

**Priority Order**:
10. **Definition of Done Verification**
    - Run through complete DoD checklist
    - Verify all Tier 1 pathways tested
    - Confirm browser matrix tested

11. **Regression Test Suite**
    - Run full suite (your existing 27 tests)
    - Verify no regressions

12. **Post-Build Verification**
    - Manual critical path walkthrough
    - Performance benchmark check
    - Mobile viewport verification

---

## Specific Evaluation: Your Master Task List

### Items That Are STRONG (Keep As-Is)

```
✔ add regression tests instructions to /sprint command
✔ add themes of scope and layer sequencing to /sprint
✔ update sprint to include design system coherence first
✔ write and launch prompt: /sprint -> entire architecture

The big NOT TO-DO LIST
    [ ] avoid one-off's
    [ ] premature optimization
    [ ] premature abstraction
    [ ] tackling many priorities at once
    [ ] fix something because of availability - NO
```

**Verdict**: These demonstrate excellent strategic awareness. Keep them.

### Items Needing HARDENING (Add Verification)

```
The scope
    [ ] It's extremely visually polished and beautiful
```
**Issue**: Subjective, unverifiable
**Hardening**: Add the Visual Polish Checklist (PILLAR 4)

```
    [ ] It's professionally robust, complete, full RWD portrait/landscape modes, zero bugs
```
**Issue**: "Zero bugs" is aspirational; "portrait/landscape" needs breakpoints
**Hardening**: Define breakpoint matrix (320×568, 375×667, 414×896, 768×1024, 1024×768, etc.)

```
    [ ] It's professionally functional, end-to-end, all critical pathways are fully checked and tested
```
**Issue**: "All critical pathways" is undefined
**Hardening**: Enumerate pathways explicitly (PILLAR 2)

```
    [ ] Full cross-browser testing, compatibility
    [ ] Full cross-device testing, compatibility, works even on old iphones and androids
```
**Issue**: "Full" and "old devices" are timeline risks
**Hardening**: Define browser/device matrix (PILLAR 3)

---

## Brainstorming: Additional Timeline Coverage Strategies

### The "Scope Sanctuary" Concept
- Create a `FUTURE_SPRINTS.md` file
- When you encounter something tempting to fix "while you're there":
  - Document it in FUTURE_SPRINTS instead of fixing
  - This acknowledges the finding without scope creep
  - Creates a backlog for post-launch

### The "Friday Freeze" Protocol
- No new features committed on Fridays
- Fridays are for: testing, verification, documentation
- Prevents weekend debugging of Friday commits

### The "Demo Threshold" Rule
- Every scope must be demo-able to an imaginary stakeholder
- If you can't demo it, it's not done
- Forces integration over isolated components

### The "One Browser, One Day" Strategy
- Don't try to fix all cross-browser issues simultaneously
- Allocate specific days: "Monday is Safari day"
- Prevents context switching overhead

### The "Legacy Cleanup Budget"
- Allocate specific time budget for legacy cleanup
- When budget exhausted, stop cleanup
- Document remaining debt for future sprints

### The "Performance Budget" Enforcement
- Define Core Web Vitals thresholds
- Any commit that degrades thresholds must be fixed before merge
- Prevents performance regression accumulation

---

## Summary: The Cover & Move Protocol for Sang-Logium

**What "Cover" Means Here**:
1. Scope has explicit boundaries and trigger conditions
2. Every critical path has enumerated test contracts
3. Browser/device support is pre-defined and bounded
4. Design system compliance is automated
5. Daily threat detection is ritualized
6. Definition of Done is explicit and verified

**What "Move" Means Here**:
1. Advance only when coverage is verified
2. Move from VFS cleanup → Product integration → Testing → Launch
3. Each move follows the Priority Connection sequence
4. Never advance leaving untested pathways behind

**Your Immediate Next Actions**:

1. **TODAY**: Define browser/device matrix (30 minutes)
   - Document in `docs/browser-support-matrix.md`
   - This bounds a major timeline risk

2. **THIS WEEK**: Enumerate Tier 1 critical pathways
   - List all revenue-critical user flows
   - Create pathway contract files

3. **THIS WEEK**: Add triggers to NOT TO-DO list
   - Make each philosophical principle actionable
   - Define decision criteria

4. **ONGOING**: Daily Cover Check ritual
   - Use the provided template
   - Document threats detected and mitigated

**The Bottom Line**:

Your master task list demonstrates sophisticated understanding of software development risks. The gap is not in awareness—it's in **operationalization**. This document provides the specific, actionable mechanisms to convert your philosophical "NOT TO-DO" list into defensive coverage that actually protects the timeline.

**Cover first. Then move. Never leave the timeline exposed.**

---

## Appendix: Quick Reference Cards

### QRC-1: Scope Threat Response
```
DETECTED: "While I'm here, I should also fix..."
RESPONSE:
1. Stop. Do not implement.
2. Document in FUTURE_SPRINTS.md
3. Return to original scope
4. Schedule separate sprint for the finding
```

### QRC-2: Device Testing Priority
```
Tier 1 (Must Pass): Chrome Latest, Safari Latest, iOS Latest
Tier 2 (Should Pass): Firefox, Chrome Mobile, Samsung Internet
Tier 3 (Best Effort): Android 10+, iOS 14+
DECISION: If Tier 3 fails, document and defer
```

### QRC-3: Definition of Done Checklist
```
[ ] Unit tests >80% coverage
[ ] Integration tests for data fetching
[ ] E2E test for critical pathway
[ ] Mobile viewport verified (320px, 375px, 414px)
[ ] Cross-browser verified (Chrome, Safari, Firefox)
[ ] Visual regression passed
[ ] No hardcoded values (AST scan)
[ ] Design system tokens only
```

### QRC-4: The "Good Enough" Criteria
```
Visual Polish: All checklist items pass
Functionality: All Tier 1 pathways tested
Performance: Core Web Vitals green
Compatibility: Tier 1 + Tier 2 passing
Bugs: No P0 or P1 open
```

---

**Document End**
**Action Required**: Review, adopt strategies, execute with coverage.
