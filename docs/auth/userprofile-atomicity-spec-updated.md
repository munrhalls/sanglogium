# userProfile Creation Atomicity — Should-Be Spec (Updated)

## Sang Logium · Sign-Up / Sign-In Data Layer · June 2026

> **Supersedes:** `userprofile-atomicity-spec.md`  
> **Scope:** Data layer and functionality layer only. Zero UX / zero implementation.

---

## 1. Verified Current State

### 1.1 Actual sign-up flow (source-verified)

```
SignUpForm.tsx (Client Component)
  └── authClient.signUp.email({ email, password, name })
        └── POST /api/auth/sign-up/email
              └── Better Auth inserts user row in auth DB
              └── requireEmailVerification: true  → sends verification email
              └── autoSignIn: true                → session cookie set immediately
              └── Returns { user: { id, email, name, ... } } to client
  └── createUserProfile({ authId: user.id, email, name })  [Server Action]
        └── backendClient.fetch(GROQ for existing profile)
        └── backendClient.create({ _type: "userProfile", authId, email, name })
        └── Returns { success, docId } or { success: false, error }
  └── router.push("/account")
```

**Key verified facts from source code:**

| Fact | Source | Value |
|------|--------|-------|
| `requireEmailVerification` | `lib/auth.ts:88` | `true` |
| `autoSignIn` | `lib/auth.ts:91` | `true` |
| Profile creation timing | `SignUpForm.tsx:35` | Immediately after sign-up response, before email verification |
| Profile idempotency guard | `actions.ts:22-29` | Existing profile by `authId` → returns early |
| Error logging | `actions.ts:40-44` | `[AUTH] CRITICAL` prefix with `authId` + `email` |
| DAL functions | `lib/auth/dal.ts` | `verifySession()` (redirects), `getSession()` (returns null), `requireSession()` (throws) |
| `userProfile` schema fields | `userType.ts` | `authId`, `email`, `name`, `addresses` — no custom `createdAt` |
| Sanity auto-timestamp | Sanity platform | `_createdAt` set automatically on every document |

### 1.2 The email verification interaction (critical context)

Better Auth with `requireEmailVerification: true` AND `autoSignIn: true` behaves as follows:

- Sign-up creates the auth user row and a session immediately (`autoSignIn`)
- The user is signed in and can navigate to `/account`
- However, `emailVerified` on the user record is `false`
- Email verification happens asynchronously — user clicks link in email
- Until verified: the user exists, has a session, can sign in again, but `emailVerified: false`

This means `createUserProfile()` runs **while `emailVerified: false`**. This is intentional and correct for this architecture — profile creation does not depend on email verification status.

### 1.3 Failure modes (verified)

| Step | Outcome | Category |
|------|---------|----------|
| `authClient.signUp.email` fails | No auth user, no profile | Clean failure |
| `signUp.email` succeeds, `createUserProfile` fails | Auth user + session exist, no profile | **Orphaned user** |
| `signUp.email` succeeds, `createUserProfile` succeeds | Auth user + profile exist | Correct state |
| `signUp.email` succeeds, user never verifies email | Auth user + profile exist, `emailVerified: false` | Unverified user (separate concern) |
| `databaseHooks` fires and Sanity succeeds | Profile created before `createUserProfile` runs | Duplicate prevented by idempotency guard in action |

### 1.4 Root cause of the atomicity gap

Better Auth (SQLite/Turso) and Sanity are two independent data stores. There is no distributed transaction, no outbox, no saga. Better Auth does not roll back the user row if a post-creation hook throws. The client-side orchestration in `SignUpForm.tsx` (sign-up → then profile creation) is inherently non-atomic. This is a known constraint of the dual-database architecture — the correct engineering response is defensive healing, not complex rollback.

---

## 2. Should-Be Architecture Decision

### 2.1 Accepted constraint

**True atomicity across two independent data stores is impossible without an outbox pattern or saga, both of which are overengineered for this scale.** The correct approach is:

1. **Best-effort creation at sign-up** — attempt profile creation immediately after auth user creation
2. **Defensive healing at session use** — if profile is missing when the user authenticates, create it on-demand
3. **Idempotency** — all creation paths are safe to run multiple times

### 2.2 Rejected approaches

| Option | Why rejected |
|--------|-------------|
| Rollback auth user on Sanity failure | Better Auth exposes `auth.api.deleteUser` but it is not transactional. The window between user row insert and rollback can still leave orphans. Adds complexity for marginal gain. |
| Server action calling `auth.api.signUpEmail` | Session cookie headers from `returnHeaders` cannot be forwarded to the browser automatically from Next.js server actions. This is a framework constraint, not a Better Auth limitation. Breaks the sign-in flow. |
| Outbox pattern / saga | Correct distributed systems pattern but severely over-engineered for an ecommerce store at this scale. Introduces Redis/queue dependency. |
| Store profile in Better Auth `user` table via `additionalFields` | Violates the dual-database architecture. Addresses and order history belong in Sanity. |

---

## 3. Should-Be: Layers and Invariants

### 3.1 Layer 1 — Sign-up action (best-effort, current)

**What it must do:**
- Attempt to create `userProfile` immediately after `authClient.signUp.email()` returns
- Check for existing profile by `authId` before creating (idempotency guard — already implemented)
- On Sanity failure: log structured error with `authId` + `email`, return `{ success: false }` to client
- **Must not attempt rollback of the auth user** — unreliable and not safe

**What it must NOT do:**
- Block the sign-up success state on profile creation failure (the user is registered; Sanity failure is recoverable)
- Expose the Sanity error message to the end user

**Log contract on failure:**
```
[AUTH] CRITICAL: userProfile creation failed after sign-up.
  authId: <id>
  email: <email>
  error: <message>
```

### 3.2 Layer 2 — DAL healing (defensive, on authenticated request)

**When to run:** Inside `verifySession()` only (not `getSession()` or `requireSession()`).

**Rationale:** `verifySession()` is the guard used in protected page Server Components (e.g., `/account`). It is called on every protected page load. `getSession()` is used in Route Handlers and may be called from non-page contexts (e.g., API routes) where triggering a Sanity write on every call would be inappropriate. `requireSession()` is used in server actions where the same concern applies.

**Performance constraint:** `verifySession()` is wrapped in React `cache()` — it runs at most once per request tree. The additional Sanity read inside it runs at most once per page load. This is acceptable.

**Optimization (should-be):** The healing check should be skipped when the session is confirmed healthy. The correct approach is a **session-level flag** — store a `profileCreated: true` boolean in the Better Auth session's custom data, or use a lightweight in-memory cache keyed by `userId` with a short TTL (e.g., 5 minutes). On cache hit, skip the Sanity read entirely.

**Should-be healing logic (data contract):**

```
verifySession() is called
  → auth.api.getSession() returns valid session
  → check session cache: is userId known-good?
      YES → skip Sanity check, return session
      NO  → query Sanity: does userProfile with authId == session.user.id exist?
              YES → mark userId as known-good in cache, return session
              NO  → create userProfile with { authId, email, name } from session.user
                    → mark userId as known-good in cache
                    → return session
```

**What `ensureUserProfile()` must NOT do:**
- Throw or redirect if Sanity is unavailable — log the error and continue (auth success must not be blocked by Sanity availability)
- Write to Sanity on every call without caching — O(n) Sanity writes for n page loads is a correctness bug, not just a performance issue

### 3.3 Layer 3 — OAuth path

When a user signs in via Google OAuth, Better Auth creates the auth user with `emailVerified: true` (Google guarantees email ownership). The `userProfile` creation path is identical to the email path: Layer 2 (DAL healing in `verifySession()`) will create the profile on the first authenticated page load if it does not exist.

**No separate OAuth profile creation code is needed.** The healing layer handles all auth providers uniformly.

---

## 4. Data Invariants

| Invariant | Enforcement point | Enforcement mechanism |
|-----------|-------------------|----------------------|
| Every active authenticated user has a `userProfile` | `verifySession()` | Healing check on first load |
| `userProfile.authId` is unique per Sanity document | Sign-up action + DAL | Idempotency guard (fetch before create) |
| `userProfile.email` matches the auth user's email at creation time | Sign-up action | Set from `user.email` returned by Better Auth |
| `userProfile` creation is idempotent | Both layers | Fetch-before-create guard |
| Sanity unavailability does not block authenticated access | DAL healing layer | try/catch, log, continue |
| Profile creation in DAL does not block page render | DAL healing layer | Must complete before returning session (not fire-and-forget) — the user arriving at `/account` must have a profile |

### 4.1 On the `_createdAt` field

Sanity automatically sets `_createdAt` on all documents at creation time. A custom `createdAt` field in the schema is **not required** and should not be added. Any cleanup logic must use `_createdAt`.

---

## 5. Failure Recovery Matrix

| Scenario | Recovery path | Data state after recovery |
|----------|--------------|--------------------------|
| `createUserProfile` fails during sign-up (Layer 1) | Layer 2 creates profile on first `/account` load | Profile exists, user is operational |
| Sanity is down during sign-up | Layer 1 fails silently, Layer 2 retries on next load when Sanity recovers | Profile exists once Sanity is available |
| Sanity is down during `verifySession()` healing | Log error, allow session to proceed without healing | Auth works; profile missing until next load succeeds |
| OAuth sign-in, no profile exists | Layer 2 creates profile on first `/account` load | Profile exists |
| `createUserProfile` called twice for same `authId` | Idempotency guard returns existing doc ID | Single profile, no duplicate |
| User unverified, profile exists | Normal — unverified user can still have a profile; checkout enforces email verification separately | Profile exists, checkout blocked until verified |

---

## 6. Cleanup — Should-Be Policy

### 6.1 What "orphaned user" means (precise definition)

An **auth orphan** is: an auth user whose `userProfile` document does not exist AND whose `createdAt` in the Better Auth DB is more than 24 hours old (i.e., Layer 2 healing has had time to run but hasn't). The age check uses the auth user record's `createdAt` — there is no Sanity document to check `_createdAt` on for a true orphan.

An **unverified user** is NOT an orphan. An unverified user with a profile is a normal state.

### 6.2 Correct cleanup action

The cleanup job must **create the missing profile**, not delete the auth user.

Rationale: deleting the auth user is destructive and irreversible. The user may have verified their email but Sanity may have been unavailable at that moment. Creating the missing profile is safe, idempotent, and recoverable.

**Exception — hard delete candidates:** An auth user with no profile AND `emailVerified: false` AND `createdAt > 7 days ago` (from the Better Auth DB) AND no orders linked to their email in Sanity can be considered abandoned. Hard deletion is acceptable in this narrow case only. Before deleting, verify no Sanity order document has `userId` matching this auth ID or `customerEmail` matching this email.

### 6.3 Cleanup query logic (data contract)

```
1. Fetch all auth users from Better Auth DB (SQLite/Turso)
2. For each user:
   a. Query Sanity: *[_type == "userProfile" && authId == $authId][0]
   b. Query Sanity: *[_type == "order" && (userId == $authId || customerEmail == $email)][0]
   c. If profile exists → skip (healthy state)
   d. If profile missing AND order exists → create missing profile (user has purchase history)
   e. If profile missing AND no order AND emailVerified == true → create profile (verified user, Layer 2 failed)
   f. If profile missing AND no order AND emailVerified == false AND age > 7 days → candidate for deletion (log, do not auto-delete without human confirmation in first run)
3. Log summary: N healed, N candidates for deletion, N healthy
```

**First run policy:** Log deletion candidates; do not auto-delete. After reviewing the log output once manually, auto-delete can be enabled.

---

## 7. `userProfile` Schema — Should-Be (Data Layer Only)

The current schema is sufficient for the atomicity concern. No new fields are required.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `authId` | string | required | FK to Better Auth `user.id`; must be unique |
| `email` | string | required | Copied from auth user at creation; source of truth for display only |
| `name` | string | optional | Copied from auth user at creation |
| `addresses` | array | optional | Shipping addresses — ecommerce profile data |
| `_createdAt` | datetime | auto | Set by Sanity; use for cleanup age checks |

**What must not be added:** A custom `createdAt` field duplicating `_createdAt`. Redundant and creates sync risk.

**What is explicitly out of scope here:** `stripeCustomerId` — this belongs to the checkout flow, not the auth/profile creation flow.

---

## 8. Deferred Concerns (Out of Scope for This Spec)

These are real concerns but belong to separate specs:

| Concern | Where it belongs |
|---------|-----------------|
| Email verification flow (verified → unverified state gate) | `email-verification-spec.md` |
| Forgot password / password reset | `password-reset-spec.md` |
| `stripeCustomerId` on `userProfile` | Checkout / payment spec |
| Session freshness guard for sensitive mutations | Session management spec |
| Rate limiter storage for Vercel serverless | Infrastructure / security spec |
| Google OAuth `userProfile` upsert on email collision | OAuth spec |

---

## 9. Verification Checks (Data Layer)

These are binary pass/fail checks for confirming correct behaviour — not implementation tasks.

- [ ] Sign up with email → Sanity `userProfile` document exists with matching `authId` and correct `email`/`name`
- [ ] Sign up with email → `userProfile` idempotency: calling `createUserProfile` again with the same `authId` returns `{ alreadyExists: true }`, no duplicate document in Sanity
- [ ] Simulate Layer 1 failure (mock Sanity error during sign-up) → user can still navigate to `/account` → `userProfile` auto-created by Layer 2 on page load
- [ ] Simulate user with no profile navigating to `/account` (manually delete profile in Sanity Studio) → profile auto-created on next page load, no error shown to user
- [ ] OAuth sign-in (Google) → no profile exists → `/account` loads → profile auto-created by Layer 2
- [ ] Sanity down during `verifySession()` healing → page still loads (auth is not blocked) → error logged → profile created on next successful load
- [ ] Cleanup script dry run (first run) → no profiles deleted → deletion candidates logged for review → N healthy users confirmed
- [ ] Cleanup script healing run → orphaned users with verified email and no orders → profile created → not deleted

---

## 10. Corrections to Previous Spec Version

| Previous spec claim | Correction |
|--------------------|------------|
| "authClient.signUp.email() → Returns { user, token } to client → router.push('/account')" | `autoSignIn: true` means a session is set immediately, but `requireEmailVerification: true` means the user is unverified. Profile creation runs before verification. This is correct and intentional. |
| "Cleanup job deletes auth users with no profile > 24h" | **Wrong.** Cleanup should create the missing profile, not delete the auth user. Hard delete is only valid for: no profile + no orders + unverified + > 7 days old. |
| "Add `ensureUserProfile()` to `verifySession()`, `getSession()`, AND `requireSession()`" | Only `verifySession()` is the correct placement. `getSession()` and `requireSession()` are used in API/action contexts where unconditional Sanity writes are inappropriate. |
| "Better Auth does not expose a clean `auth.api.deleteUser()` endpoint" | Better Auth v1.6+ does expose `auth.api.deleteUser` for admin use. The reason rollback is rejected is the atomicity window, not missing API. |
| Spec referenced `createdAt` as a custom `userProfile` field for cleanup age checks | The correct field is Sanity's auto-generated `_createdAt`. No custom field needed. |
| "Cleanup job needed as safety net" (implied fire-and-forget heal) | The cleanup job's primary action is **healing** (create missing profiles), not deletion. Deletion is a narrow exception with strict preconditions. |
