# Filters & Sorting — Gap-Closure Plan (Phases & Tasks)

> **Scope:** Phases and tasks ONLY. No execution in this prompt.
> **Goal:** Close every gap in `filters-sorting-gaps-intelligence.md` to 100% professional
> (Next 15 / React 19 / Sanity v3 / nuqs, June 2026) status.
> **Inputs:** `filters-sorting-gaps-intelligence.md` (22 gaps), `filters-sorting-complete-source-record.md`.
> **Resource rule:** No `build` / `lint` / `tsc` during prep. During execution, only targeted unit
> tests are run; full builds avoided unless unavoidable.

---

## 0. Global Conventions (apply to every phase)

- **One gap closed in exactly one phase** — no gap is split across phases.
- **Test-first per phase:** write/extend unit/integration tests before the implementation task in
  that phase; production code lands green. (Existing filter/sort tests are treated as void and
  rewritten — see Phase 0 task.)
- **No behavior left implicit:** every task states the **file**, the **change**, and a binary **DoD**.
- **Mutex discipline:** claim each file before edit, release after, per `.windsurf/rules/parallel-guardrails.md`.
- **No new `docs/` churn:** this plan is the single planning artifact.

### Files in play (verified to exist)
| Layer | File |
|---|---|
| Client hook | `app/components/features/filters/useFilterNuqs.ts` |
| UI | `SortDropdown.tsx`, `FilterSidebar.tsx`, `MobileFilterDrawer.tsx`, `MobileControlsBar.tsx`, `ActiveFilters.tsx`, `PriceRangeSlider.tsx`, `StockMinimumSlider.tsx` |
| Server page | `app/(store)/products/[...slug]/page.tsx`, `ProductsSection.tsx`, `FilterSection.tsx`, `CategoryPageClient.tsx` |
| Query | `sanity-cms/lib/products/getProductsByVfsKeys.ts`, `FilterBuilder.ts`, `filter/getFiltersForCategoryPath.ts` |
| Schema | `sanity-cms/schemaTypes/categoryFiltersType.ts`, product schema |
| Util | `lib/utils/price.ts` |
| **New (to create)** | `lib/catalogue/filterParams.ts` (shared param/sort contract) |

---

## Phase 0 — Test Harness Reset (enabler)
**Why first:** intelligence states existing filter/sort tests must be redone wholesale; later phases
are test-first and need a clean, trusted harness.

- **T0.1** — Inventory & delete/quarantine existing filter/sort tests; record what behavior they
  asserted (for reference only, not as truth).
  - **DoD:** No stale filter/sort test references remain in the suite; list of old assertions captured.
- **T0.2** — Establish test fixtures: a deterministic mock product set (varied brand, price, stock,
  reservedStock) and a mock `categoryFilters` doc.
  - **DoD:** Fixtures importable by unit + integration tests; no network/Sanity calls in unit tests.
- **T0.3** — Define the test matrix skeleton (one describe-block per phase below), all `.todo`.
  - **DoD:** `npm test` (targeted path only) lists pending specs for every phase; zero run cost beyond the file.

**Phase 0 exit:** Clean, deterministic harness ready; no behavioral change to app.

---

## Phase 1 — Trusted Param & Sort Contract (foundation)
**Closes:** A3, A6, A8, B1, B4, B12
**Why early:** every downstream phase depends on a single source of truth for parsing/serializing
`sort`, `f`, `page`, shared by client (`useFilterNuqs`) and server (`page.tsx`).

- **T1.1** — Create `lib/catalogue/filterParams.ts`:
  - nuqs parsers: `sortParser` (string, default `featured`), `filtersParser`
    (`parseAsArrayOf` with an **explicit, escape-safe separator that cannot collide with values**),
    `pageParser` (`parseAsInteger`, default 1, min 1).
  - `createSearchParamsCache`/`createLoader` for server use.
  - **DoD:** Module exports parsers + loader; unit tests cover round-trip serialize/parse incl.
    values containing the old delimiter chars (`:` and `,`).  *(closes B4, B12)*
- **T1.2** — Define `SORT_OPTIONS` config in `filterParams.ts`:
  `{ urlValue, label, groqField, groqDir }[]` + a `SORT_ALLOWLIST` derived set + `resolveSort(urlValue)`
  returning a safe `{groqField, groqDir}` or the default.
  - **DoD:** Unit tests: known values resolve correctly; unknown/crafted values fall back to default
    (never interpolate raw input). *(closes A6, B1 definition)*
- **T1.3** — Server: replace manual parsing in `page.tsx` (`typeof query.sort === 'string'`,
  `flatMap(split(','))`) with the loader/cache from T1.1.
  - **DoD:** `page.tsx` contains no ad-hoc param parsing; reads via shared loader.
- **T1.4** — Server: `getProductsByVfsKeys` builds its order clause via `resolveSort()` only
  (no raw `${sortField}` interpolation).
  - **DoD:** Unit test proves a crafted `?sort=evil:asc` produces the default order, not injected GROQ.
    *(closes B1 enforcement)*
- **T1.5** — Client: `useFilterNuqs` consumes the shared parsers (single (de)serialization).
  - **DoD:** Client and server import the **same** parser module; no duplicated split logic remains.
- **T1.6** — `SortDropdown` renders options from `SORT_OPTIONS` (no hardcoded `<option>` list).
  - **DoD:** Adding/removing a sort option requires editing only `filterParams.ts`.
- **T1.7** — Active-filter count: `MobileControlsBar` counts via the normalized parser, not
  `searchParams.getAll('f')`.
  - **DoD:** `f` containing 2 logical filters counts as 2 regardless of wire encoding. *(closes A8)*

**Phase 1 exit:** One trusted param/sort contract; sort injection impossible; counts accurate;
no client/server parser drift.

---

## Phase 2 — Query Resilience & Performance (server data layer)
**Closes:** A5, B2

- **T2.1** — Wrap `getProductsByVfsKeys` and `getFiltersForCategoryPath` in try/catch returning a
  safe empty/degraded shape (mirroring `searchProductsFull`); log via the project logger.
  - **DoD:** Simulated Sanity failure returns empty result, no unhandled rejection, page renders
    a degraded (not crashed) state. *(closes B2)*
- **T2.2** — `getFiltersForCategoryPath`: run the independent queries with `Promise.all` instead of
  5 sequential awaits.
  - **DoD:** Query count unchanged; the four independent fetches issue concurrently (verified by test
    spy ordering / timing assertion). *(closes A5 — latency)*
- **T2.3** — Replace the unbounded "fetch all products to derive brands" with a GROQ
  distinct-brands query (`array::unique` / grouping) — no full-catalogue load.
  - **DoD:** Brand options derived without fetching every product; result identical to prior brand set
    on fixtures. *(closes A5 — scalability)*

**Phase 2 exit:** Data layer degrades gracefully and no longer does sequential/unbounded work.

---

## Phase 3 — Pagination & Result Count
**Closes:** A1

- **T3.1** — `getProductsByVfsKeys`: add `page`/`perPage` → GROQ slice `[offset...offset+perPage]`;
  keep `MAX_PRODUCTS_LIMIT` as the per-page cap, not a total cap.
  - **DoD:** Page N returns the correct window; sort applied before slice (global sort preserved).
- **T3.2** — Add a total-count query (`count(*[...filterClause])`) returned alongside products
  (parallel with T2.2 pattern).
  - **DoD:** Total count reflects the full filtered set, not the capped window.
- **T3.3** — `page.tsx` reads the `page` param (T1.1) and passes it into the query.
  - **DoD:** URL `?page=2` returns the second window; out-of-range pages clamp safely.
- **T3.4** — Add pagination UI (page controls **or** infinite scroll — choose one; default: numbered
  pagination for SSR/SEO friendliness) and wire result count display to the real total.
  - **DoD:** User can reach all products in a >100-item category; count shows true total.

**Phase 3 exit:** Pagination fully functional; no silent truncation; accurate totals.

---

## Phase 4 — Deterministic & "Featured" Ordering
**Closes:** A2

- **T4.1** — Add optional `displayPriority` (number) field to the product schema.
  - **DoD:** Field present in studio; unset products treated as priority 0.
- **T4.2** — Define the default ("featured") order in `SORT_OPTIONS`/query as
  `order(coalesce(displayPriority,0) desc, _createdAt desc)` (deterministic, curatable).
  - **DoD:** `sort=featured` produces a stable, repeatable order; SSR/CSR agree.
- **T4.3** — Data backfill script (Sanity migration) is **specified** (not run) for setting
  `displayPriority` on curated products; default behavior works with field unset.
  - **DoD:** Script written + documented; feature correct even before backfill runs.

**Phase 4 exit:** Default listing has a deterministic, business-meaningful order; "featured" is real.

---

## Phase 5 — Filter Correctness & Data Semantics
**Closes:** B3, B5, B6, B7, B9, B13

- **T5.1** *(B3)* — Reconcile URL filters against the category's actual filter groups; strip/ignore
  unknown filters before querying; surface ignored ones (or silently drop with a logged note).
  - **DoD:** `f=foo:bar` yields no bogus GROQ and no stale chip.
- **T5.2** *(B5)* — Server-side range sanity check: if `min > max`, normalize/ignore and signal an
  invalid-range state instead of silent zero results.
  - **DoD:** Hand-edited inverted range no longer returns a confusing empty grid.
- **T5.3** *(B6)* — Drive slider bounds from real data; treat `0`/`null` correctly (remove the
  hardcoded `10000` ceiling and the `minPrice ? ...` falsy bug in `FilterSidebar`/`MobileFilterDrawer`).
  - **DoD:** Slider max equals true category max; a `0` bound is honored.
- **T5.4** *(B7)* — Stock-minimum filter matches `availableStock` (`stock - reservedStock`), aligning
  with the computed field, OR the semantic is explicitly documented if raw `stock` is intended.
  - **DoD:** Min-stock filter result matches the displayed availability semantic.
- **T5.5** *(B9)* — Brand option intersection in `getFiltersForCategoryPath` is case-insensitive,
  consistent with `FilterBuilder` matching.
  - **DoD:** CMS brand option with differing casing still appears and filters correctly.
- **T5.6** *(B13)* — On category (slug) change, reconcile/clear stale `f`/`sort`/`page` invalid for
  the new category.
  - **DoD:** Navigating categories does not carry invalid filters or out-of-range pages.

**Phase 5 exit:** Filters are correct, data-driven, and resilient to manual URL edits.

---

## Phase 6 — UX States & Feedback
**Closes:** A4, A7

- **T6.1** *(A4)* — Empty-results state in `CategoryPageClient`: clear message + one-click reset CTA
  wired to `clearAllFilters`.
  - **DoD:** Zero-result filter combos show guidance + working reset.
- **T6.2** *(A7)* — Visible pending UI on re-filter (dim/skeleton the grid via `useFilterPending`)
  and deliberate scroll handling (e.g., scroll-to-top on page/sort change).
  - **DoD:** Re-filtering shows a loading state beyond the text-only "(Loading...)"; scroll behaves predictably.

**Phase 6 exit:** Clear feedback for empty and in-flight states.

---

## Phase 7 — Interaction Consistency & Accessibility
**Closes:** B8, B10, B11

- **T7.1** *(B8)* — Apply consistent debounce to `setStockMinimum`/`clearStockMinimum`, matching the
  price slider's `debounce(500)`.
  - **DoD:** Stock changes throttle URL/server updates like price.
- **T7.2** *(B10)* — Keyboard step changes on both sliders commit via the debounced path (no
  per-keypress server re-render).
  - **DoD:** Arrow-key dragging does not spam re-renders.
- **T7.3** *(B11)* — Mobile drawer: live focus trap (re-evaluates focusable nodes), `aria-expanded`/
  `aria-controls` on the Filters button, and descriptive per-chip `aria-label` in `ActiveFilters`.
  - **DoD:** Focus trap holds with dynamic content; screen reader announces each chip's filter name.

**Phase 7 exit:** Consistent, accessible interaction across controls.

---

## Phase 8 — SEO / Indexation of Facets
**Closes:** A9 (depends on A2 stable order)

- **T8.1** — Canonical strategy: filtered/sorted/paged URLs canonical to the base category (or a
  defined indexable subset); add `robots` controls for non-indexable facet permutations.
  - **DoD:** Crawl no longer indexes unbounded filter permutations; base category canonical present.
- **T8.2** — Confirm default order stability (Phase 4) so crawled listings are deterministic.
  - **DoD:** Repeated crawls of the base category see a stable order.

**Phase 8 exit:** Facet URLs are SEO-safe; listings deterministic for crawlers.

---

## Dependency Order (must respect)

```
Phase 0 (harness)
  → Phase 1 (param/sort contract)         ← foundation for all below
      → Phase 2 (resilience/perf)
      → Phase 3 (pagination/count)        needs page parser from P1
      → Phase 5 (filter correctness)      needs normalized filters from P1
  → Phase 4 (featured order)              independent of P2/P3 but after P1 config
      → Phase 8 (SEO)                     needs stable order from P4
  → Phase 6 (UX states)                   needs P3 count + P5 correctness for accurate empty-state
  → Phase 7 (interaction/a11y)            independent; can run after P1
```

Recommended execution sequence: **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8.**

---

## Coverage Matrix (every gap mapped to exactly one phase)

| Gap | Severity | Phase | Task(s) |
|---|---|---|---|
| A1 Pagination non-functional | CRITICAL | 3 | T3.1–T3.4 |
| B1 Unvalidated sort field (GROQ injection) | CRITICAL | 1 | T1.2, T1.4 |
| A2 "Featured" = arbitrary order | HIGH | 4 | T4.1–T4.3 |
| A3 No nuqs server adapter | HIGH | 1 | T1.1, T1.3, T1.5 |
| A4 No empty-results state | HIGH | 6 | T6.1 |
| A5 Sequential + unbounded queries | HIGH | 2 | T2.2, T2.3 |
| B2 No error handling in query path | HIGH | 2 | T2.1 |
| B3 Stale/invalid filters unreconciled | HIGH | 5 | T5.1 |
| B4 Comma in value corrupts parsing | HIGH | 1 | T1.1 |
| A6 Sort config not shared | MEDIUM | 1 | T1.2, T1.6 |
| A7 No re-filter pending/scroll UX | MEDIUM | 6 | T6.2 |
| A8 Inaccurate filter counts | MEDIUM | 1 | T1.7 |
| A9 No SEO/canonical for facets | MEDIUM | 8 | T8.1–T8.2 |
| B5 min>max URL → silent 0 | MEDIUM | 5 | T5.2 |
| B6 $10k slider ceiling / 0 falsy | MEDIUM | 5 | T5.3 |
| B7 Stock filter ignores availableStock | MEDIUM | 5 | T5.4 |
| B8 Stock slider no debounce | MEDIUM | 7 | T7.1 |
| B9 Brand option casing | LOW | 5 | T5.5 |
| B10 Keyboard step commits per press | LOW | 7 | T7.2 |
| B11 Stale focus trap / ARIA | LOW | 7 | T7.3 |
| B12 Parser split divergence | LOW | 1 | T1.1, T1.5 |
| B13 Stale params on category change | LOW | 5 | T5.6 |

**22/22 gaps mapped. No gap split across phases. No phase without a binary DoD.**

---

## Plan Self-Scan (gaps-scan on the plan itself)

- **No over-complication:** 9 phases, each grouping related gaps; no phase introduces scope beyond a
  listed gap. Pagination UI picks ONE approach (numbered) to avoid option sprawl.
- **No false positives:** every task targets a verified file/behavior from the intelligence report.
- **No hidden dependencies:** dependency graph + sequence stated; P1 is the explicit foundation.
- **No premature execution:** plan only; backfill script (T4.3) is *specified, not run*.
- **Resource-safe:** test-first uses targeted specs; no build/lint/tsc mandated.
- **Open decision flagged for execution prompt:** Phase 3 pagination style (numbered vs infinite
  scroll) — defaulted to numbered; confirm before T3.4.

**Ready for execution in the next prompt.**
