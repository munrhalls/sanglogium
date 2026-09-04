# sang-logium-qz2.4.1 — [S4 Settlement] Only genuine payments become orders

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:05Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:56Z |
| parent | sang-logium-qz2.4 |

## dependencies

- parent-child: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock

## description

SINGLE RESPONSIBILITY: Prove no order or stock movement can be caused by anything but a real, owned, succeeded payment.

Setup: stripe listen --forward-to localhost:3000/api/webhooks/stripe with its whsec_ in .env; Studio → Order list; LOG_LEVEL=info in dev terminal.

ACCEPTANCE TESTS
• When I POST to /api/webhooks/stripe from the Console with a hand-written {"type":"payment_intent.succeeded"} body and no Stripe signature, then the response is 400, no Order appears, no stock changes.
• When I run stripe trigger payment_intent.succeeded (a paid PI that never went through this checkout), then no Order appears, no stock changes, and the terminal shows a webhook error rather than a crash.
• When I fail a 3-D Secure payment (4000…3220 → "Fail") and separately cancel a Przelewy24 test payment, then Studio shows no Order and no stock movement for either.
• When I paste the return URL into Incognito, or swap the pi_… for another payment's id in my own window, then no order is created for anything but the payment that belongs to my checkout.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
