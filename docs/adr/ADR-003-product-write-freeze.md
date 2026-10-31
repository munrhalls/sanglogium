# ADR-003: Product writes and checkout — create-only gate now, freeze marker later

## Status
Accepted.

## Date
2026-10-31

## Context
Checkout (the order slice) decrements `stock` in one transaction conditioned on each product's `_rev` (`features/order/adapters/sanity/createOrderFromPayment.ts`, ADR-002 Pattern 1). Any other write to the same product changes its `_rev`. If that write lands between the order commit's read and its commit, the commit is rejected, the webhook fails and Stripe is expected to retry.

Zero interference means the two writers exclude each other, product by product. A check made by one side alone leaves a gap between its check and its write. The only atomic tool Sanity gives two independent writers is compare-and-set on the document's revision.

Nothing today says which products are inside a checkout transaction. ADR-002 Pattern 1 holds no inventory, Pattern 2 was never built, and `reservedStock` is read but never written.

## Decision
1. **Products are created through `tools/create-product.mjs`.** It is create-only: an input names no id, type or revision, so it cannot address an existing product, and no existing document's revision moves. It passes only if rules 1 to 5 (`tools/product-rules.mjs`, the same code as `tests/products/check-products.mjs` and `check-integrity.mjs`) still hold for every published product afterwards. It writes in one transaction. Two writes that are clean alone but break a rule together are serialized by one bookkeeping document, `gate.productWrite`, compared by revision; the app never reads it. `tests/products/prove-gate.mjs` is its proof.
2. **Editing existing products through the gate is closed.** It opens only when checkout provides the marker below.
3. **The marker checkout must provide.** A yes/no on the product document itself, readable by GROQ. Set before checkout's first read of that product for an order, cleared in the same transaction as the order commit. A marker that stays set means frozen, which is the safe failure. The gate then refuses marked products and conditions its write on the revision it read, so the gate loses any race and checkout never does. The marker's name and form are chosen by the checkout redesign and recorded in a new ADR that supersedes this paragraph.
4. **The gate lives in `tools/`.** Its callers are operator scripts, and tooling cannot import the runtime (PLANE). This puts a product write path outside the owning slice (A12) for creates only. The runtime's only product write stays the order's stock decrement.
5. **Checkout fields at creation.** A created product carries the first values of `price_data`, `stock`, `reservedStock`, `parcel` and `sku`. No basket or order can point to an id that does not exist yet, so this cannot race. They are judged by the same rules as every other field.

## Consequences
- Until the marker exists, existing products are edited as before (Studio, one-off scripts). The two check scripts catch drift; the gate does not prevent it.
- The Studio schema carries what one document can say alone: a value in a closed list, a name or sku used once, no value twice in a filter field. Rule 2 (one way to say no value) relates products at a place, so only the gate and the check scripts can judge it.
- The lock document is untyped (`_type: productGateLock`) and has no schema.

## Alternatives considered
- **Ask Stripe whether a payment is in progress, before the gate writes.** Rejected: the gap between check and write remains, the gate would depend on Stripe and on the basket format in the payment metadata, and a pending bank transfer would freeze its products for days.
- **Accept the rejected order commit.** Rejected: a rejected commit is retried, but no risk to checkout is allowed.
- **Reuse `reservedStock` as the marker now.** Rejected: nothing writes it, and its meaning is for the checkout redesign to decide.
