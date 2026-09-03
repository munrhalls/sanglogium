"use client";
import { useState } from "react";
import Link from "next/link";
import { saveShippingAction } from "@/app/actions/checkout";
import { formatDeliveryEstimate } from "@/lib/utils/formatting";
import { formatPriceMajor } from "@/lib/utils/price";
import { cn } from "@/lib/utils/tailwind";
import CheckoutStepper from "../_components/CheckoutStepper";

interface ShippingOption {
  provider: string;
  servicelevel: {
    name: string;
  };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

interface ShippingPageClientProps {
  shippingOptions: ShippingOption[];
  traceId: string;
  error?: string;
}

export default function ShippingPageClient({
  shippingOptions,
  traceId,
  error: initialError,
}: ShippingPageClientProps) {
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const selectedOption = shippingOptions.find((o) => o.rateId === selectedRateId) ?? null;

  const handleContinue = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    setError(null);

    // Log shipping selection (frontend) — fire-and-forget, don't block navigation
    fetch("/api/trace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        traceId,
        step: "shipping_option_selected",
        data: {
          rateId: selectedOption.rateId,
          provider: selectedOption.provider,
          service: selectedOption.servicelevel.name,
          amount: selectedOption.amount,
        },
      }),
    }).catch(() => {});

    try {
      await saveShippingAction(
        selectedOption.rateId,
        Math.round(selectedOption.amount * 100),
        selectedOption.servicelevel.name,
        selectedOption.provider,
        selectedOption.estimatedDays
      );
    } catch (err) {
      // NEVER intercept Next.js redirect errors — let the framework handle navigation
      if (err instanceof Error && (err as any).digest === "NEXT_REDIRECT") {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Nie udało się zapisać wyboru dostawy");
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const isCtaDisabled = !selectedOption || isSubmitting;

  const hasOptions = shippingOptions.length > 0;

  return (
    /*
     * Layout: two-layer — scrollable content + sticky mobile CTA.
     * Desktop: content constrained to max-w-2xl, CTA inline below list with mt-8.
     * Mobile: list scrollable, CTA fixed to viewport bottom (pb-28 on list ensures
     *         content is never hidden behind the sticky bar).
     */
    <div className="relative">
      {/* Scrollable content area */}
      <div className="max-w-2xl mx-auto w-full px-4 md:px-0 pt-10 pb-28 md:pb-16">

        <CheckoutStepper currentStep={2} />

        <h1 className="type-section-hed mb-8">Wybierz metodę dostawy</h1>

        {/* Inline error banner with retry action */}
        {error && (
          <div className="mb-6 rounded border border-error-500/30 bg-error-500/10 p-4">
            <p className="type-body text-error-500 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Inline empty state — no full-page takeover */}
        {!hasOptions && !error && (
          <div className="mb-6 rounded border border-border-secondary bg-surface-subtle p-4">
            <p className="type-body text-text-secondary">
              Brak dostępnych opcji dostawy.
            </p>
          </div>
        )}

        {/* Shipping option list — each option is a <label> wrapping a hidden radio input.
            The entire card area is clickable/tappable (≥48px touch target on mobile). */}
        {hasOptions && (
          <>
            <div className="space-y-3" role="radiogroup" aria-label="Opcje dostawy">
              {shippingOptions.map((option) => {
                const isSelected = selectedRateId === option.rateId;
                return (
                  <label
                    key={option.rateId}
                    htmlFor={`shipping-${option.rateId}`}
                    className={cn(
                      "card-base cursor-pointer flex items-start md:items-center gap-4",
                      "transition-all duration-200 ease-out",
                      "focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-2 focus-within:ring-offset-surface-page",
                      isSelected
                        ? "border-brand-400 shadow-[0_0_0_1px_theme(colors.brand.400),0_4px_20px_rgba(246,227,213,0.08)] bg-surface-subtle"
                        : "pointer-fine:hover:border-brand-400/50 pointer-fine:hover:shadow-cardHoverDark"
                    )}
                  >
                    {/* Visually hidden native radio — keyboard + screen-reader accessible */}
                    <input
                      id={`shipping-${option.rateId}`}
                      type="radio"
                      name="shippingRate"
                      value={option.rateId}
                      checked={isSelected}
                      onChange={() => setSelectedRateId(option.rateId)}
                      className="sr-only"
                    />

                    {/* Custom checkbox indicator — 20px, design-system aligned */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors duration-200",
                        isSelected
                          ? "border-brand-400 bg-brand-400"
                          : "border-border-primary bg-transparent"
                      )}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-brand-700"
                        >
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    {/* Content area — three-row vertical stack for fail-safe mobile layout */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      {/* Row 1: Provider + Price */}
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="type-card-title">{option.provider}</p>
                        <p className="type-price shrink-0 text-right whitespace-nowrap">
                          {formatPriceMajor(option.amount)}
                        </p>
                      </div>

                      {/* Row 2: Service description — full width */}
                      <p className="type-caption">{option.servicelevel.name}</p>

                      {/* Row 3: Delivery time — full width, left-aligned, muted */}
                      <p className="type-caption text-text-secondary">
                        {formatDeliveryEstimate(option.estimatedDays)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Selected summary line below list */}
            {selectedOption && (
              <div className="mt-4 rounded-lg border border-brand-400/30 bg-surface-subtle px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="type-caption text-text-secondary flex-shrink-0">Wybrano:</span>
                  <span className="type-card-title text-text-body truncate">
                    {selectedOption.provider} — {selectedOption.servicelevel.name}
                  </span>
                </div>
                <span className="type-price flex-shrink-0">
                  {formatPriceMajor(selectedOption.amount)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Desktop CTA — inline, below list */}
        <button
          id="shipping-continue-desktop"
          onClick={handleContinue}
          disabled={isCtaDisabled}
          className="btn-cart-large hidden md:flex w-full justify-center mt-8"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="inline-block w-4 h-4 rounded-full border-2 border-brand-700/40 border-t-brand-700 animate-spin"
              />
              Przetwarzanie…
            </>
          ) : (
            "Przejdź do płatności"
          )}
        </button>
      </div>

      {/* Mobile sticky CTA — fixed viewport bottom with upward shadow */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 py-3 bg-surface-page border-t border-border-secondary shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <button
          id="shipping-continue-mobile"
          onClick={handleContinue}
          disabled={isCtaDisabled}
          className="btn-cart-large flex w-full justify-center"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="inline-block w-4 h-4 rounded-full border-2 border-brand-700/40 border-t-brand-700 animate-spin"
              />
              Przetwarzanie…
            </>
          ) : (
            "Przejdź do płatności"
          )}
        </button>
      </div>
    </div>
  );
}
