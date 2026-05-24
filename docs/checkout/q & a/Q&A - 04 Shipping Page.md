# Q & A - CRITICAL Q'S ONLY INTELLIGENCE GATHERING - Shipping Page



## The "Bus Stop" Trace: The Checkout Funnel

What happens at each "bus stop" of checkout? Here is the exact technical execution of how data is persisted across your specific scope.

### Stop 3: The Shipping Page

**Action:** The Server Component reads the cookie's address and calls the Furgonetka API to display accurate rates. The user selects a rate (e.g., DPD Courier) and clicks "Continue".

**How Data Moves:** The UI submits the selected Shipping ID to a Server Action. (You only store the ID, never the price, to prevent tampering).

**Persistence:** The Server Action appends the ID to the cookie and redirects to `/checkout/payment`.

**State:** Cookie now holds: `{ basket, address, shipping_id }`

---

## What is shipping_id and Why?

**Question:** "I don't store shipping options anywhere...so? Why not user's shipping choice in checkout session?"

**Answer:** You do store the user's choice in the session, but you must only store the identifier (the API code), never the price object.

### How it works

On the Shipping Page, you call the Allekurier/Packlink API. It returns an array of available services for that address/parcel:

```javascript
[
  { serviceCode: "inpost_locker", price: 15.00 },
  { serviceCode: "dpd_courier", price: 20.00 }
]
```

The user clicks DPD.

### The Trap

You might be tempted to save `{ choice: "DPD", price: 20.00 }` to the session.

### The Falsification

If you do this, a malicious user can intercept the client-side network request and send `{ choice: "DPD", price: 0.00 }` to your Server Action. If your server trusts this price and passes it to Stripe, you lose money.

### The Standard (shipping_id)

You only send the serviceCode (e.g., `"dpd_courier"`) to the Server Action. The Server Action saves `{ shippingCode: "dpd_courier" }` in the session.

### The Validation

Later, on the Payment page, the server reads `"dpd_courier"`, recalculates the true cost server-side, and gives that unalterable number to Stripe.

---
