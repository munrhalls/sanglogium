# Implementation: Basket Page

```typescript
import { create } from 'zustand'
import { z } from 'zod'

// Zod schema for CMS product data validation
const CmsProductSchema = z.object({
  _id: z.string(),
  price_data: z.object({
    currency: z.string(),
    unit_amount: z.number().nonnegative()
  }),
  stock: z.number().nonnegative(),
  reservedStock: z.number().nonnegative()
})

type CmsProduct = z.infer<typeof CmsProductSchema>

// Zod schema for BasketItem (same as non-local-basket for consistency)
const BasketItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  displayPriceAtAdd: z.number().nonnegative(),
  availableStockAtAdd: z.number().nonnegative(),
  displayPrice: z.number().nonnegative().optional(),
  availableStock: z.number().nonnegative().optional(),
  metadata: z.object({
    old_displayPrice: z.number().nonnegative().optional(),
    old_availableStock: z.number().nonnegative().optional()
  }).optional()
})

// Infer TypeScript types from Zod schema
type BasketItem = z.infer<typeof BasketItemSchema>

type SyncStatus = 'idle' | 'loading' | 'error' | 'success'

interface BasketState {
  items: BasketItem[]
  unavailable: BasketItem[]
  hasHydrated: boolean
  syncStatus: SyncStatus
}

interface BasketActions {
  setSyncStatus: (status: SyncStatus) => void
  updateBasketFromCMSPayload: (cmsProducts: CmsProduct[]) => void
  addProduct: (productId: string, displayPriceAtAdd: number, availableStockAtAdd: number) => void
  removeProduct: (productId: string) => void
  incrementQuantity: (productId: string) => void
  decrementQuantity: (productId: string) => void
}

type BasketStore = BasketState & BasketActions

const useBasketStore = create<BasketStore>()((set, get) => ({
  items: [],
  unavailable: [],
  hasHydrated: false,
  syncStatus: 'idle',
  
  setSyncStatus: (status) => set({ syncStatus: status }),

  updateBasketFromCMSPayload: (cmsProducts) => {
    // Validate CMS products input using Zod schema
    const result = z.array(CmsProductSchema).safeParse(cmsProducts)
    if (!result.success) {
      console.error('Invalid CMS products data:', result.error)
      set({ syncStatus: 'error' })
      return
    }

    const items = get().items
    const unavailable: BasketItem[] = []
    const updatedItems: BasketItem[] = []

    items.forEach((item) => {
      const cmsProduct = result.data.find((p) => p._id === item.productId)
      const cmsAvailableStock = cmsProduct ? cmsProduct.stock - cmsProduct.reservedStock : 0

      // Check availability
      if (!cmsProduct || cmsAvailableStock === 0) {
        unavailable.push(item)
        return
      }

      // Convert price_data.unit_amount (cents) to displayPrice (dollars)
      const cmsDisplayPrice = cmsProduct.price_data.unit_amount / 100

      // Price comparison
      const priceResult = {
        hasChanged: cmsDisplayPrice !== item.displayPriceAtAdd,
        oldPrice: cmsDisplayPrice !== item.displayPriceAtAdd ? item.displayPriceAtAdd : undefined,
        newPrice: cmsDisplayPrice
      }

      // Stock comparison
      const stockResult = {
        hasChanged: cmsAvailableStock < item.quantity,
        oldQuantity: cmsAvailableStock < item.quantity ? item.quantity : undefined,
        newQuantity: cmsAvailableStock < item.quantity ? cmsAvailableStock : item.quantity
      }

      // Update item with comparison results
      const metadata: BasketItem['metadata'] = {}
      let updatedItem = { ...item }

      updatedItem.displayPrice = priceResult.newPrice
      updatedItem.availableStock = stockResult.newQuantity

      if (stockResult.hasChanged) {
        updatedItem.quantity = stockResult.newQuantity
      }

      if (priceResult.hasChanged) {
        metadata.old_displayPrice = priceResult.oldPrice
      }

      if (stockResult.hasChanged) {
        metadata.old_availableStock = stockResult.oldQuantity
      }

      if (Object.keys(metadata).length > 0) {
        updatedItem.metadata = metadata
      }

      updatedItems.push(updatedItem)
    })

    set({ items: updatedItems, unavailable, syncStatus: 'success' })
  },
  
  addProduct: (productId, displayPriceAtAdd, availableStockAtAdd) => {
    const items = get().items
    const existing = items.find((item) => item.productId === productId)
    if (existing) {
      set({ items: items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) })
    } else {
      set({ items: [...items, { productId, quantity: 1, displayPriceAtAdd, availableStockAtAdd }] })
    }
  },
  
  removeProduct: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) })
  },
  
  incrementQuantity: (productId) => {
    set({ items: get().items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) })
  },
  
  decrementQuantity: (productId) => {
    set({ items: get().items.map((item) => {
      if (item.productId === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 }
      }
      return item
    }).filter((item) => item.quantity > 0) })
  },
}))

// Selector for total cost
const selectTotalCost = (state: BasketState) => 
  state.items.reduce((sum, item) => sum + ((item.displayPrice ?? item.displayPriceAtAdd) * item.quantity), 0)
```

## Notes
- updateBasketFromCMSPayload orchestrates sync process with extracted comparison functions
- comparePrices compares stored displayPriceAtAdd with current CMS displayPrice
- compareStock compares stored quantity with current CMS availableStock
- checkAvailability determines if product is unavailable
- CMS provides price_data.unit_amount in cents, converted to dollars (unit_amount / 100) for comparison
- Stored displayPriceAtAdd is in dollars (user-visible from non-local-basket)
- Metadata stores old values for comparison display (strikethrough)
- CMS availableStock calculated as stock - reservedStock
- Unavailable items moved to separate array for separate display
- Sync status controls loading states and checkout button state
- Comparison logic handles price and stock discrepancies separately
