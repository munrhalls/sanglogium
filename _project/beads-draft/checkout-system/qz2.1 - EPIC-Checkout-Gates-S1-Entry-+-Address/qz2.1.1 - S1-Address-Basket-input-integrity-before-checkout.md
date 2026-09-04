# sang-logium-qz2.1.1 — [S1 Address] Basket input integrity before checkout

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:42Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:32Z |
| parent | sang-logium-qz2.1 |

## dependencies

- parent-child: sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address

## description

SINGLE RESPONSIBILITY: Prove that what the client stores in the basket cannot become an invalid or foreign line in checkout.

ACCEPTANCE TESTS
• When I edit localStorage "basket-storage" (DevTools > Application) so one line has quantity -3, reload /basket and click Checkout, then I am stopped with a clear message and that quantity never appears on the payment step.
• When I repeat with quantity 0, then I am stopped clearly and never reach payment.
• When I repeat with quantity 999999, then I am stopped before payment with a clear stated reason, not silently bounced to a basket that shows nothing.
• When I add a made-up productId line (e.g. "not-a-real-id") and click Checkout, then by the payment step I am clearly told that item is unknown and cannot be bought — not a generic "Something went wrong" page.
• When I duplicate an existing line (same productId twice) and click Checkout, then the payment summary shows one row with the correct merged quantity, not two rows or a doubled price.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
