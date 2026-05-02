export interface BasketItemMetadata {
  old_price?: number
  old_availableStock?: number
}

export interface BasketItem {
  productId: string
  quantity: number
  price_data: { currency: string; unit_amount: number }
  availableStock?: number
  metadata?: BasketItemMetadata // If present, item is "adjusted"
}

export type SyncStatus = 'idle' | 'loading' | 'error' | 'success'

interface BasketState {
  items: BasketItem[]
  unavailable: BasketItem[]
  hasHydrated: boolean
  syncStatus: SyncStatus
}

interface BasketActions {
  setSyncStatus: (status: SyncStatus) => void
  syncWithCMS: (cmsProducts: Array<{ _id: string; price_data: { currency: string; unit_amount: number }; stock: number; reservedStock: number }>) => void
  addProduct: (productId: string) => void
  removeProduct: (productId: string) => void
  incrementQuantity: (productId: string) => void
  decrementQuantity: (productId: string) => void
}

// Selector for derived state (outside actions)
export const selectTotalItemsCount = (state: BasketState) => 
  state.items.reduce((sum, item) => sum + item.quantity, 0)

export type BasketStore = BasketState & BasketActions