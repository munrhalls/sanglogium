"use server";

import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { submitShippingAction } from "@/app/actions/address/address";
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from "@/lib/shipping/allekurier-rates";
import { calculatePackages } from "@/lib/shipping/parcel-calculator";
import { getProductsByIds } from "@/sanity-cms/lib/products/getProductsByIds";
import type { Address } from "@/app/(store)/checkout/checkout.types";

export async function initCheckoutSession(items: Array<{ productId: string; quantity: number }>) {
  const session = await getCheckoutSession();

  // Save items directly to the secure iron-session cookie
  session.basket = items;
  await session.save();

  // Transition to the next page
  redirect("/checkout/address");
}

export async function saveAddress(address: Address) {
  const session = await getCheckoutSession();

  // Guard: Ensure basket exists
  if (!session.basket || session.basket.length === 0) {
    console.log("[SAVE ADDRESS] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  // Call Google Address Validation
  const validationResult = await submitShippingAction(address);

  console.log("[SAVE ADDRESS] Google validation result:", validationResult.status);

  // Only proceed if validation succeeds
  if (validationResult.status !== "ACCEPT") {
    console.log("[SAVE ADDRESS] Validation failed:", validationResult.errors);
    return validationResult;
  }

  // Save validated address to session
  session.address = validationResult.address || address;

  // Cascade invalidation: Delete downstream shipping data
  session.shippingCode = undefined;
  session.shippingCost = undefined;

  await session.save();

  console.log("[SAVE ADDRESS] Session saved:", {
    basket: session.basket,
    address: session.address,
  });

  // Redirect to shipping page
  redirect("/checkout/shipping");
}

export async function saveShippingAction(shippingCode: string) {
  const session = await getCheckoutSession();

  console.log("[SAVE SHIPPING] Received shippingCode:", shippingCode);

  // Guard: Ensure basket and address exist
  if (!session.basket || session.basket.length === 0) {
    console.log("[SAVE SHIPPING] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  if (!session.address) {
    console.log("[SAVE SHIPPING] No address in session, redirecting to address");
    redirect("/checkout/address");
  }

  // Rebuild payload: Fetch parcel data from Sanity
  const basketIds = session.basket.map((item) => item.productId);
  console.log("[SAVE SHIPPING] Rebuilding payload - basket IDs:", basketIds);

  const products = await getProductsByIds(basketIds);
  console.log("[SAVE SHIPPING] Fetched products:", products.length);

  // Calculate packages using shared utility (handles quantity aggregation)
  const packages = calculatePackages(session.basket, products);
  console.log("[SAVE SHIPPING] Calculated packages:", packages.length);

  // Call AlleKurier API server-side with full payload
  const senderZip = process.env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001";
  const rates = await fetchAlleKurierRates({
    fromCountry: "PL",
    fromZip: senderZip,
    toCountry: "PL",
    toZip: session.address.postalCode,
    packages,
  });

  console.log("[SAVE SHIPPING] AlleKurier rates:", rates.length);

  // Filter response for selected shippingCode
  const shippingOptions = rates.map(transformAlleKurierToShippingOption);
  const selectedOption = shippingOptions.find((opt) => opt.rateId === shippingCode);

  if (!selectedOption) {
    console.error("[SAVE SHIPPING] Shipping code not found in options:", shippingCode);
    throw new Error("Invalid shipping option");
  }

  console.log("[SAVE SHIPPING] Selected option:", selectedOption);

  // Convert price to cents
  const priceInCents = Math.round(selectedOption.amount * 100);
  console.log("[SAVE SHIPPING] Price in cents:", priceInCents);

  // Save BOTH shippingCode AND shippingCost to session
  session.shippingCode = shippingCode;
  session.shippingCost = priceInCents;

  await session.save();

  console.log("[SAVE SHIPPING] Session saved:", {
    basket: session.basket,
    address: session.address,
    shippingCode: session.shippingCode,
    shippingCost: session.shippingCost,
  });

  // Redirect to payment
  redirect("/checkout/payment");
}
