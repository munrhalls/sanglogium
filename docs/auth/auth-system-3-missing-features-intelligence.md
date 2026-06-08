# Auth System — 3 Missing Features Intelligence

**Date:** June 2026  
**Stack:** Next.js 15 / React 19 / Better Auth v1.6.11 / Turso (SQLite) / Resend  
**Scope:** `verify-email`, `forgot-password`, `reset-password`  
**Method:** Source code traced file-by-file from auth config through every call site  
**Output:** Intelligence only — what should be. No implementation.

---

## 1. Verified System Baseline

All facts below are traced directly from source. No assumptions.

### 1.1 Auth Configuration (`lib/auth.ts`)

| Config Key | Value | Effect |
|---|---|---|
| `emailVerification.sendOnSignUp` | `true` | Verification email sent immediately on sign-up |
| `emailVerification.expiresIn` | `3600` (1 hour) | Token TTL |
| `emailAndPassword.requireEmailVerification` | `true` | Session is NOT created until email is verified |
| `emailAndPassword.autoSignIn` | `true` | Would auto-sign-in after sign-up, but blocked by `requireEmailVerification` |
| `emailAndPassword.sendResetPassword` | `sendResetPasswordEmail` | Wired via Resend |
| `emailAndPassword.resetPasswordTokenExpiresIn` | `3600` (1 hour) | Reset token TTL |
| `emailAndPassword.revokeSessionsOnPasswordReset` | `true` | All sessions revoked on password reset |
| `rateLimit /forget-password` | 3 req / 1 hr | Applied to the internal Better Auth endpoint |
| `rateLimit /sign-in/email` | 5 req / 15 min | |
| `rateLimit /sign-up/email` | 3 req / 1 hr | |
| `baseUrl` | `BETTER_AUTH_URL \|\| NEXT_PUBLIC_BASE_URL` | Used as fallback redirect destination |

### 1.2 Email Provider (`lib/email.ts`)

| Function | URL built | Subject |
|---|---|---|
| `sendVerificationEmail(data)` | `${baseUrl}/verify-email?token=${encodeURIComponent(token)}` | "Verify your email — Sang Logium" |
| `sendResetPasswordEmail(data)` | `${baseUrl}/reset-password?token=${encodeURIComponent(token)}` | "Reset your password — Sang Logium" |

Both functions ignore `data.url` (the URL Better Auth constructs from `redirectTo` / `callbackURL`) and build their own URLs directly from `data.token`. This is intentional and correct — the custom URL is equivalent.  
Fallback: when `RESEND_API_KEY` is absent, emails are logged to console only (dev mode).

### 1.3 Auth API Route (`app/api/auth/[...all]/route.ts`)

Single catch-all: `toNextJsHandler(auth)` — handles all Better Auth endpoints including `/api/auth/verify-email`, `/api/auth/forget-password`, `/api/auth/reset-password`, `/api/auth/sign-in/email`, `/api/auth/sign-up/email`.

### 1.4 Auth Client (`lib/auth-client.ts`)

`createAuthClient({ baseURL: NEXT_PUBLIC_BASE_URL || "http://localhost:3000" })` — no plugins, base client only. Available methods used across forms: `authClient.signIn.email`, `authClient.signUp.email`, `authClient.signIn.social`, `authClient.requestPasswordReset`, `authClient.resetPassword`, `authClient.sendVerificationEmail`.

### 1.5 Existing Sign-In / Sign-Up Pages (Reference)

**`app/(store)/sign-in/SignInForm.tsx`**
- `useActionState` form. Calls `authClient.signIn.email({ email, password })`.
- On error: displays `result.error.message` (plain text, no type-specific handling).
- On success: `router.push("/account")`.
- Has "Forgot password?" link to `/forgot-password`.
- Has Google OAuth via `authClient.signIn.social`.

**`app/(store)/sign-up/SignUpForm.tsx`**
- `useActionState` form. Calls `authClient.signUp.email({ email, password, name })`.
- On `result.error`: returns error state.
- On `!result.error`: returns `{ success: true }` → `useEffect` calls `router.push("/account")`.
- **CRITICAL NOTE:** With `requireEmailVerification: true`, sign-up succeeds (no error) but no session is created. This redirect to `/account` is currently broken — see Feature 1 below.

---

## 2. Feature: `verify-email`

### 2.1 What Exists (Traced)

**`app/(store)/verify-email/page.tsx`**
- Server Component, `Suspense` wrapper around `VerifyEmailForm`.

**`app/(store)/verify-email/VerifyEmailForm.tsx`**
- Client Component.
- Reads `token` from `useSearchParams()`.
- If `!token`: renders error state ("The verification link is missing or invalid.") with link to `/sign-in`.
- If `token` present: `useEffect` immediately executes `window.location.href = /api/auth/verify-email?token=${encodeURIComponent(token)}`.
- No `callbackURL` is appended to the redirect.
- Renders "Verifying Email... Please wait" while redirecting.

**How Better Auth handles `/api/auth/verify-email?token=...`:**
- Validates the token against the database.
- Marks `user.emailVerified = true`.
- With no `callbackURL` in the query, redirects to `baseURL` (home page: `/`).
- With `autoSignInAfterVerification` not set in `lib/auth.ts` (`emailVerification` block), Better Auth does **not** automatically create a session. The user is NOT signed in after this redirect.

**`app/(store)/sign-up/SignUpForm.tsx` (relevant gap):**
- `authClient.signUp.email()` with `requireEmailVerification: true` → user is created, email is sent, but no session is issued. The API returns success (no `result.error`).
- Form returns `{ success: true }` → `router.push("/account")`.
- `/account` calls `verifySession()` → `auth.api.getSession()` → no session → `redirect("/sign-in")`.
- **Result:** User signs up, gets bounced from `/account` to `/sign-in` with zero explanation.

**`app/(store)/sign-in/SignInForm.tsx` (relevant gap):**
- When a user with `emailVerified: false` tries to sign in, Better Auth returns a `result.error` with a message like "Email not verified".
- The form renders `result.error.message` as plain text.
- There is **no** detection of this specific error type, no resend link, no actionable path.

### 2.2 What SHOULD BE

#### 2.2.1 Sign-up success state

After `authClient.signUp.email()` returns no error (user created, verification email dispatched):

**The form must NOT redirect to `/account`.** No session exists. The correct state is:

```
"Account created! We've sent a verification email to {email}.
Click the link in the email to activate your account.
The link expires in 1 hour."
```

With a secondary line:
```
"Didn't receive it? Check your spam folder, or sign in to resend."
```

The submit button should be hidden once this state is shown. The form should stay on `/sign-up` (no navigation). This is purely a state change within `SignUpForm.tsx`.

#### 2.2.2 Verification link destination

`VerifyEmailForm.tsx` should append a `callbackURL` when redirecting to the Better Auth endpoint:

```
window.location.href = `/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=/sign-in?verified=true`
```

This ensures Better Auth redirects to `/sign-in?verified=true` after successful verification, rather than the bare home page.

**Note:** `callbackURL` must be a relative path or a fully-qualified URL matching `trustedOrigins`. `/sign-in?verified=true` is a relative path and is safe.

#### 2.2.3 Sign-in page — `?verified=true` handling

`app/(store)/sign-in/SignInForm.tsx` (or a wrapping Server Component) should read `?verified=true` from the URL and display a success banner above the sign-in form:

```
"Email verified successfully. Please sign in to continue."
```

This banner should only appear when `searchParams.get("verified") === "true"` and should not appear on plain sign-in navigations.

**Data contract:** `SignInForm.tsx` already uses `useSearchParams` indirectly (via `useRouter`). Reading `verified` requires adding `useSearchParams` to `SignInForm.tsx` (already wrapped in `Suspense` in the parent page) or handling it in a Server Component layer above.

#### 2.2.4 Sign-in form — unverified email error handling

When `authClient.signIn.email()` returns an error indicating the email is not verified:

The error state should display the error message AND a "Resend verification email" link/button below it. Clicking it should call:

```ts
authClient.sendVerificationEmail({
  email,  // the email the user just tried to sign in with
  callbackURL: "/sign-in?verified=true"
})
```

States to handle:
- **Sending:** Button shows "Sending..." (disabled).
- **Sent:** Show "Verification email sent. Check your inbox." (button hidden or disabled).
- **Error on resend:** Show `resendResult.error.message`.

**Detection of the "unverified" error:** Better Auth returns a specific error code/message for unverified email. The form should detect this by checking `result.error.message` (case-insensitive contains check for "verified" or "verify") OR by checking Better Auth's `result.error.code` if exposed in v1.6.11.

**Note on email value availability:** The email is available via the form's `formData` in the `useActionState` handler. To make it available in the render phase for the resend button, it needs to be included in the returned state: `return { error: "...", emailNotVerified: true, email }`.

#### 2.2.5 Resend rate limiting (data contract)

Better Auth does not expose a dedicated rate limit for `sendVerificationEmail` in the current `lib/auth.ts` config. The global limit (10 req/60s) applies. No UI rate-limit feedback is needed beyond standard error display.

---

## 3. Feature: `forgot-password`

### 3.1 What Exists (Traced)

**`app/(store)/forgot-password/page.tsx`**
- Server Component, `Suspense` wrapper around `ForgotPasswordForm`.

**`app/(store)/forgot-password/ForgotPasswordForm.tsx`**
- Client Component, `useActionState` form.
- Single field: `email` (type=email, required).
- On submit: calls `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })`.
- On `result.error`: shows `result.error.message`.
- On success: shows enumeration-safe message: "If an account exists for this email, a reset link has been sent. Please check your inbox."
- Link back to `/sign-in` ("Remember your password? Sign in").

**Entry point:** `app/(store)/sign-in/SignInForm.tsx` has "Forgot password?" link to `/forgot-password`. ✓

**What Better Auth does on `requestPasswordReset`:**
- Calls `lib/auth.ts` → `emailAndPassword.sendResetPassword` → `lib/email.ts:sendResetPasswordEmail`.
- `sendResetPasswordEmail` builds: `${baseUrl}/reset-password?token=${encodeURIComponent(token)}` and sends via Resend.
- Rate limited: 3 req / 1 hr per the `/forget-password` custom rule.
- Returns success regardless of whether the email exists (enumeration-safe).

**Note on `redirectTo` parameter:** The `redirectTo: "/reset-password"` passed to `authClient.requestPasswordReset` is the URL Better Auth constructs into `data.url`. However, `sendResetPasswordEmail` ignores `data.url` and builds its own URL from `data.token` directly. The `redirectTo` param has no effect on the sent email URL. The result is equivalent: both paths produce `${baseUrl}/reset-password?token=...`. This is not a bug.

### 3.2 What SHOULD BE

The `forgot-password` flow is architecturally complete and functionally correct as implemented.

**Confirmed behaviors that are correct:**
- Enumeration-safe: identical success message whether email exists or not. ✓
- Rate limit: 3 req/hr on `/forget-password` (Better Auth internal endpoint). ✓
- Email contains correct reset URL. ✓
- "Forgot password?" entry point from sign-in form. ✓
- Loading state ("Sending...") on submit button. ✓

**No gaps. The should-be state is the existing implementation.**

---

## 4. Feature: `reset-password`

### 4.1 What Exists (Traced)

**`app/(store)/reset-password/page.tsx`**
- Server Component, `Suspense` wrapper around `ResetPasswordForm`.

**`app/(store)/reset-password/ResetPasswordForm.tsx`**
- Client Component, `useActionState` + `useSearchParams` + `useRouter`.
- Reads `token` from `?token` query param.
- Reads `callbackError` from `?error` query param (defensive: handles redirect-with-error from Better Auth if it occurs).
- **Guard states:**
  - `!token` → shows error banner + link to `/forgot-password` ("Request a new link"). Submit button disabled.
  - `callbackError` → shows expired/invalid error banner + link to `/forgot-password`.
- **Form fields:** `password` (new, type=password, required, minLength=8), `confirmPassword` (confirm, type=password, required, minLength=8).
- **Client-side validation:** `password !== confirmPassword` → returns `{ error: "Passwords do not match." }`.
- **Submission:** calls `authClient.resetPassword({ newPassword: password, token })`.
- On `result.error`: shows `result.error.message`.
- On success: shows "Password reset successfully. Redirecting to sign in..." + `useEffect` with `setTimeout(3000)` → `router.push("/sign-in")`. Submit button disabled in success state.

**What Better Auth does on `resetPassword`:**
- Validates token against the database (token expires after 1 hour per config).
- Resets the user's password (hashed via `scrypt`).
- With `revokeSessionsOnPasswordReset: true`: all active sessions for that user are invalidated.
- Returns success.

### 4.2 What SHOULD BE

The `reset-password` flow is architecturally complete and functionally correct as implemented.

**Confirmed behaviors that are correct:**
- Token guard: missing token shows error with actionable link. ✓
- Token in URL: passes raw token string directly to `authClient.resetPassword`. ✓
- Password match validation (client-side). ✓
- minLength=8 on both fields (matches server-side config). ✓
- Error display for expired / invalid tokens (from `result.error.message`). ✓
- Session revocation on reset (`revokeSessionsOnPasswordReset: true`). ✓
- Success → 3-second redirect to `/sign-in`. ✓
- Submit disabled during pending, no token, and after success (prevents double-submit). ✓

**No gaps. The should-be state is the existing implementation.**

---

## 5. Cross-Cutting Requirements

### 5.1 Environment Variables

| Variable | Required for email features | Notes |
|---|---|---|
| `RESEND_API_KEY` | Yes (production) | Without this, emails are console-logged only. Verification and reset emails will NOT be delivered to real users. |
| `RESEND_FROM_EMAIL` | No | Defaults to `onboarding@resend.dev`. Production should use a verified domain. |
| `NEXT_PUBLIC_BASE_URL` | Yes | Used in `sendVerificationEmail` and `sendResetPasswordEmail` to build email link URLs. Must match the live domain in production. |
| `BETTER_AUTH_URL` | Yes | Used as `baseUrl` in auth config. Better Auth redirects to this after email verification if no `callbackURL` is passed. |

### 5.2 Data Flow Summary (All 3 Features)

```
VERIFY-EMAIL
Sign-up form success
  → should show "check your email" state [MISSING]
  → (currently: router.push("/account") → no session → bounces to /sign-in)

User clicks email link → /verify-email?token=...
  → VerifyEmailForm redirects to /api/auth/verify-email?token=...
  → [MISSING: &callbackURL=/sign-in?verified=true]
  → Better Auth validates, marks emailVerified=true
  → redirects to baseURL (home) [SHOULD BE: /sign-in?verified=true]
  → user NOT auto-signed-in (autoSignInAfterVerification not configured, defaults false)
  → /sign-in should show verified banner [MISSING]

Sign-in with unverified email
  → Better Auth error "Email not verified"
  → form shows error message (exists)
  → should show resend link [MISSING]
  → authClient.sendVerificationEmail({ email, callbackURL: "/sign-in?verified=true" })

FORGOT-PASSWORD (complete — no missing pieces)
/sign-in → "Forgot password?" → /forgot-password
  → authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
  → sendResetPasswordEmail → Resend → email to user
  → /reset-password?token=...

RESET-PASSWORD (complete — no missing pieces)
/reset-password?token=...
  → ResetPasswordForm reads token
  → authClient.resetPassword({ newPassword, token })
  → revokeSessionsOnPasswordReset → all sessions invalidated
  → router.push("/sign-in") after 3s
```

### 5.3 Summary: Gaps vs. Complete

| Feature | Status | Gaps |
|---|---|---|
| `verify-email` | **Incomplete** | 4 gaps (sign-up success state, post-verification destination, `?verified=true` on sign-in, resend on sign-in error) |
| `forgot-password` | **Complete** | None |
| `reset-password` | **Complete** | None |

### 5.4 Files Affected by Missing verify-email Pieces

| Gap | File to modify | Change summary |
|---|---|---|
| Sign-up: show "check email" instead of redirect | `app/(store)/sign-up/SignUpForm.tsx` | Return `{ success: true, email }` state; render "check email" UI; remove `router.push("/account")` |
| Post-verification destination | `app/(store)/verify-email/VerifyEmailForm.tsx` | Append `&callbackURL=/sign-in?verified=true` to the redirect URL |
| Sign-in: show "email verified" banner | `app/(store)/sign-in/SignInForm.tsx` | Add `useSearchParams`; read `?verified=true`; render success banner |
| Sign-in: resend link on unverified error | `app/(store)/sign-in/SignInForm.tsx` | Detect unverified error type in state; render resend button; call `authClient.sendVerificationEmail` |

---

*All source references verified against HEAD as of June 2026. Better Auth version: 1.6.11.*
