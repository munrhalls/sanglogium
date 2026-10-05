import type Stripe from "stripe";
import type { Orders, OrderEmails } from "@/features/checkout/core/ports";
import type { OrderSessionData } from "@/features/checkout/core/rules/checkoutTypes";

/**
 * Creates the order for a succeeded PaymentIntent and sends the confirmation
 * email — atomically for the order itself, non-fatally for the email.
 */
export async function placeOrderFromPaymentIntent(
  ports: { orders: Orders; emails: OrderEmails },
  input: { pi: Stripe.PaymentIntent; sessionData?: OrderSessionData }
): Promise<void> {
  const result = await ports.orders.createOrderFromPaymentIntent(
    input.pi,
    input.sessionData
  );

  if (result.created && result.email) {
    try {
      await ports.emails.sendOrderConfirmationEmail(result.email);
    } catch {
      // email failure is non-fatal — order already created
    }
  }
}
