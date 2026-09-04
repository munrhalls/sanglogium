# Filters & Sorting — Decomposition Draft (NOT beads issues yet)

Purpose: raw list of end-user problems with filters/sorting across the storefront.
We collect them here first, then regroup / merge / split into lean beads epics + issues.
Every entry is stated as end-user experience, checkable live on localhost:3000.
No file paths, no implementation. Draft only.

### Guiding principle (applies to all price-filter entries)
Filters operate on the **full inventory in the CMS** for the current query context
(category + any other active filters), never on the set of products currently loaded
in the viewport. The user has no idea what's "loaded" — when they narrow price they
expect to be looking at the cheapest / in-range products **that exist in inventory**,
not a shrunk slice of what happened to be on screen. Bounds and results must always be
the true, accurate representation from the CMS for that context.

---

## Raw problem list

### P1 — One $38k outlier product distorts the price filter
**Location:** product listing price filter (slider + min/max).
**What the user sees today:** the price range stretches to ~$38,000 because a single
product costs that much. The slider then spans $0–$38,000, so the entire realistic
buying range (where the vast majority of products live) is squashed into a tiny sliver
at the low end. Dragging the slider is imprecise and the scale reads as "unclear."
**Why it's a problem:** the filter's job is to help a normal shopper narrow price. A
lone outlier makes the common range unusable. If the top product were ~$8,000 instead,
the slider would feel fine — so the issue is outlier distortion, not the max value itself.
**Professional expectation:** the slider scale reflects where products actually are, and
extreme outliers don't wreck resolution for the 99% case (the user can still reach the
outlier somehow).
**Open questions for decomposition:**
- Is this its own concern, or part of a broader "price filter quality" epic?
- Non-linear scale vs. clamped default range vs. percentile-based bounds vs. "over $X" bucket — decide at decomposition time, not now.

### P2 — Price range doesn't adapt to the current category
**Location:** product listing price filter, when viewing a specific category (e.g. `/headphones`).
**What the user sees today:** the price slider bounds stay at the global catalogue max
even though the category being viewed contains nothing near that price. In `/headphones`
the most expensive product is far below the global ceiling, but the slider still runs up
to the global max (including the $38k outlier's influence).
**Why it's a problem:** the bounds should describe the true CMS inventory for the
current category. A range full of empty space is misleading and imprecise to drag.
**Professional expectation:** entering a category re-scales the price filter to that
category's real CMS min/max; leaving it restores the broader range. Results and bounds
both come from the CMS for that context (see Guiding principle above).
**Open questions for decomposition:**
- Interaction with an already-applied price filter when the category changes (clamp? reset?).

Note: P1 and P2 are NOT "viewport" bugs and must not be framed that way. Both are about
the price filter faithfully reflecting CMS inventory for the current context — P1 is the
outlier-distortion aspect, P2 is the category-context aspect.

### P3 — "Price" heading shown twice in the sidebar
**Location:** desktop filter sidebar, price filter section.
**What the user sees today:** the word "Price" (the section title) appears twice.
**Why it's a problem:** looks unfinished / broken; minor but visible polish bug.
**Professional expectation:** one clear "Price" heading for the section.
**Note:** small, self-contained visual bug — likely a quick fix, good candidate to
bundle with other small sidebar polish items rather than its own epic.

### P4-PRE — Research: e-commerce professional standards for high-count brand facets
**Type:** prerequisite research issue. **Blocks:** P4.
**Goal:** before designing P4, produce a short written reference on how professional
e-commerce sites handle a filter facet with many, many options (brands especially):
- initial visible count and why
- "show more / +N more" progressive expand vs. fixed-height scroll box vs. modal
- threshold at which a search-within-facet box is added
- brand/option sort order (alphabetical vs. by product count vs. hybrid)
- collapse-back behaviour, and what happens to selected-but-hidden options
- mobile vs. desktop differences
**Output:** a findings doc in `_project/filters/` that P4's acceptance tests can be
written against. No code.
**Current status:** not started.

---

### P4 — Long brand filter list dominates the whole sidebar
**Prerequisite:** P4-PRE (research) must land first.
**Location:** filter sidebar brand section; worst on `/products` (no category narrowing),
where the brand list is a huge uninterrupted stream of options.
**What the user sees today:** the brand filter can expand to a very long list that takes
over the entire sidebar, pushing every other filter far down / off screen.
**Why it's a problem:** all brands should stay accessible and complete, but an unbounded
list wrecks the sidebar's usability and hides the other filters.
**Professional expectation (to be confirmed against e-commerce standards):** show a
small initial set (e.g. ~7 brands), with a "show more" / "+N more" toggle at the bottom
that reveals the next chunk on each click (progressive expansion), and a collapse back.
Possibly also a brand search/filter-within-filter box when the count is very high.
**Explicitly needs research:** confirm the actual best-practice pattern for high-count
brand facets (initial count, "show more" vs. scroll-within, search box threshold,
sort order of brands — alphabetical vs. by product count). Don't lock the design now.
**Open questions for decomposition:**
- Is this one "brand facet UX" issue, or does the same overflow pattern apply to other
  multi-value facets (so it becomes a generic "long facet list" concern)?

### P5 — Every category page shows the full union of all facet groups
Observed on `/products/headphones`, `/products/accessories`, `/products/audio-electronics`.
Each page renders ~15 facet groups regardless of relevance:
- audio-electronics page still shows Wearing style, Back design, Driver type,
  Connectivity, Connector/plug, Microphone, Noise cancelling, Requires amplifier — all
  options "0 products".
- accessories page shows Device type, Amplification, Inputs, Outputs + all headphone
  facets — all "0 products".
- headphones page shows Device type, Form factor, Amplification, Inputs, Outputs,
  Accessory type — all "0 products".
Effect: user scrolls through a wall of filters that can't do anything.
Professional expectation: a category page shows only facets that apply to that category.

### P6 — Zero-result options and groups are still displayed
Options with "0 products" are shown even inside otherwise-relevant groups (e.g. headphones
Connector/plug: 2.5mm, usb-c, fixed-cable, 4-pin-xlr all 0). Standard e-commerce hides or
disables options that would return nothing.

### P7 — "Category" facet is meaningless on a category page
On `/products/headphones` the Category filter lists headphones (186), accessories (0),
audio-electronics (0). The user is already in headphones; the other two are permanently 0.
Same on the other category pages.

### P8 — "Compatibility" facet is unusable garbage data
On accessories / `/products` the Compatibility facet lists hundreds of raw model strings,
lowercase, almost all "1 product", many malformed:
`ah-d9200 sony: mdr-z7m2`, `liric hedd audio: heddphone two denon: ah-d5200`,
`silver: cnc black pc space gray/ black/ ivory white/ red: fr4 with flex cuts`,
`wireless microphone setdistance between transmitter and receiver: >10mpolar pattern...`,
plus entries with empty checkbox labels. Not a usable filter in any form.

### P9 — `/products` (all products) sidebar is an unusable mega-stack
~15 facet groups + ~99 brands + the garbage Compatibility list, all expanded/stacked.
Enormous scroll before the user reaches most filters or the product grid.

### P10 — Price bounds differ per page but still include per-page outliers
headphones $49.99–$38,000; accessories up to $6,499; audio-electronics $19.99–$13,995.
So bounds ARE recomputed per category (unlike what P2 assumed for the slider max) — but
each still stretches to that category's single most-expensive item (P1 distortion,
per-context). Confirms P1 is the real pattern; P2's "doesn't adjust at all" needs
re-checking against this evidence during decomposition.

---

## Sorting + edge-path sweep (2026-09-04, live on :3000)

### What already works (do not re-investigate / do not file)
Clean-URL rule, active-filter chips, "Clear all", accurate result counts, empty-results
screen exists, page content clamps when `?page` is too high, junk `?sort=` value falls
back to Featured silently, `/products?sort=price-desc` orders correctly, deep-linked
sort on a category route reflects in the control.

### P11 — Unknown filter values are accepted, not dropped
`?brand=notabrand` renders a chip literally labelled "notabrand"; a lone bad value gives a
dead-end "No products match" page with no hint the value is bogus. `sort` already handles
this correctly (junk → Featured) — facet values should do the same: silently drop unknown
slugs and their chips.

### P12 — Sort change may briefly show a half-sorted grid  (NEEDS CLEAN HUMAN CHECK)
Deep-linked `price-desc` / `price-asc` settle correctly, but mid-transition a snapshot
showed two concatenated sorted runs (e.g. $4.9k→$3.5k then $38k→$2k). Could be a
mid-stream artifact, not a real bug. Human check: change Sort on `/products/headphones`
and watch — does the grid flash an unsorted/mixed order before settling?

### P13 — Out-of-range `?page=` clamps content but not the URL or the pager
`/products/headphones?page=999` shows "Showing 169–186 of 186" (correct last page) but the
URL stays `?page=999` and the pager renders a broken current-page state (no active page).
Expected: redirect/clamp to the real last page number.

### P14 — Two different "clear" labels + unhelpful empty state
Empty-results screen says "Clear filters"; the chips bar says "Clear all" — same action,
two labels. Empty state also gives no hint which filter is too narrow.

### P15 — Sort persistence across filter changes — multi-page case unverified
Single-page result sets keep sort fine when a filter changes. Not verified for multi-page
result sets or for the page-reset-to-1 interaction. Flag for the implementer.

### P16 — Mobile filter/sort experience unverified
`Filters` and `Sort` are separate buttons in a mobile bar; could not drive them at test
width. Needs a real mobile-viewport pass: same facet set, same chip behaviour, same empty
state, sort parity with desktop.

---

## Grouping notes (fill in as list grows)

See `DECOMP-DRAFT.html` (rendered view) for the full proposal.

## Beads issues created 2026-09-04 (decomposition E)

Epics (both `related` to `sang-logium-agq` — EPIC Filters Sorting):
- `sang-logium-dpb` — EPIC Filters Facet Relevance
- `sang-logium-jw8` — EPIC Filters Price And Polish

| Issue | Slug | Covers | Wave | Model / effort |
|---|---|---|---|---|
| `sang-logium-dpb.1` | Sidebar shows only facets that apply here | P5, P7 | 1 (anchor) | Sonnet / medium |
| `sang-logium-dpb.2` | Hide facet options that match no products | P6 | 2 (after dpb.1) | Sonnet / low-med |
| `sang-logium-dpb.3` | Remove the raw Compatibility facet | P8 | 1 | Haiku / low |
| `sang-logium-jw8.1` | Research: high-count facet list pattern | P4-PRE | 1 | Sonnet / medium |
| `sang-logium-jw8.2` | Price slider absorbs a lone far-outlier product | P1, P10, P3 | 1 | Opus / med-high |
| `sang-logium-jw8.3` | Unknown filter values in the URL are ignored | P11 | 1 | Sonnet / medium |
| `sang-logium-jw8.4` | Brand list shows a short set with show-more | P4 | 3 (after jw8.1 + dpb.1) | Sonnet / medium |
| `sang-logium-jw8.5` | Out-of-range page redirects to last real page | P13 | 2 (after dpb.1) | Sonnet / low |
| `sang-logium-jw8.6` | Empty results: one reset label + helpful hint | P14 | 1 | Sonnet / low |
| `sang-logium-8wk` | Verify sort flash, multi-page sort, mobile parity | P12, P15, P16 | 1 | Sonnet / low |

P9 designed away (falls out of dpb.1 + dpb.3 + jw8.4). P2 folded into jw8.2.
