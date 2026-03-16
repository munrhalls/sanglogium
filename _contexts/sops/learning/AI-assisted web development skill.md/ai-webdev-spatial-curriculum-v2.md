# The Curriculum: AI-Assisted Web Development Efficacy
### Six Themes — Individual Mastery and Integrated Practice
#### sang-logium project context | Next.js 14 · Tailwind · Sanity · TypeScript

---

> **How to use this document**
> Read it fully before doing any exercises. Every section ends with a "Violation Consequence" — what actually happens in the real project when that sub-skill is missing. These are not hypothetical. They are reconstructions of what happened during the 17-day sang-logium failure.

---

## Preface: Why These Six Themes, and How They Relate

These six themes are not a random list of good practices. They are the six distinct failure modes of AI-assisted web development — the six places where a developer can lose days without writing a single syntactically incorrect line of code.

They are ordered deliberately:

```
Theme 1: Scope Discipline
    ↓ anchors
Theme 3: Component Architecture
    ↓ executes within
Theme 2: AI Prompt Engineering
    ↓ produces output that requires
Theme 4: Definition of Done
    ↓ which is protected by
Theme 5: Debug Triage
    ↓ all of which is measured by
Theme 6: Version Control as Velocity Data
```

Each theme downstream depends on the ones above it. Theme 4 (DoD) without Theme 1 (Scope) is a checklist for the wrong thing. Theme 2 (Prompting) without Theme 3 (Architecture) produces correctly-written prompts asking for the wrong component. The cascade is the point.

RWD (Responsive Web Design) is not a separate theme. It is a property that each theme expresses. It appears explicitly in Theme 1 (scope the responsive requirements), Theme 3 (architecture the breakpoints correctly), Theme 4 (DoD must include mobile and desktop checkboxes), and Theme 5 (triage responsive bugs against the current DoD). This is addressed in each section.

---

## Theme 1: Scope Discipline and Macro-to-Micro Sequencing

### What This Theme Is

Scope discipline is the ability to define the exact boundaries of a deliverable before touching code, and to execute work from the largest structural unit downward to the smallest detail — never the reverse.

It sounds obvious. It is not practiced. The natural pull of development work is toward the interesting detail, the satisfying micro-fix, the elegant abstraction. Scope discipline is the counter-force that must be deliberately applied.

### The Core Principle

A deliverable is a tree. The trunk must exist before branches. Branches before leaves. Leaves before texture. You cannot assess whether the leaves are the right color if the trunk does not yet exist. You cannot know whether the branch layout is correct if you are only looking at one leaf.

For sang-logium, the trunk is: all 9 homepage components rendering with real data at 1280px and 375px. Every piece of work that does not move toward that trunk is a leaf or a branch being built before the trunk exists.

### Sub-Skill 1.1: Writing a Scope Contract

A scope contract is a written definition of what "done" looks like for a specific deliverable, written before any code is touched. It is not a design document. It is not a technical spec. It is a boundary agreement with yourself.

**The format:**

```
COMPONENT: [name]
DELIVERABLE STATE: [one sentence — what does the browser show when this is done]
INCLUDES: [max 4 items — what this component does]
EXCLUDES: [min 3 items — what this component explicitly does not do]
DEFINITION OF DONE: [3-5 binary pass/fail items]
FORBIDDEN SCOPE: [2-3 specific things you will not do during this build]
RWD REQUIREMENT: [desktop breakpoint] + [mobile breakpoint] — both required in DoD
```

**Concrete example — IemsGallery component:**

```
COMPONENT: IemsGallery
DELIVERABLE STATE: A horizontally scrollable or grid-based gallery of IEM products, 
each showing image, brand, name, and price, rendering from real Sanity data.
INCLUDES:
  - Product image, brand, name, price display
  - Grid layout on desktop, scrollable row on mobile
  - Real Sanity data via GROQ query
  - Basic hover state on product cards
EXCLUDES:
  - Filtering or sorting functionality
  - Add-to-cart behavior
  - Animated entrance effects
  - Pagination
DEFINITION OF DONE:
  [ ] Renders at 1280px with no overflow, showing at least 4 products in a grid
  [ ] Renders at 375px with horizontal scroll or stacked layout, no overflow
  [ ] Real Sanity data displayed — not mock data, not lorem ipsum
  [ ] No console errors on mount
  [ ] Image, brand, name, price all visible for each product
FORBIDDEN SCOPE:
  - No refactoring of the product card into a reusable component during this build
  - No animation work beyond a single CSS hover state
RWD REQUIREMENT: 1280px grid layout + 375px scrollable/stacked layout
```

**Why this matters:** Without the EXCLUDES and FORBIDDEN SCOPE fields, the boundaries are soft. Soft boundaries are not boundaries. "I won't do filtering" is not a decision you will remember when you are inside the component and filtering seems like it would only take 20 minutes.

**Violation consequence:** You start building IemsGallery. It works. You notice the product cards look similar to what you'll need for NewestRelease. You start extracting a shared ProductCard component. Two hours later you are debugging the extracted component's prop types. IemsGallery is still not done. This is exactly what happened with the carousel.

---

### Sub-Skill 1.2: The Macro-First Execution Order

Given a page with N components, the correct execution order is:

**Pass 1 — All components rendered, no styling:**
Every component exists in the file. Every component renders its name as text. Every component has a debug border. The page scrolls from top to bottom showing all N components. This pass should take under 30 minutes for 9 components.

**Pass 2 — All components with real data:**
Each component receives its Sanity data. No styling yet. The page now shows real content in unstyled containers. This confirms the data layer works before any visual work begins.

**Pass 3 — Component by component, full build:**
Pick one component. Build it to full DoD (desktop + mobile, styled, interactive where required). Lock it. Pick the next. Repeat.

**What the wrong order looks like:**
Build Hero completely (all styling, all animation, perfect on mobile). Build Featured completely. Notice ProductSpotlight needs a carousel too. Go back into Featured's carousel to generalize it. This is building leaves on one branch before other branches exist.

**Violation consequence:** You cannot assess the visual rhythm of the homepage if only 3 of 9 components are built. You will make styling decisions on Hero that conflict with the rest of the page — decisions you'll reverse later. The 17-day failure included multiple rounds of global style changes (border-radius system-wide, typography tokens, spacing) applied to a half-built page. Each change required re-verification of already-built components.

---

### Sub-Skill 1.3: RWD as Two DoD Checkboxes, Not a Phase

Responsive web design is not a phase that happens after the page is built. It is two checkboxes in every component's DoD:

```
[ ] Renders correctly at 1280px (desktop)
[ ] Renders correctly at 375px (mobile)
```

For a component with a complex responsive transformation (e.g., horizontal carousel on desktop → vertical stack on mobile), there may be a third:
```
[ ] Transition between layouts does not cause layout shift or overflow
```

The "soil" of RWD (Tailwind breakpoints, container config, global spacing tokens) must be stable before component builds begin — but "stable" means "not broken and not changing," not "perfect." Sang-logium's Tailwind config was already functional. The soil was fine. Time spent on soil during the component build sprint was waste.

**Violation consequence:** Treating RWD as a separate phase means you build 9 components for desktop, then make a second full pass for mobile. This doubles the build time and introduces a second round of regressions. Every mobile fix risks breaking a desktop layout you built two weeks ago.

---

### Sub-Skill 1.4: The Forbidden Scope Field — Why It Must Be Written

The human brain under creative pressure will rationalize scope expansion. "This will only take 20 minutes." "I need to do this to do the next thing properly." "I'll do it now while I'm here."

These rationalizations are not detectable in the moment. They feel like good judgment. The only reliable defense is a written list of forbidden items created before the pressure began — before you are inside the component, before the rationalization has a foothold.

The Forbidden Scope field is not a list of bad ideas. It is a list of good ideas that are wrong for right now.

**Violation consequence:** Without a written Forbidden Scope, every reasonable idea becomes a candidate for immediate implementation. The carousel capacity matrix was a reasonable idea. The domain-driven architecture refactor was a reasonable idea. The graph-based coherence engine was a reasonable idea. None of them were wrong as ideas. All of them were wrong for that moment in the build.

---

## Theme 2: AI Prompt Engineering for Structural Output

### What This Theme Is

An AI prompt is a function call. It takes a defined input and should produce a defined output. When the output is unexpected, over-scoped, or wrong-layer, the bug is in the input — the prompt — not in the AI.

Most developers treat AI prompts like conversations: vague, contextless, open-ended. This produces vague, contextless, open-ended output. In a codebase, open-ended output creates hallucination loops — AI-generated code that breaks something, which requires another AI prompt to fix, which introduces a new problem. The loop is entered at the first under-specified prompt.

### The Core Principle

Every component has exactly four buildable layers, in order. A prompt must target exactly one layer. Prompts that mix layers produce mixed output that contains code from multiple layers — some of which will conflict, some of which will be premature, all of which will require cleanup.

**The Four Layers:**

```
Layer 1 — Structure:   Semantic HTML/JSX skeleton. No styling. No logic. No data.
Layer 2 — Layout:      Tailwind spacing, flex, grid, sizing. No colors. No typography.
Layer 3 — Surface:     Colors, typography, brand tokens, imagery, borders, shadows.
Layer 4 — Interaction: Hover states, transitions, animations, touch handling.
```

Each layer builds on the previous. You cannot correctly apply layout to a component whose structure is wrong. You cannot correctly apply surface to a component whose layout is wrong. Mixing layers in a prompt forces you to apply surface before layout is verified — which means surface work that must be redone when layout is fixed.

### Sub-Skill 2.1: The Prompt Anatomy

Every prompt sent to an AI for code output must contain four elements:

```
CONTEXT: [1-3 sentences describing the current state of the file/component]
TARGET: [1 sentence describing the exact desired output]
LAYER: [which of the 4 layers this prompt targets]
CONSTRAINTS: [explicit list of what the AI must NOT include in its response]
```

The CONSTRAINTS block is the most important and most omitted. Without it, the AI will helpfully add things you did not ask for — styling when you asked for structure, logic when you asked for layout, refactoring suggestions when you asked for a bug fix.

**Example — correct Layer 1 prompt:**

```
CONTEXT: I have a NewestRelease component file that is currently empty. 
It needs to display a collection of newly released audio products from Sanity CMS.
TARGET: Generate the JSX skeleton for NewestRelease — a section wrapper, 
a heading, and a row of product card placeholders.
LAYER: Structure only (Layer 1). Semantic HTML/JSX. No styling whatsoever.
CONSTRAINTS: 
- Do not add any Tailwind classes
- Do not add any TypeScript interfaces yet
- Do not add any data fetching logic
- Do not add any props
- Placeholder text only — component name as text content
```

**Example — correct Layer 2 prompt:**

```
CONTEXT: NewestRelease component has this JSX structure: [paste current code].
It needs to display a row of 4 product cards on desktop and scroll horizontally 
on mobile.
TARGET: Add Tailwind layout classes to achieve: flex row on desktop, 
horizontal scroll container on mobile, cards with consistent width.
LAYER: Layout only (Layer 2).
CONSTRAINTS:
- Do not change any existing semantic structure
- Do not add colors, typography, or visual styling
- Do not add any border-radius, shadows, or decorative properties
- Only spacing, sizing, flex, grid, overflow, and scroll classes
```

**Violation consequence:** A single prompt mixing Layer 1 and Layer 3 ("build me a product card component that looks premium with dark background and hover effects") produces output with structural decisions baked into styling decisions. When the layout needs to change (and it will), the surface styling is tightly coupled to the structure and must be rebuilt. This is how 20-minute components become 3-hour components.

---

### Sub-Skill 2.2: The Diagnosis-First Debug Protocol

When a bug occurs, the instinct is to prompt the AI for a fix. This is wrong. A fix without a diagnosis understood by the developer creates AI dependency — the same bug, or a related one, will recur and require another AI fix.

The correct protocol:

**Step 1 — Classify the bug before opening the AI:**
```
Error: [exact message from console or browser]
Layer: [which of the 4 layers does this affect]
File: [exact path]
Line: [if available]
Expected: [one sentence — what should happen]
Actual: [one sentence — what is happening]
Already tried: [list any previous attempts]
```

**Step 2 — Request diagnosis, not fix:**
```
"Diagnose the root cause of this bug. Do not rewrite the component. 
Do not suggest architectural changes. Identify the specific line or 
pattern causing this behavior and explain why."
```

**Step 3 — Write the diagnosis in your own words before accepting any fix:**
If you cannot write one sentence explaining the root cause, you do not understand it yet. Ask follow-up questions until you can. Then apply the fix.

**Why diagnosis before fix matters:**
A fix applied without understanding creates a black box in your codebase. The next bug in the same area will be harder to diagnose because you don't understand the first fix. Over 17 days, black boxes accumulate. Eventually the codebase is a collection of AI-generated patches you cannot reason about.

**Violation consequence:** The Netlify edge function crash caused by complex Tailwind media queries — this was a multi-day debugging spiral. The fix was eventually found, but the developer's understanding of why it broke was never solidified. This means the same class of bug (complex Tailwind expressions breaking build-time parsing) could recur and would require the same debugging journey again.

---

### Sub-Skill 2.3: The Single-Responsibility Prompt

One prompt, one thing. Not "fix the carousel and also improve the mobile layout and also add the hover state." That is three prompts. Send three prompts.

The reason is not bureaucratic. It is practical: when a multi-target prompt produces broken output, you cannot identify which target caused the break. You must revert everything and start over. When each prompt targets one thing, a broken output is immediately locatable — it is the one thing that prompt changed.

**Violation consequence:** A prompt that says "fix the mobile menu and update the color tokens and add the IemsGallery component" produces output touching three files. When the result has a bug, you are debugging three simultaneous changes. You cannot bisect. You cannot isolate. You revert and lose all three.

---

### Sub-Skill 2.4: AI as Scoped Contractor, Not Architect

The mental model that must replace "AI as problem-solver" is "AI as scoped contractor." A contractor does what they are explicitly hired to do. They do not redesign the house because they noticed an opportunity. They do not add rooms you didn't ask for. They execute the defined scope.

The developer is the architect. The developer makes all scope decisions, all structural decisions, all sequencing decisions. The AI executes within the scope the developer defines.

This means:
- You define the component structure. The AI generates the boilerplate.
- You define the layout requirements. The AI writes the Tailwind classes.
- You define the bug. The AI diagnoses the cause.
- You define the fix. The AI implements it.

**What goes wrong when AI becomes the architect:** The AI will suggest refactors, suggest abstractions, suggest "while we're here, let's also..." These suggestions are not wrong. They are wrong for right now. They pull you off the current DoD. Every AI suggestion that is not on your current scope contract is a trap — even when it is a good idea.

**Violation consequence:** During the 17-day failure, AI suggestions for "better architecture" (domain-driven structure, graph-based coherence engine) were pursued because they were presented as improvements during active development sessions. Each one was technically reasonable. Each one cost days and delivered zero homepage progress.

---

## Theme 3: Component Architecture — Build for the Page

### What This Theme Is

Component architecture is the skill of drawing the correct boundary around a component — deciding what it does, what it does not do, what it accepts as input, and what it produces as output — calibrated to the current deliverable, not to imagined future use cases.

This is where the Single Responsibility Principle lives. SRP says: one component, one responsibility. The critical word is "one" — not "zero" (under-built) and not "all conceivable" (over-built). The boundary of that one responsibility is determined by what the current deliverable requires.

### The Core Principle: The YAGNI Test

YAGNI: You Aren't Gonna Need It. Before adding any capability to a component, answer this question: "Does the current deliverable, as defined in my scope contract, require this capability right now?"

If no: do not build it. Not "build it but keep it simple." Do not build it.

The YAGNI test is not about being lazy. It is about accuracy. You genuinely do not know what future requirements will look like. Building for imagined future requirements is building the wrong thing. When the real future requirement arrives, it is almost never what you imagined — so the pre-built capability doesn't fit anyway and requires refactoring.

### Sub-Skill 3.1: The Correct Carousel Architecture

This is the specific case that caused the failure, so it deserves precise treatment.

**What the homepage Featured section needed:**

A component that:
1. Accepts an array of product items as children/props
2. Shows 1 item on mobile, 2-3 on desktop
3. Has previous/next navigation
4. Optionally auto-advances

That is the full correct scope. Everything else is outside scope.

**What was built instead:**
- 2D orientation-aware capacity matrix (handles N items across M breakpoints dynamically)
- CarouselTrack, CarouselRoot, CarouselDots as separate extracted modules
- Custom CSS variable bridges for theme integration
- Touch manipulation mathematics for legacy devices
- Graph-based coherence engine
- 8pt grid validator

Each of these additions had a plausible justification. That is how scope creep works — each step is defensible in isolation. The accumulation is the problem.

**The correct boundary reasoning:**

```
Does the homepage carousel need a capacity matrix?
→ No. It shows products. The number visible at each breakpoint 
  is a Tailwind responsive class: hidden sm:block.

Does it need CarouselTrack as a separate module?
→ No. There is one carousel on the homepage. 
  Extraction for reusability is premature — there is nothing to reuse it yet.

Does it need legacy touch mathematics?
→ No. This is a DoD question disguised as an architecture question. 
  Legacy iPhone support is not in the current DoD.
```

**What a correctly-scoped carousel looks like:**

```tsx
// The entire correct carousel for the homepage Featured section
// ~60-80 lines including TypeScript types

interface CarouselProps {
  items: FeaturedProduct[]
}

export function FeaturedCarousel({ items }: CarouselProps) {
  const [current, setCurrent] = useState(0)
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {items.map(item => (
          <FeaturedCard key={item._id} product={item} />
        ))}
      </div>
      <button onClick={() => setCurrent(Math.max(0, current - 1))}>Prev</button>
      <button onClick={() => setCurrent(Math.min(items.length - 1, current + 1))}>Next</button>
    </div>
  )
}
```

This is DoD-complete for the homepage. It works. It is readable. When the Catalog page needs a carousel with different behavior, you either extend this one with the one specific thing it's missing (probably 30 minutes) or build a second one for the catalog context (also 30 minutes). Either way, 30 minutes — not days.

**Violation consequence:** The over-engineered carousel took approximately 3-5 days. A correctly-scoped carousel takes 2-4 hours including styling. The difference is 2-4 days — on one component. The homepage had 9 components.

---

### Sub-Skill 3.2: SRP Applied to Product Development

SRP in a library or framework context means: this component is reusable across many contexts, so its responsibility must be general. SRP in a product development context means: this component serves this page, so its responsibility must be exactly what this page requires.

These are different applications of the same principle.

**Library SRP:** A `<Button>` component that works everywhere in any application must handle many variants, sizes, states, and accessibility requirements. That breadth is its one responsibility — being a universal button.

**Product SRP:** A "Add to Cart" button on the sang-logium product page has one responsibility: trigger the add-to-cart action with the correct product ID and display the loading/success state. That specificity is its one responsibility.

Treating a product development context like a library context is the most common architectural failure in solo/small-team development. It produces components that are too abstract to reason about, too general to debug easily, and too complex to modify when real requirements change.

**Violation consequence:** The domain-driven architecture refactor mid-sprint. Moving files into domain-structured folders is a library-context concern. For a product with 9 homepage components and a clear delivery deadline, the location of files is irrelevant — the browser doesn't care about folder structure.

---

### Sub-Skill 3.3: The Abstraction Decision Tree

When you feel the urge to extract, abstract, or generalize a component, run this decision tree before acting:

```
1. Is there currently more than one consumer of this abstraction in the codebase?
   NO → Do not abstract. Build the specific version for the current consumer.
   YES → Continue to step 2.

2. Do the multiple consumers share genuinely identical behavior, 
   or just similar-looking behavior?
   SIMILAR BUT DIFFERENT → Do not abstract. Build specific versions.
   IDENTICAL → Continue to step 3.

3. Is abstracting this required to complete the current DoD item?
   NO → Log it in the Refactor Backlog. Do not abstract now.
   YES → Abstract, but only the exact shared behavior. Nothing more.
```

**Applied to the sang-logium carousel:** At the time of the carousel build, there was one consumer (Featured on homepage). Step 1 answer: No. Decision: Do not abstract. Build the specific Featured carousel.

**Applied to the ProductSpotlight components (1, 2, 3):** Three consumers exist. They share similar layout but different content. Step 2 answer: Similar but different. Decision: Build three specific components, or one component with 3-5 props for the differences. Do not build a configurable engine.

---

### Sub-Skill 3.4: How Theme 3 and Theme 4 Differ — The Precise Line

This is the confusion identified at the start of this document.

**Theme 3 is the design decision:** What should this component do? What are its inputs? What are its outputs? What is out of scope? This decision is made before writing code.

**Theme 4 is the stopping decision:** The component is built. Does it meet the DoD? Yes → lock it. No → continue. This decision is made after the code runs.

They operate at different times. They answer different questions. They fail independently.

You can have perfect Theme 3 (correctly scoped carousel, right abstraction level) and still fail Theme 4 (keep polishing the correctly-scoped carousel for two weeks).

You can also fail Theme 3 but not Theme 4 — build an over-engineered carousel, but then apply a strict DoD at a fixed feature set and ship it. You'll have a bloated component, but you'll ship.

Both failures happened in sang-logium. Theme 4 failed first (no DoD meant no lock). Theme 3 then failed through the open door (no lock meant scope could expand indefinitely).

**Why DoD is not "just inside Theme 3":** DoD applies to every component regardless of architectural complexity. The Hero component has zero architectural ambiguity — it shows a hero image and headline. But without a DoD, you can still spend three days on it. Theme 4 must fire on everything. Theme 3 only fires on components where a scope/abstraction decision is required.

---

## Theme 4: Definition of Done and Completion Velocity

### What This Theme Is

Definition of Done is the practice of specifying, in binary pass/fail terms, what "finished" means for a specific component — before building it — and then enforcing that definition as a hard lock when all items pass.

Completion velocity is the rate at which components cross from "in progress" to "locked done." It is the single most important metric of a build sprint. High completion velocity = the page comes together. Low completion velocity = the page stays broken while individual components get polished.

### The Core Principle: Done Is a Lock, Not a Dial

"Done" is not a quality level. It is a binary state. A component is either done (all DoD items pass) or not done (at least one item fails). There is no "mostly done" or "done but could be better."

"Could be better" is always true. If "could be better" can reopen a component, no component ever locks. Every component stays open, bleeding time, while the rest of the page waits.

The lock is what gives you permission to move on. Without a formal lock, the perfectionism loop has no stopping condition. The loop runs until external pressure (a deadline, exhaustion, something else breaking) forces you off the component — not when the component is done.

### Sub-Skill 4.1: Writing Binary DoD Items

A DoD item is binary if and only if a neutral third party could evaluate it without asking you any questions. It either passes or it does not. No judgment required.

**Non-binary (invalid) DoD items:**
- "Looks good on mobile" — "good" requires judgment
- "Animation feels smooth" — "feels" requires judgment
- "Matches the design" — "matches" requires a reference and judgment
- "Works correctly" — "correctly" requires judgment

**Binary (valid) DoD items:**
- "Renders at 375px with no horizontal overflow" — testable in browser
- "No console errors on component mount" — testable in DevTools
- "All 4 products display image, name, and price from Sanity data" — testable visually
- "Carousel advances on next button click" — testable by clicking
- "Image loads within 2 seconds on a standard connection" — testable with throttle

**The RWD DoD items that must always be present:**

Every component's DoD must include:
```
[ ] Renders correctly at 1280px — define "correctly" specifically for this component
[ ] Renders correctly at 375px — define "correctly" specifically for this component
```

"Correctly" must be specified per component. For Hero: "background image fills viewport width, headline and CTA are visible and not clipped." For IemsGallery: "products display in scrollable row, no items hidden by overflow clipping."

**Violation consequence:** During the 17-day failure, the carousel was "working" by a vague standard. Because "working" was not defined as a binary checklist, there was always something that "could be better." Better animation timing. More precise dot math. Tighter touch targets. Each improvement was real. None of them were required by a written DoD. The absence of a binary checklist meant the component was never actually done — it was just "current."

---

### Sub-Skill 4.2: The Lock Mechanism

Once all DoD items pass, the component is locked. Locking means:

1. Commit the component with a message noting DoD completion
2. Add it to the "locked" column of your tracking table
3. Do not return to it during this sprint

A locked component can only be reopened by one thing: a written scope change that adds a new DoD item. Not a feeling. Not a suggestion. A written item added to the DoD checklist with a specific reason.

The practical implementation: keep a simple table in a `.md` file:

```
| Component          | DoD Items | Locked | Date   |
|--------------------|-----------|--------|--------|
| Hero               | 5/5       | YES    | Mar 16 |
| Featured           | 4/5       | NO     | —      |
| ProductSpotlight1  | 0/5       | NO     | —      |
...
```

This table is the single source of truth for sprint progress. Anything not in this table is not in scope. Anything locked is not to be touched.

**Violation consequence:** Without a tracking table, there is no visible representation of progress. You feel busy, you commit frequently, you solve real problems — and the homepage is still broken at day 17. The tracking table makes the gap between "activity" and "progress" impossible to ignore.

---

### Sub-Skill 4.3: The Perfectionism Loop and How to Recognize It

The perfectionism loop is the state of improving a component that already meets its DoD. It feels like productive work. It is not. It is time borrowed from the next component and spent on incremental improvements to a finished one.

**The loop's internal logic:**
"The carousel timing is 450ms. 400ms would feel more responsive. That's a 10-minute change." → 10 minutes later: "The easing function isn't quite right. Let me try cubic-bezier..." → 30 minutes later: "While I'm here, the dot indicators could be slightly larger on mobile..."

Each step is small. The accumulation is large. The component was done at 450ms. Everything after that was the loop.

**How to recognize it in real time:**
You are in the loop if you are making changes to a component that has passed all its DoD items. The question is not "would this improve the component?" The question is "does the component fail any DoD item right now?" If no, you are in the loop.

**The correct response:** Write the improvement in a Refactor Backlog (a simple `.md` file with a list). Close the component. Open the next one. The Refactor Backlog is reviewed only after all components are locked — which means after the homepage is complete.

**Violation consequence:** Carousel animation duration was adjusted from 700ms to 450ms during the 17-day failure. This is a loop entry. The carousel was already working. The change delivered zero homepage progress. If every component in a 9-component page has even one hour of loop time, that's 9 hours of lost velocity — more than two full working days.

---

### Sub-Skill 4.4: Completion Velocity as the Primary Metric

During a build sprint, the only metric that matters is: how many components moved from "not done" to "locked done" today?

Not: "how many commits did I make?" Not: "how many bugs did I fix?" Not: "how many lines did I write?" Not: "how much better does the carousel look?"

Components locked / total components = sprint completion percentage. This is the number you track daily.

**Target velocity:** For a 9-component homepage with no novel technical challenges, 1-2 components per day is realistic for an AI-assisted developer. At that velocity, the homepage is done in 5-9 days. The 17-day failure implies average velocity of approximately 0.5 components per day — or more accurately, no components were locked at all for extended periods while individual components were being refined.

**Violation consequence:** Low completion velocity is invisible without tracking. You feel productive because you are making changes. The browser shows work happening. But if the completion table shows 0 new locked components at the end of the day, the day was spent in loops or on out-of-scope work. Tracking makes this undeniable.

---

## Theme 5: Debugging Triage and Critical Path Thinking

### What This Theme Is

Debugging triage is the practice of classifying every bug by its impact on the current DoD checklist before spending any time on it. Only bugs that block a current DoD item are fixed immediately. All others are deferred — logged and closed, to be revisited in a dedicated bug-fix session.

### The Core Principle: A Bug's Priority Equals Its DoD Impact

A bug's priority is not determined by:
- How annoying it is
- How easy it would be to fix
- How long you've been ignoring it
- How niche the affected scenario is (but how niche it should inform deferral)

A bug's priority is determined by exactly one thing: does this bug prevent a current DoD item from passing?

If yes: CRITICAL. Fix now.
If no: DEFERRED. Log it. Close it. Move on.

This is not a soft guideline. It is a hard rule. The 15-minute-old bug that affects iPhone SE in landscape mode at 320px is DEFERRED if your current DoD says nothing about iPhone SE in landscape mode.

### Sub-Skill 5.1: The Triage Matrix

Before touching any bug, fill this out — in your head if practiced, in writing if new to the practice:

```
BUG: [one sentence description]
DOD ITEM BLOCKED: [name the specific item, or "none"]
CONTEXT: [viewport, state, user action that triggers it]
IN CURRENT DOD: [yes / no]
PRIORITY: [CRITICAL / DEFERRED]
IF DEFERRED — trigger condition: [what would make this CRITICAL in the future]
```

**Applied to real sang-logium bugs:**

```
BUG: Mobile menu has z-index conflict on iPhone SE landscape
DOD ITEM BLOCKED: None — current DoD does not include iPhone SE landscape
CONTEXT: iPhone SE, 320px wide, landscape orientation
IN CURRENT DOD: No
PRIORITY: DEFERRED
TRIGGER: Becomes CRITICAL when mobile menu component's DoD includes 
"renders correctly on all iOS devices without z-index conflicts"
```

```
BUG: Accessories component crashes with TypeError — nothing renders below it
DOD ITEM BLOCKED: "All 9 components render on page" — yes, this blocks it
CONTEXT: Any viewport, component mount
IN CURRENT DOD: Yes
PRIORITY: CRITICAL
```

The difference between these two bugs is total. The first one could absorb an hour. The second one must be fixed before any other work. Treating them as equal priority — which is what happens without a triage practice — means the iPhone SE bug competes with the crashing bug for your attention.

---

### Sub-Skill 5.2: The 15-Minute Debug Rule

For every CRITICAL bug, set a 15-minute timer the moment debugging begins. Use AI immediately — paste exact error, relevant code, expected vs. actual.

At minute 15, make a binary decision:
- Bug is resolved → commit, continue
- Bug is not resolved → structured defer

**Structured defer for a CRITICAL bug:**
```
1. Comment out the broken code. Replace with a placeholder that doesn't crash.
2. Write a comment in the code: // BUG: [description] — [date] — [last state of investigation]
3. Add it to your CRITICAL backlog with the full triage matrix filled out.
4. Continue building. Return to this bug in a dedicated debug session.
```

The structured defer keeps the page building-able. A crash that blocks all rendering below it means zero progress on the remaining components. Commenting it out and replacing with a placeholder unblocks the rest of the build.

**Why the timer matters:** Without a timer, debugging has no natural stopping point. "I'm almost there" is a feeling that can last hours. The timer makes the cost of a debug session visible. If you've spent 45 minutes on a carousel dots math bug, the timer has fired three times. Each time it fired, you made a choice to continue. Making that choice consciously is very different from drifting.

---

### Sub-Skill 5.3: Edge Case Sequencing

Edge cases (legacy device support, unusual viewport sizes, unusual user interactions) are only in scope after the primary case is DoD-complete.

**The sequencing rule:**
1. Desktop primary (1280px, modern browser, standard interaction) — DoD item
2. Mobile primary (375px, modern iOS/Android, touch) — DoD item
3. Desktop secondary (1024px, other modern browsers) — DoD item if in scope
4. Mobile edge cases (320px, landscape, legacy OS) — DoD item only after 1-3 are locked

The iPhone SE landscape fix belongs at step 4. Fixing it at step 1 is a triage failure — you are solving a problem that belongs in the future before solving the problems that belong right now.

**Violation consequence:** The sang-logium failure included deep dives into landscape small-screen alignment and legacy iPhone compatibility before primary desktop layout was complete across all 9 components. This is the debugging equivalent of painting the exterior of a house before the roof is on.

---

### Sub-Skill 5.4: The Deferred Bug Backlog

Every deferred bug goes into a single file: `BUGS.md` in the project root. Format:

```
## DEFERRED BUGS

### [date] — [component] — [severity estimate]
Description: [one sentence]
Context: [viewport/state/trigger]
DoD trigger: [what makes this CRITICAL]
Last investigation state: [what you know so far]
```

This file has two functions: it captures knowledge so debugging doesn't restart from zero when the bug is revisited, and it makes the total deferred bug count visible. If `BUGS.md` has 40 items and the homepage is not yet locked, that is a signal about the triage discipline — too many bugs are being investigated before their DoD trigger condition is met.

---

## Theme 6: Version Control as a Velocity Instrument

### What This Theme Is

Version control in most developer practice is a history tool — a record of what changed. In a deliberate build sprint, git must also function as a velocity instrument — a real-time diagnostic of whether work is moving toward the deliverable or away from it.

The sang-logium failure had technically sound commit discipline (semantic prefixes, atomic commits, clear messages) and near-zero delivery velocity. Good hygiene without delivery awareness is a clean record of going nowhere.

### The Core Principle: Every Commit Is a Vote

Every commit is either a vote for the deliverable being closer to done, or a vote for something else. At the end of each day, count the votes. If more than half the day's commits are "something else" votes, the day's effort was misallocated — regardless of how much work was done.

### Sub-Skill 6.1: The Deliverable Impact Clause

Every commit message must end with a deliverable impact clause. Not optional.

**Format:**
```
[type]([scope]): [action] — → [impact]
```

**Impact options:**
```
→ closes DoD item [N] on [ComponentName]
→ unblocks [ComponentName] build
→ DEFERRED polish, no DoD impact
→ infrastructure, no DoD impact
→ bug fix, unblocks DoD item [N] on [ComponentName]
```

**Examples:**

```
feat(iems-gallery): render component with real Sanity data 
→ closes DoD items 1, 2, 3 on IemsGallery

fix(accessories): resolve TypeError on component mount 
→ bug fix, unblocks DoD item 1 on Accessories

refactor(carousel): extract CarouselTrack to separate module 
→ DEFERRED polish, no DoD impact

style(global): enforce 0px border-radius system-wide 
→ infrastructure, no DoD impact
```

The last two examples are honest about their impact. Writing "→ infrastructure, no DoD impact" makes it impossible to pretend that the commit moved the homepage forward. Honesty in the impact clause is what makes the commit log a diagnostic tool.

**Violation consequence:** Commits during the 17-day failure had clean messages but no impact clause. This meant the commit log looked productive. Counting forward-progress commits against total commits would have made the zero-velocity periods immediately visible — and would have triggered a course correction on day 4 instead of day 17.

---

### Sub-Skill 6.2: The Commit Classification Taxonomy

Every commit belongs to exactly one category:

```
A — Forward progress: closes a DoD item on a required component
B — Bug fix: resolves a CRITICAL bug blocking a DoD item
C — Refactor/abstraction: changes code structure without new functionality
D — Configuration/tooling: Tailwind config, tsconfig, build setup, folder structure
E — Polish: micro-improvements to already-DoD-complete components
```

**Velocity ratio:** A-category commits / total commits = delivery velocity percentage.

**Healthy sprint:** ≥ 50% A-category commits per day.
**Warning:** 30-50% A-category. Examine C and D categories for necessity.
**Critical:** <30% A-category. The sprint has been captured by non-delivery work.

During the 17-day sang-logium failure, the A-category ratio was approximately 10-15%. The majority of commits were C, D, and E. This is a critical failure by the metric — but it was invisible without the taxonomy.

---

### Sub-Skill 6.3: The Weekly Velocity Review

Every Sunday, 20 minutes:

```
git log --since="7 days ago" --oneline
```

For each commit, assign a category (A/B/C/D/E). Then answer three questions:

**1. What is this week's A-ratio?**
[A commits] / [total commits] = [percentage]

**2. What was the single largest time sink outside A-category?**
Name the specific commit pattern, not the general category. "5 carousel refactor commits" not "too much refactoring."

**3. What one specific rule would raise the A-ratio next week?**
Not "focus more." A behavioral rule: "I will not open the Tailwind config file before all current DoD items are locked." Specific and behavioral.

---

### Sub-Skill 6.4: The Sprint Tracking Table and Git Integration

The DoD tracking table from Theme 4 and the commit classification from Theme 6 are the same tool viewed from different angles. The table shows what is locked. The commit log shows what is being worked on. They must tell the same story.

If the table shows 3 components locked and the commit log shows 60% C/D/E commits, there is a contradiction: components are being completed despite most commits not targeting completions. This means the A-commits are efficient but the ratio is dragged down by parallel non-delivery work.

If the table shows 0 components locked and the commit log shows 40% A commits, the A-commits are not reaching DoD. Investigate why: too large a component scope per DoD item, too many bugs blocking DoD items, or scope contracts not written (Theme 1 failure feeding into Theme 4 failure).

---

## Part 2: Integration — How the Six Themes Work Together

### The Cascade Failure Pattern

Individual theme failures are bad. Cascade failures are how 17-day disasters happen. A cascade failure is when one theme's failure creates the conditions for the next theme's failure.

**The sang-logium cascade:**

```
Theme 1 failure (no scope contracts) 
  → Theme 3 failure enabled (no written boundary, so carousel scope expanded freely)
    → Theme 4 failure enabled (no DoD, so no lock point, so carousel stayed open)
      → Theme 2 failure accelerated (prompts chased bugs inside the open carousel)
        → Theme 5 failure compounded (all carousel bugs treated as CRITICAL)
          → Theme 6 revealed (commit log showed high C/E ratio, but no one was reading it as data)
```

Each failure made the next one easier. The cascade moved from the top of the hierarchy downward. This is why Theme 1 is first — it is the upstream failure that enables all others.

---

### Integration Principle 1: Scope Anchors Everything

You cannot write a correct DoD (Theme 4) without a scope contract (Theme 1). The DoD items are derived from the scope contract's "INCLUDES" field. Without the scope contract, DoD items are guessed — and guessed DoD items tend toward vague quality measures ("looks good") rather than binary pass/fail tests.

You cannot make a correct architecture decision (Theme 3) without a scope contract. The YAGNI test asks "does the current deliverable require this?" — the current deliverable is defined by the scope contract. Without it, YAGNI has no anchor and every feature seems potentially necessary.

You cannot write a focused AI prompt (Theme 2) without a scope contract. The CONSTRAINTS block of a prompt is derived from the scope contract's "EXCLUDES" and "FORBIDDEN SCOPE" fields. Without them, the constraints block is empty — which means no constraints.

**The practical rule:** No code is written for a component until the scope contract exists. Not even the file creation. The scope contract is the first artifact.

---

### Integration Principle 2: DoD Makes Architecture Decisions Reversible

One reason architecture decisions feel so high-stakes is that they seem permanent. The wrong abstraction level feels like technical debt that will compound forever.

A tight DoD makes this fear irrational. If you build a too-simple carousel (under-scoped architecture, Theme 3 failure in one direction) but apply a strict DoD, the carousel ships and the page locks. When the Catalog page reveals that the carousel needs a new capability, you extend it. The extension is a known scope change. It takes 30-60 minutes. The tight DoD on the first version means you shipped something working instead of polishing something theoretical.

The over-engineered carousel (Theme 3 failure in the other direction) cannot be rescued by a tight DoD because the over-engineering happened before the DoD was checked — during construction, not after. This is why Theme 3 (design before building) and Theme 4 (lock after building) must both be present.

---

### Integration Principle 3: Triage Protects Velocity

When Theme 5 (triage) fails, every bug becomes a potential velocity destroyer. The deferred iPhone SE bug competes with the CRITICAL Accessories crash for attention. The developer follows the most interesting or most recently discovered bug rather than the most blocking one.

Triage is the bodyguard for Theme 4's completion velocity. Without triage, completion velocity is held hostage by every bug that appears — including all the bugs that don't actually block anything.

**The combined rule:** If a bug does not prevent a DoD item from passing (Theme 4), it is DEFERRED (Theme 5). These two themes are inseparable in practice.

---

### Integration Principle 4: The Commit Log Is the Diagnostic Output of All Five Themes

If all five preceding themes are working:
- Theme 1 producing scope contracts → A-commits have clear deliverable impact
- Theme 3 producing correctly-scoped components → A-commits are the majority
- Theme 2 producing focused AI prompts → bugs are resolved quickly, B-commits are brief
- Theme 4 enforcing DoD → components lock, A-commits have "closes DoD item" clauses
- Theme 5 triaging correctly → C/D/E commits are small in number, DEFERRED bugs stay deferred

The commit log becomes a clean record of forward progress. High A-ratio. Clear impact clauses. Short bug-fix sequences. Rare configuration changes.

If any theme fails, its failure is visible in the commit log:
- Theme 1 failure → C and D commits appear without blocking justification
- Theme 3 failure → C commits cluster around one component that never locks
- Theme 2 failure → B commits appear in long sequences on the same bug
- Theme 4 failure → E commits appear on already-functional components
- Theme 5 failure → B commits appear on edge-case bugs that don't block current DoD

The commit log is the dashboard. Reading it correctly is the skill.

---

### Integration Drill: The Full Component Sprint

This drill exercises all six themes simultaneously. It is the real-world integration test.

**Setup:** One unbuilt component. Timer set for 90 minutes.

```
0:00 — 0:10  Theme 1: Write scope contract and DoD checklist
0:10 — 0:15  Theme 3: YAGNI test — answer 5 questions in writing
0:15 — 0:20  Theme 2: Write and send Layer 1 structure prompt
0:20 — 0:35  Build: implement structure from AI output
              Any bug → Theme 5 triage matrix immediately
0:35 — 0:40  Theme 2: Write and send Layer 2 layout prompt
0:40 — 0:55  Build: implement layout
              Any bug → Theme 5 triage matrix immediately
0:55 — 1:00  Theme 2: Write and send Layer 3 surface prompt
1:00 — 1:15  Build: implement surface
1:15 — 1:20  Theme 4: DoD review — tick each checkbox or identify what's missing
1:20 — 1:25  Theme 6: Commit with deliverable-impact clause
              If DoD complete: "closes DoD items 1-5 on [Component]"
              If not complete: identify which DoD item failed and why
1:25 — 1:30  Retrospective: which theme caused friction? Write one sentence.
```

A component completed in 90 minutes means: 90 minutes is the correct unit of work. Not a day. Not a week. If a component requires more than 90 minutes, either the scope contract was too large (Theme 1 needs subdivision) or a CRITICAL bug is blocking (Theme 5 triage needed).

---

## Appendix: The Theme Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ THEME 1 — SCOPE DISCIPLINE                                  │
│ When: Before writing any code                               │
│ Question: What exactly am I building and what am I not?     │
│ Output: Written scope contract with Forbidden Scope field   │
│ Failure sign: Working on something not in the contract      │
├─────────────────────────────────────────────────────────────┤
│ THEME 3 — COMPONENT ARCHITECTURE                            │
│ When: Before writing the component                          │
│ Question: What is the minimum correct scope for this?       │
│ Output: YAGNI test answers. Component boundary decision.    │
│ Failure sign: Building for imagined future use cases        │
├─────────────────────────────────────────────────────────────┤
│ THEME 2 — AI PROMPT ENGINEERING                             │
│ When: Every AI interaction                                  │
│ Question: Which layer am I targeting? What is forbidden?    │
│ Output: Single-layer prompts with explicit CONSTRAINTS      │
│ Failure sign: AI output contains content from wrong layer   │
├─────────────────────────────────────────────────────────────┤
│ THEME 4 — DEFINITION OF DONE                                │
│ When: Before building (write DoD) + after building (check)  │
│ Question: Does this component pass all binary DoD items?    │
│ Output: Locked component or specific failing item named     │
│ Failure sign: Improving a component that already passes DoD │
├─────────────────────────────────────────────────────────────┤
│ THEME 5 — DEBUG TRIAGE                                      │
│ When: Every bug encountered                                 │
│ Question: Does this block a current DoD item?               │
│ Output: CRITICAL (fix now) or DEFERRED (log and close)      │
│ Failure sign: Fixing bugs that don't block current DoD      │
├─────────────────────────────────────────────────────────────┤
│ THEME 6 — VERSION CONTROL VELOCITY                          │
│ When: Every commit + weekly review                          │
│ Question: What is my A-ratio? What does the log diagnose?   │
│ Output: Commits with impact clauses. Weekly rule from data. │
│ Failure sign: A-ratio below 50%. No impact clauses present. │
└─────────────────────────────────────────────────────────────┘
```

---

*Curriculum version 2.0 — sang-logium project*
*Read fully before beginning any deliberate practice exercises*
