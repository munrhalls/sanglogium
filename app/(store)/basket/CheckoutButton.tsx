import { useBasketStore, selectIsCheckoutEnabled } from "@/store/store";
import { usePreCheckout } from "@/app/components/features/basket/checkout/usePreCheckout";
import { logEventDispatch } from "@/app/components/features/basket/checkout/useLogger";

export default function CheckoutButton() {
    const isCheckoutEnabled = useBasketStore(selectIsCheckoutEnabled);
    const { state, checkout } = usePreCheckout();

    const handleCheckout = function () {
        console.log(`=== USER CLICKED CHECKOUT ===`);
        logEventDispatch("START_VALIDATION", undefined, "CheckoutButton");

        checkout();
    };

    return <div>
        {isCheckoutEnabled ? (
            <>
                {state === "IDLE" && (
                    <button
                        onClick={handleCheckout}
                        data-testid="checkout-button"
                        className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold text-brand-700"
                    >
                        Checkout
                    </button>
                )}
                {state === "PROCESSING" && (
                    <div className="mt-6 text-center">Connecting...</div>
                )}
                {state === "ERROR_NETWORK" && (
                    <div className="mt-6 text-center text-red-600">Network error. Please try again.</div>
                )}
                {state === "ERROR_VALIDATION" && (
                    <div className="mt-6 text-center text-red-600">Validation failed. Please review your basket.</div>
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