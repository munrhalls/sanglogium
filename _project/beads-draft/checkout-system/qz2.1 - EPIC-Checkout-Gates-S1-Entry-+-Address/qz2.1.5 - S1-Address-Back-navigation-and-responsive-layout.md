# sang-logium-qz2.1.5 — [S1 Address] Back navigation and responsive layout

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:48Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:27Z |
| parent | sang-logium-qz2.1 |

## dependencies

- blocks: sang-logium-qz2.1.4 — [S1 Address] Registry outage, escape hatch and explanatory copy
- parent-child: sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address

## description

SINGLE RESPONSIBILITY: Prove the address step keeps my data on the way back and renders cleanly at every width.

ACCEPTANCE TESTS
• When I press browser Back from the shipping step, then the address form still holds everything I typed.
• When I go back, change the postal code and re-submit after a delivery option was already selected, then I am routed through shipping again (payment unreachable by URL until I re-pick), so I cannot pay a rate quoted for the old address.
• When I view the form at 375, 768 and 1440 px (DevTools device toolbar), then no overlap, no clipped labels, no horizontal page scroll, and First/Last and Street/Number pairs collapse to one column at 375.
• When I trigger the rejection banner and the "Verifying..." button state at each width, then each renders without layout jump or button resize.
• When a rejection shows both buttons, then "Continue with entered address" is visibly secondary to "Continue to Shipping" at every width.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
