# sang-logium-qz2.2.1 — [S2 Shipping] Delivery price integrity and guards

| field | value |
|---|---|
| status | open |
| priority | 1 |
| issue_type | task |
| owner | antarcticdepths71@gmail.com |
| created_at | 2026-09-03T10:17:49Z |
| created_by | Munrhalls |
| updated_at | 2026-09-03T10:21:39Z |
| parent | sang-logium-qz2.2 |

## dependencies

- parent-child: sang-logium-qz2.2 — EPIC Checkout Gates S2 Shipping

## description

SINGLE RESPONSIBILITY: Prove the delivery price I am charged is the carrier's quote, never the client's.

HOW TO REPLAY: the "Przejdź do płatności" click sends one server-action POST whose body is a JSON array [rateId, priceInCents, methodName, carrier, estimatedDays]. Right-click it in Network → Copy → "Copy as fetch", edit, run in Console.

ACCEPTANCE TESTS
• When I replay the request with priceInCents = 1 and open /checkout/payment, then the delivery line and total still show the real quoted price, and the Stripe test dashboard PaymentIntent equals that real total.
• When I replay with an invented rateId (e.g. "FAKE_XYZ") and price 1, then I am refused before it can become my total — not shown a payment form quoting the invented option.
• When I note the price of the option I pick, then the identical number and currency (no rounding drift) appear on the payment delivery line, in the total, and on the confirmation screen.
• When I double-click "Przejdź do płatności", then I land on payment once with a single delivery selection, no stuck "Przetwarzanie…", one server-action POST in Network.
• When I open /checkout/shipping with no address saved (delete the "checkout_session" cookie first), then I am taken to the address step or basket with no flash of a broken shipping page.

Each check is a pass/fail verdict on a fresh localhost:3000. A "no" is filed as its own bug issue linked to this issue; nothing is fixed inside this issue. Preconditions, risk assessment and out-of-scope are inherited from the parent epic.

CURRENT STATUS: not started
