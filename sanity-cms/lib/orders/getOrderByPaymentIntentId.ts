import { client } from "../client";

export interface OrderForSuccessPage {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  isGuest: boolean;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod?: {
    name: string;
    carrier: string;
    price: number;
    estimatedDays?: number;
  };
  status: string;
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
      orderNumber,
      customerEmail,
      isGuest,
      items[]{ productId, name, quantity, price, subtotal },
      pricing{ subtotal, shipping, tax, discount, total, currency },
      shippingAddress{ name, line1, city, state, postalCode, country },
      shippingMethod{ name, carrier, price, estimatedDays },
      status,
      dates{ orderedAt }
    }`,
    { paymentIntentId }
  );
}
