"use client";
import { useState } from "react";
import Link from "next/link";
import { saveShippingAction } from "@/app/actions/checkout";
import { formatPolishPrice, formatDeliveryEstimate } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/tailwind";

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

const CHECK_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function CheckoutProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: "Adres", href: "/checkout/address" },
    { label: "Dostawa", href: "/checkout/shipping" },
    { label: "Płatność", href: "/checkout/payment" },
  ];

  return (
    <nav aria-label="Postęp zamówienia" className="mb-8">
      {/* Mobile: circles with numbers / checkmarks */}
      <ol className="flex md:hidden items-center justify-center gap-1">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-1">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                i === currentStep
                  ? "bg-accent-500 text-brand-700"
                  : i < currentStep
                    ? "bg-brand-400 text-brand-700"
                    : "bg-surface-elevated text-text-caption border border-border-secondary"
              )}
            >
              {i < currentStep ? CHECK_ICON : i + 1}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "w-6 h-px transition-colors",
                  i < currentStep ? "bg-brand-400" : "bg-border-secondary"
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {/* Desktop: full labels with arrows */}
      <ol className="hidden md:flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-2">
            {i < currentStep ? (
              <Link
                href={step.href}
                className="type-overline text-text-caption hover:text-text-body transition-colors"
              >
                {step.label}
              </Link>
            ) : i === currentStep ? (
              <span className="type-overline text-accent-500">{step.label}</span>
            ) : (
              <span className="type-overline text-text-caption">{step.label}</span>
            )}
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "transition-colors",
                  i < currentStep ? "text-brand-400" : "text-border-primary"
                )}
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
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
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
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

        <CheckoutProgress currentStep={1} />

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
                      // Base card
                      "flex items-center justify-between gap-4 cursor-pointer",
                      "rounded-lg border px-4 py-4 md:py-5",
                      "transition-all duration-200 ease-out",
                      // Focus state (keyboard navigation)
                      "focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-2 focus-within:ring-offset-surface-page",
                      // Selected vs idle
                      isSelected
                        ? "border-brand-400 shadow-[0_0_0_1px_theme(colors.brand.400),0_4px_20px_rgba(246,227,213,0.08)] bg-surface-subtle"
                        : "border-border-secondary shadow-cardDark pointer-fine:hover:border-brand-400/50 pointer-fine:hover:shadow-cardHoverDark"
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

                    {/* Custom radio indicator — 20px */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200",
                        isSelected ? "border-brand-400" : "border-border-primary"
                      )}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                      )}
                    </span>

                    {/* Carrier + service name */}
                    <div className="flex-1 min-w-0">
                      <p className="type-card-title">{option.provider}</p>
                      <p className="type-metadata mt-0.5 truncate">
                        {option.servicelevel.name}
                      </p>
                    </div>

                    {/* Price + delivery time — right-aligned, fixed min-width to prevent truncation */}
                    <div className="text-right flex-shrink-0 min-w-[88px]">
                      <p className="type-price">{formatPolishPrice(option.amount)}</p>
                      <p className="type-metadata mt-0.5">
                        {formatDeliveryEstimate(option.estimatedDays)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Selected summary line below list */}
            {selectedOption && (
              <div className="mt-4 rounded-lg border border-brand-400/30 bg-surface-subtle px-4 py-3">
                <p className="type-caption text-text-secondary">
                  Wybrano:{" "}
                  <span className="type-card-title text-text-body">
                    {selectedOption.provider} — {selectedOption.servicelevel.name}
                  </span>{" "}
                  <span className="type-price">
                    {formatPolishPrice(selectedOption.amount)}
                  </span>
                </p>
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
