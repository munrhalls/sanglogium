"use client";

import { PreCheckoutState, PreCheckoutContext } from "@/store/preCheckout/preCheckoutTypes";
import NetworkErrorBanner from "./NetworkErrorBanner";
import ValidationErrorBanner from "./ValidationErrorBanner";

interface CheckoutPanelProps {
  state: PreCheckoutState;
  context: PreCheckoutContext;
  checkout: () => void;
  retry: () => void;
  acceptAndContinue: () => void;
  reset: () => void;
  isAccepting?: boolean;
}

export default function CheckoutPanel({
  state,
  context,
  checkout,
  retry,
  acceptAndContinue,
  reset,
  isAccepting = false,
}: CheckoutPanelProps) {
  return (
    <div className="flex flex-col gap-3 lg-desktop:gap-4 lg-touch:gap-4 w-full">
      {/* IDLE State */}
      <div
        data-testid="panel-idle"
        style={{ display: state === "IDLE" ? "block" : "none" }}
      >
        <button onClick={checkout} className="btn-primary block text-center mt-4 lg-desktop:mt-6 lg-touch:mt-6 py-4 lg-desktop:py-3 lg-touch:py-3 px-4 lg-desktop:px-6 lg-touch:px-6 uppercase tracking-editorial type-caption lg-desktop:type-body lg-touch:type-body font-bold text-brand-700 w-full">
          Checkout
        </button>
      </div>

      {/* PROCESSING State */}
      <div
        data-testid="panel-processing"
        style={{ display: state === "PROCESSING" ? "block" : "none" }}
      >
        <button disabled className="btn-primary block text-center mt-4 lg-desktop:mt-6 lg-touch:mt-6 py-4 lg-desktop:py-3 lg-touch:py-3 px-4 lg-desktop:px-6 lg-touch:px-6 uppercase tracking-editorial type-caption lg-desktop:type-body lg-touch:type-body font-bold text-brand-700 w-full opacity-50 cursor-not-allowed">
          Processing...
        </button>
      </div>

      {/* ERROR_NETWORK State */}
      <div
        data-testid="panel-error-network"
        style={{ display: state === "ERROR_NETWORK" ? "block" : "none" }}
      >
        <NetworkErrorBanner />
        <button onClick={retry} className="btn-primary block text-center mt-4 lg-desktop:mt-6 lg-touch:mt-6 py-4 lg-desktop:py-3 lg-touch:py-3 px-4 lg-desktop:px-6 lg-touch:px-6 uppercase tracking-editorial type-caption lg-desktop:type-body lg-touch:type-body font-bold text-brand-700 w-full">
          Retry
        </button>
      </div>

      {/* ERROR_VALIDATION State */}
      <div
        data-testid="panel-error-validation"
        style={{ display: state === "ERROR_VALIDATION" ? "block" : "none" }}
      >
        {context.discrepancy && <ValidationErrorBanner discrepancy={context.discrepancy} />}
        {context.discrepancy?.type === "STRIPE_CONFIG" ? (
          <>
            <button className="btn-secondary block text-center mt-3 py-4 lg-desktop:py-3 lg-touch:py-3 w-full">
              Contact support
            </button>
            <button onClick={reset} className="btn-secondary block text-center mt-3 py-4 lg-desktop:py-3 lg-touch:py-3 w-full">
              Update basket
            </button>
          </>
        ) : (
          <>
            <button
              onClick={acceptAndContinue}
              disabled={isAccepting}
              className="btn-primary block text-center mt-4 lg-desktop:mt-6 lg-touch:mt-6 py-4 lg-desktop:py-3 lg-touch:py-3 px-4 lg-desktop:px-6 lg-touch:px-6 uppercase tracking-editorial type-caption lg-desktop:type-body lg-touch:type-body font-bold text-brand-700 w-full"
            >
              {isAccepting ? "Accepting..." : "Accept & Continue"}
            </button>
            <button onClick={reset} className="btn-secondary block text-center mt-3 py-4 lg-desktop:py-3 lg-touch:py-3 w-full">
              Update basket
            </button>
          </>
        )}
      </div>

      {/* SUCCESS State */}
      <div
        data-testid="panel-success"
        style={{ display: state === "SUCCESS" ? "block" : "none" }}
      >
        <p className="type-caption lg-desktop:type-body lg-touch:type-body text-secondary">Redirecting to payment...</p>
      </div>
    </div>
  );
}
