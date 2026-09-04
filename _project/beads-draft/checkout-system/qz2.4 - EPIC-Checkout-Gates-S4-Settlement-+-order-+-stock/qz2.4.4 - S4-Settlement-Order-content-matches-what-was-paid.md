# sang-logium-qz2.4.4 — [S4 Settlement] Order content matches what was paid

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:09Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:51Z |
| parent | sang-logium-qz2.4 |

## dependencies

- blocks: sang-logium-qz2.4.3 — [S4 Settlement] Oversell is never silent
- parent-child: sang-logium-qz2.4 — EPIC Checkout Gates S4 Settlement + order + stock

## description

SINGLE RESPONSIBILITY: Prove the stored order is a faithful record of the charge and the shopper's choices.

ACCEPTANCE TESTS
• When I complete a test payment, then the Order's pricing.total and currency match, to the grosz, the amount captured in the Stripe dashboard.
• When I change a product's price in Studio after reaching payment and then pay, then the Order's line items and subtotal add up to what Stripe captured, with subtotal + shipping = total.
• When I read the Order's shippingMethod, then it records the same carrier, service level and delivery price picked on the shipping step.
• When the order store is unreachable only during the browser return (hosts block set right before Pay, removed after landing), then the shopper still lands on "Payment confirmed" with "Generating your order receipt…", never back on the basket with an error.
• When I drive each reachable end state (succeeded; 3-D Secure fail; P24 cancel; Stripe unreachable during return via hosts block on api.stripe.com), then each lands on a screen that correctly describes it — never a raw error and never "Payment confirmed" for a payment that did not succeed.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
