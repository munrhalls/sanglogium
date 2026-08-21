# Actor: Filters & Sorting UI

Read [north-star-story.md](../../north-star-story.md) first — this actor is "Filters & Sorting" in that story.

## Its one job

1. When the user interacts (checkbox, slider, sort select, clear-all), write that choice into the URL.
2. Render itself as a pure, instant reflection of whatever the URL currently says — however it got that way (click, back/forward, typed, shared link).

Nothing else. Not fetching products, not streaming, not deciding what "loading" looks like on the grid, not debouncing, not cancelling requests.

## Files in this folder

- `style-guide-components-tree.md` — the exact visual spec (layout, sizes, styling per device size) this actor must match, salvaged from the old implementation because its look was already correct.
- `srp-tracer-bullets-building-guide.md` — the build order and the deletion-test discipline to follow while building this actor's components.

## The deletion test for this actor

Delete or freeze every file in this folder (plus `app/components/ui/Checkbox.tsx`, plus the one 240px grid line in `app/(store)/products/[...slug]/page.tsx`). Nothing in `../product-grid-streaming/` or the live product grid code should need to change or stop working. If it does, a responsibility has leaked across the boundary — stop and re-cut before continuing.

## What this actor must never do

- Fetch, cache, or stream product data.
- Import from the product grid's files, or from anything under `app/components/features/products/*`.
- Let its own responsiveness wait on anything the product grid or server is doing.
