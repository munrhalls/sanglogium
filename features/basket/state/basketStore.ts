import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface BasketItem {
  productId: string;
  quantity: number;
}

// A saved basket item is usable only with a non-empty product id and a positive whole quantity.
const isBasketItem = (value: unknown): value is BasketItem => {
  if (typeof value !== "object" || value === null) return false;
  const { productId, quantity } = value as Record<string, unknown>;
  return typeof productId === "string" && productId.length > 0 && Number.isInteger(quantity) && (quantity as number) > 0;
};

interface BasketState {
  items: BasketItem[];
  _hasHydrated: boolean;
}

interface BasketActions {
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
}

type BasketStore = BasketState & BasketActions;

// Custom storage with fallback to sessionStorage
const createFallbackStorage = () => {
  const storage = {
    getItem: (name: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(name);
        }
      } catch (e) {
        console.warn("localStorage getItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          return sessionStorage.getItem(name);
        }
      } catch (e2) {
        console.warn("sessionStorage getItem failed", e2);
      }
      return null;
    },
    setItem: (name: string, value: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(name, value);
        }
      } catch (e) {
        console.warn("localStorage setItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(name, value);
        }
      } catch (e2) {
        console.warn("sessionStorage setItem failed, graceful degradation", e2);
      }
    },
    removeItem: (name: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(name);
        }
      } catch (e) {
        console.warn(
          "localStorage removeItem failed, trying sessionStorage",
          e,
        );
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(name);
        }
      } catch (e2) {
        console.warn("sessionStorage removeItem failed", e2);
      }
    },
  };
  return storage;
};

const useBasketStore = create<BasketStore>()(
  persist(
    (set, get): BasketStore => ({
      items: [] as BasketItem[],
      _hasHydrated: false,
      addProduct: (productId) => {
        const newItem = { productId, quantity: 1 };
        if (!isBasketItem(newItem)) {
          console.error("Invalid input:", newItem);
          return;
        }
        const items = get().items;
        const existing = items.find((item) => item.productId === productId);
        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      removeProduct: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },
      incrementQuantity: (productId) => {
        set({
          items: get().items.map((item) => {
            if (item.productId === productId) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        });
      },
      decrementQuantity: (productId) => {
        set({
          items: get()
            .items.map((item) => {
              if (item.productId === productId) {
                return { ...item, quantity: item.quantity - 1 };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        });
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.productId !== productId) });
          return;
        }
        const newItem = { productId, quantity };
        if (!isBasketItem(newItem)) {
          console.error("Invalid quantity:", newItem);
          return;
        }
        const items = get().items;
        const existing = items.find((item) => item.productId === productId);
        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: newItem.quantity }
                : item,
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      clear: () => {
        set({ items: [] });
      },
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "basket-storage",
      storage: createJSONStorage(() => createFallbackStorage()),
      onRehydrateStorage: () => (state) => {
        // Set hydration flag to prevent hydration errors in Next.js SSR
        state?.setHasHydrated(true);
        // Restored items must all be usable, or the basket starts empty.
        if (state) {
          if (!Array.isArray(state.items) || !state.items.every(isBasketItem)) {
            console.error("Invalid basket state from storage, resetting to empty:", state.items);
            state.items = [];
          }
        }
      },
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);

export const selectTotalItemsCount = (state: BasketState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectHasHydrated = (state: BasketState) => state._hasHydrated;

export default useBasketStore;
