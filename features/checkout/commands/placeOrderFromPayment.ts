import type { Orders, OrderEmails } from "@/features/checkout/core/ports";
import type { OrderSessionData } from "@/features/order";
import type { PaymentSnapshot } from "@/features/checkout/core/types/checkoutTypes";

/**
 * Creates the order for a succeeded payment and sends the confirmation
 * email — atomically for the order itself, non-fatally for the email.
 */
export async function placeOrderFromPayment(
  ports: { orders: Orders; emails: OrderEmails },
  input: { payment: PaymentSnapshot; sessionData?: OrderSessionData }
): Promise<void> {
  const result = await ports.orders.createOrderFromPayment(
    input.payment,
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
