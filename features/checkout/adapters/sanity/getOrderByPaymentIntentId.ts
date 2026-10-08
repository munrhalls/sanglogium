import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

import type { OrderForSuccessPage } from "@/features/checkout/core/types/checkoutTypes";

export type { OrderForSuccessPage };

export async function fetchOrderByPaymentIntentId(
  paymentIntentId: string
): Promise<OrderForSuccessPage | null> {
  return backendClient.fetch<OrderForSuccessPage | null>(
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
