# sang-logium-qz2.4.2 — [S4 Settlement] Exactly one order and one stock decrement

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:06Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:54Z |
| parent | sang-logium-qz2.4 |

## dependencies

- blocks: sang-logium-qz2.4.1 — [S4 Settlement] Only genuine payments become orders
- parent-child: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock

## description

SINGLE RESPONSIBILITY: Prove the two settlement paths (browser return + webhook) never double-count and never lose an order.

ACCEPTANCE TESTS
• When I complete a normal 4242… payment with the Stripe CLI forwarding events, then Studio shows exactly one Order for that PaymentIntent.
• When I reload the confirmation, press Back then Forward, and re-open the URL 10 minutes later, then Studio still shows one Order and the dashboard one charge.
• When I block the order store just before Pay (hosts: "127.0.0.1 <projectId>.api.sanity.io" and "127.0.0.1 <projectId>.apicdn.sanity.io"), then unblock and run stripe events resend <evt_id> for the payment_intent.succeeded event, then the Order appears exactly once — never missing, never twice.
• When I look at the order numbers across 5 test orders, then each is unique and maps back to exactly one PaymentIntent (Order → paymentIntentId).
• When I buy 2 units of a product with stock 10 and both paths run, then Product stock reads exactly 8 — not 6, not 10.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
