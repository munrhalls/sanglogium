"use client";

interface CheckoutPanelProps {
  state: 'idle' | 'processing' | 'complete';
  errorMessage: string | null;
  checkout: () => void;
  disabled?: boolean;
}

export default function CheckoutPanel({
  state,
  errorMessage,
  checkout,
  disabled = false,
}: CheckoutPanelProps) {
  return (
    <div className="flex flex-col gap-3 lg-desktop:gap-4 lg-touch:gap-4 w-full">
      {/* IDLE State */}
      {state === "idle" && (
        <button
          onClick={checkout}
          disabled={disabled}
          data-testid="panel-idle"
          className={`btn-primary block text-center mt-4 lg-desktop:mt-6 lg-touch:mt-6 py-4 lg-desktop:py-3 lg-touch:py-3 px-4 lg-desktop:px-6 lg-touch:px-6 uppercase tracking-editorial type-caption lg-desktop:type-body lg-touch:type-body font-bold text-brand-700 w-full ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {disabled ? 'Basket Issues - Fix Required' : 'Checkout'}
        </button>
      )}

      {/* PROCESSING State */}
      {state === "processing" && (
        <button
          disabled
          data-testid="panel-processing"
          className="btn-primary block text-center mt-4 lg-desktop:mt-6 lg-touch:mt-6 py-4 lg-desktop:py-3 lg-touch:py-3 px-4 lg-desktop:px-6 lg-touch:px-6 uppercase tracking-editorial type-caption lg-desktop:type-body lg-touch:type-body font-bold text-brand-700 w-full opacity-50 cursor-not-allowed"
        >
          Processing...
        </button>
      )}

      {/* COMPLETE State */}
      {state === "complete" && (
        <div data-testid="panel-complete">
          <p className="type-caption lg-desktop:type-body lg-touch:type-body text-secondary">Checkout complete!</p>
        </div>
      )}

      {/* Error display (when errorMessage exists) */}
      {errorMessage && state === "idle" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{errorMessage}</p>
          <button onClick={checkout} className="btn-primary block text-center mt-3 py-3 w-full">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
