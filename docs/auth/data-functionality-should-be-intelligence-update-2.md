# Auth — Should-Be Data & Functionality Intelligence
## Sang Logium · Next.js 15 / React 19 / Better Auth / Turso · June 2026

---

## 1. Identity Data Model

### 1.1 User record (Better Auth `user` table)

| Field | Type | Constraint | Rationale |
|---|---|---|---|
| `id` | string (UUID) | PK | Better Auth default |
| `email` | string | unique, NOT NULL | primary identity key |
| `emailVerified` | boolean | NOT NULL, default false | required for email integrity (order receipts, resets) |
| `name` | string | nullable | display only |
| `image` | string | nullable | OAuth avatar URL |
| `createdAt` | datetime | NOT NULL | audit |
| `updatedAt` | datetime | NOT NULL | audit |

**No additional fields should live on this table.** All ecommerce profile data (addresses, order history) belongs to the Sanity `userProfile` document, linked via `authId`.

### 1.2 Session record (Better Auth `session` table)

| Field | Type | Constraint | Rationale |
|---|---|---|---|
| `id` | string | PK | Better Auth default |
| `token` | string | unique, NOT NULL | the cookie value |
| `userId` | string | FK → user.id, NOT NULL | |
| `expiresAt` | datetime | NOT NULL | checked on every request |
| `ipAddress` | string | nullable | security audit trail |
| `userAgent` | string | nullable | security audit trail |
| `createdAt` | datetime | NOT NULL | freshness calculation base |
| `updatedAt` | datetime | NOT NULL | |

### 1.3 Sanity `userProfile` document

| Field | Type | Constraint | Rationale |
|---|---|---|---|
| `authId` | string | required, unique | foreign key to `user.id` |
| `email` | string | required | denormalised; kept in sync on sign-up |
| `name` | string | optional | |
| `addresses` | array | optional | shipping addresses |
| `stripeCustomerId` | string | optional | set on first payment |
| `createdAt` | datetime | set on creation | |

**Write rule:** `userProfile` document must be created atomically in the same request as Better Auth user creation (server action or API route). If the Sanity write fails, the Better Auth user must not be persisted (or must be rolled back / flagged for cleanup). A user record with no linked `userProfile` is a data integrity gap.

---

## 2. Session Semantics

### 2.1 Expiry configuration

| Parameter | Should-Be Value | Rationale |
|---|---|---|
| `expiresIn` | 7 days (604800 s) | Standard ecommerce; balances UX vs security |
| `updateAge` | 1 day (86400 s) | Sliding window: active users stay logged in |
| `freshAge` | 5 minutes (300 s) | Sensitive actions (password change, address update) require a fresh session |
| `disableSessionRefresh` | false (default) | Must not be disabled |

### 2.2 Session revocation

Must be implemented for:
- **Sign-out:** revoke current session only (`authClient.signOut()`)
- **Password reset (forgot password flow):** set `emailAndPassword.revokeSessionsOnPasswordReset: true` in `lib/auth.ts` — Better Auth supports this as a config flag; all sessions are revoked automatically when a reset token is consumed
- **Password change (account page):** no automatic config flag exists for this case in Better Auth; must call `authClient.revokeOtherSessions()` explicitly in the change-password server action after a successful credential update
- **Account page "sign out all devices":** expose `authClient.revokeSessions()` — required for ecommerce where a user may share a device

### 2.3 Session freshness guard

Actions that mutate sensitive identity or payment data (change password, change email, add/remove address, access order history with PII) must verify session freshness via `freshAge` before proceeding. A stale session must redirect to re-authentication, not simply reject silently.

---

## 3. Password Security

### 3.1 Hashing

Better Auth uses `scrypt` by default. This is correct and must not be overridden with a weaker algorithm. No action required.

### 3.2 Password policy (enforced server-side)

| Rule | Should-Be |
|---|---|
| Minimum length | 8 characters |
| Maximum length | 128 characters (prevent bcrypt/scrypt DoS) |
| Complexity | Not required (length > complexity per NIST SP 800-63B) |

Better Auth's `emailAndPassword.minPasswordLength` and `maxPasswordLength` must be set explicitly. Do not rely on client-side validation alone.

### 3.3 Forgot password flow

This flow is **required** and is currently absent from the spec. It is a hard ecommerce requirement — users who cannot recover their account abandon the store.

**Required data contract:**

1. User submits email → server calls `authClient.forgetPassword({ email, redirectTo })` (Better Auth built-in)
2. Better Auth generates a time-limited reset token (default: 1 hour / 3600 s — must be configured explicitly as `expiresIn` on `emailAndPassword`)
3. Server sends reset email via a transactional email provider (Resend is the standard choice for Next.js stacks in 2026) with a link containing the token
4. User clicks link → server validates token → user submits new password → Better Auth calls `resetPassword`
5. On success: all other sessions revoked (required — existing sessions must be invalidated after a credential change)
6. On failure (invalid/expired token): clear error, no user enumeration (always return 200 from the "send reset email" endpoint regardless of whether the email exists)

**Required configuration additions to `lib/auth.ts`:**
- `emailAndPassword.sendResetPassword` function must be implemented
- An email provider (Resend or equivalent) must be wired in
- `emailAndPassword.resetPasswordTokenExpiresIn: 3600` (1 hour) must be set explicitly

### 3.4 Email enumeration protection

`emailAndPassword.userNotFoundOnSignIn` must not leak whether an email is registered. Better Auth's default sign-in returns a generic error — do not override this to be more specific.

For the reset password endpoint: Better Auth returns 200 regardless of whether the email exists, preventing enumeration. This default must not be changed.

---

## 4. Email Verification

### 4.1 Current state

`requireEmailVerification` is not set (defaults to false). This is a **data integrity risk** for ecommerce: unverified emails mean:
- Order confirmation emails bounce silently
- Password reset emails are undeliverable
- A malicious user can register with someone else's email and begin placing orders

### 4.2 Should-be decision

**Require email verification before first sign-in.** Set `emailAndPassword.requireEmailVerification: true`.

This requires:
- `sendVerificationEmail` function implemented in `lib/auth.ts`
- Transactional email provider (same as used for password reset — Resend)
- A `/verify-email` route that handles the callback token

**Grace period rule:** on registration, auto-sign-in is acceptable for browsing (current config has `autoSignIn: true`). However, checkout must require a verified email before an order is confirmed. This is a data layer gate, not a UX gate.

---

## 5. OAuth (Google) Flow

### 5.1 Data requirements

When a user signs in via Google OAuth:
- Better Auth creates a `user` record with `emailVerified: true` (Google guarantees email ownership)
- A `userProfile` document must be created in Sanity if one does not already exist for `authId`
- The Google `account` record is stored in Better Auth's `account` table (standard)

### 5.2 PKCE and state

Better Auth stores OAuth `state` and PKCE `code_verifier` in the database and removes them after the callback completes. This is correct and must not be disabled.

### 5.3 Callback URL integrity

`trustedOrigins` in `lib/auth.ts` must include only `https://sanglogium.com` in production. No wildcards. No `disableOriginCheck: true`.

---

## 6. CSRF Protection

Better Auth provides layered CSRF protection by default. The following must not be disabled or degraded:

| Protection layer | Must-be state |
|---|---|
| `Content-Type: application/json` enforcement | Active (default) — never use form submissions to auth endpoints |
| `Origin` header validation against `baseURL` | Active (default) |
| `SameSite=Lax` on session cookies | Active (default) — do not override to `None` |
| `disableCSRFCheck` | Must remain `false` (default) |
| `disableOriginCheck` | Must remain `false` (default) |

---

## 7. Cookie Requirements

| Attribute | Should-Be Value | Notes |
|---|---|---|
| `HttpOnly` | true | Better Auth default on production |
| `Secure` | true | Better Auth sets this when `baseURL` is `https://` |
| `SameSite` | `Lax` | Better Auth default; do not override to `None` |
| Cookie name | via `getSessionCookie()` from `better-auth/cookies` | Already fixed per gap-close audit; do not hardcode |

Cookie caching (`cookieCache`) is optional but recommended for performance on Vercel serverless (reduces DB reads per request). If enabled, `maxAge` should be 5 minutes with `strategy: "compact"`. The cached cookie must never contain sensitive user data.

---

## 8. Rate Limiting

Better Auth includes built-in rate limiting. The current config sets 10 requests per 60-second window globally.

| Endpoint type | Should-Be limit |
|---|---|
| Sign-in | 5 attempts per 15 minutes per IP |
| Sign-up | 3 per hour per IP |
| Password reset request | 3 per hour per email |
| General auth routes | 10 per 60 s (current) |

**Note:** Better Auth's built-in rate limiter uses an in-memory store by default, which does not persist across Vercel serverless function instances. For production, configure a secondary storage (Redis / Upstash) for the rate limiter, or accept the weaker per-instance guarantee as a known trade-off.

---

## 9. Middleware / DAL Auth Guard Architecture

### 9.1 CVE-2025-29927 — middleware bypass

Next.js versions prior to 15.2.3 had a CVSS 9.1 middleware bypass via `x-middleware-subrequest` header. All protected-route checks in middleware were skippable. The fix: **middleware must only handle redirects (UX), not be the sole authorization gate.**

**Should-be rule:** Route protection must be enforced at two layers:
1. **Middleware** (`middleware.ts`) — UX redirect only; never trusted as a security boundary
2. **DAL** (`lib/auth/dal.ts` → `verifySession()`) — called inside every Server Component and Route Handler that accesses protected data; this is the security boundary

### 9.2 `verifySession()` behaviour contract

| Call context | Should-Be behaviour |
|---|---|
| Server Component (page) | Redirect to `/sign-in` if no valid session |
| Route Handler / API route | Return `null` (never redirect); caller must return 401 |
| Server Action | Throw / return error if no valid session; never silently proceed |

The current DAL file is listed but its behaviour is not fully specced. This contract must be implemented.

### 9.3 Layout auth check anti-pattern

Auth checks must not live in `layout.tsx`. Due to Next.js partial rendering, layouts do not re-run on client-side navigation within their subtree. `verifySession()` must be called in the page component or in the data-fetching function it calls.

---

## 10. Secret Management

| Secret | Should-Be |
|---|---|
| `BETTER_AUTH_SECRET` | 32+ character random string; stored in Vercel env; never committed |
| Secret rotation | Use `secrets: [{ version: N, value: ... }]` array in `lib/auth.ts` for non-destructive rotation (no mass logout) |
| `TURSO_AUTH_TOKEN` | Stored only in Vercel env; never in code or `.env` committed to repo |

The startup validation already in `lib/auth.ts` (throws if `DATABASE_URL` is wrong or `TURSO_AUTH_TOKEN` missing in production) is correct and must be kept.

---

## 11. Guest Checkout Integrity

Guest checkout remains untouched per architecture decision. The following data boundaries must be maintained:

- No auth state is assumed or required at any point in the browse / cart / checkout flow for guests
- A guest completing a purchase must **not** be auto-enrolled as a registered user
- If a guest provides an email that matches an existing account, the order is attached to that email but no session is created
- Stripe customer ID created for a guest is stored on the order document only, not on any `userProfile`

---

## 12. Gap Summary (vs. Current Spec)

| Gap | Severity | Resolution |
|---|---|---|
| No `sendResetPassword` / forgot password flow | **Critical** | Implement via Better Auth `emailAndPassword.sendResetPassword` + Resend |
| No email provider wired in | **Critical** | Required for password reset and email verification |
| `requireEmailVerification: false` (default) | **High** | Set to `true`; implement `sendVerificationEmail` |
| `expiresIn`, `updateAge`, `freshAge` not explicitly set | **Medium** | Declare explicit values in `lib/auth.ts` (not rely on defaults) |
| `minPasswordLength`, `maxPasswordLength` not configured | **Medium** | Set to 8 and 128 respectively |
| `userProfile` creation atomicity with user creation not specced | **Medium** | Define and enforce the write contract |
| `verifySession()` DAL behaviour contract not specced | **Medium** | Define redirect-vs-null-return per call context |
| Rate limiter storage not specced for Vercel serverless | **Low** | Decide: accept per-instance limits or add Upstash |
| `cookieCache` not configured | **Low** | Optional; add for serverless performance |
| Session revocation on password reset not explicitly configured | **Medium** | Set `emailAndPassword.revokeSessionsOnPasswordReset: true`; manually call `revokeOtherSessions()` on password change |