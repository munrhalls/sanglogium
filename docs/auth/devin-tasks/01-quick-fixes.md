# Phase 1 — Quick fixes (no new features)

**Depends on:** nothing. Do this first.
**Closes:** G12 (no returnTo redirect), G13 (Google button shown when unconfigured), G14 (dead code).
**Scope:** 3 small, independent changes. Do them as 3 separate commits.

---

## 1a. Remove dead code

`app/(store)/sign-up/actions.ts` exports `createUserProfile()`. It has zero call sites anywhere in the app (profile creation is fully handled by the `databaseHooks.user.create.after` hook in `lib/auth.ts`, with `ensureUserProfile()` in `lib/auth/dal.ts` as a healing fallback).

**Action:** Delete `app/(store)/sign-up/actions.ts`. Confirm nothing imports it (`grep -r "createUserProfile" app lib` should return nothing after deletion, aside from historical docs under `docs/`).

## 1b. Gate the Google sign-in button on actual configuration

**Problem:** `app/(store)/sign-in/SignInForm.tsx` renders the "Sign in with Google" button unconditionally. Whether Google OAuth is actually wired up is decided server-side in `lib/auth.ts` (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` present). If those env vars are unset in an environment, the button is still shown and clicking it fails.

**Action:**
1. Add a tiny server-only helper, e.g. in `lib/auth/dal.ts` or a new `lib/auth/providers.ts`: `export function isGoogleAuthEnabled() { return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET); }`
2. `app/(store)/sign-in/page.tsx` is currently a thin Server Component wrapper. Have it call `isGoogleAuthEnabled()` and pass the boolean as a prop into `SignInForm` (e.g. `<SignInForm googleEnabled={isGoogleAuthEnabled()} />`).
3. In `SignInForm.tsx`, wrap the Google button block (and the "or" divider above it) in `{googleEnabled && (...)}`.
4. Do the same for `/sign-up` if it also renders a Google button — check `SignUpForm.tsx` first; if it doesn't offer Google sign-up, skip this file.

**Do not** expose the client ID/secret themselves to the client — only the boolean.

## 1c. Add `returnTo` support on forced sign-in

**Problem:** `middleware.ts` redirects unauthenticated `/account/*` requests to `/sign-in` with no indication of where the user was headed. `SignInForm.tsx` always does `router.push("/account")` on success, so a user trying to reach `/account/orders` always lands on the generic `/account` page after logging in.

**Action:**
1. In `middleware.ts`, when redirecting due to a missing session cookie, append the original path: `NextResponse.redirect(new URL(\`/sign-in?returnTo=${encodeURIComponent(pathname)}\`, request.url))`.
2. In `SignInForm.tsx`, read `returnTo` via the existing `useSearchParams()` instance (already used for `verified`). On successful sign-in, redirect there instead of the hardcoded `/account` — **but validate it first**: only accept it if it starts with `/account` (prevents an open-redirect via a crafted `returnTo` value pointing off-site or to an unrelated path). Fall back to `/account` if the param is missing or fails validation.
   ```ts
   const returnTo = searchParams.get("returnTo");
   const destination = returnTo && returnTo.startsWith("/account") ? returnTo : "/account";
   router.push(destination);
   ```
3. Leave the Google sign-in `callbackURL` (`/account`, hardcoded) alone unless you also want to thread `returnTo` through the OAuth callback — that's a nice-to-have, not required for this phase.

---

## Acceptance criteria

- `grep -r "createUserProfile" app lib` finds no matches.
- With `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` unset, `/sign-in` renders no Google button and no "or" divider.
- With them set, the button appears exactly as before.
- Visiting `/account/orders` while signed out redirects to `/sign-in?returnTo=%2Faccount%2Forders`; signing in from there lands on `/account/orders`, not `/account`.
- Visiting `/sign-in` directly (no `returnTo`) still lands on `/account` after sign-in, as before.
- Build passes with no new type errors.
