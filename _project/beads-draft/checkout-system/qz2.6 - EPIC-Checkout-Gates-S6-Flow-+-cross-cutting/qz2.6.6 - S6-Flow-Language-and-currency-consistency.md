# sang-logium-qz2.6.6 — [S6 Flow] Language and currency consistency

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:32Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:10Z |
| parent | sang-logium-qz2.6 |

## dependencies

- parent-child: sang-logium-qz2.6 — EPIC Checkout Gates S6 Flow + cross-cutting
- blocks: sang-logium-qz2.6.5 — [S6 Flow] Shared shell, stepper and error screen

## description

SINGLE RESPONSIBILITY: Prove the store speaks one deliberate language mix and one currency.

ACCEPTANCE TESTS
• When I walk basket → address → shipping → payment → success, then the English/Polish mix reads as a deliberate bilingual choice, not one forgotten screen.
• When I open /checkout/shipping and inspect <html lang> in DevTools, then it matches the page's language and Chrome's "Translate this page?" does not treat the Polish page as English.
• When I check currency on the shipping option, payment total, Stripe sheet and success screen, then all are PLN and PLN is what the Stripe dashboard shows was charged.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
