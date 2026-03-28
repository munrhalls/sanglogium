# Velocity Flash Training Subroutine (VFTS)
## Rapid-Fire Browser Chat Format for Real-Time Choice-Making Stress Testing
### Target: Sang Logium Velocity Dysfunction Patterns

**Format:** Browser-based flash chat (Gemini/Claude/ChatGPT interface ready)  
**Session Duration:** 10-20 minutes  
**Question Timing:** 30-60 seconds per question  
**Feedback Mode:** Immediate  
**Training Goal:** Expose velocity dysfunction patterns through rapid choice-making scenarios

---

## HOW TO USE THIS SUBROUTINE

1. **Copy the entire question bank** into a browser chat (Gemini Flash, Claude, or ChatGPT)
2. **Instruct the AI:** "I am doing rapid-fire velocity training. Ask me these questions one at a time. Wait for my answer. Give me immediate 1-sentence feedback (correct/incorrect + why). Then move to next question. No explanations longer than 1 sentence."
3. **Answer quickly** (15-30 seconds per question)
4. **Track your score** (Healthy vs. Dysfunction patterns)
5. **Review failed patterns** at end

---

## QUESTION BANK A: SCOPE DISCIPLINE (THE FENCED TERRITORY)

**Training Objective:** Recognize scope expansion in real-time and practice containment decisions

---

### Question A1: The Capacity Matrix
**Scenario:** You're building a carousel component. Scope contract says: "Carousel displays 3-6 product cards." You notice the component doesn't elegantly handle varying item counts. You think: "I should add a capacity matrix to dynamically adjust card sizes based on item count."  
**Your move:** Add the matrix or don't?  
**Answer:** DON'T. Forbidden Scope: "Do not add capacity matrix — hardcode for 3-6 products."  
**Why:** 200+ lines for edge case that scope excludes. 5-minute fix: hardcode. 14-day cost of matrix: your 17-day cycle.

---

### Question A2: The Shared Component Extraction
**Scenario:** You're building ProductCard for IemsGallery. You realize ProductCard logic is similar to FeaturedCard you built yesterday. You think: "I should extract a shared ProductCard component now so I don't have to refactor later."  
**Your move:** Extract now or not?  
**Answer:** DON'T. Forbidden Scope: "Do not extract ProductCard into shared component during this build."  
**Why:** You don't yet know all the places that need ProductCard. Extract when you have 3+ use cases and know the full interface.

---

### Question A3: The Animation Enhancement
**Scenario:** Carousel is working per DoD (single hover lift on cards). You notice the entrance animation could be smoother with staggered timing. You think: "I should add staggered entrance animation — it's only 30 lines."  
**Your move:** Add it or not?  
**Answer:** DON'T. Out of Scope: "Animated entrance on scroll."  
**Why:** DoD is binary. Working = locked. "Could be better" is not a criterion. Add to backlog for future sprint.

---

### Question A4: The TypeScript Generic
**Scenario:** You're typing a data fetch function. Current type: `fetchProducts(): Promise<Product[]>`. You think: "I should make this generic: `fetch<T>(): Promise<T[]>` so it's reusable for categories too."  
**Your move:** Add generic or keep specific?  
**Answer:** KEEP SPECIFIC. Forbidden Scope: "Do not generalize until 3rd use case."  
**Why:** You have one use case. Generalizing now = premature abstraction. YAGNI. Add generic when you actually have the 3rd use case and know the pattern.

---

### Question A5: The Config Touch
**Scenario:** You're styling a component. The color doesn't match Figma exactly. Current: `bg-blue-600`. Figma shows `bg-[#1E40AF]`. You think: "I should add this to tailwind.config.js colors so it's consistent."  
**Your move:** Add to config or use arbitrary?  
**Answer:** USE ARBITRARY. Forbidden Scope: "Do not touch Tailwind config."  
**Why:** Config change affects entire project, requires rebuild, risks breaking other components. Arbitrary value is scoped, reversible, zero blast radius.

---

### Question A6: The Quick Fix
**Scenario:** You're in Hero.tsx and notice Footer.tsx has a typo in a comment. You think: "I'll just fix this real quick since I'm here."  
**Your move:** Fix it or not?  
**Answer:** DON'T. Forbidden Scope: "No 'while I'm here' changes outside current file."  
**Why:** Context switch to unrelated file. 30-second fix becomes 5-minute context reload. Add to "Quick Fixes" backlog. Batch later.

---

### Question A7: The Edge Case Handler
**Scenario:** ProductCard DoD: "Display product image, name, brand, price." You notice some products might have missing images. You think: "I should add a skeleton state and error boundary for missing images."  
**Your move:** Add handling or not?  
**Answer:** DON'T. Out of Scope: "Skeleton loading state."  
**Why:** DoD assumes valid data. Edge case handling is a separate sprint: "Error States & Loading Patterns." Not this sprint.

---

### Question A8: The Mobile-First Violation
**Scenario:** You're building ProductCard desktop layout. You notice mobile layout will need different grid classes. You think: "I should just design both at once since I can see both requirements."  
**Your move:** Build both now or lock desktop first?  
**Answer:** LOCK DESKTOP FIRST. Scope contract: "Desktop DoD locked before mobile."  
**Why:** Building both = mixing Pass 3 layers. Finish desktop completely, lock it, then mobile. Sequential discipline prevents half-done components.

---

### Question A9: The Schema Addition
**Scenario:** You're querying Sanity for products. You need brand name. Current schema has brand as string. You think: "I should convert brand to a reference with full brand document so we can show brand logos later."  
**Your move:** Convert to reference or use string?  
**Answer:** USE STRING. Forbidden Scope: "Do not modify Sanity schema during this sprint."  
**Why:** Schema changes require migration, Studio updates, data backfill. String works now. Reference conversion is a separate data architecture sprint.

---

### Question A10: The Performance Optimization
**Scenario:** Homepage loads in 1.2s. You read about React Server Components and think: "I should refactor Hero to RSC to reduce bundle size."  
**Your move:** Refactor now or not?  
**Answer:** DON'T. Forbidden Scope: "No premature optimization without measured bottleneck."  
**Why:** 1.2s is acceptable for MVP. RSC refactor is high-risk, time-consuming. Optimize when you have <400ms target and measured waterfall.

---

## QUESTION BANK B: SEQUENTIAL DISCIPLINE (THE THREE-PASS MODEL)

**Training Objective:** Recognize pass violations and enforce correct sequencing

---

### Question B1: The Deep Dive Temptation
**Scenario:** You've built skeletons for 9 homepage components. Hero skeleton is rendering. You think: "Hero is the most important. I'll just fully build Hero now (styling, data, interactions) before moving to the other skeletons."  
**Your move:** Build Hero deep or complete all skeletons first?  
**Answer:** COMPLETE ALL SKELETONS. Three-Pass Rule: Pass 1 (Skeleton) for ALL components before Pass 2 (Data) for ANY.  
**Why:** Building Hero deep now = Pass 3 while Pass 1 incomplete elsewhere. Integration issues discovered late = rework.

---

### Question B2: The Data-Pass Styling
**Scenario:** You're in Pass 2 (Data) for ProductGrid. Data is flowing. You think: "While I'm connecting data, I might as well add the grid layout classes — it's just a few Tailwind classes."  
**Your move:** Add layout or stay in data-only mode?  
**Answer:** STAY DATA-ONLY. Three-Pass Rule: Pass 2 = data flow only. No styling beyond structural debug borders.  
**Why:** Mixing passes creates confusion. "Just a few classes" becomes 50 lines of styling. Pass 3 (Build) is for layout.

---

### Question B3: The Pass Confusion
**Scenario:** You've styled ProductCard to perfection (Pass 3). You move to ProductGrid and realize ProductCard needs a prop you didn't include. You think: "I'll quickly add the prop to ProductCard and update the styling there too while I'm at it."  
**Your move:** Modify locked component or create new scope?  
**Answer:** CREATE NEW SCOPE. ProductCard is LOCKED.  
**Why:** Locked = frozen. Any change requires new scope contract, time estimate, unlock decision. Don't touch locked components.

---

### Question B4: The Mobile Skip
**Scenario:** You've built all 9 components to desktop DoD. You're tired. Mobile layouts feel tedious. You think: "I'll ship desktop first, then circle back to mobile in a separate sprint."  
**Your move:** Ship desktop-only or per-component mobile?  
**Answer:** PER-COMPONENT MOBILE. Three-Pass Rule: Desktop DoD → LOCK → Mobile DoD → LOCK → Next component.  
**Why:** All-desktop-then-all-mobile doubles context-switching. You lose mental model of each component. Mobile gets rushed or skipped.

---

### Question B5: The Pass 2.5
**Scenario:** You've connected data for 3 of 9 components. You think: "These 3 are ready for styling. I'll start Pass 3 on them while finishing Pass 2 on the others."  
**Your move:** Parallel passes or sequential completion?  
**Answer:** SEQUENTIAL COMPLETION. Three-Pass Rule: Pass 2 for ALL before Pass 3 for ANY.  
**Why:** Parallel passes = contaminated workflow. Data issues in remaining 6 components might affect the 3 "ready" ones. Complete, then proceed.

---

### Question B6: The Quick Hover
**Scenario:** You're in Pass 2 (Data) connecting Sanity. The build works. You think: "I'll just add one quick hover state to ProductCard so I can see it working."  
**Your move:** Add hover or wait for Pass 3?  
**Answer:** WAIT FOR PASS 3. Three-Pass Rule: No interactions in Pass 2.  
**Why:** "One quick" interaction becomes rabbit hole of animation refinement. Pass 3 is the interaction layer. Stay in current pass.

---

### Question B7: The Skeleton Skip
**Scenario:** You can visualize the full ProductCard in your head. You think: "I see the whole component. I'll just build it fully now instead of wasting time on skeleton."  
**Your move:** Build full or start with skeleton?  
**Answer:** START WITH SKELETON. Three-Pass Rule: Pass 1 (Skeleton) mandatory for all components.  
**Why:** Mental visualization ≠ actual integration. Skeleton reveals component relationship issues before you've invested in styling.

---

### Question B8: The RWD Mix
**Scenario:** You're styling ProductCard desktop. You add classes: `grid-cols-4 gap-6 md:grid-cols-2`. You think: "I'll just add responsive classes as I go instead of separate desktop/mobile phases."  
**Your move:** Mixed responsive or sequential viewport locking?  
**Answer:** SEQUENTIAL VIEWPORT LOCKING. Build desktop completely, lock, then mobile.  
**Why:** Mixed responsive = neither viewport fully tested. Sequential locking ensures each viewport meets DoD independently.

---

## QUESTION BANK C: DoD LOCKING (COMPLETION VS. PERFECTION)

**Training Objective:** Distinguish "working" from "locked" and stop perfectionism loops

---

### Question C1: The 44px Tweak
**Scenario:** ProductCard is working. DoD checkboxes all checked. You measure touch target: 40px. WCAG minimum: 44px. You think: "I'll just adjust padding to hit exactly 44px."  
**Your move:** Adjust or lock?  
**Answer:** CHECK DoD. DoD says: "Touch targets ≥44px."  
**Why:** If DoD specifies 44px and you're at 40px, this is DoD completion work. If DoD says "≥44px" and you're ≥44px, lock it. Read DoD literally.

---

### Question C2: The Animation Polish
**Scenario:** Carousel hover works (card lifts 4px). DoD checked. You think: "The lift feels abrupt. I'll add a transition duration and easing function to make it smoother."  
**Your move:** Add transition or lock?  
**Answer:** LOCK. DoD says: "Single hover state: card lifts."  
**Why:** "Smoother" is beyond DoD. Feature works as specified. Perfectionism loop starting. Lock now.

---

### Question C3: The Edge Case Obsession
**Scenario:** ProductCard works for 95% of products. One product has a 200-character name that breaks layout. DoD says: "Product name displays." You think: "I need to fix this edge case before locking."  
**Your move:** Fix edge case or lock with known issue?  
**Answer:** LOCK WITH KNOWN ISSUE. DoD met for standard case.  
**Why:** DoD assumes standard data. Edge case = new scope: "Long Product Name Handling." Don't let edge cases block primary path completion.

---

### Question C4: The 48-Hour Test
**Scenario:** ProductCard works. DoD checked. It's 5 PM. You think: "I'll sleep on it and review tomorrow with fresh eyes before locking."  
**Your move:** Lock now or wait?  
**Answer:** LOCK NOW.  
**Why:** 48-hour rule applies to improvements, not locking. If DoD is met, lock immediately. Waiting = DoD confusion + potential perfectionism spiral.

---

### Question C5: The Secondary Feature
**Scenario:** ProductCard displays image, name, brand, price (DoD met). You think: "I should add the 'Add to Cart' button while I'm here — it's the next logical feature."  
**Your move:** Add button or lock?  
**Answer:** LOCK. Out of Scope: "'Add to cart' behavior."  
**Why:** Logical next feature ≠ this sprint's scope. Lock ProductCard. "Add to Cart" is separate component with separate scope.

---

### Question C6: The Code Review Standard
**Scenario:** ProductCard works. DoD checked. You imagine code review: "A senior dev would want cleaner TypeScript interfaces." You think: "I'll refactor the types before locking."  
**Your move:** Refactor or lock?  
**Answer:** LOCK.  
**Why:** Code review paranoia = perfectionism. Types work. DoD is functional, not aesthetic. Refactor in dedicated cleanup sprint if needed.

---

### Question C7: The Browser Testing
**Scenario:** ProductCard works in Chrome. DoD checked. You think: "I should test Safari and Firefox before locking to ensure cross-browser compatibility."  
**Your move:** Test all browsers or lock Chrome?  
**Answer:** CHECK DoD. DoD specifies browser support?  
**Why:** If DoD says "Chrome 120+" then lock. Cross-browser is separate DoD layer or separate sprint. Don't expand DoD implicitly.

---

### Question C8: The Refactoring Urge
**Scenario:** ProductCard works. DoD checked. You notice you could use a custom hook for the image loading logic. You think: "I should extract this to a hook for cleaner code."  
**Your move:** Extract hook or lock?  
**Answer:** LOCK.  
**Why:** "Cleaner" is not a DoD criterion. Code works. Extraction is refactor (Category C), not forward progress (Category A). Lock. Refactor later if pattern repeats 3x.

---

## QUESTION BANK D: REAL VS. ILLUSORY VELOCITY

**Training Objective:** Distinguish activity from progress; choose real velocity actions

---

### Question D1: The Commit Taxonomy
**Scenario:** You're deciding on commit message format. Option A: "Fix ProductCard" Option B: "Difficulty: 3 - A, Forward progress (ProductCard): implement image lazy loading — → closes DoD item [2.3] on HomepageSprint"  
**Your move:** Simple or detailed taxonomy?  
**Answer:** SIMPLE.  
**Why:** Detailed taxonomy (from audit) led to 61 "infrastructure, no DoD impact" commits. Time spent on taxonomy = illusory velocity. Simple message + forward progress = real velocity.

---

### Question D2: The Audit Report
**Scenario:** You notice VFS has 2 critical bugs. You think: "I'll write an audit report documenting these bugs in detail before fixing them."  
**Your move:** Write audit or fix bugs?  
**Answer:** FIX BUGS.  
**Why:** 29 audit reports generated while bugs remained. Auditing = feeling of progress without progress. Fixing = real velocity. Write 1-sentence issue, then fix.

---

### Question D3: The Sprint File
**Scenario:** Starting a new feature. You think: "I'll create a comprehensive sprint file with DoD layers, scope contracts, and test matrices before coding."  
**Your move:** Big sprint file or minimal scope contract?  
**Answer:** MINIMAL SCOPE CONTRACT.  
**Why:** 36 sprint files, 12 active (stalled). Sprint files = planning theater. One scope contract per component = sufficient. Start coding in <30 minutes.

---

### Question D4: The Workflow Documentation
**Scenario:** You notice .windsurf/workflows/ has empty files. You think: "I'll formalize all our workflows before the next sprint."  
**Your move:** Document workflows or ship feature?  
**Why:** SHIP FEATURE.  
**Why:** Workflow optimization = sophisticated procrastination. Empty workflow files don't block MVP. Unshipped features do. Real velocity = shipped user value.

---

### Question D5: The Metric Check
**Scenario:** You've made 10 commits today. 2 are A-category (forward progress), 8 are D-category (config/infrastructure). You feel productive.  
**Your move:** Continue current pattern or reassess?  
**Answer:** REASSESS.  
**Why:** Forward/Config ratio should be 3:1 minimum. Current: 1:4 = illusory velocity. Stop configuring. Ship one DoD-closing feature.

---

### Question D6: The Burst Pattern
**Scenario:** It's 11 PM. You've done 5 commits today. You're stuck on a bug. You think: "I'll push through and fix this tonight — maybe 10 more commits."  
**Your move:** Push through or stop?  
**Answer:** STOP.  
**Why:** March 8-9 burst (104 commits in 48h) = crisis recovery, not productivity. Late-night pushes = errors. Sleep, fresh start, 5-minute fix tomorrow.

---

### Question D7: The Tooling Upgrade
**Scenario:** You read about a new VS Code extension that improves Tailwind autocomplete. You think: "I'll install and configure this now — it'll speed up future work."  
**Your move:** Install now or defer?  
**Answer:** DEFER. Add to "Tools to Evaluate" backlog.  
**Why:** Tooling upgrades = illusory velocity. Current setup works. Extension evaluation = 30-60 min distraction. Batch tooling monthly, not daily.

---

### Question D8: The Conference Video
**Scenario:** You're stuck on an architecture problem. You think: "I'll watch a conference talk on VFS patterns for inspiration."  **Your move:** Watch video or debug code?  
**Answer:** DEBUG CODE.  
**Why:** "Research" = productive procrastination. You have VFS bugs. Conference talk won't fix them. Component archaeology protocol: analyze, orient, decide, act.

---

## QUESTION BANK E: STRESS-TEST SCENARIOS

**Training Objective:** High-pressure rapid decision making under time constraints

---

### Question E1: The Deadline Panic (30 seconds)
**Scenario:** Sprint ends tomorrow. You have 2 components: Hero (80% done, needs polish) and Footer (not started, skeleton only). Time for one.  
**Your move:** Polish Hero or build Footer?  
**Answer:** BUILD FOOTER SKELETON + DATA.  
**Why:** Hero polish = perfectionism. Footer skeleton + data = forward progress. Shipped MVP with 2 working components > 1 polished + 1 missing.

---

### Question E2: The Crisis Recovery (30 seconds)
**Scenario:** You accidentally deleted `lib/vfs/` directory. Git shows 50 files changed. You panic.  
**Your move:** Try to manually restore or git reset?  
**Answer:** `git reset --hard HEAD`.  
**Why:** Manual recovery = error cascade. Reset = clean slate. 5 minutes to recover vs. hours of partial fixes. Trust version control.

---

### Question E3: The Integration Blocker (30 seconds)
**Scenario:** ProductCard works in isolation. ProductGrid integration fails. You think: "I'll debug the integration for 2 hours until it works."  
**Your move:** Debug for 2 hours or time-box?  
**Answer:** TIME-BOX: 30 minutes. If not solved, write minimal reproduction, ask for help.  
**Why:** 2-hour meddling = out of scope per master-tasklist. 30-min time-box maintains sprint velocity. Asking = faster than stuck.

---

### Question E4: The Scope Creep Request (30 seconds)
**Scenario:** PM (you) asks: "While you're building ProductCard, can you also add a quick 'Compare' checkbox? It'll be useful later."  
**Your move:** Add it or push back?  
**Answer:** PUSH BACK.  
**Why:** "Quick" = scope creep. Compare feature = separate component, separate scope, separate sprint. Lock ProductCard. New scope for Compare.

---

### Question E5: The Perfectionism Trigger (30 seconds)
**Scenario:** ProductCard works. You show a friend. They say: "The shadow could be softer." You agree. You think: "Let me just tweak the shadow."  
**Your move:** Tweak shadow or lock?  
**Answer:** LOCK.  
**Why:** External feedback triggers perfectionism. DoD doesn't mention shadow softness. Friend's opinion ≠ DoD. Lock. Add to polish pass budget if compelling after 48h.

---

### Question E6: The Technical Debt Fear (30 seconds)
**Scenario:** ProductCard uses `any` for one prop. You think: "I should fix this type before locking or it'll become tech debt."  
**Your move:** Fix type or lock?  
**Answer:** LOCK.  
**Why:** `any` on one prop ≠ blocking tech debt. DoD met. Fix in dedicated type-safety sprint. Don't let perfect be enemy of shipped.

---

### Question E7: The AI Dependency (30 seconds)
**Scenario:** AI suggests: "You could also add error boundaries and loading states to make this production-ready."  
**Your move:** Follow AI suggestion or check scope?  
**Answer:** CHECK SCOPE.  
**Why:** AI suggestions = scope expansion triggers. Check scope contract. If not in IN SCOPE, ignore. AI doesn't know your sprint constraints.

---

### Question E8: The Refactor Rationalization (30 seconds)
**Scenario:** You've built 3 similar components. You think: "Now that I see the pattern, I should refactor all 3 to use a shared base component before moving to component 4."  **Your move:** Refactor now or complete all 9 first?  
**Answer:** COMPLETE ALL 9 FIRST.  
**Why:** Refactoring at 3/9 = mid-sprint architecture change. You don't know if pattern holds for all 9. Complete, then refactor if pattern confirmed.

---

## ANSWER KEY & PATTERN RECOGNITION

### Healthy Velocity Patterns (Choose These)

| Pattern | Indicator |
|---------|-----------|
| Scope Containment | Honoring Forbidden Scope list |
| Pass Discipline | Completing Pass N for ALL before Pass N+1 for ANY |
| DoD Locking | Locking when checkboxes checked, not when "perfect" |
| Real Progress | Category A commits > 50% of total |
| Time Boxing | 30-min limits on stuck problems |
| YAGNI | Not building for 3rd use case before 2nd exists |
| Sequential Locking | Desktop locked before mobile started |

### Dysfunction Patterns (Avoid These)

| Pattern | Indicator |
|---------|-----------|
| Scope Expansion | "This would be better if..." |
| Pass Violation | Deep work while skeletons incomplete |
| Perfectionism Loop | "Working but could be better" |
| Config Churn | Category D commits > 30% |
| Analysis Paralysis | Writing audits instead of fixing bugs |
| Premature Abstraction | Generalizing at 1st use case |
| Refactor Trap | Cleaning code that works |

---

## TRAINING PROTOCOLS

### Protocol 1: Daily 10-Minute Drill
1. Pick 10 random questions (mix of A-E)
2. Answer in 30 seconds each
3. Track score (Healthy/Dysfunction)
4. Review wrong answers
5. Target: 90% Healthy by week 4

### Protocol 2: Pre-Coding Priming (5 minutes)
1. Answer 5 questions from relevant bank
2. If score <80%, don't code yet
3. Review curriculum section
4. Re-test until 80%

### Protocol 3: Post-Sprint Retrospective (15 minutes)
1. Answer 20 questions covering sprint activities
2. Map your choices to questions
3. Calculate dysfunction rate
4. Set next sprint focus theme

### Protocol 4: Crisis Intervention (When stuck)
1. Answer 5 rapid questions about current situation
2. If 3+ answers are "Dysfunction" pattern
3. Stop current work
4. Revert to last known good state
5. Rewrite scope contract
6. Resume with strict protocol

---

## SCORING & PROGRESS TRACKING

### Individual Session Score
```
Total Questions: __
Healthy Pattern Answers: __
Dysfunction Pattern Answers: __
Accuracy: __%

Failed Question IDs: __
Primary Weakness Theme: __
```

### 4-Week Trend Targets

| Week | Target Accuracy | Primary Focus |
|------|-----------------|---------------|
| 1 | 60% | Awareness (recognizing patterns) |
| 2 | 70% | Containment (stopping expansion) |
| 3 | 80% | Discipline (sequential execution) |
| 4 | 90% | Mastery (automatic healthy choices) |

### Mastery Indicators
- Answer <10 seconds without hesitation
- Can explain why in 1 sentence
- Recognize personal triggers in real-time
- Automatic healthy choice under pressure

---

## INSTRUCTIONS FOR AI TRAINER

When user pastes this document into chat, respond:

```
VELOCITY FLASH TRAINING SUBROUTINE ACTIVATED

Mode: Rapid-fire choice-making stress test
Format: 30-second answer per question
Feedback: Immediate 1-sentence correction
Goal: Expose velocity dysfunction patterns

RULES:
1. Ask questions ONE AT A TIME
2. Wait for user answer (typed or voice)
3. Give immediate feedback: "CORRECT: [why]" or "INCORRECT: [why]"
4. No long explanations. 1 sentence max.
5. Track score silently
6. After 10 questions, show: "Score: X/10. Pattern: [theme]"
7. Offer: Continue, Review Failed, or End

READY? First question in 3... 2... 1...
```

Then begin with Question A1.

---

## APPENDIX: QUICK REFERENCE (Copy to Sticky Note)

**Before coding:**
- Scope contract written? Y/N
- Forbidden Scope clear? Y/N
- Which pass? 1/2/3

**During coding:**
- Scope expanded? Y/N
- Pass contaminated? Y/N
- DoD met? Y/N

**Before commit:**
- Component locked? Y/N
- Category A? Y/N
- Closes DoD? Y/N

**Stop if 2+ NO:** Revert, reassess, rewrite scope.

---

*Subroutine Version: 1.0*  
*Target: Sang Logium Velocity Dysfunction*  
*Based on: Commit Velocity Audit, March 28, 2026*  
*Method: Rapid-fire scenario stress-testing*
