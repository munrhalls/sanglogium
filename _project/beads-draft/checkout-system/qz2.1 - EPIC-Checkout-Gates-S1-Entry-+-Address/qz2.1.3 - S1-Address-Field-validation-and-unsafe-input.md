# sang-logium-qz2.1.3 — [S1 Address] Field validation and unsafe input

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:45Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:29Z |
| parent | sang-logium-qz2.1 |

## dependencies

- blocks: sang-logium-qz2.1.2 — [S1 Address] Entry happy path, stock and stepper
- parent-child: sang-logium-qz2.1 — EPIC Checkout Gates S1 Entry + Address

## description

SINGLE RESPONSIBILITY: Prove every rejected input tells me exactly what to fix and no unsafe value survives.

ACCEPTANCE TESTS
• When my address is rejected, then the message names what to correct (street / city / postal code), not only a generic "could not match the registry" sentence, and a way to proceed is offered.
• When I enter a postal code not in NN-NNN form (e.g. "12345"), then I am told specifically the postal code is wrong.
• When I leave any required field empty and press "Continue to Shipping", then the browser blocks submission and points to the field, and the dev terminal shows no address_submit_start event.
• When I fill First Name with only spaces (rest valid) and submit, then I am stopped with a specific message and the blank name never shows on the payment step "Deliver to" block.
• When I put <b>test</b><script>alert(1)</script> in First Name and Street and continue via the escape hatch, then it shows as inert plain text (brackets visible, no bold, no alert) on shipping, payment "Deliver to", and the confirmation screen.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
