import { client } from "../client";

export interface OrderForSuccessPage {
  _id: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    subtotal: number;
  }>;
  pricing: {
    total: number;
  };
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  dates: {
    orderedAt: string;
  };
}

export async function fetchOrderByPaymentIntentId(
  paymentIntentId: string
): Promise<OrderForSuccessPage | null> {
  return client.fetch<OrderForSuccessPage | null>(
    `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{
      _id,
      items[]{ productId, name, quantity, subtotal },
      pricing{ total },
      shippingAddress{ name, line1, city, state, postalCode, country },
      dates{ orderedAt }
    }`,
    { paymentIntentId }
  );
}
