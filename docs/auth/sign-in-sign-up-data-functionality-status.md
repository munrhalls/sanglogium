# Sign In / Sign Up — Data & Functionality Layer Status Report

**Scope:** Data and functionality only. Visual UX excluded.  
**Last verified:** 2026-06-05

---

## 1. Server Configuration

### `lib/auth.ts`

Central Better Auth configuration. Exports the `auth` object.

- **Database:** `kyselyAdapter` over SQLite (local dev) or Turso `libsql://` (production). Production validation throws if `DATABASE_URL` is not `libsql://` or `http` and lacks `TURSO_AUTH_TOKEN`.
- **Secret:** Single `BETTER_AUTH_SECRET` required. Optional `BETTER_AUTH_SECRETS` for non-destructive rotation (`version:value,version:value` comma-separated; highest version = active).
- **Session:** 7-day expiry, 24-hour updateAge, 5-minute freshAge. `cookieCache` enabled (`compact` strategy, 5-minute maxAge).
- **Rate limiting:** Global: 10 requests / 60s. Custom rules: `/sign-in/email` = 5 / 15min; `/sign-up/email` = 3 / 1hr; `/forget-password` = 3 / 1hr. Default in-memory storage (serverless caveat).
- **Email verification:** Required on sign-up. Link expires in 1 hour. Sent via `sendVerificationEmail` (Resend, falls back to console log). Custom `/verify-email` route consumes the token.
- **Email + password:** Enabled. Min 8 / max 128 chars. Auto-sign-in after sign-up. Reset password token expires in 1 hour. All sessions revoked on password reset. `sendResetPasswordEmail` wired via Resend. Custom `/reset-password` route consumes the token.
- **Social:** Google OAuth, conditionally enabled via env vars.
- **Database hook:** `user.create.after` attempts to create a Sanity `userProfile` (authId, email, name). If Sanity fails, the user is already persisted in Better Auth — true atomic rollback is architecturally impossible from an `after` hook. Deferred healing via `lib/auth/dal.ts` (`ensureUserProfile`) auto-creates the missing profile on first protected page load.
- **Plugin:** `nextCookies()` for Next.js cookie integration.

### `app/api/auth/[...all]/route.ts`

Catch-all route. Exports `GET` and `POST` via `toNextJsHandler(auth)`. Every Better Auth API call (sign-in, sign-up, session, password reset, email verification, etc.) routes through here.

---

## 2. Client Interface

### `lib/auth-client.ts`

Single `authClient` instance from `createAuthClient`. `baseURL` = `NEXT_PUBLIC_BASE_URL` or `http://localhost:3000`. Used by all client components to call Better Auth endpoints.

---

## 3. Data Access Layer (DAL)

### `lib/auth/dal.ts`

Server-only. Three guards with distinct contracts:

| Function | Context | No session | Healing |
|---|---|---|---|
| `verifySession()` | Server Components (pages) | Redirects to `/sign-in` | Calls `ensureUserProfile()` |
| `getSession()` | API Routes / Route Handlers | Returns `null` (caller returns 401) | None |
| `requireSession()` | Server Actions | Throws `Error("Unauthorized")` | None |

`ensureUserProfile()` fetches existing Sanity `userProfile` by `authId`; if missing, creates it. In-memory 5-minute TTL cache per-request. Never throws — auth flow is never blocked by Sanity unavailability.

---

## 4. Email Provider

### `lib/email.ts`

Resend integration with graceful dev fallback (console log when `RESEND_API_KEY` is absent).

- `sendVerificationEmail(user, url, token)` — constructs custom URL to `/verify-email?token=...`, sends email, falls back to console log.
- `sendResetPasswordEmail(user, url, token)` — constructs custom URL to `/reset-password?token=...`, sends email, falls back to console log.

`RESEND_FROM_EMAIL` defaults to `onboarding@resend.dev`.

---

## 5. Route Protection

### `middleware.ts`

Checks `getSessionCookie()` on `/account*` routes. Redirects to `/sign-in` if no cookie. **UX layer only** — not a security boundary. `verifySession()` in each protected page is the actual security gate (CVE-2025-29927 defense).

---

## 6. Auth Pages & Forms

### Sign In

**`app/(store)/sign-in/page.tsx`** — Server Component wrapper.  
**`app/(store)/sign-in/SignInForm.tsx`** — Client component. `useActionState` form. Calls `authClient.signIn.email({ email, password })`. On success, `router.push("/account")`. Also provides Google OAuth via `authClient.signIn.social({ provider: "google" })`. "Forgot password?" link to `/forgot-password`. Sign-up link to `/sign-up`.

### Sign Up

**`app/(store)/sign-up/page.tsx`** — Server Component wrapper with `Suspense`.  
**`app/(store)/sign-up/SignUpForm.tsx`** — Client component. `useActionState` form. Calls `authClient.signUp.email({ email, password, name })`. On success, `router.push("/account")`. Reads optional `?email` from URL for prefill. Client-side `minLength={8}` on password (server-side enforced by Better Auth config).  
**`app/(store)/sign-up/actions.ts`** — Server action `createUserProfile(input)`. Fetch-before-create idempotent Sanity write. **No longer called client-side**; `databaseHooks` handles profile creation server-side. Retained as a standalone utility.

### Forgot Password

**`app/(store)/forgot-password/page.tsx`** — Server Component wrapper with `Suspense`.  
**`app/(store)/forgot-password/ForgotPasswordForm.tsx`** — Client component. Calls `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })`. Enumeration-safe success message: "If an account exists for this email, a reset link has been sent."

### Reset Password

**`app/(store)/reset-password/page.tsx`** — Server Component wrapper with `Suspense`.  
**`app/(store)/reset-password/ResetPasswordForm.tsx`** — Client component. Reads `?token` and `?error` from URL. If `error=INVALID_TOKEN`, shows "Invalid or expired reset token" with link to request new link. Validates password confirmation match. Calls `authClient.resetPassword({ newPassword, token })`. On success, redirects to `/sign-in` after 3 seconds. Submit disabled if no token or already successful.

### Verify Email

**`app/(store)/verify-email/page.tsx`** — Server Component wrapper with `Suspense`.  
**`app/(store)/verify-email/VerifyEmailForm.tsx`** — Client component. Reads `?token`. If missing, shows error state with link to `/sign-in`. If present, immediately redirects browser to Better Auth verification endpoint: `/api/auth/verify-email?token=...`. Better Auth validates server-side and redirects to `baseURL` on success.

### Account

**`app/(store)/account/page.tsx`** — Async Server Component. Calls `verifySession()` (redirects to `/sign-in` if unauthenticated). Displays welcome message. Renders `AccountActionsClient`.  
**`app/(store)/account/AccountActions.client.tsx`** — Client component with two sections:

1. **Change Password** — `useActionState` form. Calls `requireFreshSession()` before proceeding; if session is missing or stale, hard-navigates to `/sign-in`. Validates password confirmation. Calls `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`.
2. **Session Management** — Two buttons:
   - **Sign Out** — calls `authClient.signOut()`, redirects to `/sign-in`.
   - **Sign Out All Devices** — calls `requireFreshSession()`, then `authClient.revokeSessions()`, redirects to `/sign-in`.

---

## 7. Environment Variables

From `.env.example` — auth-relevant subset:

| Variable | Required | Purpose |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | 32+ char secret |
| `BETTER_AUTH_SECRETS` | No | Versioned secrets for rotation |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks |
| `DATABASE_URL` | Yes | SQLite file (dev) or Turso URL (prod) |
| `TURSO_AUTH_TOKEN` | Prod only | Turso auth token |
| `RESEND_API_KEY` | No | Transactional email (falls back to console log) |
| `RESEND_FROM_EMAIL` | No | Sender address (default: onboarding@resend.dev) |
| `GOOGLE_CLIENT_ID` | No | OAuth (conditional) |
| `GOOGLE_CLIENT_SECRET` | No | OAuth (conditional) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Client-side auth client baseURL |

---

## 8. Data Flow Matrix

| Flow | Entry | Server Action / Hook | DAL | Email | Redirect |
|---|---|---|---|---|---|
| Sign up | `SignUpForm.tsx` | `authClient.signUp.email` → `databaseHooks.user.create.after` | `ensureUserProfile()` (healing) | `sendVerificationEmail` → `/verify-email` | `/account` |
| Sign in | `SignInForm.tsx` | `authClient.signIn.email` | `verifySession()` on next page | — | `/account` |
| Google OAuth | `SignInForm.tsx` | `authClient.signIn.social` → callback | `ensureUserProfile()` (healing) | — | `/account` |
| Forgot password | `ForgotPasswordForm.tsx` | `authClient.requestPasswordReset` | — | `sendResetPasswordEmail` → `/reset-password` | — |
| Reset password | `ResetPasswordForm.tsx` | `authClient.resetPassword` | — | — | `/sign-in` |
| Change password | `AccountActions.client.tsx` | `authClient.changePassword` | `requireFreshSession()` | — | — |
| Sign out | `AccountActions.client.tsx` | `authClient.signOut` | — | — | `/sign-in` |
| Sign out all devices | `AccountActions.client.tsx` | `authClient.revokeSessions` | `requireFreshSession()` | — | `/sign-in` |
| Email verification | `verify-email/page.tsx` | Browser redirect to `/api/auth/verify-email` | `verifySession()` on next protected page | `sendVerificationEmail` | `baseURL` |

---

## 9. Security Controls

| Control | Implementation | Location |
|---|---|---|
| Password hashing | `scrypt` (Better Auth default) | `lib/auth.ts` |
| Password policy | Min 8 / max 128, server-side | `lib/auth.ts` |
| Email verification | Required before sign-in | `lib/auth.ts` |
| Session expiry | 7 days, sliding 1-day window | `lib/auth.ts` |
| Session freshness | 5-minute `freshAge` | `lib/auth.ts` |
| Session revocation on reset | `revokeSessionsOnPasswordReset: true` | `lib/auth.ts` |
| Session revocation on change | `revokeOtherSessions: true` | `AccountActions.client.tsx` |
| Rate limiting | Global + per-endpoint rules | `lib/auth.ts` |
| CSRF protection | Default Better Auth (no overrides) | `lib/auth.ts` |
| Cookie security | `HttpOnly`, `Secure` (when HTTPS), `SameSite=Lax` | `better-auth/next-js` |
| Middleware bypass defense | DAL (`verifySession`) is the security boundary, not middleware | `lib/auth/dal.ts` |
| Email enumeration | Generic errors on sign-in; 200 on reset regardless of email existence | Better Auth default |
| Enumeration-safe forgot | Generic success message | `ForgotPasswordForm.tsx` |
| Stale session guard | Hard redirect to `/sign-in` (not silent rejection) | `AccountActions.client.tsx` |
| Trusted origins | Env-driven, no wildcards | `lib/auth.ts` |
| Secret rotation | Non-destructive via `secrets` array | `lib/auth.ts` |

---

## 10. Source File Inventory

All files traced for this report:

| # | File | Role |
|---|---|---|
| 1 | `lib/auth.ts` | Better Auth configuration |
| 2 | `lib/auth-client.ts` | Client-side auth client |
| 3 | `lib/auth/dal.ts` | Server-only DAL guards |
| 4 | `lib/email.ts` | Resend email functions |
| 5 | `middleware.ts` | Route protection (UX layer) |
| 6 | `app/api/auth/[...all]/route.ts` | Catch-all auth API route |
| 7 | `app/(store)/sign-in/page.tsx` | Sign-in page wrapper |
| 8 | `app/(store)/sign-in/SignInForm.tsx` | Sign-in form |
| 9 | `app/(store)/sign-up/page.tsx` | Sign-up page wrapper |
| 10 | `app/(store)/sign-up/SignUpForm.tsx` | Sign-up form |
| 11 | `app/(store)/sign-up/actions.ts` | `createUserProfile` server action |
| 12 | `app/(store)/forgot-password/page.tsx` | Forgot password page wrapper |
| 13 | `app/(store)/forgot-password/ForgotPasswordForm.tsx` | Forgot password form |
| 14 | `app/(store)/reset-password/page.tsx` | Reset password page wrapper |
| 15 | `app/(store)/reset-password/ResetPasswordForm.tsx` | Reset password form |
| 16 | `app/(store)/verify-email/page.tsx` | Verify email page wrapper |
| 17 | `app/(store)/verify-email/VerifyEmailForm.tsx` | Verify email handler |
| 18 | `app/(store)/account/page.tsx` | Account page |
| 19 | `app/(store)/account/AccountActions.client.tsx` | Password change + session management |
| 20 | `.env.example` | Auth-relevant env vars |
