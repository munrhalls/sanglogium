# sang-logium-qz2.2.4 — [S2 Shipping] Option list layout and states

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:53Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:35Z |
| parent | sang-logium-qz2.2 |

## dependencies

- parent-child: sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping
- blocks: sang-logium-qz2.2.3 — [S2 Shipping] Parcel data, basket size and address changes

## description

SINGLE RESPONSIBILITY: Prove the option list and its states render cleanly at every width.

ACCEPTANCE TESTS
• When I view the option list at 375, 768 and 1440 px, then no overlap, no clipped text, no horizontal scroll, prices aligned, and a clear visual difference between selected and unselected rows.
• When I force the empty state and the red error banner at each width, then each renders cleanly with the retry button fully tappable and no layout jump.
• When I scroll the list to the end at 375 px, then the sticky "Przejdź do płatności" bar stays visible and tappable without covering the last option.
• When I am on the shipping step, then the progress indicator marks Shipping as current and Basket and Address as done.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
