# Patch: mobile search sheet — input flush to the top edge

Paste ONE phase at a time to Devin. Branch `fix/search-sheet-top-spacing` from `main`, one PR at the end (`npx -y gh-axi`; no no-mistakes, no CI waiting).

## Rules (Devin: read first)

- Banned: `tsc`, `next build`, lint, tests, `npm run dev`, curl, browser automation against the dev server, `npm install`, subagents. The human does the live before/after on `localhost:3000`. No `$(...)`/backticks in shell commands.
- Minimal diff, phones only (`< sm`). Desktop popup (`SearchFieldDesktop`) must not change.
- Read `docs/search-ux.md` first. Do not break its contracts (history, `visualViewport` sizing, combobox semantics, 44px targets, 16px input).
- **Compatibility with the blur-images patch** (`02-suggestion-image-blur-devin-phases.md`, touches `ProductImage.tsx` and only the `<ProductImage …/>` element inside `AutocompletePanel.tsx`): this patch must NOT touch either file. Scope = `SearchSheet.tsx` (header block only) plus, if needed, one keyframe/animation token. The two branches are independent and merge in either order.

## Diagnosis (from code, already established — Phase 1 confirms the two unknowns)

Component: `app/components/features/search/SearchSheet.tsx` (phone full-screen dialog, opened from `SearchBarTrigger` in the header or the bottom bar).

- Sheet root: `fixed inset-x-0 top-0 z-[60] h-dvh … sm:hidden`, with `style={{ top: box.top, height: box.height }}` from `useVisualViewportBox` once measured. It therefore covers the app header entirely, from pixel 0.
- Its top row is `flex h-14 … items-center … pl-1 pr-3` (56px) holding a 44px field → only ~6px above the input, **no `env(safe-area-inset-top)`**, and the row has no top padding of its own. On a notched/status-bar-overlapping device (or standalone PWA / `viewport-fit=cover`) the field sits under the status bar; on plain mobile Safari/Chrome it looks flush to the top edge.
- The sheet **mounts instantly**: no enter transition, so tapping the header bar teleports the input from its header position to the top edge. Once the user types, the suggestion list appears directly under the row on the same `bg-surface-elevated`, separated only by a 1px border, so the cramped top row is what stands out.
- Unknown to confirm: is `viewportFit: 'cover'` set in the app's `viewport` export (find with `grep -rn "viewport" app --include=layout.tsx`)? `env(safe-area-inset-top)` is 0 unless it is; padding with it is harmless either way.

## Phase 1 — Confirm (read-only)

- T1.1 Grep for the `viewport` export and note whether `viewportFit` is set. Record in the PR description.
- T1.2 Grep `tailwind.config.ts`/global CSS for existing `keyframes`/`animation` tokens and the `--mobile-header-h` value (the sheet's header row should stay visually consistent with the app header, ≈56px).
- T1.3 Human takes a BEFORE screenshot (390×844): tap the header search bar → sheet open, keyboard up, type "hd800". Attach to PR.

Done =
- [ ] (a) viewport-fit status and existing animation tokens recorded
- [ ] (b) BEFORE screenshot attached

## Phase 2 — Target pattern (spec Devin implements literally)

Standard active-search-bar pattern, matching the sheet's existing dark surface language:

- Header block of the sheet = a **distinct bar**: `bg-surface-elevated` (same as sheet), `border-b border-border-secondary` (keep), padding **top = `max(8px, env(safe-area-inset-top))`**, **bottom = 8px**, side padding unchanged. Inner row stays `h-11` (44px field, 44px back button). Resulting bar ≈ 60px + inset, field visibly inset from every edge (≥8px above, ≥8px below).
- **Enter transition:** sheet fades in and slides ~8px down over 180ms ease-out (`opacity 0→1`, `translateY(-8px)→0`), wrapped in `motion-safe:` so reduced-motion users get none. No exit animation (close must stay instant; it uses `history.back()`).
- **Scrolling with results visible:** the header block is a sibling of the scroll region (not inside it), so it stays fixed; add no JS. The existing bottom "See all results" sticky row and `mb-[var(--mobile-menu-h)]` logic are untouched.
- No colour changes to the field (`bg-secondary-300` → `focus-within:bg-brand-400` stays).

## Phase 3 — Patch (smallest correct)

- T3.1 `SearchSheet.tsx`, the header `<div className="flex h-14 shrink-0 …">`: replace `h-14` with no fixed height; add `pb-2` and `style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}`; keep `border-b`, `gap-1`, `pl-1 pr-3`. Wrap the existing back button + form in one inner `flex h-11 items-center gap-1` row so the field height is unchanged. (If an existing Tailwind arbitrary utility for the inset already exists in the repo, prefer it.)
- T3.2 Enter transition: add ONE keyframe + animation token (`search-sheet-in`, 180ms ease-out, both fill) in the place T1.2 identified (tailwind config keyframes/animation, or the global CSS the repo already uses for custom animations), and apply `motion-safe:animate-search-sheet-in` to the sheet root div. Do not animate `top`/`height` (they are driven by `visualViewport`); animate `transform`+`opacity` only, and confirm `transform` on the fixed root does not break the `fixed` descendants (there are none) or the focus trap.
- T3.3 Edge-case review (write findings in the PR, change code only if broken):
  - notch / status-bar overlap: inset padding handles it; with `viewportFit` unset it is 0 and `max(8px, …)` keeps 8px;
  - keyboard open: sheet `top/height` from `visualViewport` unchanged; header row keeps its size, list shrinks — no jump;
  - dropdown states (zero-query panel, suggestions, empty, error): all live below the header block, unaffected;
  - iOS: `input.focus({ preventScroll: true })` already set; the new `transform` animation must not delay focus/keyboard (animation is 180ms; focus fires on mount — OK).
- T3.4 Height-sizing review gate: this diff touches `h-`/`min-h-` classes under `app/components/**` → re-read the diff against `docs/vertical-space-lg-touch.md`; confirm the field row is still 44px and the scroll region (`min-h-0 flex-1`) still gets the remaining height.
- T3.5 Do not touch `AutocompletePanel.tsx`, `ProductImage.tsx`, `SearchInput.tsx`, `useVisualViewportBox.ts`, the desktop field, or `SearchBarTrigger.tsx`.

Done =
- [ ] (a) diff limited to `SearchSheet.tsx` (+ one animation token)
- [ ] (b) no fixed `h-14` on the header block; inset padding present
- [ ] (c) animation gated by `motion-safe:`

## Phase 4 — Verify (human on `localhost:3000`) + PR

- T4.1 AFTER screenshots at 390×844 and 320×568, and with DevTools device "iPhone 14 Pro" (notch/island): tap header search bar → sheet eases in; field has visible space above and below; type "hd800" → suggestions appear under a clearly separated bar; scroll the list → bar stays put; keyboard up (real device or `visualViewport` override per `docs/search-ux.md`) → no jump.
- T4.2 Regression: Back button closes the sheet (one history entry), Esc closes, Tab trap works, "See all results" row still ends above the keyboard, bottom-bar X still visible when no keyboard. Desktop 1280px popup unchanged.
- T4.3 Combined check with the blur patch (if both branches are checked out together): suggestion thumbnails are sharp AND the bar is spaced — no interaction expected.
- T4.4 Open the PR (`npx -y gh-axi`), title "Fix: mobile search sheet top spacing + safe area"; attach BEFORE/AFTER screenshots and the T3.3 findings.

Done =
- [ ] (a) BEFORE/AFTER pair attached, AFTER shows ≥8px above and below the field at 320 and 390
- [ ] (b) no regression in the T4.2 list
- [ ] (c) PR open
