# Devin Task Plan — Beads Issue Cleanup

**Scope:** `.beads/` issue tracker only (via `bd` CLI). No application code changes.
**Tool required:** `bd` (beads CLI).

**Every command below was verified against beads' actual Go source** (`cmd/bd/*.go` on `github.com/gastownhall/beads`, not just its docs site, which was unreliable to fetch) — flag names, replace-vs-append semantics, and exit-code behavior are confirmed, not assumed. This removed two wrong/uncertain steps from an earlier draft of this plan (a bad `bd close` flag, and a runtime "check --help first" branch for `bd update --notes`) and cut one full redundant sync round-trip. What's left is meant to run top to bottom with no stops for investigation.

**Background/why:** `docs/beads-verification-report-2026-08-01.md` has the full audit reasoning. This file is the execution plan only.

---

## What this is

1. Delete 14 issues that are either off-topic (personal notes filed under the sang-logium prefix) or stale PM-evaluation checklists superseded by weeks of later code changes.
2. Correct 3 issues whose notes/description describe an earlier code state that's since changed again — not deleting these, just fixing stale claims in them.
3. Close 1 issue that's fully done but still sitting `in_progress`.
4. One sync at the end covers all of it — not one sync per step.

---

## Reference: Delete list (14 issues)

### Off-topic / not sang-logium code issues (6)
| ID | Title | Reason |
|---|---|---|
| `sang-logium-f35` | LinkedIn Article — Intelligence Container | Personal content-writing note |
| `sang-logium-ckw` | Wroclaw Dev Meetups | Personal networking research |
| `sang-logium-fr1` | AI cost-effective professional subscription choice | Personal tooling-purchase research |
| `sang-logium-c8i` | INTEL: WEB DEV JOB | Personal job-search research |
| `sang-logium-l93` | Beads Kanban | A separate standalone tool, not sang-logium app code |
| `sang-logium-47k` | Portfolio — Initial Ground Preparation | Duplicate of already-closed `sang-logium-egx`; explicitly a separate project |

### Stale PM-evaluation checklists (8)
| ID | Title | Evidence of drift |
|---|---|---|
| `sang-logium-mpx` | Address | Code touched 2026-07-10, 1 month after the 2026-06-10 eval |
| `sang-logium-3ez` | Shipping | Code touched 2026-07-09, 1 month after eval |
| `sang-logium-qc1` | Footer mobile UX redesign | `Footer.tsx` touched 2026-07-17, over a month after eval |
| `sang-logium-8qm` | CHECKOUT GLOBAL-ONLY UI/UX | Checkout shell touched through 2026-07-10, 5+ weeks after eval |
| `sang-logium-0ph` | UI/UX ACROSS ENTIRE APP | References child issues `sang-logium-3lw`/`sang-logium-0h3` — neither exists in the tracker |
| `sang-logium-mik` | User account | Code touched 2026-07-11, 1 month after eval |
| `sang-logium-abj` | /sign-in, /sign-up | Code touched 2026-07-11, 1 month after eval |
| `sang-logium-7p6` | Performance | `lighthouserc.cjs` touched 2026-07-11; old Lighthouse numbers can't be trusted without re-measuring |

**None of the 14 have dependents** (`dependent_count: 0` for all) — no `--cascade` needed, confirmed no risk of an unexpected cascading delete.

---

## Phase 1 — Setup

### Task 1.1 — Health check
```bash
bd doctor
```
If `bd` isn't installed: `curl -fsSL https://raw.githubusercontent.com/gastownhall/beads/main/scripts/install.sh | bash`. Run everything below from the sang-logium repo root.

### Task 1.2 — Write the deletion list once, to a scratch file outside the repo

Every subsequent delete command reads from this one file instead of having the 14 IDs retyped — one source of truth, nothing to keep in sync by hand.

```bash
cat > /tmp/beads-deletions.txt << 'EOF'
sang-logium-f35
sang-logium-ckw
sang-logium-fr1
sang-logium-c8i
sang-logium-l93
sang-logium-47k
sang-logium-mpx
sang-logium-3ez
sang-logium-qc1
sang-logium-8qm
sang-logium-0ph
sang-logium-mik
sang-logium-abj
sang-logium-7p6
EOF
```

### Task 1.3 — Confirm all 14 still resolve before deleting anything

This audit read `.beads/issues.jsonl` directly, not live `bd` — cheap insurance that nothing moved since. Checks one ID at a time so a single missing ID is caught by exit code, not by eyeballing output (`bd show` on a batch of IDs still exits 0 as long as *at least one* resolves, so batching this particular check would hide a partial miss):

```bash
while IFS= read -r id; do
  bd show "$id" --short >/dev/null 2>&1 || echo "NOT FOUND: $id"
done < /tmp/beads-deletions.txt
```
Expected: no output. Any `NOT FOUND:` line means stop and report rather than proceeding — the audit is out of sync with the live DB.

---

## Phase 2 — Preview, then delete

### Task 2.1 — Preview
```bash
bd delete --from-file /tmp/beads-deletions.txt --dry-run
```
Expected: preview lists exactly 14 issues, would-remove-dependencies is 0.

### Task 2.2 — Execute
```bash
bd delete --from-file /tmp/beads-deletions.txt --force
```
Hard delete, not close, cannot be undone — that's the intent (tracker noise, not resolved work). No `--cascade` flag — none of the 14 have dependents, confirmed in Task 1.3's neighborhood and in the table above.

---

## Phase 3 — Verify

### Task 3.1 — Spot-check one deleted issue
```bash
bd show sang-logium-f35 >/dev/null 2>&1 && echo "STILL EXISTS — investigate" || echo "confirmed deleted"
```

### Task 3.2 — Confirm the issues staying open/in-progress are untouched
```bash
bd show sang-logium-4nd sang-logium-mwk sang-logium-2ti sang-logium-1xs sang-logium-w92 sang-logium-wisp-8r2 --short
```
Expected: all 6 print a line, none say "not found."

---

## Phase 4 — Correct 3 issues, close 1

**Mechanism, confirmed from `cmd/bd/update.go` source (not guessed):** `bd update <id> --notes "..."` **replaces** the notes field outright (`--notes` flag help text: "Additional notes (replaces existing notes; use --append-notes to append)"). bd will print `warning: ... --notes replaced existing notes` when you do this — that warning is expected here and is not an error, don't stop on it. `--description` works the same way. There is a separate `--append-notes` flag for adding without replacing.

**Given that**, for the two issues with long multi-paragraph note histories (`mwk`, `1xs`), the plan below uses `--append-notes` to add a short dated correction rather than retyping their entire notes field — reconstructing hundreds of lines of history by hand is exactly the kind of needless, error-prone effort this pass is trying to cut, and appending a clearly-dated correction achieves the same practical outcome (nobody reading the issue is misled) without the risk of a transcription slip silently deleting real history. For `w92`, the obsolete content is in the short `description` field (not `notes`), so a direct `--description` replacement is cheap and used instead.

### Task 4.1 — `sang-logium-mwk` (Basket page)
```bash
bd update sang-logium-mwk --append-notes "CORRECTION 2026-08-01 (re-verified against source): the 'Frame - 2026-06-10: Basket Page Layout Problems' block above is obsolete — it targets code that no longer exists (BasketControls.tsx w-10, BasketItem.tsx grid-cols-[3fr_1fr_1fr_1fr]). BasketItem.tsx was redesigned since with a 3-column grid and 44px touch-target controls, a different solution than either state that block describes. Do not act on that block's prescriptions. The RangeError fix and 2026-06-03 visual-alignment blocks above are still accurate as of this re-verification."
```

### Task 4.2 — `sang-logium-1xs` (Filters/Sorting)
```bash
bd update sang-logium-1xs --append-notes "CORRECTION 2026-08-01 (re-verified against source): the 'Frame - 2026-06-10' and 'FRAME 2026-06-11' blocks above (price-slider debugging) are obsolete — code changed again on 2026-06-19, after both notes, and now contradicts specific claims in them (limitUrlUpdates is in active use today; PriceRangeSlider.tsx still has localMin/localMax state). Do not act on either block's prescriptions without re-auditing current source first. The 'Gap Analysis - 2026-06-09' block (SortDropdown not wired to CMS sortables) is still accurate and still open: SortDropdown.tsx uses the static SORT_OPTIONS constant, and getSortablesForCategoryPathAction exists but is called nowhere."
```

### Task 4.3 — `sang-logium-w92` (Logging mechanism)
```bash
bd update sang-logium-w92 --description "## Critical Intelligence (corrected 2026-08-01 — architecture changed since original write-up)
lib/dev/event-logger.ts is now console-only, gated by LOG_LEVEL — NOT Redis-based. Its own header comment: 'Lightweight event logger — console-only, no persistent storage... No Redis, no disk writes.' The Redis helper scripts formerly listed here (scripts/get-trace.mjs, scripts/get-recent-checkout-logs.mjs, scripts/clear-redis-logs.mjs) have been deleted from the repo.
app/actions/checkout/index.ts (uses logCheckoutEvent, which now delegates to generic logEvent())
Frontend: scattered console.log still present in WebVitals.tsx, PromotionImage.tsx, app/api/shipping/rates/route.ts (re-verified 2026-08-01)

## Scope 1: Core Logging Infrastructure
SHOULD BE
- Frontend logger utility to replace scattered console.log

DoD Items
- [x] Generalize event-logger.ts beyond checkout-only (logEvent() exists — done)
- [ ] Frontend logger utility to replace scattered console.log
- [ ] npm script shortcuts for logs — only relevant if a persistent log store is reintroduced; console-only logging has nothing to clear/retrieve via script

## Scope 2: Advanced Logging Features — not applicable to console-only architecture
Redis unavailable fallback and large trace volume handling: moot, there is no Redis. Frontend log buffering/batching remains a valid future scope if the frontend logger utility above is built."
```

### Task 4.4 — Close `sang-logium-4nd` (Return page) — done, just never closed
All 5 gaps in its notes ("Live check 1–5: PASS") were independently re-verified against source: `getOrderByPaymentIntentId.ts` uses `backendClient`; `lib/email.ts` exports `sendOrderConfirmationEmail`, called from `createOrderFromPaymentIntent.ts`; `OrderDetails.tsx` computes an estimated delivery date; `SuccessAnalytics.client.tsx` exists with GA4 wired into the layout; "View my orders" shows for all users.
```bash
bd close sang-logium-4nd --reason "All 5 gaps verified fixed in source — CDN race, email, delivery date, GA4 tracking, CTA. Re-verified against code 2026-08-01."
```

---

## Phase 5 — One sync, covers everything above

Don't sync after Phase 2 and again after Phase 4 — that's two full network round-trips (Dolt push + git pull/push each) for work that fits in one. Do it once, here, at the end.

### Task 5.1 — Regenerate the JSONL export explicitly
```bash
bd export -o .beads/issues.jsonl
```
Don't rely on a pre-commit hook to have done this automatically — hook installation state isn't guaranteed, and a stale `issues.jsonl` would commit successfully while silently not reflecting any of the above (a `git diff` that shows nothing changed here is a bug, not confirmation of no-op).

### Task 5.2 — Confirm the export actually changed
```bash
git diff --stat .beads/issues.jsonl
```
Expected: non-empty diff. If empty, stop — Task 5.1 didn't do what it should have; do not proceed to commit an unchanged file believing the work landed.

### Task 5.3 — Push Dolt data
```bash
bd dolt push
```
If this fails with something like "no remote configured": run `bd dolt remote -v` to check. If genuinely none exists, this repo's Dolt data is local-only — skip this command and flag it to the user in your handoff (other clones/agents won't see these changes at the Dolt level until a remote exists), but still complete Task 5.4 below, since the JSONL export via git is the fallback sync path either way.

### Task 5.4 — Commit and push
```bash
git add .beads/issues.jsonl
git commit -m "chore(beads): delete 14 stale/off-topic issues, correct 3 stale note blocks, close 1 completed issue

- Deleted: 6 off-topic personal notes, 8 PM-evaluation checklists superseded by later code changes
- Corrected: mwk, 1xs, w92 notes/description had claims disproven by later undocumented code changes
- Closed: sang-logium-4nd (Return page) — all 5 gaps verified fixed in source"
git pull --rebase
git push
git status   # must show "up to date with origin"
```
This satisfies the project's mandatory session-completion workflow in `CLAUDE.md` (work is not complete until `git push` succeeds).

---

## Out of scope — do NOT do in this task

- Do not re-evaluate the 8 stale PM-evaluation checklists against current code before deleting them — that's separate follow-up work (a fresh audit of Address/Shipping/Footer/Checkout-UI/Sitewide-UI/Account/Auth/Performance), not part of this cleanup.
- Do not delete or close `sang-logium-mwk`, `sang-logium-1xs`, or `sang-logium-w92` — Phase 4 only corrects stale text on these; each has genuinely open work remaining (see the "still accurate and still open" line in each task).
- Do not touch `description` on `mwk` or `1xs` — only their `notes` were found stale. `w92` is the one exception (Task 4.3).
- Do not use `--cascade` on the Phase 2 delete — confirmed zero dependents on all 14 targets; if the dry-run in Task 2.1 shows otherwise, stop and report instead of forcing it.
