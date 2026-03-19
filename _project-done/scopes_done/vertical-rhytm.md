Replace the entire content of
_project/SCOPE/vertical-rhythm.md with exactly this:

# Vertical Rhythm — Homepage

## Goal
Achieve consistent, coherent vertical rhythm across the full
homepage. Nothing else. No component restructuring. No logic
changes. No JSX changes beyond removing specific spacing
classes that cause rhythm conflicts.

## The Problem
Shelf applies py-20 to every section. Child components
also apply their own top-level padding, margin, and py-20
internally. This creates doubled spacing between sections.
The fix is removing conflicting outer spacing from child
components only — not restructuring anything.

## Deliverable State
Every homepage section is separated by consistent vertical
spacing. No doubled padding. No floating borders. Internal
component spacing is visually subordinate to section spacing.
Visual appearance is identical to current except for corrected
section gaps.

## In Scope
- Remove duplicate outer py-, my-, mt-, mb- classes from the
  outermost element of each child component where they conflict
  with Shelf's py-20
- Remove border-t from outermost elements if the border floats
  inside Shelf padding (move border to Shelf wrapper if needed)
- Adjust Accessories internal space-y value if it visually
  equals the section gap (making items look like separate sections)

## Out of Scope
- Any JSX structural changes
- Removing or replacing wrapper elements
- Adding props to Shelf
- Changing component logic
- Changing any styling other than the specific spacing fixes above
- Any component not part of the homepage vertical rhythm

## Forbidden Scope
- DO NOT remove or replace any wrapper elements
- DO NOT change any component's internal structure
- DO NOT touch Hero
- DO NOT touch any non-spacing className
- DO NOT change any TypeScript, data fetching, or logic

CONSTRAINTS:
- Replace the entire file with exactly this content
- Do not touch any other file