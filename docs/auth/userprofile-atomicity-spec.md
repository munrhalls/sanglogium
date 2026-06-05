# userProfile Creation Atomicity — Should-Be Spec

## Sang Logium · Sign-Up Data Layer · June 2026

---

## 1. Current State (Verified)

### 1.1 Sign-up flow

```
SignUpForm.tsx (Client Component)
  ├── authClient.signUp.email({ email, password, name })
  │     └── POST /api/auth/sign-up/email
  │           └── Better Auth creates user in auth DB
  │           └── Returns { user, token } to client
  ├── createUserProfile({ authId, email, name })  [Server Action]
  │     └── Sanity backendClient.create({ _type: "userProfile", ... })
  │     └── Returns { success, docId } or { success: false, error }
  └── router.push("/account")
```

**Files:**
- `app/(store)/sign-up/SignUpForm.tsx` — client form
- `app/(store)/sign-up/actions.ts` — server action for Sanity profile
- `app/api/auth/[...all]/route.ts` — Better Auth API handler
- `lib/auth.ts` — Better Auth configuration

### 1.2 Failure modes (verified)

| Step | What happens | Result |
|------|--------------|--------|
| `authClient.signUp.email` fails | Error returned to client | No auth user, no profile. Clean failure. |
| `signUp.email` succeeds, `createUserProfile` fails | Auth user exists in DB, no Sanity profile | **ORPHANED USER** — user can sign in but has no profile data (addresses, orders). |
| `signUp.email` succeeds, `createUserProfile` succeeds | Auth user + Sanity profile exist | Correct state. |
| `createUserProfile` succeeds but user refreshes before redirect | Profile exists, user may not realize sign-up succeeded | UX gap, not data gap. |

### 1.3 Root cause

Better Auth and Sanity are **two separate data stores** with **no distributed transaction** between them. Better Auth uses SQLite (local) or Turso (production); Sanity is a separate cloud CMS. There is no two-phase commit, no saga, no outbox pattern. The current client-side orchestration (sign-up → then profile creation) is inherently non-atomic.

### 1.4 Better Auth transaction behavior (verified)

Better Auth **does not use database transactions** for the sign-up endpoint. Confirmed by GitHub issue #4193: if account or session creation fails after the user row is inserted, the user row is **not rolled back**. This applies equally to our custom `databaseHooks.user.create.after` hook — if the hook throws, the user row persists.

---

## 2. Atomicity Options Evaluated

### 2.1 Option A: `databaseHooks.user.create.after`

**Approach:** Register a `databaseHooks.user.create.after` hook in `lib/auth.ts`. When Better Auth inserts the user row, the hook fires and creates the Sanity userProfile synchronously.

```ts
// lib/auth.ts — inside betterAuth({...})
databaseHooks: {
  user: {
    create: {
      after: async (user) => {
        await backendClient.create({
          _type: "userProfile",
          authId: user.id,
          email: user.email,
          name: user.name || "",
        });
      },
    },
  },
}
```

**Pros:**
- Runs server-side inside the auth handler
- No client-side orchestration needed
- Profile is created immediately after user creation

**Cons:**
- Hook is **fire-and-forget** (returns `Promise<void>`). If Sanity fails, the auth user is already persisted.
- No rollback mechanism. Same orphan problem as current flow.
- Hook runs for ALL user creation paths (including OAuth), which may not be desired if OAuth users need different profile handling.
- Adds a cross-system network call inside the auth request, increasing latency.

**Verdict:** Moves the problem but does not solve it. **Not recommended as primary fix.**

### 2.2 Option B: Server Action with `auth.api.signUpEmail`

**Approach:** Convert sign-up to a server action. The client form POSTs to a server action. The server action calls `auth.api.signUpEmail({ body, returnHeaders: true })`, then creates the Sanity profile. If Sanity fails, the server action can attempt to clean up the auth user.

```ts
// app/(store)/sign-up/actions.ts
"use server";
import { auth } from "@/lib/auth";
import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function signUpAndCreateProfile(input: {
  email: string;
  password: string;
  name: string;
}) {
  const { headers, response } = await auth.api.signUpEmail({
    returnHeaders: true,
    body: input,
  });

  const user = response?.user;
  if (!user?.id) {
    throw new Error("Sign-up failed: no user returned");
  }

  try {
    await backendClient.create({
      _type: "userProfile",
      authId: user.id,
      email: input.email,
      name: input.name || "",
    });
  } catch (sanityError) {
    // Attempt rollback: delete the auth user
    // NOTE: Better Auth does not expose a simple server-side deleteUser
    // This requires calling the internal adapter or API
    throw new Error("Profile creation failed; sign-up rolled back");
  }

  return { headers }; // Client sets cookies from headers
}
```

**Pros:**
- Server-side orchestration is cleaner than client-side
- Both operations happen in one server request
- Can attempt rollback on failure

**Cons:**
- Better Auth does not expose a clean `auth.api.deleteUser()` endpoint for rollback
- Rollback would require direct DB adapter access (`auth.$context.db` or raw SQL), which is brittle
- Session cookie headers from `returnHeaders` must be forwarded to the client — Next.js server actions do not propagate response headers to the browser automatically
- Complexity increases significantly

**Verdict:** Better than Option A, but rollback is unreliable. **Medium complexity, medium benefit.**

### 2.3 Option C: Defensive checks + cleanup job (RECOMMENDED)

**Approach:** Accept that true atomicity is impossible across two independent data stores. Instead:

1. **Auto-create missing profiles on demand:** When `verifySession()` or any auth-dependent page loads, check if a `userProfile` exists for the authenticated user. If not, create it on the fly.

2. **Cleanup job:** A periodic job scans Better Auth users and deletes any that have no `userProfile` after a grace period (e.g., 24 hours).

3. **Monitoring:** Log all `createUserProfile` failures with user ID for manual review.

```ts
// lib/auth/dal.ts — inside verifySession / getSession
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Defensive: ensure userProfile exists
  await ensureUserProfile(session.user);

  return { isAuth: true, userId: session.user.id, user: session.user };
});

async function ensureUserProfile(user: { id: string; email: string; name?: string | null }) {
  const existing = await backendClient.fetch(
    `*[_type == "userProfile" && authId == $authId][0]`,
    { authId: user.id }
  );
  if (!existing) {
    await backendClient.create({
      _type: "userProfile",
      authId: user.id,
      email: user.email,
      name: user.name || "",
    });
  }
}
```

**Pros:**
- No complex orchestration
- Orphaned users self-heal on first page load
- Cleanup job removes any that slip through
- Works with all auth paths (email, OAuth, future providers)
- Simple and robust

**Cons:**
- Brief window where orphaned user exists (between sign-up and first page load)
- Cleanup job needed as safety net
- Slightly more DB load on every `verifySession()` call

**Verdict:** Best practical approach for a dual-database architecture. **Recommended.**

### 2.4 Option D: Single database (rejected)

**Approach:** Store user profile data in Better Auth's `user` table via `additionalFields`.

**Why rejected:**
- The spec explicitly requires a dual-database strategy (Better Auth for identity, Sanity for ecommerce profiles)
- Addresses and order history belong in Sanity for CMS-managed content
- Better Auth is not a general-purpose database

---

## 3. Should-Be Decision

**Primary approach: Option C (Defensive checks + cleanup)**  
**Secondary: Option A (databaseHooks) as additional safety net**

### 3.1 Immediate changes (data layer)

1. **`lib/auth/dal.ts`** — Add `ensureUserProfile()` call inside `verifySession()`, `getSession()`, and `requireSession()`. This auto-creates a missing profile on any authenticated request.

2. **`app/(store)/sign-up/actions.ts`** — Keep current `createUserProfile()` but improve it:
   - Return the created doc ID on success
   - Log structured error with `[AUTH] ORPHAN` prefix on failure
   - Do NOT attempt rollback (unreliable)

3. **`lib/auth.ts`** — Add `databaseHooks.user.create.after` as a secondary safety net. If Sanity succeeds here, `ensureUserProfile()` in DAL is a no-op. If Sanity fails here, DAL will heal it later.

4. **Cleanup script** — Create `scripts/cleanup-orphaned-auth-users.mjs` that:
   - Queries Better Auth DB for all users
   - Queries Sanity for matching `userProfile` documents
   - Deletes auth users with no profile created > 24 hours ago
   - Run via cron or Vercel cron job

### 3.2 Data invariants

| Invariant | Enforcement |
|-----------|-------------|
| Every authenticated request must have a `userProfile` | `ensureUserProfile()` in DAL |
| `userProfile.authId` is unique | Sanity schema `authId` field + query check |
| `userProfile.email` matches auth user email | Set at creation time; not continuously synced |
| Orphaned users older than 24h are deleted | Cleanup script |

### 3.3 Failure recovery

| Scenario | Recovery |
|----------|----------|
| `createUserProfile` fails during sign-up | `ensureUserProfile()` creates it on next page load |
| Sanity is temporarily down during sign-up | User can still sign in; profile auto-created when Sanity recovers |
| OAuth user has no profile | `ensureUserProfile()` creates it on first `/account` visit |
| Cleanup job deletes a legitimate user's auth record | Must never happen — cleanup only deletes users with no profile AND no orders |

---

## 4. Implementation Tasks

### Task 1 — DAL defensive profile creation
**File:** `lib/auth/dal.ts`  
**Change:** Add `ensureUserProfile()` helper; call it in `verifySession()`, `getSession()`, and `requireSession()`.

### Task 2 — Sign-up action logging
**File:** `app/(store)/sign-up/actions.ts`  
**Change:** Add structured orphan logging with user ID + email on `createUserProfile` failure.

### Task 3 — Auth hook safety net
**File:** `lib/auth.ts`  
**Change:** Add `databaseHooks.user.create.after` to create Sanity profile. Wrap in try/catch so hook failure does not crash auth.

### Task 4 — Cleanup script
**File:** `scripts/cleanup-orphaned-auth-users.mjs` (new)  
**Change:** Query auth DB + Sanity; delete orphaned users > 24h old.

### Task 5 — Vercel cron job
**File:** `vercel.json`  
**Change:** Add cron schedule for cleanup script (e.g., daily at 3 AM).

---

## 5. Verification Checks

- [ ] Sign up with email → `/account` loads → Sanity `userProfile` document exists with correct `authId`
- [ ] Simulate Sanity failure during sign-up → sign-up succeeds → `/account` still loads → `userProfile` auto-created by DAL
- [ ] Sign in with OAuth → `/account` loads → `userProfile` auto-created if missing
- [ ] Run cleanup script manually → no false positives (no legitimate users deleted)
- [ ] Cleanup script identifies orphaned user → deletes auth user after 24h grace period

---

## 6. Scope Boundary

**In scope:**
- userProfile creation atomicity
- DAL defensive checks
- Auth database hooks
- Cleanup script
- Sign-up action error handling

**Out of scope:**
- Any UI/UX changes to sign-up form
- Email verification flow (handled separately)
- Password reset flow (handled separately)
- OAuth UI changes
- Any non-auth features
