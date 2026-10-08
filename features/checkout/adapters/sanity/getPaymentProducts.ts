import "server-only";
import { client } from "@/platform/sanity/client";
import groq from "groq";

import type { PaymentProduct } from "@/features/checkout/core/types/checkoutTypes";


export async function getPaymentProducts(ids: string[]): Promise<PaymentProduct[]> {
  return client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount }, stock, "imageUrl": image.asset->url }`,
    { ids }
  );
}
