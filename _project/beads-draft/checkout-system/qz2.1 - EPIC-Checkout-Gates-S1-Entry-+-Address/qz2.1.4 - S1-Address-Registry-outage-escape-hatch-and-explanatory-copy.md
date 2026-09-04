# sang-logium-qz2.1.4 — [S1 Address] Registry outage, escape hatch and explanatory copy

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:46Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:28Z |
| parent | sang-logium-qz2.1 |

## dependencies

- blocks: sang-logium-qz2.1.3 — [S1 Address] Field validation and unsafe input
- parent-child: sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address

## description

SINGLE RESPONSIBILITY: Prove the address step never dead-ends and its copy explains itself.

ACCEPTANCE TESTS
• When I block the registry (add "127.0.0.1 uslugaterytws1test.stat.gov.pl" to C:\Windows\System32\drivers\etc\hosts, restart the dev server) and submit a valid address, then I finish the step within ~15 s, the button never spins forever, and the dev terminal shows a "[TERYT] Degraded" line rather than an exception. Remove the hosts line afterwards.
• When I use "Continue with entered address" with obviously wrong data (street "Zzzzz 999", city "Nowhere"), then checkout does not crash later and exactly that address is shown back on the payment step.
• When I read the escape-hatch button and the copy around it, then it reads as a safe fallback for a correct address the checker did not recognise, not "proceed at your own risk".
• When I land on the address step fresh, then it is stated in words (not only a one-option country select) that the store ships only within Poland.
• When I read near the Phone Number field, then it states why a phone number is required.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
