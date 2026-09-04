# sang-logium-qz2.5.3 — [S5 Confirmation] Order-write failures and uncertain states

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:18:16Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:22:04Z |
| parent | sang-logium-qz2.5 |

## dependencies

- parent-child: sang-logium-qz2.5 — EPIC Checkout Gates S5 Confirmation
- blocks: sang-logium-qz2.5.2 — [S5 Confirmation] Status truth and amount agreement

## description

SINGLE RESPONSIBILITY: Prove a paid customer is never stranded when the order or Stripe verification is late or missing.

How to reach states: Stripe-unreachable = hosts "127.0.0.1 api.stripe.com" then reload the success URL; verification-failed = same block set BEFORE the browser returns from Stripe; order missing = hosts "127.0.0.1 <projectId>.api.sanity.io" and "127.0.0.1 <projectId>.apicdn.sanity.io" before Pay.

ACCEPTANCE TESTS
• When no Order can be written, then the succeeded page still confirms the payment, shows the amount and a copyable reference — not an endless "Generating your order receipt…" with no way out.
• When the Order is not yet written at first paint (block, then unblock), then "Generating your order receipt…" offers a working Refresh that resolves to the real order once the webhook lands.
• When verification failed but the payment succeeded (check dashboard), then the screen makes clear the payment likely went through, shows a copyable reference and a working way to confirm — not an outright failure.
• When I drive each reachable state (succeeded, declined, canceled, verification-failed, Stripe-unreachable), then each renders a distinct, deliberate screen with no stack trace, blank page or infinite spinner.
Revert hosts afterwards.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
