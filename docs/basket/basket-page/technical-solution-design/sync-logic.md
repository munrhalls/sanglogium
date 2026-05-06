# Sync Logic: Basket Page Comparison Functions

```mermaid
flowchart TD
    Start([Basket Item + CMS Product]) --> Convert[Convert price_data.unit_amount / 100]
    Convert --> CompareP[comparePrices]
    CompareP --> PriceResult{hasPriceChange?}
    PriceResult -->|Yes| PriceOut[currentPrice, hasPriceChange: true]
    PriceResult -->|No| PriceOut[currentPrice, hasPriceChange: false]
    PriceOut --> CompareS[compareStock]
    CompareS --> StockResult{hasStockChange?}
    StockResult -->|Yes| StockOut[currentAvailableStock, hasStockChange: true, adjustedQuantity: cmsAvailableStock]
    StockResult -->|No| StockOut[currentAvailableStock, hasStockChange: false, adjustedQuantity: quantity]
    StockOut --> Check[checkAvailability]
    Check --> Available{isAvailable?}
    Available -->|No| Unavailable[Move to unavailable array]
    Available -->|Yes| Build[buildSyncResult]
    Build --> SyncResult[SyncResult object]
    SyncResult --> End([Store in syncResults])

    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style PriceResult fill:#fff4e1
    style StockResult fill:#fff4e1
    style Available fill:#fff4e1
    style Unavailable fill:#ffe1e1
    style SyncResult fill:#e1ffe1
```

## comparePrices(displayPriceAtAdd: number, cmsPrice: number)

Compares stored price (when added) with current CMS price.

**Input:**
- displayPriceAtAdd: Price when item was added to basket (dollars)
- cmsPrice: Current price from CMS (dollars)

**Output:**
```typescript
{
  currentPrice: number,
  hasPriceChange: boolean
}
```

**Logic:**
- currentPrice = cmsPrice
- hasPriceChange = (displayPriceAtAdd !== cmsPrice)

## compareStock(quantity: number, cmsAvailableStock: number)

Compares stored quantity with current CMS available stock.

**Input:**
- quantity: Quantity in basket
- cmsAvailableStock: Current available stock from CMS (stock - reservedStock)

**Output:**
```typescript
{
  currentAvailableStock: number,
  hasStockChange: boolean,
  adjustedQuantity: number
}
```

**Logic:**
- currentAvailableStock = cmsAvailableStock
- hasStockChange = (cmsAvailableStock < quantity)
- adjustedQuantity = hasStockChange ? cmsAvailableStock : quantity

## checkAvailability(cmsProduct: CmsProduct | null, cmsAvailableStock: number)

Determines if product is unavailable.

**Input:**
- cmsProduct: CMS product data or null if not found
- cmsAvailableStock: Current available stock from CMS

**Output:**
- boolean: true if unavailable, false if available

**Logic:**
- If !cmsProduct || cmsAvailableStock === 0: return true (unavailable)
- Otherwise: return false (available)

## buildSyncResult(basketItem: BasketItem, cmsProduct: CmsProduct, priceResult, stockResult)

Builds sync result object for UI display and checkout calculation.

**Input:**
- basketItem: Pure basket snapshot (productId, quantity, displayPriceAtAdd, availableStockAtAdd)
- cmsProduct: CMS product data
- priceResult: Result from comparePrices
- stockResult: Result from compareStock

**Output:**
```typescript
SyncResult:
{
  currentPrice: number,
  currentAvailableStock: number,
  hasPriceChange: boolean,
  hasStockChange: boolean,
  adjustedQuantity: number
}
```

**Logic:**
- currentPrice = priceResult.currentPrice
- currentAvailableStock = stockResult.currentAvailableStock
- hasPriceChange = priceResult.hasPriceChange
- hasStockChange = stockResult.hasStockChange
- adjustedQuantity = stockResult.adjustedQuantity

