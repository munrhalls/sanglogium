# S4 — Settlement, order & stock slice · Gating questions

Deliverable of `sang-logium-vdq.5`. Cluster for the **Settlement + order + stock**
slice — the invisible money path. Rubric, question format and leanness test:
`00-rubric-and-slice-map.md`.

**Slice boundary.** From the moment the payment provider tells the store a payment
happened — the shopper's browser returning to the site, *and* the provider's own
server-to-server message — until an order for that payment exists in the store's
order list exactly once and stock has been decremented or the shortfall flagged.
Not the payment page or the charge amount's construction (S3 → `vdq.4`), not the
rendering of the confirmation screen the shopper lands on (S5 → `vdq.6`), not the
shared shell / whole-journey language / re-entry web (S6 → `vdq.7`).

**Observer.** This slice has almost no customer-facing screen. Its watcher is the
**store owner**, looking at: the order list in the admin (Sanity Studio), the
per-product stock number, the payment provider's dashboard (Stripe), the
confirmation email, and the checkout event log. Every question below is phrased as
something the owner — or the shopper, at the redirect — can see there.

**Grounding for the question-writer** — scaffolding only, *not* part of the
deliverable; no term here may appear in a question. Written against
`app/api/checkout/return/route.ts`, `app/api/webhooks/stripe/route.ts`,
`lib/checkout/createOrderFromPaymentIntent.ts`, `lib/checkout/mergeGuestOrders.ts`,
`lib/email.ts`, `lib/auth.ts`, `app/api/checkout/payment-intent-session/route.ts`:

- **Two paths build the order.** The *return hop* — the shopper's browser coming
  back from Stripe — runs synchronously, is wrapped so a store-write error never
  blocks the redirect, and builds the order from the checkout cookie's data. The
  *webhook* — Stripe's server-to-server `payment_intent.succeeded` — builds the
  same order from data copied onto the PaymentIntent, and returns 500 on failure
  so Stripe retries. Both call the same `createOrderFromPaymentIntent`.
- **Idempotency is a read-then-write check, not a lock.** `createOrderFromPaymentIntent`
  first queries `*[_type=="order" && paymentIntentId==$id][0]`; if a row exists it
  returns. Two runs that both pass that read before either writes will both create
  an order. No unique constraint on `paymentIntentId`.
- **Order number** = `ORD-{full year}-{last 6 chars of the PaymentIntent id,
  upper-cased}`. `orderId` is a fresh `randomUUID()`. Only the last-6 slice is
  human-facing; nothing checks it hasn't been used before.
- **Webhook signature** is verified with `stripe.webhooks.constructEvent`; a bad
  or missing signature → 400, no order. If `STRIPE_WEBHOOK_SECRET` is unset the
  route 500s every event.
- **Order status on create is always `processing`.** Nothing sets a "needs review"
  or "stock shortfall" status. Insufficient stock is a log line only.
- **Stock is check-then-`dec`, per item, after the order is written.** Fetch stock
  for all basket ids → for each item, if `currentStock < quantity` log
  `order_stock_insufficient` and **continue without decrementing** ("manual
  review"); else `patch(id).dec({stock: qty}).commit()`. A post-pass re-reads and
  logs `order_stock_negative` for any row below zero. No reservation earlier in
  the flow; the decrement is not atomic with the check or across items.
- **Return hop by PI status:** `succeeded` → clears basket/address, sets
  `completedPaymentIntentId`, creates the order synchronously (non-fatal), redirect
  `/checkout/success?payment_intent=…`. `requires_payment_method` / `canceled` →
  no order, basket kept, redirect `…&status=failed|canceled`. `processing` → keeps
  everything, redirect `…&status=processing` (order only ever created later by the
  webhook). Retrieve-PI failure → redirect `…&error=verification_failed`, no
  synchronous order (webhook still can). Unknown status → `/basket?error=unexpected_status`.
- **A guard exists on the return hop:** the checkout cookie must already know this
  PaymentIntent id (`paymentIntentId` or `completedPaymentIntentId`), else
  `/basket?error=no_active_intent`; a mismatch → `/basket?error=intent_mismatch`.
- **Recorded order money:** `total = pi.amount` (what Stripe holds), `currency`
  from the PI. `subtotal` is *recomputed* from live product prices at order-create
  time; `tax` = PI metadata `vat` or `total − round(total/1.23)`; `shipping` =
  the client-supplied shipping cost carried through. Line-item `price` is the live
  product price at order-create time, `0` if the product can't be fetched.
- **Customer email on the order** = checkout cookie `email` (the setter for it is
  dead code — never populated) `?? pi.receipt_email ?? ''`. Validated with
  `z.string().email()`; on failure it is blanked and the raw value logged.
- **Payment details stored:** method type, card `brand`, card `last4` — pulled
  from the expanded charge. The webhook passes the raw event PI (charge *not*
  expanded), so on that path method is `'unknown'` and brand/last4 are absent.
  No PAN, no CVC — Stripe never exposes them.
- **Confirmation email** via Resend, from `createOrderFromPaymentIntent`, wrapped
  in try/catch (non-fatal). If `RESEND_API_KEY` is unset it only `console.log`s —
  no email is sent and nothing marks the order as un-notified. An empty `to` is
  passed straight to Resend.
- **Guest → account merge** runs on the auth "user updated" hook when
  `emailVerified` becomes true: `*[_type=="order" && isGuest==true &&
  customerEmail==$verifiedEmail && !defined(userId)]` → set `userId`, `isGuest:false`.
  Exact-string email match. A guest order with a blank or differently-cased email,
  or a signup under a different address, is never linked. Failure is caught and
  logged, signup still succeeds.
- **Account deletion** anonymises orders (`unset userId`, `isGuest:true`) rather
  than deleting them.

`answer:` stays `unknown` — filling it in is the downstream stress-test epic.

---

## A. Only a real, fully-successful payment ever creates an order

### A1. A forged "payment succeeded" message leaves no order and no stock change
**Q.** When a hand-made "payment succeeded" notification is sent to the store for a
basket that was never paid for, does the store still end up with **no** new order in
the order list and **no** change to any product's stock?
`dim: security` · `evidence: with the Stripe CLI (or curl), POST a hand-crafted payment_intent.succeeded to the store's notification URL for a made-up or unpaid payment; then check the admin order list and the stock numbers of the products named in it`
`answer: unknown`

### A2. A payment that did not fully succeed never becomes an order
**Q.** When a payment ends in any state other than fully paid — the card was
declined after 3-D Secure, the shopper cancelled on the provider's page, or the
payment is still "processing" and later fails — does the store end with no order and
no stock movement for it?
`dim: security, robustness` · `evidence: drive a test payment to a declined / cancelled / processing-then-failed outcome, return to the site, then check the order list and stock for that basket`
`answer: unknown`

### A3. Only the real payer can cause the store to fulfil their payment
**Q.** When someone who is not the shopper replays the browser return, or points it
at a payment id that isn't theirs, is an order still only ever created for a payment
that genuinely completed and genuinely belongs to that checkout — never for an
arbitrary payment id fed into the URL?
`dim: security` · `evidence: complete a real test payment, then re-open the return URL with a different (valid, someone else's) payment id and with a random one; check whether any order or stock change results`
`answer: unknown`

---

## B. Exactly one order per payment — never zero, never two

### B1. Both settlement paths firing together still produce exactly one order
**Q.** When the browser return and the provider's server-to-server message for the
same payment arrive at the same moment, does the order list show **exactly one**
order for that payment — not two?
`dim: robustness, security` · `evidence: complete a real test payment while replaying the provider notification for it via the Stripe CLI within the same second; count the orders in the admin list for that payment id`
`answer: unknown`

### B2. Refreshing or re-opening the post-payment page never creates a second order or a second charge
**Q.** When I reload the page I land on after paying, hit back and forward to it, or
re-open its URL later, does the order list still hold one order for that payment and
the provider dashboard still show one charge — with no duplicate of either?
`dim: robustness, security, trust` · `evidence: after a successful test payment, reload /checkout/success several times and re-navigate to it; check the order count and the charge count in Stripe`
`answer: unknown`

### B3. A payment that is "processing" first and succeeds later still ends as one order
**Q.** When a payment is pending at the moment the shopper returns and only
succeeds minutes later, does the store end with exactly one order for it — not zero
(because the return happened too early) and not two?
`dim: robustness` · `evidence: use a test payment method that resolves asynchronously; return to the site while it is still processing, wait for it to succeed, then check the order list`
`answer: unknown`

### B4. If the order can't be written at settlement, it still appears once when the store recovers
**Q.** When the store's order storage is unreachable at the instant a payment
succeeds, does the order reliably appear **once** after storage recovers — never
staying missing while the customer's card was charged, never landing twice?
`dim: robustness` · `evidence: block the store's CMS write host (devtools / hosts file) during a real test payment, complete it, then restore the host and wait for provider retries; check the order list`
`answer: unknown`

### B5. Two different payments can never show the same order number
**Q.** Can two different completed payments ever be given the same human-facing
order number — so two customers, or a customer and support, see one reference
pointing at two orders?
`dim: robustness, trust` · `evidence: inspect the order-number format and, across a batch of test orders in the same year, confirm each payment's visible order number is unique and maps back to exactly one payment`
`answer: unknown`

---

## C. Stock is never silently wrong

### C1. A real order decrements each item's stock exactly once
**Q.** After a successful order for, say, 2 units of a product that had 10 in stock,
does the stock read exactly 8 once both settlement paths have run — not 6 (counted
twice) and not 10 (never counted)?
`dim: robustness` · `evidence: note a product's stock, buy a known quantity of it, let the browser return and the provider notification both complete, re-read the stock`
`answer: unknown`

### C2. Racing orders for the last unit never leave the store silently oversold
**Q.** When two orders complete at nearly the same time for the last unit in stock,
does the store avoid selling both silently — either by holding one back, or by
leaving the oversell **visible to the owner** (a flag, a status, a review queue),
not just a line in a log file?
`dim: robustness, security` · `evidence: set a product's stock to 1, drive two test payments for it to complete together, then read the final stock and inspect both orders in the admin list`
`answer: unknown`

### C3. An order that couldn't take its stock is flagged where the owner looks
**Q.** When an order is placed for more units than exist, does that order stand out
in the admin order list as needing attention — rather than looking identical to a
normally-fulfilled order with the only trace buried in the event log?
`dim: robustness, trust` · `evidence: set a product's stock below the quantity ordered, complete the payment, then look at that order in the order list for any shortfall marker`
`answer: unknown`

### C4. Stock never goes negative unnoticed
**Q.** After any settlement, is every product's stock either zero-or-positive, or —
if it did go negative — surfaced to the owner as an alert or an order flag, not only
as a log entry nobody watches?
`dim: robustness` · `evidence: force a negative-stock situation (concurrent orders, or an order exceeding stock), then check the product record and whether anything in the admin signals it`
`answer: unknown`

---

## D. The recorded order matches the money actually taken

### D1. The order total equals the amount the provider actually captured
**Q.** Does the total recorded on the order — and shown to the owner in the order
list — match, to the cent and in the same currency, the amount the payment provider
actually captured for that payment?
`dim: security, trust` · `evidence: complete a test payment, then compare the order's recorded total / currency with the captured amount in the Stripe dashboard`
`answer: unknown`

### D2. A price change mid-checkout can't make the order's line items disagree with the charge
**Q.** When a product's price changes between the shopper reaching payment and the
payment completing, does the finished order still show line items and a subtotal
that add up to what was actually charged — rather than a total that no longer
matches its own breakdown?
`dim: robustness, trust` · `evidence: reach the payment step, change that product's price in the admin, complete the payment, then check the order's line items, subtotal, shipping and total against the captured amount`
`answer: unknown`

### D3. The order shows the delivery method and price the shopper chose
**Q.** Does the finished order record the same carrier, service level and delivery
price the shopper selected at the shipping step — not a blank, a different label, or
a changed number?
`dim: trust, robustness` · `evidence: note the delivery option chosen during checkout, then read the shipping section of the resulting order in the admin` · `coordinates with vdq.3`
`answer: unknown`

---

## E. A charged customer always leaves with an order and a findable reference

### E1. A customer who was charged is never dumped back at the basket with an error
**Q.** When a payment succeeds but the store hits trouble creating the order during
the browser return, does the shopper still land on a "payment received" confirmation
(with the order following shortly) — never back on the basket with an error and
nothing to show for their money?
`dim: trust, robustness` · `evidence: make the synchronous order write fail (block the CMS host) during a successful test payment and watch where the browser ends up and what it says` · `coordinates with vdq.6`
`answer: unknown`

### E2. Every payment outcome this path can produce has a matching confirmation screen
**Q.** For each state a payment can end in — succeeded, declined, cancelled,
processing, verification failed — does the shopper reach a screen that correctly
describes that state, with no combination falling through to a raw error or a
"confirmed" screen for a payment that didn't succeed?
`dim: trust, robustness` · `evidence: drive a test payment to each outcome and read the screen it lands on` · `coordinates with vdq.6`
`answer: unknown`

### E3. The reference shown to the customer is enough for support to find the payment
**Q.** Using only the reference numbers shown on the final screen and in the
confirmation email, can the owner locate that exact payment in the provider
dashboard and that exact order in the admin — without guessing?
`dim: trust` · `evidence: complete a test order, then try to find its payment in Stripe and its order in Studio using only what the customer was shown`
`answer: unknown`

### E4. A failed confirmation email never loses the order
**Q.** When the confirmation email can't be sent — bad address, mail service down,
or no mail service configured — is the order still created, complete, and visible in
the admin?
`dim: robustness` · `evidence: break email delivery (unset the mail key or block the mail host), complete a test payment, then check the order list`
`answer: unknown`

---

## F. The order holds only what it needs, and reaches the customer

### F1. No order, log, or email carries more customer or card data than the order needs
**Q.** When I read a completed order in the admin, its confirmation email, and the
checkout event log, does none of them contain a full card number, a security code,
or more of the customer's personal data than the delivery and contact details the
order actually needs? (Card brand and last four digits are expected; a full number
is not.)
`dim: security, trust` · `evidence: complete a test order and read the order document in Studio, the received email, and the event log for that checkout`
`answer: unknown`

### F2. The order carries the email the customer actually used, and a missing one is visible
**Q.** Does the finished order record the email address the customer entered for
their payment receipt — and when no email is captured at all, is that gap visible to
the owner rather than a silent blank on the order?
`dim: trust, robustness` · `evidence: complete a guest checkout, then check the order's customer email in the admin and whether a confirmation email arrived; then complete one where no email is provided and see what the order shows`
`answer: unknown`

### F3. The confirmation email's contents match the order
**Q.** Does the confirmation email show the same order number, the same line items
and quantities, the same total, and the same delivery address as the order recorded
in the admin?
`dim: trust` · `evidence: complete a test order and compare the email line by line with the order in Studio`
`answer: unknown`

---

## G. A guest's order reaches their account

### G1. A guest who later signs up with the same email sees the order in their account
**Q.** When I check out as a guest and afterwards create and verify an account with
the same email address, does that order appear in my account's order history?
`dim: trust` · `evidence: complete a guest checkout with email X, then register and verify an account with email X, then open the account order history` · `coordinates with vdq.7`
`answer: unknown`

### G2. A guest whose order can't be auto-linked is told how to claim it, not left guessing
**Q.** When a guest's later signup uses a different email (or the guest order was
saved with no email), the order does not link automatically — is the customer told
what to do (e.g. "use the same email at checkout and signup", or a support route) —
rather than the order simply never appearing and no explanation given?
`dim: trust` · `evidence: check out as a guest with email X, sign up with email Y, and look for any guidance about missing guest orders in the account area or order-confirmation copy` · `coordinates with vdq.7`
`answer: unknown`

---

## Visual polish

n/a for this slice — it produces no customer-visible screen of its own. The one
customer-facing surface is the redirect and its status, whose rendering belongs to
`vdq.6`. E1–E2 above only check that every settlement outcome *hands off* to a
correct screen; the screen's own layout and polish are `vdq.6`'s.

---

## Handed to adjacent slices (not answered here)

- **How the charge amount is built and enforced** (client total re-derived from
  live prices, shipping price trusted) → `vdq.4`. D1–D2 here only check the
  *recorded order* matches the *captured amount*; whether the captured amount was
  correct in the first place is `vdq.4`.
- **The rendering of every confirmation branch, the access gate on
  `/checkout/success`, the analytics event** → `vdq.6`. E1–E2 stop at "the right
  screen is reached".
- **Re-entering checkout after a completed payment with a stale basket or cookie**,
  and **whole-journey language consistency** (order email in English vs a Polish
  shipping step) → `vdq.7`.
- **The guest-vs-authenticated journey and what triggers the guest-order merge**
  → `vdq.7`. G1–G2 check the observable outcome (order shows up / customer is
  informed); the trigger mechanism and its timing are `vdq.7`.

## Leanness note

26 candidates were drafted; 6 were cut (20 remain):

- "Is the provider webhook signature verified?" — R3, names a mechanism. The
  customer-visible outcome (a forged notification creating a paid order) is A1.
- "Is order creation idempotent on the payment id?" — R3. Its outcomes are B1
  (concurrent paths) and B2 (refresh) as things the owner counts in the order list.
- "Does the return handler catch store-write errors so it doesn't block the
  redirect?" — R3. The outcome is E1 (customer still lands on a paid screen) and
  B4 (order still appears on recovery).
- "Is `saveEmailToSession` wired up?" — R3, code trivia. The outcome — orders with
  a blank email that can't be merged or emailed — is F2 and G2.
- "Are there automated tests for the settlement path?" — leanness idle-test; a
  process metric. The questions are the test.
- "Does the order store use a unique constraint on the payment id?" — R3; same
  outcome as B1/B2, and it presumes a specific fix.

Every remaining question names a specific victim on a "no": the store owner
fulfilling a forged or unpaid payment, shipping a duplicate order or double-charging
a customer, losing an order whose card was charged, silently overselling the last
unit, recording a total that doesn't match the money taken, leaking card or
personal data into a log or email; or the customer charged and dumped back at the
basket with nothing, unable to give support a usable reference, or a guest whose
paid order silently never reaches their account.
