# Phase 4 — Address book ("My Addresses")

**Depends on:** nothing from phases 2–3 (independent work stream — confirmed in prior project intelligence and still true: order history and address book are parallel, not sequential).
**Closes:** G2.

---

## The schema already fits — reuse it, don't redesign it

`userProfile.addresses[]` (`sanity-cms/schemaTypes/userType.ts`) already has: `firstName`, `lastName`, `street`, `streetNumber`, `city`, `postalCode`, `regionCode`, `country`, `phone`.

The checkout flow's own address form, `app/checkout/address/AddressForm.tsx`, uses the **same field names** (`firstName`, `lastName`, `phone`, `regionCode`, `postalCode`, `street`, `streetNumber`, `city`) for its own `Address` type in `app/checkout/checkout.types.ts`. This is not a coincidence — reuse that `Address` type for the address book instead of defining a new one.

Currently `AddressForm.tsx` only ever writes into the temporary iron-session checkout cookie via `saveAddress` (in `app/actions/checkout.ts`) — it never touches `userProfile.addresses[]`. This phase adds the account-side address book as a separate, parallel surface. Wiring "select a saved address at checkout" is a **stretch goal** below, not required for this phase to be done.

## What to build

1. **New route:** `app/(store)/account/addresses/page.tsx` (Server Component, guarded by `verifySession()`, same pattern as `account/orders/page.tsx`). Fetch the current `userProfile.addresses` by `authId` via `backendClient`.

2. **New client component:** `app/(store)/account/addresses/AddressesClient.tsx` — list existing addresses (card per address, using `card-base`), each with an "Edit" and "Remove" action, plus an "Add new address" form. Reuse the exact field set and `REGIONS` constant pattern from `app/checkout/address/AddressForm.tsx` (same two regions: Poland/`PL`, United Kingdom/`GB` — don't invent new ones, this is a real constraint of the store's shipping setup, confirm by checking `REGIONS` in that file before writing the UI).

3. **New server actions** in `app/(store)/account/addresses/actions.ts`:
   - `addAddress(formData)` — `requireSession()`, then `backendClient.patch(profileId).setIfMissing({ addresses: [] }).append("addresses", [{ _key: <generate>, ...fields }]).commit()`. Sanity array items need a `_key` — generate one (e.g. `crypto.randomUUID()` or a short random string, matching however other array fields in this schema are keyed; check `sanity-cms` for an existing key-gen helper before writing a new one).
   - `removeAddress(addressKey)` — `requireSession()`, then `backendClient.patch(profileId).unset([\`addresses[_key=="${addressKey}"]\`]).commit()`.
   - `updateAddress(addressKey, formData)` — same `unset` + re-`append` pattern, or a keyed `set` if Sanity's patch API supports targeting an array item by `_key` directly in this project's Sanity client version — check existing patch usage elsewhere in `lib/` or `app/actions/` for the established pattern before picking one.

4. **Nav entry:** add a link to `/account/addresses` from `app/(store)/account/page.tsx`, next to the existing "My Orders" link.

## Stretch goal (do only if the above is done and verified — do not start this until then)

Let checkout's `AddressForm.tsx` offer "use a saved address" when the user is signed in (read `userProfile.addresses` via `getSession()` + `backendClient` at the top of the checkout address step, render a picker above the manual form). This crosses into checkout code, which is a different subsystem — read `_project/reports/checkout-system-complete-code-record.md` first if it exists, to avoid breaking the existing checkout session contract.

## Acceptance criteria

- Signed-in user can add, edit, and remove addresses from `/account/addresses`.
- Data persists in `userProfile.addresses[]` in Sanity (verify via Studio or a GROQ fetch).
- Page is protected by `verifySession()` — visiting while signed out redirects to `/sign-in` (and, if Phase 1 shipped, carries `returnTo=/account/addresses`).
- No changes to the checkout flow unless the stretch goal was explicitly requested.
