import { useBasketStore, selectIsCheckoutEnabled } from "@/store/store";
import { useCheckoutStore } from "@/store/checkout";
import { processMockCheckout } from "@/app/actions/checkout/checkoutAction";
import { useTransition } from "react";

export default function CheckoutButton() {
    const [isPending, startTransition] = useTransition();
    const isCheckoutEnabled = useBasketStore(selectIsCheckoutEnabled);

    const checkoutStatus = useCheckoutStore((state) => state.status);
    const nextCheckoutStep = useCheckoutStore((state) => state.nextStep);

    const handleCheckout = function () {
        startTransition(async () => {
            const response = await processMockCheckout();

            if (response.success) {
                nextCheckoutStep();
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