# sang-logium-qz2.3.6 — [S3 Payment] Layout, Stripe theming and forced states

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:03Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:40Z |
| parent | sang-logium-qz2.3 |

## dependencies

- blocks: sang-logium-qz2.3.5 — [S3 Payment] Trust copy, VAT, invoice and instalments
- parent-child: sang-logium-qz2.3 — EPIC Checkout Gates S3 Payment page + intent

## description

SINGLE RESPONSIBILITY: Prove the payment step renders as one designed surface at every width.

ACCEPTANCE TESTS
• When I view the step at 375, 768 and 1440 px with a 3-line basket, then no overlap, no clipped text, no horizontal scroll, prices aligned, two columns reflow to one at 375.
• When I compare the Stripe card / BLIK / Przelewy24 fields with the rest of checkout, then same dark background, text colour, border and focus treatment.
• When I scroll the payment column to the end at 375 px, then the sticky Pay bar stays tappable without covering the last field, the security line, or the card-brand row.
• When I trigger "Preparing secure payment…", the "Payment Error" card, an inline error (submit with empty card field) and "Processing…" at each width, then each is a designed, on-palette element with no layout jump.
• When I am on the payment step, then the progress indicator marks Payment as current and Basket, Address, Shipping as done.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
