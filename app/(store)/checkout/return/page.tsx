import { getOrderBySession } from "@/app/actions/checkout/getOrderBySession";
import { CheckoutReturnClient } from "./components/CheckoutReturnClient";

interface PageProps {
  searchParams: { session_id?: string };
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id ?? null;
  const initialOrder = await getOrderBySession(sessionId);

  return (
    <CheckoutReturnClient sessionId={sessionId} initialOrder={initialOrder} />
  );
}
