import "server-only";
import { redirect } from "next/navigation";
import type { CheckoutSessions } from "@/features/checkout/core/ports";
import type { CheckoutSession } from "@/features/checkout/core/rules/checkoutTypes";

export async function getAddressPageData(ports: {
  sessions: CheckoutSessions;
}): Promise<{ traceId: string; initialAddress: CheckoutSession["address"] }> {
  const session = await ports.sessions.getCheckoutSession();

  // Guard: Redirect to basket if session.basket is missing
  if (!session.basket || session.basket.length === 0) {
    console.log("[ADDRESS PAGE] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  const traceId = session.checkoutSessionId || 'unknown';

  // TRACER: Log session state to server console for verification
  console.log("[ADDRESS PAGE] session.basket:", session.basket);
  console.log("[ADDRESS PAGE] session.address:", session.address);

  return { traceId, initialAddress: session.address };
}
