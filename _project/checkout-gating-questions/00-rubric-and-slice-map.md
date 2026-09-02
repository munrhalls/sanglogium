# Checkout Gating Questions — Rubric & Slice Map

Deliverable of `sang-logium-vdq.1`. Locks the instrument before it is built.
Everything here is derived from **source** (`app/checkout/**`,
`app/actions/checkout/**`, `app/actions/address/**`, `app/api/checkout/**`,
`app/api/webhooks/stripe/**`, `lib/checkout/**`, `lib/session.ts`,
`lib/shipping/**`), **not** from `_project/` or `docs/` notes — those are stale
(they still describe Shippo and an atomic Sanity reservation document; neither
exists).

---

## 0. What a gating question is

A **gating question** is a binary check on the *running* checkout that, together
with the rest of its cluster, makes one guarantee: **if every question in the
cluster honestly answers "yes", no customer and no store owner has a legitimate
complaint about that slice.**

It is not a task, not a test file, not a doc assertion. It is a litmus test you
point at the slice to expose what is weak, insecure, or amateurish — on the
happy path, the edge paths, and the transitions.

---

## 1. The rubric — every question must pass all six

| # | Test | Fails if… |
|---|------|-----------|
| R1 | **Binary** | The honest answer is a scale, a "mostly", or "depends". |
| R2 | **Evidence-named** | The question does not state *how you would settle it* — a concrete action on `localhost:3000`, a reproduced attack that fails, a side-by-side visual comparison, or a state/DB/dashboard inspection. |
| R3 | **Behavioral, not implementational** | It asks whether a specific file/function/token exists or is written a certain way, rather than what the user or owner can observe. |
| R4 | **Non-leaky** | You can picture answering "yes" honestly while a specific customer or the store owner is still, concretely, worse off in that slice. |
| R5 | **Lean** | Deleting it does not weaken the "irrefutably professional" conclusion (see §2). |
| R6 | **Policy-neutral** | It assumes a business rule — a price, a quantity limit, a restriction, a required field — that the store owner has not actually stated. Where the real concern is an *undefined* policy, the question must ask whether that policy is intentional, consistent, and disclosed to the customer — never whether one particular value is enforced. |

Each question also carries **≥1 dimension tag**: `security` · `robustness` ·
`visual` · `trust`.

---

## 2. The leanness test (R5, expanded)

For each candidate, in order. Any "cut" verdict wins.

1. **Victim test** — if the answer flips to "no", can you name a specific person
   (this customer, the owner) and exactly how they are worse off? No → **cut**.
2. **Subsumption test** — does another question in the cluster already force
   this one's answer? Yes → **cut the weaker / merge**.
3. **Behavior test** — does it test observable behavior (R3)? No → **rewrite as
   behavior, or cut**.
4. **Idle test** — could it be answered "yes" forever without anyone ever
   running the checkout? Yes → it is doc trivia → **cut**.
5. **Policy test** — does it presume a business rule the owner never stated
   (R6)? Yes → **rewrite to ask whether the policy is intentional, consistent
   and disclosed, or cut**.

A cluster is "lean, zero fat" when every remaining question survives all five.

---

## 3. Question format

```
Q. When I <concrete interaction / condition>, then <observable outcome>.
   dim: <security|robustness|visual|trust>[, …]
   evidence: <exact way to settle this yes/no>
   answer: yes | no | unknown  — <one line, filled in during the stress-test epic>
```

The `answer` line stays `unknown` for now — filling it in truthfully is
downstream work, not this epic.

---

## 4. Slice map

Six clusters. Boundary rule: a question about **what one screen does with its
own inputs and outputs** belongs to that slice; a question about **what happens
between screens, or about a mechanism every screen shares** (the session
cookie, the stepper, the checkout shell, the guard/redirect web) belongs to S6.

| Slice | Issue | Owns (boundary) | Primary source |
|-------|-------|-----------------|----------------|
| **S1 Entry + Address** | `vdq.2` | From the "Checkout" click on the basket page → until a validated (or escape-hatched) address is in the session and the user is redirected to `/checkout/shipping`. Not the basket page's own correctness. | `components/features/checkout/{reservation/CheckoutButton,CheckoutPanel}.tsx`, `actions/checkout/index.ts` (`initCheckoutSession`, `saveAddress`), `actions/address/address.ts` (Google validation), `checkout/{page,address/page,address/AddressForm}.tsx` |
| **S2 Shipping** | `vdq.3` | From `/checkout/shipping` load with an address present → until a rate + price is in the session and the user is redirected to `/checkout/payment`. | `checkout/shipping/{page,ShippingPageClient,loading}.tsx`, `actions/checkout/index.ts` (`saveShippingAction`), `lib/shipping/{allekurier-rates,parcel-calculator}.ts` |
| **S3 Payment page + intent** | `vdq.4` | From `/checkout/payment` load → until `confirmPayment` hands the user to Stripe / the return URL. Not what happens after that redirect. | `checkout/payment/{page,PaymentForm.client}.tsx`, `checkout/payment/_components/CheckoutSummary.tsx`, `api/checkout/payment-intent-session/route.ts` |
| **S4 Settlement + order + stock** | `vdq.5` | From Stripe calling the return URL / firing the webhook → until an order document exists exactly once and stock is decremented or flagged. Not the rendering of the success page. | `api/checkout/return/route.ts`, `api/webhooks/stripe/route.ts`, `lib/checkout/{createOrderFromPaymentIntent,mergeGuestOrders}.ts`, `lib/email`, Sanity `backendClient` order write + stock `dec` |
| **S5 Confirmation** | `vdq.6` | From `/checkout/success` load with a `payment_intent` param → until the user leaves. Every status branch's rendering, the access gate, the analytics event. | `checkout/success/{page,OrderDetails,RefreshButton,SuccessAnalytics.client}.tsx`, Sanity `getOrderByPaymentIntentId` (read) |
| **S6 Flow + cross-cutting** | `vdq.7` | The session cookie as an object (expiry, size, secret, flags); the checkout shell (layout, header, fonts); `error.tsx`; the stepper; every adjacent transition; back / forward / refresh / re-entry; language consistency; the guest-vs-authenticated journey + guest-order merge trigger. Not any single slice's internal correctness. | `lib/session.ts`, `checkout/{layout,error}.tsx`, `checkout/_components/CheckoutStepper.tsx`, cross-slice guard/redirect behavior |

### Source facts the clusters must be written against

- **State = one `iron-session` cookie** `checkout_session`: 1-hour `maxAge`,
  `httpOnly`, `sameSite: lax`, ~4KB browser limit (a 3KB soft warn exists),
  `SESSION_SECRET` defaults to the literal `"fallback-secret-change-in-production"`.
  No server-side reservation, no queue.
- **Carrier = AlleKurier** (PL courier aggregator), sender country hardcoded
  `PL`, `REGIONS` = `PL` only. Shipping-page UI copy is **Polish**; the address
  page is **English**.
- **Money is re-derived server-side.** The client's `grandTotal` is display-only;
  `/api/checkout/payment-intent-session` recomputes it from live Sanity prices.
  The **shipping rate price**, by contrast, is taken from the client and only
  checked as a positive integer.
- **Billing address is not entered** — Stripe `billingDetails.address: "never"`,
  derived from the shipping address, country hardcoded `PL`.
- **Order creation is dual-path** — the return handler (session data,
  synchronous, non-fatal) and the Stripe webhook (PI metadata, 500-retries) both
  call `createOrderFromPaymentIntent`, reconciled by an idempotency check on
  `paymentIntentId`.
- **Stock decrement is check-then-`dec`, not atomic.** On insufficient stock it
  logs and *continues without decrementing*; a post-check only logs negative
  stock. Nothing reserves stock earlier in the flow.
- **`saveEmailToSession` is dead code** (defined, never called) — customer email
  reaches the order only via Stripe's `receipt_email` / PaymentElement. This is
  the *kind* of gap the questions must catch.

---

## 5. Worked examples

### Passes the rubric

> **Q.** When I intercept the `POST /api/checkout/payment-intent-session` and
> swap the basket for a cheaper product, is the Stripe PaymentIntent still
> created for the price of the product actually in my session's basket?
> `dim: security` · `evidence: amount shown in the Stripe dashboard for the PI`

Binary, evidence named, behavioral, and a "no" is directly a "the store was
underpaid" owner complaint.

> **Q.** When the AlleKurier request times out, does the shipping page show a
> retry affordance with intact layout (no infinite spinner, no stack trace, no
> empty page)? `dim: robustness, trust` · `evidence: block the host in devtools,
> reload /checkout/shipping`

> **Q.** Does `/checkout/success` ever render "Payment confirmed" with an amount
> for a `payment_intent` whose Stripe status is not `succeeded`?
> `dim: trust, security` · `evidence: open /checkout/success?payment_intent=<a
> canceled PI I own>`

### Rejected as leaky / fat

| Rejected question | Which test it fails |
|---|---|
| "Is the checkout flow user-friendly?" | R1 (not binary), R2 (no evidence). |
| "Does the address form call Google Address Validation?" | R3 — implementation trivia. Can be "yes" while every real address gets a FIX verdict and users are forced through the escape hatch, or while the escape hatch itself is broken. Rewrite: *"When I submit a genuine, deliverable Polish address, is it accepted on the first try without using the escape hatch?"* (`dim: robustness, trust` · evidence: type a known-good address on `:3000`). |
| "When I bring 50 of one item to payment, am I stopped with a clear message before any charge?" | R6 — presumes the store wants a per-item cap; nobody stated that. A customer buying 50 may be exactly the customer the owner wants. Rewrite policy-neutral: *"If a per-item quantity limit exists, do I reach it in the basket with a stated reason — rather than after passing address and shipping?"* (S3, coordinates with S1). |
| "Are there automated tests for the shipping slice?" | Leanness idle-test — a process metric; green tests don't make the slice professional. The questions **are** the test. |
| "Is the Stripe integration secure?" | R1 + R2 — not one binary thing, no single evidence. Decompose into per-surface questions. |

---

## 6. How a cluster is used later (out of scope here, stated for clarity)

Each of `vdq.2`–`vdq.7` produces one file in this directory
(`01-entry-address.md` … `06-flow-cross-cutting.md`), referenced from its issue.
A later epic walks each file against the running checkout, fills the `answer`
lines with evidence, and opens fix issues for every "no". Only when every answer
is a verified "yes" is the professional-checkout claim justified.
