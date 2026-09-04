# sang-logium-qz2.4.5 — [S4 Settlement] References, receipt email and data hygiene

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:10Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:49Z |
| parent | sang-logium-qz2.4 |

## dependencies

- blocks: sang-logium-qz2.4.4 — [S4 Settlement] Order content matches what was paid
- parent-child: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock

## description

SINGLE RESPONSIBILITY: Prove owner and customer can find the order, the email is optional to the order's existence, and no sensitive data leaks.

Email: with RESEND_API_KEY set use an inbox you own; without it the email is printed in the dev terminal.

ACCEPTANCE TESTS
• When I use only the reference on the confirmation screen (order number and pi_… code), then I can find that payment in the Stripe dashboard and that Order in Studio without guessing.
• When RESEND_API_KEY is removed (or set to garbage) and I pay, then the Order is still created, complete and visible in Studio.
• When I read a completed Order, its confirmation email, and the dev terminal events for that checkout, then none contains a full card number, CVC, or more personal data than the order needs (brand + last4 expected).
• When I compare the confirmation email to the Order in Studio, then order number, line items, quantities, total and delivery address all match.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
