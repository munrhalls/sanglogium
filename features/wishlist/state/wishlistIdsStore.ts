import { create } from "zustand";
import { getWishlistIdsAction } from "@/features/wishlist/actions/getWishlistIdsAction";

interface WishlistIdsStore {
  /** null until the one load has finished; [] for a signed-out visitor. */
  ids: ReadonlySet<string> | null;
  load: () => Promise<void>;
  setIn: (productId: string, inWishlist: boolean) => void;
}

let loading: Promise<void> | null = null;

export const useWishlistIds = create<WishlistIdsStore>((set) => ({
  ids: null,
  load: () => {
    loading ??= getWishlistIdsAction()
      .then((ids) => set({ ids: new Set(ids) }))
      .catch(() => {
        loading = null;
      });
    return loading;
  },
  setIn: (productId, inWishlist) =>
    set((state) => {
      if (!state.ids) return state;
      const next = new Set(state.ids);
      if (inWishlist) next.add(productId);
      else next.delete(productId);
      return { ids: next };
    }),
}));
