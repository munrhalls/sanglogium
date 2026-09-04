# sang-logium-qz2.2.5 — [S2 Shipping] Option copy, estimates and Polish wording

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:55Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:33Z |
| parent | sang-logium-qz2.2 |

## dependencies

- parent-child: sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping
- blocks: sang-logium-qz2.2.4 — [S2 Shipping] Option list layout and states

## description

SINGLE RESPONSIBILITY: Prove every option row is truthful and reads like a real Polish store.

ACCEPTANCE TESTS
• When I walk address (English) → shipping (Polish) → payment (English), then the language switch reads as deliberate, not as one screen someone forgot to translate.
• When I read each option's delivery estimate, then it matches what the carrier returned; a missing carrier estimate shows "estimate unavailable" (or similar), not a fabricated "1 dzień roboczy".
• When I find or force an option with a 5-or-more-day estimate (e.g. a remote postcode), then the Polish is grammatically correct ("5 dni roboczych", not "5 dni robocze").
• When I read a multi-option list, then I can tell courier company from service level at a glance; no row shows "Unknown", "undefined" or a blank.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
