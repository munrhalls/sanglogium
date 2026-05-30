import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from "@/lib/shipping/allekurier-rates";
import { calculatePackages } from "@/lib/shipping/parcel-calculator";
import { getProductsByIds } from "@/sanity-cms/lib/products/getProductsByIds";
import ShippingPageClient from "./ShippingPageClient";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

export default async function Page() {
  const session = await getCheckoutSession();

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

  const products = await getProductsByIds(basketIds);
  console.log("[SHIPPING PAGE] Fetched products:", products.length);

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_products_fetched', data: { basketIds, productCount: products.length }, outcome: 'success' });

  // Calculate packages using shared utility (handles quantity aggregation)
  let packages;
  try {
    packages = calculatePackages(session.basket, products);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to calculate shipping packages";
    console.error("[SHIPPING PAGE] Package calculation error:", errorMessage);
    await logCheckoutEvent({
      correlationId: traceId,
      slice: 'address-submit',
      event: 'shipping_package_calculation_error',
      data: { error: errorMessage, basketIds },
      outcome: 'error',
    });
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">Shipping Error</h1>
          <p className="text-red-600">{errorMessage}</p>
          <p className="mt-4 text-gray-600">
            Some items in your basket cannot be shipped. Please remove them or contact support.
          </p>
        </div>
      </div>
    );
  }
  console.log("[SHIPPING PAGE] Calculated packages:", packages.length);
  console.log("[SHIPPING PAGE] Parcel dimensions:", JSON.stringify(packages, null, 2));

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_packages_calculated', data: { packageCount: packages.length, totalWeight: packages.reduce((sum, p) => sum + p.weight, 0) }, outcome: 'success' });

  // Call AlleKurier API
  const senderZip = process.env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001";
  const allekurierPayload = {
    fromCountry: "PL",
    fromZip: senderZip,
    toCountry: "PL",
    toZip: session.address.postalCode,
    packages,
  };

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_allekurier_request', data: { payload: allekurierPayload, packageCount: packages.length, totalWeight: packages.reduce((sum, p) => sum + p.weight, 0) }, outcome: 'success' });

  const rates = await fetchAlleKurierRates(allekurierPayload, traceId);

  console.log("[SHIPPING PAGE] AlleKurier rates:", rates.length);

  await logCheckoutEvent({ correlationId: traceId, slice: 'address-submit', event: 'shipping_allekurier_response', data: { rateCount: rates.length, rates: rates.map(r => ({ carrier: r.Carrier.name, service: r.Service.name, price: r.Order.gross })) }, outcome: 'success' });

  // Transform to shipping options
  const shippingOptions = rates.map(transformAlleKurierToShippingOption);

  return <ShippingPageClient shippingOptions={shippingOptions} traceId={traceId} />;
}
