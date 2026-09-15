# Search UX — Target search experience spec

Tracked by `sang-logium-d5m.3` — [Search] Spec: target search experience, mobile-first  
Part of `sang-logium-d5m` — EPIC Search UX

This is the implementation spec for Sang Logium's target search experience. It is derived only from the gaps recorded in `docs/search-ux/audit.md` (d5m.7) and the standards in `docs/search-ux/intelligence.md` (d5m.1) and `docs/search-ux/intelligence-visual.md` (d5m.6). No new gaps are introduced.

## Scope and dependencies

- **Filters and sorting** are delivered by `sang-logium-3rv` (EPIC Filter Sort Migration). The search results page will integrate the same `FilterSidebar`, `SortBar`, `ActiveFilterChips` and URL-state helpers already used by `/products`. Search facets must cover the full catalogue (headphones, IEMs, audio electronics, accessories) because a query can return products from any category.
- **Non-product results** (policies, FAQs, buying guides) require a new content index. The spec assumes this is either a Sanity content-type search or a hard-coded policy/glossary map until a full content search is built.
- **Visual/perceptual standards** are the 8 criteria from `intelligence-visual.md`: search-field prominence, autocomplete richness, product-card hierarchy, price scannability, trust-signal density, filter visibility, empty-state helpfulness, and mobile hierarchy preservation.

## Shared query-type behaviour (all breakpoints)

The following requirements apply regardless of viewport. Each item includes a `Trace:` note back to the evidence that generated it.

### Q-EXACT — Exact model / SKU

- When I submit `Sennheiser HD 800S`, then the exact product card is the first result.
- When the exact product is found, then it is visually distinguishable from accessories (e.g. placed first and/or with an "Exact match" indicator); the accessories/cables rank below it.
- When I submit a model number with alternative spacing or capitalization (`hd800s`, `hd 800 s`, `HD-800-S`), then the same exact product is returned first.

Trace: audit.md Exact finding; Baymard "Exact" query type (12% fail) and phonetic/concatenated forms.

### Q-PRODUCT-TYPE — Product type

- When I submit `headphones`, `IEMs`, `DACs` or `accessories`, then the site either auto-redirects to the matching `/products/<category>` page (with its filters and curated sorting) or presents a search results page with the matching category pre-filtered.
- When the query is too broad to map to a single category, then the results page shows a visible filter panel and a count.

Trace: audit.md Product type finding; Baymard "Product type" query type (20% fail) and 1:1 category auto-redirect pattern; B&H observed auto-redirect to `Headphones-Accessories`.

### Q-FEATURE — Feature / attribute

- When I submit `closed-back headphones`, then a "Closed-back" filter is pre-applied and shown as an active chip.
- When I submit a feature query and products exist, then the first results are closed-back headphones and the page does not mix open-back models or ear pads.
- When the feature is not a catalogue facet, then the page shows a buying guide or explainer instead of a keyword dump.

Trace: audit.md Feature finding; Baymard "Feature" query type (39% fail); d5m.6 §6 (filters must look like filters).

### Q-USE-CASE — Activity / occasion

- When I submit `headphones for running`, then the results are portable/sport/wireless headphones and the page does not show desktop DACs, amps or streamers.
- When a use-case tag exists in the catalogue, then it is surfaced as a pre-applied filter with a clear label.
- When no matching products exist, then the page shows a buying guide or related category.

Trace: audit.md Use case finding; Baymard "Use case" query type (43% fail); d5m.6 §5 (trust signals must not be noisy) — note that desktop DACs are a visual-trust and intent mismatch.

### Q-ABBREVIATION — Symbol / abbreviation

- When I submit `IEM`, then in-ear monitors and in-ear headphones are returned.
- When I submit a model abbreviation or spec symbol, then the site maps it to the full term and shows both exact and related matches.

Trace: audit.md Abbreviation finding; Baymard "Abbreviation/symbol" query type (54% fail).

### Q-COMPATIBILITY — Works-with

- When I submit `headphones for iPhone 15`, then the results include headphones that work with iPhone 15 and relevant adapters/DACs.
- When a compatibility result is shown, then the card or page includes a compatibility note (e.g. "Lightning/USB-C", "wireless", "works with iPhone 15").
- When the query implies a need for an accessory, then accessories are clearly labelled as such and ranked below compatible primary products.

Trace: audit.md Compatibility finding; Baymard "Compatibility" query type (44% fail).

### Q-SYMPTOM — Problem / sound signature

- When I submit `headphones with more bass`, then the results include bass-emphasized headphones and IEMs.
- When a sound-signature facet exists, then the page pre-applies it (e.g. "Bass-forward").
- When the query is vague, then the page shows a buying guide or a "How to choose" link above the grid.

Trace: audit.md Symptom finding; Baymard "Symptom" query type (37% fail); d5m.6 §7 (empty/no-results state must be visually helpful).

### Q-NON-PRODUCT — Policies, FAQs, guides

- When I submit `return policy`, `shipping`, `warranty` or `how to choose headphones`, then the search returns the matching policy, FAQ or buying guide at the top of the page, separate from product results.
- When no non-product match exists, then the empty state offers a link to Customer Support, the FAQ page, or a contact form.
- When a guide matches the query, then it is presented as a card with title, one-line summary and a link.

Trace: audit.md Non-product finding; Baymard "Non-product" query type (66% fail, worst category); B&H observed returning the Returns & Exchanges Policy.

## Breakpoint target experience

### Mobile first — 390×844

#### M-Search-field

- When I am on any mobile page, then a search affordance is visible within one tap of the home position (bottom action bar or top app bar).
- When the search affordance is a bottom icon, then it is at least as large as the cart and account icons and is visually distinct (magnifying glass + label or a tappable search bar).
- When I tap the search affordance, then a full-screen overlay opens with the input focused, the keyboard raised, and a clear close/back control.
- When the overlay is open, then it shows a "Popular" or "Recent" section before I type.

Trace: d5m.6 §1 (search field must be visually dominant); NN/g finding #2 (search must be visible, simple, global); audit.md mobile search note.

#### M-Autocomplete

- When I type 2 or more characters in the mobile search input, then a full-screen suggestion overlay appears.
- When suggestions are product matches, then each suggestion shows a thumbnail, brand, product name and price.
- When suggestions exist, then they are grouped under "Products" and, where applicable, "Categories" and "Guides".
- When no products match, then the overlay shows 3–5 popular categories and a "Browse all products" link instead of a dead-end message.
- When I tap a suggestion, then I land on the product page or the search results page as appropriate.

Trace: d5m.6 §2 (autocomplete must be visually rich and grouped); NN/g finding #3 (suggestions must lead to a good result); audit.md Autocomplete.

#### M-Results-page

- When I submit a query, then the results page shows:
  - the query in the page heading;
  - the total count;
  - a filter/sort toggle button;
  - a product grid.
- When the result set is larger than the first page, then a pagination control or lazy-load trigger is visible at the bottom of the grid.
- When product cards are rendered, then they are a single readable column or a two-column grid; each card shows image, brand, name, price and an add-to-basket action.

Trace: d5m.6 §8 (mobile must preserve hierarchy); d5m.6 §3 (product-card hierarchy); d5m.6 §4 (price scannability); audit.md mobile screenshot.

#### M-Filters

- When I tap the filter/sort button, then a bottom sheet opens with collapsible filter groups.
- When I select filter values, then they are added to the active filter summary and the results do **not** refresh until I tap "Apply".
- When I tap "Apply", then the sheet closes, the URL updates, the active chips update, and the grid refreshes.
- When no filters match the query, then the sheet shows the number of expected results for each value (where computable) and disables values that would yield zero results.

Trace: NN/g finding #6 (mobile batched filtering with explicit Apply); d5m.6 §6 (filters must look like filters); audit.md filters deferred to 3rv.

#### M-Empty-state

- When a query returns no products, then the page shows the query, a clear "No products found" heading, 3–5 category links, a "Browse all products" link, and, where applicable, a support/FAQ link.
- When a non-product query (e.g. `return policy`) returns no content, then the page shows a "Search help & policies" link.

Trace: NN/g finding #5 (no-results pages need recovery paths); d5m.6 §7 (empty state must be visually helpful); audit.md No-results finding.

#### M-Non-product matches

- When a non-product result is available, then it appears as a horizontal card at the top of the results list, above product cards, with a title, one-line summary and a link.

Trace: Baymard non-product; audit.md Non-product finding.

### Tablet — 820×1180

#### T-Search-field

- When I am on a tablet, then the search input is visible in the header, like desktop, but it may be collapsed to an icon that expands into a field on tap to save top-bar space.
- When the input is collapsed, then the icon is no smaller than the adjacent cart/account icons and has a visible focus state.

Trace: d5m.6 §1; NN/g finding #2.

#### T-Autocomplete

- When I type 2+ characters, then a dropdown overlay appears below the search field, sized to the input width, with product thumbnails, brand, name and price.
- When non-product matches exist, then they appear in a second section of the dropdown.

Trace: d5m.6 §2; NN/g finding #3.

#### T-Results-page

- When I submit a query, then the results page shows the query heading, count, and a product grid in 2–3 columns.
- When the viewport is wide enough, then a left filter sidebar is visible; otherwise the filter button opens a side sheet or a bottom sheet.

Trace: d5m.6 §3, §4, §6; NN/g finding #4 (filters must be domain-appropriate).

#### T-Filters

- When the left sidebar is visible, then filter groups are collapsible accordions with counts.
- When the bottom/side sheet is used, then it follows the same batch-apply pattern as mobile.

Trace: d5m.6 §6; NN/g finding #6.

### Desktop — 1280×720

#### D-Search-field

- When I am on any desktop page, then a wide, high-contrast search input is visible in the header, to the right of the logo/category navigation.
- When the search field is visible, then it is at least as wide as the category navigation and has a clear placeholder (e.g. "Search headphones, IEMs, DACs...").

Trace: d5m.6 §1; NN/g finding #2; audit.md Search discoverability.

#### D-Autocomplete

- When I type 2+ characters in the desktop search field, then a dropdown appears below the field with up to 6 product suggestions.
- When product suggestions are shown, then each row includes a thumbnail, brand, product name, price and a "View all results for '<query>'" link at the bottom.
- When the query matches a category or a buying guide, then those matches appear under separate "Categories" and "Guides" headings.
- When no products match, then the dropdown shows 3–5 popular categories and a "Browse all products" link.

Trace: d5m.6 §2; NN/g finding #3; audit.md Autocomplete; Headphones.com competitor observation.

#### D-Results-page

- When I submit a query, then the results page shows:
  - a breadcrumb or category link and a "Search Results" label;
  - the query in a large, scannable heading;
  - the product count;
  - a sort dropdown;
  - a left filter sidebar;
  - active filter chips (if any);
  - a product grid in 3–5 columns.
- When product cards are rendered, then each card follows the hierarchy: product image, brand, product name, price, and an add-to-basket or wishlist action.

Trace: d5m.6 §3, §4, §6; Baymard results layout; Headphones.com and MusicTeck competitor observations.

#### D-Filters

- When the search page loads, then the left sidebar lists filter groups relevant to the returned products (e.g. Brand, Form Factor, Driver Type, Open/Closed Back, Impedance, Connectivity, Price, Sound Signature, Use Case).
- When I select a filter value, then the active chip appears above the grid and the URL updates.
- When a query contains a feature or use-case term, then the matching filter is pre-selected and shown as an active chip.

Trace: d5m.6 §6; NN/g finding #4; Baymard feature/use-case auto-filter pattern; audit.md Feature/Use case findings.

#### D-Empty-state

- When a query returns no products, then the page displays the query, "No products found", category links, a "Browse all products" link, and, for non-product queries, a link to support/FAQ content.
- When the system detects a likely typo, then it suggests a corrected query and a "Did you mean..." link.

Trace: NN/g finding #5; d5m.6 §7; audit.md Non-product finding.

## Visual and interaction standards

The following apply to all breakpoints and are derived from `intelligence-visual.md`.

### VS-1 Product cards

- When product cards are displayed, then all images are on a consistent neutral background.
- When product cards are displayed, then every card follows the same visual hierarchy: image, brand, product name, price, action.
- When a product is on sale, then the sale price and original price are shown with the discount clearly visible.
- When a product is an accessory, then the card may show an "Accessory" or "Compatible with..." tag so it is not mistaken for the primary product.

Trace: d5m.6 §3 (product-card hierarchy); d5m.6 §4 (price scannability); audit.md Exact finding (accessory outranked product).

### VS-2 Trust signals

- When the search results page is loaded, then one or two high-value trust signals are visible above the fold (e.g. free shipping threshold, return policy, price-match guarantee).
- When trust signals are shown, then they do not push the product grid below the fold or clutter the card surface.

Trace: d5m.6 §5 (trust signals visible but not noisy); Audio46 and Headphones.com competitor observations.

### VS-3 Autocomplete overlay

- When the autocomplete overlay is open, then it does not visually conflict with the results page behind it (e.g. close the overlay automatically when navigating to a results page, or make the overlay dismissible with Escape or a click outside).
- When the overlay is open and there are no suggestions, then it does not show a blank, empty dark box; it shows recovery content.

Trace: d5m.6 §2; audit.md desktop screenshots (overlay obscuring results; empty overlay).

### VS-4 Mobile hierarchy

- When the viewport is mobile, then the search field remains accessible without opening a hidden menu.
- When the viewport is mobile, then product cards are readable in a single or two-column layout without horizontal scrolling.
- When the viewport is mobile, then prices and product names remain legible without zoom.

Trace: d5m.6 §8; audit.md mobile screenshot.

## Ranking and query-intent rules

### R-1 Exact match precedence

- When a query matches a product name, SKU or model number exactly, then that product is ranked above accessories, cables, ear pads and other compatible products.

Trace: audit.md Exact finding.

### R-2 Synonym and typo handling

- When a query contains a known product nickname, abbreviation or common misspelling, then the search maps it to the canonical product name.
- When a query contains concatenated model numbers (`hd800s`, `hd-800-s`), then they are normalized and matched against the canonical model string.

Trace: Baymard "Exact" query type; audit.md Exact/typo finding.

### R-3 Query-type detection

- When the query contains a feature term present in the facet map, then the matching filter is pre-applied.
- When the query contains a use-case or compatibility term, then the search either pre-applies a matching tag or shows a guide.
- When the query matches a known non-product keyword, then the search returns the matching support/FAQ content first.

Trace: Baymard feature/use-case/compatibility/non-product query types; audit.md corresponding findings.

### R-4 Cross-category result sets

- When a query can return products from multiple categories, then the filter sidebar exposes facets for all returned categories.
- When a query returns only one category, then the page can redirect to the category route or pre-apply the category filter and show the category's facet map.

Trace: Baymard product-type query type; audit.md Product type finding.

## Implementation hand-off notes

- The `/search` route should reuse the server-side filtering helpers and components already built for `/products` in `sang-logium-3rv`. The key files are `FilterSidebar`, `SortBar`, `ActiveFilterChips`, `loadFilterSort`, `sanitizeFilterState` and `buildProductQuery`.
- `searchProductsFull` in `sanity-cms/lib/products/searchProducts.ts` currently uses a single `match` with a trailing wildcard. The target implementation needs an additional layer for query-type detection, synonym/typo normalization and result scoring before the GROQ query is built.
- Non-product search can start as a small, hard-coded map of common policy/FAQ queries (`return policy`, `shipping`, `warranty`) to static pages, plus a `Guide` content type for buying guides and explainers. A full content index can be added later.
- The visual target is a dark, high-contrast storefront with consistent product cards and a wide search field on desktop. The mobile experience must not reduce search to a tiny icon.

## References

- `docs/search-ux/audit.md` (d5m.7) — observed gaps
- `docs/search-ux/intelligence.md` (d5m.1) — Baymard 8 query types and NN/g 6 findings
- `docs/search-ux/intelligence-visual.md` (d5m.6) — 8 visual/perceptual criteria
- `docs/search-ux/evidence/sanglogium-audit-d5m7-visual.json` and `docs/search-ux/evidence/screenshots/sanglogium/` — captured visual evidence
- `sang-logium-3rv` (EPIC Filter Sort Migration) — shared filter/sort mechanism
