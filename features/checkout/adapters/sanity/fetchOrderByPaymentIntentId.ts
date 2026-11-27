import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

import type { OrderForSuccessPage } from "@/features/checkout/core/types/checkoutTypes";


export async function fetchOrderByPaymentIntentId(
  paymentIntentId: string
): Promise<OrderForSuccessPage | null> {
  return backendClient.fetch<OrderForSuccessPage | null>(
    `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{
      _id,
      orderNumber,
      customerEmail,
      isGuest,
      items[]{ productId, name, quantity, fulfilled, price, subtotal },
      pricing{ subtotal, shipping, tax, discount, total, currency },
      shippingAddress{ name, line1, city, state, postalCode, country, phone },
      shippingMethod{ name, carrier, price, estimatedDays },
      status,
      dates{ orderedAt }
    }`,
    { paymentIntentId }
  );
}
