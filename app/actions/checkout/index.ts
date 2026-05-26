"use server";

import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { submitShippingAction } from "@/app/actions/address/address";
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from "@/lib/shipping/allekurier-rates";
import { calculatePackages } from "@/lib/shipping/parcel-calculator";
import { getProductsByIds } from "@/sanity-cms/lib/products/getProductsByIds";
import type { Address } from "@/app/(store)/checkout/checkout.types";
import { getCheckoutLogger, generateCheckoutSessionId } from "@/lib/logging/checkout-logger";
import { resetTrace } from "@/lib/logging/trace-logger";

export async function initCheckoutSession(items: Array<{ productId: string; quantity: number }>) {
  const session = await getCheckoutSession();

  // Blank slate: Reset trace file for new checkout
  const checkoutSessionId = generateCheckoutSessionId();
  await resetTrace();
  session.checkoutSessionId = checkoutSessionId;

  const logger = getCheckoutLogger(checkoutSessionId);

  // Save items directly to the secure iron-session cookie
  session.basket = items;
  await session.save();

  await logger.info('checkout_init', {
    itemCount: items.length,
    items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
  });

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

  // Get or create logger (use existing checkoutSessionId if present)
  const checkoutSessionId = session.checkoutSessionId || generateCheckoutSessionId();
  session.checkoutSessionId = checkoutSessionId;
  const logger = getCheckoutLogger(checkoutSessionId);

  await logger.info('address_submit_start', { address: { city: address.city, postalCode: address.postalCode } });

  // Call Google Address Validation
  const validationResult = await submitShippingAction(address);

  await logger.info('address_validation_result', { status: validationResult.status });

  // Only proceed if validation succeeds
  if (validationResult.status !== "ACCEPT") {
    await logger.error('address_validation_failed', new Error('Google validation failed'), { errors: validationResult.errors });
    return validationResult;
  }

  // Save validated address to session
  session.address = validationResult.address || address;

  // Cascade invalidation: Delete downstream shipping data
  session.shippingCode = undefined;
  session.shippingCost = undefined;

  await session.save();

  await logger.info('address_saved', { 
    hasAddress: !!session.address,
    basketItemCount: session.basket.length 
  });

  // Redirect to shipping page
  redirect("/checkout/shipping");
}

export async function saveShippingAction(shippingCode: string) {
  const session = await getCheckoutSession();

  // Guard: Ensure basket and address exist
  if (!session.basket || session.basket.length === 0) {
    console.log("[SAVE SHIPPING] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  if (!session.address) {
    console.log("[SAVE SHIPPING] No address in session, redirecting to address");
    redirect("/checkout/address");
  }

  // Get logger (checkoutSessionId should exist from initCheckoutSession)
  const checkoutSessionId = session.checkoutSessionId;
  if (!checkoutSessionId) {
    console.error("[SAVE SHIPPING] No checkoutSessionId in session");
    redirect("/basket");
  }
  const logger = getCheckoutLogger(checkoutSessionId);

  await logger.info('shipping_selection_start', { shippingCode });

  // Rebuild payload: Fetch parcel data from Sanity
  const basketIds = session.basket.map((item) => item.productId);
  await logger.info('shipping_fetch_products', { basketIds });

  const products = await getProductsByIds(basketIds);
  await logger.info('shipping_products_fetched', { productCount: products.length });

  // Calculate packages using shared utility (handles quantity aggregation)
  const packages = calculatePackages(session.basket, products);
  await logger.info('shipping_packages_calculated', { packageCount: packages.length });

  // Call AlleKurier API server-side with full payload
  const senderZip = process.env.SENDER_ADDRESS_DEFAULT_ZIP || "00-001";
  const allekurierPayload = {
    fromCountry: "PL",
    fromZip: senderZip,
    toCountry: "PL",
    toZip: session.address.postalCode,
    packages,
  };
  
  await logger.info('shipping_allekurier_request', { 
    payload: allekurierPayload,
    packageCount: packages.length,
    totalWeight: packages.reduce((sum, p) => sum + p.weight, 0),
  });
  
  const rates = await fetchAlleKurierRates(allekurierPayload, checkoutSessionId);

  await logger.info('shipping_allekurier_response', { 
    rateCount: rates.length,
    rates: rates.map(r => ({
      carrier: r.Carrier.name,
      service: r.Service.name,
      price: r.Order.gross,
    }))
  });

  // Filter response for selected shippingCode
  const shippingOptions = rates.map(transformAlleKurierToShippingOption);
  const selectedOption = shippingOptions.find((opt) => opt.rateId === shippingCode);

  if (!selectedOption) {
    await logger.error('shipping_option_not_found', new Error('Invalid shipping option'), { shippingCode, availableOptions: shippingOptions.map(o => o.rateId) });
    throw new Error("Invalid shipping option");
  }

  // Convert price to cents
  const priceInCents = Math.round(selectedOption.amount * 100);
  await logger.info('shipping_option_selected', { 
    provider: selectedOption.provider,
    service: selectedOption.servicelevel.name,
    amount: selectedOption.amount,
    priceInCents 
  });

  // Save BOTH shippingCode AND shippingCost to session
  session.shippingCode = shippingCode;
  session.shippingCost = priceInCents;

  await session.save();

  await logger.info('shipping_saved', { 
    shippingCode: session.shippingCode,
    shippingCost: session.shippingCost 
  });

  // Redirect to payment
  redirect("/checkout/payment");
}
