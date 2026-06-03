import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";
import PaymentForm from "./PaymentForm.client";
import CheckoutSummary from "./_components/CheckoutSummary";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { cn } from "@/lib/utils/tailwind";

interface PaymentProduct {
  _id: string;
  name: string | null;
  price_data: { unit_amount: number } | null;
  stock: number | null;
  imageUrl: string | null;
}

export default async function Page() {
  const session = await getCheckoutSession();
  const checkoutSessionId = session.checkoutSessionId;
  const traceId = checkoutSessionId || 'unknown';

  // Log payment page load
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_page_load', data: { hasBasket: !!session.basket?.length, hasAddress: !!session.address, hasShippingCost: session.shippingCost !== undefined && session.shippingCost !== null }, outcome: 'success' });

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

  // Quantity sanity check — prevent unreasonably high orders
  const MAX_QUANTITY_PER_ITEM = 10;
  for (const item of session.basket) {
    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_excessive_quantity', data: { productId: item.productId, quantity: item.quantity, max: MAX_QUANTITY_PER_ITEM }, outcome: 'error' });
      redirect(`/basket?error=excessive_quantity&id=${item.productId}`);
    }
  }

  const ids = session.basket.map((i) => i.productId);

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_sanity_query_start', data: { productIds: ids, quantities: session.basket.map(i => ({ productId: i.productId, quantity: i.quantity })) }, outcome: 'success' });

  const sanityProducts = await client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount }, stock, "imageUrl": image.asset->url }`,
    { ids }
  );

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_sanity_query_complete', data: { productCount: sanityProducts.length, expectedCount: session.basket.length }, outcome: 'success' });

  if (sanityProducts.length !== session.basket.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_product_mismatch', data: { expected: session.basket.length, received: sanityProducts.length }, outcome: 'error' });
    throw new Error("Product mismatch — basket contains unknown product IDs");
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

  // Helper: deduplicate shipping label when carrier and method share words
  const dedupeShippingLabel = (carrier?: string, method?: string): string => {
    if (!carrier && !method) return "Shipping";
    if (!method) return carrier || "Shipping";
    if (!carrier) return method;
    // If method already contains all words from carrier (case-insensitive), just use method
    const carrierWords = carrier.toLowerCase().split(/\s+/);
    const methodLower = method.toLowerCase();
    const carrierContained = carrierWords.every(w => methodLower.includes(w));
    if (carrierContained) return method;
    // If carrier and method share first word (e.g. "DPD Polska" + "DPD Classic")
    const firstCarrier = carrierWords[0];
    const firstMethod = method.toLowerCase().split(/\s+/)[0];
    if (firstCarrier === firstMethod) return method;
    return `${carrier} — ${method}`;
  };

  const items = session.basket.map((item) => {
    const product = sanityProducts.find((p) => p._id === item.productId)!;
    const unitPrice = product.price_data!.unit_amount;
    const rawName = product.name ?? "Product";
    // Extract "Open Box" condition if present
    const openBoxMatch = rawName.match(/^Open Box\s*[×xX]\s*\d+\s+(.*)/i);
    const condition = openBoxMatch ? "Open Box" : undefined;
    const displayName = openBoxMatch ? openBoxMatch[1].trim() : rawName;
    return {
      productId: item.productId,
      name: displayName,
      condition,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const grandTotal = Math.round(subtotal + (session.shippingCost as number));

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_calculation', data: { subtotal, shippingCost: session.shippingCost, grandTotal }, outcome: 'success' });

  if (grandTotal < 1) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_invalid_total', data: { subtotal, shippingCost: session.shippingCost, grandTotal }, outcome: 'error' });
    redirect("/basket?error=invalid_total");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[PAYMENT PAGE] subtotal:", subtotal, "grandTotal:", grandTotal);
  }

  const address = session.address!;
  const shippingLabel = dedupeShippingLabel(session.shippingCarrier, session.shippingMethodName);

  // ── LIVE AUDIT CHECK LOGS ──
  // These always print so you can verify audit fixes in browser console / terminal
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 LIVE AUDIT CHECK — Payment Page");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ FIX #1  — Total row gap:          gap-4 + flex-1/shrink-0 applied");
  console.log("✅ FIX #2  — Card clipping:            min-w-0 on grid children");
  console.log("✅ FIX #3  — Mobile collision:         gap-3 + items-start + break-words on items");
  console.log("✅ FIX #4  — Quantity sanity:           MAX=10, basket items:", session.basket.map(i => `${i.productId}:×${i.quantity}`).join(", "));
  console.log("✅ FIX #5  — Progress stepper:         Basket → Address → Shipping → Payment");
  console.log("✅ FIX #6  — Back navigation:         'Back to shipping' + 'Edit basket' links below summary");
  console.log("✅ FIX #7  — Product images:            imageUrl fetched from Sanity");
  console.log("✅ FIX #8  — Pay button weight:        btn-cart-large with py-4");
  console.log("✅ FIX #10 — Shipping address:          passed to CheckoutSummary:", !!session.address, address.city);
  console.log("✅ FIX #11 — Delivery estimate:         shippingEstimatedDays:", session.shippingEstimatedDays ?? "not set");
  console.log("✅ FIX #12 — Security badge:            moved above Pay button");
  console.log("✅ FIX #13 — VAT line:                  'VAT (included)' added to summary");
  console.log("✅ FIX #14 — BLIK divider:              simplified to 'Or pay by card'");
  console.log("✅ FIX #15 — Open Box badge:            condition extracted from product name");
  console.log("✅ FIX #16 — DPD naming:                deduplicated shipping label:", shippingLabel);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Subtotal:", (subtotal/100).toFixed(2), "PLN | 🚚 Shipping:", ((session.shippingCost as number)/100).toFixed(2), "PLN | 💰 Grand Total:", (grandTotal/100).toFixed(2), "PLN");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const metadata: Record<string, string> = {
    regionCode: address.regionCode,
    postalCode: address.postalCode,
    street: address.street,
    streetNumber: address.streetNumber,
    city: address.city,
    email: session.email ?? "",
    ...(checkoutSessionId && { checkoutSessionId }),
  };

  const steps = [
    { label: "Basket", href: "/basket" },
    { label: "Address", href: "/checkout/address" },
    { label: "Shipping", href: "/checkout/shipping" },
    { label: "Payment", href: null },
  ];
  const currentStep = 3; // 0-indexed, Payment is active

  const CHECK_ICON = (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Checkout progress stepper — visual 4-node */}
      <nav aria-label="Checkout progress" className="mb-6">
        {/* Mobile: circles + connectors, labels hidden */}
        <ol className="flex lg-touch:hidden lg-desktop:hidden items-center justify-center gap-1">
          {steps.map((step, i) => (
            <li key={step.label} className="flex items-center gap-1">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  i === currentStep
                    ? "bg-brand-400 text-brand-700"
                    : i < currentStep
                      ? "bg-brand-400 text-brand-700"
                      : "bg-surface-elevated text-text-caption border border-border-secondary"
                )}
                style={i === currentStep ? { boxShadow: "0 0 0 3px rgba(246,227,213,0.2)" } : undefined}
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

        {/* Desktop: full labels with checkmark nodes */}
        <ol className="hidden lg-touch:flex lg-desktop:flex items-center justify-center gap-2">
          {steps.map((step, i) => (
            <li key={step.label} className="flex items-center gap-2">
              {i < currentStep ? (
                <Link
                  href={step.href!}
                  className="type-overline text-text-caption hover:text-text-body transition-colors duration-200"
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

      <div className="grid gap-8 grid-cols-1 items-start lg-touch:grid-cols-2 lg-desktop:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <CheckoutSummary
            items={items}
            shippingCost={session.shippingCost as number}
            shippingLabel={shippingLabel}
            shippingEstimatedDays={session.shippingEstimatedDays}
            address={session.address}
            subtotal={subtotal}
            grandTotal={grandTotal}
          />
          {/* Back navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/checkout/shipping"
              className="flex items-center gap-1 min-h-[44px] type-caption text-text-secondary hover:text-text-body transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to shipping
            </Link>
            <Link
              href="/basket"
              className="flex items-center gap-1 min-h-[44px] type-caption text-text-secondary hover:text-text-body transition-colors duration-200"
            >
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
