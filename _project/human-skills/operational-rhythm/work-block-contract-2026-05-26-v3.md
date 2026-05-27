# Work Block Contract — 2026-05-26 (Verified)

## Principle

Verify before acting. Fix exactly one blocker. Produce evidence.

---

## The Contract

```
In the next 90 minutes I will verify whether the payment page
compiles and renders, then fix the first blocker found.

Step 1 — Verify compilation (10 min)
  Command: npx eslint app/\(store\)/checkout/payment/ --max-warnings=0
  Evidence: Screenshot or copy of terminal output showing error count
  If errors > 0: proceed to Step 3 (fix lint)
  If errors = 0: proceed to Step 2

Step 2 — Verify runtime (20 min)
  Command: npm run dev
  Browser: http://localhost:3000/checkout/payment
  If 404 or redirect: seed session via /checkout-seed?scenario=grand-total-zero&secret=<CHECKOUT_SEED_SECRET>
  Evidence: Screenshot of browser showing either:
    (a) rendered payment page, or
    (b) specific error message with stack trace
  If rendered cleanly: contract satisfied — verify one guard (Step 2b)
  If error: proceed to Step 3 (fix runtime)

Step 2b — Bonus verification if page renders (10 min)
  Seed: /checkout-seed?scenario=missing-address&secret=<CHECKOUT_SEED_SECRET>
  Browser: http://localhost:3000/checkout/payment
  Expect: redirect to /checkout/address
  Evidence: Screenshot of browser URL bar showing /checkout/address

Step 3 — Fix first blocker (45 min)
  If lint errors: fix them one by one, re-run lint after each
  If runtime error: identify file and line from stack trace, fix
  Rule: ONE category only. If lint is broken, don't touch runtime. If runtime is broken, don't touch lint.
  If fix exceeds 30 min: document the blocker and abort

Step 4 — Verify fix (10 min)
  Re-run the failing check (lint or runtime)
  Evidence: Screenshot showing clean result

Step 5 — Document (5 min)
  File: _project/scratch/payment-blocker-<timestamp>.md
  Content: Blocker category (lint/runtime/guard), file path, fix applied or aborted

Verification (all must be true):
  [ ] Step 1 evidence exists (lint output screenshot)
  [ ] Step 2 evidence exists (browser screenshot)
  [ ] Step 3 fix is applied to exactly one file or one category
  [ ] Step 4 evidence exists (re-run screenshot)
  [ ] Step 5 file exists
```

---

## Why This Is Different

Previous contracts assumed:
- "Tests test a deprecated architecture" — unverified, could be false
- "Env vars are misconfigured" — unverified, could be false
- "Extract functions into new file" — meta-work, not verification

This contract assumes NOTHING. It checks compilation first. If clean, checks runtime. If broken, fixes one thing. Every step produces evidence.

---

## If Blocked

| Symptom | Cause | Fix |
|---------|-------|-----|
| checkout-seed 404 | NODE_ENV=production in .env.local | Change to development |
| checkout-seed 403 | CHECKOUT_SEED_SECRET missing | Add any random string to .env.local |
| dev server port in use | Another process on :3000 | Kill process or `npm run dev -- -p 3001` |
| Sanity query fails | Product IDs in seed don't match Sanity | Check `app/(test)/checkout-seed/route.ts` line 4 for REAL_PRODUCT_ID |
| Stripe fails | NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing | Check .env.local or document as blocker |

---

## Out of Scope

- Do NOT fix more than one category of errors
- Do NOT touch shipping, return, success pages
- Do NOT write tests
- Do NOT refactor PaymentForm.client.tsx
- Do NOT extract functions into new files
