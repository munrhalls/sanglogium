# Basket Page

## Overview

The basket page allows users to review their selected products, adjust quantities, remove items, and proceed to checkout. It displays live product data from the CMS including pricing and availability, providing a clear summary of the basket before checkout.

## Architecture

```mermaid
sequenceDiagram
    participant Page as Basket Page
    participant Manager as BasketManager
    participant Store as BasketStore
    participant API as /api/basket/products
    participant CMS as Sanity CMS
    participant UI as UI Components

    Page->>Store: Get basket items
    Store-->>Page: Return items (productId, quantity)
    Page->>Manager: Check if basket has items
    alt No items
        Manager->>UI: Render EmptyBasket
    else Has items
        Manager->>API: Fetch products by IDs
        API->>CMS: Query product data
        CMS-->>API: Return product data (name, price, stock)
        API-->>Manager: Return parsed items
        Manager->>Manager: Separate by availability
        Manager->>UI: Render BasketItem list
        Manager->>UI: Render BasketSummary
    end
```

## State Synchronization Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Store as Zustand Store
    participant Manager as BasketManager
    participant SWR as SWR Cache
    participant API as CMS API
    
    User->>Store: Add/remove products
    Store->>Store: Update localStorage
    Store->>Manager: Notify subscribers
    Manager->>Manager: Track product IDs (High Water Mark)
    Manager->>SWR: Check cache for product data
    alt Data not cached
        SWR->>API: Fetch products
        API-->>SWR: Return product data
        SWR->>SWR: Cache product data
    end
    SWR-->>Manager: Return cached data
    Manager->>Manager: Filter to match current basket
    Manager->>User: Render enriched basket items
```

## Key Components

- **BasketPage** (`app/(store)/basket/page.tsx`) - Route entry point with Suspense boundary
- **BasketManager** - Orchestrates data fetching, state management, and rendering logic
- **BasketItem** - Displays individual product with image, price, and controls
- **BasketControls** - Increment/decrement quantity and remove items
- **BasketSummary** - Shows subtotal, shipping, tax, and total with checkout button
- **EmptyBasket** - Empty state with call-to-action

## Data Flow

1. Page mounts and BasketManager reads from Zustand basket store
2. High Water Mark pattern tracks product IDs (useState only adds, never subtracts)
3. SWR fetches product data from `/api/basket/products` using dynamic key based on tracked IDs
4. CMS returns product data (price, stock, reservedStock)
5. Parser converts CMS data to display format (cents to dollars)
6. Availability handler separates items into available/unavailable
7. BasketManager renders items with live CMS data
8. Quantity mutations update basket store (tracked IDs unchanged, no re-fetch)
9. Adding items triggers render phase state update, SWR refetches with expanded ID list

## High Water Mark Pattern

BasketManager uses High Water Mark pattern to prevent unnecessary refetches and permanent loading states:

- **trackedIds (useState)**: Only ever adds product IDs, never subtracts
- **Render phase state update**: Synchronous state update avoids useEffect race conditions
- **Dynamic SWR key**: `basket-products:${trackedIds.sort().join(",")}` changes only when new IDs added
- **No refetch on**: Item deletion, quantity changes, navigation (component unmount resets trackedIds)
- **Refetch on**: New items added after mount (trackedIds expands, SWR key changes)

## Tech Stack

- **React 18** - UI framework
- **Next.js** - App router and server components
- **Zustand** - Client-side basket state management with localStorage persistence
- **SWR** - Data fetching and caching
- **Sanity CMS** - Product data source
- **TypeScript** - Type safety

## Why Client Component for Data Fetching

BasketManager uses Client Component for data fetching because:

1. **Basket IDs live in client-side Zustand store** - Server Components cannot access client state
2. **Fetch depends on dynamic client data** - Product IDs required for CMS fetch are in client store
3. **SWRConfig fallback requires Server Component to know fetch keys** - Impossible without client state access
4. **Requirements**: No refetch on delete/quantity change, refetch on navigate back - High Water Mark pattern achieves this

Server Component prefetching is not possible here. The High Water Mark pattern is the correct solution for this constraint.

## Related Documentation

- [PRD](./1. PRD.md) - Product requirements and definition of done
- [Technical Solution](./2. Minimal Viable Solution Design.md) - Detailed technical design
