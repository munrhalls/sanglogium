# sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:52Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:20Z |
| parent | sang-logium-qz2 |

## dependencies

- blocks: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation
- parent-child: sang-logium-qz2 — EPIC Checkout System Proof of Professional Level

## description

SINGLE RESPONSIBILITY: Verify slice S6 on the running checkout: the seams between screens, the shared shell / stepper / error screen, checkout state as one object, the guest-vs-account journey, and the happy path end to end.

PRECONDITIONS (once, before the children)
• Fresh localhost:3000 dev server in Stripe TEST mode; Stripe CLI forwarding webhooks; Studio open.
• Chrome DevTools open. The whole checkout state lives in one encrypted cookie "checkout_session" (Application → Cookies): it can only be deleted, truncated or replaced with garbage. Session lifetime is 1 hour.
• A second browser profile or Incognito window for "second person" checks.
• Basket lives in localStorage key "basket-storage".

ACCEPTANCE TESTS (epic level)
• When every child issue below is closed with a written pass/fail verdict for each of its checks, then this slice's gating questions are all honestly answered on a fresh localhost:3000.
• When any check answers no, then a separate bug issue exists for that defect, linked back to the child that found it.

CHILD ISSUES — run in this order (each is blocked by the previous one)
• sang-logium-qz2.6.1 — [S6 Flow] Funnel guards and corrupted state
• sang-logium-qz2.6.2 — [S6 Flow] Session expiry and return
• sang-logium-qz2.6.3 — [S6 Flow] Isolation, concurrency and large baskets
• sang-logium-qz2.6.4 — [S6 Flow] Navigation retention and re-routing
• sang-logium-qz2.6.5 — [S6 Flow] Shared shell, stepper and error screen
• sang-logium-qz2.6.6 — [S6 Flow] Language and currency consistency
• sang-logium-qz2.6.7 — [S6 Flow] Guest versus account journey

CORRECTIONS MADE TO THE ORIGINAL LIST (2026-09-03 review)
• Removed "hand-edit my checkout cookie to lower a price / raise a quantity / add an item" — the cookie is encrypted and carries no prices. Replaced with corrupt (must fail clean) and delete (must read as expiry).
• Removed "checked against the deployed site" — this epic is a localhost live check.
• "Checkout expired" given the real mechanism (1-hour cookie; delete to simulate).
• "30-40 distinct products" lowered to "15 or more" — enough to hit the store's internal size limit.
• Screen-reader step dropped; <html lang> + Chrome translate prompt is the one-minute observable.
• Error-screen check given a concrete trigger (unpublish a product, load payment).
• Guest-order lookup check states that "no email was ever asked for" is a fail.

RISK ASSESSMENT
Outcome risks:
• Scope creep into fixing everything a failing check reveals. Mitigation: children only produce pass/fail verdicts on the live checkout; each real defect found is filed as its own separate bug issue.
• Boundary crossing into an adjacent slice. Mitigation: only exercise interactions inside this slice's boundary; a failure whose cause lives in another slice is noted and filed against that slice.
• False positives from a stale build. Mitigation: the human runs each check against a fresh localhost:3000 and confirms the observed outcome in words.
Execution risks:
• Lean-path mandate (Issue Risk Protocol Part B): edit source only, hand every live check to the human on localhost:3000. No next build, no tsc/ts-check, no project lint, no test runs, no agent-run dev server, no browser automation for verification, no npm install, no git. Mitigation: if a "no" genuinely blocks the work, stop and say so in one line.
• hosts-file, .env and Studio edits made for a check must be reverted afterwards; the dev server restarted for hosts/.env changes.

OUT OF SCOPE
• Any single screen's internal correctness (those are S1-S5).

CURRENT STATUS: not started

SOURCE: slice S6 of docs/checkout/checkout-gating-questions.html
