# Search UX — turn 2 of 4: TABLET (640–1023px) — Devin phases

Axis: search UX. Turn 2 task area: the `sm`–`lg` header search field + suggestion popup, and the results-page pagination row.
Branch for this turn: **`search-ux/tablet`** (new, from `origin/main`). One PR at the end. Paste ONE phase at a time, in order, into the SAME Devin session/worktree.

Files this turn may touch (nothing else, ever): `app/components/features/search/SearchFieldDesktop.tsx`, `app/components/features/search/SearchPagination.tsx` (Phase 5 only), `docs/search-ux.md`.
PR #12 (`search-ux/mobile`, open, unmerged) touches `SearchResults.tsx`, `page.tsx`, `SearchPagination.tsx` (scroll props only), `SearchSort.tsx`, `searchProducts.ts`. This turn never edits the first, second, fourth or fifth of those and never merges/rebases anything, so the two PRs merge in either order.

Git facts verified 2026-09-29: local `main` == `origin/main` == `9c9845da`; no branch `search-ux/tablet` exists locally or on origin; stale worktrees exist (`/tmp/claude-1000/.../pr12` holds `search-ux/mobile`, others under `~/.treehouse/…/1..8`) — they are not yours; a shared `git stash` stack holds the human's parked work.

---

## Phase 1 — Create the branch (git only, no code)

```markdown
# Phase 1 — create branch `search-ux/tablet` safely (git only, no code changes)

Repo rules (apply to every phase): never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation against the dev server. No subagents. No `$(...)` or backticks in shell commands — one plain command at a time. The human checks live on localhost:3000.

FORBIDDEN in every phase: `git stash`, `git checkout`/`git switch` to any branch other than the one created below, `git merge`, `git rebase`, `git cherry-pick`, `git reset --hard`, `git clean`, `git push --force` (or `+ref`), `git branch -d/-D`, `git worktree remove/prune`, `git add -A`, `git add .`, `git add -u`, committing on `main`, pushing any branch except `search-ux/tablet`, touching any worktree or branch that is not yours. If any check below fails: STOP and report the exact output. Do not improvise a workaround.

Tasks (run in order, one command at a time):
1. `git rev-parse --show-toplevel` — the path MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`. If it is `/home/jan/work/sanglogium`, STOP (that is the human's own checkout).
2. `git status --porcelain` — MUST print nothing. If not empty, STOP (do not stash, do not discard).
3. `git fetch origin --prune`
4. `git branch --list search-ux/tablet` AND `git ls-remote --heads origin search-ux/tablet` — BOTH MUST print nothing. If either prints a line, STOP (never reuse, delete or overwrite an existing branch).
5. `git switch -c search-ux/tablet --no-track origin/main`
6. `git branch --show-current` MUST print `search-ux/tablet`. `git rev-parse HEAD` and `git rev-parse origin/main` MUST be identical.
7. Gate for Phase 5: run `git cat-file -e HEAD:app/components/features/search/SearchSort.tsx` — exit code 0 means PR #12 is already in this branch's base. Report exactly: `PR12_IN_BASE=yes` or `PR12_IN_BASE=no`.
8. Do not push yet (nothing to push).

Done =
- [ ] (a) toplevel is under `/home/jan/.treehouse/sanglogium-29d78f/`
- [ ] (b) working tree was clean before branching
- [ ] (c) branch `search-ux/tablet` created from `origin/main`, HEAD == origin/main
- [ ] (d) `PR12_IN_BASE=yes|no` reported
- [ ] (e) zero files changed, nothing pushed
```

---

## Phase 2 — Tablet header field fits the header like the phone bar

```markdown
# Phase 2 — `SearchFieldDesktop`: field fits the 44px header at sm–lg (branch `search-ux/tablet`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000. Read `docs/search-ux.md` first and do not break its contracts (history, visualViewport sizing, combobox semantics, one visible input, tap targets, input attributes).

GIT GUARD (run first): `git branch --show-current` MUST print `search-ux/tablet`, and `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`. Otherwise STOP and report; do not switch branches. Forbidden in this phase: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Only file you may edit: `app/components/features/search/SearchFieldDesktop.tsx`.

Problem (established from code): `Header.tsx` is `h-[var(--mobile-header-h)]` = 44px until `lg` (64px from lg up). The `sm`+ field is a 44px (`h-11`) bar inside that 44px header, so on tablets it touches the header's top and bottom edges. The phone trigger (`SearchBarTrigger.tsx`) solves this with a 44px hit area (`h-11`) around a 36px visible bar (`h-9`). Tablets must match. From `lg` up nothing may change (visible bar stays 44px in the 64px header).

Tasks:
1. In `SearchFieldDesktop.tsx`, the `<form role="search">`: make it a full-width flex row exactly 44px tall with items centred — it becomes the 44px hit area, at every width from `sm` up.
2. The visible bar (the `div` with `group flex h-11 items-center rounded-md pl-4`): full width of the form; height 36px (`h-9`) below `lg`, 44px from `lg` up. Keep every other class (colours, hover, focus-within, transition) unchanged.
3. Tapping the form's own 4px strips above/below the bar must focus the input: add an onClick on the `<form>` that focuses `inputRef` only when the click target is the form element itself (`e.target === e.currentTarget`). No other behaviour change.
4. The Clear (X) button currently uses `h-full w-11`, which would shrink to 36px. Keep its hit area 44px tall on tablets (e.g. `h-11` with a `-my-1` below `lg` and `my-0` from `lg`), still `w-11`, same look.
5. The `/` `kbd` hint stays as is (already hidden on touch via `pointer-fine`).
6. Height-sizing review gate (mandatory, repo rule): this diff touches `h-` classes under `app/components/**` — re-read your diff against `docs/vertical-space-lg-touch.md`; confirm: form 44px, bar 36px <lg / 44px ≥lg, input still fills the bar (`SearchInput` `h-full`), popup position (`top-full mt-2` of the outer wrapper) unchanged.
7. Do NOT edit `Header.tsx`, `SearchInput.tsx`, `SearchBarTrigger.tsx`, `globals.css`, or any other file.
8. Commit only this file, then push:
   - `git add app/components/features/search/SearchFieldDesktop.tsx`
   - `git diff --cached --name-only` MUST list exactly that one file
   - `git commit -m "Search UX (tablet): field keeps 44px hit area inside the 44px header"`
   - `git push -u origin search-ux/tablet`

Done =
- [ ] (a) guard passed (branch + worktree path)
- [ ] (b) form is the 44px row; bar is 36px below lg and 44px from lg; clear button hit area 44px
- [ ] (c) click on the form's own padding focuses the input
- [ ] (d) diff = `SearchFieldDesktop.tsx` only; pushed to `origin search-ux/tablet`
```

---

## Phase 3 — Tablet popup: width stays in the viewport, clears the on-screen keyboard

```markdown
# Phase 3 — `SearchFieldDesktop`: popup width + on-screen-keyboard clearance (branch `search-ux/tablet`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000. Read `docs/search-ux.md` first.

GIT GUARD (run first): `git branch --show-current` MUST print `search-ux/tablet`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty (Phase 2 was committed). Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Only file you may edit: `app/components/features/search/SearchFieldDesktop.tsx`. Read-only reference: `app/components/features/search/useVisualViewportBox.ts` (do not edit it).

Problem A (from code): the popup div has `w-full` plus `min-w-[min(30rem,calc(100vw_-_2rem))]` (480px). Between 640px and roughly 690px the header field is narrower than 480px and is offset from the left by the logo, so the popup's right edge runs past the viewport (horizontal scroll / clipped suggestions). From `md` up the field is already ≥480px, so the min-width does nothing there.
Problem B (from code): on touch tablets the layout viewport does not shrink when the on-screen keyboard opens (documented in `docs/search-ux.md`). The popup's `max-h-[min(36rem,calc(100dvh_-_6rem))]` ignores the keyboard, so the sticky "See all results" row can sit behind it. Phones solve this with `useVisualViewportBox` in `SearchSheet`; the popup must do the same.

Tasks:
1. Remove the `min-w-[min(30rem,calc(100vw_-_2rem))]` class from the popup div. Popup width = field width (`w-full`), nothing else changes.
2. Import `useVisualViewportBox` from `./useVisualViewportBox` and call it in `SearchFieldDesktop`.
3. Add a ref to the outer `relative` wrapper div (the one with `onBlur={handleBlur}`).
4. Keep a piece of state holding the popup's keyboard-aware max height in px, or null. In an effect that depends on `showPopup` and the viewport box: when the popup is shown AND the box exists AND `box.keyboardOpen` is true, measure the wrapper's `getBoundingClientRect().bottom` and set the state to `box.top + box.height − wrapperBottom − 16` (16px = the 8px `mt-2` gap + 8px breathing room), floored at 160; in every other case set it to null.
5. Apply it to the popup div as an inline `maxHeight` of `min(36rem, <value>px)` ONLY when the state is not null; when null, no inline style, so the existing `max-h-[min(36rem,calc(100dvh_-_6rem))]` class keeps governing (desktop/mouse and phones-without-keyboard behaviour unchanged).
6. Keep everything else: `role="region"`, `tabIndex={0}`, `onMouseDown` preventDefault, `overflow-y-auto overscroll-contain`. The sticky "See all results" row lives inside the scroll area and needs no change.
7. Do NOT edit `AutocompletePanel.tsx`, `SearchSheet.tsx`, `useVisualViewportBox.ts`, or any other file.
8. Height-sizing review gate (mandatory): this diff touches `max-h`/`min-w` on the popup under `app/components/**` — re-read the diff against `docs/vertical-space-lg-touch.md`; confirm the no-keyboard case is byte-identical in behaviour to before.
9. Commit and push:
   - `git add app/components/features/search/SearchFieldDesktop.tsx`
   - `git diff --cached --name-only` MUST list exactly that one file
   - `git commit -m "Search UX (tablet): popup stays in viewport and clears the on-screen keyboard"`
   - `git push origin search-ux/tablet`

Done =
- [ ] (a) guard passed, tree was clean
- [ ] (b) `min-w-[min(30rem,…)]` removed from the popup
- [ ] (c) popup max height follows `visualViewport` only while `keyboardOpen`; otherwise unchanged
- [ ] (d) diff = `SearchFieldDesktop.tsx` only; pushed
```

---

## Phase 4 — Docs

```markdown
# Phase 4 — document the tablet contracts in `docs/search-ux.md` (branch `search-ux/tablet`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands.

GIT GUARD (run first): `git branch --show-current` MUST print `search-ux/tablet`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Only file you may edit: `docs/search-ux.md`.

Tasks (keep it lean: two bullets, no new sections):
1. In "Contracts worth not breaking", after the "Tap targets" bullet, add one bullet: on tablets (`sm`–`lg`) the header field is a 36px bar inside a 44px hit area (same pattern as the phone trigger; the form's padding focuses the input; the clear button keeps a 44px hit area); from `lg` the bar is 44px in the 64px header.
2. In the same list, add one bullet: the desktop/tablet popup is exactly as wide as its field (no min-width) and, while the on-screen keyboard is open (`useVisualViewportBox().keyboardOpen`), its max height is derived from the visual viewport so the sticky "See all results" row stays above the keyboard; without a keyboard it uses the plain `dvh` cap.
3. In "Checking it", append one sentence: on tablet widths (640, 744, 768, 820, 1023) check the field spacing in the header, the popup's right edge at 640, and — on a real iPad or a `visualViewport` override — the "See all results" row above the keyboard.
4. Commit and push:
   - `git add docs/search-ux.md`
   - `git diff --cached --name-only` MUST list exactly that one file
   - `git commit -m "Docs: tablet search field and popup contracts"`
   - `git push origin search-ux/tablet`

Done =
- [ ] (a) guard passed
- [ ] (b) exactly two contract bullets + one checking sentence added, nothing else in the doc changed
- [ ] (c) diff = `docs/search-ux.md` only; pushed
```

---

## Phase 5 — Results pagination row on tablet (GATED on PR #12 being in this branch)

```markdown
# Phase 5 — `SearchPagination`: stack the row on tablet (branch `search-ux/tablet`) — GATED

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000.

GIT GUARD (run first): `git branch --show-current` MUST print `search-ux/tablet`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Only file you may edit: `app/components/features/search/SearchPagination.tsx`.

GATE (run second): `git cat-file -e HEAD:app/components/features/search/SearchSort.tsx`. If the exit code is NOT 0, PR #12 is not in this branch: SKIP this entire phase, change nothing, do NOT merge or rebase main into the branch to unlock it, and report `PHASE5=skipped (PR #12 not in base)`. Go straight to Phase 6.

Problem (from code): the `<nav>` is `sm:flex-row sm:items-center sm:justify-between` holding the caption "Showing X–Y of N" (~170px) and the control group (Previous + up to 7 numbered pills/ellipses at 44px + Next ≈ 550px). Below ~820px viewport the two do not fit on one row; the caption wraps into a squeezed column beside a full-width group.

Tasks:
1. Only the `<nav>` className string changes: keep `mt-8 flex flex-col gap-3 border-t border-border-secondary pt-6`; replace `sm:flex-row sm:items-center sm:justify-between` with `sm:items-center lg:flex-row lg:justify-between` — phones unchanged, tablets stack the caption above the centred controls, `lg` and up keep the single row.
2. Do not touch any other line (PR #12 edits the `scroll` props in this file; keep hunks apart). No changes to `SearchResults.tsx`, `SearchSort.tsx`, `page.tsx`.
3. Commit and push:
   - `git add app/components/features/search/SearchPagination.tsx`
   - `git diff --cached --name-only` MUST list exactly that one file
   - `git commit -m "Search UX (tablet): stack pagination caption above controls below lg"`
   - `git push origin search-ux/tablet`

Done =
- [ ] (a) guard + gate evaluated and reported
- [ ] (b) if gate open: only the `<nav>` className changed; pushed. If gate closed: no change, `PHASE5=skipped` reported
```

---

## Phase 6 — Open the PR (git/gh only)

```markdown
# Phase 6 — open the PR for `search-ux/tablet` (no code changes)

Repo rules: no tsc, build, lint, tests, dev server, curl, npm install; no subagents; no `$(...)`/backticks; do NOT run no-mistakes; do NOT wait for CI; do NOT merge or enable auto-merge.

GIT GUARD (run first, one command at a time):
1. `git branch --show-current` MUST print `search-ux/tablet`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report.
2. `git fetch origin`
3. `git diff --name-only origin/main...HEAD` — every listed path MUST be one of: `app/components/features/search/SearchFieldDesktop.tsx`, `app/components/features/search/SearchPagination.tsx`, `docs/search-ux.md`. Any other path (especially anything under `_project/`, `SearchSort.tsx`, `SearchResults.tsx`, `page.tsx`, `searchProducts.ts`): STOP and report — do not open the PR.
4. `git log --oneline origin/main..HEAD` MUST show only this turn's commits (2–4 lines starting "Search UX (tablet)" / "Docs: tablet"). Anything else: STOP.
5. `git push origin search-ux/tablet` (plain push; if it is rejected, STOP — never force).

Tasks:
1. Write the PR description to `/tmp/pr-body-search-ux-tablet.md` (outside the repo) with: What changed (field 36px bar in 44px hit area below lg; popup min-width removed; popup max height follows the visual viewport while the keyboard is open; pagination stacked below lg if Phase 5 ran, else "deferred until PR #12 merges"); the human live-check list below; "Not touched: SearchSheet, phone UI, PR #12 files." End with the line: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
2. `npx -y gh-axi pr create --base main --head search-ux/tablet --title "Search UX (tablet): field fit, popup width + keyboard clearance" --body-file /tmp/pr-body-search-ux-tablet.md`
3. `npx -y gh-axi pr view <number>` — confirm base = `main`, head = `search-ux/tablet`, changed files ⊆ the allowed list.
4. Report the PR URL, the `PHASE5` outcome, and `git status -sb` (must be clean). Do not delete the branch or the worktree.

Human live-check list (put in the PR body; the human runs it on localhost:3000):
- [ ] Widths 640 / 690 / 744 / 768 / 820 / 1023 (touch emulation): the header field shows a 4px gap above and below, like the phone bar; at 1024+ the 44px field sits in the 64px header exactly as before.
- [ ] At 640: focus the field → popup's right edge is inside the viewport, no horizontal scrollbar; the popup is as wide as the field at 640 and 768.
- [ ] Tap the thin strip just above/below the bar → input focuses; the X clear button is easy to tap.
- [ ] Real iPad (or `visualViewport` override per docs/search-ux.md): type "hd" → "See all results" row is fully visible above the keyboard; the list scrolls; closing the keyboard restores the normal height.
- [ ] Desktop 1280 mouse: popup looks and behaves as before; `/` shortcut, arrows, Enter, Esc unchanged.
- [ ] Phone 390: nothing changed (sheet, header bar).
- [ ] If Phase 5 ran: at 744 the pagination caption sits above the centred controls with no wrapping; at 1024 it is a single row.
- [ ] Report-only (no fix this turn): results grid column counts at 640–730 (auto-fill in `gridLayout.ts`, shared by all catalogue pages) and the Sort control from PR #12 at sm+ (one row with the product count?).

Done =
- [ ] (a) all guard checks passed (branch, path, clean tree, file whitelist, commit list)
- [ ] (b) PR open with base `main`, head `search-ux/tablet`, body includes the live-check list
- [ ] (c) nothing merged, no force push, worktree clean
```

---

Turn 2 covers: tablet header field fit, popup width, popup vs on-screen keyboard, pagination stack (if #12 is merged before Phase 1 runs; otherwise it is carried to turn 3).
Remaining: turn 3 small desktop (1024–1279: `lg-touch`/`lg-desktop` split, popup with header actions, pagination if skipped here, sort at small desktop); turn 4 desktop + final checks. Bug patches ride alongside.
