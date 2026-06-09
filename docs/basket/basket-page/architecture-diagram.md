# Basket Page Architecture

## High Water Mark Data Flow

```mermaid
flowchart TD
    subgraph Store["Zustand Store (localStorage)"]
        Z["items: {productId, qty}[]"]
    end

    subgraph BM["BasketManager Component"]
        HYD["_hasHydrated<br/>gate"]
        CID["currentProductIds<br/>useMemo"]
        HWM["trackedIds<br/>useState — only adds"]
        SWR["useSWR<br/>key: basket-products:{sortedIds}"]
        EI["enrichedItems<br/>useMemo"]
        SH["shippingCost<br/>useState + useEffect debounce 500ms"]
    end

    subgraph Server["Server Side"]
        API1[/api/basket/products?ids=...]
        API2[/api/basket/shipping-rates]
        CMS[Sanity CMS]
    end

    subgraph UI["Render States"]
        SK[BasketSkeleton]
        EB[EmptyBasket]
        ER["Error Card"]
        RL["BasketItem[] + BasketSummary"]
    end

    %% Hydration gate
    Z -->|reads| HYD
    HYD -->|false| SK
    HYD -->|true| CID

    %% Product data flow
    CID -->|all ids| HWM
    HWM -->|useEffect<br/>adds only new ids| HWM
    HWM -->|key| SWR
    SWR -.->|cache miss| API1
    API1 -->|fetch| CMS
    CMS -->|price_data, stock, reservedStock| API1
    API1 -->|CmsProduct[]| SWR
    SWR -->|cmsProducts| EI

    %% Enrichment pipeline
    Z -->|items| EI
    EI -->|find + unit_amount/100| P["displayPrice<br/>(cents to dollars)"]
    P -->|stock - reservedStock| AS["availableStock"]
    AS -->|Math.min(qty, availableStock)| CQ["cappedQuantity"]
    CQ -->|sort: available first| EI
    EI -->|enrichedItems| RL

    %% Shipping rates
    EI -->|parcelData| SH
    SH -.->|POST| API2
    API2 -->|rate.amount| SH
    SH -->|shippingCost| RL

    %% Mutations
    Q["Quantity +/-"] -->|mutate| Z
    D["Delete Item"] -->|mutate| Z
    Z -->|ids unchanged| CID
    CID -->|no new ids| HWM
    HWM -->|same key| SWR
    SWR -->|cached| EI

    A["Add Item"] -->|mutate| Z
    Z -->|new id| CID
    CID -->|new id detected| HWM
    HWM -->|expanded key| SWR
    SWR -.->|cache miss| API1
    API1 -->|fetch new product| CMS
    CMS -->|data| API1
    API1 -->|merge| SWR
    SWR -->|updated| EI

    %% Error + empty states
    SWR -->|error| ER
    CID -->|length === 0| EB

    %% Unmount: trackedIds resets, Zustand persists
    N["Navigation Away"] -->|unmount| HWM
    HWM -->|reset to []| HWM
```

## Key Behaviors

| Action | trackedIds | SWR Key | Network Request |
|--------|-----------|---------|----------------|
| Initial load (post-hydrate) | Expands to all basket ids | Changes | Yes (cache miss) |
| Quantity change | Unchanged | Unchanged | No (cached) |
| Delete item | Unchanged | Unchanged | No (cached) |
| Add item | Expands (+ new id) | Changes | Yes (cache miss) |
| Navigation away | Resets to `[]` on unmount | N/A | N/A |

## What Actually Happens (Code at `BasketManager.tsx`)

**trackedIds update**: Uses `useEffect` (lines 67-74), not render-phase state update. Filters `currentProductIds` against previous `trackedIds` and appends only new IDs.

**SWR key**: `basket-products:${[...trackedIds].sort().join(",")}` (line 78). Sorting ensures stable keys regardless of insertion order.

**Enrichment** (`enrichedItems` useMemo, lines 91-120):
1. Match each basket item to CMS product by `productId`
2. Convert `price_data.unit_amount / 100` to dollars
3. Compute `availableStock = stock - reservedStock`
4. Cap quantity: `Math.min(item.quantity, availableStock)`
5. Sort: available items first

**Shipping rates** (lines 151-180): Debounced 500ms `POST` to `/api/basket/shipping-rates` with `parcelData` + country code.

**Zustand persistence**: Survives unmount. `trackedIds` (useState) resets on unmount.

## Render State Decision Tree

```
_hasHydrated === false     → BasketSkeleton
_hasHydrated === true &&
  basket.length === 0      → EmptyBasket
_hasHydrated === true &&
  error                    → Error Card
_hasHydrated === true &&
  !error && basket.length  → BasketItem[] + BasketSummary
```
