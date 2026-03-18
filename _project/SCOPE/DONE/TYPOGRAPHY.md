# Typography Scope

## Purpose
Verify and lock the complete fluid typography scale before any component
builds on it. This sprint produces a verified, frozen typography foundation.
After this sprint, no typography token changes during component builds.

## Current State
Typography scale exists in tailwind.config.ts as fluid clamp values.
It has never been verified as a complete system on a test page.
Individual values may be correct in isolation but wrong in relationship.

## Deliverable State
A test page at /design-system-test/typography showing the full hierarchy
at three viewport widths (375px, 768px, 1280px), where every scale step
is visually distinct, proportionally correct, and readable.
After verification, the test page is deleted and the scale is frozen.

## The Scale to Verify (in hierarchy order)
- display-1: hero headline — largest text on the site
- display-2: section headline alternative — second largest
- h1: primary section headline
- h2: secondary section headline
- h3: tertiary headline, card titles, subheadlines in large contexts
- h4: small headline, metadata labels, subheadlines in compact contexts
- body: paragraph text
- small: captions, labels, overlines

## Verification Criteria Per Step
Each scale step must satisfy all three:
1. DISTINCT: visually separable from adjacent steps without reading the label
2. PROPORTIONAL: the ratio between adjacent steps feels intentional, not accidental
3. READABLE: at its minimum clamp value (375px viewport), not uncomfortably small

## Known Issue to Resolve During This Sprint
Hero subheadline "Winter Collection" uses text-h4 (16-21px).
Next to display-1/display-2 (36-90px) this reads as a caption, not a subtitle.
This sprint must determine the correct scale step for the hero subheadline role
and document it as a named role in DESIGN_SYSTEM.md.

## In Scope
- Verify all 8 scale steps on the test page at 375px, 768px, 1280px
- Adjust clamp values if any step fails the three criteria above
- Define named roles that map scale steps to semantic contexts:
  hero-headline → display-1 (mobile) / display-1 (desktop)
  hero-subheadline → [to be determined by this sprint]
  section-headline → h1 or h2 depending on context
  card-title → h3
  metadata → h4 or small
- Document final role mappings in DESIGN_SYSTEM.md
- Verify font weights at each scale step
- Verify letter-spacing at each scale step
- Verify line-height at each scale step, single and multiline
- Verify fit of each typography element's properties - line height and letter spacing - to both its own size context and the luxury design system context - visually on test page - and in terms achieving the right look by mathematical relationship symmetry, rather than by visual look alone

## Out of Scope
- Colors (verified in design system sprint separately)
- Component-level spacing
- Interactive states
- Any component other than the test page
- Anything else

## Forbidden Scope
- Do not change font family
- Do not change the 8pt spacing system
- Do not add new scale steps — work with the existing 8
- Do not touch any component file during this sprint
- Do not begin any component build until this sprint is locked

## Definition of Soil-Ready
This sprint is complete when:
every scale step passes all three criteria at all three viewports,
role mappings are documented.
Only then is typography soil ready for components to build on.


## Architecture Decisions

### The Role Mapping (semantic context → scale step)
hero-headline:      text-display-2 mobile / text-display-1 desktop
hero-subheadline:   text-h2 (determined by this sprint)
section-headline:   text-h1
card-title:         text-h3
metadata-label:     text-h4
body-copy:          text-body
caption-overline:   text-small

### The Consumption Rule
Components use role names in comments, scale steps in classes.
// hero-headline role
<h1 className="text-display-2 md:text-display-1 font-bold text-cap">

### The Weight Rules
display-1, display-2: always font-bold
h1, h2: always font-semibold
h3, h4: font-medium as default, font-semibold for emphasis
body, small: font-regular as default

## Mathematical Foundation

This scale uses the Perfect Fourth ratio (1.333) as its modular base.
Each step at desktop = previous step / 1.333.
Each step at mobile = previous step / 1.333, floored at 16px minimum.

h4 at mobile is distinguished from body by letterSpacing (0.1em)
and fontWeight, not by size. This is intentional and acceptable.

Clamp formulas use linear interpolation between 375px and 1440px viewports.
```












This architecture section is what you paste into AI prompts when asking for any component that contains text. It replaces the need for the AI to guess what weight or scale step to use.

---

## 3. What the mathematical relationships should be — and who should figure them out

You are correct that you should not be manually calculating clamp formulas. That is machine work. But there is a prior human decision that must happen before you give the machine any work:

**You must decide the target sizes first. Then the AI calculates the clamp.**

The decision is: at 375px, what px size do I want each step? At 1440px, what px size? Those are design judgment calls. They are yours. The clamp formula is arithmetic once those two numbers are chosen.

**The current values from your config, and what the test page reveals about them:**
```
Step        Mobile target   Desktop target   Problem visible?
display-1   48px            90px             No — looks correct
display-2   36px            68px             No — looks correct
h1          32px            51px             YES — too close to h2
h2          28px            38px             YES — too close to h1
h3          22px            28px             YES — too close to h4
h4          16px            21px             YES — too close to body
body        16px            16px             h4 and body same mobile size
small       12px            12px             OK
```

The core problem: **h4 and body are identical at 375px (both 16px).** This means at mobile, h4 has no visual distinction from paragraph text. It is not a headline at mobile. It is body text with slightly different tracking.

**The human decision you need to make:**

Do you want h4 to be a distinct headline step at mobile, or is h4 a "desktop-only" headline that at mobile collapses to body treatment? For a luxury e-commerce site, I would argue h4 should remain distinct — which means its mobile minimum needs to move up. Something like 18px minimum would separate it from 16px body.

Once you decide that, the AI calculates the new clamp.

---

## 4. What to prompt where — the three AI contexts delineated

This is the most practically important part of your question. You are working across three AI contexts and they have different roles:

**Claude (this conversation):**
Strategic thinking, curriculum, architecture decisions, diagnosis of what is wrong and why, decisions about what the correct values should be. You bring me the test page screenshot and I tell you what I see and what the decision options are. I do not write the actual code changes — that is IDE agent work.

**Antigravity IDE Agent:**
Execution. File creation, code changes, clamp formula implementation, test page updates. You give it a precise, scoped instruction with exact values. It executes. You verify in the browser.

**Gemini (the deliberate practice exercises):**
Testing your understanding of the themes. Not used during active build work.

**The handoff protocol between Claude and IDE agent:**
```
1. Bring screenshot or problem to Claude
2. Claude diagnoses and produces: exact values, exact changes, exact scope
3. You copy that output as a prompt to IDE agent
4. IDE agent executes
5. You verify in browser
6. If wrong: back to Claude with new screenshot
7. If right: tick DoD item, move on
```

You should never be manually figuring out clamp math. You should never be manually writing the config changes. You should be making the design decisions (what sizes do I want) and the verification decisions (does this pass the DoD). Everything between those two decision points is AI execution work.

---

## 5. The prompt for the IDE agent — what to send right now

Based on what the test page shows, here is the precise prompt:

---
```
In tailwind.config.ts, update the fontSize values for h1, h2, h3,
and h4 in the extend.fontSize section.

Current values and problems:
- h1: clamp(2rem, 1.8vw + 1.6rem, 3.1875rem) — too close to h2
- h2: clamp(1.75rem, 1vw + 1.5rem, 2.375rem) — too close to h1
- h3: clamp(1.375rem, 0.5vw + 1.2rem, 1.75rem) — too close to h4
- h4: clamp(1rem, 0.4vw + 0.9rem, 1.3125rem) — same size as body at mobile

Replace with these exact values. Do not change lineHeight or
letterSpacing values. Only change the clamp size formula.

h1: clamp(2.5rem, 2.5vw + 1.5rem, 3.5rem)
    // Mobile: 40px, Desktop: 56px

h2: clamp(1.875rem, 1.5vw + 1.25rem, 2.75rem)
    // Mobile: 30px, Desktop: 44px

h3: clamp(1.375rem, 0.8vw + 1rem, 1.875rem)
    // Mobile: 22px, Desktop: 30px

h4: clamp(1.125rem, 0.5vw + 0.9rem, 1.375rem)
    // Mobile: 18px, Desktop: 22px

CONSTRAINTS:
- Change only the four clamp size values listed above
- Do not touch display-1, display-2, body, small, cta-hero, spotlight
- Do not touch lineHeight or letterSpacing on any step
- Do not touch any other part of tailwind.config.ts
```

---

After the IDE agent makes this change, reload the test page and check whether h1/h2 are now visually distinct and whether h4 is now clearly larger than body at 375px. That is the micro feedback loop. Screenshot and bring back here if anything still looks wrong.

---

## 6. Should there be an eighth curriculum on AI assistance discipline

Yes. And you have correctly identified that it is missing. The current seven spatial themes and six time themes and feedback loop themes describe *what to do* and *when* and *how to see clearly*. None of them describe *how to use AI tools specifically* as instruments in the workflow.

The themes for that curriculum would be:
```
Theme AI1 — Role Clarity
  Which AI handles which type of task.
  Never ask the IDE agent for strategic decisions.
  Never ask Claude to write code you then copy manually.

Theme AI2 — Prompt Layer Discipline
  The same four-layer rule from the Skill Curriculum applies to prompts.
  One prompt, one layer, one output type.

Theme AI3 — The Handoff Protocol
  The exact sequence: Claude diagnoses → produces spec →
  you copy spec → IDE agent executes → you verify → you decide.

Theme AI4 — Verification Ownership
  You verify every AI output in the browser before accepting it.
  AI output is a proposal. Your browser verification is the acceptance.

Theme AI5 — Context Priming
  What to paste at the start of every IDE agent session.
  Scope contract + architecture decisions + relevant DoD items.
  An AI without context produces generic output.

Theme AI6 — The Correction Loop
  When AI output is wrong: diagnose why the prompt was ambiguous,
  fix the prompt, re-send. Never manually fix AI output —
  fix the prompt that produced the wrong output.