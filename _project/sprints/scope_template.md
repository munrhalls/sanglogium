＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
GLOBAL DEFINITIONS (read before executing any sprint)
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

    LOCKDOWN definition:
        A phase or component is LOCKED when ALL of the following are true:
            (1) All checklist items in the phase are marked [x]
            (2) All automated tests for that phase are GREEN (no skipped)
            (3) One manual smoke test is logged inline as a comment with date + result
            (4) A human has signed off in writing (comment in this file or PR description)
        A LOCKED item cannot be re-opened without a written reason.

    VERIFICATION definition (for Truth Table chunks):
        A chunk is VERIFIED when ALL of the following are true:
            (1) AI generated truth table output for the chunk
            (2) Human reviewed each leaf node → product list pairing for 0 mix-ups
            (3) Product count per node matches inventory_counts.json baseline
            (4) Result logged inline: "verified [date] — N nodes, 0 mix-ups"

    REGRESSION GATE definition:
        Before any sprint that modifies existing data or catalogue structure:
            (1) Run existing test suite — all green, result logged
            (2) Snapshot current state (catalogue JSON, product counts) to /data/snapshots/[sprint-name]-pre.json
            (3) Only then begin execution steps
        This gate is a PRE-CONDITION, not a sprint step.

    DEPENDENCY GATE definition:
        A sprint marked [BLOCKED] cannot begin execution until the named blocker sprint
        has reached full LOCKDOWN. Blocked sprints may have prep/planning steps executed.




# <ComponentName>

## Deliverable State
...

## In Scope
...

## Out of Scope
...

## Forbidden Scope
...

## Architecture Decisions
- This component does NOT extract ProductCard into a shared component
- Grid layout handled with Tailwind responsive classes only (no JS)
- Data fetched via GROQ query directly in this component (no shared hook yet)
- If ProductCard is needed in another component later, extract at that point
```

The Architecture Decisions section is where you record your YAGNI answers. It is written before building and answers: what did I consciously decide NOT to abstract, and why. This is the record that prevents the future-you from reopening these decisions mid-build.

---

## The Complete Picture — How It All Connects
```
DESIGN_SYSTEM.md
  → defines alias vocabulary
  → pasted into AI prompts for Layer 3 (surface) work
  → referenced in scope contracts ("uses .text-display-1")
  → verified in DoD ("no primitive tokens used directly")

SCOPE/hero.md
  → defines territory (what Hero includes/excludes)
  → references design system aliases
  → contains Architecture Decisions section
  → pasted as CONTEXT into all AI prompts for Hero

SPRINT.todo
  → contains binary DoD items including design system compliance
  → ticked during browser verification after component is built
  → parent ticked = component locked

tailwind.config.ts + globals.css
  → the actual implementation of what DESIGN_SYSTEM.md describes
  → never changes during a component build sprint
  → stable soil