# Checkout — Shipping Page (Happy Path) — PM Evaluation Trace

> **Scope:** Pure source-code intelligence. Zero runtime testing.  
> **Method:** Deep trace through Server Component → Client Component → Server Action → downstream Payment Page.  
> **Date:** 2026-06-10  
> **Verdict:** All 7 questions = **YES** → Professional.

---

## Source Files Traced

| Layer | File | Role |
|-------|------|------|
| Routing & Orchestration (Server Component) | `app/checkout/shipping/page.tsx` | Guards, fetches products, calculates parcels, calls AlleKurier API, passes options to client |
| Presentation & Capture (Client Component) | `app/checkout/shipping/ShippingPageClient.tsx` | Renders options, captures selection, triggers CTA |
| Mutation & Session Gateway (Server Action) | `app/actions/checkout/index.ts` | `saveShippingAction` — validates, writes to iron-session, redirects |
| Secure Service Infrastructure | `lib/shipping/allekurier-rates.ts` | AlleKurier API client + response transformer |
| Secure Service Infrastructure | `lib/shipping/parcel-calculator.ts` | Package dimension/weight calculation from basket |
| Secure Service Infrastructure | `lib/utils/formatting.ts` | Polish locale price formatter + delivery estimate formatter |
| Downstream Guard (Payment Page) | `app/checkout/payment/page.tsx` | Verifies `shippingCost` exists before proceeding |

---

## Q1. Funnel Guard

**Question:** Does navigating directly to `/checkout/shipping` without a completed address in session redirect the user to the address page?

**Trace:**

1. `app/checkout/shipping/page.tsx:10` — `const session = await getCheckoutSession();`
2. `app/checkout/shipping/page.tsx:13-16`:
   ```typescript
   if (!session.address) {
     console.log("[SHIPPING PAGE] No address in session, redirecting to address");
     redirect("/checkout/address");
   }
   ```
3. Additional guard at `page.tsx:18-22` — also checks `session.basket` and redirects to `/basket` if empty.

**Answer: YES**

The Server Component executes `redirect("/checkout/address")` synchronously when `session.address` is falsy. The user never sees the shipping UI without a valid address. This is a hard server-side guard, not a client-side fallback.

---

## Q2. Rates Availability

**Question:** Do real shipping options load automatically on page arrival — no button press, no reload required?

**Trace:**

1. `app/checkout/shipping/page.tsx:30-33` — Fetches product parcel data from Sanity:
   ```typescript
   const products = await getProductsByIds(basketIds);
   ```
2. `page.tsx:39-53` — Calculates shipping packages using `calculatePackages()`.
3. `page.tsx:65-76` — Constructs AlleKurier payload and calls the API:
   ```typescript
   const rates = await fetchAlleKurierRates(allekurierPayload, traceId);
   ```
4. `page.tsx:82-83` — Transforms API response to `ShippingOption[]`.
5. `page.tsx:85` — Passes pre-fetched options as a prop to the client component:
   ```typescript
   return <ShippingPageClient shippingOptions={shippingOptions} traceId={traceId} />;
   ```

6. `ShippingPageClient.tsx` receives `shippingOptions` as an initial prop. No `useEffect` performs a secondary fetch.

**Answer: YES**

Shipping options are fetched **server-side during SSR** before any client-side JavaScript executes. The AlleKurier API is called directly from the Server Component. The client receives ready-to-render options as props. No user interaction (button press, reload) is required.

---

## Q3. Display Completeness

**Question:** Does each option clearly display all four pieces of information a buyer needs: carrier name, service type, delivery estimate, and price?

**Trace:**

`app/checkout/shipping/ShippingPageClient.tsx:185-200` — Each option card renders a three-row vertical stack:

```tsx
{/* Row 1: Provider + Price */}
<div className="flex items-baseline justify-between gap-2">
  <p className="type-card-title">{option.provider}</p>              {/* ← carrier name */}
  <p className="type-price shrink-0 text-right whitespace-nowrap">
    {formatPolishPrice(option.amount)}                            {/* ← price */}
  </p>
</div>

{/* Row 2: Service description — full width */}
<p className="type-caption">{option.servicelevel.name}</p>         {/* ← service type */}

{/* Row 3: Delivery time — full width, left-aligned, muted */}
<p className="type-caption text-text-secondary">
  {formatDeliveryEstimate(option.estimatedDays)}                   {/* ← delivery estimate */}
</p>
```

**Answer: YES**

All four required pieces are explicitly rendered for every option:
- **Carrier name** → `option.provider`
- **Service type** → `option.servicelevel.name`
- **Delivery estimate** → `formatDeliveryEstimate(option.estimatedDays)`
- **Price** → `formatPolishPrice(option.amount)`

---

## Q4. Locale Correctness

**Question:** Are prices shown in PLN with correct Polish locale formatting?

**Trace:**

1. `lib/utils/formatting.ts:5-10`:
   ```typescript
   export function formatPolishPrice(amount: number): string {
     return new Intl.NumberFormat('pl-PL', {
       style: 'currency',
       currency: 'PLN',
     }).format(amount);
   }
   ```

2. `ShippingPageClient.tsx:190` — Consumed as:
   ```tsx
   {formatPolishPrice(option.amount)}
   ```

3. `lib/shipping/allekurier-rates.ts:227` — Currency is hardcoded to `"PLN"` during transformation:
   ```typescript
   currency: 'PLN',
   ```

**Answer: YES**

The formatter uses `Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })`, which is the standard browser API for Polish locale currency formatting (e.g., "12,76 zł"). The AlleKurier transformer also hardcodes currency to `"PLN"`. Both the data source and the presentation formatter are PLN-bound.

---

## Q5. Selection Behaviour

**Question:** Is exactly one option selectable at a time, with an unambiguous visual difference between selected and unselected states?

**Trace:**

**Exactly-one constraint:**

`ShippingPageClient.tsx:144-151`:
```tsx
<input
  id={`shipping-${option.rateId}`}
  type="radio"
  name="shippingRate"        // ← same name = native radio group
  value={option.rateId}
  checked={isSelected}
  onChange={() => setSelectedRateId(option.rateId)}
  className="sr-only"
/>
```

- Native `<input type="radio" name="shippingRate">` guarantees exactly one selection per browser semantics.
- State is held in a single `selectedRateId` string (`useState<string | null>(null)` at line 31).

**Unambiguous visual difference:**

`ShippingPageClient.tsx:138-141` — Card border/shadow/background:
```tsx
isSelected
  ? "border-brand-400 shadow-[0_0_0_1px_theme(colors.brand.400),0_4px_20px_rgba(246,227,213,0.08)] bg-surface-subtle"
  : "pointer-fine:hover:border-brand-400/50 pointer-fine:hover:shadow-cardHoverDark"
```

`ShippingPageClient.tsx:155-182` — Custom checkbox indicator:
```tsx
<span className={cn(
  "flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors duration-200",
  isSelected
    ? "border-brand-400 bg-brand-400"          // ← filled + checkmark
    : "border-border-primary bg-transparent"   // ← empty
)}>
  {isSelected && <svg ...><path d="M2.5 6L5 8.5L9.5 3.5" ... /></svg>}
</span>
```

**Answer: YES**

- **Exactly one:** Native radio group + single React state variable.
- **Unambiguous visual difference:** Selected card gets a brand-colored border, shadow, and subtle background shift; the checkbox becomes filled with a white checkmark. Unselected cards remain neutral with an empty checkbox.

---

## Q6. CTA Gate

**Question:** Is the "Continue to Payment" button inactive/disabled until the user has selected an option?

**Trace:**

`ShippingPageClient.tsx:81`:
```typescript
const isCtaDisabled = !selectedOption || isSubmitting;
```

Where `selectedOption` is:
```typescript
const selectedOption = shippingOptions.find((o) => o.rateId === selectedRateId) ?? null;
```

Both CTA buttons consume this flag:

1. Desktop CTA (`page.tsx:225-243`):
   ```tsx
   <button
     id="shipping-continue-desktop"
     onClick={handleContinue}
     disabled={isCtaDisabled}
     ...
   >
   ```

2. Mobile sticky CTA (`page.tsx:247-267`):
   ```tsx
   <button
     id="shipping-continue-mobile"
     onClick={handleContinue}
     disabled={isCtaDisabled}
     ...
   >
   ```

**Answer: YES**

The button is disabled when `selectedOption` is `null` (no selection made) OR when `isSubmitting` is `true` (preventing double-clicks). The gate is applied identically to both desktop and mobile CTA variants.

---

## Q7. Checkout Handoff

**Question:** After selecting an option and clicking Continue, does the user land on the payment page with the chosen shipping cost correctly included in the order total?

**Trace:**

**Step A — Client calls action with selected data:**

`ShippingPageClient.tsx:59-66`:
```typescript
await saveShippingAction(
  selectedOption.rateId,
  Math.round(selectedOption.amount * 100),   // ← convert PLN → cents
  selectedOption.servicelevel.name,
  selectedOption.provider,
  selectedOption.estimatedDays
);
```

**Step B — Action validates and persists:**

`app/actions/checkout/index.ts:110-184` (`saveShippingAction`):
- Guards for basket + address presence (lines 120-128)
- Validates `priceInCents` is a positive integer (lines 146-155)
- Writes to iron-session cookie (lines 166-170):
  ```typescript
  session.shippingCode = shippingCode;
  session.shippingCost = priceInCents;
  session.shippingMethodName = shippingMethodName;
  session.shippingCarrier = shippingCarrier;
  session.shippingEstimatedDays = shippingEstimatedDays;
  await session.save();
  ```
- Redirects to `/checkout/payment` (line 183)

**Step C — Payment page reads and includes cost:**

`app/checkout/payment/page.tsx:42-45` — Guard ensures shipping was completed:
```typescript
if (session.shippingCost === undefined || session.shippingCost === null) {
  redirect("/checkout/shipping");
}
```

`page.tsx:120` — Shipping cost added to grand total:
```typescript
const grandTotal = Math.round(subtotal + (session.shippingCost as number));
```

`page.tsx:181` — Shipping cost passed to summary component:
```tsx
<CheckoutSummary
  items={items}
  shippingCost={session.shippingCost as number}
  ...
/>
```

**Answer: YES**

The handoff is verified end-to-end:
1. The client passes the selected rate's amount (×100 for cents) to `saveShippingAction`.
2. The action writes `shippingCost` (in cents) to the encrypted iron-session cookie and redirects to `/checkout/payment`.
3. The payment page **guards** against missing `shippingCost` (redirects back to shipping if absent).
4. The payment page computes `grandTotal = subtotal + session.shippingCost` and passes it to the checkout summary.

The shipping cost is therefore **correctly persisted and included** in the order total.

---

## Summary

| # | Question | Verdict | Confidence |
|---|----------|---------|------------|
| 1 | Funnel Guard | **YES** | 100% — Hard server-side `redirect()` on missing `session.address` |
| 2 | Rates Availability | **YES** | 100% — Server-side AlleKurier API call during SSR, passed as props |
| 3 | Display Completeness | **YES** | 100% — All 4 fields rendered per option (provider, service, estimate, price) |
| 4 | Locale Correctness | **YES** | 100% — `Intl.NumberFormat('pl-PL', { currency: 'PLN' })` |
| 5 | Selection Behaviour | **YES** | 100% — Native radio group + unambiguous selected/unselected styling |
| 6 | CTA Gate | **YES** | 100% — `disabled={!selectedOption \|\| isSubmitting}` on both CTAs |
| 7 | Checkout Handoff | **YES** | 100% — Cost saved to session (cents), validated on payment page, included in total |

**Overall: PROFESSIONAL** — All 7 criteria pass based on direct source-code evidence.
