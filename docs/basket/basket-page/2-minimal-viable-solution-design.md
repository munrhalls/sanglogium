Goal: capture technical solution design in minimalest possible way
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

# Technical Solution: Basket Page

## Pre-requirements
- [x] Update CMS product schema and all products to use price_data.unit_amount (cents) instead of displayPrice (dollars)
- [x] Check CMS product schema and all products to have fields: stock, reservedStock 
- [x] Create getBasketProducts.ts with minimal GROQ query for basket page needs

## Data Actors
- CMS fetcher -> CMSProductsData (price_data, stock, reserved stock)
- Parser -> CMSBasketItems (name, displayPrice, availableStock)
- AvailabilityHandler -> [AvailableItems, UnavailableItems] // available: stock > 0

## View actors
- render empty
- render [AvailableItems, UnavailableItems]

## Components
- BasketPage
- BasketItemList
- BasketItem
- EmptyBasket

## Entities
- client basket
- CMS
- basket client page
- local storage (only hydration/persist on basket modifications - handled 100% by client basket store)

## Data flow
1. Page refresh/mount or navigated to
2. Check basket items:
   - If empty → render empty
   - If not empty → fetch CMS data
3. CMS fetcher → CMS → CMSProductsData
4. Parser → CMSBasketItems
5. AvailabilityHandler → [AvailableItems, UnavailableItems] // available: stock > 0
6. Render: empty | [AvailableItems, UnavailableItems]
7. Render:
- AvailableItems - if empty, don't render; else render each item with current CMS data (name, price, stock) and basket controls
- UnavailableItems - if empty, don't render; if not empty - render banner 'Out of stock', render under AvailableItems, render each item with 'X' checkmark
8. On checkout button click: passes PureBasketItems to checkout handler // checkout flow 100% out of basket page scope

## Types
```typescript
interface BasketItem {
  productId: string
  quantity: number
}

interface CMSBasketProduct {
  _id: string
  price_data: {
    currency: string
    unit_amount: number
  }
  stock: number
  reservedStock: number
}

interface CMSBasketItem {
  productId: string
  name: string
  displayPrice: number
  availableStock: number
}

type AvailableItems = Array<BasketItem & CMSBasketItem>
type UnavailableItems = Array<BasketItem & CMSBasketItem>
```

## Why High Water Mark Pattern is Necessary

BasketManager uses High Water Mark pattern (trackedIds only grows, never shrinks) because:

1. **Basket IDs in client store** - Product IDs live in Zustand client-side state
2. **No Server Component access** - Server Components cannot access client state for prefetching
3. **SWR cache invalidation** - If SWR key changes (IDs array changes), cache invalidates and refetches
4. **Requirements**:
   - Delete/quantity changes → NO refetch
   - Navigate away, add products, return → YES refetch
   - Fetch only on mount/refresh → YES

High Water Mark achieves these requirements by keeping SWR key stable during deletions/quantity changes. It's the correct solution for this constraint, not unnecessary complexity.
