# S3 — Payment page + intent slice · Gating questions

Deliverable of `sang-logium-vdq.4`. Cluster for the **Payment page + intent** slice.
Rubric, question format and leanness test: `00-rubric-and-slice-map.md`.

**Slice boundary.** From `/checkout/payment` load with a basket, address and a
stored delivery cost → until clicking Pay hands me to the bank / wallet and on to
the return URL. Not address entry or validation (S1 → `vdq.2`), not the delivery
option list or its price (S2 → `vdq.3`), not order write, stock or the receipt
email (S4 → `vdq.5`), not the confirmation screen's rendering or access gate
(S5 → `vdq.6`), not the shared shell / stepper / whole-journey language web
(S6 → `vdq.7`).

**Grounding for the question-writer** — scaffolding only, *not* part of the
deliverable; no term here may appear in a question. Written against
`app/checkout/payment/{page,PaymentForm.client}.tsx`,
`app/checkout/payment/_components/CheckoutSummary.tsx`,
`app/api/checkout/payment-intent-session/route.ts`,
`app/api/checkout/return/route.ts`, `lib/utils/price.ts`, `lib/session.ts`:

- **Guards on load (server), in order:** empty basket → `/basket`; any line with a
  non-integer or `< 1` quantity → `/basket?error=invalid_basket`; no address →
  `/checkout/address`; no stored delivery cost → `/checkout/shipping`; any line
  quantity `> 10` → `/basket?error=excessive_quantity&id=…`. Then a catalogue
  fetch: if the number of products found ≠ basket lines, the page **throws**
  "Product mismatch — basket contains unknown product IDs" (→ `error.tsx`); a
  product whose price is not a finite number **throws**; a product with `stock`
  exactly `0` → `/basket?error=out_of_stock&id=…`. Finally a computed total below
  `1` (minor unit) → `/basket?error=invalid_total`.
- **Money.** `subtotal` = Σ (live catalogue unit amount × quantity), read from the
  catalogue at page load. `grandTotal` = `round(subtotal + storedDeliveryCost)`.
  The delivery cost is the value the browser supplied back in S2, trusted as-is
  here. VAT shown = `grandTotal − round(grandTotal / 1.23)` (23% inclusive),
  labelled "VAT (included)".
- **The browser then calls** `POST /api/checkout/payment-intent-session` with
  `{ grandTotal, metadata }`. `grandTotal` is validated only as a positive integer
  and then **discarded** — the route recomputes the amount from `session.basket`
  against live catalogue prices and creates/updates the Stripe PaymentIntent for
  that recomputed figure. The request body cannot carry a basket; only the session
  cookie does. A product-count or price problem → `400` JSON error (shown as-is);
  any thrown error → `500 { error: 'Failed to create payment intent' }`.
- **Currency mismatch.** The PaymentIntent currency is hardcoded `pln`. Every price
  on the page — item lines, subtotal, delivery, VAT, total, the `Pay ·` button —
  is formatted through the store helper, currently **USD / en-US** ("$1,299.00").
  The Stripe Payment Element and the Apple / Google Pay sheets render their amounts
  in the PaymentIntent's currency (**PLN**). Same number, different money.
- **Init retry.** The call to the intent route retries 3 times with 500 / 1000 /
  2000 ms backoff, but **only on a thrown / network error** — a returned `{ error }`
  is surfaced immediately. On final failure: a "Payment Error" card with
  "Try Again" (reload) and "Go Back" (→ `/checkout/shipping`).
- **Payment UI.** An Express Checkout element (Apple / Google Pay) whose confirm
  path has **no error handling and no loading state**; below it a Payment Element
  ordered BLIK, Przelewy24, card, with customer billing-address entry disabled. A
  form Pay button (desktop) and a fixed bottom `Pay ·` bar (mobile), both disabled
  while Stripe loads or while submitting ("Processing…"). Card and validation
  errors are rendered by the Stripe element itself; our code shows a custom banner
  only for a payment-system ("api") error. Trust copy on the step: a padlock line
  "Secure payment encrypted by Stripe", and "Visa · Mastercard · BLIK".
- **Billing address** is never entered by the customer — payment confirmation is
  sent a billing address built from the shipping address, country hardcoded `PL`.
  Nothing on the page states that billing is taken from shipping.
- **Instalment messaging.** A Klarna messaging element renders only when the total
  is `≥ 5000` (minor units), currency PLN.
- **On submit:** a validation pass, then payment confirmation with
  `return_url = <origin>/api/checkout/return`. Stripe redirects the browser to the
  bank / wallet and back to that URL. What the return URL then does (verify the
  intent, create the order, clear the session, route to `/checkout/success`) is
  S4 / S5.
- **Resuming another payment.** The return handler refuses a payment intent the
  session does not own — no active intent, or an id different from the session's,
  → back to `/basket` with an error. That is the only point a "finish someone
  else's payment" attempt is stopped.
- Stepper: `CheckoutStepper currentStep={3}` → "Payment" active.

`answer:` stays `unknown` — filling it in is the downstream stress-test epic.

---

## A. The amount charged is the real price of my basket — and I can't move it

### A1. Editing the total, a product id, or a quantity in what my browser sends doesn't change the charge
**Q.** When I intercept the requests the payment step sends and lower the total,
swap a product id, or raise a quantity, is the amount actually charged still the
correct live catalogue price for exactly what was really in my basket?
`dim: security` · `evidence: DevTools → intercept the payment-init request (and, separately, tamper the checkout cookie), set the total to 1, swap an id, bump a quantity; complete payment with a test card; read the charged amount in the Stripe dashboard`
`answer: unknown`

### A2. A price that changed after I started checkout doesn't underpay the store or ambush me
**Q.** When a product's catalogue price changed after I reached checkout, am I
charged the **current** price — not a stale lower one — or clearly told the price
changed before I pay?
`dim: security, trust` · `evidence: reach /checkout/payment, then change that product's price in Sanity Studio (up, then down), reload the payment step, compare the total and look for any "price changed" notice; confirm the charged amount in the Stripe dashboard`
`answer: unknown`

### A3. The number on the Pay button, the summary total, the wallet/card sheet, and the charge are the same money
**Q.** Do the summary total, the amount on the "Pay" button, the amount shown
inside the card / Apple Pay / Google Pay sheet, and the amount finally charged all
show the **same figure in the same currency** — no "$" on the page while the wallet
and the receipt say another currency?
`dim: security, trust, visual` · `evidence: read the summary total and Pay button, open the Apple/Google Pay sheet and the card element, then read the PaymentIntent amount and currency in the Stripe dashboard` · `coordinates with vdq.3, vdq.5`
`answer: unknown`

---

## B. Setup and catalogue hiccups never dead-end me

### B1. When payment setup fails after its automatic retries, I get a clear error and a working retry
**Q.** When the payment step cannot be prepared even after it quietly retries in
the background, do I see a clear error and a button that actually re-attempts —
rather than an endless "Preparing secure payment…", a blank panel, or a stack
trace?
`dim: robustness, trust` · `evidence: in DevTools block the payment-init request, load /checkout/payment, wait through the retries, then unblock and use the retry offered`
`answer: unknown`

### B2. When the catalogue is briefly unavailable as I reach payment, I get a recoverable state, not a crash page
**Q.** When the product catalogue is momentarily unreachable as the payment step
loads, do I land on a clear "try again in a moment" state with my basket intact —
not a generic error page or a dead end?
`dim: robustness` · `evidence: in DevTools block the catalogue host, navigate to /checkout/payment, observe; then unblock and retry`
`answer: unknown`

### B3. A product deleted or unpriced mid-checkout gives a clear message, not a crash or a wrong charge
**Q.** When an item in my basket is deleted from the catalogue, or loses its
price, between the delivery step and the payment step, do I get a clear message
telling me what to fix — rather than an error page, or a charge that silently drops
or misprices that item?
`dim: robustness, security` · `evidence: reach /checkout/shipping, then in Sanity Studio unpublish one basket product (and separately clear its price), continue to /checkout/payment, observe the screen and, if it proceeds, the charged amount`
`answer: unknown`

---

## C. My payment can't be hijacked, and my card is never over-exposed

### C1. Someone else can't complete, or be charged for, the payment I started
**Q.** When I take my payment-step link, or the return link with my payment
reference, into a different browser or someone else's session, is it refused —
never a state where that payment can be completed, charged, or shown to that other
person as their order?
`dim: security` · `evidence: copy /checkout/payment and the …/api/checkout/return?payment_intent=… URL into a fresh private window with no checkout cookie; separately put another person's payment reference on your own success URL; observe` · `coordinates with vdq.5, vdq.6`
`answer: unknown`

### C2. No full card number is ever shown back to me, stored where I can read it, or left on the page
**Q.** After I pay by card, is the card shown only as brand + last four everywhere
it appears — the payment step, the order summary, the confirmation screen, the
stored order, the receipt email — with the full number nowhere visible or saved?
`dim: security, trust` · `evidence: pay with a Stripe test card, then inspect the payment page DOM, the confirmation screen, the order document in Sanity Studio, and the receipt email` · `coordinates with vdq.5, vdq.6`
`answer: unknown`

---

## D. Tax, delivery cost and quantity limits are consistent and disclosed

### D1. The tax shown at payment equals the tax on the confirmation and the order
**Q.** Does the tax figure on the payment summary match — same number, same
currency — the tax shown on the confirmation screen, in the stored order, and on
the receipt email?
`dim: trust, security` · `evidence: note the VAT line on /checkout/payment, complete the order, then read the tax on the confirmation screen, the order in Sanity Studio, and the email` · `coordinates with vdq.5, vdq.6`
`answer: unknown`

### D2. A zero delivery cost is handled cleanly
**Q.** When the stored delivery cost is zero, does the payment step show delivery
as free and charge the correct total — rather than rejecting it, blanking the
line, or mis-adding it?
`dim: robustness` · `evidence: with a zero delivery cost in the session (or a free option if one is ever offered upstream), load /checkout/payment and read the delivery line and total` · `coordinates with vdq.3`
`answer: unknown`

### D3. If the store caps how many of one item I can buy, I hit that limit in the basket with a stated reason
**Q.** If there is a maximum quantity per item, do I reach it in the basket with a
clear stated reason — rather than passing address and delivery and then being
bounced back from the payment step, or seeing an unexplained "excessive quantity"
message?
`dim: robustness, trust` · `evidence: put 11 of one item in the basket, walk to the payment step, observe where I am stopped and what I am told` · `coordinates with vdq.2`
`answer: unknown`

---

## E. Transitions in and out

### E1. Arriving without the prerequisites sends me to the right earlier step, not a broken payment page
**Q.** When I open `/checkout/payment` directly with an empty basket, no address,
or no delivery option chosen, am I taken cleanly to the basket or the matching
earlier step — with no flash of a broken payment page and no error screen?
`dim: robustness` · `evidence: clear the checkout cookie (then, separately, just the address, then just the delivery cost) and navigate straight to /checkout/payment`
`answer: unknown`

### E2. The summary shows exactly the items, delivery option and address I chose
**Q.** Does the order summary on the payment step show the same items, quantities,
delivery method, delivery price and shipping address I selected on the previous
steps — no missing line, no changed number, no blank, no wrong name?
`dim: trust, robustness` · `evidence: note the basket, the delivery option and the address entered, then read every line of the summary on /checkout/payment` · `coordinates with vdq.2, vdq.3`
`answer: unknown`

### E3. Clicking Pay hands me off once — no double charge, no stuck button
**Q.** When I double-click Pay, or click it on a slow connection, am I handed to
the bank / wallet exactly once, with the button showing progress and never a
second attempt or a permanently stuck "Processing…"?
`dim: robustness, security` · `evidence: throttle the network, double-click the Pay button (desktop and the mobile bar), watch the button state and the number of confirmations in the Stripe dashboard`
`answer: unknown`

### E4. A declined card or an abandoned wallet payment leaves me on the step, details intact, able to retry
**Q.** When my card is declined, or I cancel out of the Apple / Google Pay sheet,
do I stay on the payment step with a clear reason and my basket, address and other
entries intact — able to try another card or method immediately — rather than a
dead end, a lost basket, or a silent no-op?
`dim: robustness, trust` · `evidence: pay with a Stripe "declined" test card; separately open the wallet sheet and dismiss it; observe the page, the error text, and whether Pay works again`
`answer: unknown`

---

## F. Visual polish

### F1. The summary and payment fields lay out cleanly at 375 / 768 / 1440
**Q.** At each of 375, 768 and 1440 px, do the order summary and the payment fields
render with no overlap, no clipped text, no horizontal page scroll, prices aligned
and never truncated, and the two columns reflowing to one on mobile?
`dim: visual` · `evidence: load /checkout/payment at the three widths with a multi-line basket`
`answer: unknown`

### F2. The payment fields' dark styling matches the rest of the site
**Q.** Do the card / BLIK / Przelewy24 fields and the wallet buttons use the same
dark background, text colour, border and focus treatment as the rest of the
checkout — not a light-theme Stripe block dropped into a dark page?
`dim: visual, trust` · `evidence: compare the Stripe fields side by side with the summary card and the address step at each width`
`answer: unknown`

### F3. The mobile "Pay" bar is always reachable and doesn't hide content
**Q.** On a 375 px viewport, is the sticky "Pay" bar always visible and tappable,
without covering the last payment field, the security line, or the card-brand row
when scrolled to the bottom?
`dim: visual` · `evidence: on mobile width, scroll the payment column to the end and check the bottom content against the sticky bar`
`answer: unknown`

### F4. Error, loading and instalment-message states look finished
**Q.** Do the "preparing payment" skeleton, the "Payment Error" card, the inline
error banner, the "Processing…" button and the instalment / pay-later message each
render as designed elements — aligned, on-palette, no layout jump, no raw text —
at 375 / 768 / 1440?
`dim: visual` · `evidence: force each state (block the init call, decline a card, and drive the total above the instalment threshold) at the three widths`
`answer: unknown`

### F5. The step indicator shows the right step
**Q.** On the payment step, does the progress indicator mark Payment as current
and Basket, Address and Shipping as done?
`dim: visual` · `evidence: read the stepper on /checkout/payment`
`answer: unknown`

---

## G. UX clarity & trust

### G1. It's clear the billing address comes from the delivery address — and a gift or company buyer can still get a correct invoice
**Q.** Is it stated on the payment step that the billing address is taken from the
delivery address with no way to change it — and if I am buying a gift or buying for
a company, can I still get an invoice with the right billing details, or am I
silently forced to bill to the delivery address?
`dim: trust` · `evidence: read the payment step for any billing-address note or field; complete an order shipped to an address that isn't mine and check the billing details on the confirmation, the order and the receipt` · `coordinates with vdq.5, vdq.6`
`answer: unknown`

### G2. Every security claim on the step is literally true
**Q.** Are the padlock line, the "encrypted by Stripe" wording and the card-brand
logos all literally accurate for what actually happens on this step — no
overclaim, no badge for a guarantee the store doesn't provide?
`dim: trust` · `evidence: read every trust/security element on /checkout/payment and check each against the real payment behaviour`
`answer: unknown`

### G3. Instalment / pay-later messaging is accurate and only shows when it genuinely applies
**Q.** When the pay-later message appears, does it state a real, correct offer for
the actual order amount and currency — and does it stay hidden when no such option
genuinely applies — rather than a misleading teaser?
`dim: trust` · `evidence: view the payment step with a total just below and just above the instalment threshold; read the message and check its amount, currency and terms against what is actually offered at the Stripe step`
`answer: unknown`

---

## Handed to adjacent slices (not answered here)

- **The recomputed amount actually becomes the charge, and stock is enforced** at
  settlement → `vdq.5`. A1–A2 here check that the payment step does not
  *pre-authorise* a wrong number; the charge and stock outcome is read on the
  Stripe dashboard / in Sanity Studio, shared evidence with S4.
- **The confirmation screen's rendering, its status branches and its access gate**
  → `vdq.6`. C1 originates the "resume another payment" attempt here; whether the
  success page leaks an order is S5's question.
- **The receipt email's contents, currency and card display** → `vdq.5`. C2 and D1
  name the email as a surface to walk but do not test its formatting.
- **Whole-journey currency and language consistency** (basket "$", delivery step
  Polish, PLN charge, receipt email) → `vdq.7`. A3 only compares the figures on and
  around this one step.
- **Re-entering checkout with a changed basket while a stale delivery cost is still
  stored** → `vdq.7` (cross-cutting re-entry). E1–E2 only cover a clean arrival
  from the delivery step.

## Leanness note

27 candidates were drafted; 4 were cut by the leanness test (23 remain):

- "Is the PaymentIntent created server-side / is the Stripe secret key kept off the
  browser?" — R3, not observable; the customer-visible concern (a forged cheap
  charge) is already A1 as an outcome.
- "Is the client secret single-use and scoped to this checkout?" — R3, a mechanism
  the customer never sees; the observable concern is C1.
- "Does the payment route send an idempotency key when creating the intent?" — R3 /
  idle test; the customer-visible concern (a double click causing a double charge)
  is E3.
- "Is 3-D Secure / SCA enforced on card payments?" — R6, presumes a rule the store
  owner has not stated, and the challenge is ultimately the bank's call. The
  observable neighbour — a challenged or declined card is handled predictably — is
  E4.

Every remaining question names a specific victim on a "no": the customer
overcharged or the store underpaid via a tampered or stale price, ambushed by a
currency that changes between the page and the charge, stranded on a "preparing
payment" spinner or a crash page when the catalogue blips, crashed by a product
deleted mid-checkout, able to have their payment resumed by someone else, shown
their full card number, charged a tax that doesn't match the order, bounced back
from payment by an undisclosed quantity cap, double-charged by a double click,
dead-ended by a declined card, squinting at a light-theme Stripe block on a dark
page, unable to invoice a company purchase correctly, or misled by an inaccurate
security badge or pay-later teaser.
