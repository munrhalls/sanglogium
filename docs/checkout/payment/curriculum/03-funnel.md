# 03 — Session Cascade Guards

If a user edits their address after reaching payment, they must re-select shipping. This is enforced by clearing downstream data on upstream changes.

```mermaid
flowchart TD
    Basket["/basket<br/>→ sets session.basket"] --> Address["/checkout/address<br/>→ sets session.address<br/>→ clears shippingCode + shippingCost"]
    Address --> Shipping["/checkout/shipping<br/>→ sets shippingCode + shippingCost"]
    Shipping --> Payment["/checkout/payment<br/>Server Component guards:"]

    Payment --> Guard1{"session.basket.length > 0?"}
    Guard1 -->|NO| Redirect1["redirect /basket"]
    Guard1 -->|YES| Guard2{"valid quantities?"}
    Guard2 -->|NO| Redirect2["redirect /basket?error=invalid_basket"]
    Guard2 -->|YES| Guard3{"session.address?"}
    Guard3 -->|NO| Redirect3["redirect /checkout/address"]
    Guard3 -->|YES| Guard4{"shippingCost !== undefined?"}
    Guard4 -->|NO| Redirect4["redirect /checkout/shipping"]
    Guard4 -->|YES| Proceed["✓ Proceed to Sanity query"]

    Address -.->|if edited| Shipping
    Basket -.->|if edited| Address
```

**Critical detail:** `shippingCost: 0` is VALID. The guard uses `=== undefined || === null`, NOT truthiness. Free shipping must not bounce.

**The cascade principle:**
- Edit **basket** → clears address, shipping, paymentIntentId
- Edit **address** → clears shippingCode, shippingCost (keeps basket)
- This prevents stale totals — shipping depends on address
