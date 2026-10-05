import { getShippingPageData } from "@/features/checkout/server";
import { ShippingPageClient } from "@/features/checkout";

export default async function Page() {
  const data = await getShippingPageData();

  if (data.kind === "error") {
    return <ShippingPageClient shippingOptions={[]} traceId={data.traceId} error={data.error} />;
  }

  return <ShippingPageClient shippingOptions={data.shippingOptions} traceId={data.traceId} />;
}
