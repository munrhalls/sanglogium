# Learning How to Design in Practice — Constraint-Based Design Thinking

**Date:** 2026-04-01
**Context:** Product Listing Page grid struggles — from iterative experimentation to systematic approach
**Status:** TO LEARN ASAP — Apply on next design task

---

## The Core Shift: Taste → Constraints

| Amateur | Pro |
|---------|-----|
| "Does this look good?" | "Does this match the system?" |
| Tweak until it feels right | Apply the rule, verify, ship |
| Eyeball spacing | Use the 8px grid |
| "I like this blue" | "Use `accent-500` because that's the brand" |
| 20 iterations, uncertain | 1-2 iterations, confident |

**The secret:** Pros don't have better taste. They have **better constraints**.

---

## Keywords — Mental Model Vocabulary

### The Mindset Shift
- **Reference Standard** — Don't design into the void; match a canonical implementation
- **System Contract** — Config tokens aren't suggestions, they're hard rules
- **One-Thing-Changed Rule** — Change exactly one variable, compare, decide
- **Squint Test** — Blur your eyes; hierarchy should read without details

### The 3 Decisions
- **Items Per Row** — Column count (derived from available width, not preference)
- **Breathing Room Budget** — Gap between items (system token, usually 24-32px)
- **Internal Padding** — Space inside containers (establishes visual weight)

### Spatial Reasoning
- **Container Context** — Grid lives inside something; account for siblings (sidebar, gutters)
- **Available Real Estate** — Actual pixel width the grid has to work with
- **Card Width Floor** — ~280px minimum for comfortable content (image + text + CTA)

### Verification Math
- **Arithmetic Check** — `Available Width ÷ Columns - Gutters = Card Width`
- **Aspect Ratio Math** — `Width × Ratio = Height` (for image containers)
- **Breakpoint Shadowing** — Custom breakpoints overriding default `lg:`

### Decision Hierarchy
- **System Constraint** — `accent-500` for CTAs because brand
- **Mathematical Constraint** — 3 columns because 4 is below card width floor
- **Best Practice Constraint** — Baymard/Nielsen patterns (verified, not trendy)
- **Hierarchy Constraint** — Information order: Image → Name → Price/CTA

### The Anti-Patterns (What NOT to Do)
- **Iterative Experimentation** — Guessing with extra steps
- **Taste-Based Decisions** — "Does this look good?" (subjective, endless)
- **Parallel Changes** — Changing 5 things at once (can't identify what worked)
- **Token Invention** — Using `blue-600` when `accent-500` exists in system

### The Pro Replacement
- **Constraint-Based Decisions** — "Does this match the system and math?"
- **Reference Matching** — Compare to homepage/Baymard, not "feel"
- **Single Variable Testing** — Change one thing, verify, proceed
- **Token-First** — Check `tailwind.config.ts` before choosing any value

### Quality Gates
- **Math Verification** — 30-second calculation before writing code
- **System Check** — Is this color/spacing in the design system?
- **Squint Hierarchy** — Does layout read when blurred?
- **Breakpoint Inspection** — Actually check at exact viewport widths

### Reference Sources (External Constraints)
- **Baymard Institute** — E-commerce UX research (not "inspiration")
- **Nielsen Norman Group** — Usability heuristics
- **Homepage Canonical** — `Featured.tsx` as your ground truth
- **Design System Config** — `tailwind.config.ts` as single source of truth

### The Goal State
- **Correct Application** — Following constraints, not "good taste"
- **Objective Verification** — Pass/fail criteria, not "I like it"
- **System Coherence** — All parts matching the same contract
- **Professional Standard** — Baymard-grade, not "looks good to me"

---

## The 5-Step "No Guess" Design Protocol

### Step 1: Find Your Reference (60 seconds)
Don't design into the void. Find **one** reference that already exists:

- **Homepage `FeaturedCard`** — your canonical product card
- **Baymard Institute** — e-commerce best practices (verified patterns)
- **Vercel, Linear, Stripe** — if doing SaaS

**Rule:** You're not "being inspired." You're **matching a standard**.

### Step 2: Identify the 3 Decisions
Any layout has only 3 decisions:
1. **How many items per row?** (grid columns)
2. **How much space between them?** (gap)
3. **How much padding inside?** (internal spacing)

Write these down. Don't touch code yet.

Example from PLP audit:
- Columns: 3 (not 4 — sidebar reduces available width)
- Gap: 32px (`gap-8`)
- Padding: 24px (`p-6`) inside image area

### Step 3: Apply the System Tokens
Your `tailwind.config.ts` is not a suggestion. It's a **contract**.

| Decision | System Token | Why |
|----------|--------------|-----|
| Card background | `surface-card` | Defined in config |
| Border | `border-secondary` | Consistent across all cards |
| Hover shadow | `shadow-cardDark` | Matches dark theme |
| Border radius | `rounded-lg` (4px) | System radius |
| Typography | `type-body`, `type-price` | Pre-defined hierarchy |

**If it's not in the system, you don't use it.** This eliminates 90% of "what color should this be?" decisions.

### Step 4: The Math Check (30 seconds)
Before writing code, verify with arithmetic:

```
Screen: 1280px
Sidebar: 240px
Gap (sidebar to content): 32px
Available: 1008px

3 columns: 1008 ÷ 3 = 336px per card
Gap between cards: 32px × 2 gaps = 64px
Actual card width: ~310px

Is 310px enough for:
- Image (4:3 aspect) = 310 × 0.75 = 232px tall image ✓
- Brand badge ✓
- Product name (2 lines) ✓
- Price + button row ✓

Verdict: 3 columns works. 4 columns would be 250px — too tight.
```

This takes 30 seconds. It prevents 20 iterations of "maybe 4 columns?"

### Step 5: The Squint Test
Before declaring "done," blur your eyes and look at the layout:

- **Do you see the hierarchy?** (Image → Name → Price/CTA)
- **Do groups touch that shouldn't?** (padding issues)
- **Is anything floating without context?** (alignment issues)

**Don't fixate on details.** If the squint test fails, the structure is wrong — not the colors.

---

## Homework: Next Time You're Stuck

1. **Screenshot your reference** — homepage card, Baymard example, whatever
2. **Write down the 3 decisions** — columns, gap, padding
3. **Do the math** — calculate actual pixel values
4. **Check the system** — are you using tokens or inventing colors?
5. **Squint test** — does the hierarchy read when blurred?

If you do this, you'll go from "does this look good?" (subjective, endless) to "does this match the system and math?" (objective, fast).

**The goal isn't "good taste." It's "correct application of constraints."**
