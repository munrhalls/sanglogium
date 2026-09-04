# sang-logium-qz2.6.5 — [S6 Flow] Shared shell, stepper and error screen

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:30Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:11Z |
| parent | sang-logium-qz2.6 |

## dependencies

- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting
- blocks: sang-logium-qz2.6.4 — [S6 Flow] Navigation retention and re-routing

## description

SINGLE RESPONSIBILITY: Prove the four checkout screens look like one product.

ACCEPTANCE TESTS
• When I walk address → shipping → payment → success at 375 px and 1440 px, then the progress indicator marks the step I am on, shows done vs remaining, and at 375 px the steps are still identifiable.
• When I compare address, shipping and payment at 375, 768 and 1440 px, then they share header, background, stepper position, card style, primary button style and page width.
• When I walk the flow at each width, then heading sizes, body text, field spacing and vertical rhythm are consistent from screen to screen.
• When I force the checkout error screen (unpublish a basket product in Studio, load /checkout/payment), then "Something went wrong" is styled like the surrounding checkout — dark theme, same typography and buttons — not a light page with grey text and a black button. Republish afterwards.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
