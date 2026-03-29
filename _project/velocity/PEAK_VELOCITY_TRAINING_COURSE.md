# The Peak Velocity Training Course
## Ericsson-Based Deliberate Practice for Web Development Velocity
### Externally Anchored • Lowest-Friction • Immediate Feedback • Codebase-Specific

**Version:** 1.0
**Based on:** Ericsson, K. A. (2016). *Peak: Secrets from the New Science of Expertise*
**Target:** Sang Logium Velocity Dysfunction Patterns
**Format:** Daily 15-minute micro-practice with real codebase
**Duration:** 4-6 weeks to automaticity

---

## EXECUTIVE SUMMARY: THE PEAK PRINCIPLES APPLIED

### From Peak: The Deliberate Practice Framework

Ericsson's research identified that expertise emerges from **deliberate practice**, not mere experience. The core elements:

1. **Mental Representations** - Internal models of what "correct" looks like
2. **Immediate Feedback** - Real-time correction at the edge of comfort
3. **Effortful Engagement** - Tasks just beyond current capability
4. **Repetition with Refinement** - Same patterns, progressive difficulty
5. **External Anchoring** - Feedback from reality, not self-assessment

### The Velocity Application

Your velocity dysfunction is a **mental representation deficiency**. You lack internal models for:
- Scope containment (the "fence" concept)
- Sequential discipline (the "three-pass" concept)
- DoD locking (the "gate" concept)
- Real vs. illusory progress (the "outcome" concept)

This course builds these representations through **externally-anchored micro-practice** using your actual codebase as the training ground.

---

## PART 1: THE TRAINING ARCHITECTURE

### 1.1 The Core Insight: Why Traditional Training Fails

**Traditional approach:**
- Read about velocity (knowledge)
- Plan to apply it (intention)
- Try during real work (transfer gap)
- Fail under pressure (revert to patterns)

**Peak approach (this course):**
- Micro-practice specific patterns (skill)
- Immediate external feedback (reality-anchored)
- Daily repetition with codebase (contextualized)
- Automatic response formation (habit)

**The difference:** Knowledge ≠ Skill. Reading about velocity won't stop your 17-day cycle. Practicing the specific choice-points will.

### 1.2 The Three-Pillar Training Design

**Pillar 1: Micro-Practice (The What)**
- 15 minutes daily
- Single velocity pattern per session
- Repeated 10-15 times per session
- Immediately adjacent to real work

**Pillar 2: External Anchoring (The Reality)**
- Uses your actual commit history
- Uses your actual sprint files
- Uses your actual codebase files
- Feedback from git log, not self-report

**Pillar 3: Contrast Training (The Comparison)**
- Healthy vs. dysfunctional choice pairs
- Explicit comparison on identical scenarios
- Immediate correct answer revelation
- Physical sensation of wrongness development

### 1.3 The Training Formats (Lowest-Friction Hierarchy)

**Format 1: The Pre-Commit Protocol (30 seconds)**
Friction: Near-zero (happens before every commit)
Feedback: Immediate (commit categorization)
Anchor: Git log shows pattern immediately

**Format 2: The 15-Minute Morning Drill (Daily)**
Friction: Low (requires only terminal + browser)
Feedback: Immediate (timer + pattern recognition)
Anchor: Uses yesterday's actual commits

**Format 3: The Component Lock Ritual (Per Component)**
Friction: Low (part of normal workflow)
Feedback: Delayed 1 hour (48-hour rule test)
Anchor: DoD checklist reality

**Format 4: The Sprint Retrospective (Weekly)**
Friction: Medium (requires analysis)
Feedback: Weekly trend visualization
Anchor: Sprint file + commit log cross-reference

---

## PART 2: THE FIVE MENTAL REPRESENTATIONS

### Representation 1: The Fenced Territory

**Ericsson Principle:** Mental representations allow experts to see patterns novices miss.

**Your Current State:** You don't "see" scope expansion happening. It feels like improvement, not violation.

**The Representation:**
```
Imagine a physical fence around your desk. Everything inside: allowed.
Everything outside: invisible. The fence has a written sign listing
EXACTLY what's inside. If it's not on the sign, it doesn't exist.

The skill: Feeling the "bump" when you hit the fence.
```

**Training Exercise: The Fence Bump Detection (5 minutes daily)**

1. Open your current sprint file
2. Read the IN SCOPE list
3. Read the FORBIDDEN SCOPE list
4. Look at your last 5 commits
5. For each commit, ask: "Did I hit the fence?"
6. Log: Which commits crossed the fence? What was the trigger?

**External Anchor:** Git log shows reality. Your feeling of "productivity" vs. commits that closed DoD items.

**Feedback Loop:** Daily comparison of "feeling productive" vs. "actually productive" (DoD closures).

---

### Representation 2: The Three-Pass Sequence

**Ericsson Principle:** Expert performance is sequential, not parallel.

**Your Current State:** You mix passes. "Just a little styling while connecting data" feels efficient. It's catastrophic.

**The Representation:**
```
Imagine an assembly line with three stations. Each product MUST pass
through Station 1 completely before entering Station 2. No exceptions.
No "just a little" work at next station. The line stops if any product
jumps ahead.

The skill: Feeling anxiety when passes mix. That anxiety is your signal.
```

**Training Exercise: The Pass Purity Check (5 minutes daily)**

1. Open your IDE
2. Identify your current pass for active component:
   - Pass 1: Skeleton only (no styling, no data)
   - Pass 2: Data only (no styling, debug borders only)
   - Pass 3: Build (styling, interactions)
3. Look at your current file
4. Are you in the correct pass?
5. Are you mixing passes? (Y/N)
6. If Y: Stop. Revert mixed work. Return to correct pass.

**External Anchor:** The code itself shows pass violations (styled components without data, data-connected components with complex styling).

**Feedback Loop:** Immediate visual detection of pass mixing in code review.

---

### Representation 3: The Lock Mechanism

**Ericsson Principle:** Clear end-points enable skill refinement. Infinite loops prevent it.

**Your Current State:** "Working" and "locked" feel identical. You don't experience the closure sensation.

**The Representation:**
```
Imagine a physical gate. When you walk through, it locks behind you
with an audible click. You cannot go back without a key. The key
requires writing a new scope contract and getting approval. The click
is the sound of completion.

The skill: Craving the click. Feeling unfinished without it.
```

**Training Exercise: The Click Ritual (Per Component)**

1. Component reaches DoD (all checkboxes checked)
2. Physical ritual:
   - Say aloud: "[Component] is locked. Date: [X]. Time: [Y]."
   - Stand up
   - Close the file tab
   - Take screenshot
   - Commit immediately
3. 48-hour cooling-off period for any "improvement" ideas
4. If idea still compelling after 48h: New scope contract
5. If idea forgotten: Perfectionism loop prevented

**External Anchor:** Screenshot timestamp vs. commit timestamp. Physical proof of lock.

**Feedback Loop:** Count of "would have been improvements" that were forgotten after 48h.

---

### Representation 4: The Real Metric Dashboard

**Ericsson Principle:** Experts monitor performance differently than novices.

**Your Current State:** You track commits, difficulty ratings, sprint files (illusory metrics). You don't track DoD closures, scope expansions, time-to-lock (real metrics).

**The Representation:**
```
Imagine a cockpit with two dashboards. Dashboard A shows speedometer,
RPM, fuel level (activity metrics). Dashboard B shows arrival time,
remaining distance, estimated delay (outcome metrics).

Most pilots crash watching Dashboard A. Experts watch Dashboard B.

The skill: Automatic glance at Dashboard B. Dashboard A is decoration.
```

**Training Exercise: The Weekly Dashboard Review (10 minutes Friday)**

1. Open terminal
2. Run: `git log --since="1 week ago" --pretty=format:"%s" | grep -c "closes DoD"`
3. Run: `git log --since="1 week ago" --pretty=format:"%s" | grep -c "Difficulty: [0-9]* - D"`
4. Calculate: Forward Progress / Config commits ratio
5. Review sprint files: Started vs. Locked components
6. Calculate: Completion rate
7. Compare to targets:
   - Forward/Config ratio target: 3:1
   - Completion rate target: 85%
8. Identify: Which metric is worst? That's next week's focus.

**External Anchor:** Git log + sprint files = objective reality. Cannot be rationalized.

**Feedback Loop:** Weekly trend. Is the gap closing?

---

### Representation 5: The Choice Fork

**Ericsson Principle:** Pattern recognition happens at decision points.

**Your Current State:** You don't experience choices as forks. You experience them as "doing what needs to be done." The dysfunction is invisible to you.

**The Representation:**
```
Imagine every development moment as a fork in a trail. At each fork,
two signs: LEFT (healthy velocity), RIGHT (dysfunction). The signs are
clear, but the trail to the right feels more comfortable.

The skill: Seeing the fork. Feeling the discomfort of the left path
as the correct sensation.
```

**Training Exercise: The Choice Fork Flash Cards (10 minutes daily)**

Use the `VELOCITY_FLASH_TRAINING_SUBROUTINE.md` question bank.

1. Pick 10 random questions
2. Set timer: 30 seconds per question
3. Answer aloud immediately
4. Check answer
5. If wrong: Feel the physical sensation of wrongness
6. Log: Which fork did you take? Which fork was correct?

**External Anchor:** Answer key provides objective correct/wrong.

**Feedback Loop:** Score tracking. 90% accuracy = pattern recognition achieved.

---

## PART 3: THE 4-WEEK PROGRESSION (Peak Principle: Progressive Difficulty)

### Week 1: Awareness (Recognition Training)

**Goal:** See the dysfunction patterns as they occur.

**Daily Routine (15 minutes):**
```
Minutes 1-5:   Fence Bump Detection (Representation 1)
Minutes 6-10:  Choice Fork Flash Cards (Representation 5)
Minutes 11-15: Pre-Commit Protocol (Format 1)
```

**Success Criteria:**
- Can identify scope expansion in the moment (before acting on it)
- Can recognize three-pass violations within 5 minutes
- Can categorize commits correctly (A/B/C/D/E)
- Flash card accuracy: 60%+

**Week 1 Specific Exercise: The Commit Archaeology**

1. Pick one day from March 8-9 burst (104 commits in 48h)
2. Review each commit message
3. For each, classify: Healthy / Dysfunction
4. Count: How many were crisis recovery?
5. Identify: What single scope decision would have prevented the burst?
6. Write that scope decision as Forbidden Scope for next sprint

**External Anchor:** Your own commit history = undeniable evidence.

---

### Week 2: Containment (Interruption Training)

**Goal:** Stop dysfunction patterns before they expand.

**Daily Routine (15 minutes):**
```
Minutes 1-5:   Pass Purity Check (Representation 2)
Minutes 6-10:  Choice Fork Flash Cards (Representation 5) + timed responses
Minutes 11-15: Component Lock Ritual practice on old component
```

**Success Criteria:**
- Zero scope expansions without explicit written decision
- Zero pass mixing (skeleton complete before data, data before build)
- Flash card accuracy: 70%+ with <15 second response time

**Week 2 Specific Exercise: The Scope Containment Simulation**

1. Pick an incomplete component from your codebase
2. Write scope contract it SHOULD have had
3. Identify: Where did scope expand?
4. Identify: What Forbidden Scope items would have prevented it?
5. Document: Time cost of expansion vs. contained version

**External Anchor:** Actual incomplete component = tangible scope failure.

---

### Week 3: Discipline (Execution Training)

**Goal:** Execute healthy patterns under time pressure.

**Daily Routine (15 minutes):**
```
Minutes 1-5:   Lock Ritual practice on micro-component (15-min build)
Minutes 6-10:  Choice Fork Flash Cards (Representation 5) + stress conditions
Minutes 11-15: Real component with strict DoD locking
```

**Success Criteria:**
- Lock components in <2 hours from "working"
- Zero "working but not locked" components at day end
- Flash card accuracy: 80%+ under 10-second time pressure

**Week 3 Specific Exercise: The 2-Hour Lock Challenge**

1. Pick smallest incomplete component
2. Strict scope contract (max 5 IN SCOPE items)
3. Strict Forbidden Scope (3 anti-patterns)
4. Three-pass discipline (skeleton → data → build)
5. Timer: Working to Locked must be <2 hours
6. If >2 hours: Identify perfectionism loop trigger

**External Anchor:** Timer provides objective feedback. Cannot rationalize time.

---

### Week 4: Automaticity (Integration Training)

**Goal:** Healthy patterns become default without conscious effort.

**Daily Routine (15 minutes):**
```
Minutes 1-5:   Dashboard Review (Representation 4)
Minutes 6-10:  Choice Fork Flash Cards (Representation 5) + automatic response
Minutes 11-15: Normal work with pattern monitoring
```

**Success Criteria:**
- Scope expansions: 0 per week
- Pass violations: 0 per week
- Components locked: 100% of started
- Flash card accuracy: 90%+ automatic (<5 seconds)
- Forward/Config commit ratio: >3:1

**Week 4 Specific Exercise: The Full Sprint Protocol**

1. Run full sprint with ALL protocols active
2. Daily 5-minute protocol adherence check
3. Weekly dashboard review
4. Target: 85% sprint promise/reality ratio

**External Anchor:** Sprint file completion status = ultimate test.

---

## PART 4: THE LOWEST-FRICTION IMPLEMENTATION

### 4.1 The Physical Environment Setup

**Required (friction reduction):**

1. **Sticky Note on Monitor:**
   ```
   FENCE: [Current component scope - 3 items max]
   PASS: [1/2/3]
   LOCKED: [Y/N]
   ```
   Update every component change.

2. **Terminal Alias:**
   ```bash
   alias velocity="git log --since='1 week ago' --pretty=format:'%s' | grep -c 'closes DoD' && git log --since='1 week ago' --pretty=format:'%s' | grep -c 'Difficulty: [0-9]* - D' && echo 'Run weekly'"
   ```
   One command = weekly dashboard.

3. **Browser Bookmark:**
   - Title: "Velocity Flash"
   - URL: `VELOCITY_FLASH_TRAINING_SUBROUTINE.md` (local file)
   - Open for 10-minute morning drill

4. **Phone Timer:**
   - 30-minute coding intervals
   - Label: "Scope Check"
   - At beep: Ask "Am I inside fence?"

### 4.2 The Social Accountability Layer

**Lowest-friction external anchor:**

1. **Daily Tweet/Post (optional):**
   ```
   Velocity Day X:
   - Components locked: [N]
   - Scope expansions: [N]
   - Forward/Config ratio: [N:N]
   ```
   Public commitment = harder to rationalize.

2. **Weekly Report to Self (email):**
   - Send Friday 5pm
   - Subject: "Velocity Week X Review"
   - Attach: Dashboard metrics screenshot
   - Archive = trend visualization

3. **Monthly Public Post:**
   - Metrics trend
   - Patterns recognized
   - Failed patterns
   - Next month focus

### 4.3 The Failure Recovery Protocol

**When you fail (you will):**

1. **Immediate (within 1 hour):**
   - Stop working
   - Write: "Failed at [time]. Pattern: [which]. Trigger: [what]."
   - No self-judgment. Data collection only.

2. **Same Day (before sleep):**
   - Review failure
   - Identify: Which representation failed?
   - Plan: Tomorrow's specific practice for that representation

3. **Next Day:**
   - Extra 5 minutes on failed representation
   - Normal routine otherwise
   - One failure ≠ pattern. Three failures = focus theme.

---

## PART 5: THE CONTRAST TRAINING ARCHITECTURE

### 5.1 The Healthy vs. Dysfunctional Choice Bank

Based on your actual patterns from the audit:

| Scenario | Dysfunctional Choice (Your Pattern) | Healthy Choice (Target) |
|----------|-------------------------------------|-------------------------|
| Capacity matrix temptation | "Add it — it's better" | Forbidden Scope honored, hardcode instead |
| Deep dive early | "I'll just build Hero fully now" | Complete all skeletons first |
| Extract shared component | "Extract now to avoid refactor" | Duplicate 3x, then extract |
| Polish before lock | "It's working but could be better" | Lock immediately, 48h cooling |
| Config change | "Add to tailwind.config" | Use arbitrary value |
| Tooling upgrade | "Install now, speeds up later" | Defer to monthly batch |
| Audit before fix | "Document the bug first" | Fix the bug, 1-line issue |
| Scope creep request | "Quick addition while I'm here" | Push back, new scope |
| Generic abstraction | "Make it reusable now" | Concrete until 3rd use case |
| Burst mode | "Push through tonight" | Stop, sleep, fresh tomorrow |

**Training:** Flash cards with these pairs. Immediate correct answer. Feel the contrast.

### 5.2 The 17-Day Homepage Contrast Analysis

**Your Actual Path (Dysfunctional):**
```
Day 1:  Skeleton for all components
Day 2:  "I'll just polish Hero a bit..."
Day 3:  Hero deep work (animations, interactions)
Day 4:  Hero capacity matrix addition
Day 5:  Hero matrix tests
Day 6:  Hero edge case fixes
Day 7:  "I should check Featured..."
Day 8:  Featured deep work
Day 9:  "What about ProductSpotlight?"
Day 10: ProductSpotlight1 still has lorem ipsum
...
Day 17: Homepage "almost done"
```

**Healthy Path (Target):**
```
Day 1:  Skeleton all components (30 min)
Day 2:  Data all components (60 min)
Day 3:  Hero desktop → lock
        Hero mobile → lock
Day 4:  Featured desktop → lock
        Featured mobile → lock
Day 5:  ProductSpotlight1 desktop → lock
        ProductSpotlight1 mobile → lock
...
Day 10: All components locked, MVP shipped
```

**Same components. Different choices. 7-day difference.**

**Training Exercise:** Side-by-side timeline. Same starting point. Your choices vs. healthy choices. Map each divergence point. Identify the specific fork where you chose dysfunction.

### 5.3 The Real Consequence Visualization

**Your velocity dysfunction costs:**

| Pattern | Time Lost per Occurrence | Weekly Occurrences | Annual Cost |
|---------|-------------------------|-------------------|-------------|
| Scope expansion | 4 hours | 5 | 1,040 hours |
| Pass violation | 8 hours | 3 | 1,248 hours |
| Perfectionism loop | 12 hours | 2 | 1,248 hours |
| Config churn | 2 hours | 10 | 1,040 hours |
| **Total** | | | **4,576 hours** |

**Translation:** 2.2 years of full-time work lost annually to velocity dysfunction.

**Training Exercise:** Weekly, update this table with your actuals. Watch the number. Feel it.

---

## PART 6: THE EXTERNALLY ANCHORED FEEDBACK SYSTEMS

### 6.1 The Git Log Mirror (Daily)

**Your commit log is your behavioral mirror. It cannot lie.**

**Morning Protocol (2 minutes):**
```bash
# Show yesterday's commits
git log --since="yesterday" --pretty=format:"%h %s"

# Categorize each
echo "A (Forward):" && git log --since="yesterday" --pretty=format:"%s" | grep -c "A]"
echo "D (Config):" && git log --since="yesterday" --pretty=format:"%s" | grep -c "D]"
echo "DoD closures:" && git log --since="yesterday" --pretty=format:"%s" | grep -c "closes DoD"
```

**Question:** Does this match your felt sense of productivity?

**If mismatch >50%:** Your self-assessment is unreliable. Trust the git log.

### 6.2 The Sprint File Reality Check (Weekly)

**Your sprint files are plans. Your commits are reality.**

**Friday Protocol:**
1. Open sprint file planned for this week
2. List: Planned deliverables
3. Open git log for this week
4. List: Actual delivered (locked components, closed DoD items)
5. Calculate: Promise/Reality ratio

**Healthy:** 85%+
**Dysfunction:** <50%

**If <50% for 2 weeks:** Sprint planning is fiction. Reduce scope 50%.

### 6.3 The Time Tracker Truth (Per Component)

**Your estimates are optimistic. Your timer is truthful.**

**Per-Component Tracking:**
```
Component: ____________
Estimated: ____ hours
Actual: ____ hours
Variance: ____%

Where did time expand?
- [ ] Scope expansion
- [ ] Pass violation (rework)
- [ ] Perfectionism loop
- [ ] Config churn
- [ ] Other: ________
```

**Pattern Recognition:** If variance >100% for 3+ components, your estimation skill is broken. Use 3x multiplier until calibration improves.

### 6.4 The 48-Hour Cooling Test (Perfectionism Detector)

**Your "urgent improvements" are usually not.**

**Protocol:**
1. Component reaches DoD
2. Lock it
3. Write down: "Would improve: [list]"
4. Wait 48 hours
5. Revisit list
6. Count: How many still feel important?

**Typical result:** 80% of "urgent improvements" are forgotten.

**Training:** Do this 10 times. Build the mental representation: "urgent improvement" feeling ≠ actually urgent.

---

## PART 7: THE COMPLETE DAILY PROTOCOL

### Morning (5 minutes)

**The Velocity Alignment:**
```
1. Open VELOCITY_FLASH_TRAINING_SUBROUTINE.md
2. Answer 5 choice fork questions (30 sec each)
3. Score: ___/5
4. Today's theme focus: [1-5]
5. Specific application: [which component/sprint]
```

### Pre-Coding (2 minutes)

**The Scope Contract:**
```
COMPONENT: ________
PASS: [1/2/3]
IN SCOPE (max 5):
1. ____
2. ____
3. ____
FORBIDDEN SCOPE (3 anti-patterns):
1. ____
2. ____
3. ____
```

**Write this or don't code.**

### During Coding (Every 30 minutes)

**The Scope Bump Check:**
```
Timer beeps.
Ask:
- Am I inside fence? Y/N
- Correct pass? Y/N
- DoD work or perfectionism? DoD/Perfection

If any N: Stop. Document. Decide. Resume or revert.
```

### Pre-Commit (30 seconds)

**The Commit Categorization:**
```
This commit:
- Closes DoD item? Y/N
- Modifies only allowed files? Y/N
- Is Category A (forward)? Y/N

If 3x Y: Proceed with confidence.
If any N: Reassess.
```

### Evening (3 minutes)

**The Daily Retrospective:**
```
Components locked today: __
Scope expansions: __
Pass violations caught: __
Time-to-lock average: __ hours

Theme grade today: [A/B/C/D/F]
Tomorrow's adjustment: ______
```

### Weekly (10 minutes Friday)

**The Dashboard Review:**
```
Forward/Config ratio: __:__ (Target: 3:1)
Sprint promise/reality: __% (Target: 85%)
Components locked/started: __/__ (Target: 100%)
Average time-to-lock: __ hrs (Target: <2)

Primary dysfunction this week: ______
Next week's focus theme: ______
```

---

## PART 8: MASTERY INDICATORS

### You Are Making Progress When:

**Week 1-2:**
- [ ] You see the fence before you hit it
- [ ] You feel discomfort when passes mix
- [ ] You can categorize commits correctly
- [ ] Flash card accuracy >60%

**Week 3-4:**
- [ ] You stop scope expansion before acting
- [ ] You complete passes sequentially
- [ ] You lock components within 2 hours
- [ ] Flash card accuracy >80%

**Week 5-8:**
- [ ] Healthy choices feel automatic
- [ ] Dysfunction patterns feel obviously wrong
- [ ] You crave the "click" of locking
- [ ] Forward/Config ratio >3:1 consistently

**Week 9+:**
- [ ] You mentor others on velocity discipline
- [ ] You can diagnose dysfunction in others' workflows
- [ ] Your sprint promise/reality >85%
- [ ] The 17-day cycle is unthinkable

---

## CONCLUSION: THE CHOICE

Ericsson's research is clear: **Expertise is built, not born.** Your velocity dysfunction is not a character flaw. It is a **missing skill set** that can be acquired through deliberate practice.

**The Path Forward:**

1. **Commit to 15 minutes daily.** No exceptions. 4 weeks minimum.
2. **Trust the external anchors.** Your self-assessment is unreliable. Trust the git log, timer, and sprint files.
3. **Embrace the discomfort.** Healthy velocity feels wrong initially. That's the learning signal.
4. **Track the metrics.** What gets measured gets managed. What gets managed improves.
5. **Accept failure as data.** Each failure is information about which representation needs work.

**The alternative:** Continue current pattern. 2,117 more commits. 29 more audit reports. 17-day cycles repeating. MVP perpetually "almost ready."

**The choice is yours. The training is ready. Start tomorrow morning.**

---

## APPENDIX: QUICK REFERENCE CARD

**Print this. Tape to monitor.**

```
┌─────────────────────────────────────┐
│     THE VELOCITY PROTOCOL          │
├─────────────────────────────────────┤
│ BEFORE CODING:                      │
│ □ Scope contract written?           │
│ □ Forbidden Scope defined?          │
│ □ Which pass? [1/2/3]             │
├─────────────────────────────────────┤
│ EVERY 30 MINUTES:                  │
│ □ Inside fence? Y/N                 │
│ □ Correct pass? Y/N                 │
│ □ DoD or perfectionism?             │
├─────────────────────────────────────┤
│ BEFORE COMMIT:                     │
│ □ Closes DoD? Y/N                   │
│ □ Category A? Y/N                   │
│ □ Only allowed files? Y/N           │
├─────────────────────────────────────┤
│ WHEN COMPONENT WORKS:               │
│ □ All DoD checkboxes? Y/N           │
│ □ 48h cooling for improvements      │
│ □ LOCK IT → Commit → Move on        │
├─────────────────────────────────────┤
│ WEEKLY: Check dashboard            │
│ Forward/Config > 3:1?               │
│ Promise/Reality > 85%?              │
└─────────────────────────────────────┘
```

---

*Course Version: 1.0*
*Based on: Ericsson (2016) Peak + Sang Logium Velocity Audit*
*Training Hours Required: 15 min/day × 28 days = 7 hours*
*Expected Outcome: Automatic healthy velocity patterns*
*Alternative Cost: 4,576 hours/year of continued dysfunction*
