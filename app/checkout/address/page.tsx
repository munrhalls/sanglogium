import { getAddressPageData } from "@/features/checkout/server";
import { AddressForm } from "@/features/checkout";

export default async function Page() {
  const { traceId, initialAddress } = await getAddressPageData();

  return <AddressForm traceId={traceId} initialAddress={initialAddress} />;
}
