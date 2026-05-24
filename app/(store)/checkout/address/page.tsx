import { getCheckoutSession } from "@/lib/session";
import AddressForm from "./AddressForm";

export default async function Page() {
  const session = await getCheckoutSession();

  // TRACER: Log session basket to server console
  console.log("[ADDRESS PAGE] session.basket:", session.basket);

  return <AddressForm />;
}