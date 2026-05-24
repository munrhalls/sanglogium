import { redirect } from "next/navigation";
import { getCheckoutSession } from "@/lib/session";
import { retrievePaymentIntent } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get("payment_intent");

  if (!payment_intent) {
    redirect("/basket?error=missing_intent");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[RETURN HANDLER] payment_intent extracted:", payment_intent);
    console.log(
      "[RETURN HANDLER] payment_intent_client_secret and redirect_status read but ignored"
    );
  }

  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>>;
  try {
    pi = await retrievePaymentIntent(payment_intent);
    if (process.env.NODE_ENV !== "production") {
      console.log("[RETURN HANDLER] PI retrieved — status:", pi.status, "amount:", pi.amount);
    }
  } catch {
    redirect(
      `/checkout/success?payment_intent=${payment_intent}&error=verification_failed`
    );
  }

  const session = await getCheckoutSession();

  // Step 1: set completedPaymentIntentId ALWAYS, regardless of status
  session.completedPaymentIntentId = pi.id;

  // Step 2: partial-clear per canonical lifecycle table
  switch (pi.status) {
    case "succeeded":
      session.paymentIntentId = undefined;
      session.basket = [];
      session.address = undefined;
      session.shippingCode = undefined;
      session.shippingCost = undefined;
      break;

    case "requires_payment_method":
      session.paymentIntentId = undefined;
      // KEEP basket, address, shippingCode, shippingCost
      break;

    case "canceled":
      session.paymentIntentId = undefined;
      // KEEP basket, address, shippingCode, shippingCost
      break;

    case "processing":
      // KEEP everything — async confirmation may still resolve
      break;

    default:
      session.paymentIntentId = undefined;
      // KEEP basket, address, shippingCode, shippingCost
      await session.save();
      redirect(`/basket?error=unexpected_status`);
  }

  // Step 3: persist session
  await session.save();

  // Step 4: redirect to success page with appropriate status hint
  switch (pi.status) {
    case "succeeded":
      redirect(`/checkout/success?payment_intent=${pi.id}`);
      break;
    case "requires_payment_method":
      redirect(`/checkout/success?payment_intent=${pi.id}&status=failed`);
      break;
    case "canceled":
      redirect(`/checkout/success?payment_intent=${pi.id}&status=canceled`);
      break;
    case "processing":
      redirect(`/checkout/success?payment_intent=${pi.id}&status=processing`);
      break;
  }
}
