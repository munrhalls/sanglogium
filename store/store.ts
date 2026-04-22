import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BasketItem } from "@/app/(store)/basket/basket.types";

interface PersistedBasketItem {
  _id: string;
  quantity: number;
  stock: number;
}

interface BasketState {
  basket: BasketItem[];
  _hasHydrated: boolean;
  addItem: (item: PersistedBasketItem) => void;
  removeItem: (_id: string) => void;
  updateQuantity: (_id: string, quantity: number) => void;
  updateItemPrice: (_id: string, price: number) => void;
  updateItemQuantity: (_id: string, quantity: number) => void;
  clearBasket: () => void;
  setBasket: (basket: BasketItem[]) => void;
}

export const selectBasketTotal = (state: BasketState) =>
  state.basket.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);

export const selectBasketCount = (state: BasketState) =>
  state.basket.reduce((sum, item) => sum + item.quantity, 0);

export const selectIsCheckoutEnabled = (state: BasketState) => {
  if (state.basket.length === 0) return false;
  return state.basket.every((item) => item.quantity > 0 && item.stock > 0);
};

export const selectHasHydrated = (state: BasketState) => state._hasHydrated;

export const selectBasketItem = (id: string) => (state: BasketState) =>
  state.basket.find((i) => i._id === id);

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      basket: [],
      _hasHydrated: false,
      addItem: (item) => {
        if (!item || !item._id || typeof item.quantity !== "number") {
          return;
        }
        const basket = get().basket;
        const existing = basket.find((i) => i._id === item._id);
        if (existing) {
          const newQuantity = existing.quantity + item.quantity;
          set({
            basket: basket.map((i) =>
              i._id === item._id ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {
          set({
            basket: [...basket, { ...item, quantity: item.quantity }],
          });
        }
      },
      removeItem: (_id) => {
        const basket = get().basket;
        set({ basket: basket.filter((i) => i._id !== _id) });
      },
      updateQuantity: (_id, quantity) => {
        const basket = get().basket;
        set({
          basket: basket.map((i) => {
            if (i._id === _id) {
              let safeQuantity = Math.max(1, quantity);
              safeQuantity = Math.min(safeQuantity, i.stock);
              return { ...i, quantity: safeQuantity };
            }
            return i;
          }),
        });
      },
      updateItemPrice: (_id, price) => {
        const basket = get().basket;
        set({
          basket: basket.map((i) => {
            if (i._id === _id) {
              return { ...i, displayPrice: price };
            }
            return i;
          }),
        });
      },
      updateItemQuantity: (_id, quantity) => {
        const basket = get().basket;
        set({
          basket: basket.map((i) => {
            if (i._id === _id) {
              let safeQuantity = Math.max(1, quantity);
              safeQuantity = Math.min(safeQuantity, i.stock);
              return { ...i, quantity: safeQuantity };
            }
            return i;
          }),
        });
      },
      clearBasket: () => set({ basket: [] }),
      setBasket: (basket) => set({ basket }),
    }),
    {
      name: "basket-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { basket: [], _hasHydrated: false };
        }
        const state = persistedState as { basket?: unknown[] };
        if (!state.basket || !Array.isArray(state.basket)) {
          return { basket: [], _hasHydrated: false };
        }
        // Version 2: Only persist _id and quantity
        if (version === 0) {
          // Migrate from version 0 (full data) to version 1 (displayPrice)
          const migratedBasket = state.basket.map((item: unknown) => {
            if (!item || typeof item !== "object") return null;
            const i = item as Record<string, unknown>;
            return {
              _id: String(i._id || ""),
              name: String(i.name || ""),
              displayPrice: typeof i.displayPrice === "number" ? i.displayPrice : typeof i.price === "number" ? i.price : 0,
              stock: typeof i.stock === "number" ? i.stock : 0,
              quantity: typeof i.quantity === "number" ? i.quantity : 1,
              image: String(i.image || ""),
              slug: String(i.slug || i._id || ""),
            };
          }).filter((item): item is BasketItem => item !== null && item._id !== "");
          return { basket: migratedBasket, _hasHydrated: false };
        }
        // Version 1 to 2: Strip down to _id and quantity only
        const minimalBasket = state.basket.map((item: unknown) => {
          if (!item || typeof item !== "object") return null;
          const i = item as Record<string, unknown>;
          return {
            _id: String(i._id || ""),
            quantity: typeof i.quantity === "number" ? i.quantity : 1,
          };
        }).filter((item): item is PersistedBasketItem => item !== null && item._id !== "");
        return { basket: minimalBasket, _hasHydrated: false };
      },
      partialize: (state) => ({
        basket: state.basket.map((item) => ({ _id: item._id, quantity: item.quantity })),
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state._hasHydrated = true;
          }
        };
      },
    }
  )
);
