# sang-logium-0bi.4 — [Headphones] Quiet the brand search field outline

Parent: sang-logium-0bi. Depends on: none — safe to run in parallel with anything else in this tree.

Beads goal (do not restate/duplicate elsewhere):
The brand search field's outline should read as quiet/gentle, consistent with the design system and the rest of the filter sidebar.

## Verified ground truth (from direct code read this session)
- `FilterSidebar.tsx` line 147: `brandLabels={facet.id === 'brand' ? brandLabels : undefined}` passed into `CheckboxGroup` — the brand search input lives inside `CheckboxGroup` in `FilterControls.tsx` (not yet read directly — locate it there).
- The sidebar's existing quiet-border vocabulary is visible directly in `FilterSidebar.tsx`: `border-border-secondary` (used on the sidebar's own outer border and section dividers) and `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500` (used on the "Clear all" button) — these are the existing design-system tokens for "quiet default, visible-but-not-loud focus," not a new palette to invent.

## Phase 1 — Locate and adjust (single phase, low risk, visual only)
Scope: the brand search `<input>` inside `CheckboxGroup` in `FilterControls.tsx`. No logic changes — styling only.
Steps:
1. Find the search input's current border/outline/focus classNames.
2. Bring it in line with the tokens already used elsewhere in this same sidebar (`border-border-secondary` for the resting state, the same `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500` pattern for focus) rather than introducing new colors or thicker borders.
Do not touch: the search input's filtering behavior/logic, any other facet's styling, any height/sizing className (this is border/outline only — if the change touches `h-*`/`min-h-`/`max-h-`/`aspect-*`, stop and flag it, since that triggers CLAUDE.md's mandatory review gate and is out of scope here).
Acceptance criteria:
- [ ] Resting-state border reads visually consistent with the sidebar's other quiet borders, not louder.
- [ ] Focus state remains clearly visible (accessibility — do not remove the focus indicator, only quiet its resting-state loudness).
Done signal: before/after screenshot of the brand search field at rest and while focused.
