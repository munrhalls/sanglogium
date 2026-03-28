# Theme 11: AI-Assisted Development

## SangLogium Context
AI tools are teammates with clear roles. Strategic AI (Claude browser) diagnoses and plans. Execution AI (Windsurf IDE) implements. Generation AI (Gemini) produces volume output. You verify. This is the workflow that makes SangLogium completion possible.

**Critical Files:**
- `_contexts/deliberate-practice/learning/AI-assisted web development skill.md/` — Workflow documentation
- `_project/COMMANDS/` — AI command protocols
- `.cursor/mcp-server.js` — Cursor integration
- `.windsurf/workflows/` — Windsurf workflows

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at documentation. Binary pass/fail.

#### AI Roles
- [ ] What is Strategic AI and when do you use it?
- [ ] What is Execution AI and when do you use it?
- [ ] What is Generation AI and when do you use it?
- [ ] What is Verification AI and who does it?
- [ ] What is the most expensive mistake in AI workflow?

#### Phase Assessment
- [ ] What are the three phases of component work?
- [ ] How do you identify which phase a component is in?
- [ ] What workflow applies to Phase 1? Phase 2? Phase 3?
- [ ] What is the one-sentence prompt test?
- [ ] Why is Phase 1 workflow wrong for Phase 3?

#### Constraint Templates
- [ ] What are the five elements of a prompt?
- [ ] What goes in CONTEXT?
- [ ] What makes a good TARGET?
- [ ] Why are CONSTRAINTS critical?
- [ ] What goes in FORBIDDEN?

#### Workflow Integration
- [ ] What is context priming?
- [ ] What is the 60-minute session rule?
- [ ] What is the micro loop?
- [ ] What is the regression log for?
- [ ] When do you use the /implement command?

---

## Layer 1: Comprehensive Curriculum

### Module 1: The Four AI Roles

```
ROLE 1 — STRATEGIC AI (Claude in browser)
  What: Diagnosis, architecture, planning, debugging
  When: Stuck, confused, making multi-component decisions
  When NOT: Writing code changes directly
  Cost: Free tier

ROLE 2 — EXECUTION AI (Windsurf / Cascade in IDE)
  What: Implementing specific, scoped file changes
  When: Precise TARGET and CONSTRAINTS defined
  When NOT: When you don't know what the change should be
  Cost: Free tier

ROLE 3 — GENERATION AI (Gemini Free / Claude Free)
  What: Volume output from templates (DoD, sprints)
  When: Need to generate many items from a template
  When NOT: Without constraint template
  Cost: Free

ROLE 4 — VERIFICATION AI (You / Automated tests)
  What: Checking output against binary criteria
  When: After every execution AI output
  Who: YOU, in browser, against DoD checklist
  Cost: Your attention
```

**Role Confusion Costs:**
- Asking Execution AI to decide → Wrong implementation
- Asking Strategic AI to write code → Analysis text in code
- Not verifying → Regressions, bugs, wasted time

---

### Module 2: Phase Assessment

**The Three Phases:**

**PHASE 1 — Does Not Exist or Structurally Broken**
```
Signal: Blank render, crashes, wrong DOM structure
Work: Structure → Layout → Surface → Interaction
Time: 60-90 minutes
Workflow: Full scope contract + DoD sprint + prompt list
```

**PHASE 2 — Exists But Has Specific Layer Problem**
```
Signal: Renders but layout wrong, or data missing, or styling broken
Work: Diagnose which layer, fix that layer only
Time: 20-40 minutes
Workflow: Diagnosis prompt → targeted fix prompt
```

**PHASE 3 — Almost Right, Needs 2-5 Adjustments**
```
Signal: Renders correctly, data shows, mostly looks right
Work: List 2-5 specific things, fix each
Time: 15-30 minutes
Workflow: Flat list → one prompt per item → verify each
```

**Phase Assessment (60 seconds):**
```
Look at component in browser:
1. Does it render? (No = Phase 1)
2. Does data show? (No = Phase 1 or 2)
3. Is layout correct? (No = Phase 2)

Three yes answers = Phase 3
Any no = Phase 1 or 2
```

**Most Expensive Mistake:**
Applying Phase 1 workflow to Phase 3.
This costs hours on work that should take 15 minutes.

---

### Module 3: The Prompt Anatomy

**Five Mandatory Elements:**

```
1. CONTEXT
   What: Current state of file and component
   Why: Without this, AI fills gaps with training data defaults
   Format: "This is [component] in [file]. It currently [does X]."
   Length: 2-4 sentences maximum

2. TARGET
   What: Exactly one specific output
   Why: Multiple targets = multiple changes = only one verifiable
   Format: "Change [specific thing] to [specific thing]."
   Test: Can you verify with one browser look? Yes = good.

3. LAYER
   What: Which layer this addresses
   Why: Prevents mixing layers in one output
   Options: Structure / Layout / Surface / Interaction
   Rule: One prompt = one layer only

4. CONSTRAINTS
   What: What AI must not do
   Why: AI fills silence with defaults; defaults cause regressions
   Source: Master template, minus inapplicable lines
   Rule: Over-constrain is safe

5. FORBIDDEN
   What: Hard rules stated as explicit negatives
   Why: Constraints describe space; forbidden describes walls
   Format: "DO NOT [specific action]"
   Minimum: No arbitrary values, no comments, no touching unlisted files
```

**One-Sentence Prompt Test:**
"Can I verify this output with one look at the browser?"

Yes = specific enough
No = too vague, rewrite

---

### Module 4: Constraint Template

**Master Constraint Template:**
```markdown
CONTEXT:
[Stack: Next.js 15, React, Tailwind 3, TypeScript, Sanity CMS]
[File: exact file path]
[Current state: what component currently does/looks like]

TARGET:
[One specific thing. One layer. One file.]

LAYER: [Structure / Layout / Surface / Interaction — pick ONE]

CONSTRAINTS:
- Use only Tailwind classes that exist in tailwind.config.ts
- Do not use arbitrary values like w-[37px] or text-[14px]
- Do not use inline styles
- Do not change any className not explicitly listed in TARGET
- Do not change JSX element nesting or structure
- Do not add or remove any JSX elements
- Do not touch any file not named in TARGET
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

**Regression Log:**
```markdown
## Regression Log
[Date] — [Component] — [What regressed] — [Missing constraint]

Example:
2026-03-20 — Featured — Raw Tailwind primitives used instead of aliases
  Missing constraint: "Use only design system aliases from tailwind.config.ts"
  Added to template: YES
```

After 10-15 regressions logged and added to template:
New regressions become rare.
This is deliberate practice applied to prompt engineering.

---

### Module 5: The Complete Workflow

**Morning (10 minutes before opening files):**
```
1. Phase assessment for every component to work on
   — Look in browser, apply three-question test
   — Write: component name, phase, 2-3 specific things wrong

2. Workflow assignment per component:
   — Phase 1: full workflow (scope → DoD → prompts)
   — Phase 2: diagnosis prompt → targeted prompt
   — Phase 3: flat list → one prompt per item

3. Time estimate:
   — Phase 1: 60-90 min
   — Phase 2: 20-40 min
   — Phase 3: 15-30 min per component
   — Total: Does this fit in today?
   — If not: scope cut (which Phase 3 items optional)
```

**During Session:**
```
1. Context prime Windsurf at session start (30 seconds)
2. Set 60-minute timer
3. One prompt → verify in browser → tick or diagnose → next prompt
4. When timer fires: what new rendered output exists?
5. If nothing new: stop. Diagnose with Claude. Restart.
```

**Per Prompt:**
```
1. Is this prompt targeting one layer only?
2. Does it have the constraint template applied?
3. Can I verify the output with one browser look?
If all three yes: send it.
If any no: rewrite it.
```

**End of Day (5 minutes):**
```
Three questions:
1. What components moved from incomplete to locked today?
2. What was the phase of each? Did I apply the right workflow?
3. What regressions occurred? Which constraint was missing?
   Add it to the template.
```

---

## Layer 2: Integration Examination

### Integration Challenge 1: Phase Assessment Practice

**Scenario:** Assess these components and assign correct workflow

**Component A:** Homepage Hero
- Renders correctly
- Data shows
- Layout correct
- But: animation timing feels off, CTA button color slightly wrong

**Component B:** Category Filter Sidebar
- Renders
- But: checkboxes don't toggle
- Layout: sidebar width jumps when filters change
- Data: filter counts show as "undefined"

**Component C:** Checkout Payment Form
- Blank white space where form should be
- Console shows "hydration mismatch" error
- Page crashes on refresh

**Your Task:**
1. Identify phase for each (1, 2, or 3)
2. Write the specific 2-3 things wrong for each
3. Assign correct workflow
4. Estimate time for each

---

### Integration Challenge 2: Constraint Template Application

**Scenario:** Write prompts for these fixes

**Fix 1:** Change button color from blue to brand-600
- Target file: `components/ui/Button.tsx`
- Component currently uses `bg-blue-600`

**Fix 2:** Add padding to ProductCard component
- Target file: `components/features/ProductCard.tsx`
- Currently has no padding

**Fix 3:** Fix layout gap in grid
- Target file: `components/features/ProductGrid.tsx`
- Currently `gap-2`, should be `gap-4`

**Requirements:**
- Each prompt must use constraint template
- Each must pass the one-sentence test
- Each must target one layer only

---

## Layer 3: Systems Examination

### Systems Challenge: AI Workflow for Team

**Scenario:** You're documenting AI workflow for a new developer joining SangLogium

**They need to understand:**
1. When to ask Claude vs Windsurf vs Gemini
2. How to assess what phase a component is in
3. What the constraint template prevents
4. Why verification is mandatory
5. How to handle when AI output is wrong

**Create:**
1. One-page quick reference guide
2. Decision flowchart (which AI for what)
3. Phase assessment checklist
4. Common mistake examples and fixes

---

## Stress Test Scenarios

### Scenario 1: Prompt Failure Analysis

**Given Prompt:**
```markdown
Fix the Featured component. It's not looking right.
The text should be bigger and the image should be on the right.
Also fix the spacing and make the button more prominent.
```

**Why This Fails:**
1. No CONTEXT — AI doesn't know current state
2. Multiple TARGETS — size, position, spacing, button (4 changes)
3. No LAYER specified
4. No CONSTRAINTS
5. Vague targets ("bigger", "more prominent")

**Fix:**
```markdown
CONTEXT:
[Stack: Next.js 15, Tailwind 3]
[File: app/components/features/homepage/Featured.tsx]
[Current state: Hero section with text on left, image on right. 
 Text uses type-section-hed, image uses fill layout.]

TARGET:
Increase text size from type-section-hed to type-hero-headline.

LAYER: Surface

CONSTRAINTS:
- Use only design system aliases from tailwind.config.ts
- Do not change image position
- Do not modify button styling
- Do not add or remove any elements

FORBIDDEN:
- DO NOT use arbitrary text sizes
- DO NOT add comments
```

---

### Scenario 2: Regression Cascade

**Timeline:**
1. Prompt: "Fix ProductCard padding"
2. AI changes padding but also:
   - Changes font size (not requested)
   - Adds a border (not requested)
   - Removes hover effect (breaks existing)
3. You don't verify carefully
4. Next prompt: "Fix hover on ProductCard"
5. AI tries to fix but based on changed state
6. Now card is completely wrong
7. Hours spent fixing what should have been one change

**Root Cause:**
- Missing constraint: "Do not change any className not explicitly listed"
- Missing verification: Didn't check that ONLY padding changed

**Prevention:**
- Stricter constraints
- Verify one thing at a time
- Use git to see what actually changed

---

## Quick Reference: AI Workflow

| Situation | Use | Don't Use |
|-----------|-----|-----------|
| Stuck, don't know approach | Claude (Strategic) | Windsurf |
| Know exactly what to change | Windsurf (Execution) | Claude |
| Generate many similar items | Gemini (Generation) | Claude/Windsurf |
| Verify output | You (Verification) | Don't skip |
| 3+ file changes needed | Claude then Windsurf | Just Windsurf |
| One file, one change | Windsurf | Claude |

---

## Completion Checklist

- [ ] Can identify which AI role to use for each situation
- [ ] Can assess component phase correctly
- [ ] Can write prompts passing the one-sentence test
- [ ] Can apply constraint template correctly
- [ ] Can verify AI output thoroughly
- [ ] Can identify and log regressions
- [ ] Can explain the full daily workflow

---

*Next: Theme 12 — Systems Integration Challenges*
