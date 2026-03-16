# The Feedback Loop Curriculum
### AI-Assisted Web Development — Structured Awareness and Real-Time Course Correction
#### Stack: Next.js 15 · Tailwind · Sanity CMS · TypeScript
#### Grounded in: Waitzkin (The Art of Learning), Gallwey (The Inner Game), Boyd (OODA),
####             Wiener (Cybernetics), Ericsson (Peak)
#### Companion to: The Seven-Theme Skill Curriculum + The Time Curriculum

---

> **The core claim of this curriculum**
> The Skill Curriculum tells you what to do correctly. The Time Curriculum tells you when and how fast. This curriculum tells you how to actually see what you are doing — clearly, without distortion, in real time — so that the information from the other two curricula reaches you before it is too late to act on it.
>
> Without feedback loops, the other two curricula are theory. With them, they become practice.

---

## Preface: The First Principle of Feedback Loops

### Waitzkin: "Feedback loops are everything"

This is not a motivational statement. It is a structural claim. Waitzkin means: no learning, no correction, no improvement of any kind occurs without a loop that connects output back to input. The tennis player who does not feel their racket does not improve their stroke. The chess player who does not review their games does not improve their decisions. The web developer who does not check the browser after every change does not improve their build.

A feedback loop has three mandatory components:
```
1. SIGNAL:    Something observable that represents the current state
2. COMPARISON: A standard against which the signal is measured
3. RESPONSE:  An adjustment made based on the comparison
```

Remove any of the three and the loop breaks. A signal without a comparison is noise. A comparison without a response is awareness without action. A response without a signal is acting blind.

The sang-logium 17-day failure broke all three:
- **Signal was absent:** No daily audit, no velocity tracking, no written scope standard to compare against
- **Comparison was absent:** No DoD checklist meant there was no standard to measure against
- **Response was absent:** On March 4, the signal finally arrived (the developer recognized the gap), but no Recovery Protocol existed, so no calibrated response followed

The entirety of both prior curricula can be reframed as: installing the three components of a feedback loop at every level of the development process.

### Gallwey: "Awareness itself is curative"

This is the deeper principle. Gallwey's central discovery as a tennis coach was that most instruction does not work because it bypasses awareness and attempts to directly install correct behavior. "Keep your eye on the ball" produces a player who *thinks about* keeping their eye on the ball rather than one who *actually watches* it. The thought substitutes for the perception.

His remedy: directed non-judgmental attention. Ask the player to notice where the racket face is pointing at contact. Not to fix it. Not to judge it. Simply to notice it. The act of precise observation, without judgment, initiates correction spontaneously and faster than any instruction.

Translated to web development: the developer who is thinking "I need to stay focused and not get distracted by the carousel" is not building. The developer who has a concrete signal (the DoD table on screen showing 0 components locked) is receiving direct feedback from reality rather than processing thoughts about reality. The signal bypasses the judgmental monologue and makes the state of the project directly visible.

This is why written scope contracts, binary DoD checklists, and physical timers work better than intentions and resolutions. They are Gallwey's directed attention made external. They make the ball seams visible.

### Gallwey: Self 1 and Self 2

Gallwey's fundamental model: every performer has two selves operating simultaneously.

**Self 1:** The conscious, verbal, judgmental mind. Gives instructions. Evaluates performance. Says "I'm falling behind." "That doesn't look right." "I should refactor this." Self 1 is the running commentary. It is loud. It is frequently wrong. When it is active during performance, it interferes.

**Self 2:** The deeper, capable, pattern-recognizing intelligence. It learned to code. It built the skeleton pass. It solves bugs when given clear data. It cannot be directly commanded — it must be trusted and given clean signals to work from.

The failure state: Self 1 is narrating performance ("I'm wasting time," "this carousel is almost done") instead of observing reality. Self 1's narration is based on thoughts, not signals. The thoughts are distorted by optimism bias, the planning fallacy, and the "almost done" illusion. Self 1 running on distorted data makes adjustments based on that distorted data. The loop is broken.

The corrected state: Self 1 is given concrete observable data (DoD table, timer reading, velocity ratio) and asked only to observe and compare — not to narrate, evaluate, or generate feelings about the situation. Self 2 then has clean signal and makes accurate adjustments.

**The translation to web development:**
Self 1 says: "This session is going well, I'm really making progress on the carousel."
Signal says: 0 components locked. Day 8. Required rate: 1.5/day.

These are different sources of information. The signal is accurate. Self 1 is not.

### The OODA Loop: Boyd's Framework for Rapid Feedback

John Boyd's OODA Loop (Observe, Orient, Decide, Act) is the most useful operational framework for feedback in dynamic environments. Originally designed for aerial combat, it has proven applicable to any domain where reality changes faster than the actor's current mental model can track.

```
OBSERVE  → take in real-world data without filtering or judgment
ORIENT   → integrate that data with existing knowledge and context
DECIDE   → select a response from available options
ACT      → execute the response, which creates new data
   ↓
OBSERVE again → the loop continues
```

Boyd's key insight: the actor who cycles through the loop faster than their environment changes wins. In web development terms: the developer whose feedback loop is faster than their drift toward failure can catch and correct problems before they compound. The developer whose feedback loop is slower than their drift cannot.

In sang-logium: the drift (carousel over-engineering, scope expansion, perfectionism) was faster than the feedback loop (which fired only when the developer noticed the problem consciously on day 5). The OODA loop was running at weekly cadence. The drift was running at hourly cadence. The loop lost.

### Cybernetics: The Control Theory Foundation

Norbert Wiener's cybernetics (1948) established the mathematical foundation for all feedback systems: a system must continuously compare its current state to its target state and apply corrective force proportional to the difference. A thermostat does this. A skilled driver does this. An effective developer must do this.

The critical property: the corrective force must be **proportional to the gap** and applied **continuously**, not occasionally. A thermostat that checks temperature once per day is not useful. A developer who checks velocity once per week is similarly too slow to prevent large gaps from forming.

**The three feedback failure modes from control theory:**
1. **No feedback:** The system cannot self-correct. Sang-logium had no velocity tracking — no feedback, no correction possible.
2. **Delayed feedback:** The feedback arrives too late for useful correction. Sang-logium's feedback arrived on day 5 with 1 day remaining before the original deadline.
3. **Noisy feedback:** The signal is distorted and produces wrong corrections. "This session is going well" is a noisy signal. "0 components locked, day 5" is a clean signal.

---

## The Feedback Loop Taxonomy

Before the themes: a classification of the loops themselves. Different loops operate at different time scales. Each is necessary. None substitutes for another.

```
LOOP TYPE         TIME SCALE    SIGNAL SOURCE              PURPOSE
─────────────────────────────────────────────────────────────────────
Micro loop        Seconds       Browser / hot reload       See exact output immediately
Session loop      ~60 min       Timer + work state         Catch drift within a session
Checkpoint loop   ~4 hours      DoD table + velocity       Recalibrate direction in a block
Daily loop        End of day    Daily audit (3 questions)  Know if today moved the project
Weekly loop       Weekly        Git log + velocity review  Identify patterns, set next rule
Milestone loop    Per-component DoD checklist verification Lock deliverables explicitly
Project loop      Per sprint    Sprint table + completion  Know if project will finish on time
```

Each loop catches a different scale of failure:
- Micro loop catches: wrong code, broken render, missing data
- Session loop catches: perfectionism drift, time sinkage into one task
- Checkpoint loop catches: scope expansion, wrong priority
- Daily loop catches: zero-velocity days
- Weekly loop catches: consistent wrong direction
- Milestone loop catches: incomplete components being treated as complete
- Project loop catches: impossible timelines before it is too late to respond

The sang-logium failure had none of these loops running consistently. Drift at every time scale went uncorrected.

---

## Theme FL1: The Micro Loop — Real-Time Rendering Feedback

### The Mental Representation Being Built

> "The browser is the feedback instrument. Every code change must produce a visible signal in the browser before I write the next change. Code without a visible browser signal is building blind."

### What the Micro Loop Is

The micro loop is the tightest feedback cycle in web development: write code → save → see change in browser → adjust. In Next.js 15 with Fast Refresh, this loop runs in under one second for component changes. This is the most powerful feedback mechanism available and the most frequently disabled — by not having the browser open, by working in large batches before saving, or by working on logic without checking render.

Gallwey's principle applies most directly here. The tennis player who does not watch the ball cannot adjust. The developer who does not look at the browser after each change cannot see what they are actually building. They are building from mental models of what they think they are building — which are always less accurate than the actual rendered output.

### First Principle: The Shorter the Loop, the Cheaper the Correction

Control theory establishes this mathematically. The cost of correction is proportional to the distance traveled in the wrong direction before correction occurs. A 1-second feedback loop means at most 1 second of wrong-direction work. A 30-minute feedback loop means at most 30 minutes of wrong-direction work. Given that wrong-direction work requires reversal work of equal length, a 30-minute loop can cost 60 minutes versus a 1-second loop's cost of 2 seconds.

---

### Sub-Skill FL1.1: The Always-Open Browser Protocol

**The rule:** The browser is open on localhost at all times during development. It is visible — not minimized, not in another workspace. It is the feedback instrument. You do not minimize your feedback instrument.

**The specific setup for sang-logium:**
- VSCode on the left half of the screen (or top)
- Browser showing localhost:3000 on the right half (or bottom)
- DevTools console tab open and visible
- Both visible simultaneously

**Why this matters:** When the browser is in another window, checking it requires a context switch — Alt+Tab, focus, observe, Alt+Tab back. Context switches have a 15-30 second cognitive cost beyond their physical duration. Over a 4-hour session, checking the browser 20 times with context switching costs 5-10 minutes of pure context-switch overhead. More importantly, when switching is friction-full, developers check less often. Less checking = larger micro loops = more drift.

**Violation consequence — sang-logium:**
Without this protocol, code is written, saved, and the browser is not checked. The developer builds for 20-30 minutes based on a mental model of what is rendering. When finally checked, the browser shows something different — the mental model was wrong. Now the entire 20-30 minutes of work is being evaluated against unexpected reality. Some of it will need revision. The revision was free 20 minutes ago when it would have been a 2-second save-observe-adjust cycle. It is expensive now.

---

### Sub-Skill FL1.2: The Gallwey Observation Protocol for Renders

When the browser updates after a save, **observe before judging**. This is Gallwey's core instruction applied to code.

**What observation is:** Looking at what is actually on screen. Where elements are. What text appears. What is missing. What is overflowing. Where the console shows errors.

**What observation is not:** "That doesn't look right." "Almost." "Close enough." "Good enough for now." These are Self 1's judgmental commentary. They replace observation with evaluation. They produce less accurate corrections than pure observation.

**The observation checklist (5 seconds per save):**
```
1. Is the component visible? (yes/no)
2. Is there any console error? (yes/no — look at the tab)
3. Does the structure match the scope contract's Deliverable State? (yes/no)
4. Is there overflow at the current viewport? (yes/no)
```

Four binary observations. No adjectives. No "looks good" or "almost there." Binary observations feed clean signal into the OODA loop. Adjective-based evaluations feed noise.

**Why binary matters:** "Looks good" is Self 1 noise. It generates a feeling, not data. "No console error, structure matches, no overflow" is data. Data produces accurate corrections. Feelings produce confident wrong corrections.

---

### Sub-Skill FL1.3: TypeScript and ESLint as Micro-Loop Instruments

TypeScript type errors and ESLint warnings are micro-loop feedback that fires before the browser ever shows anything. They are the earliest-firing feedback in the entire development workflow.

**The rule:** Type errors are resolved before the file is saved. Not "I'll fix it later." Not "I'll suppress the warning." A type error is signal. The signal says: "something in your understanding of the data contract is wrong." Suppressing it silences the signal. Resolving it integrates the signal.

**In practice for sang-logium + Sanity:**
When TypeScript complains about a Sanity document field, it is telling you that your GROQ query result does not match your expected interface. This is a Scope Curriculum issue (Theme 3 architecture) surfacing as a micro-loop signal. The signal is: "your component and your data contract are not aligned." Resolving the type error forces alignment. Suppressing it with `// @ts-ignore` hides a misalignment that will break at runtime.

**Violation consequence:**
`// @ts-ignore` on a Sanity field type mismatch means the component will render undefined data at runtime. The micro-loop caught the problem in 0 seconds. Suppressing it deferred it to a runtime bug that takes 15-60 minutes to diagnose and fix.

---

## Theme FL2: The Session Loop — Catching Drift Within One Work Block

### The Mental Representation Being Built

> "Every 60 minutes, I stop and ask one question: what is on screen in the browser right now that was not on screen 60 minutes ago? If the answer is nothing, the session has produced nothing and the next 60 minutes will be different."

### What the Session Loop Is

The session loop fires every 60 minutes during active development. Its sole purpose is to catch session-level drift — the state of being deeply engaged in work that is not producing visible rendered output.

This is the Parkinson's Law loop. Without it, work expands to fill the session. With it, work is recalibrated every 60 minutes against concrete observable output.

It is also the anti-perfectionism-loop check. The perfectionism loop cannot survive a 60-minute observation interval that asks "what new thing is now rendered that was not before?" because the perfectionism loop produces zero new rendered output.

### First Principle: The Gallwey Critical Variable

Gallwey's Inner Game introduces the concept of "critical variables" — the elements of a situation that actually matter, as opposed to the many elements that feel important but don't determine the outcome. For a tennis player, the critical variables are ball position and racket face angle. For a singer, they are breath and resonance. Many things feel important. The critical variables are the ones that, if you watch them precisely, produce automatic improvement.

For web development in a build sprint, the critical variable is: **new rendered output per unit time.** Not commits. Not lines written. Not bugs investigated. Rendered output that advances toward the DoD.

The 60-minute session loop asks about the critical variable, not proxies for it.

---

### Sub-Skill FL2.1: The 60-Minute Signal Check

**Implementation:** Set a physical timer at the start of every work session. Every 60 minutes, it fires.

**When it fires, stop. Open a blank note. Write:**
```
TIME: [current time]
SESSION START: [when this session started]
ELAPSED: [how many minutes]
NEW RENDERED OUTPUT: [what specific visual thing is now in the browser
                      that was not there 60 minutes ago]
NEXT 60-MIN TARGET: [one specific observable thing that will be
                     in the browser at the next timer firing]
```

The "New Rendered Output" field is the critical variable. If the answer is "nothing" or "minor styling change" or "carousel animation is slightly better" — the session loop has caught drift. The next 60 minutes must produce something different.

**The "Next Target" field is a mini-scope contract:** One specific observable thing. Not "work on the NewestRelease component." "NewestRelease component renders at 1280px with 3 product titles visible from Sanity data." This is the Gallwey technique applied: instead of telling yourself to "focus better," you give Self 2 a specific concrete target to move toward. The specificity replaces the vague intention.

**Violation consequence — sang-logium:**
Day 8. The developer has been working on carousel edge cases for 6 hours. 6 timer firings, each showing "carousel is slightly more polished." No new component has been rendered. The session loop catches this at the first firing — minute 60 — and asks "what specific thing will be rendered by minute 120?" The answer forces a decision: either produce something new, or explicitly decide that another hour of carousel polish is the correct choice. Making that choice explicitly, with awareness, is very different from drifting into it.

---

### Sub-Skill FL2.2: The Emotional Signal — Recognizing Drift States

Gallwey identifies that awareness is available through emotional and physical signals, not just visual ones. The body registers states before the mind articulates them. In development:

**The drift state has a felt signature:**
- Sense of being deeply engaged but slightly anxious
- Feeling of "almost there, just one more thing"
- High commit frequency without checking the browser
- Loss of awareness of time passing
- Slight reluctance to check the DoD table or velocity number

**The flow state has a different felt signature:**
- Each change produces visible progress
- Moving between tasks feels natural
- Looking at the browser produces satisfaction followed by clear next action
- Time passing is noticed but not anxious

The skill is learning to recognize the drift state's felt signature before the 60-minute timer fires — so that you can catch it mid-session, not just at the scheduled check.

**The practice:** At any moment during a session when you feel the "almost there, just one more thing" sensation — stop. Check the browser. Check the DoD table. Do not check your feeling. Check the signal.

This is Gallwey's instruction exactly: "it is almost impossible to feel or see anything well if you are thinking about how you should be moving. Forget should's and experience is."

---

## Theme FL3: The Checkpoint Loop — Four-Hour Block Recalibration

### The Mental Representation Being Built

> "Every four hours, I recalibrate direction, not just pace. The question is not 'am I working hard enough?' It is 'am I building the right thing, in the right order, at the right time?'"

### What the Checkpoint Loop Is

The checkpoint loop fires at the end of every four-hour work block. A four-hour block is roughly half a working day. It is the unit within which a component can plausibly be built to DoD — or within which a significant amount of time can be lost to wrong-direction work.

Where the session loop asks "did this hour produce output," the checkpoint loop asks "is the output I produced in the correct direction?" Direction errors are more expensive than pace errors. Working hard in the wrong direction requires both reversal and re-execution.

### First Principle: OODA's Orient Phase

In Boyd's framework, Observation collects data but Orientation is where that data is integrated with context, knowledge, and the current goal. Orientation is what makes observations actionable. A raw data point ("0 components locked today") without orientation ("I needed 1.5 locked today to be on track") is meaningless. With orientation, it immediately generates a decision.

The checkpoint loop is the systematic Orient phase applied every four hours. It does not just ask "what happened" — it asks "what does what happened mean, given where I need to be?"

---

### Sub-Skill FL3.1: The Four-Hour Checkpoint Protocol

**When it fires: at the end of every 4-hour work block. 10 minutes maximum.**

**The questions:**
```
QUESTION 1 — OUTPUT:
What specific components or sub-tasks moved from incomplete to more complete
in the last 4 hours? List them.

QUESTION 2 — DIRECTION:
For each item listed above: was this work on the highest-priority remaining
DoD item? If not, what was higher priority and why was it not done?

QUESTION 3 — NEXT BLOCK:
What is the single highest-priority DoD item for the next 4-hour block?
Write it as a binary, observable statement: "X component will render Y
at Z viewport by the end of the next block."

QUESTION 4 — VELOCITY (weekly, not every block):
Am I on track to finish the project by the deadline? Components locked /
components needed × days elapsed.
```

Question 3 is the most important. It is a 4-hour scope contract. It is specific, observable, and binary. It gives Self 2 a concrete target. It prevents the next 4 hours from being determined by momentum from the previous 4 hours rather than by deliberate direction.

**Violation consequence — sang-logium:**
Without a checkpoint loop, the direction of a session is determined by inertia. If the last action before a session was carousel work, the first action of the next session is likely carousel work. The checkpoint loop breaks this inertia by explicitly asking: "given where the project is now, what should the next 4 hours produce?" The answer on day 8 would have been: "ProductSpotlight1 replaces lorem ipsum with real Sanity data by the end of the block." Not more carousel work.

---

### Sub-Skill FL3.2: The Scope Drift Detection Question

At every 4-hour checkpoint, one additional diagnostic question:

```
SCOPE DRIFT CHECK:
Look at your scope contract for the component you are currently building.
Read each FORBIDDEN SCOPE item aloud.
Have you done any of them in the last 4 hours? [yes/no]
If yes: name what you did and estimate how long it took.
```

This is Gallwey's "watching the ball" applied to scope. You are not asking whether the work was good. You are observing whether it was in scope. Non-judgmental. Binary. Direct.

If you have violated a FORBIDDEN SCOPE item, you do not self-criticize. You note it, estimate the time cost, and return to the scope. Self 1's judgment about the violation ("I wasted time") is noise. The data ("45 minutes on a FORBIDDEN SCOPE item") is signal.

---

## Theme FL4: The Daily Loop — End-of-Session Honest Account

### The Mental Representation Being Built

> "The daily loop is not a retrospective. It is an honest account of one variable: did the project advance today, measured against what advancement was required? Not effort. Not activity. Advancement."

### What the Daily Loop Is

The daily loop fires at the end of every working day. It is the Three-Question Audit from the Time Curriculum (Theme T2.2) — but understood here as a feedback loop, not just a time management tool. The distinction matters because a loop requires all three components: signal, comparison, and response.

**Signal:** What was built today (from the DoD table).
**Comparison:** What was required to be on track (from the required daily rate).
**Response:** If on track, continue. If behind, initiate Recovery Protocol or scope triage.

Without the response component, the daily loop is just a journal. With it, it is a control system.

---

### Sub-Skill FL4.1: The Written Daily Account

**Format — 5 minutes, every day:**

```
DATE: [date]
COMPONENTS LOCKED TODAY: [list any that moved to "locked" status]
COMPONENTS ADVANCED TODAY: [list any that moved forward but not yet locked,
                             with specific DoD items newly passing]
REQUIRED DAILY RATE: [from project calculation]
ACTUAL RATE TODAY: [components locked / day]
RUNNING TOTAL: [components locked to date / total components needed]
ON TRACK: [yes / amber / red]
IF AMBER OR RED: Recovery Protocol decision: [Cut / Extend / Surge]
TOMORROW'S TARGET: [one specific observable output that will be in the
                    browser by end of tomorrow's session]
```

**The "On Track" classification:**
```
GREEN:  Running total / required = ≥ 100% (ahead of or on schedule)
AMBER:  Running total / required = 75-99% (slightly behind, still recoverable)
RED:    Running total / required = < 75% (significantly behind, recovery required)
```

**Why writing it matters:**
Gallwey's principle: the mind free of judgment acts like a mirror — it reflects things as they are. Writing the daily account engages the observing faculty without the evaluating faculty. The numbers are what they are. Writing them does not require you to feel bad about them. It requires you to see them clearly.

**Violation consequence — sang-logium:**
A written daily account on day 3 would have shown:
- Components locked: 0
- Required: 4.5 (3 days × 1.5/day)
- Running total/required: 0%
- Classification: RED
- Recovery decision required

This would have triggered the Recovery Protocol on day 3 — two days before the developer consciously recognized the gap on day 5, and twelve days before the gap became a 17-day disaster.

---

### Sub-Skill FL4.2: The Emotional State Signal

Gallwey notes that emotional states contain information. Self 1's emotional commentary is noise. The underlying emotional state — the direct experience, not the narrative about it — is signal.

At the end of each day, before writing the daily account, take 30 seconds to notice your actual state:

```
ENERGY: [low / medium / high]
CLARITY: [clear / foggy / confused]
RELATIONSHIP TO THE WORK: [engaged / anxious / avoidant / flat]
```

This is not journaling. It is not self-therapy. It is diagnostic data about your relationship to the current work. Patterns in this data are informative:

- Persistent "anxious" state → likely in a drift pattern, building without clear direction
- Persistent "foggy" state → likely scope is too large or unclear, return to Theme 1
- Persistent "avoidant" state → likely facing a blocker that has not been triaged, return to Theme 6
- Persistent "low energy" → pace sustainability issue, consider shorter blocks or a rest day

These patterns appear over days, not in a single reading. The daily record of emotional state is the data set. Single readings are meaningless. A week of "anxious + foggy" readings is a clear signal that the current approach is not working.

---

## Theme FL5: The Milestone Loop — DoD Verification Before Locking

### The Mental Representation Being Built

> "A component is not locked because it feels done. It is locked because I have opened the browser and verified, one by one, that every binary DoD item passes. The lock is an event, not a feeling. It happens at a specific moment, with specific evidence."

### What the Milestone Loop Is

The milestone loop fires once per component, at the moment of potential completion. It is the feedback loop that converts "probably done" into "verifiably done." It is the event that prevents the perfectionism loop from reopening a component, and the event that creates the locked status entry in the sprint table.

This is Gallwey's "observing the stroke as it is" applied to completion. Not "I think this component looks done." "I have verified these 5 items and they all pass."

### First Principle: Waitzkin's Investment in Loss

Waitzkin's concept of "investment in loss" means: actively seek out what is wrong, before being told. The expert chess player does not stop analyzing at "this position looks good." They continue until they find the weakness. Finding it themselves, in practice, is cheaper than losing to it in competition.

The milestone loop is investment in loss. Before locking a component, look for what is wrong with it against the DoD checklist. Deliberately. Systematically. Not to criticize yourself — to find the real state before falsely locking something that will need to be reopened.

---

### Sub-Skill FL5.1: The Verification Sequence

**Every time you are about to commit a component as locked:**

```
1. Open browser to localhost
2. Open DevTools — Console tab visible
3. Read DoD item 1 aloud
4. Look at the browser. Does it pass? [yes/no] — not "I think so." Look.
5. Repeat for every DoD item
6. Check the console. Any errors? [yes/no]
7. Resize to 375px. Repeat items 3-6 for mobile viewport.
8. Only when all items are visually confirmed: commit with "closes DoD items 1-N on [Component]"
```

The act of reading the DoD item aloud before looking at the browser is Gallwey's technique: give Self 2 a specific thing to observe before looking. "No horizontal overflow at 375px" is a specific instruction to the observing faculty. It produces accurate observation. "Looks right on mobile" is a vague instruction that produces impression-based observation.

**Violation consequence — sang-logium:**
No milestone verification protocol existed. The carousel was treated as "working" based on a feeling. A verification sequence against explicit DoD items would have surfaced the mobile DoD items that were failing — giving concrete, binary data about the gap rather than a general sense of "almost there."

---

## Theme FL6: The Integration Loop — How All Loops Connect to the Other Curricula

### The Mental Representation Being Built

> "The feedback loops are the nervous system of the development process. The Skill Curriculum is the skeleton. The Time Curriculum is the metabolism. The feedback loops connect them — without the loops, the skeleton does not know it is in the wrong position and the metabolism does not know it is running out of fuel."

### How the Loops Connect to the Seven Skill Themes

Every Skill Theme is activated by a feedback loop firing. Without the loops, the themes are instructions that arrive too late.

```
SKILL THEME          WHICH LOOP ACTIVATES IT         WHAT THE LOOP DETECTS
─────────────────────────────────────────────────────────────────────────────
Theme 1: Scoping     Project loop (pre-sprint)       "Scope contracts missing — no fence"
Theme 2: Sequencing  Session loop + checkpoint       "Pass 3 began before Pass 2 complete"
Theme 3: Architecture Scope drift detection (FL3.2)  "FORBIDDEN SCOPE violated"
Theme 4: Prompting   Micro loop (FL1)                "AI output mixed layers — wrong"
Theme 5: DoD         Milestone loop (FL5)            "Component not actually done"
Theme 6: Triage      Daily loop (FL4)                "0 A-category progress today"
Theme 7: Version Ctrl Weekly loop (Time T3.2)        "A-ratio below 50%"
```

### How the Loops Connect to the Six Time Themes

```
TIME THEME           WHICH LOOP ACTIVATES IT         WHAT THE LOOP DETECTS
─────────────────────────────────────────────────────────────────────────────
T1: Estimation       Project loop (pre-sprint)       "Estimate unrealistic — apply multiplier"
T2: Time Visibility  Session loop (FL2) + timer      "Time passing invisibly"
T3: Velocity Monitor Daily loop (FL4) + checkpoint   "Velocity below required rate"
T4: Scope-Time       Checkpoint loop (FL3)           "Scope expanding beyond time budget"
T5: Recovery         Daily loop, Amber/Red trigger   "Recovery protocol required"
T6: Time Psychology  All loops continuously          "Feeling ≠ data — check the signal"
```

---

### The Complete Loop Stack in Practice

This is the sang-logium build, day-by-day, with all loops running correctly:

**Day 0 (Sunday, before starting):**
- Project loop: scope contracts written for all 9 components, DoD checklists written, Amber Alert date set (day 3 if <3 components locked), velocity estimate: 1.5 components/day, 6-day inside-view estimate × 1.75 multiplier = 10.5 days, deadline set to March 12 not March 5

**Day 1:**
- Pass 1 complete: all 9 components as skeleton boxes (90 min)
- Pass 2: 4 components with real Sanity data (remaining session)
- Session loops: fired 3 times, each showing forward progress
- Daily loop: 0 components locked (Pass 2 not complete), required: 1.5, on track: AMBER (data pass in progress, normal for day 1)
- Tomorrow's target: complete Pass 2 for all 9 components

**Day 2:**
- Pass 2 complete: all 9 components with real data (morning)
- Pass 3 begins: Hero built to DoD by afternoon
- Checkpoint loop: Hero locked. Shelf next. Direction correct.
- Daily loop: 1 component locked. Required: 3.0 (2-day cumulative). Amber — behind by 2. Recovery: extend deadline by 2 days or pick up pace
- Tomorrow's target: lock 2 components (Shelf + ProductSpotlight2)

**Day 5:**
- Daily loop: 5 components locked. Required: 7.5. Red — behind by 2.5 components.
- Recovery: declare NewestRelease as Tier 3, defer to post-launch sprint
- Adjusted target: 8 components instead of 9, deadline March 12

**Day 8-10:**
- 7 of 8 targeted components locked
- Final component (Accessories) has CRITICAL bug → 15-minute debug protocol
- Bug resolved via structured defer (placeholder), then fixed in dedicated debug session

**Day 10:**
- All 8 components locked to DoD
- Integration pass: full-page visual review
- Deploy

This is not perfect execution. It is realistic execution with feedback loops catching and correcting drift at every level. The project finishes at day 10, within the correctly-estimated timeframe.

---

## The Practical Setup: What You Actually Need Running Every Day

All of the above collapses into these concrete physical arrangements:

### The Physical Environment
```
Screen setup: Editor left, browser right. Both always visible.
DevTools: Console tab always open in browser.
Timer: Physical timer or phone timer. Not a mental estimate.
Sprint table: SPRINT_DOD.md open in a tab, visible during every session.
Daily log: A single text file, open, updated daily.
```

### The Loop Schedule
```
Micro:       Every save (automatic — browser updates with Fast Refresh)
Session:     Every 60 minutes (timer-based)
Checkpoint:  Every 4 hours (timer-based)
Daily:       End of every session (5 minutes)
Milestone:   Every time a component approaches DoD (manual, per component)
Weekly:      Every Sunday (20 minutes)
Project:     Day 0 (setup) and whenever Amber/Red daily loop fires
```

### The Minimal Loop Practice (if starting now, mid-project)

If all of this seems like too much to install at once, the minimum viable loop stack for the remaining sang-logium homepage build is:

**1. Open the browser now and leave it open.**
**2. Set a 60-minute timer at the start of every session.**
**3. Answer the three daily questions every evening.**
**4. Verify every DoD item in the browser before committing any component as locked.**

These four practices implement the micro loop, session loop, daily loop, and milestone loop. They are the four loops that, if running on day 1, would have caught the sang-logium drift earliest. Everything else can be added incrementally.

---

## Appendix: The Feedback Loop Reference Card

```
┌───────────────────────────────────────────────────────────────────────┐
│ LOOP           FIRES WHEN       SIGNAL          RESPONSE TRIGGER       │
├───────────────────────────────────────────────────────────────────────┤
│ Micro          Every save       Browser render  Fix immediately or     │
│ (FL1)                           + console       defer per triage       │
├───────────────────────────────────────────────────────────────────────┤
│ Session        Every 60 min     New rendered    Redirect if nothing    │
│ (FL2)          (timer)          output check    new rendered           │
├───────────────────────────────────────────────────────────────────────┤
│ Checkpoint     Every 4 hours    Direction +     Scope contract check,  │
│ (FL3)          (timer)          scope drift     forbidden scope audit  │
├───────────────────────────────────────────────────────────────────────┤
│ Daily          End of session   DoD table +     Recovery if RED/AMBER  │
│ (FL4)                           velocity ratio  Tomorrow's target set  │
├───────────────────────────────────────────────────────────────────────┤
│ Milestone      Per component    All DoD items   Lock or continue       │
│ (FL5)          approaching DoD  verified in     (no in-between)        │
│                                 browser         │
├───────────────────────────────────────────────────────────────────────┤
│ Weekly         Every Sunday     Git A-ratio     Behavioral rule        │
│ (Time T3.2)                     + blocker type  for next week          │
├───────────────────────────────────────────────────────────────────────┤
│ Project        Day 0 +          Velocity vs     Scope/deadline/        │
│ (Time T5)      Amber/Red fires  required rate   surge decision         │
└───────────────────────────────────────────────────────────────────────┘
```

### The Three Components Every Loop Must Have
```
SIGNAL:     An observable, external, binary data point (not a feeling)
COMPARISON: A standard against which the signal is measured (not an impression)
RESPONSE:   A defined action triggered by the comparison result (not a resolution)
```

### The Gallwey Translation for Each Loop
```
Micro loop:      Watch the ball (browser) — do not think about the ball
Session loop:    What is on screen? (critical variable) — not "how is it going?"
Checkpoint loop: Where am I? (orientation) — not "am I working hard enough?"
Daily loop:      What number did today produce? — not "did I do my best?"
Milestone loop:  Does each item pass? (binary) — not "does this look done?"
```

---

*Feedback Loop Curriculum v1.0 — sang-logium project — Next.js 15*
*Read after the Seven-Theme Skill Curriculum and the Time Curriculum.*
*The three documents form a complete system: what to do, when, and how to see clearly enough to know whether you are doing it.*
