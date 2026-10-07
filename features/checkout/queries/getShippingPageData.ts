import "server-only";
import { redirect } from "next/navigation";
import type {
  CheckoutSessions,
  CheckoutCatalog,
  ShippingRates,
} from "@/features/checkout/core/ports";
import type { ShippingOption } from "@/features/shipping";
import { calculatePackages } from "@/features/shipping";
import { logCheckoutEvent } from "@/platform/utils/eventLogger";

export type ShippingPageData =
  | { kind: "ok"; shippingOptions: ShippingOption[]; traceId: string }
  | { kind: "error"; error: string; traceId: string };

export async function getShippingPageData(ports: {
  sessions: CheckoutSessions;
  catalogue: CheckoutCatalog;
  shipping: ShippingRates;
}): Promise<ShippingPageData> {
  const session = await ports.sessions.getCheckoutSession();

  // Guard: Redirect to address if session.address missing
  if (!session.address) {
    console.log("[SHIPPING PAGE] No address in session, redirecting to address");
    redirect("/checkout/address");
  }

  // Guard: Redirect to basket if session.basket missing or empty
  if (!session.basket || session.basket.length === 0) {
    console.log("[SHIPPING PAGE] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  const traceId = session.checkoutSessionId || 'unknown';

  // Log shipping page load
  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_page_load', data: { hasAddress: !!session.address, hasBasket: !!session.basket?.length }, outcome: 'success' });

  // Fetch parcel data from Sanity
  const basketIds = session.basket.map((item) => item.productId);
  console.log("[SHIPPING PAGE] Fetching products for basket IDs:", basketIds);

  const products = await ports.catalogue.getProductsByIds(basketIds);
  console.log("[SHIPPING PAGE] Fetched products:", products.length);

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_products_fetched', data: { basketIds, productCount: products.length }, outcome: 'success' });

  // Calculate packages using shared utility (handles quantity aggregation)
  let packages: { weight: number; width: number; height: number; length: number }[] = [];
  let packageError: string | null = null;
  try {
    packages = calculatePackages(session.basket, products);
  } catch (err) {
    packageError = err instanceof Error ? err.message : "Failed to calculate shipping packages";
    console.error("[SHIPPING PAGE] Package calculation error:", packageError);
    await logCheckoutEvent({
      correlationId: traceId,
      slice: 'address-submit',
      event: 'shipping_package_calculation_error',
      data: { error: packageError, basketIds },
      outcome: 'error',
    });
  }

  if (packageError) {
    return { kind: "error", error: packageError, traceId };
  }

  console.log("[SHIPPING PAGE] Calculated packages:", packages.length);
  console.log("[SHIPPING PAGE] Parcel dimensions:", JSON.stringify(packages, null, 2));

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_packages_calculated', data: { packageCount: packages.length, totalWeight: packages.reduce((sum, p) => sum + p.weight, 0) }, outcome: 'success' });

  // Call AlleKurier API
  const senderZip = process.env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001";
  const ratesInput = {
    fromCountry: "PL",
    fromZip: senderZip,
    toCountry: session.address.regionCode,
    toZip: session.address.postalCode,
    packages,
  };

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_allekurier_request', data: { payload: ratesInput, packageCount: packages.length, totalWeight: packages.reduce((sum, p) => sum + p.weight, 0) }, outcome: 'success' });

  const shippingOptions = await ports.shipping.fetchShippingOptions(ratesInput, traceId);

  console.log("[SHIPPING PAGE] AlleKurier rates:", shippingOptions.length);

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_allekurier_response', data: { rateCount: shippingOptions.length, rates: shippingOptions.map((o) => ({ carrier: o.provider, service: o.servicelevel.name, price: o.amount })) }, outcome: 'success' });

  return { kind: "ok", shippingOptions, traceId };
}
