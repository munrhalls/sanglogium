# Auth — Data & Functional Intelligence

## Library Decision

**Chosen:** Better Auth

**Why:** Auth.js v5 was taken over by the Better Auth team in September 2025 and is now in security-patch mode only. Better Auth is the actively developed, framework-native alternative, recommended by Auth.js maintainers and listed as a recommended library by Next.js itself.

**Sources:**
- https://github.com/nextauthjs/next-auth/discussions/13252

## Architecture

**Dual database strategy:**
- **Better Auth** owns identity (users, sessions, credentials)
- **Sanity** owns user profiles (name, email, addresses, order history)
- Link via `authId` field on `userProfile` document

**Guest checkout remains untouched.** No auth required to browse or purchase.

## Database Strategy

| Environment | Database | Adapter |
|-------------|----------|---------|
| Local dev   | SQLite (`better-auth.db`) | `better-sqlite3` via Kysely |
| Production  | Turso (libSQL) | `kysely-libsql` |

`lib/auth.ts` auto-detects `DATABASE_URL` prefix: `libsql://` → Turso, otherwise SQLite.

## Key Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Better Auth configuration, DB adapter setup |
| `lib/auth-client.ts` | Frontend auth client |
| `lib/auth/dal.ts` | Server-side `verifySession()` |
| `app/api/auth/[...all]/route.ts` | Better Auth API handler |
| `app/(store)/sign-in/` | Sign-in page + form |
| `app/(store)/sign-up/` | Sign-up page + form + server action |
| `app/(store)/account/` | Protected account page |
| `middleware.ts` | Route protection for `/account/*` |
| `sanity-cms/schemaTypes/userType.ts` | `userProfile` schema |

## Auth Features Configured

- Email + password registration/sign-in
- Google OAuth (conditional on env vars)
- Rate limiting: 10 requests per 60s window
- Auto-sign-in after registration
- No email verification required

## Gap-Close Audit — May 31, 2026

**CLOSED:**
1. middleware.ts + NavbarActionsServer.tsx hardcoded cookie name → fixed with `getSessionCookie()` from `better-auth/cookies`
2. SignInForm had no redirect after login → added `router.push("/account")`
3. SignUpPage missing Suspense for `useSearchParams` → added
4. `@better-auth/kysely-adapter` missing from package.json → added v1.6.11
5. Dead `AuthMenu.tsx` with `alert()` stubs → deleted

---

## Production Checklist — 2026-06-04

**Status:** Code is production-ready. Infrastructure setup is pending.

### Code Verification (COMPLETE — no changes needed)

| Check | Result | Evidence |
|-------|--------|----------|
| `lib/auth.ts` auto-detects `libsql://` → `LibsqlDialect` | PASS | Line 11: `databaseUrl.startsWith("libsql://")` |
| `kysely-libsql@0.7.1` exports `LibsqlDialect` with `{ url, authToken }` | PASS | `node_modules/kysely-libsql/dist/index.d.ts` line 9 |
| `@libsql/client@0.17.3` installed | PASS | `package.json` line 60 |
| `TURSO_AUTH_TOKEN` consumed by adapter | PASS | `lib/auth.ts` line 15 |
| `.env.example` documents Turso setup steps | PASS | `.env.example` lines 47–72 |

### External Setup Steps (MANUAL — user must execute)

**Step 1 — Install Turso CLI**
```bash
npm install -g @tursoproject/cli
```

**Step 2 — Authenticate with Turso**
```bash
turso auth login
```
Opens browser for GitHub authentication.

**Step 3 — Create database**
```bash
turso db create sang-logium-auth
```

**Step 4 — Get database URL**
```bash
turso db show sang-logium-auth --url
# → libsql://sang-logium-auth-<your-org>.<region>.turso.io
```

**Step 5 — Create auth token**
```bash
turso db tokens create sang-logium-auth
# → long secret token (copy it, never commit it)
```

**Step 6 — Set Vercel environment variables**
Go to **Vercel Dashboard → Project Settings → Environment Variables** and add:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `libsql://sang-logium-auth-<org>.<region>.turso.io` | Step 4 |
| `TURSO_AUTH_TOKEN` | `<paste-token-from-step-5>` | Step 5 |
| `BETTER_AUTH_URL` | `https://sanglogium.com` | Already set in `.env` |

**Step 7 — Verify Google OAuth callback**
In **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs**:
- Authorized redirect URIs must include: `https://sanglogium.com/api/auth/callback/google`
- If missing, add it before deploying.

**Step 8 — Deploy**
Push to production branch. Better Auth tables auto-create on first API request — no manual migration needed.

### Post-Deployment Verification

Run these checks on the production URL after deploy:

- [ ] `/sign-up` → register with email/password → redirects to `/account`
- [ ] `/account` → shows user name/email; unauthenticated user redirected to `/sign-in`
- [ ] `/account/orders` → accessible when signed in; redirects when not
- [ ] Navbar → shows "Account" dropdown with "Sign Out" when authenticated
- [ ] Sign Out → clears session; navbar reverts to "Sign In"
- [ ] `/sign-in` → sign in with existing credentials → redirects to `/account`
- [ ] Google OAuth button → completes flow → redirects to `/account`

### Internal Safeguards Added

`lib/auth.ts` now validates production configuration at startup:
- If `NODE_ENV=production` and `DATABASE_URL` does not start with `libsql://` or `http` → **throws with clear error message**
- If `DATABASE_URL` starts with `libsql://` but `TURSO_AUTH_TOKEN` is missing → **throws with clear error message**
- Prevents silent SQLite fallback on Vercel serverless.

