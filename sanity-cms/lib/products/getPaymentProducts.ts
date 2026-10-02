import { client } from "@/sanity-cms/lib/client";
import groq from "groq";

export interface PaymentProduct {
  _id: string;
  name: string | null;
  price_data: { unit_amount: number } | null;
  stock: number | null;
  imageUrl: string | null;
}

export async function getPaymentProducts(ids: string[]): Promise<PaymentProduct[]> {
  return client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount }, stock, "imageUrl": image.asset->url }`,
    { ids }
  );
}
