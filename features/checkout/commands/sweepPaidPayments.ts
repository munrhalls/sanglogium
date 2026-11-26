import "server-only";
import type { Orders, Payments, OrderEmails } from "@/features/checkout/core/ports";
import { logEvent } from "@/platform/utils/eventLogger";
import { placeOrderFromPayment } from "./placeOrderFromPayment";

// Paid payments created this long before the sweep are checked for an order.
const WINDOW_SECONDS = 7 * 24 * 60 * 60;

type SweepResult = { status: number; body: { error?: string; checked?: number; failed?: number } };

/**
 * Writes the order for every paid payment of the last 7 days that has none.
 * Runs daily (vercel.json). Safe to run any number of times: placing an order
 * that exists writes nothing.
 */
export async function sweepPaidPayments(
  ports: { orders: Orders; payments: Payments; emails: OrderEmails },
  input: { authorization: string | null; now: number }
): Promise<SweepResult> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    await logEvent({ correlationId: 'sweep', slice: 'sweep', event: 'sweep_no_secret', data: {}, outcome: 'error' });
    return { status: 500, body: { error: 'Sweep secret not configured' } };
  }
  if (input.authorization !== `Bearer ${secret}`) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  const payments = await ports.payments.listPayments(input.now - WINDOW_SECONDS);
  let checked = 0;
  let failed = 0;
  for (const payment of payments) {
    if (payment.status !== 'succeeded') continue;
    checked += 1;
    try {
      await placeOrderFromPayment({ orders: ports.orders, emails: ports.emails }, { payment });
    } catch (err) {
      failed += 1;
      await logEvent({ correlationId: payment.metadata.checkoutSessionId || 'sweep', slice: 'sweep', event: 'sweep_order_failed', data: { paymentIntentId: payment.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
    }
  }

  await logEvent({ correlationId: 'sweep', slice: 'sweep', event: 'sweep_complete', data: { checked, failed }, outcome: failed ? 'error' : 'success' });
  return { status: failed ? 500 : 200, body: { checked, failed } };
}
