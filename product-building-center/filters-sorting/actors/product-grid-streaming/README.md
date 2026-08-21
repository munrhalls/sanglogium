# Actor: Product Grid + Server (Streaming)

Read [north-star-story.md](../../north-star-story.md) first — this actor is "The Product Grid" (working with "The Server") in that story.

## Its one job

1. Read the URL (never anything from the Filters & Sorting actor directly).
2. Ask the Server for results matching that URL state.
3. Display the first batch immediately and stream the rest in progressively — a conversation, not a wall.
4. Under rapid-fire URL changes, make sure only the request matching the *latest* URL ever lands on screen — debounce and/or cancel stale requests so the server never does wasted work on an outdated state.

Nothing else. Not rendering checkboxes, sliders, or the sort dropdown. Not writing to the URL.

## One exception to the "lean glance" rule

Everything else in this feature is markup/visual and safe to verify with a few-second human glance. The debounce + stale-request-cancellation logic in job #4 above is not — it's a real race condition (rapid URL changes racing in-flight fetches), and a glance at the page won't reveal a fetch that landed late and overwrote a newer one. When this actor gets built, that piece specifically needs an actual check (e.g. deliberately fire rapid URL changes and confirm only the latest one's results ever render) rather than the standard visual-only checkpoint used elsewhere in this feature.

## Files in this folder

Empty for now — this actor hasn't been built yet. When work starts here, its build-order guide and any implementation notes belong in this folder, following the same one-file-per-final-location discipline used in `../filters-and-sorting-ui/srp-tracer-bullets-building-guide.md`.

## The deletion test for this actor

Give this actor any URL directly (as if typed or pasted, with no Filters & Sorting UI present at all) and it must stream correct, matching results all the same. If it ever needs something from the Filters & Sorting actor beyond the URL itself, a responsibility has leaked across the boundary — stop and re-cut before continuing.

## What this actor must never do

- Import from `../filters-and-sorting-ui/*`.
- Assume anything about how the URL got its current value.
- Block or slow down in a way that would ever be visible in the Filters & Sorting UI's own responsiveness — that UI's speed must never depend on this actor.
