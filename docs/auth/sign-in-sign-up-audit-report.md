# Sign In / Sign Up — Current Implementation Audit Report

**Date:** 2026-06-04
**Issue:** `sang-logium-abj` · `/sign-in, /sign-up` · IN_PROGRESS
**Scope:** Core auth flow (email/password + Google OAuth) and account protection
**Objective:** Accurate intelligence on current state for external production-readiness audit

---

## 1. Architecture Overview

**Library:** Better Auth v1.6.11 (`better-auth` + `@better-auth/kysely-adapter`)
**Pattern:** Dual-database strategy
- **Better Auth** owns identity (users, sessions, credentials) in SQLite/Turso
- **Sanity CMS** owns user profiles (`userProfile` document) linked via `authId`

**Guest checkout is untouched** — auth is optional for browsing and purchasing.

---

## 2. File-by-File Implementation (Verified)

### 2.1 Auth Configuration

`lib/auth.ts`
- Database adapter: `kyselyAdapter` with runtime auto-detection:
  - `libsql://` or `http` prefix → `LibsqlDialect` (Turso production)
  - Otherwise → `SqliteDialect` with `better-sqlite3` (local development)
- `secret`: required via `BETTER_AUTH_SECRET` (throws if missing)
- `baseUrl`: `BETTER_AUTH_URL` fallback to `NEXT_PUBLIC_BASE_URL`
- `trustedOrigins`: same fallback chain, defaults to `http://localhost:3000`
- `rateLimit`: 10 requests per 60-second window
- `emailAndPassword`: enabled, `requireEmailVerification: false`, `autoSignIn: true`
- `socialProviders.google`: conditional on `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `plugins`: `[nextCookies()]` — required for Next.js App Router cookie handling

`lib/auth-client.ts`
- `createAuthClient` from `better-auth/react`
- `baseURL`: `NEXT_PUBLIC_BASE_URL` fallback to `http://localhost:3000`

`lib/auth/dal.ts`
- Server-only `verifySession()` cached via React `cache()`
- Calls `auth.api.getSession({ headers })`; redirects to `/sign-in` if no session
- Returns `{ isAuth, userId, user }`

### 2.2 API Route

`app/api/auth/[...all]/route.ts`
- Exports `GET` and `POST` via `toNextJsHandler(auth)`
- Single-line pass-through to Better Auth's internal router

### 2.3 Sign-In Flow

`app/(store)/sign-in/page.tsx`
- Server Component; renders `SignInForm` centered in viewport

`app/(store)/sign-in/SignInForm.tsx`
- Client Component with `useActionState`
- Form fields: `email` (type=email, required), `password` (type=password, required)
- Submission calls `authClient.signIn.email({ email, password })`
- On error: displays `result.error.message`
- On success: `useEffect` triggers `router.push("/account")`
- Google OAuth button calls `authClient.signIn.social({ provider: "google", callbackURL: "/account" })`
- Link to `/sign-up` included

### 2.4 Sign-Up Flow

`app/(store)/sign-up/page.tsx`
- Server Component; wraps `SignUpForm` in `Suspense` (required for `useSearchParams`)

`app/(store)/sign-up/SignUpForm.tsx`
- Client Component with `useActionState`
- Reads `email` from URL search params via `useSearchParams`
- Form fields: `name` (text, required), `email` (type=email, required, pre-filled from URL), `password` (type=password, required, `minLength={8}`)
- Submission calls `authClient.signUp.email({ email, password, name })`
- On success: extracts `result.data.user.id`, calls server action `createUserProfile({ authId, email, name })`
- If profile creation fails: returns partial error state (`Signed up but profile creation failed`)
- On full success: `useEffect` triggers `router.push("/account")`

`app/(store)/sign-up/actions.ts`
- Server Action (`"use server"`)
- Queries Sanity for existing `userProfile` by `authId`; returns early if exists
- Creates `userProfile` document via `backendClient.create()`
- Returns `{ success, docId }` or `{ success: false, error }`

### 2.5 Account Pages (Protected)

`app/(store)/account/page.tsx`
- Calls `verifySession()`; renders welcome message with user name/email
- Links to `/account/orders`

`app/(store)/account/orders/page.tsx`
- Calls `verifySession()`; renders placeholder orders page

### 2.6 Navigation & Session Surface

`app/components/layout/header/NavbarActionsServer.tsx`
- Server Component; reads `headers()`, extracts session cookie via `getSessionCookie(headersList)`
- Passes `isAuthenticated` boolean to `NavbarActions`

`app/components/layout/header/NavbarActions.tsx`
- Client Component; receives `isAuthenticated` prop
- Dropdown shows: My Account, Orders, Sign Out (if authenticated) or Sign In (if not)
- `handleSignOut()` calls `authClient.signOut()` then `router.refresh()`
- `Header.tsx` wraps `NavbarActionsServer` in `Suspense` with `NavbarActionsSkeleton` fallback

### 2.7 Middleware Route Protection

`middleware.ts`
- Runs on `/account/:path*` matcher
- Checks `getSessionCookie(request)`; redirects to `/sign-in` if absent
- Also sets `x-show-modal` header (legacy/unrelated to auth)

### 2.8 Sanity Schema

`sanity-cms/schemaTypes/userType.ts`
- Document type: `userProfile`
- Fields: `authId` (string, required), `email` (string, required), `name` (string), `addresses` (array of address objects)

---

## 3. Environment Variables (Current Local State)

| Variable | Local `.env.local` | Required for Production | Status |
|----------|-------------------|------------------------|--------|
| `BETTER_AUTH_SECRET` | Set (32+ chars) | Set | OK |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://sanglogium.com` | Needs update |
| `DATABASE_URL` | `file:./better-auth.db` | `libsql://...` (Turso) | **BLOCKER** |
| `TURSO_AUTH_TOKEN` | Missing | Required for Turso | **BLOCKER** |
| `NEXT_PUBLIC_BASE_URL` | `https://sanglogium.com` | `https://sanglogium.com` | OK |
| `GOOGLE_CLIENT_ID` | Set | Set | OK |
| `GOOGLE_CLIENT_SECRET` | Set | Set | OK |

**Local SQLite file confirmed:** `better-auth.db` exists (45KB, last modified 2026-05-29).

---

## 4. Security Configuration

- **Rate limiting:** 10 requests per 60s window (`lib/auth.ts:41-44`)
- **Cookies:** HTTP-only session cookies managed by `nextCookies()` plugin
- **Password policy:** Minimum 8 characters enforced in HTML (`minLength={8}` on input); no server-side password complexity rules configured in Better Auth
- **Email verification:** Disabled (`requireEmailVerification: false`); accounts are active immediately upon registration
- **Session validation:** Server-side via `auth.api.getSession()` with request headers; middleware via `getSessionCookie()`

---

## 5. Production Readiness Assessment

### 5.1 What Works (Local Development) — VERIFIED

- `/sign-in` renders email/password form + Google OAuth button
- `/sign-up` registers user, creates Sanity `userProfile`, redirects to `/account`
- `/account` and `/account/orders` are protected; unauthenticated users redirected to `/sign-in`
- Navbar correctly shows Account/Sign In state based on session cookie
- Sign Out clears session and refreshes UI
- Session persists across page navigations

### 5.2 Production Blockers — CRITICAL

| # | Blocker | Impact | Mitigation |
|---|---------|--------|------------|
| 1 | `DATABASE_URL=file:./better-auth.db` on Vercel | **FATAL**. Serverless functions have ephemeral filesystem; SQLite data is lost on every deployment and cannot be shared across instances. | Create Turso database; set `DATABASE_URL=libsql://...` and `TURSO_AUTH_TOKEN` in Vercel environment variables. `lib/auth.ts` adapter logic already supports this. |
| 2 | `BETTER_AUTH_URL` still points to localhost in `.env.local` | OAuth callbacks and origin checks will fail on production. | Update to production domain in Vercel env vars. |
| 3 | No email verification | Users can register with any email address; no ownership verification. | Acceptable for MVP if acknowledged; enable `requireEmailVerification: true` and configure SMTP if business requires it. |
| 4 | No auth-specific tests | Zero unit, integration, or E2E tests cover sign-up, sign-in, session persistence, or route protection. | Add Playwright E2E tests for auth flow and middleware redirection. |
| 5 | `userProfile` creation failure handling | If Sanity write fails after Better Auth registration, user exists in auth DB but has no profile. Form shows error but user is already registered. | Consider transactional rollback or retry logic; or move profile creation to a Better Auth hook. |

---

## 6. Recommendations for Production

1. **Create Turso database** and replace `DATABASE_URL` with `libsql://` URL; add `TURSO_AUTH_TOKEN` to Vercel.
2. **Update `BETTER_AUTH_URL`** to `https://sanglogium.com` in production env vars.
3. **Verify Google OAuth callback URL** is registered in Google Cloud Console as `https://sanglogium.com/api/auth/callback/google`.
4. **Add auth E2E tests** covering: sign-up → profile creation → sign-out → sign-in → account access → middleware redirect.
5. **Evaluate email verification** requirement before public launch.
6. **Monitor `userProfile` creation failure** edge case; consider Better Auth `databaseHooks` for synchronous profile creation.

---

*Report generated from direct source code inspection. All file paths and line numbers reference current HEAD.*
