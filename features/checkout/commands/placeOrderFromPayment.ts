import type { Orders, OrderEmails } from "@/features/checkout/core/ports";
import {
  orderPlacedNotice,
  paymentWithoutOrderNotice,
} from "@/features/checkout/core/rules/ownerNotice";
import type { PaymentSnapshot } from "@/features/checkout/core/types/checkoutTypes";

/**
 * Creates the order for a succeeded payment, sends the customer
 * confirmation email (non-fatally) and then tells the owner.
 */
export async function placeOrderFromPayment(
  ports: { orders: Orders; emails: OrderEmails },
  input: { payment: PaymentSnapshot }
): Promise<void> {
  let result: Awaited<
    ReturnType<Orders["createOrderFromPayment"]>
  >;
  try {
    result = await ports.orders.createOrderFromPayment(input.payment);
  } catch (error) {
    try {
      await ports.emails.sendOwnerNotice(
        paymentWithoutOrderNotice(input.payment)
      );
    } catch {
      // the order error below is what Stripe must see
    }
    throw error;
  }

  if (result.created && result.email) {
    try {
      await ports.emails.sendOrderConfirmationEmail(result.email);
    } catch {
      // email failure is non-fatal — order already created
    }
  }

  const order = await ports.orders.getOrderByPaymentIntentId(input.payment.id);
  if (!order) {
    throw new Error(
      `Order for payment ${input.payment.id} could not be read back`
    );
  }
  const notice = orderPlacedNotice(order, input.payment.id, Date.now());
  if (notice) {
    await ports.emails.sendOwnerNotice(notice);
  }
}
