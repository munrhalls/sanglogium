# Mission: Search UX Visual Refresh

**Objective (bar, not task):** search experience (search bar, autocomplete overlay, zero-query
panel, empty state, results page, pagination) reads as professional 8+/10 for a high-end audio
retailer — human-verified live on `localhost:3000`.

**Scope:** visual UX only. Every target item below must be achievable as a className/markup/
asset-presentation change — no new interaction logic, no new data fetching, no new keyboard
bindings, no backend/query changes. (Cmd+K command-palette pattern was researched and explicitly
excluded: it requires new keyboard-event wiring, i.e. functional, not visual.)

## Intelligence used (gap-scanned + gap-closed)

- Baymard: autocomplete present on 80% of ecommerce sites, only 19% executed well; thumbnails +
  name + price in dropdown reduce friction; avoid visual clutter (excess separators/rows).
- Luxury ecommerce: generous white space, restrained/refined typography, subtle motion,
  high-quality imagery — "more info" applies to product pages, not to autocomplete density
  (reconciled: keep dropdown content minimal, upgrade only its visual execution).
- Audiophile retailers (Moon Audio, Apos Audio): expert/brand-led merchandising, but no rich
  visual search patterns found — this vertical under-invests in search polish versus mainstream
  premium tech. Opportunity, not a pattern to copy.
- Premium consumer-tech visual language (Apple / B&W / Sonos): cinematic imagery, generous
  spacing, restrained type, neutral/accent palettes — directly applicable to this site's existing
  dark, accent-500-overline design language.

## Current state vs. target, per surface

**SearchHeader** — breadcrumb + accent overline + uppercase h1. Already on-brand and minimal.
Target: no structural change; keep as the reference pattern for restrained luxury typography.

**AutocompleteOverlay / AutocompleteItem** — thumbnail (48px) + name + price + brand, active row
gets a left accent border. Correct information density (matches research: don't add fields).
Gaps: (1) skeleton loading row hides its thumbnail on mobile (`hidden md:block`) while the real
item does not — shape mismatch causes visible layout jank between loading and loaded state; (2)
active/hover states are a flat color swap with no lift (shadow/scale) — reads utilitarian, not
premium; (3) thumbnail container is plain-square with no elevation despite sitting on an already-
elevated card — no depth cue. Target: skeleton and real row share the same thumbnail visibility
rule; active/hover state gets a subtle elevation transition; thumbnail gets a slight
inset/shadow treatment consistent with `shadow-cardDark` already used elsewhere.

**SearchZeroQueryPanel** — recent + popular searches, icon + text rows, 44px touch targets.
Solid structure. Gap: purely textual — no visual distinction from a plain settings-style list,
under-uses the fact this is a visually rich product catalogue. Target: same rows, refined visual
rhythm (spacing/icon treatment/section label weight) — no new data source, no product tiles
(would require new fetching, out of scope).

**SearchEmpty** — single gray icon + text + category-chip links + ghost link. This is the
thinnest surface: a premium audio shop's "no results" reduces to one generic icon. Target:
richer visual composition of the *existing* elements (icon treatment, spacing rhythm, chip
styling elevated to match `btn-secondary` elsewhere on the site, clearer visual hierarchy
between the message and the recovery actions) — no new content sources.

**SearchResults header row** — plain caption `"{totalCount} products"` above a bottom border.
Target: stronger typographic hierarchy tying the count back to the query context already shown
in `SearchHeader`, consistent spacing with the rest of the catalogue pages.

**SearchPagination** — bordered rectangular Prev/Next + "Page X of Y" text, functionally solid
(real links, preserves query params). Visually generic. Target: refine button/pill styling,
clearer current-state affordance, consistent with whatever pagination treatment (if any) is
already the site's pattern elsewhere in the catalogue — check before introducing a new pattern.

## Non-goals (explicitly out of scope)

New sort/filter controls, new fetched content (trending/recommended products), Cmd+K or any new
keyboard shortcut, response-time/debounce/typo-tolerance changes, new CMS assets/photography.

## Definition of done

Human live-checks the search flow (empty query, typing, results, zero-results, pagination) on
`localhost:3000` and confirms 8+/10 professional visual UX.
