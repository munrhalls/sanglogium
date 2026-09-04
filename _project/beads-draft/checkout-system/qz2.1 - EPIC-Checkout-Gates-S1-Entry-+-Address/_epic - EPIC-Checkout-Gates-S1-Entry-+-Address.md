# sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | epic |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T09:55:45Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:14Z |
| parent | sang-logium-qz2 |

## dependencies

- parent-child: sang-logium-qz2 — EPIC Checkout System Proof of Professional Level

## description

SINGLE RESPONSIBILITY: Verify slice S1 on the running checkout: from the basket "Checkout" click until a validated (or escape-hatched) address is stored and I am redirected to /checkout/shipping.

PRECONDITIONS (once, before the children)
• Fresh localhost:3000 dev server; dev terminal visible (checkout events print there).
• A basket with 2 different in-stock products, one at quantity 2.
• Chrome DevTools open. Basket lives in localStorage key "basket-storage" as {productId, quantity} pairs — this is the only client-side input to the Checkout click (there is no price in it).
• A real Polish address to hand.

ACCEPTANCE TESTS (epic level)
• When every child issue below is closed with a written pass/fail verdict for each of its checks, then this slice's gating questions are all honestly answered on a fresh localhost:3000.
• When any check answers no, then a separate bug issue exists for that defect, linked back to the child that found it.

CHILD ISSUES — run in this order (each is blocked by the previous one)
• sang-logium-qz2.1.1 — [S1 Address] Basket input integrity before checkout
• sang-logium-qz2.1.2 — [S1 Address] Entry happy path, stock and stepper
• sang-logium-qz2.1.3 — [S1 Address] Field validation and unsafe input
• sang-logium-qz2.1.4 — [S1 Address] Registry outage, escape hatch and explanatory copy
• sang-logium-qz2.1.5 — [S1 Address] Back navigation and responsive layout

CORRECTIONS MADE TO THE ORIGINAL LIST (2026-09-03 review)
• Removed "inject or alter a price / currency / unit-amount on the Checkout request" — the Checkout request carries no price; price tampering belongs to S3 where it is actually possible.
• Removed "correct-this verdict vs confirm-this-looks-right verdict" — only one rejection verdict exists on the live app.
• Quantity / product-id tampering rewritten to use the localStorage basket (the real client input) instead of "intercept the request".
• "Checker slow / hanging / down" made concrete with a hosts-file block on uslugaterytws1test.stat.gov.pl and the expected degraded-accept outcome stated.

RISK ASSESSMENT
Outcome risks:
• Scope creep into fixing everything a failing check reveals. Mitigation: children only produce pass/fail verdicts on the live checkout; each real defect found is filed as its own separate bug issue.
• Boundary crossing into an adjacent slice. Mitigation: only exercise interactions inside this slice's boundary; a failure whose cause lives in another slice is noted and filed against that slice.
• False positives from a stale build. Mitigation: the human runs each check against a fresh localhost:3000 and confirms the observed outcome in words.
Execution risks:
• Lean-path mandate (Issue Risk Protocol Part B): edit source only, hand every live check to the human on localhost:3000. No next build, no tsc/ts-check, no project lint, no test runs, no agent-run dev server, no browser automation for verification, no npm install, no git. Mitigation: if a "no" genuinely blocks the work, stop and say so in one line.
• hosts-file, .env and Studio edits made for a check must be reverted afterwards; the dev server restarted for hosts/.env changes.

OUT OF SCOPE
• The basket page's own correctness.
• Shipping step internals, the payment total, the order write.
• The shared checkout shell / stepper / error screen.

CURRENT STATUS: not started

SOURCE: slice S1 of docs/checkout/checkout-gating-questions.html
