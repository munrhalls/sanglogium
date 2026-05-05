# Sync Logic: Basket Page Comparison Functions

## comparePrices(storedPrice: number, cmsPrice: number)

Compares stored price with current CMS price.

**Input:**
- storedPrice: Price when item was added to basket (dollars)
- cmsPrice: Current price from CMS (dollars)

**Output:**
```typescript
{
  hasChanged: boolean,
  oldPrice?: number,
  newPrice: number
}
```

**Logic:**
- If storedPrice !== cmsPrice: hasChanged = true, oldPrice = storedPrice, newPrice = cmsPrice
- If storedPrice === cmsPrice: hasChanged = false, newPrice = cmsPrice

## compareStock(storedQuantity: number, cmsAvailableStock: number)

Compares stored quantity with current CMS available stock.

**Input:**
- storedQuantity: Quantity in basket
- cmsAvailableStock: Current available stock from CMS (stock - reservedStock)

**Output:**
```typescript
{
  hasChanged: boolean,
  oldQuantity?: number,
  newQuantity: number
}
```

**Logic:**
- If cmsAvailableStock < storedQuantity: hasChanged = true, oldQuantity = storedQuantity, newQuantity = cmsAvailableStock
- If cmsAvailableStock >= storedQuantity: hasChanged = false, newQuantity = storedQuantity

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

## updateBasketItem(item: BasketItem, cmsProduct: CmsProduct, priceResult, stockResult)

Updates basket item with comparison metadata.

**Input:**
- item: Current basket item
- cmsProduct: CMS product data
- priceResult: Result from comparePrices
- stockResult: Result from compareStock

**Output:**
```typescript
BasketItem with updated fields:
- displayPrice: current CMS price
- availableStock: current CMS available stock
- quantity: adjusted quantity if stock limited
- metadata: { old_displayPrice?, old_availableStock? } if changes occurred
```

**Logic:**
- Set displayPrice = priceResult.newPrice
- Set availableStock = stockResult.newQuantity
- If stock limited: set quantity = stockResult.newQuantity
- Build metadata object with old values if hasChanged is true
