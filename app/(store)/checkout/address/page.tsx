import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AddressForm from "./AddressForm";
import type { Address } from "../checkout.types";

export default async function Page() {
  const session = await getCheckoutSession();

  // Guard: Redirect to basket if session.basket is missing
  if (!session.basket || session.basket.length === 0) {
    console.log("[ADDRESS PAGE] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  const traceId = session.checkoutSessionId || 'unknown';

  // TRACER: Log session state to server console for verification
  console.log("[ADDRESS PAGE] session.basket:", session.basket);
  console.log("[ADDRESS PAGE] session.address:", session.address);

  return <AddressForm traceId={traceId} initialAddress={session.address} />;
}