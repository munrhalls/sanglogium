# sang-logium-qz2.3.4 — [S3 Payment] Paying with test cards

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:00Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:42Z |
| parent | sang-logium-qz2.3 |

## dependencies

- blocks: sang-logium-qz2.3.3 — [S3 Payment] Access guards and per-item cap
- parent-child: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

## description

SINGLE RESPONSIBILITY: Prove the Pay action is single-shot, honest about declines, and shows only safe card data.

Test cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (declined inline), 4000 0000 0000 3220 (3-D Secure → "Fail").

ACCEPTANCE TESTS
• When I read every line of the order summary, then it shows the same items, quantities, delivery method, price and address I chose earlier.
• When I double-click "Pay" with 4242…, then I am handed to Stripe once, the button shows "Processing…", and the dashboard shows one PaymentIntent, not two.
• When I pay with 4000…0002, then I stay on the payment step with a clear decline reason and basket, address, delivery intact, able to retry immediately.
• When I pay with 4000…3220 and click "Fail" in the 3-D Secure dialog, then I land on a screen saying the payment was declined with a working "Try again" back to a payment form that still has my basket and address.
• When I pay with 4242…, then the card appears only as brand + last four on the confirmation screen and in the Studio order (payment → brand, last4); no full number anywhere.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
