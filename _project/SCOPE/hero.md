# Hero
- IT IS CURRENTLY DONE AND LOCKED - DO NOT TOUCH HERO IN ANY WAY

## Deliverable State
Desktop: Full-viewport background image with hotspot-aware cropping,
headline, subheadline, and CTA button. Image served via Next.js Image
with Sanity CDN optimization.
Mobile: Separate mobile image asset, hotspot-aware, stacked text layout.

## In Scope
- Desktop hero image from Sanity with hotspot data consumed correctly
- Mobile hero image from Sanity, separate asset
- Next.js Image component configured to not conflict with Sanity CDN
- Headline, subheadline, CTA text from Sanity
- Responsive layout: full-width at all breakpoints, sm lg breakpoints styled
- Lightweight asset (optimized image weight)

## Out of Scope
- Video background
- Animated text entrance
- Any secondary CTA or badge element
- Carousel or multiple hero slides

## Forbidden Scope
- Do not add any animation or transition beyond CSS hover on CTA button
- Do not refactor the image component into a shared utility during this build


## Architecture Boundaries
- this component doesn't need to abstract anything into re-usability







```
That's it. No checkboxes. No layer breakdown. Clean prose boundaries.

---

**The DoD lives in SPRINT.todo, not in the scope file.**

This is the separation that matters most. SPRINT.todo is where you tick things off. It expands like this:
```
Homepage Sprint:
  [ ] Hero
    [ ] Desktop image renders with correct hotspot crop at 1280px
    [ ] Mobile image renders with correct hotspot crop at 375px
    [ ] No console errors on mount
    [ ] Headline and CTA visible and styled at both breakpoints
    [ ] Next/Image and Sanity CDN not conflicting (no double-optimization)
  [ ] Featured
    [ ] ...
```

In Todo+, `Alt+D` on the `[ ] Hero` parent line does not tick children. You tick each child item individually as you verify it in the browser. When all children are ticked, you tick the parent. That parent tick is the lock event.

---

**Does the scope mention layer-level details like "background image spans the full container"?**

No. That level of detail belongs in the DoD items, not the scope contract.

The scope contract says: "Desktop hero image from Sanity with hotspot data consumed correctly."

The DoD item says: "Desktop image renders with correct hotspot crop at 1280px — no white borders, no overflow."

The scope contract describes the territory in plain language. The DoD item describes the exact binary test. The difference is: scope = what, DoD = how you verify what.

---

**The layer sequence and the scope contract are completely separate things.**

The four layers (structure → layout → surface → interaction) are not written into the scope file at all. They are the sequence in which you prompt the AI and build. You do not document this per component. You simply follow the sequence every time: ask AI for structure first, verify in browser, then layout, verify, then surface, verify, then interaction.

The scope contract tells you what the finished component contains. The layer sequence tells you in what order you build it. They operate at different levels.

---

**Summary of what lives where:**
```
hero.md          → scope contract only. Prose. No checkboxes.
                   Copy-paste this as CONTEXT into AI prompts.

SPRINT.todo      → DoD checklist for every component.
                   Binary items. Ticked in browser verification.
                   This is what you check off with Alt+D.

Layer sequence   → In your head. Structure → layout → surface → interaction.
                   Not written down per component.

DAILY_LOG.md     → End-of-day three questions. Append-only.

BUGS.md          → Deferred bugs only. Append-only.

REFACTOR_BACKLOG → Deferred ideas only. Append-only.