# Blueprint — Filters and Sorting

**What this document is.** This is the complete list of things that must be true for the filters-and-sorting feature to count as professionally finished. It comes from the Definition of Done (`works/dod-filters-and-sorting.md`). Every item below is a check: a statement a person can read, then verify is either true or false. Nothing in this document is code. How each check is actually built and run is decided later, by the architect — this document only decides *what must be proven*.

**How to read it.** Read section 1 for what we found. Read section 3 to see every kind of mistake being guarded against. Then each check is one short block: what it claims, what you should see when it runs, and what we expect before the feature is built.

**Status:** draft, waiting on the decisions in section 8.

---

## 1. What we found first

Five things discovered while reading the code, stated plainly:

- **The two existing test scripts do not test the real feature.** They contain a hand-copied version of the filtering logic instead of calling the one that ships — and they skip price, stock, and every range filter. They can pass while the real feature is broken. The data checks in section 4 replace them.
- **Search has its own separate version of everything.** The search page re-implements the filter bar, the sort control, pagination, and the empty state instead of sharing them with the catalogue. The check "the interface is the same everywhere" will fail — correctly — until this is fixed.
- **Much of the intended interface does not exist yet.** Typed price fields, the "we're updating" state, the notice when a link carries a value that was dropped, the pinned filter bar, minimum tap-target sizes, and consistent design-system colours are all unbuilt. Their checks are expected to fail on the first run.
- **Two questions only the owner can answer** (section 8): whether search keeps "Relevance" as a sort, and exactly what an option's count number means when its group already has a selection.
- **The shipped filtering code cannot currently be loaded by a plain test script.** A small configuration change is needed (decision OD-1, section 10).

---

## 2. The standard, in plain terms

The feature is done when all of these are true:

1. **The data is correct.** Every product is in the right place, nothing is duplicated, and every field the feature reads holds a sensible value.
2. **The options offered are correct.** Every option shown has products behind it, and every real attribute shoppers would want to filter by is offered.
3. **Every selection returns exactly the right products.** No missing products, no extra products — for any single option, any combination, any price range.
4. **Sorting and pagination are correct.** Each sort orders by what its name says, sorting never changes which products appear, and every page of results is complete with no product on two pages.
5. **The address bar and the screen always agree.** A copied link restores the exact view; each action changes only what it should; a garbage address never breaks the page.
6. **The interface behaves properly everywhere.** On phones, tablets, and desktops; with touch, mouse, and keyboard; while rotating, zooming, and on slow connections.
7. **It looks like the same store.** Design-system colours, spacing, type, and icons only; it behaves identically on catalogue pages, the all-products page, and search.

---

## 3. Everything a shopper can do — and what each check guards

The complete list of actions, taken from the real interface. Under each, the checks that cover what can go wrong (check names in section 4).

- **Arrive on a page.** Checks: options offered are real, panel offers, option counts.
- **Tick or untick a filter option.** Checks: single option mapping, option counts, link restores, each action's address, timing, dead ends, keyboard, tap targets.
- **Toggle a yes/no option (e.g. In stock).** Same coverage as ticking an option.
- **Set a price range or a numeric range.** Checks: bounds equal the data, price boundaries, price input behaviour, dead ends.
- **Reset a range.** Covered by the address-behaviour check.
- **Change the sort.** Checks: sort order, sort independence, the sort control, sort contract.
- **Remove a chip.** Covered by chip behaviour.
- **Clear all.** Checks: chip behaviour, history, address behaviour.
- **Go to another page of results.** Checks: pages partition results, the last page, address behaviour.
- **Move between categories or surfaces.** Checks: slice membership, slice change, the same interface everywhere, universal-only options.
- **Open a link / reload / use Back and Forward / return from a product page.** Checks: link restores, history, place kept, hostile addresses, the shopper is told.
- **Open and close the mobile filter sheet (5 different ways).** Checks: the sheet in portrait, landscape, tablet; keyboard cover.
- **Navigate inside the panel (jump strip, show more, search within a group).** Check: a long panel stays navigable.
- **Resize, rotate, zoom, enlarge text.** Checks: one entry point, rotation, pointer rules, text and zoom, panel geometry, large desktop.
- **Use only a keyboard.** Checks: keyboard, names and announcements, contrast, reduced motion.

Every reachable state for every action is covered. In a few places no check is possible because the risk is a judgment, not a fact — those are listed openly in section 9.

---

## 4. The checks

Three kinds, run in this order:

**Data checks (21).** Scripts that compare the real catalogue data and the real filtering engine against an independent expected answer. The expected answer comes from a small, deliberately simple piece of logic written separately from the feature — never copied from it — and that logic is itself verified first on six hand-written example products where the right answer is obvious by eye. This is the only way to avoid the trap of testing the feature against itself.

**Rule tests (10).** Small tests on the feature's pure rules: how addresses are written and read, how options are counted, what the sort options are. Each has tiny hand-written examples with the expected answer written beside the input.

**Live checks (46).** A human in a browser, following a fixed script. Used where only eyes or real interaction can judge — layout, motion, keyboard feel, whether a sheet covers the keyboard. Many are assisted by a short pasted snippet that prints one clear PASS or FAIL line per assertion, so the human never has to eyeball a number in a sea of markup. Before these run, the data checks print a small table of sample addresses with known-correct contents; the browser is always compared against that independent table, never against itself.

**How to read each check below.**
- **Claim** — the single thing that must be true.
- **You should see** — what a person observes when the check runs.
- **Proves** — why passing is evidence (only stated where it isn't obvious).
- **Before the build** — the honest expectation the first time it runs: *fail* (the behaviour doesn't exist yet), *pass* (the behaviour already exists — with the reason), or *depends on the data*.
- **Proves it catches** — one example of a deliberate defect this check must catch, so a check can never pass vacuously.
- IDs in brackets (DP-1, LW-3, LC-14…) exist only so sections 5–10 can cross-reference. They carry no meaning you need to learn.

### 4.1 Data checks (21)

**The independent checker is itself correct** (DP-0)
- Claim: the small independent logic used to compute expected answers gives the right answers on six hand-written products.
- You should see: eight test cases pass — each one a selection over the six products with the expected product list written beside it by hand.
- Before the build: passes (it proves only itself).
- Proves it catches: making the upper price bound exclusive instead of inclusive must fail the boundary case.

**Every product lives somewhere real** (DP-1)
- Claim: every product points to at least one real location in the catalogue, and at least one of its locations is a leaf so it can be listed.
- You should see: three counts — products with no location, locations that exist nowhere, products with no leaf — all zero.
- Before the build: depends on the data.
- Proves it catches: a product given a made-up location key must be named and fail.

**Both ways of knowing a product's category agree** (DP-2)
- Claim: for each category, the set of products filed under it equals the set of products tagged as belonging to it — in both directions.
- You should see: the two sets counted and their differences listed; zero each way.
- Before the build: depends on the data.
- Proves it catches: removing one product's tag must name that product and fail.

**No product appears twice** (DP-3)
- Claim: every product code is unique, and no two products share the same brand and name.
- You should see: two counts, both zero.
- Before the build: depends on the data.

**Every field the feature reads holds a sensible value** (DP-4)
- Claim: prices are non-negative whole numbers of cents; the price used for filtering equals the price shown on the card; every product has a name, a real brand, and a valid creation date; stock numbers are non-negative and reserved stock never exceeds stock.
- You should see: one line per rule with a count of violations, all zero.
- Before the build: depends on the data.
- Proves it catches: a product whose filter price differs from its display price must fail the mirror rule.

**Every real attribute value is a valid value, and every real value can be filtered on** (DP-5)
- Claim: every attribute on every product has the right kind of value (booleans are true/false, ranges are numbers, lists are text), and every distinct value a product actually has appears as a filter option.
- You should see: per filter group — number of values found, values not offered, badly-typed values — the last two zero.
- Before the build: depends on the data (the code's own comments record that options have missed real values before, so failure is plausible).
- Proves it catches: a product with a value no option offers must be counted.

**Every option offered actually has products** (DP-6)
- Claim: on every catalogue page, every filter option shown has at least one matching product behind it.
- You should see: per page — options offered, options with products — equal, with zero empty options.
- Before the build: depends on the data.

**Every attribute that distinguishes products is offered — or deliberately excluded** (DP-7)
- Claim: every attribute that takes two or more different values within a category is either a filter option or on an owner-approved list of exclusions, each with a one-line reason.
- You should see: varying attributes, offered, excluded — nothing unaccounted for.
- Before the build: blocked until the owner supplies the exclusion list (decision R-6); the first run prints the candidates for the owner to rule on.

**The filter groups shown match the data** (DP-8)
- Claim: on every page, each filter group the engine offers has the same number of distinct values as the raw data — and pages too thin to offer a meaningful group are identified.
- You should see: per page and group, the engine's count and the independent count, equal.
- Before the build: depends on the data.
- Proves it catches: removing the engine's "hide zero-count options" step must make the counts diverge.

**One real value is never two options** (DP-9)
- Claim: within each filter group, no two different raw values collapse to the same option after normal tidying (case, spaces, dashes, unit spellings like "ohm"/"Ω").
- You should see: per group — distinct values, collisions — collisions zero.
- Before the build: depends on the data.
- Proves it catches: "Sennheiser " with a trailing space alongside "sennheiser" must be flagged.

**The counting machinery sees every product** (DP-10)
- Claim: the catalogue is not larger than the fixed window of products the counting engine reads — otherwise some products would silently never be counted.
- You should see: total products vs. the window size, with headroom.
- Before the build: passes while the catalogue stays under that window.
- Proves it catches: feeding it a snapshot over the window size must fail.

**The slider ends are the real lowest and highest prices** (DP-11)
- Claim: on every page, the low and high ends the interface offers for each range equal the true lowest and highest values in the data — and the real top price is not silently chopped off by a cap.
- You should see: per page, engine ends equal data ends; the true price floor and ceiling printed.
- Before the build: depends on the data; an engaged cap fails with the explanation printed.

**Everything a sort needs exists and varies** (DP-12)
- Claim: for each of the six sorts, the field it orders by exists on every product and takes at least two different values — a sort over identical values sorts nothing.
- You should see: per sort — missing fields zero, distinct values at least two.
- Before the build: depends on the data (a bulk import could share one creation date; see R-7).

**Every single option returns exactly its products** (DP-13)
- Claim: choosing any one option of any filter — every value of every list, each yes/no, each end of every range, each end of price, in-stock — returns exactly the products that have it: none missing, none extra.
- You should see: one line per option — expected count, actual count, missing ids, extra ids — ending with "no mismatch found".
- Before the build: depends on the data.
- Proves it catches: a filter that matches case-sensitively must lose products on a mixed-case value.

**A product survives all of its own attributes at once** (DP-14)
- Claim: for every product, selecting every attribute value that product has — across all filters at once, plus its price and stock state — returns a set that still contains it and matches the independent answer.
- You should see: products tested, products found in their own selection, sets matching the independent answer — all equal, and never zero (an empty pass is impossible by construction).
- Before the build: depends on the data.
- Proves it catches: two filters accidentally sharing one internal name must lose some product.

**Within a group, choices widen; across groups, they narrow** (DP-15)
- Claim: picking two values in the same filter returns the union of their products; picking one value each in two different filters returns the intersection — tested for every same-group pair and for a representative pair of every kind of cross-group combination.
- You should see: pairs tested, mismatches zero.
- Before the build: depends on the data.
- Proves it catches: combining two filters with "or" instead of "and" must fail an intersection case.

**Price edges are inclusive and use the dollars the shopper sees** (DP-16)
- Claim: asking for exactly $249 returns every product priced $249.00 to the cent; a $249.99 product is excluded by a $249–$249 range and included by $249–$250.
- You should see: whole-dollar cases and fractional cases, mismatches zero.
- Before the build: depends on the data. (No sale prices exist today; that clause sleeps — X-5.)
- Proves it catches: an exclusive upper bound must fail.

**Every sort orders by what its name says, all the way down** (DP-17)
- Claim: for each sort, the product list comes out in the order the name promises — price by number, name in natural alphabetical order (so "A2" before "A10"), newest by creation date — the list contains every product exactly once, ties can never reorder between visits, and the list fetched in one go equals the list assembled page by page.
- You should see: per sort — it's a true permutation, it's monotone, paging matches, the total order holds.
- Before the build: expected to **fail** — the two price sorts currently end on a tiebreaker that can reorder, and the name sort doesn't handle numbers naturally.
- Proves it catches: removing the tiebreaker from a price sort must fail even with no tied data.

**Sorting never changes which products are shown** (DP-18)
- Claim: for six different selections, all six sorts return the identical set of products — only the order differs.
- You should see: six selections × six sorts, zero differing sets.
- Before the build: depends on the data.
- Proves it catches: a sort that silently also filters must change a set and fail.

**The pages, put together, contain every product once** (DP-19)
- Claim: concatenating every page of results equals the complete ordered list — no product on two pages, none missing, the last page holds exactly the remainder, and the page count agrees with the total count.
- You should see: pages, total, concatenation equal, duplicates zero, missing zero.
- Before the build: depends on the data.
- Proves it catches: an off-by-one at a page boundary must lose a product on every edge.

**The number beside each option is the number of products it returns** (DP-20)
- Claim: for every sample state, the count shown beside an option equals both the independent count and the number of products actually returned — for every option at the default state, and every option in a group nothing is selected in yet.
- You should see: options checked, engine count = independent count = returned count.
- Before the build: depends on the data. Options inside an already-selected group are not asserted until the owner decides what the count means there (R-2).
- Proves it catches: a count engine that ignores the in-stock filter must diverge.

### 4.2 Rule tests (10)

**The existing tests still stand** (LW-0)
- Claim: three existing test files already prove: addresses round-trip through the parser, junk never throws, unknown values are dropped, counts ignore an option's own group, and no count goes negative.
- Before the build: passes — they already exist and prove exactly this. (One caveat: an existing test currently pins out-of-range prices passing through unchanged; if the intended behaviour changes, the test is rewritten to the new rule, not deleted.)

**Exactly the six promised sorts, no others** (LW-1)
- Claim: the store offers exactly six sorts — Newest; Price, Low to High; Price, High to Low; Alphabetically, A-Z; Alphabetically, Z-A; Date, Old to New — Newest is the default, each of the six is accepted in a link, and every other sort word (including "featured" and "best-selling") falls back to the default.
- Before the build: expected to **fail** — the address currently accepts two sort values nothing offers.
- Proves it catches: deleting one offered sort must fail the list test.

**A default never appears in the address** (LW-2)
- Claim: writing the default sort, a cleared option list, or an empty price range produces a clean address with nothing extra in it.
- Before the build: predicted pass; the gate decides.

**The slider's ends are the real prices** (LW-3)
- Claim: the rule that computes the slider's ends returns the true lowest and highest prices, in the dollars the shopper sees.
- Before the build: expected to **fail** — above a fixed ceiling the code caps the top instead of using the real highest price.
- Proves it catches: a cents-to-dollars slip must fail the first case.

**Counts respect every other active filter** (LW-4)
- Claim: on six hand-written products, option counts correctly narrow when a price range, the in-stock toggle, a yes/no, or a numeric range is active in another group — while ignoring selections in the option's own group.
- Before the build: predicted pass.

**Labels stay short and clean** (LW-5)
- Claim: every filter title is at most three words, every option label at most four, and no label contains markup debris, underscores, double spaces, or an untranslated raw value.
- Before the build: expected to **fail** — at least one option label runs to six words. The casing-style clause waits on R-3.

**The options offered match the declared vocabulary** (LW-6)
- Claim: for every closed-list filter, the options offered on a category page are exactly the declared vocabulary — nothing offered that isn't declared, nothing declared that isn't offered, no duplicate ids or labels.
- Before the build: predicted pass for the closed lists.

**The universal filters are identical in every category** (LW-7)
- Claim: Brand, In stock, and the sort list are the same — same label, same control, same source — on all three category pages.
- Before the build: predicted pass.

**The in-memory matching engine combines selections correctly** (LW-8)
- Claim: on six hand-written products, the engine that drives search results matches correctly: "or" within a group, "and" across groups, inclusive range ends, price in cents, missing values excluded once their filter is on, single values and lists treated alike, case ignored.
- Before the build: predicted pass.

**Options appear in a meaningful order** (LW-9)
- Claim: derived options like brands come out alphabetically regardless of popularity; hand-curated option lists follow the owner-approved order (in-ear, on-ear, over-ear; smaller capacity before larger).
- Before the build: expected to **fail** — options are currently sorted by count. The curated lists wait on the owner's order table (R-6). Where alphabetical and "most useful first" conflict on brands, alphabetical wins until ruled (R-10).

### 4.3 Live checks (46)

*Conventions: "sample" means a known-answer address printed by the data checks. "Slow" means the throttled settings standing in for a mid-range phone on 4G. Each check's claims are individual clauses that pass or fail on their own line, so a failure points at exactly one thing.*

**The site answers** (ENV-1)
- Claim: the catalogue page, a category page, and a search page all load and show at least one product.
- Before the build: passes wherever the site is running.

**A link restores everything** (LC-1)
- Claim: opening a saved address — one per kind of filter, one for sort, one combination — shows every control set as the address says: ticks, toggles, slider positions, sort, and exactly the implied chips.
- You should see: a table of addresses → expected control states, every row matching.
- Before the build: expected to **fail** on one case — an address can carry a sort value the control doesn't list.

**Each action changes only what it should** (LC-2)
- Claim: each action changes the address by exactly its own piece and nothing else — a tick adds its key, a sort keeps filters, clearing all keeps the sort, changing a filter after paging resets the page, and panel navigation changes nothing.
- Before the build: expected to **fail** — "Clear all" currently also removes the sort.

**History is honest** (LC-3)
- Claim: each action adds one history step; Back undoes exactly it and shows that state; Forward redoes it; a range drag replaces rather than adds; reload reproduces the view; ticking the same option twice returns to the identical address.
- Before the build: predicted pass (search uses a second mechanism, so it's exercised there too).

**Returning from a product keeps your place** (LC-4)
- Claim: from a filtered, sorted, scrolled page of results, opening a product and pressing Back restores the same address, results, and scroll position.
- Before the build: unknown — the gate decides.

**A garbage address never breaks the page** (LC-5)
- Claim: twelve deliberately broken addresses (made-up sort, unknown brand, nonsense prices, a reversed range, a negative page, a page past the end, unknown keys, mangled characters) each render a normal page — never an error.
- Before the build: predicted pass.

**The shopper is told what was dropped, and nothing hides** (LC-6)
- Claim: when an address carries a value that doesn't exist or a filter meant for another category, the page says so in visible text naming the value, and either the stray parameter is removed or a removable chip shows it — the count matching the clean address.
- Before the build: expected to **fail** — no such notice exists today, and foreign filters are applied silently.

**Changing category carries nothing silently** (LC-7)
- Claim: navigating between categories never smuggles a filter that doesn't apply — every value that survives has a visible chip and a matching count.
- Before the build: predicted pass.

**The page shows what the independent answer says** (LC-8)
- Claim: for every sample address, the visible result count and the first products shown match the independently computed answers — on catalogue pages, the all-products page, search, and one nested page per category.
- Before the build: depends on the data.

**The numbers beside options match the independent answer** (LC-9)
- Claim: on sample addresses, the count beside each visible option equals the independent count, and a zero-count option is visibly disabled.
- Before the build: depends on the data (selected-group rows wait on R-2).

**The panel offers exactly what the data supports** (LC-10)
- Claim: the filter groups and options visible on each page are exactly the ones the data checks say belong there — including the ones that must *not* appear because they'd have fewer than two meaningful values.
- Before the build: expected to **fail** — single-value groups currently show, and the all-products page shows one category's groups.

**The sort control behaves like one control** (LC-11)
- Claim: the sort control shows the current sort, offers the same six choices in the same words on every surface, and keeps a sensible label at every width.
- Before the build: expected to **fail** — the label never shortens, and search's control differs (see R-1).

**Count, results, and chips always agree — and updating is visible** (LC-12)
- Claim: after every kind of action, the count text, the actual products, and the chips describe the same selection at the same instant; while new results load, the results area visibly says so and controls dim — old products never sit under a new count.
- Before the build: expected to **fail** — the interface currently reads no "updating" signal.

**Every action is acknowledged on a fixed clock** (LC-13)
- Claim: on a simulated mid-range phone: a tick responds within a tenth of a second; new results arrive within a second; nothing visibly jumps in the filter area meanwhile; and ten rapid ticks are all kept, none lost.
- Before the build: depends on the device and data.

**Active choices are summarised in one fixed form** (LC-14)
- Claim: every active filter is exactly one chip with a one-tap remover, in a fixed readable format ("Impedance: 32–80 Ω"); "Clear all" appears if and only if a chip exists and clears only filters, never the sort; a sort alone never makes a chip; on phones the chips scroll in one row with "Clear all" first; the count reads "N products" / "1 product" and is announced politely.
- Before the build: expected to **fail** on several clauses — a sort chip exists, "Clear all" clears the sort, chips wrap at all widths, range bounds repeat the unit.

**Dead ends can't be walked into, and are recoverable** (LC-15)
- Claim: an option with no products stays visible but is clearly disabled (and not by colour alone); a selection that matches nothing says so plainly, lists each active filter with a remover, and offers "Clear all"; removing one chip brings results back.
- Before the build: expected to **fail** — the disabled option's contrast is too low.

**A long filter panel stays navigable** (LC-16)
- Claim: scrolling the panel never scrolls the page; a jump strip lists exactly the visible groups with real names, marks the current one, and lands precisely; long option lists truncate sensibly with "Show more" and find-by-typing; a selected value stays visible when its list collapses; none of it changes the address.
- Before the build: expected to **fail** — no group is marked, and some jump labels use internal names.

**Price entry is exact, forgiving, and calm** (LC-17)
- Claim: typed minimum/maximum fields and a two-handle slider stay in sync; the slider has a sensible number of positions; fields accept digits only with a numeric keypad on phones; handles can't cross and a reversed entry is corrected with a message; results update only on release/Enter/leaving the field — a mid-drag changes nothing; handles are big enough to grab.
- Before the build: expected to **fail** on most clauses — no typed fields, handles too small, a mid-drag fires requests, too many positions.

**Your place is kept after a change** (LC-18)
- Claim: after changing a filter or sort while scrolled down, the first row of results is in view — the page doesn't leave you staring at the wrong scroll position.
- Before the build: expected to **fail** — nothing scrolls the results back today.

**Everything works from the keyboard** (LC-19)
- Claim: Tab moves in the order things appear on screen; Space ticks, Enter activates, chips are removable; on sliders, arrows step one, Page Up/Down step ten, Home/End jump to the ends; in the mobile sheet focus stays inside, Esc closes, and focus returns to the button that opened it.
- Before the build: expected to **fail** — the sliders' Page Up/Down steps don't match.

**Names, regions, and announcements** (LC-20)
- Claim: the filter panel is a labelled region, each group has a proper name, every control's spoken name includes its group and unit, and a changed result count is announced exactly once — not zero, not twice.
- Before the build: expected to **fail** — range sliders are all named "Minimum price" regardless of what they measure, and two regions announce the same thing.

**Everything is readable and nothing relies on colour alone** (LC-21)
- Claim: text meets the readability contrast threshold; control borders, states, and the focus ring meet theirs; selected means a check mark *and* fill, unavailable means "(0)" *and* disabled — never colour alone.
- Before the build: expected to **fail** — the slider track is nearly invisible against its background.

**Reduced motion is honoured** (LC-22)
- Claim: for people who ask for reduced motion, every animation in the filter area is near-instant and nothing slides — including the mobile sheet.
- Before the build: expected to **fail** — the sheet slides in.

**One entry point at every width, swapped without loss** (LC-23)
- Claim: below the layout switch the "Filters" button shows and the side panel doesn't; above it the reverse; dragging across the boundary keeps every selection and never shows both.
- Before the build: predicted pass.

**The filter bar stays with the shopper** (LC-24)
- Claim: on small screens the filter button, result count, and sort share one row that pins under the header while scrolling; the button reads "Filters" normally and "Filters · 3" with three active.
- Before the build: expected to **fail** — the bar scrolls away and shows no count.

**The mobile sheet, portrait** (LC-25)
- Claim: the sheet fills most of the screen height; its header and "Show N results" footer stay fixed while the middle scrolls, with N live as options change; choices apply live; the footer clears browser toolbars, the home indicator, and the site's bottom bar; all five ways of closing work — including the phone's Back, which closes the sheet rather than leaving the page; the page behind doesn't scroll; opening and closing are quick but not jarring.
- Before the build: expected to **fail** — Back currently leaves the page, and safe areas are not handled.

**The mobile sheet, landscape** (LC-26)
- Claim: in a short landscape viewport the sheet still works — slim header and footer, a usable scrolling area, and all key controls visible at once.
- Before the build: expected to **fail** — header and footer are too tall.

**The sheet on a tablet** (LC-27)
- Claim: on a tablet in portrait the sheet is a centred panel of reasonable width, not stretched edge to edge — otherwise identical to the phone sheet.
- Before the build: expected to **fail** — it's full width.

**The side panel's shape on larger screens** (LC-28)
- Claim: the panel is a sensible fixed width, sticks under the header, fills the space below it, scrolls on its own, shows its header and first group without scrolling at the smallest qualifying size, and leaves the product grid a healthy width.
- Before the build: expected to **fail** — the panel is wider than allowed and squeezes the grid.

**Large desktop stays composed** (LC-29)
- Claim: on very wide screens nothing stretches — panel and sort control keep their widths, the chips and bar align with the product grid's edges.
- Before the build: unknown — the gate decides.

**Rotating or resizing loses nothing** (LC-30)
- Claim: rotating a phone with the sheet open keeps every selection, the open sheet, and its scroll position; rotating a tablet keeps selections, scroll, and focused control while the sheet and panel swap — quickly, and never showing both.
- Before the build: unknown — the gate decides.

**Everything is tappable and clickable** (LC-31)
- Claim: on a touchscreen, every control in the filter area has a finger-sized target with breathing room between neighbours; on a mouse, nothing is awkwardly small; nothing exists only on hover.
- Before the build: expected to **fail** — option rows, chip removers, and slider handles are all under the touch size.

**Text stays readable under zoom and big text settings** (LC-32)
- Claim: labels and captions meet minimum sizes; every text field is at least the size that prevents phones auto-zooming; at 200% zoom and the narrowest width nothing is clipped and everything is reachable; the page never scrolls sideways.
- Before the build: expected to **fail** — the in-group search field is below the threshold.

**The on-screen keyboard never covers the field** (LC-33)
- Claim: on a real phone, focusing a text field inside the sheet keeps both the field and the sheet's footer visible — the keyboard doesn't cover what you're typing or the results button.
- Before the build: unknown — depends on devices; the price fields it will also cover don't exist yet.

**Every colour is a design-system colour** (LC-34)
- Claim: every colour anywhere in the filter interface — text, backgrounds, borders, icons, shadows — comes from the store's palette, at any transparency.
- Before the build: expected to **fail** — at least two off-palette colours are in use.

**Spacing, corners, and shadows come from the scale** (LC-35)
- Claim: every gap and padding is a multiple of the base unit; every corner radius and shadow is one of the sanctioned ones.
- Before the build: expected to **fail** — fractional spacing steps and a hand-rolled shadow are in use. (Which animation durations are sanctioned waits on R-9.)

**One type scale, one icon family** (LC-36)
- Claim: every piece of text uses a sanctioned size, and every icon comes from a single icon package — none drawn by hand.
- Before the build: expected to **fail** — three different icon sources are in use.

**Every control has every state, visibly distinct** (LC-37)
- Claim: for each kind of control, its normal, hovered, keyboard-focused, pressed, selected, unavailable, and busy states all look different from each other.
- Before the build: unknown — the gate decides. ("Looks exactly like the equivalent control elsewhere in the store" waits on R-9 — no reference control is named.)

**Restraint** (LC-38)
- Claim: emphasis colours are used sparingly — at most one primary-style button at a time, no success/error colours for ordinary states, no exclamation marks or emoji, and the only motion is the sheet, the jump strip, state changes, and the existing image reveal — all quick.
- Before the build: expected to **fail** if the sheet's animation is too slow; otherwise unknown.

**Formatting matches the rest of the store** (LC-39)
- Claim: a price shown in a chip or on the slider is written exactly as it is on a product card, and brand and category names are spelled identically everywhere they appear.
- Before the build: predicted pass for prices; unknown for category names.

**After a change, images reveal one by one and nothing jumps** (LC-41)
- Claim: after a filter or sort change, each new product image fades in promptly as it loads — never a wall of images appearing at once, never a flash, never anything shifting position.
- Before the build: unknown — the reveal is signed off elsewhere; this proves the feature doesn't disturb it.

**The reveal doesn't wait for the page to settle** (LC-42)
- Claim: the image-reveal behaviour is identical on a fresh load, after a filter change, and under heavy slowdown — it never waits on interactivity.
- Before the build: unknown — the gate decides.

**The interface is identical on every surface** (LC-43)
- Claim: the filter bar, sort control, chips, panel header, shared groups, and empty state are the same — same parts, same labels, same order — on a category page, the all-products page, and search. The only permitted difference is which filter groups are relevant.
- Before the build: expected to **fail** — search re-implements all of these with its own markup. (Search's sort lines wait on R-1.)

**Each surface offers only options true of everything it lists** (LC-44)
- Claim: the all-products page and search offer only the universal filters (Brand, Price, In stock); a category page offers only that category's groups; search shows the universal filters even when every hit is in one category.
- Before the build: expected to **fail** — the all-products page currently shows one category's groups.

**The feature is the same in every browser** (LC-40)
- Claim: a fixed twelve-step walkthrough plus the measurement checks produce identical results across the sanctioned browser/OS matrix.
- Before the build: runs on one reference browser for the first pass; the full matrix waits on R-5 (the literal list is 28 runs — whether it can be reduced is the owner's call).

---

## 5. Coverage — every promise has a check

All 50 Definition-of-Done items are covered. Conversely, every check exists to catch a named failure — nothing is asserted "just in case". The two exceptions by design: the independent-checker check (DP-0) and the site-answers check (ENV-1) exist because other checks stand on them.

A few judgements can never be mechanical — "is this label well written" is a review practice, not a check. Those are listed in section 9, openly, rather than hidden behind a fake assertion.

The checks run in dependency order so a failure always lands in its own layer: the independent checker first, then data integrity, then options, then selection/sorting/pagination, then rule tests, then the live areas (addresses and state → faithful data → interaction → responsive → design → reveal → sameness → browsers). One honest caveat stands: a defect visible only for one specific nested page × one specific selection could slip through both samples — it's named, not hidden (section 11).

---

## 6. What we expect on the first run

Every check must produce an honest result: it fails on the behaviour it targets, or it passes because the behaviour already exists — with the reason stated. A check that fails on its own machinery, or passes while proving nothing, is rewritten.

**Expected to pass now (behaviour already exists):** the independent checker, the existing rule tests, clean-address writing, count rules, vocabulary parity, universal sameness, the matching engine, the site answering, history, hostile addresses, slice change, one entry point, price formatting, the counting window (while the catalogue stays under its limit).

**Expected to fail now (the code says so):** the sort contract, slider-ends rule, label lengths, option order, full sort order, differentiating attributes (pending your list), link-restores (one case), each action's address, the dropped-value notice, panel offers, the sort control, update-in-progress, chip behaviour, dead-end contrast, panel navigation, price entry, place kept, keyboard steps, accessible names, slider contrast, reduced motion, the pinned bar, all three sheet checks, panel shape, tap targets, text sizes, colours, spacing, icon family, surface sameness, universal-only options, the last page's junk handling.

**Honest result only when run:** everything that depends on the real data or a real device — the remaining data checks, results and counts against the independent answers, timing, rotation, large desktop, keyboard cover, control states, restraint, the reveal checks, cross-browser.

**Vacuity guards** so nothing passes on an empty set: the all-own-values check is non-empty by construction; pair tests fail when a combination has no real case; sort-independence only uses selections with products; single-option lines print both sizes including empty ones; result/count comparisons include at least one non-zero sample; the image check fails if it observed no images.

Pass 1 produces these honest failures and explained passes. Pass 2, after the feature is built against this list, is all green.

---

## 7. The one rule underneath everything

The expected answers for every data check come from a small, separate, deliberately boring piece of logic — written independently of the feature's code and proven correct first (DP-0). Nothing the feature produces is ever used to predict what the feature should produce. Two ground truths are assumed, stated openly: the data the checks read is the same data the site serves, and the catalogue index in the repo is the one the site uses. A data mismatch caused by an edit in progress is rerun after it propagates — never explained away.

---

## 8. Decisions only you can make

| # | Question, plainly | What waits on it |
|---|---|---|
| R-1 | The definition promises the same six sorts, defaulting to Newest, on every surface. Search currently defaults to "Relevance". Taken literally, Relevance disappears from search and Newest becomes its default. Is that intended? | Sort control and sameness checks on search |
| R-2 | What should the number beside an option mean when its own group already has a selection? The engine currently shows "the others, plus this one alone"; the definition says "products actually returned" — choosing it widens results, so the numbers differ. Which is right? | Option-count check for selected groups |
| R-3 | Label style: one casing rule (Title Case or sentence case) and unit spacing ("3.5mm" or "3.5 mm")? | The casing clause of the label check |
| R-4 | The definition bans "promotional adjectives" — which words? | The wording clause of restraint |
| R-5 | The literal browser matrix is 28 runs. May Chrome and Edge count as one engine, and previous versions be sampled? | Everything beyond the reference browser |
| R-6 | Two tables only you can author: (a) attributes deliberately not offered as filters, one line of reason each; (b) the intended order of each hand-curated option list. The first run prints candidates for you to rule on. | Differentiators and option-order checks |
| R-7 | Three confirmations: creation date is what "Newest" means; no sale price exists, so that clause sleeps; the category tag is authoritative for where a product belongs. | Nothing blocks — proceeding on these unless you say otherwise |
| R-8 | Confirm: "a mid-range phone on 4G" is simulated by the standard throttled settings. | Nothing — proceeding |
| R-9 | Two gaps in "design-system only": which animation durations are allowed, and which existing store control is the reference for each filter control? | Duration and control-equivalence clauses |
| R-10 | "Brands alphabetical" and "the eight most useful values first" can't both hold for a long brand list. Alphabetical wins for now — confirm? | Option-order expectation |

## 9. Not checked — and why, openly

- Judging whether labels are well-written, accurate, and in the shop's voice: a human review practice, not a binary check. The mechanical parts (length, cleanliness) are checked.
- Location keys and the category tag being *wrong in the same way*: undetectable by any rule.
- Whether a chip's wording is "understandable alone" beyond the fixed formats: a judgment.
- Decoration or wording outside the stated design rules: a judgment beyond the fixed rule set.
- Sale-price filtering: no sale prices exist; reopens if they ever do.
- Misspelt-but-genuinely-different attribute values: no rule can separate a typo from a real value.
- Numbers stored as text sorting wrong: no affected filter exists today.
- Search-engine friendliness of filtered addresses: excluded by the definition itself.
- The interface "feeling composed": a judgment, reviewed by a human, not asserted by a check.

## 10. Open items needing approval

- **OD-1** — Permission for a small configuration change so test scripts can load the real shipped filtering code unchanged (the alternative — re-building queries from source text — would reintroduce the exact copy-drift problem this blueprint exists to kill).
- **OD-2** — One internal module can't be loaded by tests because of what it imports; its behaviour is covered by the count check and the live results check instead.
- **OD-3** — Approval for the new proof files this list requires (the independent checker, three proof scripts, two small owner-authored tables, and new test files beside the modules they cover).
- **OD-4** — Recommendation: *replace* the two existing test scripts rather than extend them — they test a copy of the logic and skip price, stock, and ranges.
- **OD-5** — A few behaviours (chips, clear-all, dropped-value reporting) have no testable pure seam, so they're proven live. Adding seams would enable cheaper tests but is a design decision beyond this document.

## 11. Honest limits

"No leaks" can't be proven — unknown unknowns stay unknown. The defence is procedural: every failure mode discovered later becomes a check immediately, and the list is reviewed against the full action surface before sign-off. Named residual risks: a defect visible only on one specific nested page with one specific selection; one planted defect per clause until the build step covers all; device and network variance on timing checks; the browser-matrix reduction; and search-relevance semantics, which belong to the search feature, not this one.

---

**Next:** you answer R-1 through R-10 (R-7 and R-8 are confirmations only) and approve OD-1 and OD-3. Then the proof scripts are built from this blueprint and gate pass 1 runs.
