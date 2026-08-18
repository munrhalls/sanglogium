# DELETE-LIST — agent/artefact cleanup (review only, NOT deleted yet)

**Purpose:** remove the FAT from the last 2 days of parallel-agent work (16–18 Aug 2026).
**Status: EXECUTED 18 Aug** — user approved deletion of everything except `.devin/workflows/`,
`scripts/.clinerules`, and section H. All approved items are DELETED unless marked "pending".

Legend: `DELETE` = safe to delete · `ARCHIVE` = keep a copy elsewhere first · `REVIEW` = check before deciding

---

## A. Root scratch files dumped by agents — 16 Aug (violate AGENTS.md "no scratch in root") — `DELETE`

probe-*.mjs / probe-*.cjs: `probe-dom2.cjs`, `probe-dom.cjs`, `probe-h2.mjs`, `probe-css3.mjs`,
`probe-css2.mjs`, `probe-css.mjs`, `probe-home.mjs`, `probe-home.cjs`
probe/verify/err text: `probe-out.txt`, `probe-err.txt`, `verify-out.txt`
err-*.txt: `err-narrow.txt`, `err-mobile.txt`, `err-touch.txt`, `err-tablet.txt`, `err-desktop.txt`
out-*.txt: `out-narrow.txt`, `out-mobile.txt`, `out-touch.txt`, `out-tablet.txt`, `out-desktop.txt`
task outputs: `tmp-home.html` (3 MB), `temp-verify-fix.cjs`, `check-final-output.txt`,
`placeholder-count-output.txt`, `check-v3-output.txt`, `check-v2-output.txt`, `dump-accessories-output.txt`
JSON scratch: `broken-botched-patch-list.json`, `broken-botched-combined.json`,
`audio-electronics-image-analysis.json`, `broken-audio-electronics-main-images.json`,
`accessories-image-analysis.json`, `broken-accessories-main-images.json`,
`accessories-all-checked.json`, `accessories-page-info.json`
md scratch: `HANDOFF-audio-electronics-images.md`, `homepage-ux-audit.md`, `overview-audit.md`

## B. `.logs/` folder — 40+ files from the 16 Aug image tasks — `DELETE` (whole folder)

`dev-fresh.*.log`, `dev-server-restart.*.log`, `detect-audio-v3.*.log`, `inspect-audio-v3.*.log`,
`shot-audio-v3.*.log`, `eager-audio.*.log`, `netcap-audio.*.log`, `fetch-combined.*.log`,
`fetch-mapped.*.log`, `find-miss.*.log`, `probe-miss.*.log`, `straggler-search.*.log`,
`verify-img-load.*.log`, `ts-check-audit.txt`, `hero-verify-server.log`, `hero-verify-home.html`,
`audio-electronics-page.png`, `audio-electronics-image-file-analysis.json`,
`identify-accessories.json`, `identify-audio-electronics.json`, `identify-headphones.json`,
`miss-catalog-matches.json`, `probe-miss-hits.json`, `straggler-search.json`

## C. One-off image-task folders — ~450 MB total — `DELETE` (confirm no in-flight image task first)

| Folder | Size |
|---|---|
| uniformizing-product-images-edge-to-content-dimensions | 313 MB / 922 files |
| normalize-accessories-images | 99 MB / 209 files |
| normalize-just-two-images | 16 MB / 46 files |
| fixing-botched-product-images | 15 MB / 73 files |
| temp-spotlight-images | 7 MB / 12 files |
| audit-out | 3 MB / 13 files |
| image-task | 151 KB / 1 file |
| fixing-bad-product-main-images | empty (0 files) |

## D. One-off task scripts in `scripts/` — 15–16 Aug image-tooling — `DELETE`

`build-patch-list.mjs`, `patch-broken-accessories-main-images.mjs`, `verify-replacement-images.mjs`,
`fetch-mapped-images.mjs`, `search-stragglers.mjs`, `find-miss-catalog-matches.mjs`,
`probe-miss-sources.mjs`, `build-combined-botched-list.mjs`, `fetch-replacement-images.mjs`,
`eager-audio-electronics.mjs`, `netcap-audio-electronics.mjs`, `verify-audio-electronics-image-load.mjs`,
`screenshot-audio-electronics.mjs`, `inspect-audio-electronics-images.mjs`,
`check-audio-electronics-broken-v3.mjs`, `check-audio-electronics-broken-v2.mjs`,
`check-audio-electronics-broken-images.mjs`, `check-accessories-broken-images-final.mjs`,
`check-accessories-broken-images-v3.mjs`, `check-accessories-broken-images-v2.mjs`,
`check-accessories-broken-images.mjs`, `dump-accessories-dom.mjs`, `count-accessories-placeholders.mjs`,
`search-replacement-images.mjs`, `verify-patched-product-images.mjs`, `patch-botched-product-images.mjs`,
`fetch-product-main-image.mjs`, `identify-botched-product-images.mjs`
JSON results: `replacement-image-candidates.json`, `replacement-images-combined-result.json`,
`replacement-images-mapped-result.json`, `replacement-images-patched-result.json`,
`replacement-images-result.json`

## E. Redundant / risky agent-ops tooling — mixed

`DELETE`: `lean.ps1`, `lean-now.ps1`, `lean-now.cmd`, `watchdog.ps1` (continuous logging),
`scripts/agent-ops/logs/lean-now-*.log` (4 files), `scripts/agent-ops/logs/ram-log-20260817-114325.csv`
`ARCHIVE`: `scripts/agent-ops/logs/ram-log.csv` (crash evidence — copy elsewhere before deleting)
`REVIEW`: `bloat.ps1` (did the registry renames), `setup-elevated.ps1` (Defender exclusions / power plan),
`start-session.ps1` + `end-session.ps1` (overlap), `backup/*.reg` (keep until startup state finalised)

## F. System-state cleanup candidates — `REVIEW` (needs your confirm, careful)

- The 13 `_OFF_*` HKCU/HKLM startup entries created by bloat.ps1 (registry values, not files).
  E.g. `_OFF_OneDrive` (app uninstalled — entry is now dead), `_OFF_Teams` (duplicate of active
  `Teams` entry), `_OFF_electron.app.Loom`, etc.
- **Loom** running in background: present in top-5 RAM consumers in 548/669 snapshots (~1 GB).
  Candidate to quit/disable — biggest single non-agent win for lag.

## G. Agent config/docs leftovers — `REVIEW`

- `scripts/.clinerules` (2 KB, 16 Aug) — check overlap with AGENTS.md
- `.cline/kanban` (empty directory)
- `docs/kanban-cline-cli-guide.md` (untracked) — possibly useful, keep?
- `scripts/dev.ps1` (untracked, 18 Aug) — dev launcher, honours shared-server rule — KEEP?
- `.vscode/settings.json` — **KEEP** (harmless watcher excludes, reduces RAM use)
- `.devin/workflows/` (~80 workflow md files, many from Mar–Jun) — your discipline knowledge base;
  REVIEW/prune old ones, do not bulk-delete
- `.beads/`, `_project/`, `research/` — project knowledge; do not auto-delete

## H. Rule/process bottlenecks (suggestions — no deletion)

- AGENTS.md: keep the core protections (Wispr Flow, one server/browser, no npm install, no concurrent
  heavy tools). Consider dropping ceremony that slows small steps (e.g. "prefer next build+start").
- Replace the 5 overlapping "lean/bloat/start/end" scripts with ONE entry-point script.

---

**Executed 18 Aug:** A, B, C, D, E (incl. backup regs), F-HKCU entries (12 removed),
G except devin-workflows + `.clinerules` + `.vscode/settings.json`.

**Round 2 executed 18 Aug:** `scripts/output/photography-audit/` (91 MB / 886 files),
root temp/scratch (`.tmp_wss_*`, `botched-headphones.json`, `screenshot.png`, `build-list.cjs`,
`force-patch.cjs`, `normalize.cjs`, `run.cjs`, `screenshot-sections.cjs`, `upload-pi7s2.js`,
`verify-patch.cjs`), old leftovers (`tsconfig.tsbuildinfo`, `build.log`, `next-build.log`,
`package.json.cache-poisoned`, `.sync-test.txt`, `cookie_jar.txt`, `watchdog-ls.ps1`).

**Kept (deliberate):** `.devin/workflows/` (user), `scripts/.clinerules` (user), H untouched
(user), `scripts/agent-ops/{build-lock,config,resource-health,services}.ps1` (LEAN core
referenced by AGENTS.md), `scripts/cline-agent-helpers.ps1`, `.vscode/settings.json`,
remaining one-off product scripts in `scripts/`.

**Deleted earlier:** `agent-ops-resmon` scheduled task, `resmon.ps1`, `resmon.cmd`.

**Pending (needs elevated PowerShell):** HKLM `_OFF_KeePass 2 PreLoad`, `_OFF_Riot Vanguard`.
Loom was not running at cleanup time — no action needed.
