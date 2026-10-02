# Product Photography Fill Ratio — Audit Script Execution Plan

> **Executor-agnostic.** Hand this file to Devin (cloud session, direct-push flow — see
> `_project/devin-cloud-optimization-plan.md`, this repo does not use PR-gated delivery) or to a
> fresh Claude Sonnet 5 session. It is self-contained — do not pull in prior chat/session context
> to run it.
>
> **Source:** homepage UX audit (`docs/homepage-ux-audit-2026-08-05.md`, "Product Photography
> Consistency" scored 3/10 — lowest metric, recommendation #1) plus a gaps-scan/gaps-close pass
> done before this plan was written. That pass **rejected** the original approach (patch Sanity's
> `crop`/`hotspot` metadata directly) — see "Why this scope, not the obvious one" below before
> changing anything here.

---

## One-line objective

Produce a reviewable report of proposed fill-ratio fixes for product images — **zero writes to
Sanity, zero app-code changes, fully reversible by construction.** A human reviews the report
afterward; applying accepted fixes is a separate, later task, not this one.

## Definition of done (must be true when this session ends, unattended)

- One script exists, runs standalone, needs no new dependencies beyond what's already installed.
- It has processed every product's primary image (or checkpointed partway with a clear "N of M"
  status if it ran out of time) and produced one report file plus one preview image per product.
- Nothing was written to Sanity. No component/`.tsx` file was touched. No `className` was edited.
- If it failed outright, the failure is captured in a log, not a silent partial file.

---

## Why this scope, not the obvious one (read before deviating)

The intuitive fix — detect each product's bounding box, patch Sanity's `crop`/`hotspot` fields —
was scoped out for two confirmed, code-level reasons. Don't rediscover these; trust them:

1. **`@sanity/image-url` only applies `crop`/`hotspot` when the builder receives the full image
   object (not a bare `_ref`) *and* both `width` and `height` are requested together.** Confirmed:
   `lib/utils/sanityImageLoader.ts` currently takes `{ src: string, width, quality }` — a bare ref,
   no height, ever. Most product-image components (`ProductImage.tsx`, `GridMediaBox.tsx`,
   `CardMedia.tsx`, etc.) render via Next's `<Image fill />`, which never passes an explicit
   height to a custom loader. Making Sanity crop actually change what renders would mean
   reworking how each of ~18 components requests image dimensions — a layout change, not a data
   patch, and exactly the class of edit (`h-`/`aspect-`/sizing) this repo's mandatory
   height/sizing review gate exists for, per the real regression on `ProductSpotlight1/2/3`
   documented in `docs/vertical-space-lg-touch.md`. Not something to do unattended, in bulk,
   across 18 files, in one overnight pass.
2. **No product asset currently has `crop`/`hotspot` set at all** (confirmed empty across
   `sanity-cms/backups/backup_products_latest.json`), and Sanity's free fallback (`crop=entropy`)
   only fires when the *requested* aspect ratio differs from the source image's own aspect ratio —
   it cannot tighten a frame that already matches the target box shape, which is the actual failure
   mode here (loose, inconsistent internal whitespace, not wrong aspect ratio).

Given that, the safer and still genuinely useful unattended task is: **compute what a tighter,
re-cropped source image would look like, and show it — without touching the live site or its
data.** That's this plan. Applying it (destructive re-crop + re-upload + swap `_ref`, or the
render-pipeline rework above) is a deliberate follow-up task after a human looks at the output.

---

## Hard limits (carried over from `CLAUDE.md` — do not violate)

- No `npm install`. The script must run on what's already in `package.json` — `sharp` is already
  a dependency (confirmed), use it. Do not add a background-removal/ML dependency to hit this
  target; that's out of scope for this task (see "Explicitly out of scope" below).
- No `npm run build`, `lint`, `ts-check`, or dev server. This is a standalone Node script run
  directly (`node scripts/...mjs`); verify it by reading the code and checking its own log/report
  output, not by compiling the whole project.
- No GitHub / PR flow. If anything is committed (the script itself, not its output), use the
  normal direct `git push` this repo already uses for everything.
- Circuit breaker: if any single step (a download, a file write) fails or hangs twice in a row on
  the *same* item, log it as a per-item failure and move to the next item — don't retry a third
  variation, and don't let one bad image stall the whole run.

## Credentials — none needed

Enumerating products and downloading their images needs **no secret token.** Use the existing
read-only `client` from `sanity-cms/lib/client.ts` (CDN-backed, no token — the same access level
already used to render the live storefront to anonymous visitors) and its `urlFor()` helper for
building image download URLs. Do not import `backendClient` or reference
`SANITY_STUDIO_READ_WRITE` anywhere in this task — there are no writes, so there's nothing to
authenticate.

---

## Environment note (confirmed 2026-08-05)

The Cowork sandbox used to validate this plan **cannot resolve any `*.sanity.io` hostname**
(`cdn`, `api`, `apicdn`, and the project subdomain all fail DNS lookup — confirmed, not assumed).
This means the actual download-real-images step cannot run from that sandbox; it needs an
environment with normal outbound internet access (a Devin cloud session, or any machine that can
already load the live storefront). Nothing about the script itself requires anything unusual —
this is a sandbox-specific network allowlist gap, not a design constraint. Confirm outbound HTTPS
to `*.sanity.io` works with a plain `curl -I https://cdn.sanity.io` (or equivalent) before
starting the main run; if that fails, stop and report rather than proceeding with a script that
can't reach its own data source.

## Pre-flight (do once, before the main run)

1. Query the product count via `client` (a one-line GROQ count query — put it inline in the
   script per the existing convention for one-off scripts, e.g. `scripts/delete-two-products.mjs`;
   this is a `scripts/` file, not `app/`, so the GROQ-only-in-`sanity-cms/lib/` rule that applies
   to `app/` doesn't block an inline query here).
2. Log the count and a rough ETA (time a single image end-to-end, multiply). If it looks like it
   won't finish in a normal unattended window, that's fine — proceed anyway, checkpoint, and
   report partial completion honestly. Don't silently truncate.
3. **Fail-fast gate:** process the first 10 products only, first. If the script crashes, or every
   one of the 10 produces a degenerate result (confidence near-zero, or the "trim" box is ~0% or
   ~100% of the source for all 10 — a sign the heuristic itself is broken, not that 10 images
   happen to be hard), stop and report the failure instead of grinding through the full catalogue
   on a broken detector. If the 10 look reasonable, continue to the rest.

---

## Task 1 — Build `scripts/photography-fill-ratio-audit.mjs`

**Inputs:** every product's primary/hero image (the field `ProductImage.tsx` reads —
`image.asset`).

**Per image, using `sharp` only:**

1. Download the source image (via `urlFor()` from `sanity-cms/lib/client.ts`).
2. Use `sharp()`'s built-in `.trim()` (strips borders near-uniform to a background color, within
   a threshold) to get the tight product bounding box. Don't hand-roll a custom background-
   uniformity pre-check on top of it — validated (see below) that a hand-rolled corner-sampling
   check via `.extract().stats()` is redundant *and* was unreliable in the sandboxed `sharp`
   install used to validate this plan (returned identical stats for every corner regardless of
   `left`/`top` — a real, reproducible chaining bug in that environment, not a logic error).
   `.trim()`'s own output already carries the signal needed; don't add a second, riskier
   detection path on top of it.
3. **Confidence score (concrete and inspectable, not a black box):** compute
   `frameFrac = max(trimmedWidth / originalWidth, trimmedHeight / originalHeight)`. High
   confidence when `frameFrac` is roughly 15%–98% of the original frame (not ~0%, not ~100% —
   both ends indicate `.trim()` couldn't find a sane boundary, e.g. a busy/non-plain background
   or a photo that's already edge-to-edge). Anything outside that range is
   `needs-review: degenerate-trim`. Store the actual `frameFrac` number in the report, not just
   the pass/fail label, so the threshold is tunable later without rerunning the whole batch.

   **Validated 2026-08-05** against three synthetic adversarial cases (plain-background product
   at 30% fill, at 85% fill, and a product on a noisy/busy background) — the 30%/85% cases
   produced correct, distinct `frameFrac` values and a correctly recomposited preview onto
   `#FAEEE6`; the busy-background case was correctly rejected as `degenerate-trim` with no output
   written. Real product photos weren't reachable from the validation sandbox (see below) — this
   confirms the transform logic is sound, not that it's bulletproof on real vendor photos.
5. Compute what padding/crop would bring the product to 70–80% fill of a square/target-ratio
   canvas (match the card aspect ratio already in use, e.g. `aspect-square` /`aspect-[4/3]` —
   check `ProductImage.tsx`'s consumers for which applies most commonly and use that as default).
6. Render a **local preview only** (a copy of the re-cropped/padded image, written to
   `scripts/output/photography-audit/<product-slug>.jpg` or similar) — do not upload anywhere.
7. Checkpoint after every image (append to the report file / write a `.progress` marker) so a
   crash or interruption resumes from where it left off, not from image 1.

**Output:** one report file (CSV or JSON, your choice — CSV is easier for a quick human skim) with
one row per product: slug/id, current measured fill ratio, proposed fill ratio, confidence
(high/low + the underlying numbers), path to the local preview image, and a `needs-review` reason
where applicable (`no-plain-background`, `degenerate-detection`, or blank if high-confidence).

Add `scripts/output/` to `.gitignore` if it isn't already covered — this run can produce hundreds
of preview JPEGs and they have no reason to be tracked in git.

**Verify:** the report file exists, row count matches the product count (or the checkpoint clearly
shows how many were processed before time ran out), and a handful of the preview images opened
manually actually look like tighter, sane crops — not corrupted or wildly wrong.

---

## Explicitly out of scope for this task (separate, future, human-gated tasks)

- Writing anything back to Sanity (crop/hotspot metadata, new assets, or `_ref` swaps).
- Any change to `app/components/**` — no render-pipeline rework, no className edits. (If you find
  yourself about to touch a `.tsx` file to make this work, stop — that's a sign you've drifted
  into the rejected approach above.)
- Any background-removal/ML model, cloud vision API, or new npm/pip dependency.
- Manual reshoot queues, Sanity Studio ingest gates, CI automation, or any of the other
  alternatives from the earlier brainstorm — this task is the audit step only.
- Reverting or modifying `IemCard.tsx`'s existing `object-contain` → `object-cover` change
  (already shipped, already reviewed, unrelated to this script — leave it alone).

## Acceptance criteria

- [ ] `scripts/photography-fill-ratio-audit.mjs` exists, uses only already-installed dependencies.
- [ ] Uses `sanity-cms/lib/client.ts`'s `client`/`urlFor` — no write token referenced anywhere.
- [ ] Fail-fast 10-image gate present before the full run.
- [ ] Checkpointing present — a second run after an interruption resumes rather than restarts.
- [ ] Report file produced with one row per processed product, including the raw confidence
      numbers (not just a label).
- [ ] Local preview image produced per processed product.
- [ ] Zero Sanity writes, zero `app/` edits — confirm with `git status` / `git diff` before
      calling this done: only `scripts/` (the new script) and its own output directory should
      show as changed.
- [ ] Final report to the user states processed/total count, count needing manual review and why,
      and where the preview images live.
