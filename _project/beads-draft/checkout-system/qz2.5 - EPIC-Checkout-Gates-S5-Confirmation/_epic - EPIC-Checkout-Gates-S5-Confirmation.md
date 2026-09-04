# sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:51Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:18Z |
| parent | sang-logium-qz2 |

## dependencies

- parent-child: sang-logium-qz2 — EPIC Checkout System Proof of Professional Level
- blocks: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock

## description

SINGLE RESPONSIBILITY: Verify slice S5 on the running checkout: from /checkout/success?payment_intent=… load until the user leaves — every status branch's rendering, the access gate, and the analytics event.

PRECONDITIONS (once, before the children)
• Fresh localhost:3000 dev server in Stripe TEST mode; Stripe CLI forwarding webhooks (see S4); Studio open.
• At least one completed 4242… test order; keep its success URL in a note.
• Reachable states: succeeded (4242…); declined-after-redirect (4000 0000 0000 3220 → "Fail"); canceled (Przelewy24 test page → cancel); Stripe-unreachable (hosts "127.0.0.1 api.stripe.com", reload the success URL); verification-failed (same block set BEFORE the browser returns from Stripe). processing is not reliably producible — mark such checks N/A.
• Analytics: only checkable if NEXT_PUBLIC_GA_MEASUREMENT_ID is set in .env; then window.dataLayer in the Console lists every gtag call.

ACCEPTANCE TESTS (epic level)
• When every child issue below is closed with a written pass/fail verdict for each of its checks, then this slice's gating questions are all honestly answered on a fresh localhost:3000.
• When any check answers no, then a separate bug issue exists for that defect, linked back to the child that found it.

CHILD ISSUES — run in this order (each is blocked by the previous one)
• sang-logium-qz2.5.1 — [S5 Confirmation] Access gate and data exposure
• sang-logium-qz2.5.2 — [S5 Confirmation] Status truth and amount agreement
• sang-logium-qz2.5.3 — [S5 Confirmation] Order-write failures and uncertain states
• sang-logium-qz2.5.4 — [S5 Confirmation] Re-entry: Try again, Back, reload
• sang-logium-qz2.5.5 — [S5 Confirmation] Purchase analytics event
• sang-logium-qz2.5.6 — [S5 Confirmation] Layout across branches
• sang-logium-qz2.5.7 — [S5 Confirmation] Promises, support links and next steps

CORRECTIONS MADE TO THE ORIGINAL LIST (2026-09-03 review)
• Each status branch now states how a human reaches it with Stripe test cards / hosts-file blocks; processing-branch checks are N/A unless the state can be produced.
• Analytics checks made conditional on the GA id and given a concrete inspection method (window.dataLayer), including the real expected failures (items: [] and "USD").
• "Order row exists but non-succeeded Stripe status" given a concrete construction (hand-made Order in Studio pointing at a canceled PI).
• "Both order-creation paths fail permanently" made concrete with a hosts block on the Sanity hosts.
• Removed "router.refresh()" wording — a human reloads.

RISK ASSESSMENT
Outcome risks:
• Scope creep into fixing everything a failing check reveals. Mitigation: children only produce pass/fail verdicts on the live checkout; each real defect found is filed as its own separate bug issue.
• Boundary crossing into an adjacent slice. Mitigation: only exercise interactions inside this slice's boundary; a failure whose cause lives in another slice is noted and filed against that slice.
• False positives from a stale build. Mitigation: the human runs each check against a fresh localhost:3000 and confirms the observed outcome in words.
Execution risks:
• Lean-path mandate (Issue Risk Protocol Part B): edit source only, hand every live check to the human on localhost:3000. No next build, no tsc/ts-check, no project lint, no test runs, no agent-run dev server, no browser automation for verification, no npm install, no git. Mitigation: if a "no" genuinely blocks the work, stop and say so in one line.
• hosts-file, .env and Studio edits made for a check must be reverted afterwards; the dev server restarted for hosts/.env changes.

OUT OF SCOPE
• The settlement / order-write / stock path (that is S4).
• The cross-cutting shell, stepper or headers.

CURRENT STATUS: not started

SOURCE: slice S5 of docs/checkout/checkout-gating-questions.html
