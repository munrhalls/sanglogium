import { useBasketStore } from "@/store/store";
import { useCheckoutStore } from "@/store/checkout";
import { useEffect } from "react";
const { setState: set } = useCheckoutStore;
export default function useInitializeCheckoutCart() {
  const basketItems = useBasketStore((state) => state.basket);
  useEffect(() => {
    if (basketItems.length > 0) {
      const formattedItems = basketItems.map((item) => ({
        id: item._id,
        name: item.name,
        price: item.displayPrice,
        quantity: item.quantity,
      }));
      set({ cartItems: formattedItems });
    }
  }, [basketItems]);
  const cartItems = useCheckoutStore((s) => s.cartItems);
  return cartItems;
}
