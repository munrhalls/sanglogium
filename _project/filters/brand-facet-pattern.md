# High-count facet list pattern (Brand and similar)

Research deliverable for `sang-logium-jw8.1`. Consumed by `sang-logium-jw8.4`
— *[Filters] Brand list shows a short set with show-more*.

## Context from the current codebase

- `FilterSidebar.tsx` → `CheckboxFilterGroup` renders **every** option in a facet
  group, always, inside an expand/collapse section that defaults to open. No
  truncation, no scroll cap, no search box.
- `getFilterFacets.ts` already returns options **sorted by disjunctive product
  count desc, then label asc**, and already **appends selected values whose
  count is 0** so they stay toggle-off-able.
- Options arrive as a plain `FilterOption[]` prop (`value`, `label`, `count`).
  Anything below is a client-side view concern in `CheckboxFilterGroup` — no
  query or prop-flow change needed.

Sang-Logium is a hi-fi audio store: the brand facet is the only genuinely
high-count list (tens of brands), and cable/connector vocab facets are the
next longest. Everything here is written for that scale (~10–60 options), not
the 300-brand fashion-marketplace scale.

## Decisions

### 1. Initial visible option count — **8**

Show the first 8 options, then a **Show more (N)** control.

*Why:* Baymard's filtering research recommends truncating desktop filter lists
once they exceed roughly 4–8 values, and documents real implementations that
cap the initial view at 7 ([Baymard – Ecommerce Filter UI](https://baymard.com/learn/ecommerce-filter-ui),
[Baymard – search long filter lists](https://baymard.com/blog/allow-search-for-long-filter-options-lists)).
8 keeps the sidebar section to roughly one screen-third while showing enough
of the count-ranked head that most shoppers never expand. Lists of 8 or fewer
render in full with no control.

### 2. Progressive "show more" vs. fixed-height scroll box vs. modal — **progressive "show more", expanding inline**

Clicking **Show more** reveals the rest of the list in place; a **Show less**
control collapses it back to 8. No inner scrollbar, no dialog.

*Why:* Baymard found nested scroll boxes inside an already-scrolling sidebar
cause users to miss options and fight two scroll contexts; inline expansion
avoids that. A modal/overlay is the pattern for 100+ options (e.g. large
marketplaces) — overkill and a needless context switch at this catalogue's
scale. Zalando, Nike and John Lewis all use inline show-more for brand lists
of this size rather than a popup.

### 3. Search-within-facet threshold — **add a filter box at > 20 options**

When a group has more than 20 options, render a small text input above the
list that filters options by label substring as the user types. Below 20,
no box.

*Why:* Baymard's guidance and the implementations it cites add a search field
to a filter group once it passes ~15–20 values, because past that point
scan-and-scroll fails and typing "Sennheiser" is far faster
([Baymard – search long filter lists](https://baymard.com/blog/allow-search-for-long-filter-options-lists);
Lowe's brand filter is the named example). We take the top of that range (20)
because our labels are short, familiar brand names that scan quickly.

### 4. Option sort order — **hybrid: product count desc, then label asc** (unchanged)

Keep the existing `getFilterFacets.ts` sort. Do **not** switch to pure
alphabetical.

*Why:* Baymard and general faceted-search guidance both say the default order
should be popularity/relevance, not alphabetical, so the most useful options
sit in the visible head above the fold
([Baymard – Ecommerce Filter UI](https://baymard.com/learn/ecommerce-filter-ui);
[fact-finder – faceted search best practices](https://www.fact-finder.com/blog/faceted-search/)).
The label tie-break gives a stable, predictable order among equal-count
brands. When the search-within box is active (decision 3), the filtered
results stay in this same order — the box narrows, it does not re-sort.

### 5. Collapse-back behaviour — **Show less returns to the first 8; section collapse is separate and unchanged**

Two independent toggles:
- The existing section header `+`/`−` collapses the whole group (unchanged).
- **Show more / Show less** toggles only the truncation, within an expanded
  section, and always snaps back to the same first 8.

*Why:* Users expect a reversible disclosure; Baymard notes show-more controls
that cannot collapse leave the sidebar bloated after a stray click. Resetting
to exactly the first 8 (not "last scroll position") keeps the collapsed state
identical every time so the control is predictable.

### 6. A selected option that is currently hidden (below the fold of the 8, or filtered out by the search box) — **always pull it into the visible set**

Any checked option renders in the visible list regardless of truncation or
search-box text, shown at the top of the group above the count-ranked head,
visually grouped as "selected". The **Show more (N)** count counts only the
still-hidden unselected remainder.

*Why:* Baymard is explicit that applied filters must stay visible and
un-tickable at all times — a selected filter the user cannot see or remove is
a top-severity issue. `getFilterFacets.ts` already guarantees a selected
value is present in the options array (even at count 0); this decision just
says the client view must never truncate it away.

### 7. Mobile vs. desktop differences — **same rules, same component; only the container differs**

`FilterControls` is already shared verbatim between the desktop sidebar and
the mobile drawer, so all six decisions above apply identically on both. The
only mobile-specific notes:
- The search-within box (decision 3) matters *more* on mobile, where scrolling
  a long list in a bottom-sheet is worst — keep the same 20-option threshold,
  do not raise it.
- Initial count stays 8 on mobile too; the drawer scrolls the whole control
  stack, so a longer default would just push Price and other facets out of
  reach.
- No separate mobile modal for a single facet — the drawer already is the
  full-screen surface.

*Why:* Baymard draws the desktop-sidebar vs. mobile-full-screen-drawer
distinction at the *container* level, not the per-facet interaction level
([Baymard – Ecommerce Filter UI](https://baymard.com/learn/ecommerce-filter-ui)),
and this codebase already implements exactly that split. Divergent per-facet
behaviour between the two would be a maintenance trap for no user benefit.

## Summary table

| Question | Decision |
|---|---|
| Initial visible count | 8 (full list if ≤ 8) |
| Expansion mechanism | Inline progressive "Show more (N)" / "Show less" |
| Search-within-facet box | Only when > 20 options |
| Sort order | Product count desc, then label asc (keep current) |
| Collapse-back | "Show less" → first 8; section `+`/`−` independent |
| Hidden-but-selected option | Always hoisted into visible set, marked selected |
| Mobile vs desktop | Identical behaviour; container differs only |

## Buildability check

All decisions live inside `CheckboxFilterGroup` in `FilterSidebar.tsx` as
`useState` + `slice`/`filter` on the existing `options` prop. No change to
`getFilterFacets.ts`, `facetMap`, the URL param flow, or the RSC composition.

## Sources

- [Baymard – What Is an Ecommerce Filter? UI Best Practices](https://baymard.com/learn/ecommerce-filter-ui)
- [Baymard – Always Allow Users to Search Long Lists of Filter Options](https://baymard.com/blog/allow-search-for-long-filter-options-lists)
- [Baymard – Display applied filters in an overview / keep applied filters visible](https://baymard.com/blog/have-filters-for-list-item-info)
- [fact-finder – Faceted search: 9 best practices](https://www.fact-finder.com/blog/faceted-search/)
