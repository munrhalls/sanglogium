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

```mermaid
flowchart TD
    subgraph Mount["1. Page Mount"]
        M1[Page mounts] --> M2[BasketManager reads Zustand store]
        M2 --> M3["Has items?"]
    end

    M3 -- No --> E[EmptyBasket rendered]

    subgraph Track["2. High Water Mark Tracking"]
        M3 -- Yes --> T1[Build trackedIds from basket]
        T1 --> T2["trackedIds = useState<br/>Only adds, never subtracts"]
    end

    subgraph Fetch["3-6. Data Fetch & Transform"]
        T2 --> F1["SWR key: basket-products:{sortedIds}"]
        F1 --> F2{"Cache hit?"}
        F2 -- No --> F3["GET /api/basket/products"]
        F3 --> F4[CMS query by IDs]
        F4 --> F5["Return price, stock, reservedStock"]
        F5 --> F6["Parser: cents -> zloty"]
        F6 --> F7["Availability: available | unavailable"]
        F2 -- Yes --> F7
    end

    subgraph Render["7. Render"]
        F7 --> R1["BasketItem + BasketSummary<br/>with live CMS data"]
    end

    subgraph Mutate["8. Quantity / Remove"]
        R1 --> U1["User changes qty or removes"]
        U1 --> U2["Update Zustand store + localStorage"]
        U2 --> U3["trackedIds unchanged"]
        U3 --> U4["No re-fetch"]
        U4 --> R1
    end

    subgraph Add["9. Add New Item"]
        U5["User adds new product"] --> A1["Render phase: trackedIds expands"]
        A1 --> A2["SWR key changes"]
        A2 --> F3
    end

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
