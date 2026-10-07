import { logCheckoutEvent } from "@/features/checkout/core/rules/checkoutEvents";

export async function recordCheckoutTrace(input: { traceId: string; step: string; data?: Record<string, unknown> }): Promise<void> {
  console.log(`[TRACE] ${input.step} (${input.traceId})`, JSON.stringify(input.data || {}));

  await logCheckoutEvent({
    correlationId: input.traceId,
    slice: 'payment-submit',
    event: input.step,
    data: input.data || {},
    outcome: 'success',
  });
}
