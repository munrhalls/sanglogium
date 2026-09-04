# sang-logium-qz2.3.1 — [S3 Payment] Amount integrity against client and catalogue changes

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:56Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:46Z |
| parent | sang-logium-qz2.3 |

## dependencies

- parent-child: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

## description

SINGLE RESPONSIBILITY: Prove the charged amount is always the live catalogue total for the real session basket.

HOW TO REPLAY: on load, the payment step sends one POST to /api/checkout/payment-intent-session with body {grandTotal, metadata}. Right-click → Copy as fetch → edit → run in Console.

ACCEPTANCE TESTS
• When I replay the request with grandTotal = 100, then the response is an error or a clientSecret whose PaymentIntent (Stripe dashboard) still carries the real total — never 1,00 zł.
• When I edit "basket-storage" in localStorage to raise a quantity or swap a productId after reaching payment, then reload, then the amount shown and the PaymentIntent reflect only my checkout session, not the edited localStorage.
• When I change a basket product's price in Studio while on the payment step and reload, then summary, Pay button and Stripe amount all show the current catalogue price.
• When I read the summary Total, the "Pay · …" button, the amount in the Stripe card/BLIK sheet, and the PaymentIntent in the dashboard, then all four show the same figure in PLN.
• When the stored delivery cost is legitimately zero (pick a free option if one exists; else N/A), then delivery shows as free and the total is correct, not an error.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
