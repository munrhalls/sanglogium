# Complete Checkout System Code Record

## app/(store)/basket/page.tsx

```tsx
import BasketManager from "@/app/components/features/basket/BasketManager";
import { Suspense } from "react";
import Loader from "@/app/components/common/Loader";
import Shelf from "@/app/components/layout/general/Shelf";

export default function BasketPage() {
  return (
    <Shelf data-testid="basket-page" className="py-20">
      <div className="mt-12 mb-8 text-center lg:text-left">
        <h1 className="type-section-hed uppercase tracking-widest">
          Basket
        </h1>
      </div>
      <Suspense fallback={<Loader />}>
        <BasketManager />
      </Suspense>
    </Shelf>
  );
}
```

## app/checkout/layout.tsx

```tsx
import "../globals.css";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import BrandLogo from "@/app/components/layout/header/BrandLogo";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-brand-800 text-brand-100 font-sans">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        <header className="flex h-[var(--mobile-header-h)] shrink-0 items-center justify-center border-b border-white/5 bg-brand-900 lg:h-[var(--desktop-header-h)]">
          <BrandLogo />
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
```

## app/checkout/page.tsx

```tsx
import { redirect } from "next/navigation";

export default function page() {
  redirect("/checkout/address");
}
```

## app/checkout/checkout.types.ts

```ts
export type Address = {
  firstName: string;
  lastName: string;
  phone: string;
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

export type Status = "LOADING" | "FIX" | "CONFIRM" | "ACCEPT";

export type ServerResponse = {
  status: Status;
  address?: Address;
  geocode?: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
  placeId?: string;
  errors?: Record<string, string>;
};

export type ServerProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  _rev: string;
};

export type BasketCheckoutItem = {
  _id: string;
  quantity: number;
};
```

## app/checkout/error.tsx

```tsx
"use client";

import Link from "next/link";

export default function CheckoutError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-gray-600">
        We could not complete your checkout. Please try again or return to your basket.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Try again
        </button>
        <Link
          href="/basket"
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          Back to basket
        </Link>
      </div>
    </div>
  );
}
```

## app/checkout/_components/CheckoutStepper.tsx

```tsx
"use client";

import { ShoppingCart, MapPin, Truck, CreditCard } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";

interface StepDef {
  label: string;
  icon: Icon;
}

const STEPS: StepDef[] = [
  { label: "Basket", icon: ShoppingCart },
  { label: "Address", icon: MapPin },
  { label: "Shipping", icon: Truck },
  { label: "Payment", icon: CreditCard },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-6">
      <ol className="flex items-center justify-center">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isPassed = i < currentStep;
          const isPending = i > currentStep;
          const IconComponent = step.icon;
          return (
            <li key={step.label} className="flex items-center">
              <span className="flex flex-col items-center gap-1">
                <IconComponent
                  className={cn("w-6 h-6 lg:w-8 lg:h-8", isActive && "text-brand-400", isPassed && "text-brand-600", isPending && "text-secondary-600")}
                  weight={isActive ? "fill" : isPassed ? "regular" : "light"}
                  aria-hidden="true"
                />
                <span className={cn("hidden lg:block type-overline", isActive && "!text-brand-400", isPassed && "!text-brand-600", isPending && "!text-secondary-600")}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.label}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn("w-8 lg:w-16 h-px mx-1", isPassed ? "bg-brand-600" : "bg-secondary-700")} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

## app/checkout/address/page.tsx

```tsx
import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AddressForm from "./AddressForm";
import type { Address } from "../checkout.types";

export default async function Page() {
  const session = await getCheckoutSession();
  if (!session.basket || session.basket.length === 0) {
    console.log("[ADDRESS PAGE] No basket in session, redirecting to basket");
    redirect("/basket");
  }
  const traceId = session.checkoutSessionId || 'unknown';
  console.log("[ADDRESS PAGE] session.basket:", session.basket);
  console.log("[ADDRESS PAGE] session.address:", session.address);
  return <AddressForm traceId={traceId} initialAddress={session.address} />;
}
```

## app/checkout/address/AddressForm.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import { saveAddress } from "@/app/actions/checkout";
import Loader from "@/app/components/common/Loader";
import CheckoutStepper from "../_components/CheckoutStepper";
import type { Address } from "../checkout.types";

const REGIONS = [
  { code: "PL", label: "Poland" },
  { code: "GB", label: "United Kingdom" },
] as const;

interface AddressFormProps {
  traceId: string;
  initialAddress?: Address;
}

export default function AddressForm({ traceId, initialAddress }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", regionCode: "", postalCode: "",
    street: "", streetNumber: "", city: "",
  });

  useEffect(() => {
    if (initialAddress) {
      setForm({
        firstName: initialAddress.firstName || "", lastName: initialAddress.lastName || "",
        phone: initialAddress.phone || "", regionCode: initialAddress.regionCode || "",
        postalCode: initialAddress.postalCode || "", street: initialAddress.street || "",
        streetNumber: initialAddress.streetNumber || "", city: initialAddress.city || "",
      });
    }
  }, [initialAddress]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true); setError(null);
    const addressData = {
      firstName: formData.get("firstName") as string, lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string, regionCode: formData.get("regionCode") as string,
      postalCode: formData.get("postalCode") as string, street: formData.get("street") as string,
      streetNumber: formData.get("streetNumber") as string, city: formData.get("city") as string,
    };
    fetch('/api/trace', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traceId, step: 'address_form_submit', data: addressData }) }).catch(() => {});
    try {
      const result = await saveAddress(addressData);
      if (result && result.status === "FIX") {
        setError("Address could not be verified. Please check your details and try again.");
        setIsLoading(false);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Failed to save address");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader message="Verifying address..." color="border-t-black" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <CheckoutStepper currentStep={1} />
      <h1 className="type-section-hed text-center mb-10">Shipping Address</h1>
      {error && (
        <div className="mb-4 rounded border border-error-500/30 bg-error-500/10 p-3">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      )}
      <form action={handleSubmit} className="space-y-4">
        <p className="section-header-anchor type-overline mb-6">Contact Information</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="type-caption mb-1.5 block">First Name</label>
            <input name="firstName" type="text" value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)} required className="input-field" />
          </div>
          <div>
            <label className="type-caption mb-1.5 block">Last Name</label>
            <input name="lastName" type="text" value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)} required className="input-field" />
          </div>
        </div>
        <div>
          <label className="type-caption mb-1.5 block">Phone Number</label>
          <input name="phone" type="tel" value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)} required className="input-field" />
        </div>
        <p className="section-header-anchor type-overline mb-6 mt-12">Shipping Address</p>
        <div>
          <label className="type-caption mb-1.5 block">Country</label>
          <select name="regionCode" value={form.regionCode}
            onChange={(e) => handleChange("regionCode", e.target.value)} required className="input-select w-full">
            <option value="" disabled>Select country</option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="type-caption mb-1.5 block">City</label>
          <input name="city" type="text" value={form.city}
            onChange={(e) => handleChange("city", e.target.value)} required className="input-field" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
          <div>
            <label className="type-caption mb-1.5 block">Street</label>
            <input name="street" type="text" value={form.street}
              onChange={(e) => handleChange("street", e.target.value)} required className="input-field" />
          </div>
          <div>
            <label className="type-caption mb-1.5 block">Number</label>
            <input name="streetNumber" type="text" value={form.streetNumber}
              onChange={(e) => handleChange("streetNumber", e.target.value)} required className="input-field" />
          </div>
        </div>
        <div>
          <label className="type-caption mb-1.5 block">Postal Code</label>
          <input name="postalCode" type="text" value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)} required className="input-field" />
        </div>
        <button type="submit" disabled={isLoading} className="btn-cart-large w-full mt-8">
          Continue to Shipping
        </button>
      </form>
    </div>
  );
}
```

## app/checkout/shipping/page.tsx

```tsx
import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from "@/lib/shipping/allekurier-rates";
import { calculatePackages } from "@/lib/shipping/parcel-calculator";
import { getProductsByIds } from "@/sanity-cms/lib/products/getProductsByIds";
import ShippingPageClient from "./ShippingPageClient";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

export default async function Page() {
  const session = await getCheckoutSession();
  if (!session.address) {
    console.log("[SHIPPING PAGE] No address in session, redirecting to address");
    redirect("/checkout/address");
  }
  if (!session.basket || session.basket.length === 0) {
    console.log("[SHIPPING PAGE] No basket in session, redirecting to basket");
    redirect("/basket");
  }
  const traceId = session.checkoutSessionId || 'unknown';
  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_page_load',
    data: { hasAddress: !!session.address, hasBasket: !!session.basket?.length }, outcome: 'success' });
  const basketIds = session.basket.map((item) => item.productId);
  const products = await getProductsByIds(basketIds);
  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_products_fetched',
    data: { basketIds, productCount: products.length }, outcome: 'success' });
  let packages: { weight: number; width: number; height: number; length: number }[] = [];
  let packageError: string | null = null;
  try { packages = calculatePackages(session.basket, products); }
  catch (err) {
    packageError = err instanceof Error ? err.message : "Failed to calculate shipping packages";
    await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_package_calculation_error',
      data: { error: packageError, basketIds }, outcome: 'error' });
  }
  if (packageError) return <ShippingPageClient shippingOptions={[]} traceId={traceId} error={packageError} />;
  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_packages_calculated',
    data: { packageCount: packages.length, totalWeight: packages.reduce((sum, p) => sum + p.weight, 0) }, outcome: 'success' });
  const senderZip = process.env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001";
  const allekurierPayload = { fromCountry: "PL", fromZip: senderZip, toCountry: "PL", toZip: session.address.postalCode, packages };
  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_allekurier_request',
    data: { payload: allekurierPayload, packageCount: packages.length, totalWeight: packages.reduce((sum, p) => sum + p.weight, 0) }, outcome: 'success' });
  const rates = await fetchAlleKurierRates(allekurierPayload, traceId);
  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_allekurier_response',
    data: { rateCount: rates.length, rates: rates.map(r => ({ carrier: r.Carrier.name, service: r.Service.name, price: r.Order.gross })) }, outcome: 'success' });
  const shippingOptions = rates.map(transformAlleKurierToShippingOption);
  return <ShippingPageClient shippingOptions={shippingOptions} traceId={traceId} />;
}
```

## app/checkout/shipping/loading.tsx

```tsx
export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 md:px-0 pt-10 pb-28 md:pb-16">
      <div className="flex md:hidden items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-surface-elevated animate-pulse" />
            {i < 4 && <div className="w-4 h-px bg-surface-elevated" />}
          </div>
        ))}
      </div>
      <div className="hidden md:flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-16 h-4 bg-surface-elevated rounded animate-pulse" />
            {i < 4 && <div className="w-4 h-px bg-surface-elevated" />}
          </div>
        ))}
      </div>
      <div className="w-64 h-8 bg-surface-elevated rounded animate-pulse mb-8" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start justify-between gap-3 md:gap-4 rounded-lg border border-border-secondary px-4 py-4 md:py-5 bg-surface-card">
            <div className="flex items-start gap-3 md:gap-4 flex-1">
              <div className="w-5 h-5 rounded-full bg-surface-elevated animate-pulse flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="w-32 h-5 bg-surface-elevated rounded animate-pulse" />
                <div className="w-24 h-4 bg-surface-elevated rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 text-right flex-shrink-0 min-w-[88px]">
              <div className="w-16 h-5 bg-surface-elevated rounded animate-pulse ml-auto" />
              <div className="w-20 h-4 bg-surface-elevated rounded animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:flex w-full justify-center mt-8">
        <div className="w-full h-14 bg-surface-elevated rounded animate-pulse" />
      </div>
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 py-3 bg-surface-page border-t border-border-secondary">
        <div className="w-full h-14 bg-surface-elevated rounded animate-pulse" />
      </div>
    </div>
  );
}
```

## app/checkout/shipping/ShippingPageClient.tsx

```tsx
"use client";
import { useState } from "react";
import { saveShippingAction } from "@/app/actions/checkout";
import { formatPolishPrice, formatDeliveryEstimate } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/tailwind";
import CheckoutStepper from "../_components/CheckoutStepper";

interface ShippingOption {
  provider: string;
  servicelevel: { name: string };
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

export default function ShippingPageClient({ shippingOptions, traceId, error: initialError }: ShippingPageClientProps) {
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const selectedOption = shippingOptions.find((o) => o.rateId === selectedRateId) ?? null;

  const handleContinue = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true); setError(null);
    fetch("/api/trace", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traceId, step: "shipping_option_selected",
        data: { rateId: selectedOption.rateId, provider: selectedOption.provider, service: selectedOption.servicelevel.name, amount: selectedOption.amount } }) }).catch(() => {});
    try {
      await saveShippingAction(selectedOption.rateId, Math.round(selectedOption.amount * 100),
        selectedOption.servicelevel.name, selectedOption.provider, selectedOption.estimatedDays);
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Nie udało się zapisać wyboru dostawy");
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => { window.location.reload(); };
  const isCtaDisabled = !selectedOption || isSubmitting;
  const hasOptions = shippingOptions.length > 0;

  return (
    <div className="relative">
      <div className="max-w-2xl mx-auto w-full px-4 md:px-0 pt-10 pb-28 md:pb-16">
        <CheckoutStepper currentStep={2} />
        <h1 className="type-section-hed mb-8">Wybierz metodę dostawy</h1>
        {error && (
          <div className="mb-6 rounded border border-error-500/30 bg-error-500/10 p-4">
            <p className="type-body text-error-500 mb-3">{error}</p>
            <button onClick={handleRetry} type="button" className="btn-secondary px-4 py-2 text-sm">Spróbuj ponownie</button>
          </div>
        )}
        {!hasOptions && !error && (
          <div className="mb-6 rounded border border-border-secondary bg-surface-subtle p-4">
            <p className="type-body text-text-secondary">Brak dostępnych opcji dostawy.</p>
          </div>
        )}
        {hasOptions && (
          <>
            <div className="space-y-3" role="radiogroup" aria-label="Opcje dostawy">
              {shippingOptions.map((option) => {
                const isSelected = selectedRateId === option.rateId;
                return (
                  <label key={option.rateId} htmlFor={`shipping-${option.rateId}`}
                    className={cn("card-base cursor-pointer flex items-start md:items-center gap-4 transition-all duration-200 ease-out",
                      "focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-2 focus-within:ring-offset-surface-page",
                      isSelected ? "border-brand-400 shadow-[0_0_0_1px_theme(colors.brand.400),0_4px_20px_rgba(246,227,213,0.08)] bg-surface-subtle"
                        : "pointer-fine:hover:border-brand-400/50 pointer-fine:hover:shadow-cardHoverDark")}>
                    <input id={`shipping-${option.rateId}`} type="radio" name="shippingRate" value={option.rateId}
                      checked={isSelected} onChange={() => setSelectedRateId(option.rateId)} className="sr-only" />
                    <span aria-hidden="true" className={cn("flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors duration-200",
                      isSelected ? "border-brand-400 bg-brand-400" : "border-border-primary bg-transparent")}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-700">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="type-card-title">{option.provider}</p>
                        <p className="type-price shrink-0 text-right whitespace-nowrap">{formatPolishPrice(option.amount)}</p>
                      </div>
                      <p className="type-caption">{option.servicelevel.name}</p>
                      <p className="type-caption text-text-secondary">{formatDeliveryEstimate(option.estimatedDays)}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedOption && (
              <div className="mt-4 rounded-lg border border-brand-400/30 bg-surface-subtle px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="type-caption text-text-secondary flex-shrink-0">Wybrano:</span>
                  <span className="type-card-title text-text-body truncate">{selectedOption.provider} — {selectedOption.servicelevel.name}</span>
                </div>
                <span className="type-price flex-shrink-0">{formatPolishPrice(selectedOption.amount)}</span>
              </div>
            )}
          </>
        )}
        <button id="shipping-continue-desktop" onClick={handleContinue} disabled={isCtaDisabled}
          className="btn-cart-large hidden md:flex w-full justify-center mt-8" aria-busy={isSubmitting}>
          {isSubmitting ? (<> <span aria-hidden="true" className="inline-block w-4 h-4 rounded-full border-2 border-brand-700/40 border-t-brand-700 animate-spin" /> Przetwarzanie… </>) : "Przejdź do płatności"}
        </button>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 py-3 bg-surface-page border-t border-border-secondary shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <button id="shipping-continue-mobile" onClick={handleContinue} disabled={isCtaDisabled}
          className="btn-cart-large flex w-full justify-center" aria-busy={isSubmitting}>
          {isSubmitting ? (<> <span aria-hidden="true" className="inline-block w-4 h-4 rounded-full border-2 border-brand-700/40 border-t-brand-700 animate-spin" /> Przetwarzanie… </>) : "Przejdź do płatności"}
        </button>
      </div>
    </div>
  );
}
```

## app/checkout/payment/page.tsx

```tsx
import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";
import PaymentForm from "./PaymentForm.client";
import CheckoutSummary from "./_components/CheckoutSummary";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import CheckoutStepper from "../_components/CheckoutStepper";

interface PaymentProduct {
  _id: string;
  name: string | null;
  price_data: { unit_amount: number } | null;
  stock: number | null;
  imageUrl: string | null;
}

export default async function Page() {
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || 'unknown';
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_page_load',
    data: { hasBasket: !!session.basket?.length, hasAddress: !!session.address, hasShippingCost: session.shippingCost !== undefined && session.shippingCost !== null }, outcome: 'success' });
  if (!session.basket?.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_basket_empty', data: {}, outcome: 'error' });
    redirect("/basket");
  }
  if (session.basket.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_invalid_quantity', data: { basket: session.basket }, outcome: 'error' });
    redirect("/basket?error=invalid_basket");
  }
  if (!session.address) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_no_address', data: {}, outcome: 'error' });
    redirect("/checkout/address");
  }
  if (session.shippingCost === undefined || session.shippingCost === null) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_no_shipping_cost', data: {}, outcome: 'error' });
    redirect("/checkout/shipping");
  }
  const MAX_QUANTITY_PER_ITEM = 10;
  for (const item of session.basket) {
    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_excessive_quantity',
        data: { productId: item.productId, quantity: item.quantity, max: MAX_QUANTITY_PER_ITEM }, outcome: 'error' });
      redirect(`/basket?error=excessive_quantity&id=${item.productId}`);
    }
  }
  const ids = session.basket.map((i) => i.productId);
  const sanityProducts = await client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount }, stock, "imageUrl": image.asset->url }`, { ids });
  if (sanityProducts.length !== session.basket.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_product_mismatch',
      data: { expected: session.basket.length, received: sanityProducts.length }, outcome: 'error' });
    throw new Error("Product mismatch");
  }
  for (const product of sanityProducts) {
    if (!Number.isFinite(product.price_data?.unit_amount)) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_invalid_price', data: { productId: product._id }, outcome: 'error' });
      throw new Error(`Product ${product._id} has invalid price`);
    }
    if (product.stock === 0) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_out_of_stock', data: { productId: product._id }, outcome: 'error' });
      redirect(`/basket?error=out_of_stock&id=${product._id}`);
    }
  }
  const dedupeShippingLabel = (carrier?: string, method?: string): string => {
    if (!carrier && !method) return "Shipping";
    if (!method) return carrier || "Shipping";
    if (!carrier) return method;
    const carrierWords = carrier.toLowerCase().split(/\s+/);
    const methodLower = method.toLowerCase();
    const carrierContained = carrierWords.every(w => methodLower.includes(w));
    if (carrierContained) return method;
    const firstCarrier = carrierWords[0];
    const firstMethod = method.toLowerCase().split(/\s+/)[0];
    if (firstCarrier === firstMethod) return method;
    return `${carrier} — ${method}`;
  };
  const items = session.basket.map((item) => {
    const product = sanityProducts.find((p) => p._id === item.productId)!;
    const unitPrice = product.price_data!.unit_amount;
    const rawName = product.name ?? "Product";
    const openBoxMatch = rawName.match(/^Open Box\s*[×xX]\s*\d+\s+(.*)/i);
    const condition = openBoxMatch ? "Open Box" : undefined;
    const displayName = openBoxMatch ? openBoxMatch[1].trim() : rawName;
    return { productId: item.productId, name: displayName, condition, imageUrl: product.imageUrl, quantity: item.quantity, unitPrice, lineTotal: unitPrice * item.quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const grandTotal = Math.round(subtotal + (session.shippingCost as number));
  const vatAmount = grandTotal - Math.round(grandTotal / 1.23);
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_calculation',
    data: { subtotal, shippingCost: session.shippingCost, grandTotal, vatAmount }, outcome: 'success' });
  if (grandTotal < 1) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_invalid_total',
      data: { subtotal, shippingCost: session.shippingCost, grandTotal }, outcome: 'error' });
    redirect("/basket?error=invalid_total");
  }
  const address = session.address!;
  const shippingLabel = dedupeShippingLabel(session.shippingCarrier, session.shippingMethodName);
  const metadata: Record<string, string> = {
    regionCode: address.regionCode, postalCode: address.postalCode, street: address.street,
    streetNumber: address.streetNumber, city: address.city, email: session.email ?? "",
    ...(session.checkoutSessionId && { checkoutSessionId: session.checkoutSessionId }),
  };
  return (
    <div className="space-y-6">
      <CheckoutStepper currentStep={3} />
      <div className="grid gap-8 grid-cols-1 items-start lg-touch:grid-cols-2 lg-desktop:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <CheckoutSummary items={items} shippingCost={session.shippingCost as number} shippingLabel={shippingLabel}
            shippingEstimatedDays={session.shippingEstimatedDays} address={session.address} subtotal={subtotal}
            grandTotal={grandTotal} vatAmount={vatAmount} />
          <div className="flex items-center justify-between gap-4">
            <Link href="/checkout/shipping" className="flex items-center gap-1 min-h-[44px] type-caption text-text-secondary hover:text-text-body transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to shipping
            </Link>
            <Link href="/basket" className="flex items-center gap-1 min-h-[44px] type-caption text-text-secondary hover:text-text-body transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Edit basket
            </Link>
          </div>
        </div>
        <div className="min-w-0">
          <PaymentForm grandTotal={grandTotal} metadata={metadata} address={address} traceId={traceId} />
        </div>
      </div>
    </div>
  );
}
```

## app/checkout/payment/PaymentForm.client.tsx

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements, ExpressCheckoutElement, PaymentMethodMessagingElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#F6E3D5', colorBackground: '#2E2E2D', colorText: '#FAEEE6',
    colorTextSecondary: '#9A9997', colorDanger: '#EF4444', borderRadius: '3px',
    fontFamily: 'Montserrat, system-ui, sans-serif', spacingUnit: '4px',
  },
  rules: {
    '.Input': { backgroundColor: '#2E2E2D', border: '1px solid #4A4948', color: '#FAEEE6' },
    '.Input:focus': { border: '1px solid #F6E3D5', boxShadow: 'none' },
    '.Label': { color: '#E5E4E2' },
    '.Tab': { backgroundColor: '#2E2E2D', border: '1px solid #4A4948', color: '#9A9997' },
    '.Tab:hover': { color: '#FAEEE6' },
    '.Tab--selected': { backgroundColor: '#2E2E2D', border: '1px solid #F6E3D5', color: '#FAEEE6' },
    '.TabIcon--selected': { fill: '#F6E3D5' },
    '.Block': { backgroundColor: '#1A1A19', border: '1px solid #4A4948' },
  },
};

interface Address { regionCode: string; postalCode: string; street: string; streetNumber: string; city: string; }
interface PaymentFormProps { grandTotal: number; metadata: Record<string, string>; address: Address; traceId: string; }

function formatPLNShort(cents: number): string {
  return (cents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
}

function PaymentFormInner({ address, traceId, grandTotal }: { address: Address; traceId: string; grandTotal: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsLoading(true); setError(null);
    await fetch('/api/trace', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traceId, step: 'payment_submit_start', data: { hasStripe: !!stripe, hasElements: !!elements } }) });
    const { error: submitError } = await elements.submit();
    if (submitError) {
      await fetch('/api/trace', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traceId, step: 'payment_submit_error', data: { error: submitError.message } }) });
      setError(submitError.message ?? "Please check your payment details.");
      setIsLoading(false); return;
    }
    const billing_details = { address: { line1: `${address.street} ${address.streetNumber}`, postal_code: address.postalCode, city: address.city, state: address.regionCode, country: "PL" } };
    await fetch('/api/trace', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traceId, step: 'payment_confirm_call', data: { returnUrl: `${window.location.origin}/api/checkout/return` } }) });
    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/api/checkout/return`, payment_method_data: { billing_details } } });
    if (error) {
      await fetch('/api/trace', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traceId, step: 'payment_confirm_error', data: { error: error.message, type: error.type } }) });
      if (error.type === 'api_error') setError(error.message ?? "A payment system error occurred. Please try again later.");
    }
    setIsLoading(false);
  };

  const payButtonLabel = isLoading
    ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />Processing…</span>
    : `Pay · ${formatPLNShort(grandTotal)}`;

  return (
    <>
      <div className="card-base space-y-6 pb-28 lg-touch:pb-6 lg-desktop:pb-6">
        <ExpressCheckoutElement options={{ buttonHeight: 44, buttonTheme: { applePay: 'black', googlePay: 'black' }, layout: { maxColumns: 4 } }}
          onConfirm={async () => {
            if (!stripe || !elements) return;
            const billing_details = { address: { line1: `${address.street} ${address.streetNumber}`, postal_code: address.postalCode, city: address.city, state: address.regionCode, country: "PL" } };
            await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/api/checkout/return`, payment_method_data: { billing_details } } });
          }} />
        <div className="border-t border-border-secondary pt-4">
          <p className="mb-3 text-center type-caption text-text-caption">Or choose another payment method</p>
          <PaymentElement options={{ paymentMethodOrder: ['blik', 'p24', 'card'], fields: { billingDetails: { address: "never" } } }} />
        </div>
        {error && (<div className="rounded border border-error-500/30 bg-error-500/10 px-3 py-2 mt-2"><p className="type-caption text-error-500">{error}</p></div>)}
        <div className="flex items-center justify-center gap-1.5 type-caption text-text-caption">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success-500">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secure payment encrypted by Stripe
        </div>
        <button onClick={handlePay} disabled={isLoading || !stripe || !elements}
          className="btn-cart-large w-full justify-center py-4 hidden lg-touch:block lg-desktop:block">
          {payButtonLabel}
        </button>
        <div className="flex items-center justify-center gap-2 type-caption text-text-secondary pt-2">
          <span className="font-medium">Visa</span><span>·</span><span className="font-medium">Mastercard</span><span>·</span><span className="font-medium">BLIK</span>
        </div>
      </div>
      <div className="lg-touch:hidden lg-desktop:hidden fixed bottom-0 left-0 w-full z-50 bg-brand-700 border-t border-border-secondary px-4 py-3"
        style={{ boxShadow: "0 -4px 16px rgba(0,0,0,0.3)" }}>
        <button onClick={handlePay} disabled={isLoading || !stripe || !elements} className="btn-cart-large w-full justify-center py-4">
          {payButtonLabel}
        </button>
      </div>
    </>
  );
}

export default function PaymentForm({ grandTotal, metadata, address, traceId }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initPayment = useCallback(async (meta: Record<string, string>) => {
    const maxAttempts = 3; const delays = [500, 1000, 2000];
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await fetch("/api/checkout/payment-intent-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grandTotal, metadata: meta }) });
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setClientSecret(data.clientSecret); return;
      } catch { if (attempt < maxAttempts - 1) await new Promise((r) => setTimeout(r, delays[attempt])); }
    }
    setError("Failed to initialize payment.");
  }, [grandTotal]);

  useEffect(() => { initPayment(metadata); }, [initPayment, metadata]);

  if (error) return (
    <div className="card-base">
      <h2 className="type-section-hed mb-4">Payment Error</h2>
      <p className="type-body text-text-secondary">{error}</p>
      <div className="flex gap-4 mt-6">
        <button onClick={() => window.location.reload()} className="btn-cart-large">Try Again</button>
        <button onClick={() => window.location.href = "/checkout/shipping"} className="btn-secondary">Go Back</button>
      </div>
    </div>
  );
  if (!clientSecret) return (
    <div className="card-base space-y-4">
      <div className="h-11 rounded-sm bg-surface-elevated animate-pulse" />
      <div className="h-px bg-border-secondary mt-4 mb-4" />
      <div className="h-10 rounded-sm bg-surface-elevated animate-pulse mb-3" />
      <div className="h-10 rounded-sm bg-surface-elevated animate-pulse mb-3" />
      <div className="h-10 rounded-sm bg-surface-elevated animate-pulse mb-3" />
      <div className="h-14 rounded-sm bg-surface-elevated animate-pulse mt-6" />
      <p className="type-caption text-text-caption text-center mt-2">Preparing secure payment…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance, defaultValues: { billingDetails: { email: metadata.email } } } as any}>
        {grandTotal >= 5000 && (
          <div className="mb-4">
            <PaymentMethodMessagingElement options={{ amount: grandTotal, currency: 'PLN', paymentMethodTypes: ['klarna'] }} />
          </div>
        )}
        <PaymentFormInner address={address} traceId={traceId} grandTotal={grandTotal} />
      </Elements>
    </div>
  );
}
```

## app/checkout/payment/_components/CheckoutSummary.tsx

```tsx
import Image from "next/image";

interface CheckoutItem { productId: string; name: string; condition?: string; imageUrl?: string | null; quantity: number; unitPrice: number; lineTotal: number; }
interface Address { firstName?: string; lastName?: string; street: string; streetNumber: string; city: string; postalCode: string; regionCode: string; }
interface CheckoutSummaryProps { items: CheckoutItem[]; shippingCost: number; shippingLabel: string; shippingEstimatedDays?: number; address?: Address; subtotal: number; grandTotal: number; vatAmount: number; }

function formatPLN(cents: number): string {
  return (cents / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

export default function CheckoutSummary({ items, shippingCost, shippingLabel, shippingEstimatedDays, address, subtotal, grandTotal, vatAmount }: CheckoutSummaryProps) {
  const deliveryEstimate = shippingEstimatedDays ? `${shippingEstimatedDays} business days` : null;
  return (
    <div className="card-base space-y-4">
      <h2 className="type-section-hed">Order Summary</h2>
      {address && (
        <div className="rounded-md px-3 py-2 mb-4 bg-surface-subtle">
          <p className="type-caption text-text-caption mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Deliver to
          </p>
          <p className="type-body font-medium">{address.firstName || address.lastName ? `${address.firstName ?? ''} ${address.lastName ?? ''}`.trim() : 'Guest'}</p>
          <p className="type-body">{address.street} {address.streetNumber}</p>
          <p className="type-body">{address.postalCode} {address.city}</p>
          <p className="type-body">{address.regionCode}</p>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start gap-3">
            {item.imageUrl ? (
              <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-surface-elevated">
                <Image src={item.imageUrl} alt={item.name || "Product"} fill className="object-cover" sizes="48px" />
              </div>
            ) : (
              <div className="w-12 h-12 shrink-0 rounded bg-surface-elevated flex items-center justify-center text-text-caption text-xs">—</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {item.condition && (<span className="inline-block mr-1.5 px-1.5 py-0.5 rounded-sm bg-warning-500/20 text-warning-500 type-caption font-medium">{item.condition}</span>)}
                  <span className="type-card-title break-words" style={{ wordBreak: "break-word" }}>{item.name || "Product"} <span className="text-text-secondary">× {item.quantity}</span></span>
                </div>
                <span className="type-price shrink-0 tabular-nums min-w-[72px] text-right">{formatPLN(item.lineTotal)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-body">
          <span className="min-w-0 flex-1 text-text-secondary">Subtotal</span>
          <span className="type-price shrink-0 tabular-nums">{formatPLN(subtotal)}</span>
        </div>
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-start justify-between gap-4 type-body">
          <span className="min-w-0 flex-1 text-text-secondary">
            {shippingLabel}
            {deliveryEstimate && (<span className="block type-caption text-text-caption mt-0.5">{deliveryEstimate}</span>)}
          </span>
          <span className="type-price shrink-0 tabular-nums">{formatPLN(shippingCost)}</span>
        </div>
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4">
          <span className="min-w-0 flex-1 type-caption text-text-caption">VAT (included)</span>
          <span className="type-caption text-text-caption shrink-0 tabular-nums">{formatPLN(vatAmount)}</span>
        </div>
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-section-sub">
          <span className="min-w-0 flex-1">Total</span>
          <span className="shrink-0 tabular-nums text-brand-400">{formatPLN(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
```

## app/api/checkout/return/route.ts

```ts
import { redirect } from "next/navigation";
import { getCheckoutSession } from "@/lib/session";
import { retrievePaymentIntent } from "@/lib/stripe";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { createOrderFromPaymentIntent, type OrderSessionData } from "@/lib/checkout/createOrderFromPaymentIntent";
import { getSession } from "@/lib/auth/dal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get("payment_intent");
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || 'unknown';
  const authSession = await getSession();
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_start', data: { hasPaymentIntent: !!payment_intent }, outcome: 'success' });
  if (!payment_intent) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_missing_intent', data: {}, outcome: 'error' });
    redirect("/basket?error=missing_intent");
  }
  if (!session.paymentIntentId && !session.completedPaymentIntentId) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_no_active_intent', data: { urlPaymentIntent: payment_intent }, outcome: 'error' });
    redirect("/basket?error=no_active_intent");
  }
  if (session.paymentIntentId && session.paymentIntentId !== payment_intent) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_intent_mismatch', data: { sessionPaymentIntentId: session.paymentIntentId, urlPaymentIntent: payment_intent }, outcome: 'error' });
    redirect("/basket?error=intent_mismatch");
  }
  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>>;
  try {
    pi = await retrievePaymentIntent(payment_intent);
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_pi_retrieved', data: { paymentIntentId: payment_intent, status: pi.status, amount: pi.amount }, outcome: 'success' });
  } catch (err) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_pi_retrieve_failed', data: { paymentIntentId: payment_intent, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
    session.lastPaymentIntentId = payment_intent;
    await session.save();
    redirect(`/checkout/success?payment_intent=${payment_intent}&error=verification_failed`);
  }
  session.lastPaymentIntentId = pi.id;
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_lifecycle_start', data: { paymentIntentId: pi.id, status: pi.status }, outcome: 'success' });
  const capturedSessionData: OrderSessionData | null = pi.status === 'succeeded' ? {
    basket: session.basket ?? [], address: session.address, shippingCode: session.shippingCode,
    shippingCost: session.shippingCost, shippingMethodName: session.shippingMethodName,
    shippingCarrier: session.shippingCarrier, shippingEstimatedDays: session.shippingEstimatedDays,
    email: session.email, checkoutSessionId: session.checkoutSessionId, userId: authSession?.userId,
  } : null;
  switch (pi.status) {
    case "succeeded":
      session.completedPaymentIntentId = pi.id;
      session.paymentIntentId = undefined;
      session.basket = []; session.address = undefined; session.shippingCode = undefined;
      session.shippingCost = undefined;
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_cleared_succeeded', data: {}, outcome: 'success' });
      break;
    case "requires_payment_method":
      session.paymentIntentId = undefined;
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_partial_cleared_failed', data: {}, outcome: 'error' });
      break;
    case "canceled":
      session.paymentIntentId = undefined;
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_partial_cleared_canceled', data: {}, outcome: 'error' });
      break;
    case "processing":
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_kept_processing', data: {}, outcome: 'success' });
      break;
    default:
      session.paymentIntentId = undefined;
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_partial_cleared_unknown', data: { status: pi.status }, outcome: 'error' });
      await session.save();
      redirect(`/basket?error=unexpected_status`);
  }
  await session.save();
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_saved', data: { status: pi.status }, outcome: 'success' });
  if (pi.status === 'succeeded' && capturedSessionData) {
    try {
      await createOrderFromPaymentIntent(pi, capturedSessionData);
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_order_created', data: { paymentIntentId: pi.id }, outcome: 'success' });
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_order_create_failed', data: { paymentIntentId: pi.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
    }
  }
  const redirectTarget = (() => {
    switch (pi.status) {
      case "succeeded": return `/checkout/success?payment_intent=${pi.id}`;
      case "requires_payment_method": return `/checkout/success?payment_intent=${pi.id}&status=failed`;
      case "canceled": return `/checkout/success?payment_intent=${pi.id}&status=canceled`;
      case "processing": return `/checkout/success?payment_intent=${pi.id}&status=processing`;
      default: return `/basket?error=unexpected_status`;
    }
  })();
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_redirect', data: { status: pi.status, redirectTarget }, outcome: 'success' });
  redirect(redirectTarget);
}
```

## app/checkout/success/page.tsx

```tsx
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Lock, WarningCircle, XCircle, Clock } from '@phosphor-icons/react/dist/ssr'
import { getCheckoutSession } from '@/lib/session'
import { retrievePaymentIntent } from '@/lib/stripe'
import { logCheckoutEvent } from '@/lib/dev/event-logger'
import { fetchOrderByPaymentIntentId } from '@/sanity-cms/lib/orders/getOrderByPaymentIntentId'
import OrderDetails from './OrderDetails'
import { RefreshButton } from './RefreshButton'
import { SuccessAnalytics } from './SuccessAnalytics.client'

interface SuccessPageSearchParams {
  payment_intent?: string
  status?: 'failed' | 'canceled' | 'processing'
  error?: 'verification_failed'
}

function OrderDetailsSkeleton() {
  return (
    <div className="card-base animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-36 rounded-sm bg-secondary-800/60" />
        <div className="h-3 w-28 rounded-sm bg-secondary-800/60" />
        <div className="h-px w-full bg-secondary-700 my-4" />
        <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
        <div className="h-4 w-4/5 rounded-sm bg-secondary-800/60" />
        <div className="h-px w-full bg-secondary-700 my-4" />
        <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
        <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
        <div className="h-px w-full bg-secondary-700 my-2" />
        <div className="h-5 w-full rounded-sm bg-secondary-800/60" />
      </div>
    </div>
  )
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<SuccessPageSearchParams> }) {
  const { payment_intent, error } = await searchParams
  if (!payment_intent) redirect('/basket')
  const session = await getCheckoutSession()
  const traceId = session.checkoutSessionId || 'unknown'
  await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_enter', data: { paymentIntentId: payment_intent, hasCompletedClaim: session.completedPaymentIntentId === payment_intent, hasLastClaim: session.lastPaymentIntentId === payment_intent }, outcome: 'success' });
  const hasSessionClaim = session.completedPaymentIntentId === payment_intent || session.lastPaymentIntentId === payment_intent
  let sanityOrderFallback = false
  if (!hasSessionClaim) {
    const order = await fetchOrderByPaymentIntentId(payment_intent)
    if (!order) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_gate_denied', data: { paymentIntentId: payment_intent }, outcome: 'error' });
      redirect('/basket')
    }
    sanityOrderFallback = true
    await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_gate_sanity_fallback', data: { paymentIntentId: payment_intent, orderNumber: order.orderNumber }, outcome: 'success' });
  }
  if (error === 'verification_failed') {
    await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_verification_failed', data: { paymentIntentId: payment_intent }, outcome: 'error' });
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <WarningCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">We couldn&apos;t verify your payment status</h1>
            </div>
            <p className="type-body text-text-caption">Your card may have been charged. Contact support with this reference:</p>
            <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">{payment_intent}</code>
            <div className="flex flex-wrap gap-3">
              <a href="/basket" className="btn-primary px-6 py-2.5">Return to basket</a>
              <a href="/support" className="btn-secondary px-6 py-2.5">Contact support</a>
            </div>
          </div>
        </section>
      </div>
    )
  }
  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>> | null = null
  try { pi = await retrievePaymentIntent(payment_intent) }
  catch {
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <WarningCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">We couldn&apos;t verify your payment status</h1>
            </div>
            <p className="type-body text-text-caption">Your card may have been charged. Contact support with this reference:</p>
            <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">{payment_intent}</code>
            <div className="flex flex-wrap gap-3">
              <a href="/basket" className="btn-primary px-6 py-2.5">Return to basket</a>
              <a href="/support" className="btn-secondary px-6 py-2.5">Contact support</a>
            </div>
          </div>
        </section>
      </div>
    )
  }
  if (pi.status === 'succeeded') {
    const amountPLN = (pi.amount / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })
    const paymentMethodHint = (() => {
      const charge = typeof pi.latest_charge === 'object' && pi.latest_charge !== null ? pi.latest_charge : null
      const type = charge?.payment_method_details?.type ?? 'unknown'
      const card = charge?.payment_method_details?.card
      switch (type) {
        case 'blik': return 'BLIK'
        case 'p24': return 'Przelewy24'
        case 'paypal': return 'PayPal'
        case 'klarna': return 'Klarna'
        case 'link': return 'Link'
        case 'card': {
          const wallet = card?.wallet?.type
          if (wallet === 'apple_pay') return 'Apple Pay'
          if (wallet === 'google_pay') return 'Google Pay'
          if (card?.brand && card?.last4) { const brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1); return `${brand} Â·Â·Â·Â·${card.last4}` }
          return 'Card'
        }
        default: return type ?? null
      }
    })()
    await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_succeeded', data: { paymentIntentId: payment_intent, amount: pi.amount, sanityFallback: sanityOrderFallback }, outcome: 'success' });
    return (
      <section aria-label="Order confirmation" className="flex flex-col gap-6">
        <SuccessAnalytics transactionId={pi.id} value={pi.amount} />
        <div className="card-base">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={28} className="text-success-500 flex-shrink-0" aria-hidden="true" />
              <h1 className="type-section-hed">Payment confirmed</h1>
            </div>
            <p className="type-section-sub tabular-nums">{amountPLN}</p>
            {paymentMethodHint && (<p className="type-section-caption">via {paymentMethodHint}</p>)}
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-text-caption flex-shrink-0" aria-hidden="true" />
              <span className="type-section-caption">Secured by Stripe</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg-touch:grid-cols-[3fr_2fr] lg-desktop:grid-cols-[3fr_2fr]">
          <div>
            <Suspense fallback={<OrderDetailsSkeleton />}>
              <OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />
            </Suspense>
          </div>
          <div className="flex flex-col gap-4">
            <div className="card-base">
              <h3 className="type-overline mb-4">What happens next</h3>
              <ol className="space-y-3">
                <li className="flex items-center gap-3"><span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-success-500" /><span className="type-body">Order confirmed</span></li>
                <li className="flex items-center gap-3"><span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" /><span className="type-section-caption">Processing</span></li>
                <li className="flex items-center gap-3"><span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" /><span className="type-section-caption">Shipped</span></li>
                <li className="flex items-center gap-3"><span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" /><span className="type-section-caption">Delivery</span></li>
              </ol>
              <p className="type-section-caption mt-3">Estimated delivery date shown in order details below. Tracking number will appear here once shipped.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-primary block text-center py-3">Continue shopping</Link>
              <Link href="/account/orders" className="btn-secondary block text-center py-3">View my orders</Link>
            </div>
            <div className="card-base">
              <h3 className="type-overline mb-2">Need help?</h3>
              <p className="type-section-caption mb-3">If you have any questions about your order, contact our support team.</p>
              <a href="mailto:support@sanglogium.com?subject=Order%20Support%20Request" className="btn-secondary inline-block px-4 py-2 text-sm">Email support</a>
            </div>
          </div>
        </div>
      </section>
    )
  }
  await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_status', data: { paymentIntentId: payment_intent, status: pi.status }, outcome: 'error' });
  if (pi.status === 'requires_payment_method') {
    const declineMessage = (pi as { last_payment_error?: { message?: string } }).last_payment_error?.message ?? 'Payment was declined.'
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <XCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">Payment was declined</h1>
            </div>
            <p className="type-body text-text-caption">{declineMessage}</p>
            <div className="flex flex-wrap gap-3">
              <a href="/checkout/payment" className="btn-primary px-6 py-2.5">Try again</a>
              <a href="/basket" className="btn-secondary px-6 py-2.5">Return to basket</a>
            </div>
          </div>
        </section>
      </div>
    )
  }
  if (pi.status === 'canceled') {
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <XCircle size={24} className="text-secondary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">Payment was canceled</h1>
            </div>
            <p className="type-body text-text-caption">You can try again or return to your basket.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/checkout/payment" className="btn-primary px-6 py-2.5">Try again</a>
              <a href="/basket" className="btn-secondary px-6 py-2.5">Return to basket</a>
            </div>
          </div>
        </section>
      </div>
    )
  }
  if (pi.status === 'processing') {
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Clock size={24} className="text-accent-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">Payment is processing</h1>
            </div>
            <p className="type-body text-text-caption">Your payment is being processed by your bank. This usually takes a few minutes.</p>
            <p className="type-body text-text-caption">We&apos;ll email a confirmation once settled.</p>
            <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">{payment_intent}</code>
            <div className="flex flex-wrap gap-3"><RefreshButton /></div>
          </div>
        </section>
      </div>
    )
  }
  return (
    <div className="max-w-xl mx-auto">
      <section role="alert" className="card-base">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <WarningCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <h1 className="type-section-sub">Unexpected payment status</h1>
          </div>
          <p className="type-body text-text-caption">Contact support with this reference:</p>
          <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">{payment_intent}</code>
          <div className="flex flex-wrap gap-3">
            <a href="/basket" className="btn-primary px-6 py-2.5">Return to basket</a>
          </div>
        </div>
      </section>
    </div>
  )
}
```
## app/checkout/success/OrderDetails.tsx

```tsx
import { notFound } from "next/navigation";
import { fetchOrderByPaymentIntentId } from "@/sanity-cms/lib/orders/getOrderByPaymentIntentId";

function formatPLN(cents: number): string {
  return (cents / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

interface OrderDetailsProps {
  paymentIntentId: string;
  fallbackTotal: number;
}

export default async function OrderDetails({ paymentIntentId, fallbackTotal }: OrderDetailsProps) {
  const order = await fetchOrderByPaymentIntentId(paymentIntentId);
  if (!order) {
    return (
      <div className="card-base">
        <h3 className="type-overline mb-4">Order details</h3>
        <p className="type-body text-text-caption">Order confirmation being processed. Check your email or refresh in a moment.</p>
        <div className="space-y-3 mt-4">
          <div className="h-4 w-3/4 rounded-sm bg-surface-elevated animate-pulse" />
          <div className="h-4 w-1/2 rounded-sm bg-surface-elevated animate-pulse" />
          <div className="h-4 w-2/3 rounded-sm bg-surface-elevated animate-pulse" />
        </div>
      </div>
    );
  }
  const items = order.items ?? [];
  const shippingAddress = order.shippingAddress ?? {};
  const total = order.totalAmount ?? fallbackTotal;
  const createdAt = order._createdAt ? new Date(order._createdAt).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" }) : null;
  return (
    <div className="card-base space-y-4">
      <div>
        <h3 className="type-overline mb-1">Order details</h3>
        {order.orderNumber && (<p className="type-caption text-text-caption font-mono">{order.orderNumber}</p>)}
        {createdAt && (<p className="type-caption text-text-caption">{createdAt}</p>)}
      </div>
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.productId ?? item._key} className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="type-body font-medium">{item.name ?? "Product"}</p>
              {item.condition && (<span className="type-caption text-warning-500">{item.condition}</span>)}
              <p className="type-caption text-text-caption">Qty: {item.quantity ?? 1}</p>
            </div>
            <p className="type-price shrink-0 tabular-nums">{formatPLN((item.unitPrice ?? 0) * (item.quantity ?? 1))}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-body">
          <span className="text-text-secondary">Subtotal</span>
          <span className="type-price tabular-nums">{formatPLN(order.subtotal ?? items.reduce((sum: number, i: any) => sum + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0))}</span>
        </div>
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-start justify-between gap-4 type-body">
          <span className="text-text-secondary">{order.shippingLabel ?? "Shipping"}</span>
          <span className="type-price tabular-nums">{formatPLN(order.shippingCost ?? 0)}</span>
        </div>
      </div>
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-section-sub">
          <span>Total</span>
          <span className="tabular-nums text-brand-400">{formatPLN(total)}</span>
        </div>
      </div>
      {Object.keys(shippingAddress).length > 0 && (
        <div className="border-t border-border-secondary pt-3">
          <p className="type-overline mb-1">Shipping address</p>
          <p className="type-body">{shippingAddress.street} {shippingAddress.streetNumber}</p>
          <p className="type-body">{shippingAddress.postalCode} {shippingAddress.city}</p>
          <p className="type-body">{shippingAddress.regionCode}</p>
        </div>
      )}
    </div>
  );
}
```

## app/checkout/success/RefreshButton.tsx

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
  };
  return (
    <button onClick={handleRefresh} disabled={isRefreshing} className="btn-secondary px-4 py-2 text-sm">
      {isRefreshing ? "Refreshingâ€¦" : "Refresh status"}
    </button>
  );
}
```

## app/checkout/success/SuccessAnalytics.client.tsx

```tsx
"use client";
import { useEffect, useRef } from "react";

interface SuccessAnalyticsProps {
  transactionId: string;
  value: number;
}

export function SuccessAnalytics({ transactionId, value }: SuccessAnalyticsProps) {
  const hasFired = useRef(false);
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    const w = window as any;
    if (w.gtag) {
      w.gtag("event", "purchase", {
        transaction_id: transactionId,
        value: value / 100,
        currency: "PLN",
        items: [],
      });
    }
  }, [transactionId, value]);
  return null;
}
```

## app/api/checkout/payment-intent-session/route.ts

```ts
import { NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";

export async function POST(request: Request) {
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || 'unknown';
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_handler_start', data: { hasBasket: !!session.basket?.length, hasAddress: !!session.address, hasShippingCost: session.shippingCost !== undefined }, outcome: 'success' });
  if (!session.basket?.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_guard_basket_empty', data: {}, outcome: 'error' });
    return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
  }
  if (!session.address) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_guard_no_address', data: {}, outcome: 'error' });
    return NextResponse.json({ error: "Address is missing" }, { status: 400 });
  }
  if (session.shippingCost === undefined || session.shippingCost === null) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_guard_no_shipping_cost', data: {}, outcome: 'error' });
    return NextResponse.json({ error: "Shipping cost is missing" }, { status: 400 });
  }
  const { grandTotal: clientGrandTotal, metadata } = await request.json().catch(() => ({}));
  const ids = session.basket.map((i) => i.productId);
  const sanityProducts = await client.fetch(
    groq`*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount } }`, { ids });
  const subtotal = session.basket.reduce((sum, item) => {
    const product = sanityProducts.find((p: any) => p._id === item.productId);
    const unitPrice = product?.price_data?.unit_amount ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);
  const computedGrandTotal = Math.round(subtotal + session.shippingCost);
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_calculation', data: { subtotal, shippingCost: session.shippingCost, computedGrandTotal, clientGrandTotal }, outcome: 'success' });
  if (computedGrandTotal < 1) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_invalid_total', data: { computedGrandTotal }, outcome: 'error' });
    return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
  }
  const enrichedMetadata: Record<string, string> = {
    ...(metadata || {}),
    traceId,
    basketItems: session.basket.map((i) => `${i.productId}:${i.quantity}`).join(","),
    shippingCost: String(session.shippingCost),
    subtotal: String(subtotal),
    grandTotal: String(computedGrandTotal),
  };
  const metadataString = JSON.stringify(enrichedMetadata);
  if (metadataString.length > 500) {
    const keys = Object.keys(enrichedMetadata).sort((a, b) => enrichedMetadata[a].length - enrichedMetadata[b].length);
    let remaining = 500;
    const trimmed: Record<string, string> = {};
    for (const key of keys) {
      if (key.length + 3 + enrichedMetadata[key].length <= remaining) {
        trimmed[key] = enrichedMetadata[key];
        remaining -= key.length + 3 + enrichedMetadata[key].length;
      }
    }
    enrichedMetadata.basketItems = session.basket.map((i) => `${i.productId}:${i.quantity}`).join(",").slice(0, Math.max(0, remaining - 15));
  }
  const existingId = session.paymentIntentId;
  if (existingId) {
    try {
      const existing = await stripe.paymentIntents.retrieve(existingId);
      if (existing.status === "requires_payment_method" || existing.status === "requires_confirmation") {
        const updated = await stripe.paymentIntents.update(existingId, { amount: computedGrandTotal, metadata: enrichedMetadata });
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_updated', data: { paymentIntentId: updated.id }, outcome: 'success' });
        return NextResponse.json({ clientSecret: updated.client_secret });
      }
    } catch {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_existing_invalid', data: { existingId }, outcome: 'error' });
    }
  }
  const newIntent = await stripe.paymentIntents.create({
    amount: computedGrandTotal, currency: "pln",
    automatic_payment_methods: { enabled: true },
    metadata: enrichedMetadata,
  });
  session.paymentIntentId = newIntent.id;
  await session.save();
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-intent-session', event: 'pis_created', data: { paymentIntentId: newIntent.id, amount: computedGrandTotal }, outcome: 'success' });
  return NextResponse.json({ clientSecret: newIntent.client_secret });
}
```

## app/api/basket/products/route.ts

```ts
import { NextResponse } from "next/server";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id");
  if (!ids.length) return NextResponse.json({ products: [] });
  const products = await client.fetch(
    groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount }, stock, reserved_stock, "imageUrl": image.asset->url }`, { ids });
  const sanitized = products.map((p: any) => ({
    _id: p._id, name: p.name, price_data: { unit_amount: p.price_data?.unit_amount ?? 0 },
    stock: typeof p.stock === "number" ? p.stock : 0,
    reserved_stock: typeof p.reserved_stock === "number" ? p.reserved_stock : 0,
    imageUrl: p.imageUrl ?? null,
  })).filter((p: any) => p.stock > 0);
  return NextResponse.json({ products: sanitized });
}
```

## app/api/basket/shipping-rates/route.ts

```ts
import { NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/session";
import { calculateParcelsFromBasket, calculateParcelsFromBasketReservation } from "@/lib/shipping/parcel-calculator";
import { fetchAlleKurierRates } from "@/lib/shipping/allekurier-rates";
import { getMockPLRates } from "@/lib/shipping/carrier-rates";
import { getBackendClient } from "@/sanity-cms/lib/backendClient";
import groq from "groq";

export async function POST(request: Request) {
  const session = await getCheckoutSession();
  if (!session.basket?.length) return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const { countryCode = "PL", city, postalCode, street, isReservation } = body;
  let parcels;
  if (isReservation && body.reservationItems) {
    parcels = calculateParcelsFromBasketReservation(body.reservationItems);
  } else {
    const ids = session.basket.map((i) => i.productId);
    const products = await getBackendClient().fetch(groq`*[_type == "product" && _id in $ids]{ _id, name, "dimensions": parcel_data.dimensions, "weight": parcel_data.weight }`, { ids });
    parcels = calculateParcelsFromBasket(session.basket, products);
  }
  if (!parcels?.length) return NextResponse.json({ error: "Could not calculate parcels" }, { status: 400 });
  let cheapest;
  if (countryCode === "PL") {
    const rates = getMockPLRates({ weight: parcels.reduce((s, p) => s + (p.weight ?? 0), 0), parcelsCount: parcels.length, city, postalCode });
    cheapest = rates.reduce((min, r) => r.amount < min.amount ? r : min, rates[0]);
  } else {
    const rates = await fetchAlleKurierRates({ parcels, recipientAddress: { country: countryCode, city, postalCode, street } });
    if (!rates?.length) return NextResponse.json({ error: "No shipping rates available" }, { status: 404 });
    cheapest = rates.reduce((min, r) => r.amount < min.amount ? r : min, rates[0]);
  }
  return NextResponse.json({ cheapest });
}
```

## app/api/shipping/rates/route.ts

```ts
import { NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/session";
import { calculateParcelsFromBasket } from "@/lib/shipping/parcel-calculator";
import { fetchAlleKurierRates } from "@/lib/shipping/allekurier-rates";
import { fetchPacklinkRates } from "@/lib/shipping/packlink-rates";
import { getMockPLRates } from "@/lib/shipping/carrier-rates";
import { getBackendClient } from "@/sanity-cms/lib/backendClient";
import groq from "groq";

export async function POST(request: Request) {
  const session = await getCheckoutSession();
  if (!session.basket?.length) return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
  if (!session.address) return NextResponse.json({ error: "Address is missing" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const { countryCode = session.address.regionCode || "PL" } = body;
  const ids = session.basket.map((i) => i.productId);
  const products = await getBackendClient().fetch(groq`*[_type == "product" && _id in $ids]{ _id, name, "dimensions": parcel_data.dimensions, "weight": parcel_data.weight }`, { ids });
  const parcels = calculateParcelsFromBasket(session.basket, products);
  if (!parcels?.length) return NextResponse.json({ error: "Could not calculate parcels" }, { status: 400 });
  const recipientAddress = { country: countryCode, city: session.address.city, postalCode: session.address.postalCode, street: session.address.street };
  let rates: any[] = [];
  if (countryCode === "PL") {
    rates = getMockPLRates({ weight: parcels.reduce((s, p) => s + (p.weight ?? 0), 0), parcelsCount: parcels.length, city: session.address.city, postalCode: session.address.postalCode });
  } else {
    const [allekurier, packlink] = await Promise.allSettled([
      fetchAlleKurierRates({ parcels, recipientAddress }),
      fetchPacklinkRates({ parcels, recipientAddress }),
    ]);
    if (allekurier.status === "fulfilled" && allekurier.value?.length) rates.push(...allekurier.value);
    if (packlink.status === "fulfilled" && packlink.value?.length) rates.push(...packlink.value);
  }
  if (!rates.length) return NextResponse.json({ error: "No shipping rates available" }, { status: 404 });
  const normalized = rates.map((r) => ({ provider: r.provider || "Unknown", servicelevel: { name: r.servicelevel?.name || "Standard" }, rateId: r.rateId || `fallback-${Math.random()}`, amount: typeof r.amount === "number" ? r.amount : 0, currency: r.currency || "PLN", estimatedDays: r.estimatedDays ?? 3 }));
  normalized.sort((a, b) => a.amount - b.amount);
  return NextResponse.json({ rates: normalized });
}
```

## app/api/trace/route.ts

```ts
import { NextResponse } from "next/server";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

export async function POST(request: Request) {
  try {
    const { traceId, step, data } = await request.json();
    await logCheckoutEvent({ correlationId: traceId || "unknown", slice: "client-trace", event: step, data: data || {}, outcome: "success" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
```

## app/api/webhooks/stripe/route.ts

```ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { createOrderFromPaymentIntent } from "@/lib/checkout/createOrderFromPaymentIntent";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    if (!endpointSecret || !sig) throw new Error("Missing webhook secret or signature");
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook verification failed: ${err.message}` }, { status: 400 });
  }
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const traceId = paymentIntent.metadata?.checkoutSessionId || paymentIntent.id || "unknown";
  switch (event.type) {
    case "payment_intent.succeeded":
      await logCheckoutEvent({ correlationId: traceId, slice: "stripe-webhook", event: "payment_intent_succeeded", data: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount }, outcome: "success" });
      try {
        await createOrderFromPaymentIntent(paymentIntent, null);
        await logCheckoutEvent({ correlationId: traceId, slice: "stripe-webhook", event: "order_created_from_webhook", data: { paymentIntentId: paymentIntent.id }, outcome: "success" });
      } catch (err: any) {
        await logCheckoutEvent({ correlationId: traceId, slice: "stripe-webhook", event: "order_create_failed", data: { paymentIntentId: paymentIntent.id, error: err.message }, outcome: "error" });
      }
      break;
    case "payment_intent.payment_failed":
      await logCheckoutEvent({ correlationId: traceId, slice: "stripe-webhook", event: "payment_intent_payment_failed", data: { paymentIntentId: paymentIntent.id, error: paymentIntent.last_payment_error?.message }, outcome: "error" });
      break;
    case "payment_intent.canceled":
      await logCheckoutEvent({ correlationId: traceId, slice: "stripe-webhook", event: "payment_intent_canceled", data: { paymentIntentId: paymentIntent.id }, outcome: "error" });
      break;
    default:
      await logCheckoutEvent({ correlationId: traceId, slice: "stripe-webhook", event: "unhandled_event", data: { type: event.type }, outcome: "success" });
  }
  return NextResponse.json({ received: true });
}
```
## app/actions/checkout/index.ts

```ts
"use server";
import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { getBackendClient } from "@/sanity-cms/lib/backendClient";
import groq from "groq";
import { getSession } from "@/lib/auth/dal";
import { revalidatePath } from "next/cache";

export interface Address {
  firstName?: string; lastName?: string; phone?: string;
  regionCode: string; postalCode: string; street: string; streetNumber: string; city: string;
}

function sanitizeName(name: string): string { return name.trim().replace(/[^\p{L}\p{N}\s'-]/gu, '').slice(0, 100); }
function sanitizePhone(phone: string): string { return phone.replace(/[^\d+\-()\s]/g, '').slice(0, 20); }
function sanitizeAddressInput(input: Record<string, unknown>): Address {
  return {
    firstName: typeof input.firstName === "string" ? sanitizeName(input.firstName) : undefined,
    lastName: typeof input.lastName === "string" ? sanitizeName(input.lastName) : undefined,
    phone: typeof input.phone === "string" ? sanitizePhone(input.phone) : undefined,
    regionCode: String(input.regionCode ?? "").toUpperCase().slice(0, 10),
    postalCode: String(input.postalCode ?? "").replace(/\s+/g, " ").trim().slice(0, 20),
    street: String(input.street ?? "").trim().slice(0, 200),
    streetNumber: String(input.streetNumber ?? "").trim().slice(0, 20),
    city: String(input.city ?? "").trim().slice(0, 100),
  };
}

export async function initCheckoutSession(formData: FormData) {
  const session = await getCheckoutSession();
  const traceId = crypto.randomUUID();
  session.checkoutSessionId = traceId;
  const rawBasket = formData.get("basket");
  const basket = typeof rawBasket === "string" ? JSON.parse(rawBasket) : session.basket;
  if (!Array.isArray(basket) || basket.length === 0) {
    await logCheckoutEvent({ correlationId: traceId, slice: "init", event: "init_empty_basket", data: {}, outcome: "error" });
    redirect("/basket");
  }
  session.basket = basket;
  await session.save();
  await logCheckoutEvent({ correlationId: traceId, slice: "init", event: "init_success", data: { itemCount: basket.length }, outcome: "success" });
  redirect("/checkout/address");
}

export async function saveAddress(input: Record<string, unknown>) {
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || "unknown";
  if (!session.basket?.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: "address", event: "address_guard_empty_basket", data: {}, outcome: "error" });
    redirect("/basket");
  }
  const address = sanitizeAddressInput(input);
  if (!address.street || !address.city || !address.postalCode) {
    await logCheckoutEvent({ correlationId: traceId, slice: "address", event: "address_validation_failed", data: { address }, outcome: "error" });
    return { status: "FIX", message: "Please fill in all required address fields." };
  }
  session.address = address;
  session.shippingCode = undefined;
  session.shippingCost = undefined;
  session.shippingMethodName = undefined;
  session.shippingCarrier = undefined;
  session.shippingEstimatedDays = undefined;
  await session.save();
  await logCheckoutEvent({ correlationId: traceId, slice: "address", event: "address_saved", data: { city: address.city, postalCode: address.postalCode }, outcome: "success" });
  redirect("/checkout/shipping");
}

export async function saveShippingAction(rateId: string, costCents: number, methodName: string, carrier: string, estimatedDays?: number) {
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || "unknown";
  if (!session.basket?.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping", event: "shipping_guard_empty_basket", data: {}, outcome: "error" });
    redirect("/basket");
  }
  if (!session.address) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping", event: "shipping_guard_no_address", data: {}, outcome: "error" });
    redirect("/checkout/address");
  }
  if (typeof costCents !== "number" || costCents < 0) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping", event: "shipping_invalid_cost", data: { costCents }, outcome: "error" });
    return { status: "FIX", message: "Invalid shipping cost." };
  }
  session.shippingCode = rateId;
  session.shippingCost = costCents;
  session.shippingMethodName = methodName;
  session.shippingCarrier = carrier;
  session.shippingEstimatedDays = estimatedDays;
  await session.save();
  await logCheckoutEvent({ correlationId: traceId, slice: "shipping", event: "shipping_saved", data: { rateId, costCents, carrier, methodName }, outcome: "success" });
  redirect("/checkout/payment");
}

export async function saveEmailToSession(email: string) {
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || "unknown";
  const cleanEmail = String(email).toLowerCase().trim().slice(0, 320);
  if (!cleanEmail || !cleanEmail.includes("@")) {
    await logCheckoutEvent({ correlationId: traceId, slice: "email", event: "email_invalid", data: { email: cleanEmail }, outcome: "error" });
    return { status: "FIX", message: "Please provide a valid email address." };
  }
  session.email = cleanEmail;
  await session.save();
  await logCheckoutEvent({ correlationId: traceId, slice: "email", event: "email_saved", data: { email: cleanEmail }, outcome: "success" });
  return { status: "ACCEPT" };
}
```

## app/components/features/checkout/CheckoutPanel.tsx

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutPanelProps {
  disabled?: boolean;
  itemCount: number;
  subtotalCents: number;
}

export default function CheckoutPanel({ disabled, itemCount, subtotalCents }: CheckoutPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const handleCheckout = async () => {
    if (disabled || isProcessing) return;
    setIsProcessing(true); setError(null);
    try {
      router.push("/checkout/address");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setIsProcessing(false);
    }
  };
  const formattedSubtotal = (subtotalCents / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
  return (
    <div className="card-base space-y-4">
      <div className="flex items-center justify-between type-body">
        <span className="text-text-secondary">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
        <span className="type-price">{formattedSubtotal}</span>
      </div>
      <button onClick={handleCheckout} disabled={disabled || isProcessing} className="btn-cart-large w-full justify-center">
        {isProcessing ? "Processingâ€¦" : "Checkout"}
      </button>
      {error && <p className="type-caption text-error-500 text-center">{error}</p>}
    </div>
  );
}
```

## app/components/features/checkout/reservation/CheckoutButton.tsx

```tsx
"use client";
import { useState } from "react";
import { initCheckoutSession } from "@/app/actions/checkout";

interface CheckoutButtonProps {
  basketItems: { productId: string; quantity: number }[];
  disabled?: boolean;
}

export default function CheckoutButton({ basketItems, disabled }: CheckoutButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleClick = async () => {
    if (disabled || isProcessing || !basketItems.length) return;
    setIsProcessing(true); setError(null);
    const formData = new FormData();
    formData.set("basket", JSON.stringify(basketItems));
    try {
      await initCheckoutSession(formData);
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setIsProcessing(false);
    }
  };
  return (
    <div className="space-y-2">
      <button onClick={handleClick} disabled={disabled || isProcessing || !basketItems.length} className="btn-cart-large w-full justify-center">
        {isProcessing ? "Processingâ€¦" : "Checkout"}
      </button>
      {error && <p className="type-caption text-error-500 text-center">{error}</p>}
    </div>
  );
}
```

## app/components/features/basket/BasketSummary.tsx

```tsx
interface BasketSummaryProps {
  itemCount: number;
  subtotalCents: number;
  shippingEstimateCents?: number;
}

function formatPLN(cents: number): string {
  return (cents / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

export default function BasketSummary({ itemCount, subtotalCents, shippingEstimateCents }: BasketSummaryProps) {
  const total = shippingEstimateCents ? subtotalCents + shippingEstimateCents : subtotalCents;
  return (
    <div className="card-base space-y-3">
      <div className="flex items-center justify-between type-body">
        <span className="text-text-secondary">Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
        <span className="type-price">{formatPLN(subtotalCents)}</span>
      </div>
      {shippingEstimateCents !== undefined && (
        <div className="flex items-center justify-between type-body">
          <span className="text-text-secondary">Shipping estimate</span>
          <span className="type-price">{formatPLN(shippingEstimateCents)}</span>
        </div>
      )}
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between type-section-sub">
          <span>Estimated total</span>
          <span className="tabular-nums text-brand-400">{formatPLN(total)}</span>
        </div>
      </div>
    </div>
  );
}
```

## lib/session.ts

```ts
import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface CheckoutSession {
  basket?: { productId: string; quantity: number }[];
  address?: { firstName?: string; lastName?: string; phone?: string; regionCode: string; postalCode: string; street: string; streetNumber: string; city: string; };
  shippingCode?: string;
  shippingCost?: number;
  shippingMethodName?: string;
  shippingCarrier?: string;
  shippingEstimatedDays?: number;
  email?: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  completedPaymentIntentId?: string;
  lastPaymentIntentId?: string;
}

const sessionOptions = {
  cookieName: "sanglogium_checkout_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: { secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, httpOnly: true, maxAge: 60 * 60 * 24 * 7 },
};

export async function getCheckoutSession(): Promise<IronSession<CheckoutSession>> {
  const cookieStore = await cookies();
  return getIronSession<CheckoutSession>(cookieStore, sessionOptions);
}
```

## lib/stripe.ts

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-12-01.acacia" });

export async function retrievePaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id, { expand: ["latest_charge"] });
}
```
## lib/checkout/createOrderFromPaymentIntent.ts

```ts
import { stripe } from "@/lib/stripe";
import { checkoutClient } from "@/sanity-cms/lib/checkoutClient";
import { client } from "@/sanity-cms/lib/client";
import { getBackendClient } from "@/sanity-cms/lib/backendClient";
import groq from "groq";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

export interface OrderSessionData {
  basket: { productId: string; quantity: number }[];
  address?: any;
  shippingCode?: string;
  shippingCost?: number;
  shippingMethodName?: string;
  shippingCarrier?: string;
  shippingEstimatedDays?: number;
  email?: string;
  checkoutSessionId?: string;
  userId?: string;
}

export async function createOrderFromPaymentIntent(pi: Stripe.PaymentIntent, sessionData: OrderSessionData | null) {
  const traceId = pi.metadata?.checkoutSessionId || pi.id || "unknown";
  await logCheckoutEvent({ correlationId: traceId, slice: "order-create", event: "order_create_start", data: { paymentIntentId: pi.id }, outcome: "success" });
  const existing = await client.fetch(groq`*[_type == "order" && paymentIntentId == $id][0]{ _id }`, { id: pi.id });
  if (existing) {
    await logCheckoutEvent({ correlationId: traceId, slice: "order-create", event: "order_idempotent_skip", data: { paymentIntentId: pi.id, orderId: existing._id }, outcome: "success" });
    return existing._id;
  }
  let items: { productId: string; name: string; quantity: number; unitPrice: number; lineTotal: number; condition?: string }[] = [];
  let subtotal = 0;
  let shippingCost = 0;
  let address: any = {};
  let email = pi.receipt_email || "";
  if (sessionData?.basket?.length) {
    const ids = sessionData.basket.map((i) => i.productId);
    const products = await getBackendClient().fetch(groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount } }`, { ids });
    items = sessionData.basket.map((item) => {
      const product = products.find((p: any) => p._id === item.productId);
      const unitPrice = product?.price_data?.unit_amount ?? 0;
      return { productId: item.productId, name: product?.name || "Product", quantity: item.quantity, unitPrice, lineTotal: unitPrice * item.quantity };
    });
    subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    shippingCost = sessionData.shippingCost ?? 0;
    address = sessionData.address ?? {};
    email = sessionData.email || email;
  } else {
    const metadataItems = pi.metadata?.basketItems?.split(",") || [];
    const metadataShipping = Number(pi.metadata?.shippingCost) || 0;
    items = metadataItems.map((entry: string) => {
      const [productId, qtyStr] = entry.split(":");
      return { productId, name: "Product", quantity: Number(qtyStr) || 1, unitPrice: 0, lineTotal: 0 };
    });
    shippingCost = metadataShipping;
  }
  const total = Math.round(subtotal + shippingCost);
  const vatAmount = total - Math.round(total / 1.23);
  const charge = typeof pi.latest_charge === "object" && pi.latest_charge !== null ? pi.latest_charge : null;
  const paymentMethod = charge?.payment_method_details?.type ?? "unknown";
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const doc = {
    _type: "order",
    orderNumber,
    paymentIntentId: pi.id,
    status: "confirmed",
    items: items.map((item) => ({ _type: "orderItem", _key: crypto.randomUUID(), ...item })),
    subtotal,
    shippingCost,
    totalAmount: total,
    vatAmount,
    shippingAddress: address,
    email,
    paymentMethod,
    userId: sessionData?.userId ?? null,
    _createdAt: new Date().toISOString(),
  };
  const result = await checkoutClient.create(doc);
  await logCheckoutEvent({ correlationId: traceId, slice: "order-create", event: "order_created", data: { orderId: result._id, orderNumber }, outcome: "success" });
  if (email) {
    try { await sendOrderConfirmationEmail(email, orderNumber, total); }
    catch (err: any) { await logCheckoutEvent({ correlationId: traceId, slice: "order-create", event: "order_email_failed", data: { error: err.message }, outcome: "error" }); }
  }
  for (const item of items) {
    try {
      await getBackendClient().patch(item.productId).dec({ stock: item.quantity }).commit();
      await logCheckoutEvent({ correlationId: traceId, slice: "order-create", event: "stock_decremented", data: { productId: item.productId, quantity: item.quantity }, outcome: "success" });
    } catch (err: any) {
      await logCheckoutEvent({ correlationId: traceId, slice: "order-create", event: "stock_decrement_failed", data: { productId: item.productId, error: err.message }, outcome: "error" });
    }
  }
  return result._id;
}
```

## lib/shipping/allekurier-rates.ts

```ts
import { logCheckoutEvent } from "@/lib/dev/event-logger";

interface Parcel { width: number; height: number; length: number; weight: number; }
interface Address { country: string; city: string; postalCode: string; street?: string; }

export interface ShippingOption {
  provider: string;
  servicelevel: { name: string };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

export async function fetchAlleKurierRates({ parcels, recipientAddress }: { parcels: Parcel[]; recipientAddress: Address }): Promise<ShippingOption[]> {
  const traceId = crypto.randomUUID();
  await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "allekurier_request", data: { parcelCount: parcels.length, country: recipientAddress.country }, outcome: "success" });
  const username = process.env.ALLEKURIER_EMAIL;
  const password = process.env.ALLEKURIER_PASSWORD;
  if (!username || !password) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "allekurier_missing_credentials", data: {}, outcome: "error" });
    return [];
  }
  const totalWeight = parcels.reduce((s, p) => s + p.weight, 0);
  const maxWidth = Math.max(...parcels.map((p) => p.width));
  const maxHeight = Math.max(...parcels.map((p) => p.height));
  const maxLength = Math.max(...parcels.map((p) => p.length));
  const payload = {
    username, password,
    from: { country: "PL", city: "Warszawa", postal_code: "00-001" },
    to: { country: recipientAddress.country, city: recipientAddress.city, postal_code: recipientAddress.postalCode },
    package: { weight: totalWeight, width: maxWidth, height: maxHeight, length: maxLength },
  };
  try {
    const res = await fetch("https://api.allekurier.pl/v1/rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data?.rates)) {
      await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "allekurier_error", data: { status: res.status, data }, outcome: "error" });
      return [];
    }
    const mapped: ShippingOption[] = data.rates.map((r: any) => ({
      provider: r.carrier || "AlleKurier", servicelevel: { name: r.service || "Standard" },
      rateId: r.id || `ak-${Math.random().toString(36).slice(2)}`,
      amount: Number(r.price) || 0, currency: r.currency || "PLN", estimatedDays: r.estimated_days || 3,
    }));
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "allekurier_success", data: { rateCount: mapped.length }, outcome: "success" });
    return mapped;
  } catch (err: any) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "allekurier_exception", data: { error: err.message }, outcome: "error" });
    return [];
  }
}
```

## lib/shipping/carrier-rates.ts

```ts
import { ShippingOption } from "./allekurier-rates";

const CARRIERS = [
  { name: "DHL", baseRate: 14.99, perKg: 0.8, perParcel: 2.5, speed: 2 },
  { name: "FedEx", baseRate: 16.99, perKg: 0.9, perParcel: 3.0, speed: 2 },
  { name: "UPS", baseRate: 15.99, perKg: 0.85, perParcel: 2.8, speed: 3 },
  { name: "InPost", baseRate: 9.99, perKg: 0.5, perParcel: 1.5, speed: 3 },
  { name: "DPD", baseRate: 12.99, perKg: 0.7, perParcel: 2.0, speed: 2 },
];

function calculateDistanceScore(cityA: string, cityB: string): number {
  const majorCities = ["warszawa", "krakÃ³w", "krakow", "wrocÅ‚aw", "wroclaw", "gdaÅ„sk", "gdansk", "poznaÅ„", "poznan", "Å‚Ã³dÅº", "lodz"];
  const a = cityA.toLowerCase();
  const b = cityB.toLowerCase();
  if (a === b) return 0;
  const aMajor = majorCities.includes(a);
  const bMajor = majorCities.includes(b);
  if (aMajor && bMajor) return 1;
  if (aMajor || bMajor) return 2;
  return 3;
}

export function getMockPLRates({ weight, parcelsCount, city, postalCode }: { weight: number; parcelsCount: number; city?: string; postalCode?: string }): ShippingOption[] {
  const distance = calculateDistanceScore(city || "", "Warszawa");
  return CARRIERS.map((carrier) => {
    const amount = Math.round((carrier.baseRate + weight * carrier.perKg + parcelsCount * carrier.perParcel + distance * 1.5) * 100) / 100;
    return {
      provider: carrier.name, servicelevel: { name: `${carrier.name} Standard` },
      rateId: `mock-pl-${carrier.name.toLowerCase()}-${postalCode || "00000"}`,
      amount, currency: "PLN", estimatedDays: carrier.speed + distance,
    };
  });
}
```

## lib/shipping/countryDetector.ts

```ts
let cachedCountry: string | null = null;

export async function detectCountry(): Promise<string> {
  if (cachedCountry) return cachedCountry;
  try {
    const res = await fetch("https://ipapi.co/json/", { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data?.country_code) { cachedCountry = data.country_code; return cachedCountry; }
  } catch { /* fallback */ }
  try {
    if (typeof navigator !== "undefined" && navigator.language) {
      const region = navigator.language.split("-")[1];
      if (region) { cachedCountry = region.toUpperCase(); return cachedCountry; }
    }
  } catch { /* fallback */ }
  cachedCountry = "PL";
  return cachedCountry;
}
```

## lib/shipping/de-rates.ts

```ts
import { fetchPacklinkRates } from "./packlink-rates";

export async function fetchDERates({ parcels, recipientAddress }: any) {
  return fetchPacklinkRates({ parcels, recipientAddress, fromCountry: "DE" });
}
```

## lib/shipping/gb-rates.ts

```ts
import { fetchPacklinkRates } from "./packlink-rates";

export async function fetchGBRates({ parcels, recipientAddress }: any) {
  return fetchPacklinkRates({ parcels, recipientAddress, fromCountry: "GB" });
}
```

## lib/shipping/packlink-rates.ts

```ts
import { ShippingOption } from "./allekurier-rates";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

interface Parcel { width: number; height: number; length: number; weight: number; }
interface Address { country: string; city: string; postalCode: string; street?: string; }

export async function fetchPacklinkRates({ parcels, recipientAddress, fromCountry = "PL" }: { parcels: Parcel[]; recipientAddress: Address; fromCountry?: string }): Promise<ShippingOption[]> {
  const traceId = crypto.randomUUID();
  await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "packlink_request", data: { parcelCount: parcels.length, from: fromCountry, to: recipientAddress.country }, outcome: "success" });
  const apiKey = process.env.PACKLINK_PRO_API;
  if (!apiKey) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "packlink_missing_key", data: {}, outcome: "error" });
    return [];
  }
  const totalWeight = parcels.reduce((s, p) => s + p.weight, 0);
  const maxWidth = Math.max(...parcels.map((p) => p.width));
  const maxHeight = Math.max(...parcels.map((p) => p.height));
  const maxLength = Math.max(...parcels.map((p) => p.length));
  const url = new URL("https://api.packlink.com/v1/services");
  url.searchParams.set("from[country]", fromCountry);
  url.searchParams.set("to[country]", recipientAddress.country);
  url.searchParams.set("to[city]", recipientAddress.city);
  url.searchParams.set("to[zip]", recipientAddress.postalCode);
  url.searchParams.set("weight", String(totalWeight));
  url.searchParams.set("width", String(maxWidth));
  url.searchParams.set("height", String(maxHeight));
  url.searchParams.set("length", String(maxLength));
  try {
    const res = await fetch(url.toString(), { headers: { "Authorization": apiKey } });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data)) {
      await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "packlink_error", data: { status: res.status, data }, outcome: "error" });
      return [];
    }
    const mapped: ShippingOption[] = data.map((r: any) => ({
      provider: r.carrier_name || "Packlink", servicelevel: { name: r.service_name || "Standard" },
      rateId: r.id || `pl-${Math.random().toString(36).slice(2)}`,
      amount: Number(r.price?.total?.amount) || 0, currency: r.price?.total?.currency || "EUR", estimatedDays: r.estimated_delivery_days || 5,
    }));
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "packlink_success", data: { rateCount: mapped.length }, outcome: "success" });
    return mapped;
  } catch (err: any) {
    await logCheckoutEvent({ correlationId: traceId, slice: "shipping-api", event: "packlink_exception", data: { error: err.message }, outcome: "error" });
    return [];
  }
}
```

## lib/shipping/parcel-calculator.ts

```ts
interface BasketItem { productId: string; quantity: number; }
interface Product { _id: string; dimensions?: { width: number; height: number; length: number; }; weight?: number; }
interface Parcel { width: number; height: number; length: number; weight: number; }

const COURIER_LIMITS = { maxWeight: 31.5, maxVolume: 100000 };
const DEFAULT_PARCEL = { width: 20, height: 15, length: 30, weight: 0.5 };

export function calculateParcelsFromBasket(basket: BasketItem[], products: Product[]): Parcel[] {
  const parcels: Parcel[] = [];
  for (const item of basket) {
    const product = products.find((p) => p._id === item.productId);
    const dims = product?.dimensions ?? DEFAULT_PARCEL;
    const weight = product?.weight ?? DEFAULT_PARCEL.weight;
    for (let i = 0; i < item.quantity; i++) {
      parcels.push({ ...dims, weight });
    }
  }
  return consolidateParcels(parcels);
}

export function calculateParcelsFromBasketReservation(items: { productId: string; quantity: number; dimensions?: any; weight?: number }[]): Parcel[] {
  const parcels: Parcel[] = [];
  for (const item of items) {
    const dims = item.dimensions ?? DEFAULT_PARCEL;
    const weight = item.weight ?? DEFAULT_PARCEL.weight;
    for (let i = 0; i < item.quantity; i++) {
      parcels.push({ width: dims.width ?? DEFAULT_PARCEL.width, height: dims.height ?? DEFAULT_PARCEL.height, length: dims.length ?? DEFAULT_PARCEL.length, weight });
    }
  }
  return consolidateParcels(parcels);
}

function consolidateParcels(parcels: Parcel[]): Parcel[] {
  if (!parcels.length) return [];
  const consolidated: Parcel[] = [];
  let current: Parcel = { ...parcels[0] };
  for (let i = 1; i < parcels.length; i++) {
    const next = parcels[i];
    const combinedWeight = current.weight + next.weight;
    const combinedVolume = current.width * current.height * current.length + next.width * next.height * next.length;
    if (combinedWeight <= COURIER_LIMITS.maxWeight && combinedVolume <= COURIER_LIMITS.maxVolume) {
      current.weight = combinedWeight;
      current.width = Math.max(current.width, next.width);
      current.height = Math.max(current.height, next.height);
      current.length = Math.max(current.length, next.length);
    } else {
      consolidated.push(current);
      current = { ...next };
    }
  }
  consolidated.push(current);
  return consolidated;
}
```
## lib/auth.ts

```ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email";
import { getBackendClient } from "@/sanity-cms/lib/backendClient";

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: process.env.DATABASE_URL!,
  },
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await getBackendClient().create({ _type: "userProfile", userId: user.id, email: user.email, name: user.name || "" });
          } catch { /* healing handled elsewhere */ }
        },
      },
    },
  },
});
```

## lib/auth-client.ts

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });
```

## lib/auth/dal.ts

```ts
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBackendClient } from "@/sanity-cms/lib/backendClient";
import groq from "groq";

const CACHE = new Map<string, { userId: string; email: string; name: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function verifySession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const cached = CACHE.get(session.user.id);
  if (cached && cached.expiresAt > Date.now()) return cached;
  let profile = await getBackendClient().fetch(groq`*[_type == "userProfile" && userId == $id][0]{ userId, email, name }`, { id: session.user.id });
  if (!profile) {
    try {
      await getBackendClient().create({ _type: "userProfile", userId: session.user.id, email: session.user.email, name: session.user.name || "" });
      profile = { userId: session.user.id, email: session.user.email, name: session.user.name || "" };
    } catch { profile = { userId: session.user.id, email: session.user.email, name: session.user.name || "" }; }
  }
  const result = { userId: profile.userId, email: profile.email, name: profile.name, expiresAt: Date.now() + CACHE_TTL_MS };
  CACHE.set(session.user.id, result);
  return result;
}

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { userId: session.user.id, email: session.user.email, name: session.user.name || "" };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function headers() {
  const cookieStore = await cookies();
  return new Headers({ cookie: cookieStore.toString() });
}
```

## lib/email.ts

```ts
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, url: string) {
  if (!resend) { console.log(`[DEV] Verification email to ${email}: ${url}`); return; }
  await resend.emails.send({ from: "noreply@sanglogium.com", to: email, subject: "Verify your email", html: `<p>Click to verify: <a href="${url}">${url}</a></p>` });
}

export async function sendResetPasswordEmail(email: string, url: string) {
  if (!resend) { console.log(`[DEV] Reset password email to ${email}: ${url}`); return; }
  await resend.emails.send({ from: "noreply@sanglogium.com", to: email, subject: "Reset your password", html: `<p>Click to reset: <a href="${url}">${url}</a></p>` });
}

export async function sendOrderConfirmationEmail(email: string, orderNumber: string, totalCents: number) {
  if (!resend) { console.log(`[DEV] Order confirmation to ${email}: ${orderNumber}`); return; }
  const total = (totalCents / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
  await resend.emails.send({ from: "noreply@sanglogium.com", to: email, subject: `Order confirmed: ${orderNumber}`, html: `<p>Thank you for your order <strong>${orderNumber}</strong>.</p><p>Total: ${total}</p>` });
}
```

## lib/dev/event-logger.ts

```ts
export interface LogEvent {
  correlationId: string;
  slice: string;
  event: string;
  data: Record<string, unknown>;
  outcome: "success" | "error" | "warning";
  timestamp?: string;
}

export type CheckoutEvent = LogEvent;

export function generateTraceId(): string { return crypto.randomUUID(); }

export function generateCheckoutSessionId(): string { return `chk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }

function shouldLog(level: string): boolean {
  const configured = (process.env.LOG_LEVEL || "debug").toLowerCase();
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  return (levels as any)[level] <= (levels as any)[configured];
}

export async function logCheckoutEvent(event: LogEvent): Promise<void> {
  if (!shouldLog(event.outcome === "error" ? "error" : "info")) return;
  const timestamp = new Date().toISOString();
  const logLine = JSON.stringify({ ...event, timestamp });
  console.log(logLine);
}
```

## store/basketStore.ts

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BasketItem { productId: string; quantity: number; }

interface BasketState {
  items: BasketItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  getItemCount: () => number;
  getSubtotal: (prices: Record<string, number>) => number;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === productId);
        if (existing) {
          set({ items: items.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { productId, quantity }] });
        }
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      increment: (productId) => {
        set({ items: get().items.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i) });
      },
      decrement: (productId) => {
        const items = get().items;
        const item = items.find((i) => i.productId === productId);
        if (!item) return;
        if (item.quantity <= 1) {
          set({ items: items.filter((i) => i.productId !== productId) });
        } else {
          set({ items: items.map((i) => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i) });
        }
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
        } else {
          set({ items: get().items.map((i) => i.productId === productId ? { ...i, quantity } : i) });
        }
      },
      clear: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: (prices) => get().items.reduce((sum, i) => sum + (prices[i.productId] || 0) * i.quantity, 0),
    }),
    { name: "sanglogium-basket", storage: createJSONStorage(() => localStorage) }
  )
);
```

## sanity-cms/lib/client.ts

```ts
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-06-01",
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-06-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(client);
export function urlFor(source: any) { return builder.image(source); }
```

## sanity-cms/lib/backendClient.ts

```ts
import { createClient } from "next-sanity";

export function getBackendClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: "2024-06-01",
    useCdn: false,
    token: process.env.SANITY_STUDIO_READ_WRITE!,
  });
}
```

## sanity-cms/lib/checkoutClient.ts

```ts
import { createClient } from "next-sanity";

export const checkoutClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-06-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE!,
});
```
## [CORRECTED] store/basketStore.ts

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";

const BasketItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

type BasketItem = z.infer<typeof BasketItemSchema>;

interface BasketState {
  items: BasketItem[];
  _hasHydrated: boolean;
}

interface BasketActions {
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
}

type BasketStore = BasketState & BasketActions;

const createFallbackStorage = () => {
  const storage = {
    getItem: (name: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(name);
        }
      } catch (e) {
        console.warn("localStorage getItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          return sessionStorage.getItem(name);
        }
      } catch (e2) {
        console.warn("sessionStorage getItem failed", e2);
      }
      return null;
    },
    setItem: (name: string, value: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(name, value);
        }
      } catch (e) {
        console.warn("localStorage setItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(name, value);
        }
      } catch (e2) {
        console.warn("sessionStorage setItem failed, graceful degradation", e2);
      }
    },
    removeItem: (name: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(name);
        }
      } catch (e) {
        console.warn("localStorage removeItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(name);
        }
      } catch (e2) {
        console.warn("sessionStorage removeItem failed", e2);
      }
    },
  };
  return storage;
};

const useBasketStore = create<BasketStore>()(
  persist(
    (set, get): BasketStore => ({
      items: [] as BasketItem[],
      _hasHydrated: false,
      addProduct: (productId) => {
        const result = BasketItemSchema.safeParse({ productId, quantity: 1 });
        if (!result.success) {
          console.error("Invalid input:", result.error);
          return;
        }
        const items = get().items;
        const existing = items.find((item) => item.productId === productId);
        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ items: [...items, result.data] });
        }
      },
      removeProduct: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },
      incrementQuantity: (productId) => {
        set({
          items: get().items.map((item) => {
            if (item.productId === productId) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        });
      },
      decrementQuantity: (productId) => {
        set({
          items: get()
            .items.map((item) => {
              if (item.productId === productId) {
                return { ...item, quantity: item.quantity - 1 };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        });
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.productId !== productId) });
          return;
        }
        const result = BasketItemSchema.safeParse({ productId, quantity });
        if (!result.success) {
          console.error("Invalid quantity:", result.error);
          return;
        }
        const items = get().items;
        const existing = items.find((item) => item.productId === productId);
        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: result.data.quantity }
                : item,
            ),
          });
        } else {
          set({ items: [...items, result.data] });
        }
      },
      clear: () => {
        set({ items: [] });
      },
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "basket-storage",
      storage: createJSONStorage(() => createFallbackStorage()),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state) {
          const result = z.array(BasketItemSchema).safeParse(state.items);
          if (!result.success) {
            console.error(
              "Invalid basket state from storage, resetting to empty:",
              result.error,
            );
            state.items = [];
          }
        }
      },
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);

export const selectTotalItemsCount = (state: BasketState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectItems = (state: BasketState) => state.items;

export const selectItem = (state: BasketState, productId: string) =>
  state.items.find((item) => item.productId === productId);

export const selectItemQuantity = (state: BasketState, productId: string) =>
  selectItem(state, productId)?.quantity ?? 0;

export const selectHasItem = (state: BasketState, productId: string) =>
  state.items.some((item) => item.productId === productId);

export const selectHasHydrated = (state: BasketState) => state._hasHydrated;

export default useBasketStore;
```

## app/actions/address/address.ts

```ts
"use server";
import { Address, ServerResponse } from "@/app/checkout/checkout.types";

interface RequestBody {
  address: {
    regionCode: string;
    postalCode: string;
    locality: string;
    addressLines: string[];
  };
  enableUspsCass: boolean;
}

interface GoogleAddressComponent {
  componentType: string;
  componentName: { text: string };
}

interface GoogleAddress {
  addressComponents: GoogleAddressComponent[];
  postalAddress?: { regionCode: string };
}

interface GoogleValidationVerdict {
  inputGranularity: string;
  validationGranularity: string;
  geocodeGranularity: string;
  addressComplete: boolean;
  hasReplacedComponents: boolean;
  hasSpellCorrectedComponents: boolean;
  hasInferredComponents: boolean;
}

export interface GoogleValidationResponse {
  result?: {
    verdict?: GoogleValidationVerdict;
    address?: GoogleAddress;
    geocode?: {
      location: { latitude: number; longitude: number };
      placeId?: string;
    };
  };
}

const ALLOWED_GRANULARITY = new Set(["PREMISE", "SUB_PREMISE"]);

const formatCleanAddress = (
  googleAddress: GoogleAddress,
  input: Address,
  normalizedRegion: string
): Address => {
  const components = new Map(
    googleAddress.addressComponents.map((c) => [c.componentType, c.componentName.text])
  );
  const get = (type: string) => components.get(type);
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    street: get("route") || input.street,
    streetNumber: [get("street_number"), get("subpremise")].filter(Boolean).join("/") || input.streetNumber,
    city: get("locality") || get("postal_town") || input.city,
    postalCode: get("postal_code") || input.postalCode,
    regionCode: googleAddress.postalAddress?.regionCode || normalizedRegion,
  };
};

function isAcceptedAddress(verdict: GoogleValidationVerdict): boolean {
  if (!verdict.addressComplete) return false;
  if (verdict.hasInferredComponents) return false;
  return ALLOWED_GRANULARITY.has(verdict.inputGranularity) && ALLOWED_GRANULARITY.has(verdict.validationGranularity);
}

export async function submitShippingAction(input: Address): Promise<ServerResponse> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { status: "FIX", errors: { message: "Internal configuration error." } };
  }
  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;
  const regionCode = input.regionCode === "UK" ? "GB" : input.regionCode;
  const addressLine = [input.street, input.streetNumber].filter(Boolean).join(" ").trim();
  const payload: RequestBody = {
    address: { regionCode, postalCode: input.postalCode, locality: input.city, addressLines: [addressLine] },
    enableUspsCass: false,
  };
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Address validation failed: ${response.status} ${response.statusText}`, errorBody);
      const message = response.status === 400 ? "Invalid address format. Please check your input."
        : response.status === 401 ? "Address validation service authentication error."
        : "Address validation service temporarily unavailable.";
      return { status: "FIX", errors: { message } };
    }
    const data = (await response.json()) as GoogleValidationResponse;
    const verdict = data.result?.verdict;
    const googleAddress = data.result?.address;
    if (verdict && googleAddress && isAcceptedAddress(verdict)) {
      const cleanAddress = formatCleanAddress(googleAddress, input, regionCode);
      return { status: "ACCEPT", address: cleanAddress, geocode: data.result?.geocode, placeId: data.result?.geocode?.placeId };
    }
    return { status: "FIX", errors: { message: "Address could not be strictly validated." } };
  } catch (err) {
    console.error("Address Validation Error:", err);
    return { status: "FIX", errors: { message: "Address validation service temporarily unavailable. Please return later." } };
  }
}
```
## app/components/features/basket/BasketManager.tsx

```tsx
"use client";
import { useShallow } from "zustand/shallow";
import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import useBasketStore from "@/store/basketStore";
import { detectCountry } from "@/lib/shipping/countryDetector";
import { DEFAULT_PARCEL } from "@/lib/shipping/parcel-calculator";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";

interface CmsProduct {
  _id: string;
  name: string;
  image: string;
  stock: number;
  reservedStock: number;
  price_data: { unit_amount: number; currency: string };
  parcel?: { length: number; width: number; height: number; weight: number; distance_unit: string; mass_unit: string };
}

async function fetchBasketProducts(productIds: string[]) {
  if (productIds.length === 0) return [];
  const res = await fetch(`/api/basket/products?ids=${productIds.map(encodeURIComponent).join(",")}`);
  if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || "Unable to load products"); }
  const result = await res.json();
  if (!result.success) throw new Error(result.error || "Unable to load products");
  return result.data || [];
}

export default function BasketManager() {
  const { items: basket, _hasHydrated } = useBasketStore(useShallow((state) => ({ items: state.items, _hasHydrated: state._hasHydrated })));
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const currentProductIds = useMemo(() => basket.map((item) => item.productId), [basket]);
  const [trackedIds, setTrackedIds] = useState<string[]>([]);
  useEffect(() => {
    if (!_hasHydrated) return;
    setTrackedIds((prev) => { const prevSet = new Set(prev); const newIds = currentProductIds.filter((id) => !prevSet.has(id)); return newIds.length > 0 ? [...prev, ...newIds] : prev; });
  }, [currentProductIds, _hasHydrated]);
  const swrKey = _hasHydrated && trackedIds.length > 0 ? `basket-products:${[...trackedIds].sort().join(",")}` : null;
  const { data: cmsProducts = [], error, isLoading } = useSWR<CmsProduct[]>(swrKey, () => fetchBasketProducts(trackedIds), { revalidateOnFocus: false, revalidateOnReconnect: false });
  const enrichedItems = useMemo(() => {
    return basket.map((item) => {
      const product = cmsProducts.find((p) => p._id === item.productId);
      if (!product) return null;
      const displayPrice = product.price_data.unit_amount / 100;
      const availableStock = Math.max(0, product.stock - product.reservedStock);
      const cappedQuantity = Math.min(item.quantity, availableStock);
      return { productId: item.productId, quantity: cappedQuantity, originalQuantity: item.quantity, name: product.name, displayPrice, image: product.image, price_data: product.price_data, availableStock, parcel: product.parcel };
    }).filter((item): item is NonNullable<typeof item> => item !== null).sort((a, b) => { const aAvailable = a.availableStock > 0; const bAvailable = b.availableStock > 0; if (aAvailable === bAvailable) return 0; return aAvailable ? -1 : 1; });
  }, [basket, cmsProducts]);
  const { itemCount, subtotal, checkoutData, parcelData } = useMemo(() => {
    const count = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = enrichedItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);
    const checkoutItems = enrichedItems.filter((item) => item.quantity > 0).map((item) => ({ productId: item.productId, quantity: item.quantity, price_data: item.price_data, parcel: item.parcel, availableStock: item.availableStock }));
    const parcels = enrichedItems.flatMap((item) => { const parcel = item.parcel ?? DEFAULT_PARCEL; const safeQty = Math.max(0, Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 0); if (safeQty === 0) return []; return Array(safeQty).fill(parcel); });
    return { itemCount: count, subtotal: total, checkoutData: checkoutItems, parcelData: parcels };
  }, [enrichedItems]);
  useEffect(() => {
    if (parcelData.length === 0) return;
    setShippingCost(null);
    const timeoutId = setTimeout(() => {
      const fetchShippingRates = async () => {
        try {
          const country = await detectCountry();
          const res = await fetch('/api/basket/shipping-rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parcelData, countryCode: country }) });
          const data = await res.json();
          setShippingCost(data.rate.amount);
        } catch (e) { console.error('Failed to fetch shipping rates:', e); }
      };
      fetchShippingRates();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [parcelData]);
  if (!_hasHydrated || isLoading) return <BasketSkeleton />;
  if (basket.length === 0) return <EmptyBasket />;
  if (error) return <div className="card-base p-6"><p className="text-error-700 type-body">{error.message}</p></div>;
  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-[65%_1fr] lg-desktop:grid-cols-[65%_1fr]">
      <div className="card-base overflow-hidden pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[minmax(0,1fr)_auto_auto] lg-desktop:grid lg-desktop:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[2rem]">
          <div className="type-overline">Product</div>
          <div className="type-overline text-right">Quantity & Total</div>
          <div className="type-overline"></div>
        </div>
        {enrichedItems.map((item) => (
          <BasketItem key={item.productId} productId={item.productId} name={item.name} quantity={item.quantity} displayPrice={item.displayPrice} image={item.image} availableStock={item.availableStock} originalQuantity={item.originalQuantity} />
        ))}
      </div>
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark">
          <BasketSummary itemCount={itemCount} subtotal={subtotal} basketData={checkoutData} shippingCost={shippingCost} />
        </div>
      </div>
      <div className="lg-touch:hidden lg-desktop:hidden fixed bottom-[var(--mobile-menu-h)] left-0 w-full z-40 bg-surface-card border-t border-border-secondary px-4 py-4">
        <BasketSummary itemCount={itemCount} subtotal={subtotal} basketData={checkoutData} shippingCost={shippingCost} />
      </div>
    </div>
  );
}
```

## app/components/features/basket/BasketItem.tsx

```tsx
"use client";
import React from "react";
import Image from "next/image";
import { Trash } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";
import { BasketControls } from "./BasketControls";
import useBasketStore from "@/store/basketStore";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";

interface BasketItemProps {
  productId: string;
  name: string;
  quantity: number;
  displayPrice: number;
  image?: any;
  availableStock: number;
  originalQuantity?: number;
  variant?: string;
}

export default function BasketItem({ productId, name, quantity, displayPrice, image, availableStock, originalQuantity, variant }: BasketItemProps) {
  const isOutOfStock = availableStock === 0;
  const { removeProduct } = useBasketStore(useShallow((state) => ({ removeProduct: state.removeProduct })));
  const assetRef = image?.asset?._ref || image?.asset?._id;
  const handleRemove = () => { removeProduct(productId); };
  return (
    <>
      <article className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto] items-start px-6 py-5 gap-[2rem] border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        <div className="item-identity flex flex-row items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary">
            {assetRef ? (<Image src={assetRef} loader={sanityImageLoader} alt={name} fill sizes="96px" className="object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-text-caption type-caption">No image</div>)}
          </div>
          <div className="item-text-stack flex flex-col min-w-0 gap-1">
            <h3 className="type-card-title line-clamp-4">{name}</h3>
            {variant && (<span className="type-metadata">{variant}</span>)}
            {isOutOfStock && (<span className="type-caption text-error-700 font-medium">Out of Stock</span>)}
            <span className="type-caption text-text-secondary tabular-nums">{displayPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-8 justify-end mt-5">
          {originalQuantity && originalQuantity > quantity && (<span className="type-caption text-text-caption line-through">{originalQuantity}</span>)}
          <fieldset disabled={isOutOfStock} className="border-0 p-0 m-0 min-w-0">
            <BasketControls productId={productId} name={name} isBasketPage={true} maxQuantity={availableStock} displayQuantity={quantity} showRemoveButton={false} />
          </fieldset>
          <div className="w-24 text-right"><span className="tabular-nums">{(displayPrice * quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        </div>
        <div className="item-actions flex items-center justify-center mt-5">
          <button onClick={handleRemove} data-testid={`remove-${productId}`} aria-label={`Remove ${name} from basket`} type="button" className="text-text-secondary hover:text-red-500/80 transition-colors duration-200 p-2"><Trash size={20} /></button>
        </div>
      </article>
      <div className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-start gap-3 py-3">
          <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary">
            {assetRef ? (<Image src={assetRef} loader={sanityImageLoader} alt={name} fill sizes="64px" className="object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-text-caption type-caption">No image</div>)}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="text-sm font-normal text-text-body leading-snug">{name}</h3>
            {variant && (<span className="type-metadata">{variant}</span>)}
            {isOutOfStock && (<span className="text-xs text-error-700 font-medium">Out of Stock</span>)}
            <span className="type-caption text-text-secondary tabular-nums">{displayPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between flex-wrap gap-4 pt-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            {originalQuantity && originalQuantity > quantity && (<span className="type-caption text-text-caption line-through">{originalQuantity}</span>)}
            <fieldset disabled={isOutOfStock} className="border-0 p-0 m-0 min-w-0">
              <BasketControls productId={productId} name={name} isBasketPage={true} maxQuantity={availableStock} displayQuantity={quantity} showRemoveButton={false} />
            </fieldset>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleRemove} data-testid={`remove-mobile-${productId}`} aria-label={`Remove ${name} from basket`} type="button" className="text-text-secondary hover:text-red-500/80 transition-colors duration-200 p-2"><Trash size={20} /></button>
            <span className="type-body font-bold tabular-nums">{(displayPrice * quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </>
  );
}
```

## app/components/features/basket/BasketControls.tsx

```tsx
"use client";
import { useShallow } from 'zustand/shallow';
import { ShoppingCart } from "@phosphor-icons/react";
import useBasketStore from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  name?: string;
  isBasketPage: boolean;
  maxQuantity?: number;
  displayQuantity?: number;
  addClassName?: string;
  removeClassName?: string;
  decrementClassName?: string;
  incrementClassName?: string;
  quantityClassName?: string;
  wrapperClassName?: string;
  showRemoveButton?: boolean;
}

export function BasketControls({
  productId, name, isBasketPage, maxQuantity, displayQuantity,
  addClassName, removeClassName, decrementClassName, incrementClassName, quantityClassName, wrapperClassName, showRemoveButton,
}: BasketControlsProps) {
  const { items, addProduct, removeProduct, incrementQuantity, decrementQuantity } = useBasketStore(
    useShallow((state) => ({
      items: state.items, addProduct: state.addProduct, removeProduct: state.removeProduct,
      incrementQuantity: state.incrementQuantity, decrementQuantity: state.decrementQuantity,
    }))
  );
  const basketItem = items.find((item: any) => item.productId === productId);
  const isInBasket = !!basketItem;
  const storeQuantity = basketItem?.quantity || 0;
  const quantity = displayQuantity !== undefined ? displayQuantity : storeQuantity;
  const handleAdd = () => { addProduct(productId); };
  const handleIncrement = () => { if (maxQuantity !== undefined && quantity >= maxQuantity) return; incrementQuantity(productId); };
  const handleDecrement = () => { if (isBasketPage) { if (quantity > 1) decrementQuantity(productId); } else { decrementQuantity(productId); } };
  const handleRemove = () => { removeProduct(productId); };
  if (!isInBasket) {
    return (
      <button onClick={handleAdd} data-testid={`add-to-basket-${productId}`} type="button" className={addClassName || "btn-cart"}>
        <ShoppingCart size={16} /> Add
      </button>
    );
  }
  return (
    <div className={`flex items-center ${wrapperClassName || ""}`}>
      <div className="flex items-center">
        <button onClick={handleDecrement} data-testid={`decrement-${productId}`} type="button" disabled={isBasketPage && quantity <= 1}
          className={decrementClassName || "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"}>âˆ’</button>
        <span data-testid="quantity-display" className={quantityClassName || "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none"}>{quantity}</span>
        <button onClick={handleIncrement} data-testid={`increment-${productId}`} type="button" disabled={maxQuantity !== undefined && quantity >= maxQuantity}
          className={incrementClassName || "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150"}>+</button>
      </div>
      {isBasketPage && showRemoveButton !== false && (
        <button onClick={handleRemove} data-testid={`remove-${productId}`} type="button" className={removeClassName || "ml-3 text-text-caption hover:text-text-secondary transition-colors duration-150 text-small"}>Remove</button>
      )}
    </div>
  );
}
```
## app/components/features/basket/BasketSkeleton.tsx

```tsx
export default function BasketSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-[65%_1fr] lg-touch:grid-cols-[65%_1fr]" aria-busy="true" aria-label="Loading basket">
      <div className="pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="card-base overflow-hidden p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary-800/60 rounded-sm w-1/4"></div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-secondary-800/60 rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-800/60 rounded-sm w-3/4"></div>
                <div className="h-3 bg-secondary-800/60 rounded-sm w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-secondary-800/60 rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-800/60 rounded-sm w-2/3"></div>
                <div className="h-3 bg-secondary-800/60 rounded-sm w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary-800/60 rounded-sm w-1/2"></div>
            <div className="h-4 bg-secondary-800/60 rounded-sm w-3/4"></div>
            <div className="h-4 bg-secondary-800/60 rounded-sm w-2/3"></div>
            <div className="h-10 bg-secondary-800/60 rounded-sm w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## app/components/features/basket/EmptyBasket.tsx

```tsx
"use client";
import { ArrowLeftIcon, ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function EmptyBasket() {
  return (
    <div className="card-base flex flex-col items-center justify-center p-8 lg-desktop:p-12 lg-touch:p-12">
      <ShoppingCartIcon className="mb-6 text-text-caption opacity-40" size={64} />
      <h2 className="type-section-sub text-center">Your basket is empty</h2>
      <p className="type-body mb-8 max-w-md text-center">
        Looks like you haven&apos;t added any products to your basket yet.
        Browse our collection to find something you&apos;ll love.
      </p>
      <Link href="/" className="btn-primary flex items-center gap-2 py-3 px-6">
        <ArrowLeftIcon size={16} />
        Browse Headphones
      </Link>
    </div>
  );
}
```

## lib/utils/sanityImageLoader.ts

```ts
import urlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/sanity-cms/env";

const builder = urlBuilder({ projectId, dataset });

function sanityImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return builder.image(src).width(width).quality(quality || 75).auto("format").url();
}

export { sanityImageLoader };
export default sanityImageLoader;
```

## sanity-cms/env.ts

```ts
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || (process.env.NODE_ENV === 'test' ? 'test' : 'production'),
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
```

## sanity-cms/lib/orders/getOrderByPaymentIntentId.ts

```ts
import { backendClient } from "../backendClient";

export interface OrderForSuccessPage {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  isGuest: boolean;
  items: Array<{ productId: string; name: string; quantity: number; price: number; subtotal: number }>;
  pricing: { subtotal: number; shipping: number; tax: number; discount: number; total: number; currency: string };
  shippingAddress: { name: string; line1: string; city: string; state: string; postalCode: string; country: string };
  shippingMethod?: { name: string; carrier: string; price: number; estimatedDays?: number };
  status: string;
  dates: { orderedAt: string };
}

export async function fetchOrderByPaymentIntentId(paymentIntentId: string): Promise<OrderForSuccessPage | null> {
  return backendClient.fetch<OrderForSuccessPage | null>(
    `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{
      _id, orderNumber, customerEmail, isGuest,
      items[]{ productId, name, quantity, price, subtotal },
      pricing{ subtotal, shipping, tax, discount, total, currency },
      shippingAddress{ name, line1, city, state, postalCode, country },
      shippingMethod{ name, carrier, price, estimatedDays },
      status, dates{ orderedAt }
    }`,
    { paymentIntentId }
  );
}
```
## app/components/features/basket/BasketButton.tsx

```tsx
"use client";

import { ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { NavActionItem } from "@/app/components/layout/header/NavbarActions";
import useBasketStore, { selectTotalItemsCount, selectHasHydrated } from "@/store/basketStore";

export function BasketButton() {
  const itemCount = useBasketStore(selectTotalItemsCount);
  const hasHydrated = useBasketStore(selectHasHydrated);

  const displayCount = hasHydrated ? itemCount : 0;

  return (
    <Link href="/basket" data-testid="basket-button">
      <NavActionItem
        icon={<ShoppingCartIcon size={24} />}
        label="Cart"
        badgeCount={displayCount}
      />
    </Link>
  );
}
```

## app/components/features/basket/BasketUIMock.tsx

```tsx
"use client";

import React from "react";
import { Price } from "@/app/components/ui/Price";

interface MockItem {
  productId: string;
  name: string;
  variantLabel?: string;
  displayPrice: number;
  quantity: number;
}

const MOCK_ITEMS: MockItem[] = [
  { productId: "m1", name: "Audeze LCD-5 Flagship Planar Magnetic Open-Back Headphones with Fluxor Magnet Array and Uniforce Voice Coil Technology for Audiophile Reference Listening", variantLabel: "Color: Matte Black | Impedance: 300 Ohms | Pad: Perforated Lambskin", displayPrice: 14299.49, quantity: 1 },
  { productId: "m2", name: "Focal Utopia", variantLabel: "Color: Black Carbon | Cable: 3m Balanced XLR", displayPrice: 8999.99, quantity: 2 },
  { productId: "m3", name: "Sennheiser HD 800 S", displayPrice: 1399.0, quantity: 1 },
  { productId: "m4", name: "HiFiMAN Susvara", variantLabel: "Impedance: 60 Ohms | Sensitivity: 83 dB", displayPrice: 17999.0, quantity: 1 },
  { productId: "m5", name: "Meze Audio Elite", displayPrice: 3999.5, quantity: 3 },
  { productId: "m6", name: "Dan Clark Audio EXPANSE", variantLabel: "Color: Gunmetal | Pad: Leather", displayPrice: 3999.0, quantity: 1 },
  { productId: "m7", name: "Abyss AB-1266 Phi TC", displayPrice: 4995.0, quantity: 1 },
  { productId: "m8", name: "Stax SR-009S", variantLabel: "Earspeaker | Bias: 580V", displayPrice: 3925.0, quantity: 2 },
  { productId: "m9", name: "HIFIMAN HE1000se", displayPrice: 1999.0, quantity: 1 },
  { productId: "m10", name: "Focal Clear MG", variantLabel: "Color: Chestnut | Cable: 3.5mm Unbalanced", displayPrice: 1499.0, quantity: 2 },
  { productId: "m11", name: "Sony MDR-Z1R", displayPrice: 1699.99, quantity: 1 },
  { productId: "m12", name: "Audio-Technica ATH-ADX5000 Air Dynamic Open-Back Headphones with Tungsten-Coated Diaphragm and 3D Wing Support System for Extended Listening Sessions", variantLabel: "Color: Black | Impedance: 420 Ohms | Driver: 58mm", displayPrice: 1999.49, quantity: 1 },
];

function MockBasketItem({ item }: { item: MockItem }) {
  const lineTotal = item.displayPrice * item.quantity;
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center px-6 py-5 gap-5 border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary flex items-center justify-center text-text-caption type-caption">No image</div>
          <div className="flex flex-col min-w-0 gap-1">
            <h3 className="type-card-title line-clamp-2">{item.name}</h3>
            {item.variantLabel && <span className="text-text-secondary text-small">{item.variantLabel}</span>}
            <span className="text-text-caption hover:text-text-secondary transition-colors duration-150 cursor-pointer text-small mt-1">Remove</span>
          </div>
        </div>
        <div className="flex items-center justify-center whitespace-nowrap"><Price value={item.displayPrice} currency="PLN" /></div>
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Decrease quantity">âˆ’</button>
            <span className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none">{item.quantity}</span>
            <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div className="flex items-center justify-end whitespace-nowrap"><Price value={lineTotal} currency="PLN" /></div>
      </div>

      {/* Mobile */}
      <div className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-start gap-3 py-3">
          <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary flex items-center justify-center text-text-caption type-caption">No image</div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="type-card-title line-clamp-2">{item.name}</h3>
            {item.variantLabel && <span className="text-text-secondary text-small">{item.variantLabel}</span>}
            <span className="type-metadata">Unit: <Price value={item.displayPrice} currency="PLN" /></span>
            <span className="text-text-caption hover:text-text-secondary transition-colors duration-150 cursor-pointer text-small mt-0.5">Remove</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between py-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Decrease quantity">âˆ’</button>
              <span className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none">{item.quantity}</span>
              <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div className="type-price"><Price value={lineTotal} currency="PLN" /></div>
        </div>
      </div>
    </>
  );
}

function MockBasketSummary({ shippingCost }: { shippingCost: number | null }) {
  const subtotal = MOCK_ITEMS.reduce((s, i) => s + i.displayPrice * i.quantity, 0);
  const itemCount = MOCK_ITEMS.reduce((s, i) => s + i.quantity, 0);
  const total = shippingCost !== null ? subtotal + shippingCost : subtotal;
  return (
    <>
      <h2 className="type-section-sub border-b border-border-primary pb-4 mb-6">Basket Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-baseline gap-4">
          <span className="type-caption whitespace-nowrap">Subtotal ({itemCount} items)</span>
          <Price value={subtotal} variant="summary" currency="PLN" className="whitespace-nowrap" />
        </div>
        <div className="flex justify-between items-baseline gap-4">
          <span className="type-caption whitespace-nowrap">Shipping (estimated)</span>
          {shippingCost !== null ? (
            <Price value={shippingCost} variant="summary" currency="PLN" className="whitespace-nowrap" />
          ) : (
            <span className="type-caption whitespace-nowrap">Calculating...</span>
          )}
        </div>
        <div className="border-t border-border-primary pt-4 mt-1 mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <span className="type-section-sub whitespace-nowrap">Total</span>
            <span className="text-text-accent font-bold text-spotlight tabular-nums whitespace-nowrap">
              <Price value={total} variant="summary" currency="PLN" />
            </span>
          </div>
          <div className="type-caption mt-1 mb-4">Including VAT</div>
        </div>
      </div>
      <div className="pb-24 lg-touch:pb-0 lg-desktop:pb-0">
        <button type="button" className="btn-primary w-full px-6 py-3">Checkout</button>
        <button type="button" className="btn-secondary block text-center mt-3 py-3 w-full">Continue Shopping</button>
      </div>
    </>
  );
}

export default function BasketUIMock({ shippingCost = null }: { shippingCost?: number | null }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-[65%_1fr] lg-desktop:grid-cols-[65%_1fr]">
      <div className="card-base overflow-hidden pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg-desktop:grid lg-desktop:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-5">
          <div className="type-overline">Product</div>
          <div className="type-overline text-center">Price</div>
          <div className="type-overline text-center">Quantity</div>
          <div className="type-overline text-right">Total</div>
        </div>
        {MOCK_ITEMS.map((item) => (
          <MockBasketItem key={item.productId} item={item} />
        ))}
      </div>
      {/* Desktop sticky summary */}
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark">
          <MockBasketSummary shippingCost={shippingCost} />
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="lg-touch:hidden lg-desktop:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-card border-t border-border-secondary px-4 py-4">
        <MockBasketSummary shippingCost={shippingCost} />
      </div>
    </div>
  );
}
```

## sanity-cms/lib/orders/index.ts

```ts
// Export all order-related types
export type {
  OrderItem,
  ShippingAddress,
  BillingAddress,
  ShippingMethod,
  OrderPricing,
  PaymentInfo,
  OrderMetadata,
  CreateOrderOptions,
  Order,
  CreateOrderResult,
  CreateOrderError,
  CreateOrderResponse,
} from "./orderTypes";
```

## sanity-cms/lib/orders/orderTypes.ts

```ts
// TypeScript types for Order operations

export interface OrderItem {
  productRef?: string; // Reference ID (optional, for analytics)
  productId: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  price: number;
  compareAtPrice?: number;
  quantity: number;
  subtotal: number;
  discount?: {
    amount: number;
    code: string;
    type: string;
  };
  returnStatus?: string;
  refundedAmount?: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ShippingMethod {
  name: string;
  price: number;
  estimatedDays?: number;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  currency: string;
}

export interface PaymentInfo {
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  method?: string;
  last4?: string;
  brand?: string;
}

export interface OrderMetadata {
  source?: string;
  ip?: string;
  userAgent?: string;
  discountCodes?: string[];
  notes?: string;
  customerNotes?: string;
  giftMessage?: string;
  tags?: string[];
}

export interface CreateOrderOptions {
  // Customer info
  userId?: string;
  customerEmail: string;
  customerPhone?: string;
  isGuest?: boolean;

  // Order items
  items: OrderItem[];

  // Addresses
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;

  // Shipping
  shippingMethod?: ShippingMethod;

  // Pricing
  pricing: OrderPricing;

  // Payment
  payment?: PaymentInfo;

  // Metadata
  metadata?: OrderMetadata;
}

export interface Order extends CreateOrderOptions {
  _id: string;
  _type: "order";
  orderNumber: string;
  orderId: string;
  status: string;
  dates: {
    orderedAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    refundedAt?: string;
  };
}

export interface CreateOrderResult {
  success: true;
  order: Order;
}

export interface CreateOrderError {
  success: false;
  error: string;
  details?: unknown;
}

export type CreateOrderResponse = CreateOrderResult | CreateOrderError;
```
## app/api/shipping/route.ts

```ts
import { submitShippingAction } from "@/app/actions/address/address";

export const runtime = 'nodejs';

interface ShippingRequestBody {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { regionCode, postalCode, street, streetNumber, city } = body as ShippingRequestBody;

  // Call server action for Google validation
  // Contact fields are not required for standalone address validation
  const validation = await submitShippingAction({
    firstName: "",
    lastName: "",
    phone: "",
    regionCode,
    postalCode,
    street,
    streetNumber,
    city,
  });

  if (validation.status === "FIX" || !validation.address) {
    return Response.json({
      status: "FIX",
      correctedAddress: null,
    });
  }

  return Response.json({
    status: validation.status === "ACCEPT" ? "CONFIRMED" : "FIX",
    correctedAddress: validation.address,
  });
}
```
## app/(test)/checkout-seed/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/session";
import { Address } from "@/app/checkout/checkout.types";

const REAL_PRODUCT_ID = "3O1ZNp54LWQGln4uEAU7Vs";

const VALID_BASKET = [{ productId: REAL_PRODUCT_ID, quantity: 1 }];

const VALID_ADDRESS: Address = {
  firstName: "Jan",
  lastName: "Kowalski",
  phone: "+48 123 456 789",
  regionCode: "PL",
  postalCode: "00-001",
  street: "MarszaÅ‚kowska",
  streetNumber: "1",
  city: "Warszawa",
};

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const scenario = searchParams.get("scenario");

  if (!secret || secret !== process.env.CHECKOUT_SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getCheckoutSession();

  switch (scenario) {
    case "missing-address":
      session.basket = VALID_BASKET;
      session.address = undefined;
      session.shippingCode = undefined;
      session.shippingCost = undefined;
      session.paymentIntentId = undefined;
      break;

    case "shipping-zero":
      session.basket = VALID_BASKET;
      session.address = VALID_ADDRESS;
      session.shippingCode = "free";
      session.shippingCost = 0;
      session.paymentIntentId = undefined;
      break;

    case "invalid-product-id":
      session.basket = [{ productId: "nonexistent-product-id-xyz", quantity: 1 }];
      session.address = VALID_ADDRESS;
      session.shippingCode = "dpd";
      session.shippingCost = 1899;
      session.paymentIntentId = undefined;
      break;

    case "zero-quantity":
      session.basket = [{ productId: REAL_PRODUCT_ID, quantity: 0 }];
      session.address = VALID_ADDRESS;
      session.shippingCode = "dpd";
      session.shippingCost = 1899;
      session.paymentIntentId = undefined;
      break;

    case "grand-total-zero":
      session.basket = VALID_BASKET;
      session.address = VALID_ADDRESS;
      session.shippingCode = "free";
      session.shippingCost = 0;
      session.paymentIntentId = undefined;
      break;

    case "succeeded-pi":
      session.basket = VALID_BASKET;
      session.address = VALID_ADDRESS;
      session.shippingCode = "dpd";
      session.shippingCost = 1899;
      session.paymentIntentId = "pi_succeeded_test_stale_id";
      // NOTE: completedPaymentIntentId is intentionally NOT set here.
      // Only the Route Handler sets it. This is used by Test 5 privacy-guard check.
      break;

    case "processing-pi":
      session.basket = VALID_BASKET;
      session.address = VALID_ADDRESS;
      session.shippingCode = "dpd";
      session.shippingCost = 1899;
      session.paymentIntentId = undefined;
      session.completedPaymentIntentId = "pi_processing_test_id";
      break;

    case "happy-path":
      session.basket = VALID_BASKET;
      session.address = VALID_ADDRESS;
      session.shippingCode = "dpd";
      session.shippingCost = 1899;
      session.paymentIntentId = undefined;
      session.completedPaymentIntentId = undefined;
      break;

    default:
      return NextResponse.json(
        { error: `Unknown scenario: ${scenario}. Valid scenarios: missing-address, shipping-zero, invalid-product-id, zero-quantity, grand-total-zero, succeeded-pi, processing-pi` },
        { status: 400 }
      );
  }

  await session.save();

  return NextResponse.redirect(new URL("/checkout/payment", request.url));
}
```
## lib/utils/formatting.ts

```ts
export function firstLetterToUpperCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPolishPrice(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);
}

export function formatDeliveryEstimate(days: number): string {
  if (days === 1) {
    return '1 dzieÅ„ roboczy';
  }
  return `${days} dni robocze`;
}

export interface CategoryNode {
  id: string;
  title: string;
  slug: string;
  path: string;
  icon?: string;
  parentId?: string;
  group?: string;
  groups?: { title: string; items: CategoryNode[] }[];
}
```

## lib/utils/tailwind.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-1",
            "display-2",
            "h1",
            "h2",
            "h3",
            "h4",
            "body",
            "small",
            "cta-hero",
            "spotlight",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            { brand: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
            { secondary: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
            { accent: ["100", "200", "300", "400", "500", "600", "700", "800"] },
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
```
## sanity-cms/lib/products/getProductBySlug.ts

```ts
import { cache } from 'react';
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  sku: string;
  image: any;
  gallery?: any[];
  slug: { current: string };
  description?: any;
  overviewFields?: { title: string; value: string; information?: string }[];
  specifications?: { title: string; value: string; information?: string }[];
  catalogueLocationKeys: string[];
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && slug.current == $slug] {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      sku,
      image,
      gallery,
      slug {
        current
      },
      description,
      overviewFields[] {
        title,
        value,
        information
      },
      specifications[] {
        title,
        value,
        information
      },
      catalogueLocationKeys
    }`,
    params: { slug }
  });

  return (products as Product[])[0] || null;
});
```

## sanity-cms/lib/products/getProductsByIds.ts

```ts
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { Product } from './getProductBySlug';

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && _id in $ids] {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      reservedStock,
      sku,
      image,
      gallery,
      slug {
        current
      },
      description,
      overviewFields[] {
        title,
        value,
        information
      },
      specifications[] {
        title,
        value,
        information
      },
      catalogueLocationKeys,
      parcel {
        length,
        width,
        height,
        weight
      }
    }`,
    params: { ids }
  });

  return products || [];
}
```

## sanity-cms/lib/products/getBasketProducts.ts

```ts
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface BasketProduct {
  _id: string;
  name: string;
  price_data: {
    currency: string;
    unit_amount: number;
  };
  stock: number;
  reservedStock: number;
  image: any;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    distance_unit: string;
    mass_unit: string;
  };
}

export async function getBasketProducts(ids: string[]): Promise<BasketProduct[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const products = await sanityFetch<BasketProduct[]>({
      query: groq`*[_type == "product" && _id in $ids && defined(price_data)] {
        _id,
        name,
        price_data,
        stock,
        reservedStock,
        image {
          asset {
            _ref
          }
        },
        parcel {
          length,
          width,
          height,
          weight,
          distance_unit,
          mass_unit
        }
      }`,
      params: { ids }
    });

    return products || [];
  } catch (error) {
    console.error('Failed to fetch basket products:', error);
    return [];
  }
}
```
## app/components/ui/Price.tsx

```tsx
"use client";

import React from 'react';

interface PriceProps {
  value: number;
  currency?: string;
  variant?: 'default' | 'summary';
  className?: string;
}

export function Price({ value, currency = 'USD', variant = 'default', className }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: variant === 'summary' ? 2 : 0,
    maximumFractionDigits: variant === 'summary' ? 2 : 0,
  }).format(value);

  return <span className={className || "type-price tabular-nums"}>{formatted}</span>;
}
```
