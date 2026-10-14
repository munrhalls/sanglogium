# Definition of Done — Filters and Sorting

Inception document. It states what the feature must be to count as 9+/10 professional. It says nothing about how that is checked or built.

## 1. Objective

A shopper in a high-end audio shop can narrow and order any browsable part of the catalogue down to the products they care about. They can trust every option, count and result without second-guessing. It works the same on every device and orientation. The interface feels as composed and unhurried as the products it sells. Wherever filters and sorting appear in the shop, they meet this bar and behave identically.

The shopper is often spec-literate and comparing carefully (impedance, driver type, connectivity, form factor, price tier). A wrong option, a missing product or an unclear label costs trust in the whole shop.

## 2. Scope

In scope:

- **Filtering and sorting of a catalogue slice's product listing.** A slice is one of the three main categories (Headphones, Audio Electronics, Accessories). Brand pages, sale pages and other curated collections are not slices.
- **Every surface where the feature is installed.** The category listings, the all-products listing and the search-results page. The feature is one self-contained block that can be placed on any listing surface, and it must meet this DoD on each (Section H).
- **The options offered.** Their existence, naming, order, grouping and counts.
- **The mapping from a selection to the products returned.** The selection is any combination of filters plus one sort.
- **The filter and sort interface.** Desktop sidebar or bar, mobile sheet, applied-filter summary, result count, empty state.
- **The state of a selection.** Shareable, restorable, resettable.
- **Responsive behaviour.** Mobile, tablet, small desktop and large desktop, each in portrait and landscape, across the fixed bands in E0.
- **Design-system alignment and accessibility of all of the above.**

## 3. Boundaries

- **Product grid reveal is separate and signed off.**
  - The grid streams its cards in progressively. Each product image resolves from soft to sharp as its own data arrives, independent of when the page becomes interactive.
  - There is one deliberate exception path, for returning to an already-painted view, where no fake animation is played.
  - This feature does not redefine, extend or retest that behaviour. Nothing here may alter, delay, batch or gate it. DoD items G1–G2 state the only obligations this feature has toward it.
- **Card content and card design are not part of this feature.** The product detail page and the basket are not part of it either.
- **Text search itself is a separate feature.** Only the filters and sorting placed on its results page are in scope.
- **Proof method is not decided here.** How each item is proven (cost, tooling, oracle strategy, live versus automated) belongs to the Blueprint Maker. The owner's cost constraints are passed to that role unchanged.
- **Nothing here describes how it is built.**

## 4. Order of dependency

The groups are ordered by dependency. Each group is only meaningful if the one before it holds.

1. Coherent data and options (A)
2. Correct mapping from selection to result (B)
3. A faithful interface (C)
4. Interaction quality (D)
5. Responsive and design-system quality (E, F)
6. The reveal boundary (G)
7. Sameness across every surface where the feature is installed (H)

**Conflict rule.** If two items conflict, or an item cannot be made binary, the Blueprint Maker does not guess. It returns the item to the owner. Until the owner rules, the item in the earlier group above wins.

---

## 5. DoD items

### A. Coherent catalogue and options

**A1. Every slice contains exactly its products.**
- Done: a shopper in a slice sees every product that belongs there. Nothing is missing, nothing is duplicated, and nothing appears that a reasonable shopper would call out of place.
- Wrong: a product vanishes from its category, appears in two unrelated ones, or an unrelated product shows up in a slice.

**A2. Every offered option corresponds to real products in that slice.**
- Done: every filter value and every filter group shown in a slice matches at least one product in that slice, with no leftover options from other categories.
- Wrong: a "Turntable" speed option appears in Headphones, or a brand is listed with nothing to show for it.

**A3. Every meaningful differentiator in a slice is offered.**
- Done: every attribute a buyer in that slice would decide by, and that distinguishes at least two of its products, is available as a filter. A buyer never has to scan the whole grid to find what an option could have given them.
- Wrong: products differ visibly in a decisive spec (for example open-back versus closed-back) yet no filter exists for it.

**A4. A group appears only where it can distinguish.**
- Done: a filter group needs at least two distinct values in the slice. A group where every product is identical is not shown. The same holds for sort controls when a slice has fewer than two products.
- Wrong: a Brand filter listing one brand, or a price range whose ends are equal.

**A5. Universal and slice-specific options never contradict each other.**
- Done: a universal option (brand, price, availability, the sorts) means the same thing, is named the same way and behaves the same way in every slice where it appears. A slice-specific option never duplicates, overrides or clashes with a universal one.
- Wrong: "Price" filters by different things in different places, or two groups express the same idea in different words.

**A6. Option values are normalised and unique.**
- Done: one real-world value is one option. Spelling, casing and unit expression are consistent (a single "Sennheiser", not two variants; "32 Ω" everywhere, not a mix of "32 ohm" and "32Ω").
- Wrong: the same brand or spec appears twice under different spellings, or splits the results across the two.

**A7. Labels are clear, correct and in the shop's voice.**
- Done: each group title and option label is immediately understandable to an audio buyer. It is accurate, spelled correctly, plain, and uses one casing style and one language, matching the storefront. Units are properly spaced and symbolised. Nothing is internal jargon, cute, truncated, mislabeled or ambiguous.
- Wrong: a label a shopper has to guess at, a data-field name leaking through, or mixed language or casing.

**A8. Option order is meaningful.**
- Done: brands are alphabetical. Numeric specs run in numeric order. Naturally ranked values run in their natural order (for example in-ear, on-ear, over-ear). A group's most-used values are easy to reach.
- Wrong: options in raw data order, or numbers sorted as text ("100" before "25").

**A9. Counts are honest.**
- Done: each option shows how many results the shopper would get by choosing it, given the other selections already made. The count equals the number of products actually returned.
- Wrong: a count that disagrees with the result, or that ignores the current selection.

### B. Correct selection-to-result mapping

**B1. Every possible selection returns exactly the right products.**
- Done: for any combination of filter choices and any sort, the returned products are exactly those that satisfy the combination. None is wrongly excluded, none wrongly included, and the total is complete.
- Wrong: any combination that omits a qualifying product or admits a non-qualifying one.

**B2. Combination logic follows shopper expectation.**
- Done: within one group, choosing several values widens the result (Sony or Sennheiser). Across groups, choosing narrows it (brand and price and type).
- Wrong: values within a group narrowing each other to nothing, or groups widening one another.

**B3. Price filtering matches the price the shopper sees.**
- Done: the range compares against the price displayed on the card, including an active sale price. The range ends are the real lowest and highest prices in the slice. Boundary values are inclusive, and a product priced exactly at an endpoint is included.
- Wrong: a product shown at a price inside the chosen range is excluded, or one outside it is included.

**B4. Sorting is correct and stable.**
- Done: each sort orders by exactly what its name says, using the displayed price where relevant. Equal items keep a consistent, deterministic order, so the same selection always gives the same order. Products lacking the sorted attribute go last, never first. Name sort ignores case and orders model numbers naturally (HD 58 before HD 600).
- Wrong: random-looking reorderings between visits, ties shuffling, unpriced items on top, or "HD 600" before "HD 58".

**B5. Filter and sort are independent.**
- Done: changing the sort never changes which products are in the result. Changing a filter never silently resets the sort.
- Wrong: re-sorting drops products, or filtering snaps the sort back to default.

**B6. The result set is complete and reachable.**
- Done: results are paginated. Every product in the result can be reached by the shopper by moving through the pages. None is duplicated across pages, and the last page is unmistakable.
- Wrong: results that cut off early, repeat on the next page, or show a count larger than what can be reached.

**B7. Default sort is intentional.**
- Done: the sorts offered are exactly these six, each backed by real product data: Newest (the default), Price, Low to High, Price, High to Low, Alphabetically, A-Z, Alphabetically, Z-A and Date, Old to New. The default is a deliberate, named choice and the shopper can always return to it. Sorts the product data cannot back (Featured, Best selling, rating) are not offered. The same six, with the same labels in one style, appear on every surface (H1). The owner accepts this set as relatively good; it is still to be checked for whether each makes sense to a shopper. For example, "Date, Old to New" is the mirror of "Newest" and may deserve a plainer name.
- Wrong: an unnamed default, no way back to it, a sort offered that the data cannot honour, or the same sort labelled differently in two places.

### C. Faithful interface

**C1. The interface shows only what is true.**
- Done: every option, count, active choice and result total on screen is exactly what the underlying data says. No option is shown that does not exist. No stale value outlives the state it described.
- Wrong: a control showing "selected" that is not applied, or the reverse.

**C2. Every real state is visible.**
- Done: every selection that affects results is visible and individually removable. There are no hidden constraints, whether left over from another category, a previous visit or a link. A shopper can always see why they see what they see.
- Wrong: a grid narrower than the visible filters explain.

**C3. Results and count always agree.**
- Done: the shown result count, the grid, and the filter-option counts describe the same selection at the same moment. While an update is pending, the shopper can tell that it is pending. Old results are never presented as current.
- Wrong: a count for the new selection above a grid of the old one.

**C4. Selection state is shareable and restorable.**
- Done: the exact selection (filters and sort) lives in the page address, and only there. Whatever a control displays comes from the address, and whatever a control does goes to the address. Sharing, refreshing, bookmarking and the browser's back and forward buttons reproduce exactly the same selection and result. Returning from a product page lands on the same results.
- Wrong: a link opens a different set, refresh clears the selection, or back leaves the filtered view.

**C5. Stale or unknown selections degrade gracefully.**
- Done: an address carrying a value that no longer exists, or one that never did, never breaks the page. The unknown part is dropped and the rest of the selection still works. The shopper is told what was dropped.
- Wrong: an error page, a blank grid, or a silent difference between the address and the result.

**C6. Changing slice treats the selection honestly.**
- Done: moving to another category never carries over constraints that make no sense there. A constraint that still makes sense (for example a brand that exists in the new slice) may carry, and is then visible per C2. The shopper is never left with hidden filters.
- Wrong: a filter from Headphones silently emptying Amplifiers.

### D. Interaction quality

**D1. Every action is acknowledged and delivered on a fixed clock.**
- Done: a tap or click on any option shows its changed state within 100 ms. The updated results (grid, result count and option counts) begin to appear within 1 second on a mid-range phone over 4G. The filter and sort interface itself causes zero layout shift. A control is either usable or visibly not ready (dimmed with a busy indicator), and a tap is never silently lost.
- Wrong: any of those times exceeded, anything under the shopper's finger moving after the tap, or a tap that does nothing and says nothing.

**D2. Active choices are summarised in one fixed form.**
- Done:
  - Every active filter appears as exactly one chip, removable with one tap.
  - Each chip is understandable alone, without opening the panel (for example "Impedance: 32–80 Ω", "Sennheiser", "In stock").
  - "Clear all" is shown if and only if at least one chip exists, and it clears filters only. Sort is never a chip. It is shown in the sort control, and clearing filters leaves it as it is.
  - On a phone, the chips sit in a single horizontally scrollable row with "Clear all" first. On every wider band they wrap.
  - The result count ("N products", singular for 1) is visible in the bar in every band and updates politely for assistive technology.
- Wrong: a filter with no chip, a chip that needs the panel to be understood, "Clear all" visible with nothing to clear, a sort chip, or phone chips that stack into several rows.

**D3. Dead ends cannot be walked into, and are recoverable.**
- Done: an option that would produce zero results under the current selection stays visible, shows a count of (0), cannot be selected, and remains legible (text contrast at least 3:1). It is distinguished from an available option by more than colour. If zero results are reached anyway (for example via a link), the page states that nothing matches. It lists the active filters, each removable with one tap, and offers "Clear all".
- Wrong: a blank grid, an unselectable option that looks selectable, or a zero-result option that is hidden.

**D4. A long filter panel stays navigable.**
- Done:
  - The filter panel scrolls on its own and never moves the product grid or the page behind it.
  - A slim strip with one icon per group sits beside the panel. It appears if and only if there is more than one group, and it lists exactly the groups the panel shows.
  - Choosing an icon scrolls smoothly (400 ms or less) until that group's heading sits 16 px below the panel's top edge. The strip marks the group currently in view.
  - Every icon has an accessible name ("Jump to <group> filters"). Icons are consistent for the same group across slices.
  - Within a group, a long value list shows the eight most useful values first and reveals the rest on request. Past twenty values it offers find-by-typing, and any selected value stays visible.
- Wrong: a jump that also scrolls the grid or page, a strip icon with no matching group (or the reverse), a heading that lands hidden under an edge, or a wall of checkboxes with no way around it.

**D5. Price input is exact, forgiving and calm.**
- Done:
  - Price has two typed fields (minimum, maximum) and a two-handle slider, always in sync both ways.
  - The slider offers between 50 and 200 positions across the real range, and the typed fields accept any whole currency amount.
  - Typed text is limited to digits, with a numeric keypad on phones, and an empty field means no bound.
  - Handles cannot cross. A minimum above the maximum is corrected and a message says so.
  - Results update when the shopper releases a handle or commits a field (Enter or leaving the field), never per keystroke or per pixel dragged.
  - Visible handles are at least 20 px across.
- Wrong: letters accepted, a reversed range silently swallowed, requests firing mid-drag, or handles too small to grab.

**D6. Sort is one decision away.**
- Done: the sort control is in the bar in every band. It always shows the current choice, and the label reads "Sort by" (shortened to "Sort" at 400 px or narrower). Opening it lists the six sorts of B7 with the current one marked. One choice applies immediately. On touch devices the choice list is the system's own picker or an equally large one that meets the touch-target rule (E9).
- Wrong: sort inside the filter panel, an icon with no label, or a choice that needs a second confirmation.

**D7. The shopper's place is kept.**
- Done: after any filter or sort change, the first row of results is in view. After returning from a product page, the same selection is shown at the exact scroll position the shopper left.
- Wrong: results left scrolled mid-page after a change, or a lost position on return.

**D8. Keyboard and assistive-technology users get the same feature.**
- Done:
  - Tab order equals visual order, and every control shows a focus ring at least 2 px thick with 3:1 contrast.
  - Space toggles an option and Enter activates a button or chip removal.
  - On a slider, arrow keys move one step, Page Up and Page Down move ten steps, and Home and End jump to the bounds.
  - Esc closes the sheet, focus stays inside it, and on close focus returns to the trigger.
  - The panel is a labelled "Filters" region, each group is labelled, and the strip is a labelled navigation.
  - Every control's accessible name includes its group and unit.
  - A changed result count is announced exactly once per change.
  - Selected is signalled by a check mark and a fill, and unavailable by "(0)" and a disabled state. Neither relies on colour alone.
  - Text contrast is at least 4.5:1, and control borders and states at least 3:1.
  - With reduced motion on, every transition is 150 ms or less and nothing slides.
- Wrong: any one of those missing.

### E. Responsive behaviour (mobile-first)

**E0. The fixed bands.** Every E item holds, in portrait and landscape, across each band's full range (CSS pixels, width × height).

| Band | Portrait | Landscape |
|---|---|---|
| Phone | 320×568 to 430×932 | 568×320 to 932×430 |
| Tablet | 744×1024 to 834×1194 | 1024×744 to 1194×834 |
| Small desktop | not tested | 1280×720 to 1536×864 |
| Large desktop | not tested | 1920×1080 to 2560×1440 |

Widths between bands follow the same layout rule (E1), and every item still holds.

**E1. One entry point to filters at every width.**
- Done: below 1024 px width, filters are reached through a trigger that opens a sheet. From 1024 px wide upward, they are a persistent panel beside the grid. At every width exactly one of the two exists. Crossing 1024 px (by resize or rotation) swaps them without losing any selection.
- Wrong: both present, neither present, or a selection lost on the swap.

**E2. The bar stays with the shopper (sheet mode).**
- Done: below 1024 px, a single-row bar holds the Filters trigger, the result count and the sort control. It fits on one row at 320 px wide and stays pinned below the site header while the grid scrolls. The trigger shows the number of active filters ("Filters · 3", and no number when there are none).
- Wrong: a bar that wraps to two rows at 320 px, scrolls away, or hides how many filters are active.

**E3. The sheet in portrait.**
- Done:
  - It rises from the bottom to between 85% and 90% of the visible viewport height.
  - It has a fixed header ("Filters", "Clear all", close), a scrolling body, and a fixed footer with a full-width "Show N results" button, where N always equals the live result count.
  - Choices apply live, and the button only closes the sheet.
  - It never sits behind the browser's toolbars, the home indicator or the site's own bottom navigation. The footer respects the safe-area inset.
  - The sheet closes by the close button, a tap on the dimmed area, a downward swipe on its handle, Esc, or the system Back action. Back closes the sheet and does not leave the page.
  - The page behind does not scroll, and opening or closing takes 200–350 ms.
- Wrong: an apply button off-screen, Back leaving the page, or the page scrolling behind the sheet.

**E4. The sheet in phone landscape.**
- Done: the sheet fills the full visible height. Its header and footer are each 56 px or less. Close, "Clear all" and "Show N results" are all visible at once, with at least 144 px of scrolling body between them even at 320 px height. Left and right safe-area insets are respected.
- Wrong: any of those three controls pushed out of view, or a body too short to use.

**E5. Tablet portrait.**
- Done: it uses sheet mode (E1). The sheet is centred with a maximum width of 600 px and otherwise meets E3.
- Wrong: a phone sheet stretched edge to edge across a tablet.

**E6. The persistent panel (1024 px and wider, up to 1536 px wide).**
- Done:
  - The panel is between 280 and 360 px wide, sticks below the site header, and is as tall as the space under the header. It scrolls independently, sealed off from the page's scroll.
  - At 1024×744 its header ("Filters", "Clear all"), the strip and the whole first group are visible without scrolling the panel.
  - The grid area beside it is at least 600 px wide.
- Wrong: a panel wider than 360 px, a panel that cannot reach its own bottom, or a grid squeezed under 600 px.

**E7. Large desktop.**
- Done: the panel has the same width as on small desktop and does not grow with the screen. Type sizes are unchanged. The left edge of the chips and bar aligns with the left edge of the first grid card, and the right edge of the sort control aligns with the right edge of the last grid column (within 1 px). The sort control keeps its natural width.
- Wrong: filters adrift in empty space, a stretched sort control, or edges that do not line up.

**E8. Rotation and resizing keep the shopper's state.**
- Done: rotating or resizing preserves every active choice, an open sheet's open state and its inner scroll position, the page scroll position, and the focused control. The new layout is in place within 300 ms and never shows both layouts at once.
- Wrong: a rotation that resets filters, closes the sheet or jumps the page.

**E9. Pointer and touch rules.**
- Done:
  - On a coarse (touch) pointer, every interactive control has a hit area of at least 44×44 px, with at least 8 px between adjacent targets. This covers option rows, strip icons, chip removers, the close button, the trigger, slider handles and "Show more".
  - On a fine pointer (mouse), no control is smaller than 24×24 px, and option rows are at least 32 px high.
  - Hover only enhances. Nothing is available or explained only on hover.
- Wrong: a 16 px checkbox as the only tap target, a 12 px slider handle on touch, or a tooltip carrying essential information.

**E10. Text, zoom and overflow.**
- Done: option labels are at least 14 px and captions and counts at least 12 px. Every text input is at least 16 px, so mobile Safari does not zoom on focus. At 200% zoom or 200% OS text size, and at 320 px width, nothing is clipped and no control is unreachable. The page never scrolls sideways in any band.
- Wrong: horizontal page scroll, a field that makes the page zoom when focused, or text clipped at large sizes.

**E11. The on-screen keyboard.**
- Done: when a typed field inside the sheet (price or find-in-group) takes focus, that field and the sheet footer both stay visible above the keyboard. The sheet does not jump or collapse.
- Wrong: a price field covered by the keyboard.

### F. Design-system and professional-UX alignment

**F1. Every value comes from the design system.**
- Done:
  - Every colour, type style, spacing step (a multiple of 4 px), corner radius, shadow and motion duration in the filter and sort interface is a design-system value.
  - All icons come from a single family with one visual weight and a consistent size set.
  - Each control type has these states, styled exactly like equivalent controls elsewhere in the store: default, hover (mouse only), keyboard focus, pressed, selected, unavailable and busy.
- Wrong: any literal off-system value, icons mixed from two families, or a missing state.

**F2. Restraint is a fixed rule set.**
- Done:
  - Only the design system's accent colour marks selected, active or primary, and no other chromatic colour appears in the filter interface.
  - At most one primary-style button is visible at a time.
  - Group titles are three words or fewer, and option labels four words or fewer (brand and model names excepted).
  - Copy has no exclamation marks, emoji or promotional adjectives.
  - The only motion is sheet open and close, strip scrolling, state changes and the existing grid reveal (G), each 350 ms or less.
- Wrong: any decoration, badge, colour or wording outside those rules.

**F3. Consistency with the rest of the shopping journey.**
- Done: currency, number and unit formatting on chips, panel and sort matches the product cards exactly (same formatter, same spacing, same symbols). Category and brand names read identically everywhere.
- Wrong: "32 Ω" on a card and "32 ohm" in a chip.

**F4. Same feature in every mainstream browser and operating system.**
- Done: every item in groups A–H holds identically in the current and previous major release of Chrome, Edge, Firefox and Safari. It holds on Windows, macOS, Linux, iOS and Android, using each system's browsers (on iOS that is Safari's engine). Appearance, behaviour, scrolling, touch and keyboard handling, form controls and focus all match. Nothing depends on a feature only some of these provide, and operating-system differences (scrollbar style, default form-control look, on-screen keyboard, safe areas, text rendering) never break layout or usability.
- Wrong: a control that works in one browser and not another, a layout that shifts on one system's scrollbars, a sheet hidden behind a mobile browser's toolbar, or a price field the on-screen keyboard covers.

### G. Respect for the existing grid behaviour

**G1. Filter and sort changes leave the grid's reveal untouched.**
- Done: after any filter or sort change, the grid's product images appear under the signed-off progressive behaviour (see Section 3). Nothing in the filter and sort interface causes a batch "wall" reveal, a flash, a blur flicker or a layout jump in the grid.
- Wrong: results that pop in all at once, or images that stay blurred or flash because of how the selection was applied.

**G2. No dependence on when the page becomes interactive.**
- Done: the filter and sort feature does not make the grid's reveal wait on, or depend on, the page's interactivity timing.
- Wrong: a reveal that stalls until the page is interactive because of how filters or sorting are wired.

### H. Sameness across every surface

**H1. One feature, identical wherever it appears.**
- Done: on the category listings, the all-products listing and the search-results page, the filters and sorting have the same labels, ordering, interactions, states, responsive behaviour and accessibility. Every item in groups A–G holds on each surface. The only permitted difference is which groups are relevant (H2).
- Wrong: a control that behaves or reads differently on search than on a category page.

**H2. Each surface offers only options that are true for everything it lists.**
- Done: a surface that lists products from several categories (all products, search results) offers only options that mean the same thing across all of them (brand, price, availability and the other universal ones). Category-specific spec groups appear only on a surface that is itself one category. Search results always get the universal options only, even when every hit happens to fall in one category.
- Wrong: a headphone-only spec offered over a mixed result, which silently excludes amplifiers and cables.

---

## 6. Open questions

None open.

Resolved with the owner: search results offer universal options only; brand and sale pages are not slices; filters and sorting are a self-contained block installed on listing surfaces, search results included; an option with zero results under the current selection is shown unavailable with a count of 0; the grid reveal is signed off and untouched.

## 7. Stated dismissals

- **Search-engine optimisation of filtered addresses.** Not covered. It becomes relevant only if the owner wants filtered pages indexable.
- **Personalised or saved filters, recommendations, "compare" and wishlist interplay.** Out of scope.
- **Proof method, oracle strategy, cost constraints and ordering of proofs.** Owner intent exists and is passed on unchanged. It is the Blueprint Maker's job, not this document's.
- **Cross-browser and cross-OS proof strategy (F4).** The owner's direction is the simplest and cheapest means possible. Proof comes first, then the designed check that verifies it, and only then the build against that pre-designed check. This is passed to the Blueprint Maker unchanged. This document fixes only the target.
- **Architecture of the block.** The owner's working picture is that the address is the single source of truth. The controls only write to it and display from it. A separate orchestrator reads it, fetches the products and hands them to the grid on every surface. The owner marks this as provisional. It is passed downstream unchanged and not judged here; its observable consequences are captured in C4 and H1.
- **Grid reveal internals.** Deliberately not described, because they are signed off and owned elsewhere. Only the obligations in G are inherited.
- **Data-layer fixes.** This document does not say how coherence is achieved. It only says what coherent looks like.
