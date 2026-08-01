# Homepage — Gap-Closure Plan (Phases & Tasks)

> **Companion file:** `homepage-gaps-intelligence.md` (every phase below closes specific gap
> IDs from that report — see the Coverage Matrix, Section 6).
> **Principle:** minimal change to reach professional/coherent standard. No rewrites, no
> scope creep, no "while we're in here" additions beyond what's listed.

---

## 0. Global Conventions (apply to every phase)

- One phase = one focused change-set. Verify before moving to the next phase.
- Verification per phase: `npm run typecheck` (or `tsc --noEmit`) + `npm run build` +
  manual homepage load, at minimum. Do **not** skip build verification — C1 exists precisely
  because a broken state sat unverified.
- Two phases below (5 and 6) are gated on a **human decision** before any code is touched —
  they are product/content calls, not pure engineering ones. Do not proceed past the decision
  gate without an explicit answer.
- Nothing in this plan touches: product detail pages, `/products` catalogue pages, search,
  basket, checkout. Homepage only, per the intelligence report's scope boundary.

### Files in play (verified to exist)
| File | Role |
|---|---|
| `app/lib/data/homepageBatch.ts` | Batched query + types (relocation target in Phase 1) |
| `app/(store)/lib/fetchHomepageData.ts` | Thin wrapper, import path updates only |
| `sanity-cms/schemaTypes/heroType.ts` | Hero schema (no changes needed — already correct) |
| `sanity-cms/schemaTypes/homepageDataType.ts` | Accessories fields (Phase 5 decision) |
| `data/catalogue.ts` | `resolveSlugToId()` — reused, not modified |
| 8 files under `app/components/features/homepage/**/get*.ts` | Deleted-in-place per Phase 2 |
| `sanity-cms/lib/hero/getHeroData.ts` | Deleted, same reason (Phase 2) |
| `sanity.types.ts` | Regenerated (`npm run typegen`) in Phases 1 and 2 |

---

## Phase 0 — Restore the Build (blocker, closes C1)

**Why first:** nothing else in this plan can be verified while the working tree doesn't type-check.

1. In `app/lib/data/homepageBatch.ts`, inside `fetchHomepageSections()`, restore the two
   missing lines (verified present in `git show HEAD`, absent in the working copy):
   ```ts
   const spotlight3 = processSpotlightData(rawData.spotlight3 ?? null);
   const newestRelease = processNewestReleaseData(rawData.newestRelease ?? null);
   ```
   placed directly after the existing `spotlight1`/`spotlight2` lines, before the `accessories`
   object.
2. Confirm `processSpotlightData` (used for spotlight3) and `processNewestReleaseData` (already
   defined in the file, currently unused) are the correct functions — they are, per the
   committed reference version.
3. **Verify:** `tsc --noEmit` passes; `next build` completes; Spotlight 3 and Newest Release
   render on the homepage using real (not `null`) data.

**Do not proceed to Phase 1 until this passes.**

---

## Phase 1 — Relocate Live GROQ to `sanity-cms/lib/` (closes A1, enables A3/E1/E3/G1)

1. Create `sanity-cms/lib/homepage/getHomepageData.ts` (new file, matches this project's
   existing `sanity-cms/lib/<domain>/` convention, e.g. `sanity-cms/lib/orders/`,
   `sanity-cms/lib/products/`).
2. Move `HOMEPAGE_DATA_QUERY`, `HERO_QUERY`, `fetchHeroData`, `fetchHomepageSections`,
   `fetchHomepageDataBatched`, and the processing helpers (`processSpotlightData`,
   `processSpotlightProduct`, `processNewestReleaseData`) into the new file, unchanged in
   content (this phase is a **relocation**, not a rewrite).
3. While moving `HOMEPAGE_DATA_QUERY`'s text, also strip the `stripePriceId` line from every
   product projection inside it (closes E3 — confirmed dead in the intelligence report;
   nothing reads it).
4. Update `app/(store)/lib/fetchHomepageData.ts` to import `fetchHomepageDataBatched` from the
   new location instead of `@/app/lib/data/homepageBatch`.
5. Delete the now-empty `app/lib/data/homepageBatch.ts` (or leave a one-line re-export if any
   other unexpected caller is found — search the repo for `homepageBatch` imports first to
   confirm there are none besides `fetchHomepageData.ts`).
6. Run `npm run typegen` to regenerate `sanity.types.ts` against the relocated, now-slightly-
   smaller (`stripePriceId` removed) query.
7. **Verify:** `tsc --noEmit`, `next build`, homepage loads, all 8 data-bearing sections still
   populate exactly as before Phase 0 (this phase changes *location and one dead field*, not
   behavior).

---

## Phase 2 — Delete Dead Fetchers, Adopt Typegen Types (closes A3, E1)

Repeat this same small pattern once per file (9 files total — mechanical, low-risk,
independently verifiable each time):

`featured/getFeaturedProducts.ts`, `dacs/getDacProducts.ts`, `iems-gallery/getIemProducts.ts`,
`accessories/getAccessoryProducts.ts`, `product-spotlight-1/getSpotlight1Data.ts`,
`product-spotlight-2/getSpotlight2Data.ts`, `product-spotlight-3/getSpotlight3Data.ts`,
`newest-release/getNewestRelease.ts`, `sanity-cms/lib/hero/getHeroData.ts`.

For each file:
1. Identify the type it currently exports (e.g. `FeaturedProduct`) and every component that
   imports that type name (already enumerated in the intelligence report, Section E1).
2. Replace the file's contents: delete the raw GROQ string and the dead fetch function; keep
   only a type re-export sourced from `sanity.types.ts`'s `HOMEPAGE_DATA_QUERYResult` (via a
   `Pick`/indexed-access slice matching the section), under the **same exported name**, so
   importing components need zero changes.
3. If a component's usage turns out to be structurally incompatible with the typegen shape
   (e.g. a field name mismatch), fix the **component**, not the type — typegen is the source
   of truth per A3.
4. **Verify per file:** `tsc --noEmit` after each file (catches drift immediately, isolates
   which file caused a break).

This phase is safe to pause/resume file-by-file — each file is an independent unit of work.

---

## Phase 3 — Replace Hardcoded Slot IDs with `resolveSlugToId()` (closes G1)

1. In the relocated homepage query file (Phase 1), import `resolveSlugToId` from
   `@/data/catalogue`.
2. Replace the 8 raw ID literals (e.g. `"vnrj2n32p172vcje1tt3s4ls"`) with
   `resolveSlugToId("headphone-cables")` etc., using the exact slugs already confirmed correct
   in the intelligence report (`headphone-cables`, `interconnects`, `adapters`, `earpads`,
   `eartips`, `care-cleaning`, `headphone-stands`, `carrying-cases`).
3. Since `resolveSlugToId` returns a value at call time (not compile time) and GROQ params are
   injected via `$params`, this requires passing the resolved IDs as query `params` rather than
   interpolating raw strings into the query text — a small structural change to how this part
   of the query is built (params object instead of string interpolation).
4. **Verify:** all 7 accessory rows return the same products as before (identical result set —
   this phase changes *how the IDs are obtained*, not which IDs are used).

---

## Phase 4 — Reconnect Hero CMS Fields (closes B1)

**Pre-check (do this before writing any code):** confirm in Sanity Studio what the *current*
`subheadline` and `ctaText` values actually are for the live `hero` document. If they are
placeholder/boilerplate text that would look wrong on the live site, get real copy from
whoever owns homepage content before flipping the render — this phase changes visible,
customer-facing copy, unlike Phases 0–3.

1. Add `ctaLink` to the hero query projection (it is currently the only one of the three
   required Studio fields never fetched at all).
2. Add `ctaLink?: string` to the Hero data type (already present in the local
   `hero/types.ts` `HeroData` interface — just needs to actually arrive from the query now).
3. In `Hero.tsx`: replace the hardcoded `"Hear the difference."` with `heroData.subheadline`,
   and the hardcoded `"DISCOVER"` with `heroData.ctaText`. Keep sensible fallbacks (e.g.
   `heroData.subheadline || "Hear the difference."`) so a temporarily-empty CMS field doesn't
   blank the hero — mirrors the existing fallback pattern already used for `ctaLink`.
4. **Verify:** hero renders with live CMS copy; test changing `subheadline`/`ctaText`/`ctaLink`
   in Studio and confirming each shows up on the homepage without a deploy.

---

## Phase 5 — Accessories Schema Decision (closes A2) — DECISION GATE

**Do not start this phase without an explicit answer to:** should the 7 accessory rows stay
"automatic — newest N products tagged X" (current live behavior, works today), or should they
become curated-by-reference like every other homepage section?

- **If automatic stays (minimal-change default, recommended):** delete the 3 unused schema
  fields (`accessoriesCables`, `accessoriesEarpads`, `accessoriesStorage`) from
  `homepageDataType.ts` so Sanity Studio stops presenting editable pickers that silently do
  nothing. No query/render changes needed — behavior is already correct, only the schema is
  wrong.
- **If curation is wanted instead:** larger scope, out of "minimal change" — would need 4 new
  schema fields (to cover interconnects/adapters/eartips/care-cleaning, which currently have
  no schema field at all), a query rewrite to dereference all 7, and a Studio content-entry
  pass to populate them. Treat as a separate follow-up initiative, not part of this
  gap-closure pass, if chosen.

This report defaults to recommending the first option (schema cleanup only) as the minimal,
professional fix, but does not execute it without confirmation — it is a content/merchandising
decision, not a pure defect.

---

## Phase 6 — Orphaned Components Decision (closes E2) — DECISION GATE, low priority

`brand-marquee/` and `shared-spotlight/` components are dead but harmless (no build/runtime
risk either way). Before touching them, confirm: keep for a planned future use (leave as-is,
or file a tracking issue) vs. delete (they were abandoned). Do not delete or wire up
speculatively — either action without a decision risks destroying planned work or shipping an
unreviewed, unapproved page change.

---

## Dependency Order (must respect)

```
Phase 0 (blocker)
   ↓
Phase 1 ──────────────┬──────────────┐
   ↓                  ↓              ↓
Phase 2            Phase 3        Phase 4
(independent after Phase 1; may run in any order relative to each other)

Phase 5 and Phase 6 — independent of 1–4, gated on decisions, can happen anytime after Phase 0.
```

Phases 2, 3, and 4 all depend on Phase 1 (they edit the relocated file), but not on each other —
they may be done in any order, or in parallel by splitting across sessions, once Phase 1 is
verified.

---

## Coverage Matrix (every gap mapped to exactly one phase)

| Gap ID | Gap | Phase |
|---|---|---|
| C1 | Undefined `spotlight3`/`newestRelease` (build-breaking) | 0 |
| A1 | Live GROQ in `app/`, not `sanity-cms/lib/` | 1 |
| E3 | Dead `stripePriceId` field | 1 |
| A3 | Hand-rolled types vs. typegen | 2 |
| E1 | 9 dead per-section fetcher files | 2 |
| G1 | Hardcoded catalogue slot IDs | 3 |
| B1 | Hero fields disconnected from CMS | 4 |
| A2 | Accessories schema/implementation mismatch | 5 (decision gate) |
| E2 | Orphaned components | 6 (decision gate) |
| D1 | (not a gap — no action) | — |

---

## Plan Self-Scan (gap-scan on this plan itself)

- **Every gap from the intelligence report is accounted for** — cross-checked against the
  Severity Roll-up table in `homepage-gaps-intelligence.md`; all 9 actionable IDs appear above
  exactly once, plus D1 explicitly marked "no action."
- **No phase silently expands scope:** each phase's steps were re-read against its single
  named gap; Phase 1's `stripePriceId` strip is the one deliberate exception, justified because
  it edits the same lines being relocated anyway (avoids a second unnecessary pass over
  identical code) — called out explicitly rather than smuggled in.
- **Over-complication check:** considered and rejected doing Phase 5 as an engineering-only
  decision (auto-picking "curated" or "automatic") — that would be scope creep into a content/
  product decision dressed as a code fix. Kept as a gate instead.
- **False-assumption check:** Phase 3's params-vs-interpolation note exists because a naive
  "just swap the string" edit would silently break (GROQ can't call a JS function inline) —
  caught before being handed to an executor as if it were a one-line change.
- **Dependency check:** verified Phases 2/3/4 all read/write the *same* relocated file from
  Phase 1, hence the explicit "depends on Phase 1, independent of each other" ordering, rather
  than assuming they're all fully parallel-safe from Phase 0.
