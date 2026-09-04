# sang-logium-qz2.2.2 — [S2 Shipping] Carrier unreachable, hanging or misconfigured

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:50Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:37Z |
| parent | sang-logium-qz2.2 |

## dependencies

- blocks: sang-logium-qz2.2.1 — [S2 Shipping] Delivery price integrity and guards
- parent-child: sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping

## description

SINGLE RESPONSIBILITY: Prove every carrier failure is explained and retryable, and is never disguised as "no couriers".

ACCEPTANCE TESTS
• When I make the carrier unreachable (add "127.0.0.1 allekurier.pl" to the hosts file, restart dev server) and load /checkout/shipping, then I get a clear message and a retry button that re-requests options — not only the bare grey "Brak dostępnych opcji dostawy." box.
• When I make the carrier hang (point allekurier.pl to 10.255.255.1 in hosts) and load the step, then I see a loading state, and after roughly 15 s either options or a clear message — never blank, never longer than ~20 s.
• When I set ALLEKURIER_EMAIL to a wrong value in .env, restart and load the step, then I see the same clear "could not fetch options" + retry, not "Brak dostępnych opcji dostawy." as if my postcode had no couriers.
• When couriers genuinely do not exist for my postcode vs when the lookup failed, then I see two different messages, so I know whether to fix my address, retry, or contact the store.
Revert hosts and .env afterwards.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
