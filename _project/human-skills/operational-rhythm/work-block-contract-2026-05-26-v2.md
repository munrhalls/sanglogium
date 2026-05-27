# Work Block Contract — 2026-05-26 (Corrected)

## Previous Error

Proposed extracting functions into a new file (`lib/checkout/payment-guards.ts`) and writing 9 unit tests. This was meta-work — adding more code to a project with 269 unfinished commits. Common sense says: verify what exists before building more.

## Blocker Discovered

The checkout-seed test route (`app/(test)/checkout-seed/route.ts`) and iron-session both require env vars that are missing or misconfigured in `.env.local`:

| Requirement | Status in .env.local | Effect |
|-------------|----------------------|--------|
| `NODE_ENV` | Set to `production` | checkout-seed returns 404 (line 17 guards against prod) |
| `SESSION_SECRET` | Missing | iron-session uses fallback `"fallback-secret-change-in-production"` |
| `CHECKOUT_SEED_SECRET` | Missing | checkout-seed returns 403 even if NODE_ENV fixed |

**Result:** The checkout flow cannot be tested locally. The seed route is dead. This blocks ALL checkout verification.

---

## The Contract

```
In the next 90 minutes I will fix the local development environment
so the checkout payment funnel guards can be tested,
then verify one guard works.

Step 1 — Fix env vars (15 min):
  Edit .env.local:
    - Change NODE_ENV=production to NODE_ENV=development
    - Add SESSION_SECRET=<32+ random chars> (any string, min 32 chars)
    - Add CHECKOUT_SEED_SECRET=<any random string>
  Save. Do not touch any other env vars.

Step 2 — Verify checkout-seed responds (15 min):
  Run: npm run dev
  Visit: http://localhost:3000/checkout-seed?scenario=missing-address&secret=<CHECKOUT_SEED_SECRET>
  Expect: HTTP 302 redirect to /checkout/payment (not 404, not 403)
  If 404: NODE_ENV still production → fix and retry
  If 403: CHECKOUT_SEED_SECRET mismatch → fix and retry

Step 3 — Verify ONE funnel guard (30 min):
  After seeding missing-address scenario, visit /checkout/payment
  Expect: browser redirects to /checkout/address
  Verification: browser URL bar shows /checkout/address
  Screenshot or console log = proof

Step 4 — Document result (15 min):
  In .env.local comment: "# Checkout seed verified working: <timestamp>"
  Or in a scratch file: "Guard 3 (no address → /checkout/address) verified pass"
  Commit with message: "config(env): fix NODE_ENV and add checkout test secrets — verified guard 3 works"
  Tag: DoD:1 (this is verifiably done)

Step 5 — Shutdown (15 min buffer):
  Stop dev server. Do not start another task.

If blocked at Step 2 (npm run dev fails):
  - Check if port 3000 is occupied: lsof -i :3000 or netstat
  - If occupied, kill process or use: npm run dev -- -p 3001
  - Retry Step 2 with port 3001

If blocked at Step 3 (guard doesn't redirect):
  - Open browser dev tools → Network tab
  - Confirm request to /checkout/payment returns 307 or similar redirect
  - If no redirect: read page.tsx line 33-35, check if session.address is actually undefined after seed
  - Fix seed route or page.tsx, retry
```

---

## Why This Is Common Sense

1. **No new files.** Edit 1 config file. Use existing test route. Verify existing guard.
2. **Fixes a real blocker.** The seed route is the project's own test infrastructure. It's broken by misconfiguration. Fix it.
3. **One binary outcome.** Either the redirect happens or it doesn't. No ambiguity.
4. **DoD:1 is achievable.** This is a single, bounded task with a clear endpoint.
5. **Unlocks everything else.** Once the seed route works, the next block can verify guards 1, 2, and 4. Then Sanity checks. Then PaymentElement rendering.

## Out of Scope

- Do NOT refactor page.tsx
- Do NOT write new tests
- Do NOT extract functions
- Do NOT touch shipping, return, or success pages
- Do NOT configure Stripe keys (not needed for guard verification)

---

## Verification

```bash
# After Step 1:
grep NODE_ENV .env.local  # should show "development"
grep SESSION_SECRET .env.local  # should show a value
grep CHECKOUT_SEED_SECRET .env.local  # should show a value

# After Step 2:
curl -I "http://localhost:3000/checkout-seed?scenario=missing-address&secret=<value>"
# Expect: HTTP/1.1 302 Found
# Location: /checkout/payment

# After Step 3:
# Browser URL bar shows: http://localhost:3000/checkout/address
```
