# Naming convention — prompt files in this folder

## File names

Pattern: `<actor-shorthand>-<what-it-actually-is>.md`, all lowercase kebab-case.

- No bullet numbers in the filename. Numbers drift — bullets get re-cut, split, or reordered — but what a phase of work actually *is* doesn't change. Order lives inside the file (as section headers), not in the filename.
- `<actor-shorthand>` ties the file to one of the actors in `../../north-star-story.md` (e.g. `filters-ui`, `product-grid`), so files from different actors sort together and stay disambiguated once the folder holds more than one actor's prompts.
- `<what-it-actually-is>` should name the *nature* of the work, not just its topic — specifically call out when a phase is static/visual-only vs. when it wires in real functionality (data fetching, server queries, debouncing, cancellation). That distinction matters more here than which component it touches, because it tells a reader what kind of review the phase needs (a five-second glance vs. an actual functional check).

Example: `filters-ui-visual-only.md` — the filters actor, and "visual-only" flags that every bullet inside is hardcoded/static UI with at most trivial local toggle state (e.g. a checkbox's on/off), no real data wiring, no client state library, no server calls. Contrast with a later file like `product-grid-wiring.md`, whose name would need to signal that it *does* introduce real functionality (query params reaching GROQ, debounce/cancellation logic) and therefore needs more than a glance to verify.

## Section headers inside a file

Pattern: `<what-it-builds> — bullet <n>`, plain English, no phase-number-as-the-headline.

- `<what-it-builds>` is the short semantic name for that one bullet (e.g. `filters-sidebar-shell`, `filters-checkbox-group`, `filters-sliders`, `filters-sort-bar`) — same instinct as the file-naming rule: name the thing, not its position.
- `— bullet <n>` is kept as a trailing reference back to the bullet's position in the actor's `srp-tracer-bullets-building-guide.md` file-to-bullet map, so a reader can cross-reference the build-order doc without the number owning the headline.
- An orientation/comprehension-check phase (no code, just reading + confirming understanding) keeps a plain `Phase 0 — Orientation` header — it isn't a bullet, so it doesn't get a semantic bullet-name.

## Why this exists

Early prompt files were named `bullets_1-4.md`, `bullets_5-7.md` — numeric ranges that say nothing about what's inside until opened, and that break as soon as bullets get added, split, or reordered across actors. Renaming to semantic, actor-scoped names keeps the `/prompts` folder self-describing at a glance, and keeps the "static vs. real functionality" distinction — which drives how a phase gets verified — visible from the filename alone.
