# Homepage — Gaps Intelligence Report

> **Scope:** Pure intelligence. Gaps between current homepage code (UX sections, GROQ
> fetch layer, Sanity schemas: `product`, `homepageData`, `hero`, `catalogueItem`) and
> 100% professional / internally-consistent level, per this project's **own** documented
> standards (`AGENTS.md`, `docs/examples/gold-standard.tsx`, `sang-logium-review` skill).
> No solutions, no phases, no tasks — that is the follow-up document
> (`homepage-gap-closure-plan.md`).
>
> **Method:** Direct read of live source + `git show HEAD` diff + generated
> `sanity.types.ts` (typegen ground truth) + static `data/catalogue-index.json`.
> Every gap below is anchored to a verified file/line. Live Sanity API calls were
> attempted and blocked — see Section F.

---

## 0. Verified Current Architecture (grounding)

| Section (in page order) | Render component | Data source | CMS document(s) |
|---|---|---|---|
| Hero | `hero/Hero.tsx` | `HERO_QUERY` in `app/lib/data/homepageBatch.ts` | `hero` (singleton, latest by `_updatedAt`) |
| Trust bar | `trust-bar/TrustBar.tsx` | none (static) | — |
| Featured (carousel) | `featured/Featured.tsx` | `HOMEPAGE_DATA_QUERY.featured` | `homepageData.featuredProducts[]` |
| Spotlight 1/2/3 | `product-spotlight-{1,2,3}/ProductSpotlight{N}.tsx` | `HOMEPAGE_DATA_QUERY.spotlight{N}` | `homepageData.spotlight{N}Data` |
| IEMs gallery | `iems-gallery/IemsGallery.tsx` | `HOMEPAGE_DATA_QUERY.iemsGallery` | `homepageData.iemsGallery[]` |
| Newest release | `newest-release/NewestRelease.tsx` | `HOMEPAGE_DATA_QUERY.newestRelease` | `homepageData.newestReleaseData` |
| DACs | `dacs/Dacs.tsx` | `HOMEPAGE_DATA_QUERY.dacs` | `homepageData.dacs[]` |
| Accessories (7 rows) | `accessories/Accessories.tsx` | 7 independent `*[_type=="product" && "<slotId>" in catalogueLocationKeys]` queries | **no** `homepageData` field consulted (see A2) |

**Data flow:** `app/(store)/page.tsx` → `fetchHomepageData()` → `fetchHomepageDataBatched()`
(`app/lib/data/homepageBatch.ts`) → 2 Sanity requests (hero + one batched object query for
everything else) → typed result handed to each section as props. This is a real, working
optimization (previously ~10 requests; migration note in `fetchHomepageData.ts`).

**Product identity fields actually used by homepage cards:** `_id`, `name`, `brand->{_id,name,slug}`,
`price_data.unit_amount`, `stock`, `slug.current`, `image.asset._id` (see D1 — this is correct,
not a bug). `catalogueLocationKeys` is the sole mechanism tying products to catalogue "slots"
(`catalogueItem` documents) — confirmed against `sanity-cms/schemaTypes/productType.ts` and
`sanity-cms/schemaTypes/catalogueItemType.ts`.

---

## A. Architecture / Convention Gaps (violate this project's own rules)

### A1 — Live homepage GROQ queries live in `app/`, not `sanity-cms/lib/` `[HIGH]`
- `HOMEPAGE_DATA_QUERY` and `HERO_QUERY` — the actual queries serving the homepage today —
  are defined in `app/lib/data/homepageBatch.ts:205,416`, i.e. inside `app/`.
- This project's own standard is explicit and appears in two independent places:
  `docs/examples/gold-standard.tsx` §3 ("GROQ queries in separate file... **NEVER** hardcode
  GROQ queries in components") and the `sang-logium-review` skill, Check A ("GROQ queries must
  not appear in `app/`... belong exclusively in `sanity-cms/lib/`").
- This is not a stylistic nit: it's a violation on the single highest-traffic query path in the
  app (every homepage visit, `revalidate = 3600`).

### A2 — Accessories section bypasses the `homepageData` schema entirely `[MEDIUM]`
- `sanity-cms/schemaTypes/homepageDataType.ts` defines curated **reference-array** fields for
  accessories: `accessoriesCables`, `accessoriesEarpads`, `accessoriesStorage` (lines 78–95) —
  same editorial pattern as `featuredProducts` / `dacs` / `iemsGallery` (marketer hand-picks
  specific products).
- The actual `HOMEPAGE_DATA_QUERY` (`homepageBatch.ts:321–409`) never dereferences any of those
  3 fields. Instead, **all 7** accessory rows (cables, interconnects, adapters, earpads, eartips,
  care-cleaning, storage) are independently computed as
  `*[_type=="product" && "<hardcoded slot id>" in catalogueLocationKeys] | order(_createdAt desc)`.
- Net effect: (a) 3 schema fields are dead — a Studio editor can populate
  `accessoriesCables`/`accessoriesEarpads`/`accessoriesStorage` and it will have **zero** effect
  on the live site; (b) there is no schema field at all for the other 4 accessory rows even
  though they render live; (c) **none** of the 7 accessory rows are curatable — they are all
  "last N products tagged X," in contrast to every other homepage section, which is
  hand-curated by reference. The merchandising model is inconsistent within a single page.

### A3 — Duplicate, hand-rolled types instead of Sanity typegen `[MEDIUM]`
- `gold-standard.tsx` §8: "Use Typegen outputs as source of truth... **NEVER** manually define
  types that conflict with Sanity types."
- `homepageBatch.ts` hand-declares 8 interfaces (`FeaturedProduct`, `SpotlightProduct`,
  `SpotlightData`, `IemProduct`, `NewestReleaseData`, `DacProduct`, `AccessoryProduct`,
  `HeroData`) rather than importing from `sanity.types.ts`.
- Confirmed the generated ground truth already exists and is current:
  `sanity.types.ts:586` (`HOMEPAGE_DATA_QUERYResult`) was typegen'd directly from this exact
  query, but is not imported anywhere. Two shadow type systems for the same data, already
  measurably diverging (see A5).

---

## B. CMS ↔ Render Coherence Gaps (schema says one thing, screen shows another)

### B1 — Hero: 2 of 3 editorial copy/link fields never reach the page `[HIGH]`
Verified end-to-end for all three fields:

| Field | Schema (`heroType.ts`) | Fetched by `HERO_QUERY`? | Rendered by `Hero.tsx`? |
|---|---|---|---|
| `subheadline` | required (line 18) | ✅ yes | ❌ **no** — line 104 hardcodes `"Hear the difference."` |
| `ctaText` | required (line 24) | ✅ yes | ❌ **no** — line 115 hardcodes `"DISCOVER"` |
| `ctaLink` | required (line 31) | ❌ **no** — query never selects it | line 55 reads `heroData.ctaLink`, always `undefined` → always falls back to hardcoded `/products/headphones` |

- Sanity Studio requires an editor to fill in all three fields (`Rule.required()`), implying
  they are meant to be editable. In production, changing any of them via the CMS has **no
  visible effect** — only `headline` and the two background images actually reach the page.
- This is isolated to Hero: spot-checked `NewestRelease.tsx` and `ProductSpotlight{1,2,3}.tsx`
  — all four **do** render their `promoTitle`/`promoSubtitle`/`promoText` from CMS data, so this
  is not a repo-wide pattern, just a Hero-specific regression/oversight.

---

## C. Confirmed Defect in Current Working Tree (not yet committed)

### C1 — `app/lib/data/homepageBatch.ts` currently references undefined variables `[CRITICAL]`
- The **on-disk, uncommitted** version of `fetchHomepageSections()` returns an object literal
  using shorthand properties `spotlight3` (line 591) and `newestRelease` (line 593) — but no
  `const spotlight3 = ...` / `const newestRelease = ...` exists anywhere in that function scope
  in the current file.
- Confirmed by diffing against the last commit: `git show HEAD:app/lib/data/homepageBatch.ts`
  **does** contain the missing lines (committed version, lines 508–509):
  ```
  const spotlight3 = processSpotlightData(rawData.spotlight3 ?? null);
  const newestRelease = processNewestReleaseData(rawData.newestRelease ?? null);
  ```
  These two lines are absent from the working-tree version. `git diff --stat` shows this file
  has an **uncommitted** rewrite in progress (666 insertions / 581 deletions vs. `HEAD`,
  last commit `a913520` 2026-07-01; current `HEAD` is `81bf8b2d` 2026-07-17).
- Given `next.config.ts:11` sets `typescript: { ignoreBuildErrors: false }`, this should fail
  `tsc`/`next build` (`TS2304: Cannot find name`) in its current state. This looks like an
  interrupted in-progress edit (matches the "S9-TTFB-OPTIMIZATION" batching migration
  referenced in `fetchHomepageData.ts`'s comments), not a finished, working file.
- **Blast radius:** Product Spotlight 3 and Newest Release sections — both would either break
  the build or (if bypassed) silently return `undefined`/crash at runtime.
- **This should be resolved first, before anything else in this report** — it blocks verifying
  whether anything else on the homepage currently even builds.

---

## D. Verified — NOT a gap (false positive avoided)

### D1 — `image.asset._id` used as `<Image src>`, not `image.asset.url`
- Every product card (`Featured`, `IemCard`, `DacCard`, `AccessoryCard`, both spotlight
  components, `NewestRelease`) passes the raw Sanity asset ref/`_id` as the Next.js `<Image src>`,
  not the resolved `url`.
- Initially looks like a bug. **Confirmed correct**: `next.config.ts:36-38` sets a **custom**
  image loader (`images.loader: "custom"`, `loaderFile: "./lib/utils/sanityImageLoader.ts"`),
  and that loader (`lib/utils/sanityImageLoader.ts:19-25`) explicitly expects a raw Sanity asset
  ref/id and builds the CDN URL itself via `@sanity/image-url`.
- Residual, trivial-severity note: `url` is fetched alongside `_id` in every query and is
  effectively unused dead weight for these specific renders (not wrong, just minor over-fetch).

---

## E. Dead Code (confirmed unreachable)

### E1 — 9 files re-implement per-section GROQ fetchers that nothing calls `[MEDIUM]`
`featured/getFeaturedProducts.ts`, `dacs/getDacProducts.ts`, `iems-gallery/getIemProducts.ts`,
`accessories/getAccessoryProducts.ts`, `product-spotlight-{1,2,3}/getSpotlight{N}Data.ts`,
`newest-release/getNewestRelease.ts` (8 files, under `app/`) plus
`sanity-cms/lib/hero/getHeroData.ts` (1 file, correctly located under `sanity-cms/lib/` but
still dead).
- Each contains its own raw GROQ string (the 8 under `app/` independently violate A1) and its
  own exported fetch function (`getFeaturedProducts`, `getDacProducts`, etc.).
- Confirmed dead at runtime: every homepage render component imports **only the TypeScript type**
  from these files (e.g. `import { FeaturedProduct } from "./getFeaturedProducts"`), never the
  function — except `Accessories.tsx`, which imports `getAccessoryProducts` **only** for
  `ReturnType<typeof getAccessoryProducts>` (a type-level use), never calls it.
  `getHeroData` has zero importers anywhere.
- Real data arrives exclusively through `homepageBatch.ts`. These 9 files are pre-migration
  leftovers: dead GROQ, dead fetch logic, alive-and-load-bearing type exports (for the 8 under
  `app/`).

### E2 — Two fully orphaned homepage components `[LOW]`
- `homepage/brand-marquee/{BrandMarquee.tsx,types.ts}` and
  `homepage/shared-spotlight/{SpotlightHero.tsx,SpotlightDetails.tsx}`.
- Confirmed via repo-wide search: each is referenced only inside its own file — zero importers,
  not wired into `app/(store)/page.tsx` or anywhere else.
- `shared-spotlight`'s naming implies it was meant to be the common base for the 3 spotlight
  components; it isn't used by any of them (not fully diffed against one another — flagged as
  an observation, not a fully audited three-way comparison).

### E3 — `stripePriceId` queried on every homepage product, does not exist on the schema `[LOW]`
- `sanity-cms/schemaTypes/productType.ts` has no `stripePriceId` field (confirmed against the
  full field list: name, slug, brand, price_data, stock, parcel, reservedStock, sku, image,
  gallery, catalogueLocationKeys, displayPriority, overviewFields, specifications).
- Confirmed dead via typegen ground truth: `sanity.types.ts` types `stripePriceId` as literal
  `null` in all 9 places it's queried (every homepage product projection). Harmless (nothing
  reads it) but signals stale, likely pre-PaymentIntents-migration cruft.

---

## F. Verification Limitations (environment, not a code gap)

- Live Sanity API access (`api.sanity.io`) is **blocked** from this analysis sandbox
  (`curl https://api.sanity.io` → `403` from an intermediate proxy). This mirrors an identical
  `ENOTFOUND` failure already present in this repo's own historical `build.log` when a prior
  build attempted to reach Sanity.
- Consequence: the **actual population state** of the live `homepageData` singleton (e.g.
  whether `spotlight3Data` / `dacs` / all 7 accessory tags currently have real matching
  products) could not be verified from here. Everything in this report is verified at the
  source/schema/typegen level, which is necessary but not sufficient — a from an environment
  with real network access (Studio, or Devin's own environment) should confirm actual document
  population as the very first sanity check, before any code change.
- `data/catalogue-index.json` (a static, pre-built, locally-committed snapshot of the catalogue
  VFS) **was** usable without network access, and was used to confirm all 8 hardcoded accessory
  slot IDs currently resolve to real, expected slugs (see G1) — this is not a live-CMS
  substitute, but it is real, current, and unambiguous for its own scope.

---

## G. Lower-Priority / Fragility Notes

### G1 — Accessories slot IDs are hardcoded magic strings, duplicated across 2 files `[LOW]`
- `homepageBatch.ts` and the dead `getAccessoryProducts.ts` both hardcode the same 8 raw
  catalogue slot IDs (e.g. `"vnrj2n32p172vcje1tt3s4ls"`) instead of resolving them via the
  existing `resolveSlugToId(slug)` VFS helper (`data/catalogue.ts`, documented in
  `docs/post-homepage-product-discovery/catalogue-architecture.md`).
- Verified against `data/catalogue-index.json`: all 8 IDs currently resolve correctly
  (`headphone-cables`, `interconnects`, `adapters`, `earpads`, `eartips`, `care-cleaning`,
  `headphone-stands`, `carrying-cases`) — **this is not a live bug today.**
- It is a fragility/maintainability gap: the VFS index is described as rebuilt at deploy time;
  if slot IDs ever regenerate, these 8 magic strings (in 2 places) would silently stop matching
  with no compile-time signal.
- Note: `catalogue-architecture.md` already tracks "Homepage VFS integration (currently
  hardcoded)" as a known, intentional gap — hardcoding *categories* on the homepage is not
  itself flagged here as wrong (marketing homepages are conventionally curated, not
  dynamically catalogue-driven). Only the raw-ID-vs-named-slug fragility is flagged.

---

## H. Severity Roll-up

| ID | Gap | Severity |
|---|---|---|
| C1 | Working tree references undefined `spotlight3`/`newestRelease` (uncommitted regression) | **CRITICAL** |
| A1 | Live homepage GROQ lives in `app/`, not `sanity-cms/lib/` | HIGH |
| B1 | Hero `subheadline`/`ctaText`/`ctaLink` disconnected from CMS | HIGH |
| A2 | Accessories bypasses `homepageData` schema; inconsistent curation model | MEDIUM |
| A3 | Hand-rolled types duplicate available Sanity typegen output | MEDIUM |
| E1 | 8 dead per-section GROQ/fetch files (also independently violate A1) | MEDIUM |
| E2 | 2 orphaned homepage components (`brand-marquee`, `shared-spotlight`) | LOW |
| E3 | `stripePriceId` queried, absent from schema, always `null` | LOW |
| G1 | Accessories slot IDs hardcoded/duplicated instead of `resolveSlugToId()` | LOW |
| D1 | `_id`-as-`src` pattern | **not a gap** (verified correct) |

---

## I. Scope Boundary (deliberately excluded)

- Product detail page, `/products` catalogue listing pages, search, basket — out of scope
  (this report is homepage-only, per the request).
- Visual/design QA (spacing, responsive breakpoints, animation performance) — not assessed;
  this report is data/architecture/CMS-coherence only.
- `sanity-cms/lib/hero/getHeroData.ts` exists as a **third**, independent hero-fetching
  implementation. Checked: it has zero external callers (repo-wide search finds it referenced
  only in its own file) — confirmed dead, same as E1. Worth noting as a small irony: this is
  the one hero fetcher that actually lives in the *correct* location per A1's rule, and it's
  the one nothing calls; the live one (`HERO_QUERY` in `homepageBatch.ts`) is the rule violator.
  Folded into E1's dead-code count, not a separate severity line.

---

## J. Coverage Statement (gap-scan DoD)

- Every homepage section in `page.tsx` traced to its render component, its data prop, its
  fetch function, its GROQ query, and its backing Sanity schema field(s): Hero, Trust Bar,
  Featured, Spotlight 1/2/3, IEMs Gallery, Newest Release, DACs, Accessories (7 rows) — 8
  distinct data-bearing sections, all covered.
- Every finding above is anchored to a specific file/line, a `git show`/`git diff` comparison,
  or a typegen-derived ground truth (`sanity.types.ts`) — no fabricated APIs, no
  inferred-but-unverified claims.
- False-positive guard exercised and documented explicitly (Section D) — the most
  suspicious-looking pattern (`_id` as image `src`) was checked against `next.config.ts` and
  the custom loader before being ruled out.
- Known omission, stated plainly: live CMS document population state (Section F) — blocked by
  sandbox network policy, not skipped by choice.
