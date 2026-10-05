import { handlePaymentReturn } from "@/features/checkout/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get("payment_intent");

  await handlePaymentReturn({ paymentIntent: payment_intent });
}
