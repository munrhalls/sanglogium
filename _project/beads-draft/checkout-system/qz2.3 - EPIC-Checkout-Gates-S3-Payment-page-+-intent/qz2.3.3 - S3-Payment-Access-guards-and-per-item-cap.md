# sang-logium-qz2.3.3 — [S3 Payment] Access guards and per-item cap

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:59Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:44Z |
| parent | sang-logium-qz2.3 |

## dependencies

- blocks: sang-logium-qz2.3.2 — [S3 Payment] Provider and catalogue failure handling
- parent-child: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

## description

SINGLE RESPONSIBILITY: Prove the payment step is only reachable by its owner, in the right order, with a sane basket.

ACCEPTANCE TESTS
• When I paste the /checkout/payment URL into an Incognito window, then I am sent to the basket, never shown a payment form for my basket.
• When I paste a completed payment's return URL (/api/checkout/return?payment_intent=pi_…) into Incognito, then I land on the basket with no order shown, never a confirmation.
• When I open /checkout/payment directly with an empty basket, no address, or no delivery chosen (delete the "checkout_session" cookie, or stop after S1), then I am taken cleanly to the basket or the matching earlier step with no flash of a broken payment page.
• When I set quantity 11 in "basket-storage" before clicking Checkout and pass address and delivery, then I am stopped in the basket with a clear stated reason — not bounced from payment to a basket that shows no message.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
