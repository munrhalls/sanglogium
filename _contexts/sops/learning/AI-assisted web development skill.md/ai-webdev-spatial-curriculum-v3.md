# AI-Assisted Web Development: Complete Skill Curriculum
### Seven Themes — From First Principles to Integrated Practice
#### Stack: Next.js 15 · Tailwind · Sanity CMS · TypeScript
#### Framework: Deliberate Practice (Ericsson, *Peak*)

---

> **How to read this document**
> Read it completely before doing any exercises. Every section teaches the mental representation first — what correct looks like — then the sub-skills that build it, then concrete sang-logium examples of each sub-skill failing. The violation consequences are not hypothetical. They are reconstructions of the actual 17-day failure.

---

## Preface: First Principles of This Curriculum

### Why Seven Themes, Not Six

The previous version of this curriculum merged Scope Discipline and Sequencing into one theme. That was wrong. They are distinct cognitive operations, distinct failure modes, and distinct skills. You confirmed this instinct correctly. The curriculum is rebuilt with them separated.

The seven themes are:

```
Theme 1 — Scoping           What territory does this deliverable cover?
Theme 2 — Sequencing        In what order do I execute the work?
Theme 3 — Component         At what abstraction level do I build this?
           Architecture
Theme 4 — AI Prompt         How do I instruct AI to produce exactly one
           Engineering       layer of output at a time?
Theme 5 — Definition        When is this deliverable finished and locked?
           of Done
Theme 6 — Debug Triage      Which problems do I solve now vs. defer?
Theme 7 — Version Control   What does my commit log tell me about
           as Velocity       whether I am making progress?
```

### Why These Are Ordered This Way

They are not random. Each theme downstream depends on the ones above it:

- Theme 5 (DoD) without Theme 1 (Scope) produces a checklist for the wrong thing
- Theme 3 (Architecture) without Theme 1 (Scope) has no anchor — every abstraction seems potentially necessary
- Theme 2 (Prompting) without Theme 3 (Architecture) asks the AI to build the wrong component precisely
- Theme 6 (Triage) without Theme 5 (DoD) cannot decide what is blocking vs. not blocking
- Theme 7 (Version Control) without all preceding themes produces a clean record of going nowhere

Themes 1 and 2 are the upstream foundations. Get these wrong and everything downstream is executing correctly toward the wrong destination.

### What Deliberate Practice Actually Means Here

Ericsson's central finding in *Peak* is that expertise is not built by logging hours. It is built by developing **mental representations** — internal models of what correct looks like — through structured practice with immediate feedback at the edge of comfort.

For each theme in this curriculum, the mental representation being built is named explicitly. That mental representation is the thing you are actually trying to acquire. The drills are the mechanism. The representation is the goal.

The self-reinforcing loop: better mental representations → ability to practice at higher level → better representations. The loop starts by doing the thing incorrectly enough times with feedback to recognize the pattern of correct.

**Critical distinction for this curriculum:** Knowledge is not skill. Reading this document gives you knowledge. Doing the exercises gives you skill. Knowledge of what YAGNI means cannot stop you from building a capacity matrix — only the practiced reflex can. Read the document. Then do the exercises. In that order. Do not confuse having read something with having learned it.

### How RWD Fits Into This Curriculum

Responsive Web Design is not a separate theme. It is a property that each theme must account for:

- **Theme 1 (Scope):** Every scope contract must specify both desktop and mobile deliverable states
- **Theme 2 (Sequencing):** Mobile is built per-component, not in a separate phase after all desktop is done
- **Theme 3 (Architecture):** Components are designed from the start to support responsive layout, not retrofitted
- **Theme 4 (Prompting):** Layout prompts explicitly include responsive classes in Layer 2
- **Theme 5 (DoD):** Every component's DoD must include both desktop and mobile checkboxes
- **Theme 6 (Triage):** Mobile edge-case bugs (iPhone SE landscape) are DEFERRED until primary desktop + mobile views pass DoD
- **Theme 7 (Version Control):** Commits touching responsive layout should note which viewport they address

**The ground truth on RWD sequencing:** Build each component to desktop DoD, then immediately build it to mobile DoD, before moving to the next component. Never do all 9 desktop, then all 9 mobile. The cost is doubled regressions and doubled context-switching.

---

## Theme 1: Scoping

### The Mental Representation Being Built

> "Every deliverable is a fenced territory with a gate. The fence defines what is inside and what is outside. The gate defines what constitutes finishing. Both must be written before the first line of code."

A scope without a fence is not a scope. It is a direction. Directions expand. Fences hold.

### What Scoping Is

Scoping is the spatial skill of defining the exact coverage of a deliverable before any work begins. It answers: what is inside, what is outside, and what is explicitly forbidden during this build.

It operates entirely before code. Once code starts, scoping is complete. Any change to scope during the build is a scope change — it requires stopping, writing the new scope explicitly, and deciding whether to accept it.

Scoping is **not**:
- A design document (no implementation details)
- A list of what would be nice to have
- Open to "we'll figure it out as we go"

Scoping **is**:
- A written fence around one specific deliverable
- Binary by definition — a feature is either in scope or out of scope
- Complete before the first line of code for that deliverable

### First Principle Behind Scoping

The fundamental cognitive problem scoping solves is this: **the human mind under creative pressure continuously expands the perceived solution space**. When you are inside a component, everything you notice becomes a potential improvement. The carousel timing could be better. The animation could be smoother. The abstraction could be cleaner. Every one of these observations is real. None of them are in scope unless you wrote them in the scope contract.

Without a written scope, the fence does not exist. Without the fence, every observation becomes a candidate task. The result is a component that is never finished because "finished" was never defined.

### Sub-Skill 1.1: The Scope Contract Format

Write this before touching any code for any component:

```
COMPONENT: [name]
STACK CONTEXT: Next.js 15, Tailwind, Sanity CMS, TypeScript

DELIVERABLE STATE — DESKTOP (1280px):
[One sentence. What does the browser show? What data is visible?]

DELIVERABLE STATE — MOBILE (375px):
[One sentence. What does the browser show? How does layout differ?]

IN SCOPE:
- [item 1]
- [item 2]
- [item 3 — max 5 items total]

OUT OF SCOPE:
- [item 1 — minimum 3 items. These are real temptations, not obvious ones]
- [item 2]
- [item 3]

FORBIDDEN SCOPE:
[2-3 specific things you will NOT do during this build, named precisely]

DATA SOURCE:
[Sanity schema / mock data / hardcoded — which, and where it comes from]

RWD REQUIREMENTS:
Desktop: [specific layout description]
Mobile: [specific layout description]
```

**Concrete example — IemsGallery:**

```
COMPONENT: IemsGallery

DELIVERABLE STATE — DESKTOP (1280px):
A section showing IEM products in a 4-column grid, each card showing
product image, brand, name, and price, populated from Sanity data.

DELIVERABLE STATE — MOBILE (375px):
Same products in a 2-column grid, cards stacked, horizontally
centered, no overflow.

IN SCOPE:
- Product image, brand, name, price rendered per product
- Grid layout (4-col desktop, 2-col mobile)
- Real Sanity data via GROQ query on the iems type
- Single hover state: card lifts slightly

OUT OF SCOPE:
- Filtering or sorting controls
- "Add to cart" behavior
- Animated entrance on scroll
- Pagination or "load more"
- Skeleton loading state

FORBIDDEN SCOPE:
- Do not extract ProductCard into a shared component during this build
- Do not add any transition other than the single hover lift
- Do not touch Tailwind config

DATA SOURCE:
Sanity, GROQ query on type: 'iem', fields: title, brand, price, image

RWD REQUIREMENTS:
Desktop: 4-column CSS grid, gap-6, max-w-7xl container
Mobile: 2-column CSS grid, same gap, full width
```

**Why the FORBIDDEN SCOPE field is the most important:**

Every item in Forbidden Scope is a real temptation — a good idea at the wrong time. Without writing it down before the pressure starts, the rationalization arrives during the build: "I need to extract ProductCard now or I'll have to refactor later." The answer to that rationalization is always the same: you will have more information about the correct abstraction when you actually need it in a second component. That information does not exist yet. Do not build for information you do not have.

**Violation consequence — sang-logium:**
No scope contracts were written. The carousel had no fence. "Carousel handles children" was a direction, not a scope. When the developer was inside the carousel and noticed it didn't handle varying item counts elegantly, there was nothing to say "that's outside scope." So a capacity matrix was added. Then the matrix needed tests. Then the tests revealed edge cases. Each step was locally reasonable. The fence would have stopped it at the first step.

---

### Sub-Skill 1.2: Out of Scope Is Not "Lower Priority"

This is the most common misunderstanding of scoping. Out of scope does not mean "less important." It does not mean "do it later in this build." It means: **do not do it during this build at all.**

Out of scope items go to a backlog. They are addressed when they become the subject of their own scope contract. They do not compete for attention with in-scope items. They are not weighed against in-scope items. They are invisible during this build.

If an out-of-scope item turns out to be necessary for completing an in-scope item, that is a scope discovery — stop, write the new scope contract explicitly, decide whether to include it, then continue. This takes 5 minutes. It prevents hours of uncontrolled expansion.

**Violation consequence — sang-logium:**
The domain-driven architecture refactor was not an explicit scope decision. It appeared during development as "this would be better." Because there was no scope contract saying "folder structure is out of scope," the refactor happened. It was a good idea. It was not the current scope. The absence of a fence made the distinction between "good idea now" and "good idea later" invisible.

---

### Sub-Skill 1.3: Scope Requires a Written Deliverable State

The deliverable state field is the most actionable line in the entire scope contract. It answers: when I look at the browser at the end of this build, what do I see?

If you cannot write that sentence before starting, you do not know what you are building. This is not a failure of confidence — it is a diagnostic. An incomplete deliverable state sentence is a signal to stop and clarify before writing any code.

**Invalid deliverable states:**
- "IemsGallery looks good" — not observable
- "IemsGallery works correctly" — not observable
- "IemsGallery is complete" — circular

**Valid deliverable states:**
- "4-column grid of IEM products at 1280px, each showing image, brand, name, price from Sanity"
- "2-column grid at 375px, same data, no horizontal overflow"

The test: can a person who has never seen this project open the browser, look at the component, and determine in 10 seconds whether it matches the deliverable state? If yes, the deliverable state is valid. If no, rewrite it.

---

## Theme 2: Sequencing

### The Mental Representation Being Built

> "A page is built layer by layer across all components simultaneously, not component by component to completion. No component goes deeper than the current global layer until all components have completed that layer."

This is the director-of-logistics mental model. Which thing must exist before the next thing can begin? What order reveals structural problems the earliest?

### What Sequencing Is

Sequencing is the temporal skill of ordering work across multiple deliverables so that each step reveals the information needed for the next step, and so that no deep work on one component blocks or invalidates the work on others.

It operates at the level of the whole page, not the individual component. Scoping happens per component. Sequencing happens across all components simultaneously.

Sequencing is **not**:
- The order of code within a single component (that's architecture)
- The order of CSS properties (that's style preference)
- A schedule or timeline (that's project management)

Sequencing **is**:
- The order in which whole components progress from one state to the next
- The discipline that prevents going deep on one component before the others are structurally sound
- The rule that determines when you are allowed to start styling, animating, or polishing anything

### First Principle Behind Sequencing

The fundamental problem sequencing solves is **local optimization destroying global coherence**. When you build one component to pixel-perfect completion before any other component exists, you are making visual decisions in a vacuum. The Hero's typography looks right when Hero is the only thing on the page. It may look wrong when Shelf, Featured, and ProductSpotlight are also present. Every styling decision made in isolation carries the risk of needing revision once the context exists.

This is not theoretical. It is structural. You cannot evaluate visual rhythm, spacing hierarchy, or contrast relationships until the page exists as a whole. Building one component to completion before the others exist means making decisions about a system that does not yet exist.

### The Three-Pass Model

The correct sequence for a multi-component page is three passes:

**Pass 1 — Skeleton Pass (all components, no styling):**
Every component renders its own name as text. Every component has a debug border. The page scrolls from top to bottom. All components are present.
Time: Under 30 minutes for 9 components.
Purpose: Confirms structure. Confirms the page composition is correct. Reveals structural bugs before any investment in styling.

**Pass 2 — Data Pass (all components, real data, no styling):**
Each component receives its Sanity data. Content renders. No styling beyond structural layout.
Time: 30-60 minutes for 9 components if schemas are already defined.
Purpose: Confirms data flows correctly before visual work begins. Catches data-layer bugs in the cheapest possible state — unstyled.

**Pass 3 — Build Pass (one component at a time, full scope):**
Pick one component. Build it to DoD (desktop + mobile, styled, interactive as required). Lock it. Pick the next. Repeat.
Time: Per component, based on scope complexity.
Purpose: Full visual build with context. Each component is built with all others visible on the page.

**Why Pass 1 must come before Pass 3:**
If you skip Pass 1 and go straight to building Hero fully, you make Hero's typography decisions without seeing where Hero ends and Shelf begins. You make Hero's spacing decisions without seeing the weight of Featured below it. When you build Shelf afterward, it may need to compensate for decisions you already made about Hero. Rework follows.

**Violation consequence — sang-logium:**
The developer went from skeletal structure directly to deep builds on Featured and the carousel. ProductSpotlight1 still had lorem ipsum on day 17. The sequencing rule was violated: deep work on Featured while ProductSpotlights had no real data. Styling decisions made on Featured could not account for the visual weight of the full page because the full page did not exist.

---

### Sub-Skill 2.1: The Sequencing Rule for RWD

Within Pass 3 (Build Pass), the sequencing rule for responsive design is:

1. Build component to DoD at desktop (1280px). Lock the desktop DoD items.
2. Immediately build the same component to DoD at mobile (375px). Lock the mobile DoD items.
3. Commit. Move to next component.

**Never:**
- Build all 9 components at desktop, then circle back for mobile.
- Apply global mobile fixes across all components in one pass.

**Why:** Building all desktop first means mobile bugs reveal themselves in the context of a half-built visual system. Fixing mobile on Hero after all 9 are built desktop-complete means touching Hero after you have mentally moved on to Accessories. Every mobile fix then runs the risk of breaking the desktop state you locked two weeks ago.

---

### Sub-Skill 2.2: The "Nothing Goes Deeper" Rule

During Pass 1: no component is styled. Not even "just a little." Not even "while I'm here." Every component is a debug border and a text label.

During Pass 2: no component is styled. Not even "the layout is quick." Data renders. Structure is present. No visual styling.

The rule is binary and absolute because partial exceptions destroy the rule. "I'll just add layout classes to Hero while I'm here" becomes "I'll just add the color tokens too since I have them" becomes a fully built Hero while 8 components are still skeleton. You are now in Pass 3 while still in Pass 2. The sequencing has collapsed.

**Violation consequence — sang-logium:**
The commits show skeletal structure being built, then immediately deep dives into the carousel and Featured section. Passes 1 and 2 were not separated from Pass 3. The result was that the full page composition was never established before deep work began, making every visual decision speculative.

---

### Sub-Skill 2.3: Sequencing Within a Component (Layer Order)

Within a single component during Pass 3, there is also a sequencing rule. A component is built in exactly four layers, in order:

```
Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only.
                        No colors. No typography. No borders.
Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
Layer 4 — Interaction:  Hover states, transitions, animations.
```

Each layer must render correctly before the next layer begins. This is not bureaucratic. It is practical: if you apply colors before layout is correct, the colors will need repositioning when layout is fixed. If you add animations before surface is correct, the animation will need revision when colors change. Each premature layer multiplies later rework.

**Why layers, not arbitrary order:**
This maps directly to how browsers process CSS. Structure (DOM) exists first. Layout (box model, flexbox, grid) positions elements. Surface (color, typography) paints elements. Interaction (transitions, transforms) animates painted elements. Building in this order aligns with the browser's own rendering sequence. Building out of order fights the rendering model.

---

## Theme 3: Component Architecture

### The Mental Representation Being Built

> "A component's responsibility is bounded by what the current deliverable actually requires — not by what future deliverables might require. The boundary is drawn by reading the scope contract, not by imagining future use cases."

### What Component Architecture Is

Component architecture is the skill of deciding — before writing code — what a component does, what it accepts as input, what it produces as output, and what it explicitly does not do. This is a design decision, made once, before the build begins.

It is the application of the Single Responsibility Principle in a product development context: one component, one responsibility. The responsibility is bounded by the current deliverable.

### First Principles: SRP, YAGNI, and the Product/Library Distinction

**Single Responsibility Principle (SRP):** Each component should have exactly one reason to change. If a component changes because the data structure changed AND because the visual design changed AND because the carousel logic changed, it has multiple responsibilities and they should be separated.

**YAGNI (You Aren't Gonna Need It):** Never implement something until it is actually required. Not "probably required." Not "likely to be required." Actually required by the current deliverable as written in the scope contract. John Carmack, one of the most respected engineers in software history, wrote: "It is hard for less experienced developers to appreciate how rarely architecting for future requirements turns out net-positive."

**The Product/Library Distinction:** This is the most important nuance for sang-logium and the most commonly missed.

A **library component** (React, Material UI, a shared design system) must be general because it will be used in many unknown contexts by many unknown consumers. Breadth of capability is its value. A universal carousel that handles 1 to 1000 items across any breakpoint configuration is correct for a library.

A **product component** (a sang-logium homepage carousel) serves exactly one page in exactly one application. Specificity is its value. A carousel that handles 3-6 products in the Featured section of the sang-logium homepage is correct for a product. It is not a library. It should not be built as one.

**Violation consequence — sang-logium:**
The carousel was built as a library component inside a product context. The 2D orientation-aware capacity matrix, the extracted CarouselTrack/CarouselRoot/CarouselDots modules, the custom CSS variable bridge — these are correct architecture for a carousel library published on npm. They are catastrophically over-engineered for a single product page. The mismatch between context (product) and approach (library) is the architectural failure.

---

### Sub-Skill 3.1: Drawing the Correct Boundary

The correct boundary for any component is drawn by reading its scope contract and asking: "What is the minimum structure that satisfies every IN SCOPE item and none of the OUT OF SCOPE items?"

That minimum structure is the correct component. Not a component that also handles the items in OUT OF SCOPE "just in case." Exactly the minimum that satisfies IN SCOPE.

**Applied to the sang-logium carousel:**

The scope contract for Featured's carousel (if it had been written) would have said:
- IN SCOPE: display 3-6 featured products, slide through them, prev/next buttons
- OUT OF SCOPE: capacity configuration, orientation detection, sub-module extraction

The minimum structure satisfying that scope:
```tsx
// The entire correct carousel — approximately 40-60 lines

interface FeaturedCarouselProps {
  products: FeaturedProduct[]
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0)

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(products.length - 1, i + 1))

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {products.map(product => (
          <FeaturedCard key={product._id} product={product} />
        ))}
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2">
        ←
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2">
        →
      </button>
    </div>
  )
}
```

This is DoD-complete for the homepage. It works. It is readable. It does not require sub-modules. When the Catalog page needs a carousel with different behavior, you either extend this one (30 minutes) or build a catalog-specific one (30 minutes). The pre-built capacity matrix does not accelerate either of those paths — because when the real Catalog requirement arrives, you will have information about what it actually needs that you do not have right now.

---

### Sub-Skill 3.2: The YAGNI Decision Test

Before adding any capability to a component, answer in writing:

```
1. Is this capability required by a current DoD item? [yes / no]
2. Is there a concrete consumer of this capability in the codebase right now? [yes / no]
3. Does omitting this capability prevent the component from passing its DoD? [yes / no]
```

If any answer is "no" — and especially if all three are "no" — do not build the capability. Log it in the Refactor Backlog. Build only what the current scope contract requires.

**Concrete example — the "columns" prop:**
"I'm building the Dacs component. It shows 4 DACs in a grid. Should I make it accept a `columns` prop so it can be 2, 3, or 4 columns?"

1. Is a configurable column count required by a DoD item? No — DoD says "4 DACs in a grid."
2. Is there a consumer of the columns prop right now? No — only Dacs uses this component.
3. Does omitting columns prevent DoD? No — 4-column grid works without it.

Decision: Do not add columns prop. Build a 4-column grid. If another section later needs a different column count, add the prop then with the actual requirement as your guide.

---

### Sub-Skill 3.3: The Refactor Backlog

Every time the YAGNI test returns "no" and you feel the urge to build anyway, write the idea in a file called `REFACTOR_BACKLOG.md`:

```
## REFACTOR BACKLOG

### [date] — [component] — [idea]
What: [one sentence description of the abstraction or capability]
Why I want it: [honest reason]
What concrete requirement would justify building it: [specific condition]
```

This serves two purposes. First, it captures the idea so it is not lost. Second, it makes the total number of deferred ideas visible. At the end of a sprint, reviewing this file often reveals that 80% of the items became irrelevant as the project evolved — validating YAGNI empirically.

---

### Sub-Skill 3.4: The Distinction Between Themes 3 and 5

This was identified as a point of confusion and deserves direct treatment.

**Theme 3 (Architecture)** operates before code and answers: what should this component do?
**Theme 5 (Definition of Done)** operates after code and answers: is this component finished?

They fail independently. Here is the proof:

*Theme 3 correct, Theme 5 absent:* You correctly scope the carousel to "slides children, prev/next, N items at breakpoints." You build exactly that. Then you spend two weeks polishing it because there is no DoD to lock it. Theme 3 succeeded. Theme 5 failed.

*Theme 3 wrong, Theme 5 present:* You build the capacity matrix (Theme 3 failure). But your DoD says "carousel renders 3-6 products with prev/next controls" and you check it and lock it the moment those items pass. You have a bloated component, but you shipped it. Theme 3 failed. Theme 5 succeeded.

*Both absent (sang-logium):* No scope boundary on the carousel (Theme 3 absent), no DoD lock (Theme 5 absent). The carousel consumed two weeks.

The reason they must remain separate disciplines: DoD must fire on every component regardless of architectural complexity. Hero has no architectural ambiguity, but without DoD, you can still spend three days on it. Theme 5 must be a reflex that fires on everything. If it lives inside Theme 3, it only gets applied when you are thinking about architecture — which is not all the time.

---

## Theme 4: AI Prompt Engineering

### The Mental Representation Being Built

> "An AI prompt is a function call. The developer is the caller. The AI is the function. The output is entirely determined by the precision of the input. A bad output means the input was the bug, not the AI."

### What AI Prompt Engineering Is

AI prompt engineering for web development is the skill of writing instructions that produce exactly one layer of output at a time, with explicit constraints on what the AI must not include, in a format that produces consistently useful results.

In 2026, AI tools are genuinely part of the development workflow. Research shows 68% of developers use AI to generate code during development, and the tools have matured significantly. The failure mode has shifted: it is no longer "AI doesn't work" — it is "AI produces too much, in the wrong direction, without constraints." The problem is now one of precision and scope control, not capability.

### First Principle Behind Prompt Engineering

**The Garbage In, Garbage Out Principle applied to AI:** An AI model processes your input and produces probabilistically likely output given that input. If your input is vague, the output will be the statistically most common answer to a vague question — which is a generic, over-featured, under-constrained response. The AI is not wrong. It is answering the question you actually asked, not the question you meant to ask.

The CONSTRAINTS block of a prompt is what separates "write me a carousel" (produces a carousel with TypeScript types, animations, accessibility, keyboard navigation, and responsive logic) from "write me the JSX skeleton for a carousel, Layer 1 only, no styling, no logic, no TypeScript interfaces" (produces exactly a JSX skeleton).

### The Four Layers — What They Are and Why They Exist

Every component has exactly four buildable layers. This is not arbitrary. It maps to how components are actually evaluated and debugged:

```
Layer 1 — Structure
  What it is: The semantic HTML/JSX skeleton. Tags, nesting, component boundaries.
  What it produces: The DOM. Boxes. Labels. Nothing visual.
  What it does NOT include: Any Tailwind class. Any TypeScript. Any state. Any data.
  Why it exists first: If the structure is wrong, everything built on it must be rebuilt.
                       Finding structure bugs costs nothing when structure is all that exists.

Layer 2 — Layout
  What it is: Tailwind classes for positioning, sizing, spacing, flex, grid, overflow.
  What it produces: Components in their correct spatial relationships.
  What it does NOT include: Colors. Typography weights. Border-radius. Shadows.
  Why it comes second: Layout depends on structure. Layout bugs are cheapest to find
                       when no surface styling exists to complicate the visual.

Layer 3 — Surface
  What it is: Colors, typography, brand tokens, imagery, borders, shadows.
  What it produces: The visual appearance.
  What it does NOT include: Transitions. Hover states. Animations.
  Why it comes third: Surface decisions are only meaningful when layout is confirmed correct.
                      A beautifully colored component with wrong spacing is wasted surface work.

Layer 4 — Interaction
  What it is: Hover states, focus states, transitions, animations, touch handling.
  What it produces: Dynamic behavior on user input.
  What it comes last: Animations applied to a visually wrong surface need revision
                      when the surface is fixed. Interaction is always the final layer.
```

**What happens when layers are mixed:**
You ask for "a premium product card with dark background, hover scale effect, and rounded corners." The AI produces all four layers simultaneously. When the layout is wrong (the image takes too much vertical space), fixing it requires fighting against the surface classes already present. When the animation timing is off, fixing it is harder because the surface classes create visual noise during debugging. Mixed-layer output creates mixed-layer bugs. Mixed-layer bugs take longer to debug.

---

### Sub-Skill 4.1: The Prompt Structure

Every code-generation AI prompt must contain four blocks:

```
CONTEXT: [1-3 sentences. What file is this? What does it currently contain?
          What is its role in the page?]

TARGET: [1 sentence. What exactly should this prompt produce?
         Name the layer explicitly.]

LAYER: [State which of the four layers this prompt targets.]

CONSTRAINTS:
- [Explicit list of what the AI must NOT include]
- [Each constraint addresses one specific layer the AI might include]
- [Minimum 3 constraints. Fewer means the prompt is under-constrained]
```

**Example — correct Layer 1 prompt for NewestRelease:**

```
CONTEXT: I have an empty NewestRelease.tsx file in a Next.js 15 project.
This component will display newly released audio products on the sang-logium
homepage, rendered inside a Shelf wrapper component.

TARGET: Generate the JSX skeleton for NewestRelease — a section element
containing a heading and a row of 4 product card placeholders.

LAYER: Layer 1 (Structure only).

CONSTRAINTS:
- No Tailwind classes of any kind
- No TypeScript interfaces or types
- No useState, useEffect, or any React hooks
- No data fetching or Sanity queries
- No props — the component takes no arguments yet
- Placeholder text content only (component name, "Product Card" x4)
```

**Example — correct Layer 2 prompt for NewestRelease:**

```
CONTEXT: NewestRelease.tsx currently has this structure: [paste current JSX].
It needs to display 4 product cards in a horizontal row on desktop (1280px)
and in a 2x2 grid on mobile (375px).

TARGET: Add Tailwind layout classes only to achieve the responsive layout.

LAYER: Layer 2 (Layout only).

CONSTRAINTS:
- No colors (no bg-, text-color, border-color classes)
- No typography (no font-, text-size, font-weight, tracking, leading classes)
- No border-radius, shadows, or decorative properties
- No animations or transitions
- Only: flex, grid, gap, padding, margin, width, height, max-width, overflow classes
- Preserve all existing JSX structure — only add classes, do not change elements
```

---

### Sub-Skill 4.2: The Diagnosis-First Debug Protocol

When a bug occurs, the reflex is to paste code into the AI and ask "what's wrong?" This produces a full component rewrite. You learn nothing. The same bug class will recur.

The correct protocol:

**Before opening the AI, write:**
```
Error: [exact console message, or exact visual symptom]
File: [exact path]
Layer: [which of the 4 layers is this in]
Expected: [one sentence]
Actual: [one sentence]
Tried already: [any previous fix attempts]
```

**The prompt to the AI:**
```
CONTEXT: [paste error, file, layer, expected, actual, tried]
TARGET: Diagnose the root cause of this bug. Identify the specific
line or pattern causing it and explain why.
CONSTRAINTS:
- Do not rewrite the component
- Do not suggest structural changes
- Do not add features
- Provide diagnosis only — one paragraph maximum
```

**After receiving the diagnosis:** Write one sentence in your own words explaining the root cause. If you cannot write that sentence, ask follow-up questions until you can. Only then apply the fix.

**Why diagnosis first matters:** A fix without understanding creates a black box. The next time the same bug class appears — in a different component, in a different file — you will not recognize it. You will spend the same time debugging it again. Understanding the root cause transfers. The fix without the understanding does not.

---

### Sub-Skill 4.3: AI as Scoped Contractor

The mental model that must replace "AI as problem-solver" is "AI as scoped contractor."

A contractor executes defined scope. They do not redesign the scope. They do not add rooms you didn't ask for. They build what is specified and stop. If they notice an opportunity, they mention it — they do not act on it without your explicit approval.

In practice this means:
- When the AI suggests "while we're at it, we should also refactor..." — that is a scope expansion. Evaluate it against the current scope contract. Accept it only if it is required by a DoD item. Otherwise: note it in the Refactor Backlog and continue.
- When the AI produces output that includes code from a different layer than requested — the AI overstepped its contractor scope. Identify which lines are out-of-scope. Delete them. Do not use them "since they're there."
- When the AI's output breaks something — diagnose the cause yourself before asking for a fix. The contractor produced a defect; your job is to understand the defect, not just request a replacement.

**Violation consequence — sang-logium:**
AI suggestions for "graph-based coherence engine" and domain-driven architecture refactoring were pursued because they were presented during active development sessions as improvements. Each suggestion was reasonable. Each one pulled the developer out of the current scope into a new direction. The contractor was redrawing the architect's plans, and the architect (the developer) was approving it without checking the scope contract — because no scope contract existed.

---

## Theme 5: Definition of Done

### The Mental Representation Being Built

> "Done is a lock, not a dial. A component is either done (all DoD items pass) or not done (at least one item fails). 'Could be better' is not a DoD item. It is always true and therefore meaningless."

### What Definition of Done Is

DoD is the practice of specifying, in binary pass/fail terms, the exact conditions that constitute "finished" for a specific deliverable — written before the build begins — and enforcing those conditions as a hard lock when they all pass.

DoD comes directly from Agile/Scrum methodology where it emerged as an industry-proven solution to exactly this problem: teams treating "working" as synonymous with "done," leading to accumulating technical debt and never-ending polish cycles. The research-validated insight: "done-ness" must be a shared explicit contract with binary criteria, not a feeling or a judgment call.

### First Principle Behind DoD

The fundamental problem DoD solves is the absence of a stopping condition. Without a written stopping condition, the perfectionism loop has no exit. The loop runs until external pressure (deadline, exhaustion, another component breaking) forces you off — not when the component is genuinely finished.

Perfectionism is not a personality flaw. It is the natural state of working without a stopping condition. The carousel was not left open because of a character defect. It was left open because nothing said "this is done." When "done" is not defined, every improvement is equally valid as a next action. The stopping condition must be imposed externally by writing it before the pressure begins.

---

### Sub-Skill 5.1: Writing Binary DoD Items

A DoD item is binary if and only if a neutral third party can evaluate it without asking you any questions. Pass or fail. No judgment required.

**Test for binary validity:** Read the item aloud. If the evaluation requires the word "good," "correct," "appropriate," "proper," "quality," or any other subjective term — it is not binary. Rewrite it.

**Non-binary (invalid) examples:**
- "Carousel feels smooth" → "feels" is subjective
- "Layout looks correct on mobile" → "looks correct" is subjective
- "Performance is acceptable" → "acceptable" is subjective
- "Matches design" → requires comparing to a reference, introduces judgment

**Binary (valid) examples:**
- "No horizontal overflow at 375px viewport" → testable: resize browser, check
- "No console errors on component mount" → testable: open DevTools
- "All 4 products display image, brand, name, price" → testable: count visible fields
- "Carousel advances to next item on button click" → testable: click the button
- "Component renders at both 1280px and 375px without layout collapse" → testable

**The RWD DoD items that must appear in every component:**
```
[ ] Renders at 1280px without horizontal overflow
[ ] Renders at 375px without horizontal overflow
[ ] [component-specific behavior at desktop]
[ ] [component-specific behavior at mobile]
[ ] No console errors on mount
```

---

### Sub-Skill 5.2: The Lock Mechanism

When all DoD items pass, the component is locked. Locking is:

1. Checking every DoD item against the live browser
2. Committing with "closes DoD items 1-N on [ComponentName]"
3. Adding the component to the locked list
4. Not returning to it during this sprint

A locked component can only be reopened by a new, explicitly written DoD item. Not a feeling. Not a suggestion from the AI. Not "I noticed something while I was in another component." A written DoD item with a specific, binary, testable condition.

**The tracking table (lives in a file called `SPRINT_DOD.md`):**

```
| Component               | DoD Items | Locked | Date   |
|-------------------------|-----------|--------|--------|
| Hero                    | 5/5       | YES    | Mar 16 |
| Shelf                   | 3/3       | YES    | Mar 16 |
| RedesignFeatured...     | 0/6       | NO     | —      |
| ProductSpotlight2       | 4/6       | NO     | —      |
| ProductSpotlight3       | 4/6       | NO     | —      |
| IemsGallery             | 0/5       | NO     | —      |
| NewestRelease           | 0/5       | NO     | —      |
| Dacs                    | 0/5       | NO     | —      |
| Accessories             | 0/5       | NO     | —      |
```

This table is the sprint's single source of truth. Nothing outside this table is in scope. If you feel the urge to work on something not in this table, it goes to the Refactor Backlog.

---

### Sub-Skill 5.3: The Perfectionism Loop — Recognition and Interruption

The perfectionism loop is the state of improving a component that already passes its DoD. It feels identical to productive work. The internal signal is: "this is almost right, just one more thing."

**How to recognize it in real time:**
Ask: "Does the component currently fail any DoD item?" If no — you are in the loop. The change you are about to make is not required. It is preferred.

**The correct response to recognizing the loop:**
Write the improvement in the Refactor Backlog. Close the file. Open the next component. The Refactor Backlog is reviewed only after all components are locked — after the homepage is complete.

**Why the loop is so persistent:**
The loop feels productive because real work is being done. Real improvements are being made. The component genuinely gets better. The problem is not the quality of the work — it is the opportunity cost. Every hour in the loop on a completed component is an hour not spent on an incomplete one. The homepage stays broken while a working component becomes marginally better.

**Violation consequence — sang-logium:**
Carousel animation duration was adjusted from 700ms to 450ms. The carousel was already rendering. This adjustment was the loop. The component passed every functional DoD criterion at 700ms. The 250ms reduction delivered zero new functionality and zero new DoD completions. If this adjustment took 30 minutes (conservative), and each of 9 components had equivalent loop time, that is 4.5 hours of loop time — more than a full working day.

---

## Theme 6: Debug Triage

### The Mental Representation Being Built

> "A bug's priority is not its annoyance level. It is its DoD impact. A bug that does not block a current DoD item does not get fixed today. Not 'later today.' Not 'quick fix.' Logged. Closed. Today's focus continues."

### What Debug Triage Is

Debug triage is the practice of classifying every bug at the moment it appears, before any debugging effort begins, into exactly one of two categories: CRITICAL (blocks a current DoD item) or DEFERRED (does not block a current DoD item).

CRITICAL bugs are fixed immediately. DEFERRED bugs are logged in `BUGS.md` and closed. They are not "low priority." They are not "will get to it later today." They are invisible until their CRITICAL trigger condition is met.

### First Principle Behind Debug Triage

The fundamental problem triage solves is **equal-priority treatment of unequal-priority problems**. Without triage, every visible bug competes for attention. The most recently noticed bug, the most visually annoying bug, or the most technically interesting bug wins. None of these selection criteria are related to what is actually blocking progress.

A developer without triage is a first-responder who treats every patient in the order they arrived in the waiting room regardless of condition. A developer with triage treats the one having a cardiac arrest before the one with a sprained ankle — regardless of arrival order.

---

### Sub-Skill 6.1: The Triage Matrix

Before touching any bug, mentally (or physically in early practice) run this matrix:

```
BUG: [one sentence]
BLOCKS DOD ITEM: [name the specific item — or write "none"]
CONTEXT: [viewport, state, trigger]
IN CURRENT DOD: [yes / no]
PRIORITY: [CRITICAL / DEFERRED]
IF DEFERRED — TRIGGER: [what condition makes this CRITICAL]
```

**Applied to real sang-logium bugs:**

*Bug 1: Hero background image not loading — white rectangle*
```
BLOCKS DOD ITEM: "Hero renders background image at 1280px" — YES
IN CURRENT DOD: Yes
PRIORITY: CRITICAL
```

*Bug 2: Mobile menu z-index conflict on iPhone SE landscape (320px)*
```
BLOCKS DOD ITEM: None — current DoD does not include 320px landscape
IN CURRENT DOD: No
PRIORITY: DEFERRED
TRIGGER: Becomes CRITICAL when mobile menu DoD includes "renders on all viewport widths including iPhone SE landscape"
```

*Bug 3: Accessories component crashes with TypeError — nothing below renders*
```
BLOCKS DOD ITEM: "All 9 components render on page" — YES
IN CURRENT DOD: Yes
PRIORITY: CRITICAL
```

Bugs 1 and 3 are fixed immediately. Bug 2 is logged in `BUGS.md` and does not consume any time today.

---

### Sub-Skill 6.2: Edge Case Sequencing

Edge cases are valid engineering concerns. They are not valid concerns during a structural build sprint.

The sequencing rule for edge cases:
1. Primary desktop (1280px, modern browser) — DoD item
2. Primary mobile (375px, modern iOS/Android) — DoD item
3. Secondary desktop (1024px, other modern browsers) — DoD item if in scope
4. Edge cases (320px, landscape, legacy OS, unusual interactions) — DoD item only after 1-3 are locked

The iPhone SE landscape bug belongs at step 4. Fixing it during step 1 is triage failure — solving a future problem before current problems are solved.

**The psychological trap:** Edge cases feel urgent because they are visible and specific. "I can see exactly what's wrong — the z-index is off in landscape." The specificity makes the fix feel close. But the cost is not the fix — it is the opportunity cost of not moving the components that are blocking DoD items forward.

**Violation consequence — sang-logium:**
Significant time was spent on `fix(mobile menu - compatibility with older iPhones)` before the primary desktop layout was complete across all 9 components. The iPhone SE landscape fix was a real bug. It was a real fix. It was the wrong time for both.

---

### Sub-Skill 6.3: The 15-Minute Rule for CRITICAL Bugs

For CRITICAL bugs: set a 15-minute timer the moment debugging begins. Send the AI a diagnostic prompt (Theme 4, Sub-Skill 4.2) immediately.

At minute 15, binary decision:
- Resolved → commit, continue
- Not resolved → structured defer

**Structured defer for a CRITICAL bug:**
1. Comment out the broken section. Replace with a `<div>BUG: [description] — [date]</div>` placeholder.
2. Write the full triage matrix entry in `BUGS.md` including the last state of investigation.
3. Continue building the rest of the page.
4. Return to this bug in a dedicated debug session at the end of the day.

The structured defer keeps the page buildable. An unresolved crash in Accessories blocks everything below it. Commenting it out unblocks the rest. You lose one component temporarily but gain the ability to continue the sprint.

---

## Theme 7: Version Control as Velocity Data

### The Mental Representation Being Built

> "The commit log is a mirror. It reflects whether work is moving toward the deliverable or away from it. Reading it correctly is as important as writing it correctly."

### What Version Control as Velocity Data Is

Git version control is universally practiced. The insight most developers are missing is not how to use git — it is that the commit log, read correctly, is a diagnostic instrument that reveals whether the development effort is on-target or captured by non-delivery work.

Best practices in 2026 explicitly identify annotating AI-assisted changes in commits as essential for transparency and future maintenance. The industry standard is moving toward commit histories that document not just what changed, but why it changed and what deliverable it serves.

### First Principle Behind This Theme

Every commit is a vote. Either it is a vote saying "the deliverable is closer to done," or it is a vote saying "something other than the deliverable was worked on." At the end of a day, a week, or a sprint, counting votes tells you the truth about where effort went — regardless of how productive it felt.

The sang-logium failure had technically excellent commit hygiene (semantic prefixes, atomic commits, descriptive messages) with near-zero delivery votes. Good form, wrong direction. The form is easy to verify — the direction requires the tracking system below.

---

### Sub-Skill 7.1: The Deliverable Impact Clause

Every commit message must end with a deliverable impact clause:

```
[type]([scope]): [action] — → [impact]
```

Impact options:
```
→ closes DoD item [N] on [ComponentName]
→ closes DoD items [N],[M] on [ComponentName]
→ unblocks [ComponentName] build
→ DEFERRED work, no DoD impact
→ infrastructure, no DoD impact
→ fixes CRITICAL bug blocking [ComponentName] DoD item [N]
```

**Examples:**

```
feat(iems-gallery): render with real Sanity data → closes DoD items 1,2,3 on IemsGallery

fix(accessories): resolve TypeError on mount → fixes CRITICAL bug blocking Accessories DoD item 1

refactor(carousel): extract CarouselTrack → DEFERRED work, no DoD impact

style(global): enforce 0px border-radius → infrastructure, no DoD impact

fix(mobile-menu): legacy iPhone landscape → DEFERRED work, no DoD impact
```

The last two lines require honesty. Writing "→ infrastructure, no DoD impact" makes it impossible to pretend that the commit moved the homepage forward. That honesty is the mechanism. Without the impact clause, a day of C/D/E commits looks identical to a day of A/B commits in terms of volume and quality. The impact clause makes velocity visible.

---

### Sub-Skill 7.2: The Commit Taxonomy

Every commit belongs to exactly one category:

```
A — Forward progress:   Closes a DoD item on a required component
B — Critical bug fix:   Resolves a CRITICAL bug blocking a DoD item
C — Refactor:           Changes code structure without new functionality
D — Configuration:      Tailwind config, tsconfig, build setup, folder structure
E — Polish:             Improvements to already-DoD-complete components
```

**Velocity ratio:** A-commits / total commits = delivery velocity percentage

Healthy sprint: ≥ 50% A-category
Warning: 30-50% A-category — examine C and D for necessity
Critical: <30% A-category — sprint has been captured by non-delivery work

**The sang-logium ratio (estimated from commit log pattern):** approximately 10-15% A-category over 17 days. The overwhelming majority of commits were C, D, and E. This is diagnostic of the cascade failure: no scope (Theme 1), no sequencing (Theme 2), no architecture boundary (Theme 3) meant all work was either configuration, refactoring, or polishing — with minimal forward progress toward locked DoD items.

---

### Sub-Skill 7.3: The Weekly Velocity Review

Every Sunday, 20 minutes:

```
git log --since="7 days ago" --oneline
```

For each commit, assign category A/B/C/D/E. Then write three sentences:

1. "This week's A-ratio was [X]%."
2. "The largest non-A sink was [specific pattern — e.g., '4 carousel refactor commits']."
3. "Next week, I will [specific behavioral rule] to raise the A-ratio."

Rule 3 must be specific and behavioral: "I will not open any configuration file before all current DoD items are locked." Not: "I will focus more." Focus is not a behavior. A specific action constraint is a behavior.

---

## Part 2: Integration — The Cascade and How the Themes Interlock

### The Cascade Failure Pattern

Individual theme failures are containable. Cascade failures — where one theme's failure enables the next — are how 17-day disasters happen.

**The sang-logium cascade, traced precisely:**

```
Theme 1 ABSENT (no scope contracts written)
  ↓ enables
Theme 2 ABSENT (no sequencing passes — went straight from skeleton to deep builds)
  ↓ enables
Theme 3 FAILURE (no scope boundary → carousel scope expanded without a fence)
  ↓ opens the door for
Theme 4 FAILURE (AI prompted to chase bugs inside the open carousel)
  ↓ uncontrolled, because
Theme 5 ABSENT (no DoD → no lock → carousel stayed open indefinitely)
  ↓ compounded by
Theme 6 FAILURE (all carousel bugs treated as CRITICAL regardless of DoD impact)
  ↓ visible in
Theme 7: commit log showed 10-15% A-ratio, but nobody was reading it as diagnostic data
```

The cascade moves upstream to downstream. This is why Theme 1 (Scope) comes first. A single upstream failure propagates through every downstream theme.

---

### Integration Principle 1: Themes 1 and 2 Must Both Fire Before Any Code

No component file is created until:
- Its scope contract is written (Theme 1)
- Its position in the page's pass sequence is established (Theme 2)
- Its DoD checklist is written (Theme 5)

These three artifacts — scope contract, sequence position, DoD checklist — are written together, for all 9 components, before Pass 1 begins. This is the "pre-flight checklist" for the sprint. It takes approximately 2 hours for a 9-component page. It saves days.

---

### Integration Principle 2: Architecture Decisions Are Anchored to Scope

You cannot make a correct component architecture decision (Theme 3) without the scope contract (Theme 1). The YAGNI test asks "does the current deliverable require this?" — the current deliverable is defined in the scope contract. Without the scope contract, the YAGNI test has no anchor. Every capability seems potentially necessary.

Practically: do not open a component file to write architecture until the scope contract for that component is complete and written.

---

### Integration Principle 3: DoD Makes Triage Decisions Automatic

When DoD is explicit and binary (Theme 5), triage decisions (Theme 6) become nearly automatic. The question "is this bug CRITICAL?" reduces to "does this bug prevent a current DoD item from passing?" If yes: CRITICAL. If no: DEFERRED. No judgment call. No weighing. No "but it's almost quick to fix."

If DoD is vague or absent, triage requires judgment calls on every bug. Judgment calls are slow and inconsistent. Explicit binary DoD items make triage a lookup operation.

---

### Integration Principle 4: The Commit Log Diagnoses All Six Upstream Themes

A commit log with a healthy A-ratio and consistent impact clauses is proof that all upstream themes are functioning. Specifically:

- High A-ratio → Theme 1 (scope) and Theme 2 (sequencing) working (effort directed at deliverables)
- Short B-sequences → Theme 6 (triage) working (bugs resolved quickly, not rabbit-holed)
- Low C/D/E proportion → Theme 3 (architecture) and Theme 5 (DoD) working (no over-engineering, no polish loops)
- Clear impact clauses → Theme 4 (prompting) working (AI output targeted, bugs diagnosed, not hacked)

The commit log is the diagnostic readout of the entire system. Learn to read it as data, not just as history.

---

## Part 3: Sang-Logium Application — Current State and Forward Path

### What the Live Site Shows Right Now

Based on the live site at sanglogium.com as of March 2026:

```
Hero                          → RENDERING, real data, appears complete
Shelf                         → RENDERING, structural wrapper
RedesignFeaturedAndSpotlight  → RENDERING, Featured has real data,
                                ProductSpotlight1 has LOREM IPSUM
ProductSpotlight2             → RENDERING, Dan Clark Audio, real data
ProductSpotlight3             → RENDERING, Focal Utopia, real data
IemsGallery                  → RENDERING, real product data scrolling
NewestRelease                 → NOT VISIBLE in fetch
Dacs                          → NOT VISIBLE in fetch
Accessories                   → NOT VISIBLE in fetch
```

**Immediate priorities, in sequencing order:**

1. Fix ProductSpotlight1 lorem ipsum → real Sanity data
2. Get NewestRelease rendering with any data (Pass 2)
3. Get Dacs rendering with any data (Pass 2)
4. Get Accessories rendering without crashing (Pass 2)
5. Build NewestRelease to DoD (Pass 3)
6. Build Dacs to DoD (Pass 3)
7. Build Accessories to DoD (Pass 3)
8. Full-page visual review and locked-component polish session

### The Correct Pre-Flight Before Touching Code Today

Write a scope contract and DoD checklist for each of these three components before opening any component file:
- NewestRelease
- Dacs
- Accessories

This takes 20-30 minutes. It is not optional. It is the mechanism that prevents the next 17-day failure.

---

## Appendix: The Seven-Theme Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│ THEME 1 — SCOPING                                              │
│ Question: What territory does this deliverable cover?          │
│ When: Before touching any code for any component               │
│ Output: Written scope contract with Forbidden Scope field      │
│ Failure sign: Working on something not in the contract         │
│ Mental model: A fenced territory with a gate                   │
├────────────────────────────────────────────────────────────────┤
│ THEME 2 — SEQUENCING                                           │
│ Question: In what order do I execute across components?        │
│ When: Before Pass 1 begins, and enforced throughout            │
│ Output: Three-pass model observed across all components        │
│ Failure sign: Any component in Pass 3 while another is Pass 1  │
│ Mental model: Director of logistics — which truck leaves first  │
├────────────────────────────────────────────────────────────────┤
│ THEME 3 — COMPONENT ARCHITECTURE                               │
│ Question: What is the minimum correct scope for this?          │
│ When: Before writing the component, after scope contract       │
│ Output: YAGNI test answers. Correct boundary decision.         │
│ Failure sign: Building for imagined future use cases           │
│ Mental model: Product component, not library component         │
├────────────────────────────────────────────────────────────────┤
│ THEME 4 — AI PROMPT ENGINEERING                                │
│ Question: Which layer? What is forbidden?                      │
│ When: Every AI interaction                                     │
│ Output: Single-layer prompts with CONTEXT/TARGET/LAYER/        │
│         CONSTRAINTS structure                                  │
│ Failure sign: AI output contains content from wrong layer      │
│ Mental model: AI as scoped contractor, developer as architect  │
├────────────────────────────────────────────────────────────────┤
│ THEME 5 — DEFINITION OF DONE                                   │
│ Question: Does this component pass all binary DoD items?       │
│ When: Written before build. Checked after build.               │
│ Output: Locked component or specific failing item named        │
│ Failure sign: Working on a component that already passes DoD   │
│ Mental model: Done is a lock, not a dial                       │
├────────────────────────────────────────────────────────────────┤
│ THEME 6 — DEBUG TRIAGE                                         │
│ Question: Does this block a current DoD item?                  │
│ When: Every bug encountered, before any debugging              │
│ Output: CRITICAL (fix now) or DEFERRED (log, close, continue)  │
│ Failure sign: Fixing bugs that don't block current DoD         │
│ Mental model: Triage nurse, not first-come-first-served queue  │
├────────────────────────────────────────────────────────────────┤
│ THEME 7 — VERSION CONTROL AS VELOCITY                          │
│ Question: What is my A-ratio? What does the log diagnose?      │
│ When: Every commit + weekly review                             │
│ Output: Commits with impact clauses. Weekly behavioral rule.   │
│ Failure sign: A-ratio below 50%. No impact clauses.            │
│ Mental model: Commit log as diagnostic readout, not just log   │
└────────────────────────────────────────────────────────────────┘
```

---

*Curriculum version 3.0 — sang-logium project — Next.js 15*
*Read completely before beginning deliberate practice exercises.*
*Knowledge ≠ Skill. This document gives knowledge. Exercises build skill.*
