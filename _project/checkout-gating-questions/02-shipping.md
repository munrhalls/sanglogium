# S2 — Shipping slice · Gating questions

Deliverable of `sang-logium-vdq.3`. Cluster for the **Shipping** slice.
Rubric, question format and leanness test: `00-rubric-and-slice-map.md`.

**Slice boundary.** From `/checkout/shipping` load with an address already in the
session → until a delivery option and its price are stored and I am redirected to
the payment step. Not address entry or validation (S1 → `vdq.2`), not the payment
page's own total / intent (S3 → `vdq.4`), not order write or stock (S4 → `vdq.5`),
not the shared shell / stepper / whole-journey language web (S6 → `vdq.7`).

**Grounding for the question-writer** — scaffolding only, *not* part of the
deliverable; no term here may appear in a question. Written against
`app/checkout/shipping/{page,ShippingPageClient,loading}.tsx`,
`app/actions/checkout/index.ts` (`saveShippingAction`),
`lib/shipping/{allekurier-rates,parcel-calculator}.ts`,
`app/api/checkout/payment-intent-session/route.ts`, `lib/session.ts`:

- **Guards on load:** no address → `/checkout/address`; no basket / empty basket →
  `/basket`. Nothing else is checked.
- **Parcel sizing** is derived per basket line from each product's `parcel` data in
  the catalogue; a line with no `parcel` data falls back to a hardcoded
  `DEFAULT_PARCEL` (0.5 kg, 20×15×25 cm). Sizing returns nothing only if total
  weight *and* volume are both zero (effectively: empty basket). Over 25 kg or
  99 000 cm³ it splits into multiple parcels (the split loop re-multiplies by
  quantity and then drops zero-weight parcels — its output is not obviously
  correct). If sizing *throws*, the page renders the option list component with an
  `error` string (raw `Error.message`, not localized) and a retry button.
- **Carrier = AlleKurier** (PL courier aggregator). Sender country hardcoded `PL`,
  sender postcode `SENDER_ADDRESS_DEFAULT_ZIP` or `00-001`. Recipient country =
  `session.address.regionCode`, recipient postcode = `session.address.postalCode`.
  15 s timeout.
- **`fetchAlleKurierRates` never throws and never surfaces a reason.** It returns an
  empty list for *every* failure: missing credentials, empty/invalid parcels,
  timeout, non-200, API error array, non-JSON body, unexpected shape, network
  error. All of these look identical to "this route genuinely has no couriers".
- **The option list UI:** radio list, Polish copy ("Wybierz metodę dostawy",
  "Przejdź do płatności", "Przetwarzanie…"). An `error` string renders a red banner
  with a **"Spróbuj ponownie"** reload button. An empty list with **no** `error`
  renders only the grey text "Brak dostępnych opcji dostawy." — **no retry, no
  explanation**. So a carrier outage lands on the silent empty state, not the
  banner-with-retry.
- Each row shows `provider` (carrier name), `servicelevel.name`, a price via
  `formatPriceMajor`, and `formatDeliveryEstimate(estimatedDays)`.
  `formatPriceMajor` formats **USD / en-US** ("$25.50"); the amount it is given is
  AlleKurier's gross, quoted in **PLN**. `formatDeliveryEstimate` returns
  "1 dzień roboczy" / "N dni robocze" (the ≥5 form should be "dni roboczych").
  An unparseable carrier day string becomes `1` → "1 dzień roboczy" (fabricated,
  never "unavailable"). A gross of 0 becomes amount `0`.
- **Selecting an option** calls `saveShippingAction(rateId, round(amount*100),
  serviceName, carrier, estimatedDays)`. The server checks **only** that the price
  is a positive integer — no check that `rateId` was among the offered rates, no
  check that the price matches any quote it issued, no re-fetch. It writes
  `shippingCode / shippingCost / shippingMethodName / shippingCarrier /
  shippingEstimatedDays` to the session and redirects to `/checkout/payment`.
  A price of `0` fails the positive-integer check and throws "Invalid shipping
  price" (so a genuinely free option cannot be chosen).
- **Downstream money:** `/checkout/payment` and `/api/checkout/payment-intent-session`
  compute `grandTotal = subtotal + session.shippingCost` and create the Stripe
  charge for that amount. The stored shipping price is trusted end to end. Unlike
  the item subtotal, it is **never** re-derived from the carrier.
- Stepper: `CheckoutStepper currentStep={2}` → "Shipping" active.

`answer:` stays `unknown` — filling it in is the downstream stress-test epic.

---

## A. The delivery price I pick is the price I pay — and can't be forged

### A1. Tampering a shown option's price doesn't change what I'm charged
**Q.** When I intercept the request that saves my chosen delivery option and lower
its price (e.g. to 0.01), is the amount I am actually charged still the real
carrier price for that option?
`dim: security` · `evidence: DevTools → intercept the "Przejdź do płatności" request, set the price to 1 (cent), continue, read the payment-page total, then read the PaymentIntent amount in the Stripe dashboard` · `coordinates with vdq.4`
`answer: unknown`

### A2. I can't pay against an option that was never quoted to me
**Q.** When I submit a delivery option and price that AlleKurier never offered me on
this visit — a made-up option id, or a cheaper quote copied from an earlier visit
for a different basket or address — is it rejected before it can become my total?
`dim: security` · `evidence: intercept the save request, replace the option id and price with values from an earlier session (or invented), continue, and check whether the payment step accepts it or shows an error`
`answer: unknown`

### A3. The price on the option equals the amount added to my total, to the cent, in one currency
**Q.** Does the price shown on a delivery option match — same number, same currency
symbol, no rounding — the delivery line and the grand total on the payment step and
on the final receipt?
`dim: security, trust, robustness` · `evidence: note the price on the option I pick, then read the delivery line and grand total on the payment page and the confirmation` · `coordinates with vdq.4, vdq.5`
`answer: unknown`

---

## B. Carrier failures never dead-end me

### B1. Carrier down or unreachable shows a clear message and a working retry
**Q.** When the carrier service is unreachable, when I return to this step, do I get
a clear message and a retry that actually re-requests options — not the bare "no
options available" text with no way forward, no infinite spinner, and no stack
trace?
`dim: robustness, trust` · `evidence: in DevTools block requests to allekurier.pl, load /checkout/shipping, then unblock and use whatever retry is offered`
`answer: unknown`

### B2. A slow carrier shows progress, not a frozen page
**Q.** When the carrier is slow to respond (up to the ~15 s cutoff), do I see a
loading state and then either options or a message — rather than a page that looks
frozen or blank while it waits?
`dim: robustness` · `evidence: in DevTools throttle responses from allekurier.pl to ~10 s, load /checkout/shipping, watch the page`
`answer: unknown`

### B3. A partial or malformed carrier response never renders a broken row
**Q.** When the carrier returns an incomplete or malformed list, is every option I
see complete and usable — a real name, a real price, a real delivery time — with no
row showing "undefined", a blank, or "$0"?
`dim: robustness` · `evidence: in DevTools, rewrite the allekurier.pl response to drop the price / name / days from one entry, reload, inspect the rendered rows`
`answer: unknown`

### B4. "No options for this address" is distinguishable from "something went wrong"
**Q.** When there really are no couriers for my postcode, versus when the lookup
failed, do I see two different messages — so I know whether to fix my address, wait
and retry, or contact the store?
`dim: robustness, trust` · `evidence: compare the screen for a valid remote postcode with genuinely no service against the screen when the carrier call is blocked`
`answer: unknown`

---

## C. Parcel sizing failures degrade gracefully

### C1. A basket whose parcel size can't be worked out gives a clear state, not a crash
**Q.** When the delivery size for my basket cannot be computed, do I get a clear
message and a way forward — rather than a crash, an error page, or a silent empty
list with no reason given?
`dim: robustness` · `evidence: put in the basket a product with missing/zero dimensions (or all such products), reach /checkout/shipping, observe`
`answer: unknown`

### C2. A very large or very heavy basket produces sane options or a clear message
**Q.** When my basket is large or heavy enough to need splitting across parcels, do
I still get delivery options whose prices look sane, or an explicit "contact us for
a quote" message — never an empty list with no explanation or nonsensical prices?
`dim: robustness` · `evidence: add ~60 kg of items to the basket, reach /checkout/shipping, check the options and their prices against a manual carrier quote`
`answer: unknown`

---

## D. Address and options stay consistent

### D1. Options are always priced for the address currently on file
**Q.** When I change my delivery address after seeing options, are the options and
prices shown afterwards for the new address — not the ones quoted for the old one?
`dim: security, robustness` · `evidence: view options for a Warsaw address, go back and change the address to a remote postcode, return to shipping, compare the option prices` · `coordinates with vdq.2`
`answer: unknown`

### D2. An escape-hatched or unusual address still gets options or a clear message
**Q.** When I reached this step with an address the checker did not fully recognise
(via the "continue with entered address" fallback upstream), do I still get either
usable options or a clear message — not a blank dead-end?
`dim: robustness` · `evidence: upstream, use the address escape hatch with a real-but-unusual address, continue to shipping, observe` · `coordinates with vdq.2`
`answer: unknown`

---

## E. Transitions in and out

### E1. Arriving without the prerequisites sends me to the right step, not a broken page
**Q.** When I open `/checkout/shipping` directly with no address or an empty basket,
am I taken to the address step or the basket — cleanly, with no flash of a broken
shipping page?
`dim: robustness` · `evidence: clear the checkout cookie (or the address only) and navigate straight to /checkout/shipping`
`answer: unknown`

### E2. The option I picked is exactly what the payment step shows
**Q.** After I choose an option and continue, does the payment step show that same
carrier, service level, price and delivery estimate — not a different label, a
blank, or a changed number?
`dim: trust, robustness` · `evidence: note the carrier / service / price / days I selected, then read the delivery section on the payment page` · `coordinates with vdq.4`
`answer: unknown`

### E3. Double-click or a slow connection lands me on payment once, with one selection saved
**Q.** When I double-click "continue" or click it on a slow connection, do I end up
on the payment step once, with a single delivery selection stored — no stuck
"Przetwarzanie…" button, no double navigation?
`dim: robustness` · `evidence: throttle the network, double-click the continue button, watch navigation and the button state, then check the payment step's delivery line`
`answer: unknown`

---

## F. Visual polish

### F1. The option list and its selected state are clean at 375 / 768 / 1440
**Q.** At each of 375, 768 and 1440 px, does the option list render with no overlap,
no clipped text, no horizontal page scroll, prices aligned and never truncated, and
a clear visual difference between the selected and unselected rows?
`dim: visual` · `evidence: load /checkout/shipping with options at the three widths, select a row at each`
`answer: unknown`

### F2. The empty state and the error banner are unbroken at every width
**Q.** Do the "no options" empty state and the red error banner (with its retry
button) each render cleanly at 375 / 768 / 1440 — no overflow, no layout jump, the
button fully tappable?
`dim: visual` · `evidence: force the empty state (block the carrier) and the error state (break parcel sizing) at each width`
`answer: unknown`

### F3. The mobile continue button is always reachable and never hides an option
**Q.** On a 375 px viewport, is the sticky "Przejdź do płatności" button always
visible and tappable, without covering the last option in the list when scrolled to
the bottom?
`dim: visual` · `evidence: on mobile width, scroll the option list to the end and check the last row against the sticky button`
`answer: unknown`

### F4. The step indicator shows the right step
**Q.** On the shipping step, does the progress indicator mark Shipping as current
and Basket and Address as done?
`dim: visual` · `evidence: read the stepper on /checkout/shipping`
`answer: unknown`

---

## G. UX clarity & trust

### G1. The switch to Polish here reads as deliberate, not a half-translation
**Q.** Coming from an English address step to a Polish shipping step, does the store
read as a deliberate bilingual store — or as an unfinished translation where one
screen was localized and the next was not?
`dim: trust` · `evidence: walk address → shipping → payment and note the language of the headings, buttons and helper text on each` · `coordinates with vdq.7`
`answer: unknown`

### G2. Delivery estimates read as honest, and a missing one degrades gracefully
**Q.** Is each delivery time clearly attributed to the carrier and shown as a real
range/number — and when the carrier gives no usable estimate, do I see "estimate
unavailable" (or similar) rather than a fabricated "1 day" or the word "undefined"?
`dim: trust` · `evidence: read the estimate on each option; then, in DevTools, blank the days field in the carrier response and reload`
`answer: unknown`

### G3. The estimate's Polish wording is grammatically correct
**Q.** For options with a 5-or-more-day estimate, is the wording grammatically
correct Polish — not a form a native speaker would read as machine-generated?
`dim: trust, visual` · `evidence: find or force an option with an estimate of 5+ days and read the label`
`answer: unknown`

### G4. I can tell the carrier apart from the service level
**Q.** On each option, can I tell which text is the courier company and which is the
service level (e.g. "next day", "economy") — rather than two labels with no stated
relationship?
`dim: trust` · `evidence: read a multi-option list and check whether carrier vs service is distinguishable at a glance`
`answer: unknown`

---

## Handed to adjacent slices (not answered here)

- **The charge amount is ultimately built and enforced at the payment/intent step**
  → `vdq.4`. A1–A3 here establish that this slice hands a *client-trusted* shipping
  price forward; whether the intent blindly trusts it is `vdq.4`'s question, but
  the evidence (Stripe dashboard amount) is shared.
- **The final order shows the delivery method, carrier and price** → `vdq.5`.
  E2 stops at the payment step.
- **Whole-journey language consistency** (basket English, shipping Polish, receipt
  email) → `vdq.7`. G1 only compares the two adjacent screens.
- **Re-entering checkout with a changed basket while a delivery price is still
  stored** → `vdq.7` (cross-cutting re-entry). D1 only covers an in-flow address
  change.
- **Address validity and the escape hatch itself** → `vdq.2`. D2 assumes the
  upstream fallback exists and only checks this step survives its output.

## Leanness note

23 candidates were drafted; 4 were cut (19 remain):

- "Is the AlleKurier request made server-side / are the carrier credentials hidden
  from the browser?" — R3, not observable; a customer never sees the request. The
  real concern (a forged cheap option) is already A1/A2 as an outcome.
- "Does the page cache carrier rates between visits?" — R3 / idle test; the
  customer-visible concern (stale prices for a changed address) is D1.
- "Is there a loading skeleton file for this route?" — idle test, answerable
  without running checkout; the behavior is covered by B2.
- "Is free shipping over a threshold offered?" — R6, presumes a promotion the store
  owner never stated. (If free options ever appear, that a `0` price is rejected
  becomes a real bug — noted for the stress-test epic, not a gating question.)

Every remaining question names a specific victim on a "no": the customer
overcharged or undercharged via a forged delivery price, stranded on a silent
"no options" screen when the carrier blips, shown a broken or "$0" option row,
crashed by an un-sizeable basket, quoted for the wrong address, or served a
fabricated delivery date and a half-translated page; or the store owner shipping
against a delivery fee that was never really quoted.
