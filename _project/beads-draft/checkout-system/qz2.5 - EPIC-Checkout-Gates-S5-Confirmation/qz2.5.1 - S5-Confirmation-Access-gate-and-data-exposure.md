# sang-logium-qz2.5.1 — [S5 Confirmation] Access gate and data exposure

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:14Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:07Z |
| parent | sang-logium-qz2.5 |

## dependencies

- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation

## description

SINGLE RESPONSIBILITY: Prove only the buyer can see their confirmation and nothing sensitive is in the page.

ACCEPTANCE TESTS
• When I paste my succeeded URL (/checkout/success?payment_intent=pi_…) into an Incognito window, then I am sent to /basket — not shown that order, even though it exists in Studio.
• When I paste it into a browser signed in as a different account, then the same: /basket.
• When I View Source the non-owner result, then no buyer name, street, email or items appear anywhere in the response.
• When I append &error=verification_failed to my own genuine succeeded URL and reload, then I still see my real confirmation, not the "We couldn't verify your payment status" screen.
• When I View Source the succeeded screen, then no card detail beyond brand + last four, no expiry, no CVC, no raw pm_… or cus_… ids.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
