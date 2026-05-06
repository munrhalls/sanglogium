# Types: Basket Page

```mermaid
classDiagram
    class CmsProduct {
        +string _id
        +price_data: object
        +number stock
        +number reservedStock
    }

    class BasketItem {
        +string productId
        +number quantity
        +number displayPriceAtAdd
        +number availableStockAtAdd
    }

    class SyncResult {
        +number currentPrice
        +number currentAvailableStock
        +boolean hasPriceChange
        +boolean hasStockChange
        +number adjustedQuantity
    }

    class SyncResults {
        +Record~string, SyncResult~
    }

    class BasketState {
        +BasketItem[] items
        +BasketItem[] unavailable
        +SyncResults syncResults
        +boolean hasHydrated
        +SyncStatus syncStatus
    }

    class BasketActions {
        +setSyncStatus(status)
        +updateBasketFromCMSPayload(cmsProducts)
        +addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
        +removeProduct(productId)
        +incrementQuantity(productId)
        +decrementQuantity(productId)
    }

    class BasketStore {
        +BasketState
        +BasketActions
    }

    class SyncStatus {
        <<enumeration>>
        idle
        loading
        error
        success
    }

    CmsProduct --> SyncResult : compared with
    BasketItem --> SyncResult : mapped to
    SyncResult --> SyncResults : stored in
    BasketState --> BasketItem : contains
    BasketState --> SyncResults : contains
    BasketStore --> BasketState : includes
    BasketStore --> BasketActions : includes
    BasketState --> SyncStatus : uses
```

```typescript
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

// Zod schema for BasketItem (pure snapshot of what user added)
const BasketItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  displayPriceAtAdd: z.number().nonnegative(),
  availableStockAtAdd: z.number().nonnegative()
})

// Infer TypeScript types from Zod schema
type BasketItem = z.infer<typeof BasketItemSchema>

// Sync results state (separate from basket snapshot)
type SyncResult = {
  currentPrice: number
  currentAvailableStock: number
  hasPriceChange: boolean
  hasStockChange: boolean
  adjustedQuantity: number
}

type SyncResults = Record<string, SyncResult>

type SyncStatus = 'idle' | 'loading' | 'error' | 'success'

interface BasketState {
  items: BasketItem[]
  unavailable: BasketItem[]
  syncResults: SyncResults
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
```
