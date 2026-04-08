import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BasketItem } from "@/app/(store)/basket/basket.types";

interface BasketState {
  basket: BasketItem[];
  _hasHydrated: boolean;
  addItem: (item: BasketItem) => void;
  removeItem: (_id: string) => void;
  updateQuantity: (_id: string, quantity: number) => void;
  updateItemPrice: (_id: string, price: number) => void;
  updateItemQuantity: (_id: string, quantity: number) => void;
  clearBasket: () => void;
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
        // TODO: Remove console log - temporary for manual verification
        console.log('Basket store addItem called with:', item);
        if (
          !item ||
          typeof item !== "object" ||
          !item._id ||
          !item.name ||
          typeof item.displayPrice !== "number" ||
          typeof item.stock !== "number" ||
          !item.image ||
          !item.slug
        ) {
          console.log('Item validation failed, returning');
          return;
        }
        const basket = get().basket;
        const existing = basket.find((i) => i._id === item._id);
        if (existing) {
          // Update stock from caller data
          const updatedStock = item.stock;
          // Increment by requested quantity, clamped to stock
          const newQuantity = Math.min(
            existing.quantity + item.quantity,
            updatedStock
          );
          set({
            basket: basket.map((i) =>
              i._id === item._id
                ? { ...i, quantity: newQuantity, stock: updatedStock }
                : i
            ),
          });
        } else {
          // New item: use requested quantity clamped to stock
          const initialQuantity = Math.min(item.quantity, item.stock);
          if (initialQuantity > 0) {
            set({
              basket: [...basket, { ...item, quantity: initialQuantity }],
            });
          }
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
    }),
    {
      name: "basket-storage",
      version: 1,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { basket: [], _hasHydrated: false };
        }
        const state = persistedState as { basket?: unknown[] };
        if (!state.basket || !Array.isArray(state.basket)) {
          return { basket: [], _hasHydrated: false };
        }
        // Migrate old items: price -> displayPrice, add slug fallback
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
      },
      partialize: (state) => ({ basket: state.basket }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Validate rehydrated items
            const validBasket = state.basket.filter((item) => {
              return (
                item &&
                typeof item._id === "string" &&
                item._id !== "" &&
                typeof item.name === "string" &&
                typeof item.displayPrice === "number" &&
                typeof item.image === "string" &&
                item.image !== "" &&
                typeof item.slug === "string" &&
                item.slug !== ""
              );
            });
            state.basket = validBasket;
            state._hasHydrated = true;
          }
        };
      },
    }
  )
);
