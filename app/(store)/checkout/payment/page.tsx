import { getCheckoutSession } from "@/lib/session";
import PaymentPageClient from "./PaymentPageClient";

export default async function Page() {
  const session = await getCheckoutSession();

  // TRACER: Log session to server console for verification
  console.log("[PAYMENT PAGE] session.basket:", session.basket);
  console.log("[PAYMENT PAGE] session.address:", session.address);
  console.log("[PAYMENT PAGE] session.shippingCode:", session.shippingCode);
  console.log("[PAYMENT PAGE] session.shippingCost:", session.shippingCost);

  return <PaymentPageClient />;
}
