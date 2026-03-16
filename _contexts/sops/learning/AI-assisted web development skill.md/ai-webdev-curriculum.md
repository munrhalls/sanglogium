# AI-Assisted Web Development: Deliberate Practice Curriculum

> **Project:** sang-logium
> **Purpose:** Rebuild AI-assisted web development skill from the foundation up, theme by theme, then integrated — using Ericsson's deliberate practice framework from *Peak*.
> **Author's Note:** The 17-day homepage failure was not a failure of raw ability. It was a failure of *sequencing, scope discipline, and mental representation*. This curriculum addresses precisely those gaps.

---

## Part 0 — Framework: What Deliberate Practice Actually Means

Before the curriculum begins, the developer must internalize what they are doing and why. Naive practice (just building things) does not produce expertise. Deliberate practice does. These are the non-negotiable structural conditions for every drill in this curriculum:

### The Five Laws of Deliberate Practice (Ericsson, *Peak*)

1. **Specific goals, not vague intentions.** "Work on the homepage" is not a goal. "Render all 9 layout boxes with correct flex structure in under 25 minutes" is a goal.
2. **Full focus.** No music, no tab-switching, no "quick check" of another issue. Each drill demands 100% cognitive engagement.
3. **Immediate feedback.** The browser is the judge. The terminal is the judge. Not opinion, not feeling — the live rendered output is the feedback.
4. **Work at the edge of comfort.** If a drill feels easy, add a constraint. Reduce the time. Remove the scaffold. Tighten the requirement.
5. **Reflection and adjustment.** After every drill, write one sentence: *"What broke my flow and why?"* This builds the mental representation that makes the next drill faster.

### The Core Concept: Mental Representations

Ericsson's central insight is that what separates experts from novices is not hours logged, but the quality of their **mental representations** — internal models of what "correct" looks like. A chess grandmaster doesn't calculate every move; they *recognize patterns*. A skilled AI-assisted developer doesn't wrestle with every prompt; they *pattern-match* the problem to the correct tool and sequence instantly.

Every drill in this curriculum is designed to build one specific mental representation. Each Part builds on the representations formed before it. Do not skip Parts.

---

## Part 1 — Thematic Component Skills (Individual Themes)

---

### Theme 1: Scope Discipline & Macro-to-Micro Sequencing

**The Core Skill Being Built:**
The ability to define the exact boundaries of a deliverable *before* touching code, and to execute from the largest structural unit downward, never upward.

**Why This Theme Comes First:**
The 17-day failure was, at its root, a sequencing failure. Components were being polished before the full layout was structurally sound. Animations were tuned before the complete page was visible. This is building a house from the doorknob outward. Theme 1 rewires this reflex permanently.

**The Mental Representation to Build:**
A deliverable is a *tree*. The trunk must exist before branches. Branches before leaves. Leaves before texture. Never touch a leaf when the trunk is not yet standing.

**The Free AI Tool for This Theme:** Claude / ChatGPT (for scope definition prompts)

---

#### Drill 1.1 — The Written Scope Contract (20 minutes)

**Setup:** Open a blank `.md` file. No code editor, no browser, no Sanity Studio.

**Task:**
Before writing a single line of code for any component, write a scope contract in this exact format:

```
COMPONENT: [name]
DELIVERABLE STATE: [one sentence describing what "done" looks like visually in the browser]
BOUNDARY CONDITIONS:
  - What this component DOES include
  - What this component DOES NOT include
DEFINITION OF DONE (DoD): [3 bullet points, each binary pass/fail]
FORBIDDEN SCOPE: [list 2-3 things you will NOT do during this component's build]
```

**Constraint:** The "Forbidden Scope" field must be filled out. It is not optional. Leaving it blank is a failed drill.

**Feedback:** Read the contract aloud. If any item sounds vague, rewrite it until it is measurable. "Looks good" is not measurable. "All 9 components render at 1280px with no overflow" is measurable.

**Repetition:** Write a scope contract for all 9 homepage components before proceeding to any code. This is the only goal of this drill.

---

#### Drill 1.2 — The Structural Skeleton Sprint (25 minutes, timed)

**Setup:** VSCode open. Browser open on localhost. Timer set for 25 minutes.

**Task:**
Create all 9 required component files. Render each one in the page file. Each component must contain:
- One semantic HTML wrapper element (`<section>`, `<article>`, etc.)
- One `<p>` tag containing only the component's name as text
- One inline style or debug Tailwind class: `border border-red-500`

**Constraint:** Zero configuration changes. Zero Tailwind config edits. Zero new npm installs. Zero animations. Zero images. Zero data fetching.

**Feedback:** When the timer ends, count how many red-bordered boxes are visible in the browser. Score = boxes visible / 9. If score < 1.0, identify what blocked you. Write one sentence about it.

**The critical rule:** If you fix a bug during this drill and the bug is not in the 9 boxes rendering, you have broken the drill. Stop. Reset. Restart.

---

#### Drill 1.3 — The AI Scope Prompt (15 minutes)

**Setup:** Open Claude or ChatGPT (free tier).

**Task:**
Write a prompt to the AI that does exactly one thing: generate the TypeScript interface definitions for all 9 components' props, based on their names and your scope contracts from Drill 1.1.

**Constraint:** The prompt must include your scope contract. The prompt must explicitly say: "Do not generate component implementation code. Only generate TypeScript interfaces."

**Feedback:** Paste the AI output back into your codebase. If the AI generated any implementation code (JSX, CSS, logic), your prompt was not specific enough. Rewrite the prompt and try again.

**What this builds:** The mental representation of the AI as a *contract-generation tool*, not a *solution-generation tool*. You define the contract. The AI scaffolds it. You drive.

---

### Theme 2: AI Prompt Engineering for Structural Output

**The Core Skill Being Built:**
The ability to write prompts that produce exactly one layer of abstraction at a time — structural prompts that produce structure, layout prompts that produce layout, style prompts that produce style — never mixing layers in a single prompt.

**Why This Theme Comes Second:**
The 17-day failure included significant AI "hallucination loop" time — the developer prompting the AI for solutions to problems caused by earlier AI-generated code, spiraling deeper. This happens when prompts are under-specified. A well-architected prompt stack eliminates the spiral.

**The Mental Representation to Build:**
Every AI prompt is a *function call*. It takes a precisely defined input. It produces a precisely defined output. If the output contains unexpected content, the input (the prompt) was the bug, not the AI.

**The Free AI Tool for This Theme:** Claude (free), ChatGPT (free tier), or Windsurf (free, VS Code integrated)

---

#### Drill 2.1 — The Prompt Anatomy Breakdown (20 minutes)

**Setup:** Blank document. No code.

**Task:**
Write 5 prompts, one for each of these output types:
1. TypeScript interface only
2. Tailwind layout classes only (no colors, no typography)
3. Component JSX skeleton only (no logic, no state)
4. One specific bug fix only (with exact file and line context)
5. One unit test only (for a single function)

**Constraint:** Each prompt must include:
- `CONTEXT:` block (1-3 sentences describing the current state)
- `TARGET:` block (1 sentence describing the exact desired output)
- `CONSTRAINTS:` block (what the AI must NOT include in its response)

**Feedback:** Show each prompt to another developer or paste it into Claude and ask: "Is this prompt ambiguous in any way?" If Claude says yes, rewrite it.

---

#### Drill 2.2 — The Layered Build Sequence (45 minutes)

**Setup:** Pick one of the 9 homepage components. Open VSCode and browser.

**Task:**
Build the component in exactly 4 AI prompt rounds, one for each layer:

**Round 1 — Structure prompt:** Ask AI for the semantic HTML/JSX skeleton only. No Tailwind. No logic.
**Round 2 — Layout prompt:** Ask AI to add only Tailwind layout, spacing, and sizing classes to the skeleton from Round 1. No colors. No typography.
**Round 3 — Surface prompt:** Ask AI to add colors, typography, and brand tokens only.
**Round 4 — Interaction prompt:** Ask AI to add one single interaction (hover state, or transition) only.

**Constraint:** You may not proceed to Round N+1 until Round N renders correctly in the browser. No exceptions.

**Feedback:** At the end, count how many times you needed to re-prompt in any single round. Target is ≤ 2 re-prompts per round. If you needed more, the constraint block in your prompt was insufficient. Identify what was missing.

---

#### Drill 2.3 — The Anti-Spiral Protocol (ongoing practice)

**Setup:** Any active development session.

**Task:**
When you encounter a bug, before prompting the AI, write down:
1. The exact error message or visual symptom
2. The layer it belongs to (structure / layout / surface / interaction / data)
3. The single file most likely causing it

Only then write a prompt. The prompt must reference all three items above.

**Constraint:** You are forbidden from writing a prompt that begins with "I'm getting an error..." without first completing all three items above.

**Feedback:** Track how many prompts it takes to resolve each bug. Baseline is your current average. Improvement is the metric.

---

### Theme 3: Component Architecture & Structural Thinking

**The Core Skill Being Built:**
The ability to design components at the right level of abstraction for the immediate commercial deliverable — not as a framework author, not as an open-source library maintainer, but as a product developer shipping a specific page for a specific project.

**Why This Theme Is Third:**
The developer built a bespoke carousel engine with a 2D orientation-aware capacity matrix. The project needed a carousel for a homepage. This is a fundamental confusion between *product development* and *framework development*. Theme 3 builds the mental representation that prevents this.

**The Mental Representation to Build:**
Components are *leaves on the deliverable tree*, not seeds for a future tree. They exist to serve the page, not to be universally reusable across all possible future pages in all possible future projects.

**The Free AI Tool for This Theme:** Claude, ChatGPT (free tier)

---

#### Drill 3.1 — The YAGNI Stress Test (15 minutes per component)

**Setup:** For any component you are about to build or are currently building.

**Task:**
Before writing any code, answer these 5 questions in writing:

1. Does this component need to support more than 2 visual variants *right now, for this page*?
2. Does this component need to work in a context other than this page *right now*?
3. Does this component need custom configuration props beyond the 3-5 fields that this page requires *right now*?
4. Does this component need to be extracted into its own module *right now*?
5. Does this component need a custom utility/helper/engine to function *right now*?

**Constraint:** If all 5 answers are "No" — which they almost always should be for a product build — you are forbidden from building abstractions. Build only what is needed for this page, today.

**Feedback:** If you answered "Yes" to any question, write down the concrete reason why that feature is needed *today for this deliverable*. If you cannot write a concrete reason, the answer is "No."

---

#### Drill 3.2 — The 30-Minute Component (timed)

**Setup:** Timer set for 30 minutes. One component selected.

**Task:**
Build one complete, rendered, styled component in 30 minutes using AI assistance.

Rules:
- The component must match the scope contract written in Theme 1.
- The component must render real or realistic mock data.
- The component must look visually correct at 1280px.

**Constraint:** The timer does not stop for debugging. If you are debugging for more than 5 minutes, the debug is out of scope for this drill. Comment out the broken part. Move forward. Return to it after the timer.

**Feedback:** At the end of 30 minutes, screenshot the rendered output. Does it visually match what you wrote in the Deliverable State field of the scope contract? Yes or No. No partial credit.

---

#### Drill 3.3 — The Refactor Temptation Veto (ongoing)

**Setup:** Any active development session.

**Task:**
Every time you feel the urge to refactor a component, extract a utility, or create an abstraction, pause and write:

```
REFACTOR LOG
Date: [today]
What I want to refactor: [specific thing]
Why I want to refactor it: [honest reason]
What deliverable is blocked without this refactor: [name the deliverable]
Decision: [DEFER / PROCEED]
```

**Constraint:** If the "What deliverable is blocked" field is empty or vague, the decision is always DEFER.

**Feedback:** At the end of a week, review all DEFER entries. How many were genuinely necessary? Typically, fewer than 20% will remain relevant. This builds the visceral understanding that premature abstraction is almost always waste.

---

### Theme 4: Definition of Done & Completion Velocity

**The Core Skill Being Built:**
The ability to recognize when a component is *finished* and to forcibly stop working on it, moving the total project forward rather than polishing individual pieces endlessly.

**Why This Theme Matters:**
The carousel was "working" but was touched repeatedly across the entire 17-day span. Animation durations were adjusted. Button touch targets were refined to exactly 44px. Dots visibility math was iterated. This is a completion failure — the inability to recognize and enforce the "done" state. Theme 4 builds the mental representation of "done" as a binary, not a spectrum.

**The Mental Representation to Build:**
"Done" is a lock, not a dial. Once a component passes its Definition of Done, it is locked. The key that unlocks it is a new, explicitly written scope change — not a feeling that it could be better.

**The Free AI Tool for This Theme:** Any (used for the actual building); the discipline is entirely internal.

---

#### Drill 4.1 — The Binary DoD Checklist (10 minutes setup, then enforced permanently)

**Setup:** For each component in the project, create a checklist with exactly 3-5 items. Each item must be binary: it either passes or it does not. No "looks good," no "feels right."

Example for a ProductSpotlight component:
```
[ ] Renders at 1280px without horizontal scroll
[ ] Renders at 375px without horizontal scroll
[ ] Title, description, and price display from mock data
[ ] Image loads and fills the designated area
[ ] No console errors
```

**Constraint:** You are not permitted to add items to the checklist after you begin building. The checklist is written *before* you write code.

**Feedback:** When all checkboxes are ticked, the component is done. If you feel the urge to continue working on it, write that urge in the Refactor Log (Drill 3.3) and move to the next component.

---

#### Drill 4.2 — The Velocity Audit (weekly)

**Setup:** At the end of each week, review your git log.

**Task:**
Map each commit to one of these categories:
- **A — New component rendered** (forward progress)
- **B — Bug fix on an already-completed component** (maintenance)
- **C — Refactor or abstraction of existing code** (risk of waste)
- **D — Configuration or tooling change** (infrastructure)
- **E — Style or micro-interaction polish on an already-complete component** (often waste)

**Constraint:** Calculate your ratio: A commits / (A+B+C+D+E) commits. Target ratio is ≥ 0.5 for any active build sprint.

**Feedback:** If your ratio is below 0.5, you spent more time on non-forward-progress work than on building. Identify the largest category dragging the ratio down and set a rule for the next week to reduce it.

---

#### Drill 4.3 — The 5-Minute Rule (enforced during every session)

**Setup:** Any active development session.

**Task:**
When a component is passing its DoD checklist but you feel the urge to improve it, set a 5-minute timer. Spend those 5 minutes writing down the improvement in the Refactor Log. When the timer ends, move to the next component regardless.

**Constraint:** The improvement is not implemented *during this session* unless it is a critical bug (broken rendering, console error, data not displaying). Micro-improvements are scheduled for a dedicated polish sprint, never during the structural build sprint.

**Feedback:** At the end of the session, count how many times the 5-minute rule was triggered. High frequency indicates the perfectionism loop is active. Low frequency indicates the "done" mental representation is strengthening.

---

### Theme 5: Debugging Triage & Critical Path Thinking

**The Core Skill Being Built:**
The ability to instantly classify any bug by its impact on the critical path, and to resolve only bugs that are blocking the next deliverable while deferring all others.

**Why This Theme Matters:**
Significant time was spent on legacy iPhone compatibility and landscape small-screen alignment before the primary desktop and standard mobile layouts were structurally complete. This is a triage failure — treating all bugs as equal priority when they are not.

**The Mental Representation to Build:**
A bug's priority is determined entirely by *whether it blocks the next deliverable from being checked off the DoD checklist*. If a bug does not block the next checkbox, it does not get fixed today.

**The Free AI Tool for This Theme:** Claude, ChatGPT (free) — for bug diagnosis; the triage decision is always made by the developer first.

---

#### Drill 5.1 — The Bug Triage Matrix (applied to every bug encountered)

**Setup:** Any active development session. When a bug is encountered, before doing anything else, fill out this matrix:

```
BUG TRIAGE
Description: [one sentence]
Which DoD checkbox does this block: [name the specific checkbox, or write "none"]
Viewport/context where it occurs: [e.g., "iPhone 12, landscape, <375px"]
Is this viewport/context covered in the current DoD: [yes / no]
Priority: [CRITICAL — blocks current DoD | DEFERRED — does not block current DoD]
```

**Constraint:** If Priority = DEFERRED, add the bug to a backlog file and close it. Do not debug it today.

**Feedback:** At the end of each session, count how many bugs were DEFERRED vs. CRITICAL. A healthy ratio during a build sprint is approximately 3:1 (3 deferred for every 1 critical). Inverting this ratio means you are debugging non-blocking issues, which is a sequencing failure.

---

#### Drill 5.2 — The 15-Minute Debug Limit

**Setup:** Any active development session.

**Task:**
Set a 15-minute timer the moment you begin debugging a CRITICAL bug. Use AI assistance immediately — paste the exact error, the relevant code snippet (no more than 30 lines), and a one-sentence description of the expected vs. actual behavior.

**Constraint:** If the bug is not resolved after 15 minutes, it escalates to a "structured defer": write down the exact state of the investigation, comment out the broken code with a placeholder, and move forward with the rest of the component. Return to it in a dedicated debug session.

**Feedback:** Track how many bugs are resolved within 15 minutes vs. require escalation. Target: ≥ 70% resolved within 15 minutes. If this target is consistently missed, the prompts being sent to AI are under-specified (return to Theme 2 drills).

---

#### Drill 5.3 — The Prompt-First Debug Protocol

**Setup:** Any active development session.

**Task:**
Before manually reading through code trying to find a bug, write an AI diagnostic prompt:

```
DIAGNOSTIC PROMPT STRUCTURE:
"I have a bug in [component name].
Error: [exact error message or visual symptom]
File: [exact file path]
Relevant code: [paste 10-30 lines]
What I've already tried: [list any previous fixes attempted]
What I need: A diagnosis of the root cause only. Do not rewrite the component."
```

**Constraint:** You must request *diagnosis only* in the first prompt. Not a fix. A fix that arrives without a diagnosis you understand creates a dependency on the AI. You need to understand the root cause to build the mental representation.

**Feedback:** After receiving the diagnosis, write one sentence in your own words explaining the root cause. If you cannot write that sentence, you do not yet understand it. Ask a follow-up prompt until you can.

---

### Theme 6: Version Control as a Progress Instrument

**The Core Skill Being Built:**
The ability to use git commits not just as a record of what changed, but as a real-time velocity indicator — a mirror that reflects whether progress is moving toward the deliverable or away from it.

**Why This Theme Matters:**
The commit history during the 17-day period showed technically sound commit messages but a velocity pattern that revealed no forward progress toward the 9-component deliverable. Good git hygiene was present. Velocity awareness was absent. Theme 6 builds the ability to read your own commit log as diagnostic data.

**The Mental Representation to Build:**
Every commit is a vote: either for the deliverable being closer to done, or for something else. Count your votes at the end of every session.

**The Free AI Tool for This Theme:** Git (free), GitHub (free tier)

---

#### Drill 6.1 — The Commit Message Protocol

**Setup:** Any git commit.

**Task:**
Every commit message must follow this format:

```
[type]([scope]): [action] — [deliverable impact]
```

Where `[deliverable impact]` is one of:
- `→ closes DoD item [N] on [ComponentName]`
- `→ unblocks [ComponentName] build`
- `→ DEFERRED polish, no DoD impact`
- `→ infrastructure, no DoD impact`

**Constraint:** Commits with no `→` clause are not permitted. If you cannot identify the deliverable impact of a commit, it is a signal that the commit may be waste.

**Feedback:** At the end of a session, scan your commit messages. If more than half do not have a `→ closes DoD item` clause, the session's effort was not primarily directed at the deliverable. This is diagnostic, not judgmental. Use it.

---

#### Drill 6.2 — The Weekly Velocity Review

**Setup:** Every Sunday. 20 minutes.

**Task:**
Run: `git log --since="7 days ago" --oneline`

Categorize each commit using the same A/B/C/D/E taxonomy from Drill 4.2. Plot the distribution. Answer three questions in writing:

1. What percentage of commits moved me closer to the deliverable?
2. What was the single largest time sink that did not move the deliverable forward?
3. What one rule, if enforced next week, would most increase the percentage of forward-progress commits?

**Constraint:** This review must produce at least one actionable rule for the following week. Vague observations ("I need to focus better") do not count. A rule is specific and behavioral ("I will not open any configuration file before all DoD items for the current component are checked off").

---

---

## Part 2 — Integration Phase: Combining All Six Themes

*This phase begins only after the developer has completed at least 3 drills from each Theme in Part 1 and can articulate the core mental representation of each Theme without prompting.*

---

### Integration Principle: The Build Cascade

The six themes are not independent. They form a cascade. Executing them in the wrong order is the root cause of the 17-day failure. The correct cascade is:

```
Theme 1 (Scope)
  → Theme 3 (Architecture)
    → Theme 2 (AI Prompting)
      → Theme 4 (Definition of Done)
        → Theme 5 (Debug Triage)
          → Theme 6 (Version Control)
```

Every component build should exercise all six themes in this sequence. The integration drills below practice firing all six simultaneously.

---

### Integration Drill I.1 — The Full Component Sprint (90 minutes, timed)

**Setup:** One previously unbuilt component from the homepage. Timer set for 90 minutes.

**The 90-Minute Sequence:**

| Time Block | Theme | Activity |
|---|---|---|
| 0–10 min | Theme 1 | Write the scope contract and DoD checklist |
| 10–15 min | Theme 3 | Answer the YAGNI stress test questions |
| 15–20 min | Theme 2 | Write and send the structure prompt to AI |
| 20–30 min | Execution | Build structure from AI output |
| 30–35 min | Theme 2 | Write and send the layout prompt |
| 35–50 min | Execution | Build layout. Any bug encountered → Theme 5 triage immediately |
| 50–55 min | Theme 2 | Write and send the surface prompt |
| 55–75 min | Execution | Apply surface. DoD checkpoint: tick checkboxes |
| 75–85 min | Theme 4 | DoD review. Component locked if all boxes checked |
| 85–90 min | Theme 6 | Commit with deliverable-impact message |

**Constraint:** The timer does not stop. Bugs encountered during execution are triaged immediately using the Bug Triage Matrix. DEFERRED bugs are logged and skipped.

**Feedback:** After the sprint, answer: Were all 5 DoD checkboxes ticked? If yes: the sprint succeeded. If no: which theme broke down? Return to that theme's individual drills for one more session before attempting the next integration sprint.

---

### Integration Drill I.2 — The Full Page Audit (one session per week)

**Setup:** Run the complete application locally. Open DevTools. Open the git log.

**Task:**
For each of the 9 homepage components, assess its status against all 6 themes:

| Component | Scope Contract Written? | DoD Checklist Written? | AI Prompt Layer Used? | DoD Items Passed? | Open CRITICAL Bugs? | Commit Logged? |
|---|---|---|---|---|---|---|
| Hero | | | | | | |
| Shelf | | | | | | |
| ProductSpotlight1 | | | | | | |
| ... | | | | | | |

**Constraint:** Any row with a "No" in any column represents an active gap. Prioritize filling the leftmost "No" first (Scope before DoD before Prompting, etc.) — this enforces the cascade order.

**Feedback:** The table is the single source of truth for the current sprint. Nothing outside this table is in scope. If you feel the urge to work on something not represented in this table, write it in the Refactor Log.

---

### Integration Drill I.3 — The AI Pair Session (2 hours, structured)

**Setup:** One full feature (e.g., the Featured + RedesignFeaturedAndProductSpotlight combination). Claude or ChatGPT open alongside VSCode.

**The Structured AI Pair Protocol:**

1. **Open the session** by pasting your scope contract into the AI: "Here is my scope contract. Hold me accountable to it. If I ask you to build anything outside this scope during this session, tell me."
2. **Build using the Layered Prompt Sequence** from Drill 2.2 (structure → layout → surface → interaction).
3. **For each AI response**, before accepting the code: read it, identify which layer it addresses, and verify it does not contain code from a different layer.
4. **For each bug**: use the Bug Triage Matrix before prompting the AI for a fix.
5. **Close the session** with a commit using the Theme 6 protocol.

**Constraint:** The AI must be treated as a *scoped contractor*, not a *project manager*. You define the scope. You accept or reject the output. You make the architectural decisions.

**Feedback:** At the end of the session, answer: Did the AI output anything that was outside the scope contract? If yes, what in your prompts allowed that to happen? Tighten the CONSTRAINTS block of those prompts.

---

### Integration Drill I.4 — The Simulated Sprint Week (5 days)

**Setup:** A full working week. The sole goal: complete all 9 homepage components to DoD.

**Day-by-Day Structure:**

**Monday:** Complete Scope Contracts and DoD Checklists for all 9 components. No code written.

**Tuesday–Thursday:** One Full Component Sprint (I.1) per 90-minute block. Target: 2-3 components per day.

**Friday:** Full Page Audit (I.2). Identify any failed DoD items. Write CRITICAL bug triage for each gap. Resolve CRITICAL bugs only.

**Daily Ritual (10 minutes, start of each day):**
1. Open git log. Review yesterday's commits. Categorize A/B/C/D/E.
2. Identify today's target DoD items (by component name and checkbox number).
3. Write one sentence: "Today's session succeeds if ___."

**Constraint:** No configuration changes, no Tailwind config edits, no architectural refactors during Tuesday–Thursday sprints. All such work is deferred to a dedicated infrastructure session (Saturday, if needed).

**Feedback:** At the end of Friday's audit, calculate the DoD completion rate: total checked boxes / total possible checkboxes. Target: ≥ 80% for the week. If below 80%, identify which theme broke down most often using the daily commit categories.

---

## Part 3 — Free AI Tools Reference for This Stack

*All tools listed below are free (with noted limitations). No paid subscriptions required.*

| Tool | Use Case | Free Tier |
|---|---|---|
| **Claude (claude.ai)** | Structural prompts, scope contracts, TypeScript interfaces, code review | Free plan available |
| **ChatGPT (chat.openai.com)** | Debugging, explanation, alternative approaches | Free tier (GPT-4o limited) |
| **Windsurf (formerly Codeium)** | VS Code inline AI completion, real-time suggestions | Fully free for individual use |
| **GitHub Copilot** | VS Code inline completion, multi-file context | Free tier for individuals (limited) |
| **Perplexity (perplexity.ai)** | Technical research, documentation lookup | Free tier available |
| **v0.dev (Vercel)** | UI component scaffolding from descriptions | Free tier (limited prompts/month) |
| **Sanity AI Assist** | CMS-side content generation | Available within Sanity Studio |

### The Prompt Stack for sang-logium Specifically

Given the Next.js + Sanity + Tailwind stack, these are the prompt templates calibrated for this project:

**For new components:**
> "I am building a [ComponentName] for a Next.js 14 project using Tailwind CSS. The component receives these props: [TypeScript interface]. Generate the JSX skeleton only — no styling, no logic, no data fetching. Use semantic HTML."

**For layout pass:**
> "Add Tailwind layout classes only to this component: [paste JSX]. Use flex or grid as appropriate. No colors, no typography, no border-radius, no shadows. Target: correct spatial arrangement at 1280px and 375px."

**For Sanity data integration:**
> "This component currently uses this mock data structure: [paste interface]. I need to replace it with a Sanity GROQ query. Sanity schema for [type] is: [paste schema]. Generate the query and the updated component prop type only."

**For debugging:**
> "Bug in [file]. Error: [exact message]. Code causing the error: [10-30 lines]. Expected: [one sentence]. Actual: [one sentence]. Diagnose the root cause only. Do not rewrite the component."

---

## Appendix: The Six Themes at a Glance

| Theme | Core Skill | Key Mental Representation | Primary Drill |
|---|---|---|---|
| **1 — Scope Discipline** | Define before building | The deliverable tree: trunk → branches → leaves | Drill 1.2: Skeleton Sprint |
| **2 — AI Prompt Engineering** | Prompt precisely, one layer at a time | AI as a scoped contractor, not a project manager | Drill 2.2: Layered Build |
| **3 — Component Architecture** | Build for the page, not for the framework | Components are leaves, not seeds | Drill 3.1: YAGNI Stress Test |
| **4 — Definition of Done** | Recognize and enforce the "done" state | Done is a lock, not a dial | Drill 4.1: Binary DoD Checklist |
| **5 — Debug Triage** | Fix only what blocks the deliverable | Bug priority = deliverable impact | Drill 5.1: Triage Matrix |
| **6 — Version Control** | Read commits as velocity data | Every commit is a vote for or against the deliverable | Drill 6.2: Weekly Velocity Review |

---

*Curriculum version 1.0 — sang-logium project*
