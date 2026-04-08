import { useBasketStore, selectIsCheckoutEnabled } from "@/store/store";
import { useCheckoutStore } from "@/store/checkout";
import { validateBasket } from "@/app/actions/checkout/validateBasket";
import { useTransition } from "react";

export default function CheckoutButton() {
    const [isPending, startTransition] = useTransition();
    const isCheckoutEnabled = useBasketStore(selectIsCheckoutEnabled);

    const checkoutStatus = useCheckoutStore((state) => state.status);
    const nextCheckoutStep = useCheckoutStore((state) => state.nextStep);

    const handleCheckout = function () {
        startTransition(async () => {
            const basket = useBasketStore.getState();
            // Generate simple idempotency key
            const idempotencyKey = `checkout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const response = await validateBasket({
                items: basket.items.map(item => ({
                    _id: item._id,
                    quantity: item.quantity
                }))
            }, idempotencyKey);

            if (response.success) {
                nextCheckoutStep();
            } else {
                // Handle validation failures
                console.error('Checkout failed:', response);
                // TODO: Show error to user
            }
        });
    }

    return <div>
        {isCheckoutEnabled ? (
            <>
                {checkoutStatus === "IDLE" && (
                    <button
                        onClick={handleCheckout}
                        disabled={isPending}
                        data-testid="checkout-button"
                        className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold text-brand-700"
                    >
                        {isPending ? "Connecting..." : "Checkout"}
                    </button>
                )}
                {checkoutStatus !== "IDLE" && (
                    <div className="mt-6 text-center">Processing...</div>
                )}
            </>
        ) : (
            <button
                disabled
                className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold opacity-50 cursor-not-allowed text-brand-700"
            >
                Checkout
            </button>
        )}
    </div>
}