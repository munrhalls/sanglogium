# Auth System Source Code Synopsis

## Stack
- **Auth framework:** `better-auth` v1.6.11 with `@better-auth/kysely-adapter`
- **Database:** SQLite (local `better-auth.db`) or Turso (`libsql://`) in production
- **Email:** Resend (falls back to console log in dev)
- **Social:** Google OAuth (conditional on env vars)

---

## Core Configuration

### `lib/auth.ts`
Better Auth instance. Key settings:
- **Session:** 7-day expiry, 5-min fresh age, cookie cache enabled
- **Rate limits:** 10 req/60s default; stricter for sign-in (5/15min), sign-up (3/1hr), forgot-password (3/1hr)
- **Email verification:** Required before sign-in; 1-hour token expiry
- **Password:** 8–128 chars; auto-sign-in after sign-up; password reset revokes all sessions
- **Social:** Google OAuth optional (enabled only if `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` set)
- **Database hook:** `user.create.after` → auto-creates `userProfile` doc in Sanity on registration
- **Plugin:** `nextCookies()` for Next.js cookie handling

### `lib/auth-client.ts`
Thin React client: `createAuthClient({ baseURL })`. Used by all client components.

### `app/api/auth/[...all]/route.ts`
Single catch-all route exposing Better Auth's REST API: `toNextJsHandler(auth)`.

---

## Session Guards (`lib/auth/dal.ts`)

Three server-side guards, all reading the session from request headers:

| Guard | Redirects? | Use case | Healing |
|-------|-----------|----------|---------|
| `verifySession()` | Yes → `/sign-in` | Server Components (pages) | Auto-creates missing `userProfile` in Sanity + 5-min in-memory cache |
| `getSession()` | No (returns `null`) | API Routes / Route Handlers | None |
| `requireSession()` | Throws "Unauthorized" | Server Actions | None |

---

## Email (`lib/email.ts`)

Resend wrapper. Sends verification and password-reset emails. If `RESEND_API_KEY` missing, logs URL to console for dev.

---

## Pages & Forms

### `/sign-in`
- **File:** `app/(store)/sign-in/SignInForm.tsx`
- Actions: email/password via `authClient.signIn.email()`, Google via `authClient.signIn.social()`
- UX: handles `?verified=true` query param, shows success banner; unverified email → shows "Resend verification email" link
- On success: `router.push("/account")`

### `/sign-up`
- **File:** `app/(store)/sign-up/SignUpForm.tsx`
- Action: `authClient.signUp.email({ email, password, name })`
- Success state: shows "Check your email" with the email address displayed
- `actions.ts`: deprecated server action `createUserProfile()` (hook in `lib/auth.ts` now handles this)

### `/verify-email`
- **File:** `app/(store)/verify-email/VerifyEmailForm.tsx`
- On mount: redirects browser to `/api/auth/verify-email?token=...&callbackURL=/sign-in?verified=true`
- Better Auth validates token server-side, then redirects back

### `/forgot-password`
- **File:** `app/(store)/forgot-password/ForgotPasswordForm.tsx`
- Action: `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })`
- Always shows ambiguous success message ("If an account exists...")

### `/reset-password`
- **File:** `app/(store)/reset-password/ResetPasswordForm.tsx`
- Reads `?token=` from URL; requires password + confirm match
- Action: `authClient.resetPassword({ newPassword, token })`
- On success: 3-second countdown redirect to `/sign-in`

### `/account`
- **File:** `app/(store)/account/page.tsx` (Server Component) + `AccountActions.client.tsx`
- Protected by `verifySession()`
- Displays welcome message + links to `/account/orders`
- **Client actions:**
  - Change password (requires fresh session, revokes other sessions)
  - Sign out
  - Sign out all devices (revoke all sessions)

### `/account/orders`
- **File:** `app/(store)/account/orders/page.tsx`
- Protected by `verifySession()`
- Placeholder page: "No orders yet."

---

## Middleware (`middleware.ts`)

- Protects `/account/*` routes by checking for session cookie via `getSessionCookie(request)`
- Missing cookie → redirect to `/sign-in`
- Sets `x-show-modal` header (legacy, appears unused)

---

## Header Integration

### `app/components/layout/header/NavbarActionsServer.tsx`
Server Component: reads `getSessionCookie(headersList)` → passes `isAuthenticated` boolean to client component.

### `app/components/layout/header/NavbarActions.tsx`
Client Component: shows `UserIcon` + dropdown (Account, Orders, Sign Out) when authenticated; `SignInIcon` linking to `/sign-in` when not.

---

## Sanity Schema (`sanity-cms/schemaTypes/userType.ts`)

`userProfile` document:
- `authId` (string, required) — Better Auth user ID
- `email` (string, required)
- `name` (string)
- `stripeCustomerId` (string) — set on first payment
- `addresses` (array of objects) — full address fields

---

## Data Flow Summary

```
Sign Up
  → Better Auth creates user in SQLite/Turso
  → databaseHook "user.create.after" → creates userProfile in Sanity
  → (if Sanity fails) verifySession() heals missing profile on next auth page load

Sign In
  → authClient.signIn.email() → calls /api/auth/sign-in/email
  → if email unverified → error + resend link UI
  → if success → cookie set, redirect to /account

Session Check
  → Server: verifySession() / getSession() / requireSession() (reads cookie from headers)
  → Client: authClient.getSession() (reads cookie)
  → Middleware: getSessionCookie(request) (lightweight, no DB hit)

Password Reset
  → /forgot-password → requestPasswordReset() → email sent
  → user clicks link → /reset-password?token=...
  → form submits → resetPassword() → redirect to /sign-in
```

---

## Env Vars Required

| Var | Purpose |
|-----|---------|
| `BETTER_AUTH_SECRET` | Required. Token signing |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_BASE_URL` | Base URL for callbacks |
| `DATABASE_URL` | SQLite file (default `file:./better-auth.db`) or Turso URL |
| `TURSO_AUTH_TOKEN` | Required in production with Turso |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional; enables Google OAuth |
| `RESEND_API_KEY` | Optional; enables real email sending |
| `RESEND_FROM_EMAIL` | Optional; defaults to `onboarding@resend.dev` |

---

## Production Readiness Notes

- `validateProductionConfig()` enforces Turso `libsql://` URL + `TURSO_AUTH_TOKEN` in production
- `BETTER_AUTH_SECRETS` supports secret rotation (comma-separated `version:value` pairs)
- Rate limiting is active with custom rules for sensitive endpoints
- Session revocation on password reset is enabled
- Cookie cache strategy is "compact" (5-min max age)
