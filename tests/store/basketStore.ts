export interface BasketItemMetadata {
  old_price?: number
  old_availableStock?: number
}

export interface BasketItem {
  productId: string
  quantity: number
  displayPrice: number
  availableStock?: number 
  metadata?: BasketItemMetadata // If present, item is "adjusted"
}

export interface UnavailablePartition {
  unavailable: BasketItem[]
}

export type SyncResult = [BasketItem[], UnavailablePartition]

interface BasketState {
  items: BasketItem[]
  hasHydrated: boolean
}

interface BasketActions {
  syncFreshness: () => Promise<SyncResult>
  addProduct: (productId: string) => void
  removeProduct: (productId: string) => void
  incrementQuantity: (productId: string, stockLimit: number) => void
  decrementQuantity: (productId: string) => void
  selectTotalItemsCount: () => number
}

export type BasketStore = BasketState & BasketActions