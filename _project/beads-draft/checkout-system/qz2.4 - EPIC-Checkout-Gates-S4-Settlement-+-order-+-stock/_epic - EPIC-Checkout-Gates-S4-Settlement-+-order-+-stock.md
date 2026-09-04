# sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:49Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:17Z |
| parent | sang-logium-qz2 |

## dependencies

- parent-child: sang-logium-qz2 — EPIC Checkout System Proof of Professional Level
- blocks: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

## description

SINGLE RESPONSIBILITY: Verify slice S4 as the store owner: from the moment Stripe tells the store a payment happened (browser return + webhook) until an order for that payment exists in Studio exactly once and stock has been decremented or the shortfall surfaced.

PRECONDITIONS (once, before the children)
• Fresh localhost:3000 dev server in Stripe TEST mode, dev terminal visible with LOG_LEVEL=info.
• Stripe CLI running: stripe listen --forward-to localhost:3000/api/webhooks/stripe, with the printed whsec_… set as STRIPE_WEBHOOK_SECRET in .env (restart dev server after setting).
• Studio open at localhost:3000/studio → "Order" list is the store's order list; "Product" → stock field.
• Stripe test dashboard → Payments.
• Email: with RESEND_API_KEY set, use an inbox you own; without it the confirmation email is printed to the dev terminal.
• Test cards: 4242… (success), 4000 0000 0000 3220 (3-D Secure; "Fail" = declined), Przelewy24 test bank page ("Fail" = cancelled).
• Test orders land in the configured Sanity dataset — delete them and restore Product stock afterwards.

ACCEPTANCE TESTS (epic level)
• When every child issue below is closed with a written pass/fail verdict for each of its checks, then this slice's gating questions are all honestly answered on a fresh localhost:3000.
• When any check answers no, then a separate bug issue exists for that defect, linked back to the child that found it.

CHILD ISSUES — run in this order (each is blocked by the previous one)
• sang-logium-qz2.4.1 — [S4 Settlement] Only genuine payments become orders
• sang-logium-qz2.4.2 — [S4 Settlement] Exactly one order and one stock decrement
• sang-logium-qz2.4.3 — [S4 Settlement] Oversell is never silent
• sang-logium-qz2.4.4 — [S4 Settlement] Order content matches what was paid
• sang-logium-qz2.4.5 — [S4 Settlement] References, receipt email and data hygiene
• sang-logium-qz2.4.6 — [S4 Settlement] Customer identity: guest and account orders

CORRECTIONS MADE TO THE ORIGINAL LIST (2026-09-03 review)
• "Hand-made notification" made concrete (unsigned POST → 400; stripe trigger → refused).
• "Payment pending, succeeds minutes later" removed — no Stripe test method reliably yields a processing PaymentIntent for the enabled methods.
• "Order-storage host unreachable" and "trouble creating the order during return" given concrete hosts-file steps and the stripe events resend recovery.
• Guest-email checks rewritten: the live checkout currently has no email field for guests, so the checks state what "yes" would look like.
• "Admin order list" fixed to mean Studio → Order (the only order list the owner has). "Checkout event log" fixed to mean the dev terminal.

RISK ASSESSMENT
Outcome risks:
• Scope creep into fixing everything a failing check reveals. Mitigation: children only produce pass/fail verdicts on the live checkout; each real defect found is filed as its own separate bug issue.
• Boundary crossing into an adjacent slice. Mitigation: only exercise interactions inside this slice's boundary; a failure whose cause lives in another slice is noted and filed against that slice.
• False positives from a stale build. Mitigation: the human runs each check against a fresh localhost:3000 and confirms the observed outcome in words.
Execution risks:
• Lean-path mandate (Issue Risk Protocol Part B): edit source only, hand every live check to the human on localhost:3000. No next build, no tsc/ts-check, no project lint, no test runs, no agent-run dev server, no browser automation for verification, no npm install, no git. Mitigation: if a "no" genuinely blocks the work, stop and say so in one line.
• hosts-file, .env and Studio edits made for a check must be reverted afterwards; the dev server restarted for hosts/.env changes.

OUT OF SCOPE
• Any single checkout screen's internal correctness.
• The confirmation screen's rendering (that is S5).
• The shared checkout shell / stepper / error screen.

CURRENT STATUS: not started

SOURCE: slice S4 of docs/checkout/checkout-gating-questions.html
