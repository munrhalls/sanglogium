# AI-Assisted Web Development: Prompting and Workflow Curriculum
### The Complete Logistics of Effective AI Interaction
#### Stack: Next.js 15 · Tailwind · Sanity · TypeScript
#### Companion to: Spatial Curriculum v3.0, Time Curriculum, Feedback Loop Curriculum

---

> **What this document is**
> The spatial curriculum told you WHAT to build and in what order.
> The time curriculum told you WHEN and HOW FAST.
> The feedback curriculum told you HOW TO SEE clearly.
> This curriculum tells you HOW TO COMMUNICATE with AI tools —
> when to use them, what to give them, what to expect back,
> and when NOT to use them at all.

---

## Preface: The Core Insight

AI tools do not fail because they are bad.
They fail because they receive ambiguous instructions and fill the
ambiguity with their training data defaults, which are not your
project, not your design system, and not your constraints.

Every AI failure in your workflow traces to one of three causes:
1. Wrong tool for the task (strategic AI vs execution AI)
2. Missing context (AI does not know what already exists)
3. Missing constraints (AI does not know what it must not do)

This curriculum addresses all three systematically.

---

## The Four AI Roles — What Each Tool Does

Never use one AI for everything. Each has a distinct role.

```
ROLE 1 — STRATEGIC AI (Claude in browser)
  What it does: diagnosis, architecture decisions, curriculum,
                scope auditing, design system decisions,
                phase assessment, identifying root causes
  When to use: when you are confused, stuck, or making a
               decision that affects multiple components
  When NOT to use: for writing code changes directly
  Cost: free tier (new conversation per session to preserve limits)

ROLE 2 — EXECUTION AI (Windsurf / IDE agent)
  What it does: implementing specific, scoped changes to files
  When to use: when you have a precise TARGET and CONSTRAINTS
  When NOT to use: when you are not sure what the change should be
  Cost: free tier available

ROLE 3 — GENERATION AI (Gemini free / Claude free)
  What it does: generating scope contracts, DoD items,
                prompt lists, sprint files from templates
  When to use: when you need volume output from a template
  When NOT to use: without first providing your constraint template
  Cost: free

ROLE 4 — VERIFICATION AI (any, including yourself)
  What it does: checking AI output against binary criteria
  When to use: after every execution AI output
  Who does it: YOU, in the browser, against the DoD checklist
  Cost: free — it is human attention
```

The most expensive mistake in your workflow: asking the execution AI
(Windsurf) to make decisions, or asking the strategic AI (Claude)
to write code. Role confusion costs more time than any other failure.

---

## Theme P1: Phase Assessment Before Any AI Interaction

### The Mental Representation
> "Before opening any AI tool, I know which phase this component
> is in. The phase determines everything: which AI, what prompt,
> how long it should take."

### The Three Phases

```
PHASE 1 — Does not exist or is structurally broken
  Signal: blank render, crashes, wrong DOM structure
  Work needed: structure → layout → surface → interaction
  Time estimate: 60-90 minutes
  Workflow: full scope contract + DoD sprint + prompt list

PHASE 2 — Exists but has a specific layer problem
  Signal: renders but layout is wrong, or data missing,
          or styling is broken
  Work needed: diagnose which layer, fix that layer only
  Time estimate: 20-40 minutes
  Workflow: diagnosis prompt to strategic AI →
            targeted fix prompt to execution AI

PHASE 3 — Almost right, needs 2-5 specific adjustments
  Signal: renders correctly, data shows, mostly looks right
  Work needed: list the 2-5 specific things, fix each
  Time estimate: 15-30 minutes
  Workflow: flat list of specific things → one execution
            prompt per thing → verify each before next
```

**The assessment takes 60 seconds.**
Look at the component in the browser.
Answer: Does it render? Does data show? Is layout correct?
Three yes answers = Phase 3. Any no = Phase 1 or 2.

**The most expensive mistake: applying Phase 1 workflow to Phase 3.**
This is what cost you 3 hours on Featured.

---

## Theme P2: The Constraint Template

### The Mental Representation
> "Every execution prompt I send contains a constraint template.
> I do not write constraints from scratch. I paste the template,
> then fill in the specifics. Missing constraints = regressions."

### The Master Constraint Template

Save this as `_project/PROMPT_CONSTRAINTS_TEMPLATE.md`:

```
CONTEXT:
[Stack: Next.js 15, React, Tailwind 3, TypeScript, Sanity CMS]
[File: exact file path]
[Current state: what the component currently does/looks like]

TARGET:
[One specific thing. One layer. One file.]

LAYER: [Structure / Layout / Surface / Interaction — pick ONE]

CONSTRAINTS:
- Use only Tailwind classes that exist in tailwind.config.ts
- Do not use arbitrary values like w-[37px] or text-[14px]
- Do not add inline styles
- Do not change any className not explicitly listed in TARGET
- Do not change JSX element nesting or structure
- Do not add or remove any JSX elements
- Do not touch any file not named in TARGET
- Do not touch Hero component under any circumstances
- Do not change any data fetching logic
- Do not add TypeScript types not explicitly requested
- Output only the changed file content, no explanations

FORBIDDEN:
- DO NOT use raw Tailwind primitives (text-brand-900, bg-secondary-400)
  — use design system aliases instead (type-section-hed, btn-primary)
- DO NOT add comments to the code
- DO NOT generate more than one change per prompt
- DO NOT modify carousel internals
- DO NOT change any locked component
```

Remove inapplicable lines per context. Add project-specific constraints.
The template is the minimum. You add specifics on top.

### When Constraints Are Missing — The Diagnostic

If AI output has regressions, one of these constraints was missing:

```
Regression type                 Missing constraint
─────────────────────────────────────────────────────
Raw Tailwind primitives used  → "Use only design system aliases"
Wrong file modified           → "Do not touch any file not named"
JSX structure changed         → "Do not change JSX element nesting"
New elements added            → "Do not add or remove JSX elements"
Arbitrary values used         → "Do not use arbitrary values"
Multiple things changed       → "One change per prompt"
Comments added                → "Do not add comments"
```

After every regression, identify which constraint was missing.
Add it to your template permanently.

---

## Theme P3: The Prompt Anatomy

### The Mental Representation
> "A prompt is a function call. It takes a defined input and produces
> a defined output. If the output is wrong, the input was the bug."

### The Five Elements — All Mandatory

```
1. CONTEXT
   What: the current state of the file and component
   Why: without this, AI fills gaps with training data defaults
   Format: "This is [component name] in [file path].
            It currently [does X]. It has [Y structure]."
   Length: 2-4 sentences maximum

2. TARGET
   What: exactly one specific output
   Why: multiple targets produce multiple changes, only one verifiable
   Format: "Change [specific thing] to [specific thing]."
   Test: can you verify this with one look at the browser? Yes = good.

3. LAYER
   What: which of the four layers this prompt addresses
   Why: prevents AI from mixing layers in one output
   Options: Structure / Layout / Surface / Interaction
   Rule: one prompt = one layer only

4. CONSTRAINTS
   What: what the AI must not do
   Why: AI fills silence with defaults; defaults cause regressions
   Source: your master template, minus inapplicable lines
   Rule: if in doubt, add the constraint. Over-constraining is safe.

5. FORBIDDEN
   What: hard rules stated as explicit negatives
   Why: constraints describe the space; forbidden describes the walls
   Format: "DO NOT [specific action]"
   Rule: always include at minimum: no arbitrary values, no comments,
         no touching unlisted files
```

### The One-Sentence Prompt Test

Before sending any prompt, ask: "Can I verify this output with
one look at the browser?"

If yes: the target is specific enough.
If no: the target is too vague. Rewrite it until you can.

---

## Theme P4: When to Write Scope + DoD vs When Not To

### The Mental Representation
> "The scope/DoD/prompt-list workflow is expensive and powerful.
> It is right for Phase 1 work. It is wrong for Phase 2 and 3.
> Using it for Phase 3 is like calling a project manager to move a chair."

### The Decision Matrix

```
SITUATION                          WORKFLOW
──────────────────────────────────────────────────────────────────
New component, does not exist      Full workflow:
                                   scope → DoD → chunks → prompts

Component structurally broken      Diagnosis prompt to strategic AI
                                   → targeted prompt to execution AI

Component needs data pass          Data contract file + query file
                                   + one execution prompt per file

Component Phase 3 (2-5 fixes)      Flat list of specific things
                                   → one execution prompt per thing
                                   → verify each before next

Design system change               Full workflow (affects everything)

Tooling/config fix                 Direct execution prompt only

Bug fix (CRITICAL)                 Triage → 15-min debug → prompt
```

### The Full Workflow — When and How

Use ONLY for Phase 1 components or significant new features.

```
Step 1 — Scope contract (5 minutes, by hand)
  Write the fence. What is in. What is out. What is forbidden.
  Do NOT use AI to write the scope. You write it.
  AI audits it after.

Step 2 — Scope audit (3 minutes, strategic AI)
  Paste scope to Claude. Ask: "What is ambiguous? What is missing?
  What FORBIDDEN items are most likely to be violated?"
  Revise based on audit.

Step 3 — DoD sprint (5 minutes, generation AI with template)
  Paste scope + constraint template to Gemini.
  Ask: "Generate DoD items. Every item must be binary pass/fail.
  No subjective items. No 'looks good' items."
  Verify: can each item be checked in the browser in 10 seconds?

Step 4 — Execution chunks (3 minutes, strategic AI)
  Paste DoD to Claude. Ask: "Sequence these into execution chunks.
  One chunk per layer. Identify dependencies."

Step 5 — Prompt list (5 minutes, generation AI with template)
  Paste chunks + constraint template to Gemini.
  Ask: "Translate each chunk into one execution prompt following
  the constraint template exactly."
  Verify: does each prompt have all five elements?

Total time for full workflow: 20-25 minutes.
If it takes longer: scope was too large for one session. Subdivide.
```

---

## Theme P5: Context Priming

### The Mental Representation
> "Every new AI session starts blind. I give it context first.
> Without context priming, the AI operates on generic training data.
> With context priming, it operates on my actual project."

### What to Paste at the Start of Every Session

For strategic AI (new Claude conversation):
```
Project: sang-logium — Next.js 15 luxury audio e-commerce
Stack: Next.js 15, TypeScript, Tailwind 3, Sanity CMS
Design system: tailwind.config.ts with custom typography aliases
(type-hero-headline, type-section-hed, etc.) and button aliases
(btn-primary, btn-cart, btn-ghost)
Current focus: [one sentence about what you are working on]
```

For execution AI (Windsurf, new session):
```
This is sang-logium, a Next.js 15 app with TypeScript and Tailwind 3.
Design system aliases are in tailwind.config.ts.
The file I am working on is: [exact file path]
```

Context priming takes 30 seconds. It prevents 30 minutes of
AI producing generic code that ignores your design system.

---

## Theme P6: The AI Role Separation Protocol

### The Mental Representation
> "Strategic AI thinks with me. Execution AI executes for me.
> I never ask execution AI to think. I never ask strategic AI to execute."

### The Protocol in Practice

```
YOU → Strategic AI (Claude):
  "I have this problem / confusion / decision. Help me diagnose it."
  Receive: analysis, options, recommendation

YOU → synthesize → specific scope/target

YOU → Execution AI (Windsurf):
  "Implement this specific change. Here are constraints."
  Receive: changed file

YOU → browser verification:
  "Does the change match the TARGET? Yes/No."
  If no: back to strategic AI with what went wrong
  If yes: tick DoD item, next prompt
```

The handoff moment — your job:
You are the translator between strategic AI output and execution AI input.
Strategic AI produces analysis and recommendations.
You distill that into a TARGET.
Execution AI implements the TARGET.

If you paste strategic AI output directly into execution AI:
the execution AI receives analysis text and tries to implement analysis.
This produces garbage.

---

## Theme P7: The Zero-Cost Tool Stack

### What You Actually Need

```
TOOL            PURPOSE                     COST    STATUS
────────────────────────────────────────────────────────────
Claude.ai       Strategic AI, diagnosis,    Free    Use now
(free tier)     curriculum, auditing        tier
                (start new conversations
                 to preserve message limits)

Gemini Free     Generation AI for volume    Free    Use now
(Google+)       output: DoD items,
                prompt lists, sprint files
                (use with constraint template)

Windsurf        Execution AI in IDE         Free    Use now
(free tier)     (limited completions/month  tier
                 but sufficient for scope)

Browser         Verification and feedback   Free    Always open
DevTools        loop (micro loop)

Git             Version control as          Free    Always on
                velocity instrument
```

### The Cost-Zero Upgrade Path

When Windsurf free tier runs out mid-session:
- Write the execution prompt as a file in `_project/PENDING_PROMPTS/`
- Resume next day when quota resets
- This enforces the 60-minute timer discipline naturally

When Claude free tier limits hit:
- Start a new conversation
- Paste context priming + the specific question only
- Do not re-paste entire conversation history

---

## Theme P8: The Feedback Loop Integration

### How AI Roles Map to Feedback Loops

```
Micro loop (every save):
  Browser open. DevTools console visible.
  After every Windsurf execution: verify in browser immediately.
  Do not send next prompt until current change is verified.

Session loop (60 minutes):
  "What new rendered output exists that did not exist 60 minutes ago?"
  If the answer is "nothing visible": wrong AI was used,
  or wrong phase assessment, or prompts lacked constraints.

Checkpoint loop (4 hours):
  Review: what phase was each component I worked on?
  Did I apply the correct workflow for each phase?
  What was the A-ratio of my Windsurf prompts today?

Milestone loop (per component):
  DoD checklist verification in browser before any commit.
  Not "I think it looks right." Binary: each item, one by one.
```

---

## Theme P9: The Regression Prevention System

### The Mental Representation
> "A regression means a constraint was missing. My constraint template
> grows after every regression. Over time, regressions approach zero."

### The Regression Log

Add to `_project/BUGS.md` a section:

```
## Regression Log
[Date] — [Component] — [What regressed] — [Missing constraint]

Example:
2026-03-20 — Featured — Raw Tailwind primitives used instead of aliases
  Missing constraint: "Use only design system aliases from tailwind.config.ts"
  Added to template: YES
```

After 10-15 regressions logged and added to template:
your constraint template covers your actual failure patterns.
New regressions become rare.
This is the Ericsson deliberate practice feedback loop
applied to prompt engineering.

---

## Theme P10: The Scope Decision Tree

### When to Write a Scope Contract

```
Is this a new component that does not yet exist?
  YES → write scope contract
  NO → go to next question

Is this a structural refactor affecting multiple files?
  YES → write scope contract
  NO → go to next question

Is this a design system change affecting all components?
  YES → write scope contract
  NO → go to next question

Is this a data architecture change?
  YES → write scope contract
  NO → skip scope contract

For everything else: flat list of specific things + constraint template.
```

The scope contract is a 20-minute investment.
It pays off when the change touches more than 3 files
or when the change affects things you cannot easily see.

For Phase 3 components (Featured, most homepage components now):
no scope contract. Flat list + constraint template + one prompt per item.

---

## Integration: The Complete Daily Workflow

### Morning (10 minutes before opening any file)

```
1. Phase assessment for every component to work on today
   — look in browser, apply the three-question test
   — write: component name, phase, 2-3 specific things wrong

2. Workflow assignment per component:
   — Phase 1: full workflow (scope → DoD → prompts)
   — Phase 2: diagnosis prompt → targeted prompt
   — Phase 3: flat list → one prompt per item

3. Time estimate:
   — Phase 1: 60-90 min
   — Phase 2: 20-40 min
   — Phase 3: 15-30 min per component
   — Total: does this fit in today?
   — If not: scope cut (which Phase 3 items are optional today)
```

### During Session

```
1. Context prime Windsurf at session start (30 seconds)
2. Set 60-minute timer
3. One prompt → verify in browser → tick or diagnose → next prompt
4. When timer fires: what new rendered output exists?
5. If nothing new: stop. Diagnose with Claude. Restart.
```

### Per Prompt

```
1. Is this prompt targeting one layer only?
2. Does it have the constraint template applied?
3. Can I verify the output with one browser look?
If all three yes: send it.
If any no: rewrite it.
```

### End of Day (5 minutes)

```
Three questions:
1. What components moved from incomplete to locked today?
2. What was the phase of each? Did I apply the right workflow?
3. What regressions occurred? Which constraint was missing?
   Add it to the template.
```

---

## The Constraint Template — Ready to Use

Copy this into `_project/PROMPT_CONSTRAINTS_TEMPLATE.md`:

```
CONTEXT:
Stack: Next.js 15, TypeScript, Tailwind 3, Sanity CMS
File: [exact file path]
Current state: [1-2 sentences about what exists now]

TARGET:
[One specific change. One sentence.]

LAYER: [Structure / Layout / Surface / Interaction]

CONSTRAINTS:
- Use only Tailwind classes from tailwind.config.ts
- Do not use arbitrary values like w-[37px] or h-[200px]
- Do not use raw color primitives (text-brand-900) — use aliases
- Do not add inline styles
- Do not change any className not mentioned in TARGET
- Do not change JSX element nesting or structure
- Do not add or remove JSX elements
- Do not touch any file not named in TARGET
- Do not modify carousel internals
- Do not touch Hero component
- Do not change data fetching logic
- Output the complete changed file only, no explanations

FORBIDDEN:
- DO NOT use arbitrary Tailwind values
- DO NOT add comments to the code
- DO NOT generate more than one change per prompt
- DO NOT change locked components
- DO NOT invent design tokens not in the config
```

---

## The Ten Themes at a Glance

```
P1  Phase Assessment    Know the phase before choosing any workflow
P2  Constraint Template  Paste before every execution prompt
P3  Prompt Anatomy      CONTEXT + TARGET + LAYER + CONSTRAINTS + FORBIDDEN
P4  Scope vs No Scope   Full workflow only for Phase 1 and architecture
P5  Context Priming     Prime every new AI session before asking anything
P6  Role Separation     Strategic AI thinks. Execution AI executes. You verify.
P7  Zero-Cost Stack     Claude free + Gemini free + Windsurf free
P8  Feedback Integration Micro loop after every prompt. Session loop every hour.
P9  Regression Prevention Log every regression. Add constraint. Template grows.
P10 Scope Decision Tree  New component = scope. Phase 3 = flat list.
```

---

*Prompting and Workflow Curriculum v1.0 — sang-logium project*
*Companion to: Spatial Curriculum v3.0, Time Curriculum, Feedback Loop Curriculum*
*Read before every sprint. Apply P1 before opening any file.*
