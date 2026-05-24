import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from "@/lib/shipping/allekurier-rates";
import { calculatePackages } from "@/lib/shipping/parcel-calculator";
import { getProductsByIds } from "@/sanity-cms/lib/products/getProductsByIds";
import ShippingPageClient from "./ShippingPageClient";

export default async function Page() {
  const session = await getCheckoutSession();

  // Guard: Redirect to address if session.address missing
  if (!session.address) {
    console.log("[SHIPPING PAGE] No address in session, redirecting to address");
    redirect("/checkout/address");
  }

  // TRACER: Log session to server console for verification
  console.log("[SHIPPING PAGE] session.basket:", session.basket);
  console.log("[SHIPPING PAGE] session.address:", session.address);

  // Fetch parcel data from Sanity
  const basketIds = session.basket.map((item) => item.productId);
  console.log("[SHIPPING PAGE] Fetching products for basket IDs:", basketIds);

  const products = await getProductsByIds(basketIds);
  console.log("[SHIPPING PAGE] Fetched products:", products.length);

  // Calculate packages using shared utility (handles quantity aggregation)
  const packages = calculatePackages(session.basket, products);
  console.log("[SHIPPING PAGE] Calculated packages:", packages.length);
  console.log("[SHIPPING PAGE] Parcel dimensions:", JSON.stringify(packages, null, 2));

  // Call AlleKurier API
  const senderZip = process.env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001";
  const rates = await fetchAlleKurierRates({
    fromCountry: "PL",
    fromZip: senderZip,
    toCountry: "PL",
    toZip: session.address.postalCode,
    packages,
  });

  console.log("[SHIPPING PAGE] AlleKurier rates:", rates.length);

  // Transform to shipping options
  const shippingOptions = rates.map(transformAlleKurierToShippingOption);

  return <ShippingPageClient shippingOptions={shippingOptions} />;
}
