# Homepage — Devin Execution Plan

> **Source documents:** `homepage-gaps-intelligence.md` (what's wrong, evidence),
> `homepage-gap-closure-plan.md` (why this order, what's minimal). This document is the
> **only** one meant to be executed task-by-task. Do not re-derive the plan — follow it.

---

## ⚠️ Do This First — Blocker

`app/lib/data/homepageBatch.ts` currently doesn't type-check (uncommitted state references
undefined variables). Confirm this by **reading the file**, not by running a compiler:

Open `app/lib/data/homepageBatch.ts` and look inside `fetchHomepageSections()`, right before
the `return { ... }` at the end of the function. Confirm whether `const spotlight3 = ...` and
`const newestRelease = ...` are declared there.

If they're missing (and the return statement still references `spotlight3` / `newestRelease`
as shorthand properties), proceed to Task 0.1 immediately — no other homepage task is safe to
attempt until this is fixed, because you can't tell what else is broken while the file doesn't
compile.

**Do not run a whole-project `tsc --noEmit` / `npm run build` to check this.** See
`sang-logium-direct-access` skill — full/whole-project compiles are forbidden as a routine
check, for direct execution *and* for steps written into a task plan. A file read answers this
exact question for free.

---

## Architecture Invariants (do not break these while executing any task below)

- GROQ query strings belong only in `sanity-cms/lib/`. Never introduce a new one in `app/`.
- Component prop types should come from `sanity.types.ts` (typegen), not hand-written
  interfaces, once Task 2.x work begins.
- `next.config.ts` has `typescript: { ignoreBuildErrors: false }` — the project must type-check
  cleanly by the end of the plan (verified once, at the Final Gate). Never comment out or
  weaken this setting to "make a task pass." Checking this per-task via a fresh whole-project
  compile is itself forbidden (see Per-Task Loop) — use editor diagnostics instead until the
  Final Gate.
- Image `src` values for Sanity-hosted images are the raw asset ref/`_id`, **not** `.url` — this
  is correct in this codebase (custom loader in `lib/utils/sanityImageLoader.ts`). Do not "fix"
  this if you notice it; it is intentional.
- Revalidation for the homepage is `export const revalidate = 3600` in `app/(store)/page.tsx` —
  don't remove it.

---

## Environment Check (do this once, before Task 0.1)

- Determine your shell (PowerShell vs bash/sh) and OS **once**, up front. Every command later in
  this plan that touches a file path or background-process syntax must be translated to that
  shell — do not copy-paste a bash example verbatim into PowerShell or vice versa. This plan
  gives bash as the reference syntax; the PowerShell equivalent is noted inline wherever it
  differs.
- Determine whether a dev server is already running on the expected port (check the terminal /
  process list — don't guess). If none is running, start one **non-blocking** (background
  process, not a foregrounded `npm run dev` that occupies your only shell) before any task below
  that says "load the homepage." If starting it is not possible in your environment, skip the
  live-render verification steps and rely on editor/language-server diagnostics only — note this
  in your final report, don't loop trying to force a server to start.

## Circuit Breaker (applies to every task below)

If any single verification step (a command, a Studio page load, a grep, a file read) fails or
hangs twice in a row, **stop retrying it**. Report exactly what was tried and what happened, and
move on only if the task explicitly allows a skip; otherwise wait for human input. Never attempt
a third variation of the same stuck command — that pattern (small syntax tweak, retry, repeat) is
the single biggest source of wasted time in prior runs of this plan.

## Per-Task Loop (follow for every task below)

1. Read the task fully before touching any file.
2. Make only the change described — resist fixing anything else you notice; file it as a
   separate follow-up note instead (this plan is intentionally minimal-scope per task).
3. Check the file(s) you touched via your editor/language-server diagnostics (already running,
   incremental, free) or the already-running dev server's terminal output. **Do not shell out
   to a fresh whole-project `tsc --noEmit` or `npm run build` per task** — see
   `sang-logium-direct-access` skill: this is a forbidden expensive command whether run
   directly or written into a plan, and on a project this size it can hang for minutes with
   zero output, per incident on 2026-07-29.
4. If a check surfaces a problem, fix within the scope of the current task only. If you can't,
   stop and report — don't move to the next task with a known-broken file. (Also respect the
   Circuit Breaker above — don't retry the same fix more than twice.)
5. Mark the task done and move to the next one in order.
6. **Exactly one** full `npm run build` + typecheck happens for this whole plan — see "Final
   Gate" at the end, after Task 6. Not per-task, not per-file, not per-phase.

---

## Task 0.1 — Restore the two missing lines (CRITICAL, do first)

**File:** `app/lib/data/homepageBatch.ts`, inside `fetchHomepageSections()`.

Find this block:
```ts
    const spotlight1 = processSpotlightData(rawData.spotlight1 ?? null);
    const spotlight2 = processSpotlightData(rawData.spotlight2 ?? null);
    const accessories: AccessoryData = {
```

Change it to:
```ts
    const spotlight1 = processSpotlightData(rawData.spotlight1 ?? null);
    const spotlight2 = processSpotlightData(rawData.spotlight2 ?? null);
    const spotlight3 = processSpotlightData(rawData.spotlight3 ?? null);
    const newestRelease = processNewestReleaseData(rawData.newestRelease ?? null);
    const accessories: AccessoryData = {
```

**Verify:** editor/language-server shows no error on this file. Load the homepage locally
(dev server, already running — no fresh build needed) and confirm the "Newest Release" and
third product-spotlight sections render (not blank/crashed).

**Stop and report if:** the committed reference (`git show HEAD:app/lib/data/homepageBatch.ts`)
looks meaningfully different from what's described here — that would mean this file has moved
on since this plan was written, and the fix location needs re-confirming before applying it.

---

## Task 1.1 — Create the relocated query file

Create `sanity-cms/lib/homepage/getHomepageData.ts`. Move into it, verbatim, from
`app/lib/data/homepageBatch.ts`:
- `HOMEPAGE_DATA_QUERY`, `HERO_QUERY`
- `fetchHeroData`, `fetchHomepageSections`, `fetchHomepageDataBatched`
- `processSpotlightData`, `processSpotlightProduct`, `processNewestReleaseData`
- All the exported interfaces (`HeroData`, `FeaturedProduct`, `SpotlightProduct`,
  `SpotlightData`, `IemProduct`, `NewestReleaseData`, `DacProduct`, `AccessoryProduct`,
  `AccessoryData`, `HomepageData`)

This is a pure move in this task — same content, new file. Do not change any query text yet
(that's Task 1.2).

**Verify:** editor/language-server shows imports resolving cleanly in the new file (check
`sanityFetch` and `defineQuery` import paths are still correct relative to the new location).

## Task 1.2 — Strip the dead `stripePriceId` field

In the moved `HOMEPAGE_DATA_QUERY` (now in `sanity-cms/lib/homepage/getHomepageData.ts`),
remove every `stripePriceId,` line from every product projection (9 occurrences). Also remove
`stripePriceId` from each hand-written interface for now (it will be fully replaced in Phase 2
anyway).

**Verify:** editor/language-server shows no error on this file.

## Task 1.3 — Repoint the caller and delete the old file

In `app/(store)/lib/fetchHomepageData.ts`, change the import from
`@/app/lib/data/homepageBatch` to `@/sanity-cms/lib/homepage/getHomepageData`.

Before deleting `app/lib/data/homepageBatch.ts`, search for any other importer of it —
use `git grep`, not `grep -r`: it only scans tracked files (skips `node_modules`, `.next`,
build artifacts automatically) and returns in well under a second on a repo this size:
```bash
git grep -n "lib/data/homepageBatch" -- '*.ts' '*.tsx'
```
If `fetchHomepageData.ts` is the only match, delete `app/lib/data/homepageBatch.ts`. If there
are other matches, update them to the new path instead of deleting.

**Verify:** editor/language-server shows no error on the touched files. Load the homepage on
the already-running dev server — every section should look identical to before this task (this
phase changes location only, plus one dead field).

**Do not run `npm run typegen` as part of this task (or anywhere in this plan) unless a later
task turns out to be genuinely blocked without it.** `sanity.types.ts` will be slightly stale
after this task (still lists the now-removed `stripePriceId` field) — harmless, nothing reads
it. You (the project owner) already run `npm run typegen` yourself as part of normal workflow;
let that happen on its own schedule rather than triggering it inline here.

**Do not proceed past Task 1.3 with a known editor/type error on these files.** Tasks 2–4 all
edit files created here. (The one full `npm run build` for this entire plan happens once, at
the Final Gate after Task 6 — not here.)

---

## Task 2.x — Retire one dead fetcher file at a time

There are 9 files to process. Do them **one at a time**, verifying after each, in this order
(same order as intelligence-report Section E1):

1. `app/components/features/homepage/featured/getFeaturedProducts.ts`
2. `app/components/features/homepage/product-spotlight-1/getSpotlight1Data.ts`
3. `app/components/features/homepage/product-spotlight-2/getSpotlight2Data.ts`
4. `app/components/features/homepage/product-spotlight-3/getSpotlight3Data.ts`
5. `app/components/features/homepage/iems-gallery/getIemProducts.ts`
6. `app/components/features/homepage/newest-release/getNewestRelease.ts`
7. `app/components/features/homepage/dacs/getDacProducts.ts`
8. `app/components/features/homepage/accessories/getAccessoryProducts.ts`
9. `sanity-cms/lib/hero/getHeroData.ts`

**For each file (this is Task 2.N, repeat the pattern):**
1. Note the type name it currently exports (e.g. file 1 exports `FeaturedProduct`).
2. Find the matching slice of the typegen result in `sanity.types.ts`
   (`HOMEPAGE_DATA_QUERYResult`) — e.g. `HOMEPAGE_DATA_QUERYResult["featured"][number]`. This
   file is slightly stale by this point (still shows the removed `stripePriceId` field) — use
   it as-is; that's a harmless extra field, not worth regenerating typegen to fix mid-plan.
3. Replace the file's entire contents with a single re-exported type alias under the
   **original name**, sourced from that typegen slice. Delete the GROQ string and the fetch
   function entirely — nothing calls them (confirmed in the intelligence report; re-confirm
   yourself with `git grep -n "<functionName>"` before deleting, as a safety check — use `git
   grep`, not a plain recursive `grep`/`Select-String` over the whole tree, for the same
   node_modules/.next-skipping, sub-second-on-this-repo reason as Task 1.3).
4. `Accessories.tsx` is the one component that imports the *function*
   (`getAccessoryProducts`), only for `ReturnType<typeof getAccessoryProducts>`. When you
   retire file 8, update `Accessories.tsx`'s type reference to point at the typegen slice
   directly instead of `ReturnType<typeof ...>` (the function will no longer exist).
5. **Verify after each file:** check editor/language-server diagnostics on the file you just
   touched, and on the components that import its type (already listed in the intelligence
   report). Do **not** run a fresh whole-project `tsc --noEmit` 9 times in a row — that's the
   exact repeated-expensive-command pattern this project's `sang-logium-direct-access` skill
   forbids. If a break shows up, it's isolated to the file you just touched — fix there before
   moving to the next file.

Do not batch multiple files into one edit pass — this is explicitly a "one file, one commit-
sized change, one verification" loop, so a mistake in file 4 never gets buried under files 5–9.

---

## Task 3.1 — Replace hardcoded slot IDs with `resolveSlugToId()`

**File:** `sanity-cms/lib/homepage/getHomepageData.ts`, the 8 accessory sub-queries inside
`HOMEPAGE_DATA_QUERY` (the intelligence report's A2 section calls these "7 rows" while its G1
section lists 8 slot IDs — care-cleaning/storage/carrying-cases are 3 separate slot IDs under
that "7 rows" count. The 8-item list below is the authoritative one; don't stop to reconcile the
7-vs-8 wording, just use the 8 IDs).

**Do not open or read `data/catalogue.ts` or `data/catalogue-index.json` to verify this** — the
entire `data/` folder is excluded from file-read tools by `.codeiumignore` in this repo, so a
read attempt will error, not succeed; retrying it will not help. The function's contract is
already fully verified and documented (source: `catalogue-code-record.md:10235-10238`):
```ts
// export const resolveSlugToId = (slug: string): string | undefined => ...
```
Just import and call it per the steps below; treat the signature above as ground truth.

1. Import `resolveSlugToId` from `@/data/catalogue`.
2. At the top of `fetchHomepageSections()` (before the query runs), resolve the 8 slugs to IDs:
   ```ts
   const cablesId = resolveSlugToId("headphone-cables");
   const interconnectsId = resolveSlugToId("interconnects");
   const adaptersId = resolveSlugToId("adapters");
   const earpadsId = resolveSlugToId("earpads");
   const eartipsId = resolveSlugToId("eartips");
   const careCleaningId = resolveSlugToId("care-cleaning");
   const storageCasesId = resolveSlugToId("headphone-stands");
   const carryingCasesId = resolveSlugToId("carrying-cases");
   ```
3. Change the query's hardcoded string literals (e.g. `"vnrj2n32p172vcje1tt3s4ls" in
   catalogueLocationKeys`) to GROQ parameters (e.g. `$cablesId in catalogueLocationKeys`), and
   pass `{ cablesId, interconnectsId, ... }` as the `params` object in the `sanityFetch` call.
4. **Guard before verifying:** log or breakpoint-check that all 8 resolved IDs are non-`undefined`
   before wiring them into `params` — `resolveSlugToId` returns `string | undefined`, and a
   silent `undefined` param would make that one accessory row quietly return zero products
   instead of failing loudly. If any of the 8 comes back `undefined`, stop and report which slug
   — don't spend time debugging an empty accessory row later without knowing this is why.
5. **Verify:** the returned product sets for all 8 accessory rows are identical to what they
   were before this task (same products, same order) — this task changes *how the IDs are
   obtained*, not which products match.

---

## Task 4.1 — Hero: fetch `ctaLink`

**Pre-check before starting this task:** open Sanity Studio and look at the live `hero`
document's `subheadline` and `ctaText` values. If either is placeholder/lorem-ipsum-like text
that shouldn't go live, stop and report back before continuing — Task 4.2 will make this copy
visible on the site.

**Bound this pre-check** — Studio requires a login/session and can be slow or blocked in some
sandboxes (Section F of the intelligence report: live Sanity API access was blocked from the
analysis sandbox). Try once. If Studio doesn't load or isn't reachable within a normal page-load
wait, don't retry variations of the URL or wait indefinitely — stop this task, report "Studio
unreachable from this environment," and let a human confirm the copy instead. Do not treat this
pre-check as blocking for Task 4.1's actual code change (adding `ctaLink` to the query is safe
regardless); only Task 4.2's live-copy verification strictly needs it.

In `sanity-cms/lib/homepage/getHomepageData.ts`, add `ctaLink` to the `HERO_QUERY` projection
(alongside the existing `headline`, `subheadline`, `ctaText`). Add `ctaLink?: string` to the
`HeroData` interface if it isn't already typed there.

**Verify:** editor/language-server shows no error on this file.

## Task 4.2 — Hero: render CMS copy instead of hardcoded strings

**File:** `app/components/features/homepage/hero/Hero.tsx`.

Change:
```ts
<p className="type-hero-sub m-0 p-0">
  Hear the difference.
</p>
```
to:
```ts
<p className="type-hero-sub m-0 p-0">
  {heroData.subheadline || "Hear the difference."}
</p>
```

Change:
```tsx
{"DISCOVER"}
```
to:
```tsx
{heroData.ctaText || "DISCOVER"}
```

`ctaLink` already has the correct fallback pattern in this file (line with
`const ctaLink = heroData.ctaLink || "/products/headphones";`) — no change needed there beyond
Task 4.1 making real data reach it.

**Verify:** load the homepage; confirm hero subheadline/CTA text/CTA link match Studio content.
Change one of the three fields in Studio and confirm it updates on next revalidation without a
redeploy.

---

## Task 5 — Accessories schema cleanup — WAIT FOR HUMAN DECISION FIRST

Do not start until you've received an explicit answer to the question in
`homepage-gap-closure-plan.md` Phase 5 ("should accessories stay automatic-by-tag or become
curated-by-reference?").

**If the answer is "keep automatic" (the default recommendation):**
In `sanity-cms/schemaTypes/homepageDataType.ts`, delete the three unused fields:
`accessoriesCables`, `accessoriesEarpads`, `accessoriesStorage` (lines ~78–95). Nothing else
changes — the live query already ignores these fields. Verify Studio no longer shows these
(now-pointless) pickers on the Homepage document.

**If the answer is "add curation":** this is out of scope for this execution plan — it's a
larger, separate initiative (new schema fields for all 7 subcategories, query rewrite, content
entry). Do not attempt it as part of this task list; report back for a new, dedicated plan.

---

## Task 6 — Orphaned components — WAIT FOR HUMAN DECISION FIRST, low priority

Do not start until you've received an explicit keep-or-delete answer for
`brand-marquee/{BrandMarquee.tsx,types.ts}` and
`shared-spotlight/{SpotlightHero.tsx,SpotlightDetails.tsx}`. If "delete," remove the files and
confirm nothing imports them (already verified clean in the intelligence report, but re-check
before deleting, since time may have passed). If "keep," take no action beyond filing a
tracking note for whoever owns homepage design.

---

## Final Gate — the one and only full build/typecheck for this entire plan

Run this **once**, after every other task (0.1 through 6) is done — never before, never in
between. Use the log path `homepage-plan-build.log` in the **repo root** (not `/tmp` — that path
doesn't exist on Windows, and assuming it does is itself a stuck-risk: a redirect to a
non-existent directory fails immediately with no useful signal).

Pick the syntax matching the shell you identified in the Environment Check — do not guess or
copy the wrong one:

**bash/sh:**
```bash
npm run build > homepage-plan-build.log 2>&1 &
```

**PowerShell** (trailing `&` is not background syntax here — it is either a syntax error or a
no-op depending on position; use `Start-Process` instead):
```powershell
Start-Process -FilePath npm -ArgumentList "run","build" -RedirectStandardOutput homepage-plan-build.log -RedirectStandardError homepage-plan-build.err.log -NoNewWindow -PassThru
```

Either way: launch it in the background and set a generous timeout (this is a large project —
expect several minutes, not seconds). Go do something else; don't sit blocking on it. Check the
log file when it's done, or periodically with a non-blocking peek:
- bash: `tail -n 20 homepage-plan-build.log`
- PowerShell: `Get-Content homepage-plan-build.log -Tail 20`

Never pipe the live command itself through `head`/`Select-Object -First N`/`grep`/`Select-String`
expecting that to shorten the wait; it won't (build tools buffer all output until exit once
stdout isn't a terminal — the exact trap that caused a 5+ minute silent hang on 2026-07-29).
Per the Circuit Breaker rule above: if the log file shows no output and the process isn't
progressing after a generous wait, check the process is actually still alive once — don't
re-launch the build repeatedly hoping a second attempt behaves differently.

If it fails, the failure is now scoped to "something across this whole plan," which is an
acceptable, bounded, one-time cost — much cheaper than the 9+ full compiles the per-task
version of this plan would otherwise have triggered.

---

## Order Summary (for a fresh Devin session that needs the short version)

```
0.1 (blocker fix, verified by reading the file) → 1.1 → 1.2 → 1.3 (verify via editor + `git grep`) →
  2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9 (one file at a time, editor-verify each) →
  3.1 (verify identical results) →
  4.1 → 4.2 (content pre-check, then editor-verify) →
  5 (decision gate) → 6 (decision gate, low priority) →
  Final Gate (the one full `npm run build`, background, once)
```

Tasks 2.x, 3.1, and 4.x may be reordered relative to each other (all only depend on 1.3), but
none of them may run before 1.3, nothing may run before 0.1, and the Final Gate always runs
last, exactly once.
