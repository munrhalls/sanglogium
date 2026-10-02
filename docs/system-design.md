# Sanglogium: System Design (North Star)

The authoritative target for the system's design. All implementation work is measured against it.
Grounded against the code and live data on 2026-10-02.

**How to read it.** Every section states what the system *should* be. Lines marked **Now:** record
the current state. Each one was verified by reading the code or querying live data, unless marked ⚠️, which means
unverified: verify before acting. Open gaps are listed in §10, ranked.

---

## 0. Shape

```
Browser (basket in localStorage)
   │
Vercel CDN ─► Next.js 15 App Router: stateless functions
                 ├─ Sanity   content · price · stock · orders   (one dataset)
                 ├─ Turso    identity · sessions · account data (SQL)
                 ├─ Stripe   money; signed webhook → order creation
                 ├─ Resend   email
                 └─ Carriers (rates) · GUS TERYT (address check)
Checkout state between steps: encrypted cookie (iron-session, 1 h)
```

Module boundaries (`features/<name>` entries, `sanity-cms/lib` as the sole Sanity data layer,
dependency graph) are defined and lint-enforced in `CLAUDE.md`. This doc does not repeat them.

## 1. Invariants

The system is correct only while all of these hold. A change that weakens one needs an explicit decision recorded here.

- **I1** Every succeeded PaymentIntent has exactly one order, and no order exists without one.
- **I2** The amount charged is derived on the server from canonical prices, validated quantities and a
  server-quoted shipping price. The order's lines add up to the amount charged.
- **I3** Stock is decremented exactly once per order, atomically with it. A paid order that stock
  cannot cover is flagged and alerted, never silent.
- **I4** Customer data (orders, profiles, addresses) is never readable without credentials.
- **I5** Every datum has one writer of record. Every copy is derived, has one automated writer, and can be rebuilt.
- **I6** No failure on a money or privacy path is silent.

## 2. Requirements & constraints

**Functional (what it does).** Browse, filter and search about 1k products. Basket. Guest and account checkout
(Poland only, PLN, Stripe PaymentIntents). Order confirmation email. Account area: orders, addresses,
wishlist, data export, deletion. Back-office: staff fulfil orders (Sanity Studio today; the `(admin)` pages are stubs).

**Quality attributes (how well it must do it).**

| Attribute | Target | Why |
|---|---|---|
| Money/stock correctness | Exact (I1–I3) | Harm is irreversible: wrong charges, chargebacks, overselling single-unit gear |
| Privacy | Deny by default (I4) | GDPR; the store holds addresses and order history |
| Consistency | Strong for money, stock, orders and identity. Catalogue display may lag a publish by minutes | Display staleness is corrected at checkout; money errors are not correctable |
| Latency | Budgets in `docs/performance/PERFORMANCE_BUDGET.md`; checkout steps bounded by explicit outbound timeouts (§9) | One hung dependency must not hang a step |
| Availability | Browsing survives a Sanity outage on stale cache. Checkout may fail closed. A paid order is never lost (retried until it lands) | Losing a paid order is the worst outcome |
| Scale | §8 numbers. Absorb 10× without an architectural change; don't design for 1000× | Niche premium store |
| Cost | Dominated by SaaS quotas (Sanity requests and documents, Vercel invocations), not compute | Drives the caching design |
| Operability | One developer plus agents: managed services only, no new infrastructure without a measured need | Every moving part is owned by nobody else |

**Fixed constraints.** PL shipping only, PLN only, 23% VAT inside gross prices, Vercel, Sanity, Turso, Stripe.

## 3. Data model: one source of truth per datum

| Datum | Writer of record | Lives in | Notes |
|---|---|---|---|
| Product content (name, specs, images, facet attributes) | Editors (Studio) | Sanity `product` | Cached for display (§6) |
| Price | Editors | `product.price_data.unit_amount`: integer grosze | **Now:** `filterAttributes.price` is a hand-edited copy used by filters and sorting; 27 of 1,027 products already differ from the charged price |
| Stock | Editors (restock), order commit (decrement) | `product.stock`: integer ≥ 0 | Availability is derived as `stock > 0` at query time. **Now:** `filterAttributes.inStock` is a stored copy that the order path never updates; `reservedStock` is vestigial (all 0, ADR-002 superseded) |
| Currency, VAT rate | Code constants (PLN, 23%) | — | **Now:** each product carries a `price_data.currency` (schema default `"usd"`), but the charge hard-codes PLN. The per-product field is a false degree of freedom |
| Catalogue tree | Editors | Sanity, materialised at build into `data/catalogue-index.json` | Changes ship with a deploy |
| Basket while browsing | Browser | localStorage | Advisory only: re-priced and re-checked on the server |
| Checkout session (basket snapshot, address, quoted shipping options, chosen option, PI id) | Server | Encrypted cookie, 1 h | Key: `checkoutSessionId`, which also serves as the trace id |
| Payment state (succeeded, refunded, disputed) | Stripe | PaymentIntent / Charge | Stripe is the truth for money |
| Priced order snapshot (lines with unit price, shipping, address, email, userId) | Server, at PI creation | PI metadata | An order can be rebuilt from Stripe alone, which is what makes reconciliation (§7) possible |
| Order | Order creator (create); staff (fulfilment status) | Sanity `order`, `_id = order_<pi>` | Snapshot fields are immutable after creation. **Now:** line prices are re-read from the product at order time while the total is the PI amount, so they diverge if a price changes mid-checkout |
| Identity, sessions, credentials, 2FA | Better Auth | Turso | Session cookie cache ≤ 5 min |
| Account data (addresses, wishlist, marketing opt-in, Stripe customer id) | User | **Should:** Turso tables with a foreign key to the user and cascade on delete. **Now:** Sanity `userProfile`, mirrored from Turso by best-effort hooks plus on-read healing (`lib/auth.ts`, `lib/auth/dal.ts`) | |
| Order ↔ user | `order.userId` (Turso id) | Sanity | Guest orders link to an account by verified email |

Rules:
- Money is integer minor units (grosze) end to end.
- An order describes what was sold from its own snapshot. It never re-reads product data.
- Humans never edit a derived copy. If the canonical field can serve the query, there is no copy.

**Decision: orders and stock stay together in Sanity.** One Sanity transaction holds the order `create` plus each
stock decrement guarded by `ifRevisionID`, and that delivers I1 and I3 today. Studio serves as the back-office. Accepted costs:
no unique constraints beyond `_id`, no foreign keys, documents and requests count against the plan's quota.
*Revisit trigger:* the back-office outgrows Studio, order queries outgrow GROQ, or the order count
nears the plan's document cap. If any of those happens, move orders **and** stock to Turso together, never one without the other.

**Decision: account data moves to Turso.** The user entity is split across two stores with no shared transaction.
That split is the single root cause of the sync hooks, the on-read profile healing and the best-effort profile
deletion (`docs/auth/userprofile-atomicity-spec-updated.md`). In one SQL database, profile creation becomes part of
sign-up and erasure becomes one cascading delete.

## 4. Storage & consistency

- **Sanity** is a document store with multi-document transactions and optimistic locking (`ifRevisionID`).
  It has no unique constraints, so uniqueness comes from deterministic `_id`s. Reads through the API CDN are eventually consistent.
  Rule: any read that decides money or stock bypasses every cache (`backendClient`, `useCdn: false`).
  **Now:** this holds in the PI route and the order creator.
- **The dataset is private.** **Now:** it is public, and anonymous queries return 45 `order` and 5
  `userProfile` documents (checked 2026-10-02). Sanity's public read is per document, so their emails and
  addresses are exposed. With a private dataset, reads go through a server-only token. Every storefront read is
  already server-side (header search calls a server action), and image URLs stay on the public asset CDN.
- **Turso (libSQL)** is relational and ACID, with foreign keys and unique constraints. It holds identity, account data and the auth
  rate-limit counters (§8).

| Path | Model | Mechanism |
|---|---|---|
| Amount charged | Strong | Uncached price read at PI creation |
| Order + stock | Strong, atomic | One transaction, deterministic `_id`, `ifRevisionID` per product |
| Displayed price / availability | Eventual, within the §6 bound | Tag invalidation on publish |
| Order status vs refunds | Eventual | Stripe webhook (§7) |
| Session revocation | ≤ 5 min | Better Auth cookie cache (accepted) |
| Account data ↔ identity | Strong (once in Turso) | One database |

**What eventual consistency costs here.** A shopper may see a stale price or stock badge, and checkout corrects
it: the price is re-derived and out-of-stock lines are rejected when the PI is created. The only remaining oversell window is
the gap between that check and payment success. I3 covers it: the order is flagged, an alert fires, and a human decides
between refund and backorder. Pre-payment holds (ADR-002, Pattern 2) are not built. Add them only if measured oversells on
single-unit items justify it.

## 5. APIs & boundaries

**The trust boundary.** Every Server Action and route handler is a public endpoint that can be called with arbitrary
arguments. Each one must:
1. validate input at entry with zod: types, integer bounds, max lengths, max basket lines;
2. authorise user-owned operations (`requireSession`);
3. never accept a money value from the client. The client sends IDs and quantities; the server
   derives price, shipping, tax and total.

**Now:**
- `initCheckoutSession` stores client items without validation, and the PI route multiplies prices by them.
  A negative or fractional quantity therefore lowers the charged total.
- `saveShippingAction` takes `priceInCents` from the client, and that value flows into the charge.
- Fix: quote shipping on the server, store the quoted options in the checkout session, and accept only an option ID from the client.

**Inbound webhooks are authenticated.** The Stripe webhook verifies its signature. `/api/revalidate` accepts any caller
(**Now**) and must verify Sanity's webhook signature.

**External dependencies.** Each one sits behind a single adapter with an explicit timeout and a defined degradation (§9).

**Idempotency.** Every operation that can be retried or delivered twice is idempotent:

| Operation | Mechanism | Now |
|---|---|---|
| Create PaymentIntent | Stripe idempotency key: one key per distinct request, never reused with other params | ⚠️ One key (`checkoutSessionId`) is reused for the create and for every update with changed params. Stripe rejects that, so changing shipping or address after reaching payment is expected to fail with a 500. Reproduce first, then: keyed create, unkeyed update (updates are set-semantics) |
| Create order | `_id = order_<pi>` with `create` in the transaction | Holds |
| Decrement stock | Inside the order transaction, with `ifRevisionID` | Holds |
| Webhook redelivery, return-handler race | Both call the same idempotent creator | Holds |
| Confirmation email | `confirmationSentAt` marker on the order plus Resend idempotency key `order-confirmation/<orderId>` | Missing: sent once, failure swallowed, never retried |
| Account mutations | Set semantics (add if absent, remove if present) | — |

**Payload budgets are explicit.** A Stripe metadata value is capped at 500 chars, and the basket travels as one value
(`id:qty,…`). Capacity is therefore about 500 / (product-id length + 4) lines, and a larger basket fails at PI creation (**Now**).
Fix: cap basket lines with one constant shared by the UI and the server, and split the priced snapshot across keys (`lines_0…n`;
Stripe allows 50 keys).

## 6. Caching

**Principles.**
- Caching is opt-in per surface, with a stated staleness bound and an invalidation path.
- Personalised responses are `private, no-store` by default.
- Exactly one layer owns freshness on each data path. Never stack caches, such as Next's data cache over Sanity's API CDN, where a revalidation can refill from a stale layer.

| Surface | Cache | Staleness bound | Invalidation |
|---|---|---|---|
| Images | Sanity image CDN plus Next image cache; content-addressed URLs | None needed | n/a |
| Catalogue tree | Build artifact | Until deploy | Sanity publish of catalogue docs triggers a deploy hook. **Now:** manual deploy. `/api/revalidate` revalidates tag `catalogue-index`, which no fetch carries, so it is a no-op that looks like a mechanism |
| Product content, listings, PDP, homepage data | Next data cache on tagged fetches (`product`, `product:<id>`, `homepage`), fetched with `useCdn: false` | Seconds after publish, plus a 1 h time-based safety net | Signed Sanity webhook → `revalidateTag`. **Now:** homepage uses 1 h ISR, listings are `force-dynamic` (every view queries Sanity), and no fetch carries a tag |
| Money/stock decisions | None | 0 | — |
| Personalised (account, basket API, checkout, auth, export) | None (`private, no-store`) | — | — |
| Browser basket | localStorage | Until checkout | Re-validated at the basket view and at PI creation |
| Auth session | Signed cookie cache | 5 min | Revocation lag accepted |
| Client router cache | `staleTimes.dynamic: 30` | 30 s | Accepted for back/forward UX |

**Personalised responses: Now.** `next.config.ts` sends `public, max-age=300, s-maxage=300` on every path and
exempts only `/api/(checkout|order|shipping|webhook)`. Next.js replaces custom Cache-Control on pages, but route
handlers such as `/api/account/export` (the same URL for every user) and `/api/auth/*` may be CDN-cacheable ⚠️.
Check `curl -I` on production first. Either way, invert the default.

**Why cache data rather than pages for listings.** Filter combinations make page-level ISR impractical. Caching the
Sanity fetches keyed by (query, params) changes Sanity load from O(page views) to O(distinct queries × publishes), while the pages stay dynamic.

## 7. Async work & queues

**Rule.** The request path does only what the user must wait for. Everything else is keyed to a durable record, so it can be
retried and deduplicated. No broker until a measured need: for the one flow that matters, Stripe's signed webhook
delivery (retried for up to 3 days) already is the queue.

| Work | Trigger | Retry | Dedup |
|---|---|---|---|
| Order + stock decrement | `payment_intent.succeeded` webhook (the return handler is a fast path) | Stripe redelivers on non-2xx | Deterministic `_id` (holds) |
| Confirmation email | After order commit, and on any later pass that finds `confirmationSentAt` unset | Webhook redelivery, sweep | Marker plus provider idempotency key |
| Refund / dispute → order state | `charge.refunded`, `charge.dispute.created` | Redelivery | Set semantics. **Now:** not handled, so an order refunded in the Stripe dashboard stays `processing` and can still be packed |
| Reconciliation sweep | Daily Vercel cron (`CRON_SECRET`) | Next run | Lists succeeded PIs from the last 7 days (longer than Stripe's retry window) and ensures each has an order and an email, using the same idempotent creator. This is the backstop for I1 and its measurement |
| Guest-order merge on email verification | Auth hook | Idempotent re-run | Failures reported (§9). **Now:** console only |
| Catalogue rebuild | Sanity publish | Deploy hook | n/a |

Duplicate delivery is assumed everywhere, and ordering is assumed nowhere. A refund event that arrives before its order exists
returns 500, so Stripe redelivers it later.

## 8. Scaling & bottlenecks

**Stateless.** Function instances hold no correctness state: checkout state lives in the cookie and identity in Turso. Two exceptions:
- Better Auth rate-limit counters use in-memory storage by default, so every instance keeps its own limits. Use `storage: "database"`.
- The `profileCache` map in `lib/auth/dal.ts` is only an optimisation, and it disappears once account data moves to Turso.

**Back-of-envelope.** Assumptions are labelled; replace them with analytics once the store is live.
- Catalogue: 1,027 products (live count). The whole catalogue fits in one function's memory. Not a limit.
- Traffic (*assumed*): 50k sessions/month × 5 pages ≈ 250k views/month ≈ 0.1 req/s average, and 1–3 req/s at a 10–30× campaign
  peak. Compute is not the limit.
- Orders (*assumed* 1.5% conversion): about 750/month, or about 25/day. Contention only appears when many buyers hit one product
  within seconds (a limited drop). Even then an OCC conflict costs a Stripe redelivery, not an order.

**The real limits, in order.**
1. **Sanity metered requests.** Listings are `force-dynamic` and issue several queries per view, so request volume ≈ views ×
   queries per view, growing linearly with traffic. The tagged data cache (§6) makes it scale with publishes instead.
2. **Sanity document cap.** Orders accrue at about 9k/year on top of the 1,027 products. Compare that with the plan's limit;
   this is the main revisit trigger in §3.
3. **Cookie size (4 KB).** The checkout session grows with basket lines, the address and the quoted options. The PI route warns at 3 KB.
   An explicit line cap keeps it bounded.
4. **Stripe metadata** budget (§5).
5. **Abuse of public endpoints.** `/api/address/autocomplete` (a third-party proxy), `/api/newsletter/subscribe` and the
   `/api/trace` log sink have no throttling. Add platform rate-limit rules (Vercel WAF) for public `/api/*`.

**Not needed at this scale:** read replicas, sharding, a search engine, a queue broker, Redis. Each one needs a measured trigger.

## 9. Failure & observability

**Timeouts.** Every outbound call has an explicit timeout, below its caller's budget, and a defined degradation:

| Dependency | Timeout | On failure |
|---|---|---|
| Sanity reads (storefront) | Explicit client timeout | Serve the stale cache entry; error boundary if there is none |
| Sanity write (order) | Explicit | Webhook returns 500 and Stripe redelivers; the return handler logs and still redirects |
| Stripe API | SDK timeout plus retries | Checkout shows a retryable error |
| Turso (auth) | Explicit | Sign-in is unavailable and checkout continues as guest. **Now:** `getSession()` sits inside the PI route's `try`, so an auth-DB error fails payment creation |
| GUS TERYT | About 3 s. **Now:** none, so a hang blocks the address step until the function times out | Accept the address as entered (existing policy on error) |
| Carrier rates | Present (AlleKurier, Packlink) | Retryable error; never guess a price |
| Resend | Explicit | `confirmationSentAt` stays unset, and the webhook or sweep retries |
| Address autocomplete | 4 s (present) | Manual entry |

**Partial failure on the paths that matter.**
- Payment succeeded, order write failed: Stripe redelivers, the sweep is the backstop, and an alert fires.
- Payment succeeded, stock short: the order is still created, flagged, and an alert fires.
  **Now:** `order_stock_insufficient` is only a console line.
- Order committed, email failed: the marker drives a retry.
- Account deleted, order anonymisation failed: alert (a GDPR obligation), then an idempotent re-run.
  **Now:** console only.

**Observability: the minimal set.**
- **Errors → Sentry.** Every caught error on a money or privacy path is reported (`Sentry.captureException`) before it is
  swallowed or turned into a status code. **Now:** the webhook and return handler catch their errors and the auth hooks log them,
  so Sentry, which only sees thrown request errors, never receives the failures that matter most.
- **Logs.** One JSON line per event, carrying `correlationId = checkoutSessionId`, which already propagates into PI metadata. One ID
  traces basket → PI → webhook → order. **Now:** the default level is `warn`, which drops success events. Keep
  `order_created` and payment outcomes at info in production: they are rare, and they are the audit trail.
- **Alerts (business invariants).**
  1. Succeeded PIs without an order (sweep result; must be 0).
  2. Webhook non-2xx rate.
  3. Flagged oversold orders.
- **Traces.** Sentry at 10% server sampling (present).
- **Remove `/api/trace`**, an unauthenticated public log sink. Client errors go through Sentry's browser SDK.

## 10. Gap register

Ranked. Close each gap through a Loop mission. When it closes, delete its row and update the affected section: this doc
describes the system and is not a changelog.

| # | Gap | Evidence | Closure | Guards |
|---|---|---|---|---|
| **P0: money & privacy, before launch** |||||
| G1 | Customer data is publicly readable | Anonymous query returns 45 orders and 5 profiles | Make the dataset private; server-only read token | I4 |
| G2 | Quantities are unvalidated, so the charged total can be manipulated | `features/checkout/actions.ts` `initCheckoutSession`; PI route | zod at the boundary: integer 1..max, max lines | I2 |
| G3 | Shipping price is client-supplied | `saveShippingAction(…, priceInCents)` | Server-quoted options in the session; client sends an option ID | I2 |
| G4 | ⚠️ Personalised API routes may be CDN-cacheable | Global header in `next.config.ts` | `curl -I` in production; default to `private, no-store`, with public caching opt-in | I4 |
| **P1: correctness & silent failure** |||||
| G5 | ⚠️ PI idempotency key reused across params | `app/api/checkout/payment-intent-session/route.ts` | Reproduce; keyed create, unkeyed update | I1 |
| G6 | Order lines are re-priced at order time | `createOrderFromPaymentIntent.ts` | Snapshot priced lines in PI metadata; assert they sum to `pi.amount` | I2 |
| G7 | No stock check before payment; oversell is only logged | PI route; order creator | Check stock at PI creation; flag the order and alert | I3 |
| G8 | Critical failures never reach Sentry | Webhook and return-handler catches; auth hooks | `captureException` at each catch site | I6 |
| G9 | Confirmation email is at-most-once | Order creator swallows the send error | Marker plus idempotency key | I6 |
| G10 | Refunds and disputes are not mirrored to orders | Webhook handles only succeeded, failed and canceled | Handle `charge.refunded` and `charge.dispute.created` | I1 |
| G11 | Revalidate webhook is unauthenticated and a no-op | `app/api/revalidate/route.ts` | Signed webhook; tagged fetches; deploy hook for the catalogue | — |
| G12 | TERYT call has no timeout | `features/checkout/adapters/terytValidator.ts` | Timeout feeding the existing degrade path | — |
| G13 | Auth rate limits are per instance | `lib/auth.ts` (default storage) | `rateLimit.storage: "database"` | — |
| G14 | A Turso error fails checkout for signed-in users | PI route `getSession()` inside `try` | Degrade to guest | — |
| **P2: structure & cost** |||||
| G15 | Duplicate price and stock fields; 27 have drifted | `filterAttributes.price/inStock`, `reservedStock`, `price_data.currency` | Filter on the canonical fields; delete the copies | I5 |
| G16 | User entity split across Turso and Sanity | Auth hooks, `ensureUserProfile` | Move account data to Turso | I5 |
| G17 | Listings query Sanity on every view | `force-dynamic`, no fetch tags | Tagged data cache (§6) | Cost |
| G18 | Basket size is bounded only by accident | 500-char metadata value; 4 KB cookie | Explicit line cap; chunked metadata | I2 |
| G19 | No reconciliation | — | Daily sweep (§7) | I1 |
| G20 | Public endpoints are unthrottled | `/api/trace`, autocomplete, newsletter | Delete `/api/trace`; WAF rate limits | — |
| G21 | Two Sanity write clients across three token env names; `writeClient` is unused | `sanity-cms/lib/client.ts`, `backendClient.ts` | One write client, one token | — |
