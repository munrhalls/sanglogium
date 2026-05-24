import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from "@/lib/shipping/allekurier-rates";
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

  // Extract parcel dimensions (convert weight from grams to kg for AlleKurier API)
  const packages = products.map((product) => ({
    weight: (product.parcel?.weight || 500) / 1000, // convert grams to kg
    width: product.parcel?.width || 10, // cm
    height: product.parcel?.height || 5, // cm
    length: product.parcel?.length || 10, // cm
  }));

  console.log("[SHIPPING PAGE] Parcel packages:", packages);

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
