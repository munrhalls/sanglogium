import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { z } from 'zod'

// Zod schema for validation
const BasketItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  displayPriceAtAdd: z.number().nonnegative(),
  availableStockAtAdd: z.number().nonnegative()
})

// Infer TypeScript types from Zod schema
type BasketItem = z.infer<typeof BasketItemSchema>

interface BasketState {
  items: BasketItem[]
}

interface BasketActions {
  addProduct: (productId: string, displayPriceAtAdd: number, availableStockAtAdd: number) => void
  removeProduct: (productId: string) => void
  incrementQuantity: (productId: string) => void
  decrementQuantity: (productId: string) => void
}

type BasketStore = BasketState & BasketActions

// Custom storage with fallback to sessionStorage
const createFallbackStorage = () => {
  const storage = {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name)
      } catch (e) {
        console.warn('localStorage getItem failed, trying sessionStorage', e)
        try {
          return sessionStorage.getItem(name)
        } catch (e2) {
          console.warn('sessionStorage getItem failed', e2)
          return null
        }
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value)
      } catch (e) {
        console.warn('localStorage setItem failed, trying sessionStorage', e)
        try {
          sessionStorage.setItem(name, value)
        } catch (e2) {
          console.warn('sessionStorage setItem failed, graceful degradation', e2)
        }
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name)
      } catch (e) {
        console.warn('localStorage removeItem failed, trying sessionStorage', e)
        try {
          sessionStorage.removeItem(name)
        } catch (e2) {
          console.warn('sessionStorage removeItem failed', e2)
        }
      }
    }
  }
  return storage
}

const useBasketStore = create<BasketStore>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct: (productId, displayPriceAtAdd, availableStockAtAdd) => {
        // Input validation using Zod schema
        const result = BasketItemSchema.safeParse({
          productId,
          quantity: 1,
          displayPriceAtAdd,
          availableStockAtAdd
        })
        if (!result.success) {
          console.error('Invalid input:', result.error)
          return
        }

        const items = get().items
        const existing = items.find((item) => item.productId === productId)
        if (existing) {
          set({ items: items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) })
        } else {
          set({ items: [...items, result.data] })
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
          if (item.productId === productId) {
            return { ...item, quantity: item.quantity - 1 }
          }
          return item
        }).filter((item) => item.quantity > 0) })
      },
    }),
    {
      name: 'basket-storage',
      storage: createJSONStorage(() => createFallbackStorage()),
      onRehydrateStorage: () => (state) => {
        // Hydration validation using Zod schema
        if (state) {
          const result = z.array(BasketItemSchema).safeParse(state.items)
          if (!result.success) {
            console.error('Invalid basket state from storage, resetting to empty:', result.error)
            state.items = []
          }
        }
      },
    }
  )
)

// Selector for total count
export const selectTotalItemsCount = (state: BasketState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)

export default useBasketStore
