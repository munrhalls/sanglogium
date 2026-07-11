# Phase 9 — Wishlist / favorites

**Priority: low.** Do not start until phases 1–7 are shipped and verified.
**Depends on:** nothing technically.
**Closes:** G6.

---

## What to build

1. **New Sanity schema:** `wishlistItem` document (or, simpler and preferable — an array field on `userProfile` if the project's convention favors embedding over separate documents; check how `addresses[]` is modeled in phase 4's work and mirror that choice for consistency rather than introducing a new document type for what is conceptually the same kind of "list of things attached to a profile"):
   ```ts
   defineField({
     name: "wishlist",
     title: "Wishlist",
     type: "array",
     of: [{ type: "reference", to: [{ type: "product" }] }],
   })
   ```
   A reference array (not a snapshot like `order.items`) is correct here — unlike orders, a wishlist should reflect the product's *current* price/availability, not a point-in-time snapshot.

2. **Server actions:** `addToWishlist(productId)` / `removeFromWishlist(productId)` — `requireSession()` guard, `backendClient.patch(profileId)` using `setIfMissing`/`append` or `unset` with a reference filter, same pattern as address add/remove in phase 4.

3. **UI:**
   - A heart/save icon on product cards/product detail pages (wherever those components live — locate the existing product card component before adding this, don't create a parallel one) that calls the add/remove action. Must handle the signed-out case gracefully (e.g. prompt to sign in, or silently no-op with a tooltip — don't crash).
   - A new `/account/wishlist` page listing saved products, following the `verifySession()` + Server Component pattern used by `/account/orders`.

## Acceptance criteria

- Signed-in user can add/remove products from a wishlist.
- Wishlist page shows current product data (price, availability), not stale snapshots.
- Signed-out users seeing the save icon get a clear path to sign in rather than a silent failure.
