# sang-logium-0bi.6 — [Headphones] Sidebar scroll bottom breathing room

Parent: sang-logium-0bi. Depends on: none — safe to run in parallel with anything else in this tree.

Beads goal (do not restate/duplicate elsewhere):
Scrolling the filter sidebar to its end must leave ample, coherent vertical space between the last filter option and the sidebar's own end, and between the sidebar's end and the screen's bottom edge.

MANDATORY before touching anything: read `docs/vertical-space-lg-touch.md` in full first — this repo has a documented, previously-regressed pattern (`lg-touch` breakpoint, no-inheritance gotcha, `h-full`-vs-explicit-height ownership) specific to exactly this kind of spacing change.

## Verified ground truth (exact current values, from direct code read this session, `app/components/features/filters/FilterSidebar.tsx`)
- The scrollable panel: `<div id={PANEL_SCROLL_ID} className="flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-6">` — `pb-6` is the only bottom breathing room after the last option today.
- Each section: `PanelSection`'s wrapper is `className="flex flex-col gap-6 border-b border-border-secondary p-6 last:border-b-0"` — the last section drops its bottom border but keeps full `p-6` padding.
- The outer container: `<aside className="hidden w-96 shrink-0 self-start sticky top-0 pt-6 max-h-screen lg-touch:flex lg-desktop:flex flex-col">` — `sticky top-0`, `max-h-screen`. The "sidebar end to screen bottom edge" half of the ask is about this element's relationship to the viewport, not just internal padding.

## Phase 1 — Fix internal breathing room (last option → sidebar end)
Scope: `PANEL_SCROLL_ID`'s className and/or the last `PanelSection`'s bottom spacing, in `app/components/features/filters/FilterSidebar.tsx` only.
Do not touch: the POC copy at `app/(test)/poc/filter-sort/headphones/components/FilterSidebar.tsx` — not the live component.
Steps:
1. Increase bottom spacing after the last panel section so it reads as deliberate, not cramped — this is a padding/spacing value change, not a structural change.
Acceptance criteria:
- [ ] Per CLAUDE.md's mandatory review gate: this className edit (touches padding — confirm it does not touch `h-*`/`min-h-`/`max-h-`/`aspect-*`; if it must, flag it explicitly for review before proceeding) is reviewed against the diff before this phase is marked done.
- [ ] Scrolled to the very end on `/products/headphones` at desktop width, there is clear, deliberate space below the last option before the sidebar's own bottom edge.
Done signal: screenshot scrolled to the end of the sidebar.

## Phase 2 — Fix sidebar-end to screen-bottom-edge spacing
Scope: same file, the `<aside>` element and/or its parent layout spacing in `page.tsx`'s flex row. Read `docs/vertical-space-lg-touch.md` before making this specific change — it documents exactly this class of `lg-touch` breakpoint issue.
Do not touch: the product grid column's own layout, mobile (non-`lg-touch`) behavior.
Acceptance criteria:
- [ ] At the `lg-touch` breakpoint, scrolled to the end, there is coherent visual space between the sidebar's bottom and the actual bottom edge of the viewport.
- [ ] No regression at mobile widths (sidebar is `hidden` below `lg-touch` per current code — confirm it stays that way).
Done signal: screenshot at `lg-touch` width, scrolled to the end, showing the sidebar's relationship to the viewport bottom.
