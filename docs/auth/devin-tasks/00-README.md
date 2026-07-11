# Devin handoff — Sang Logium account/auth gap closure

This directory holds one implementation spec per phase. **Feed the agent one file at a time, in numeric order.** Each file is self-contained (states the stack, the exact files to touch, the pattern to copy, and how to verify done) so it can be executed without pulling in the rest of this directory or prior chat context.

Do not skip ahead — later phases assume earlier ones shipped (noted per-file under "Depends on").

## Shared context (true for every phase, don't re-derive it)

- Stack: Next.js 15 App Router, React 19, better-auth 1.6.11 (`lib/auth.ts`, `lib/auth-client.ts`, `lib/auth/dal.ts`), Sanity v3 (`sanity-cms/`), Turso/libSQL for the auth DB.
- Auth guards: `verifySession()` (Server Component, redirects to `/sign-in`), `getSession()` (Route Handler, returns `null`), `requireSession()` (Server Action, throws). All live in `lib/auth/dal.ts`. Never hand-roll a fourth guard.
- Forms follow one pattern throughout the app: client component, `useActionState`, a server call via `authClient` (from `lib/auth-client.ts`) or a server action, plain-text error banners with classes `border-error-500 bg-error-500/10 text-error-500`, success banners with `border-success-500 bg-success-500/10 text-success-500`. Match this pattern exactly — do not introduce a new form library or a new visual style.
- Sanity writes always go through `backendClient` from `@/sanity-cms/lib/backendClient` (has the write token). Never use the public read client to write.
- `userProfile.authId` == better-auth `user.id`. `order.userId` == the same value. These are plain string fields, not Sanity references.
- CSS utility classes already in use: `card-base`, `btn-primary`, `btn-secondary`, `input-field`, `type-section-hed`, `type-caption`, `type-body`. Reuse them; don't invent new ones.
- Run `npm run build` (or the project's existing lint/typecheck script) before calling a phase done. If no test suite exists for a touched area, say so explicitly rather than inventing test output.
- Do not touch `.beads/` files directly. If the task needs a tracked follow-up issue, describe it in the PR/commit description instead.

## Phase order and what each closes

1. `01-quick-fixes.md` — returnTo redirect, gate Google button on config, delete dead code. No new features, ~30 min.
2. `02-profile-name-edit.md` — let a user change their display name.
3. `03-profile-email-change.md` — verified email change flow (depends on phase 2's page section existing).
4. `04-address-book.md` — My Addresses page backed by `userProfile.addresses[]`.
5. `05-order-detail-page.md` — per-order detail/tracking/invoice view.
6. `06-account-deletion-gdpr-export.md` — delete account + data export.
7. `07-guest-to-account-order-merge.md` — link pre-existing guest orders to a new account by email.
8. `08-notification-preferences.md` — email preference toggles.
9. `09-wishlist-favorites.md` — save-for-later list.
10. `10-two-factor-auth.md` — TOTP 2FA + a "remember this device" control.
11. `11-additional-social-providers.md` — Apple/GitHub sign-in, same conditional pattern as Google.

Phases 1–7 are the priority tier (functional account completeness + a compliance gap). Phases 8–11 are lower priority / optional polish — do not start them before 1–7 are done and verified.
