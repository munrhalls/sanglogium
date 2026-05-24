import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AddressForm from "./AddressForm";

export default async function Page() {
  const session = await getCheckoutSession();

  // Guard: Redirect to basket if session.basket is missing
  if (!session.basket || session.basket.length === 0) {
    console.log("[ADDRESS PAGE] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  // TRACER: Log session basket to server console
  console.log("[ADDRESS PAGE] session.basket:", session.basket);

  return <AddressForm />;
}