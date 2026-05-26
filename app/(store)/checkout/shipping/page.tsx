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
  const packages = calculatePackages(session.basket, products);
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
