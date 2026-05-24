import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/session";

const REAL_PRODUCT_ID = "3O1ZNp54LWQGln4uEAU7Vs";

const VALID_BASKET = [{ productId: REAL_PRODUCT_ID, quantity: 1 }];

const VALID_ADDRESS = {
  regionCode: "PL",
  postalCode: "00-001",
  street: "Marszałkowska",
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

    default:
      return NextResponse.json(
        { error: `Unknown scenario: ${scenario}. Valid scenarios: missing-address, shipping-zero, invalid-product-id, zero-quantity, grand-total-zero, succeeded-pi, processing-pi` },
        { status: 400 }
      );
  }

  await session.save();

  return NextResponse.redirect(new URL("/checkout/payment", request.url));
}
