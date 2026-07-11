# Account & Authentication — Audit Verification + Gap Analysis

**Date:** 2026-07-11
**Method:** Every claim below was checked directly against source in this repo (not against other docs, not against memory of prior sessions). Where an older internal doc disagreed with current source, current source wins and the doc is flagged stale.
**Stack confirmed:** better-auth 1.6.11 + `@better-auth/kysely-adapter` + Turso/libSQL, Next.js 15 App Router, React 19, Sanity v3.

---

## Part A — Verification of the submitted audit

**Verdict: the submitted audit is accurate.** Every "finished/functional" claim and every "not yet present" claim checks out against current source. One phrasing is imprecise; no factual errors found.

| Audit claim | Verified against | Result |
|---|---|---|
| better-auth v1.6.11, kysely-adapter, Turso/SQLite via `lib/auth.ts` | `package.json`, `lib/auth.ts:1-58` | ✅ exact |
| Email verification required, 1-hour expiry, `verify-email` redirects with `callbackURL` | `lib/auth.ts:87-91`, `VerifyEmailForm.tsx:24` | ✅ exact |
| Sign-in shows verified banner + resend link | `SignInForm.tsx:77-105` | ✅ exact |
| Sign-up shows "check your email" instead of redirecting | `SignUpForm.tsx:33-51` | ✅ exact |
| Forgot/reset password complete, token-guarded, rate-limited | `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`, `lib/auth.ts:82-85` (3/hr) | ✅ exact |
| Google OAuth conditional on env vars | `lib/auth.ts:102-111` | ✅ exact — server-side gating is real |
| `dal.ts` three guards + auto-heal `userProfile` | `lib/auth/dal.ts` full file | ✅ exact |
| Middleware protects `/account/*` | `middleware.ts:9-15` | ✅ exact |
| Navbar server/client split | `NavbarActionsServer.tsx`, `NavbarActions.tsx` | ✅ exact |
| Account page + AccountActions (change password revokes sessions, sign out, sign out all) | `account/page.tsx`, `AccountActions.client.tsx` | ✅ exact — `revokeOtherSessions: true` confirmed line 40 |
| Order history queries Sanity by `userId`; Stripe metadata carries `userId` | `orders/page.tsx:20-25`, `payment-intent-session/route.ts:116`, `createOrderFromPaymentIntent.ts:121,259` | ✅ exact |
| `userProfile` schema fields (`authId`, `email`, `name`, `stripeCustomerId`, `addresses`) | `sanity-cms/schemaTypes/userType.ts:10-50` | ✅ exact |
| Not present: profile editing, address book, email change, order detail/invoice/tracking, account deletion/GDPR, wishlist, notification prefs, other providers, 2FA, remember-device, guest→account merge | Targeted greps across `app/`, `lib/`, `sanity-cms/` — see Part C | ✅ all confirmed absent |
| `RESEND_API_KEY` optional, console-log fallback | `lib/email.ts:9-20` | ✅ exact |
| `sign-up/actions.ts` "effectively superseded" | `grep createUserProfile` → only self-reference + docs | ⚠️ **understated** — it is not just superseded, it is **dead code**: never imported, never called from any route or component. Safe to delete outright, not just deprioritize. |

No false claims. No missing caveats. The one correction above is a severity nuance, not a factual error.

---

## Part B — Best-practice grounding (why the gap list below is shaped this way)

Sourced from OWASP Authentication/Session Management Cheat Sheets and 2026 e-commerce IAM coverage (Corbado, Shopify, Descope — see links at end).

- **Reauthentication before sensitive changes** (password, email, account deletion, new/suspicious device) is a standing OWASP recommendation. This codebase already does it correctly for password change (`requireFreshSession()` check before `changePassword`) — the same pattern must be reused for email change and account deletion, not reinvented.
- **Session hygiene**: unique unpredictable session IDs, idle/absolute timeouts, explicit revocation — already handled by better-auth defaults (7-day expiry, daily refresh, `revokeSessionsOnPasswordReset`). Cookie flag-level detail (httpOnly/secure/sameSite) was not independently re-derived byte-by-byte; it is inherited from better-auth's Next.js cookie plugin defaults and is out of scope for this pass.
- **Guest checkout stays the default**, but leading platforms (Shopify, Stripe) now treat guest→account linking as a first-class flow rather than leaving historical orders orphaned. Sang Logium already links orders **going forward** (userId at creation time); linking **backward** (existing guest orders by email, after sign-up) is the industry-standard companion feature that's missing.
- **MFA/passkeys** are trending but not baseline-mandatory for a mid-size e-commerce store; treated as a lower-priority phase here, not an urgent gap.
- **Account deletion / data export** is a compliance expectation (GDPR) once a privacy policy makes the claim — and this repo's `privacy-policy/page.tsx` already asserts a GDPR right to deletion with no mechanism behind it. That's a compliance-risk gap, not just a UX one.

Sources: [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) · [Corbado — E-Commerce Authentication 2026 Benchmark](https://www.corbado.com/blog/ecommerce-authentication) · [Shopify — Customer Authentication Best Practices 2026](https://www.shopify.com/enterprise/blog/customer-authentication-best-practices) · [Descope — Authentication in Ecommerce](https://www.descope.com/blog/post/auth-in-ecomm)

---

## Part C — Complete gap list (false positives explicitly called out)

### C.1 — False positives found and corrected

Two internal docs in this repo (`docs/user-account/user-account-system-intelligence.md`, dated 2026-06-10) describe blockers that **no longer exist**. Both were checked against current source and are stale — the fixing commit landed the same day the doc was written:

| Old claim | Current source reality | Verdict |
|---|---|---|
| "Orders are ALWAYS guest orders — no order in the system is linked to a user account" | `payment-intent-session/route.ts:116` sets `userId` from the auth session; `createOrderFromPaymentIntent.ts:259` sets `isGuest: false` when `userId` is present; `orders/page.tsx` runs a real `userId`-filtered GROQ query | **False positive — already fixed** |
| "Nav has no Create Account entry — only a Sign In link" | `NavbarActions.tsx:62-73` renders both a Sign In and a Sign Up nav item when unauthenticated | **False positive — already fixed** |
| "Sign-out inconsistency — navbar stays on page, account page redirects" | Both call the same `signOut()` in `app/hooks/useSignOut.ts`, which always does `window.location.href = "/sign-in"` | **False positive — already fixed** |

These are not re-listed as gaps below.

### C.2 — Real gaps carried over from the submitted audit (all re-verified true)

| # | Gap | Verified absence |
|---|---|---|
| G1 | Profile editing (name) | No route/action found for `updateUser` anywhere in `app/` |
| G2 | Address book ("My Addresses") | `userProfile.addresses[]` exists in schema; nothing reads/writes it outside checkout's own temporary cookie |
| G3 | Email change | No `user.changeEmail` config block in `lib/auth.ts`, no UI |
| G4 | Order detail / invoice / tracking | `order` schema already carries `shippingMethod.trackingNumber/trackingUrl`, full `items`, `payment` — this is a pure UI/route gap, no schema work needed |
| G5 | Account deletion / GDPR export | No `user.deleteUser` config block in `lib/auth.ts`, no UI, no export mechanism |
| G6 | Wishlist/favorites | No schema, no UI |
| G7 | Notification preferences | No schema, no UI |
| G8 | Additional social providers | Only `google` key in `socialProviders` |
| G9 | 2FA/MFA | No `twoFactor()` plugin in `lib/auth.ts` plugins array |
| G10 | "Remember this device" control | Session is a fixed 7-day expiry; no per-session user-facing control |
| G11 | Guest→account order merge | Orders link `userId` only at creation time; no retroactive linking by email after sign-up |

### C.3 — Additional real gaps found beyond the submitted audit (verified true, not false positives)

| # | Gap | Verified true because |
|---|---|---|
| G12 | No `returnTo` after forced sign-in | `middleware.ts:13` redirects to `/sign-in` with no query param; `SignInForm.tsx:46` unconditionally does `router.push("/account")` on success — a user bounced from `/account/orders` always lands on `/account` |
| G13 | Google button shown even when not configured | `SignInForm.tsx:169-175` renders the Google button unconditionally; the env-var gate in `lib/auth.ts:103` is server-side only and never surfaced to the client — if `GOOGLE_CLIENT_ID`/`SECRET` are unset, clicking the button fails against a provider that doesn't exist |
| G14 | Dead code in `sign-up/actions.ts` | `createUserProfile()` exported, zero call sites outside itself and docs — maintenance/confusion risk, not a runtime bug |

### C.4 — Not treated as gaps

- Passkey/passwordless login — emerging best practice, not a baseline requirement; password + email verification + rate limiting is an accepted industry floor.
- Cookie flag hardening (httpOnly/secure/sameSite) — inherited from better-auth's `nextCookies()` plugin defaults; not independently re-derived at the byte level in this pass.

---

## Part D — Where the closure plans live

Each gap above has a standalone, dependency-ordered implementation spec under `docs/auth/devin-tasks/`, sized so a single task can be handed to an agent without it needing the rest of the codebase in context. Start at `docs/auth/devin-tasks/00-README.md`.

| Phase file | Closes |
|---|---|
| `01-quick-fixes.md` | G12, G13, G14 |
| `02-profile-name-edit.md` | G1 |
| `03-profile-email-change.md` | G3 |
| `04-address-book.md` | G2 |
| `05-order-detail-page.md` | G4 |
| `06-account-deletion-gdpr-export.md` | G5 |
| `07-guest-to-account-order-merge.md` | G11 |
| `08-notification-preferences.md` | G7 |
| `09-wishlist-favorites.md` | G6 |
| `10-two-factor-auth.md` | G9, G10 |
| `11-additional-social-providers.md` | G8 |
