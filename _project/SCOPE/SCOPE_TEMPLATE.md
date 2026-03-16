# IemsGallery

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