import { getShippingPageData } from "@/features/checkout/server";
import { ShippingStep } from "@/features/checkout";

export default async function Page() {
  const data = await getShippingPageData();

  if (data.kind === "error") {
    return <ShippingStep shippingOptions={[]} traceId={data.traceId} error={data.error} />;
  }

  return <ShippingStep shippingOptions={data.shippingOptions} traceId={data.traceId} />;
}
