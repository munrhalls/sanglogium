import type {
  OrderForSuccessPage,
  OwnerNotice,
  PaymentSnapshot,
} from "@/features/checkout/core/types/checkoutTypes";

// inside Resend's 24-hour key memory, so re-sends stay one email and the daily sweep never re-sends an old order.
export const ORDER_NOTICE_MAX_AGE_MS = 23 * 60 * 60 * 1000;

const money = (amount: number, currency: string): string =>
  (amount / 100).toFixed(2) + " " + currency.toUpperCase();

export function orderPlacedNotice(
  order: OrderForSuccessPage,
  paymentIntentId: string,
  now: number
): OwnerNotice | null {
  const orderedAt = Date.parse(order.dates?.orderedAt);
  if (Number.isNaN(orderedAt) || now - orderedAt > ORDER_NOTICE_MAX_AGE_MS) {
    return null;
  }

  const itemLines = order.items.map((item) => {
    const taken = item.fulfilled ?? item.quantity;
    const missing = item.quantity - taken;
    return missing > 0
      ? `${item.name}: ${missing} missing (paid ${item.quantity}, ${taken} taken from stock)`
      : `${item.quantity} × ${item.name}`;
  });
  const short = order.items.some(
    (item) => item.quantity - (item.fulfilled ?? item.quantity) > 0
  );

  const lines = [
    `Order ${order.orderNumber} is paid and waits to be packed.`,
    "",
    ...itemLines,
    "",
    `Total: ${money(order.pricing.total, order.pricing.currency)}`,
    short
      ? "Some units are missing: contact the customer, then refund the missing units in Stripe or send them later."
      : "Everything is in stock.",
    "Open the order in Sanity Studio to see the address.",
    `Payment in Stripe: https://dashboard.stripe.com/payments/${paymentIntentId}`,
  ];

  return {
    key: `order-placed/${paymentIntentId}`,
    subject: short
      ? `New order ${order.orderNumber} is short of stock`
      : `New order ${order.orderNumber} to pack`,
    text: lines.join("\n"),
  };
}

export function paymentWithoutOrderNotice(
  payment: PaymentSnapshot
): OwnerNotice {
  const lines = [
    `Stripe took ${money(payment.amount, payment.currency)} in payment ${payment.id}, but the shop could not make its order.`,
    "The shop keeps trying while Stripe resends the payment, and once a day for 7 days. If a New order email for this payment follows, nothing is left to do.",
    "Otherwise refund it in Stripe, or see it on the admin page (/manager).",
    `Payment in Stripe: https://dashboard.stripe.com/payments/${payment.id}`,
  ];
  return {
    key: `payment-without-order/${payment.id}`,
    subject: `Payment ${payment.id} has no order: check it`,
    text: lines.join("\n"),
  };
}
