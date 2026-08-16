# HANDOFF — audio-electronics broken-product-image detection

Date: 2026-08-16 · Repo: `C:\webdev\sang-logium` · Author: Cline (verified run)

## TL;DR

**Result: 0 broken main product images on `/products/audio-electronics` (100/100 products clean).**

This is a **verified** result, not a silent false-negative:

| Check | Method | Outcome |
|---|---|---|
| HTTP status | all 100 product image URLs fetched (8-concurrent, 20 s timeout) | 100/100 → 200 |
| File content | downloaded all 86 unique images, `sharp` pixel analysis (mean lum, row variance, band energy) | all real product photos (347 KB–3 MB, high variance); no uniform placeholder pattern |
| Placeholder asset | URL-hash match for the known accessories placeholder (`2c516bcf…`) | 0 hits |
| Missing image | `data-testid="product-image-placeholder"` in DOM | 0 hits |
| Browser decode | forced `loading="eager"` + re-request, waited 15 s | **100/100 decoded, 0 failed** |

The earlier `[]` from v1 was therefore *coincidentally* correct, but it could not be trusted:
`refBandCount` was null (no product on this page uses the known placeholder asset), so the pixel matcher never fired. The v3 run above is what makes the answer defensible.

## The hang problem — root cause, now fixed

1. **`waitUntil: "networkidle"` never resolves on this page.** The page has continuous network activity (web-vitals POSTs to `/api/analytics/vitals`, Sanity query streams, catalogue-index validation). `domcontentloaded` + explicit `waitForSelector` is the fix.
2. **Cold-start route compile exceeded the goto timeout.** First compile of `/products/[...slug]` took **124.4 s** (16 998 modules); v3's `goto` timeout is now **300 s**.
3. **Sequential HEAD checks with no timeout** could stall forever. v3 uses `AbortController` (20 s/request) and a concurrency pool of 8.

## Environment facts the next agent must know

- Dev server: `npm run dev` (Next.js 15.5.15, webpack). Cold boot ≈ 90 s; `/products/[...slug]` first compile ≈ 124 s.
- The page's images are `next/image` `fill` + `loading="lazy"` via `sanityImageLoader` (`sizes="(max-width:768px) 50vw, 25vw"` → browser fetches ~360 px-wide CDN variants → `naturalWidth≈359`).
- **In headless scans, only ~24–30 of 100 lazy images ever get requested** even with slow scrolling. This is native lazy-load behavior, NOT broken images (proven by the eager control: 100/100). Do not treat `naturalWidth=0` as "broken" on this page; use HTTP status + file analysis instead.
- Shell command cap in this environment is ~30 s per command → **run Playwright scripts in the background** (see commands below) and poll their log files.
- Never use `networkidle` on `localhost:3000`.

## Files created this session

| File | Purpose |
|---|---|
| `scripts/check-audio-electronics-broken-v3.mjs` | **Primary detector.** domcontentloaded, scroll passes, extracts cards, HTTP status pool (8 × 20 s), placeholder-asset + no-image checks. Writes `broken-audio-electronics-main-images.json` (same shape as accessories list) and `audio-electronics-image-analysis.json`. |
| `scripts/inspect-audio-electronics-images.mjs` | Diagnostic. Downloads each unique image, `sharp` pixel analysis; flags uniform/tiny/bandy files. |
| `scripts/verify-audio-electronics-image-load.mjs` | Diagnostic. Slow-scroll + counts decoded images. |
| `scripts/netcap-audio-electronics.mjs` | Diagnostic. Counts CDN requests during scroll. |
| `scripts/eager-audio-electronics.mjs` | **The control that proved images are fine.** Forces eager loading; expects 100/100. |
| `scripts/screenshot-audio-electronics.mjs` | Full-page screenshot to `.logs/audio-electronics-page.png`. |
| `HANDOFF-audio-electronics-images.md` | This document. |

## Outputs

- `broken-audio-electronics-main-images.json` → `[]` (0 broken)
- `audio-electronics-image-analysis.json` → 100 products, full detail
- `.logs/audio-electronics-image-file-analysis.json` → sharp file-level analysis (86 unique images)
- `.logs/*.log` → run logs · `.logs/img-inspect/` → downloaded image samples · `.logs/audio-electronics-page.png` → screenshot

## Commands

### Restart the dev server (if wedged / port 3000 unresponsive)

```powershell
cd C:\webdev\sang-logium
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force }
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run dev' -WorkingDirectory 'C:\webdev\sang-logium' `
  -RedirectStandardOutput '.logs\dev-fresh.out.log' -RedirectStandardError '.logs\dev-fresh.err.log' -WindowStyle Hidden
# poll until 'Ready' appears:
Get-Content '.logs\dev-fresh.out.log' -Tail 5
```

### Re-run detection (background + poll — do not run foreground)

```powershell
cd C:\webdev\sang-logium
Remove-Item '.logs\detect-audio-v3.out.log','.logs\detect-audio-v3.err.log' -ErrorAction SilentlyContinue
Start-Process -FilePath 'node.exe' -ArgumentList 'scripts/check-audio-electronics-broken-v3.mjs' `
  -WorkingDirectory 'C:\webdev\sang-logium' `
  -RedirectStandardOutput '.logs\detect-audio-v3.out.log' -RedirectStandardError '.logs\detect-audio-v3.err.log' -WindowStyle Hidden
Start-Sleep -Seconds 25
Get-Content '.logs\detect-audio-v3.out.log' -Tail 15   # repeat until "Saved N broken products…" appears
```

Note: `Start-Process` with `-RedirectStandard*` makes the *launching* PowerShell command hang until the child exits (the tool call will time out at 30 s) — **that is expected**; the child keeps running. Poll the log file in a separate short command.

### If a future run finds broken images (the proven fix pipeline)

The accessories workflow (already proven, 30 products fixed) is:

```powershell
# 1. detection already produced broken-audio-electronics-main-images.json
# 2. fetch replacement images from the Shopify JSON API (apos.audio handles map 1:1 to our slugs)
node scripts/fetch-replacement-images.mjs
# 3. patch Sanity (upload local image, set product.image) — run --dry-run first
node scripts/patch-broken-accessories-main-images.mjs --dry-run
node scripts/patch-broken-accessories-main-images.mjs
```

⚠️ **Hardcoded file names to fix first:** `scripts/fetch-replacement-images.mjs` and `scripts/patch-broken-accessories-main-images.mjs` both hardcode `broken-accessories-main-images.json` and their own output paths. If the audio-electronics broken list is ever non-empty, generalize these two scripts to take the broken-list file (and an output file) as CLI args before running them against `broken-audio-electronics-main-images.json`. Existing fetched images live in `fixing-botched-product-images/<slug>/<slug>.<ext>` (45 folders already).

### Resource guard

- Scripts here are already lean: 1 browser, concurrency 8, 20 s timeouts, browser closed before the HTTP phase.
- If PC resources get tight, the repo has process-tree suspend/resume helpers: `. "$PSScriptRoot\cline-agent-helpers.ps1"` (see `scripts/cline-agent-helpers.ps1`).
- The dev server holds ~3.4 GB RSS when idle; kill it when not needed.

## Gotchas / limitations

- `audio-electronics-image-analysis.json` is git-tracked and now modified; the diagnostic scripts (`inspect`, `netcap`, `verify`, `eager`, `screenshot`) are throwaway — keep or delete as you prefer.
- The v3 detector treats HTTP 2xx/3xx as OK and does NOT do pixel matching (it was useless here because the reference placeholder is absent from this page). If a new placeholder asset appears on this page, add its hash to `KNOWN_PLACEHOLDER_ASSET`.
- Sanity CDN serves 2048 px when asked; the browser usually requests the `sizes`-driven ~360 px variant — do not compare `naturalWidth` against the URL's `w=`.

